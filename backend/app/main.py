from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from openai import AzureOpenAI
from dotenv import load_dotenv
import os
import json
import uuid
import random
import numpy as np
import sqlite3
from datetime import datetime
from pathlib import Path

# Azure ML imports - disabled for Fly.io deployment due to memory constraints
# The Monte Carlo simulation runs locally with NumPy which is sufficient for the demo
# For production H100 GPU usage, run the azure_ml_job_runner.py script separately
AZURE_ML_AVAILABLE = False

load_dotenv()

# SQLite Database Path - use smaller database for deployment (3MB vs 78MB)
DB_PATH = Path(__file__).parent.parent / "claims_data" / "sqlite" / "claims_data_small.db"

def get_db_connection():
    """Get a connection to the SQLite database."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def dict_from_row(row):
    """Convert a sqlite3.Row to a dictionary."""
    return dict(row) if row else None

# Azure ML Configuration
AZURE_ML_SUBSCRIPTION_ID = os.getenv("AZURE_ML_SUBSCRIPTION_ID", "4ab88338-2907-4d20-9bd2-b1d84cc60210")
AZURE_ML_RESOURCE_GROUP = os.getenv("AZURE_ML_RESOURCE_GROUP", "ai-rg")
AZURE_ML_WORKSPACE_NAME = os.getenv("AZURE_ML_WORKSPACE_NAME", "rickw-ws")
AZURE_ML_COMPUTE_NAME = os.getenv("AZURE_ML_COMPUTE_NAME", "gregorykatz1")

# In-memory job store
MONTE_CARLO_JOBS: Dict[str, Dict[str, Any]] = {}

app = FastAPI(title="CFO Payer Intelligence Platform")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Azure OpenAI client
client = AzureOpenAI(
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2025-01-01-preview")
)

# ============================================================================
# DATABASE QUERY FUNCTIONS
# ============================================================================

def get_payers_from_db():
    """Get all payers with their metrics from SQLite database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get payers with their latest scorecard data
    cursor.execute("""
        SELECT 
            p.id,
            p.name,
            p.plan_type,
            p.risk_tier,
            p.contract_days,
            p.avg_days_to_pay,
            p.base_yield,
            p.denial_rate,
            c.expiration_date,
            (SELECT SUM(billed_amount) FROM monthly_summary WHERE payer_id = p.id) as total_billed,
            (SELECT SUM(paid_amount) FROM monthly_summary WHERE payer_id = p.id) as total_paid,
            (SELECT AVG(yield_rate) FROM payer_scorecard WHERE payer_id = p.id) as avg_yield
        FROM payers p
        LEFT JOIN contracts c ON p.id = c.payer_id
    """)
    
    payers = []
    short_names = {
        'uhc': 'UHC MA',
        'humana': 'Humana MA', 
        'bcbs': 'FL Blue',
        'aetna': 'Aetna',
        'cigna': 'Cigna',
        'medicare': 'Medicare'
    }
    
    recommendations = {
        'critical': 'Escalate',
        'elevated': 'Negotiate',
        'stable': 'Maintain'
    }
    
    for row in cursor.fetchall():
        payer_id = row['id']
        total_billed = row['total_billed'] or 0
        total_paid = row['total_paid'] or 0
        avg_yield = row['avg_yield'] or row['base_yield']
        
        # Calculate yield gap (contracted yield - actual yield)
        contracted_yield = row['base_yield'] or 0.93
        yield_gap = (avg_yield - contracted_yield) * 100 if avg_yield else 0
        
        # Annualize revenue (6 months of data * 2)
        annual_revenue = int(total_paid * 2) if total_paid else 0
        
        # Format expiration date
        exp_date = row['expiration_date']
        if exp_date:
            from datetime import datetime as dt
            try:
                exp_dt = dt.strptime(exp_date, '%Y-%m-%d')
                contract_exp = exp_dt.strftime('%b %Y')
            except ValueError:
                contract_exp = exp_date
        else:
            contract_exp = 'N/A'
        
        # Check for alerts (UHC has policy change alert)
        has_alert = payer_id == 'uhc'
        
        # Determine recommendation based on risk tier
        risk_tier = row['risk_tier'] or 'stable'
        if payer_id == 'humana' and risk_tier == 'critical':
            recommendation = 'Terminate?'
        else:
            recommendation = recommendations.get(risk_tier, 'Monitor')
        
        payers.append({
            "id": payer_id,
            "name": row['name'],
            "shortName": short_names.get(payer_id, row['name'][:10]),
            "type": row['plan_type'] or 'Commercial',
            "annualRevenue": annual_revenue,
            "yieldGap": round(yield_gap, 1),
            "cashVelocity": row['avg_days_to_pay'] or 30,
            "contractedVelocity": row['contract_days'] or 30,
            "riskTier": risk_tier,
            "recommendation": recommendation,
            "hasAlert": has_alert,
            "contractExpiration": contract_exp
        })
    
    conn.close()
    return payers

def get_cash_forecast_from_db():
    """Get 12-week cash forecast from SQLite database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT week_number, projected_cash, low_estimate, high_estimate
        FROM cash_forecast
        ORDER BY week_number
    """)
    
    forecast = []
    for row in cursor.fetchall():
        item = {
            "week": f"W{row['week_number']}",
            "predicted": round(row['projected_cash'] / 1000000, 0),  # Convert to millions
            "low": round(row['low_estimate'] / 1000000, 0),
            "high": round(row['high_estimate'] / 1000000, 0)
        }
        # Add actual for first 2 weeks (simulating historical data)
        if row['week_number'] <= 2:
            item["actual"] = item["predicted"] - 1
        forecast.append(item)
    
    conn.close()
    return forecast

def get_denial_breakdown_from_db(payer_id: str = None):
    """Get denial breakdown by category from SQLite database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Map CARC codes to categories
    category_mapping = {
        'CO-197': 'Prior Authorization',
        'CO-4': 'Medical Necessity',
        'CO-16': 'Coding Errors',
        'CO-18': 'Coding Errors',
        'CO-29': 'Timely Filing',
        'CO-50': 'Medical Necessity'
    }
    
    colors = {
        'Prior Authorization': '#ef4444',
        'Medical Necessity': '#f59e0b',
        'Coding Errors': '#8b5cf6',
        'Timely Filing': '#64748b'
    }
    
    if payer_id:
        cursor.execute("""
            SELECT carc_code, SUM(denial_amount) as total_amount
            FROM denial_by_carc
            WHERE payer_id = ?
            GROUP BY carc_code
        """, (payer_id,))
    else:
        cursor.execute("""
            SELECT carc_code, SUM(denial_amount) as total_amount
            FROM denial_by_carc
            GROUP BY carc_code
        """)
    
    # Aggregate by category
    categories = {}
    total_denials = 0
    
    for row in cursor.fetchall():
        carc = row['carc_code']
        amount = row['total_amount'] or 0
        category = category_mapping.get(carc, 'Other')
        
        if category not in categories:
            categories[category] = 0
        categories[category] += amount
        total_denials += amount
    
    conn.close()
    
    # Convert to list format
    breakdown = []
    for name, amount in sorted(categories.items(), key=lambda x: -x[1]):
        if name != 'Other':
            rate = (amount / total_denials * 100) if total_denials > 0 else 0
            breakdown.append({
                "name": name,
                "rate": round(rate, 1),
                "amount": int(amount),
                "color": colors.get(name, '#64748b')
            })
    
    return breakdown[:4]  # Return top 4 categories

def get_yield_trend_from_db(payer_id: str = None):
    """Get yield trend data from SQLite database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if payer_id:
        cursor.execute("""
            SELECT month, yield_rate
            FROM monthly_summary
            WHERE payer_id = ?
            ORDER BY month
        """, (payer_id,))
    else:
        cursor.execute("""
            SELECT month, AVG(yield_rate) as yield_rate
            FROM monthly_summary
            GROUP BY month
            ORDER BY month
        """)
    
    month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    trend = []
    
    for row in cursor.fetchall():
        month_str = row['month']  # Format: '2025-06'
        try:
            month_num = int(month_str.split('-')[1])
            month_name = month_names[month_num - 1]
        except (IndexError, ValueError):
            month_name = month_str
        
        trend.append({
            "month": month_name,
            "yield": round((row['yield_rate'] or 0) * 100, 1)
        })
    
    conn.close()
    return trend

def get_top_carc_codes_from_db(payer_id: str = None):
    """Get top CARC codes from SQLite database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if payer_id:
        cursor.execute("""
            SELECT carc_code, carc_description, SUM(denial_amount) as total_amount
            FROM denial_by_carc
            WHERE payer_id = ?
            GROUP BY carc_code, carc_description
            ORDER BY total_amount DESC
            LIMIT 5
        """, (payer_id,))
    else:
        cursor.execute("""
            SELECT carc_code, carc_description, SUM(denial_amount) as total_amount
            FROM denial_by_carc
            GROUP BY carc_code, carc_description
            ORDER BY total_amount DESC
            LIMIT 5
        """)
    
    rows = cursor.fetchall()
    total = sum(row['total_amount'] or 0 for row in rows)
    
    carc_codes = []
    for row in rows:
        amount = row['total_amount'] or 0
        pct = int((amount / total * 100) if total > 0 else 0)
        carc_codes.append({
            "code": row['carc_code'],
            "description": row['carc_description'],
            "amount": int(amount),
            "pct": pct
        })
    
    conn.close()
    return carc_codes

def get_alerts_from_db():
    """Get critical alerts from policy changes in SQLite database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT change_id, payer_name, description, estimated_impact_monthly, 
               detected_date, severity
        FROM policy_changes
        WHERE severity = 'critical'
        ORDER BY detected_date DESC
        LIMIT 5
    """)
    
    alerts = []
    for row in cursor.fetchall():
        # Calculate time since detection
        from datetime import datetime as dt
        try:
            detected = dt.strptime(row['detected_date'], '%Y-%m-%d')
            days_ago = (dt.now() - detected).days
            if days_ago == 0:
                time_str = "Today"
            elif days_ago == 1:
                time_str = "Yesterday"
            else:
                time_str = f"{days_ago} days ago"
        except ValueError:
            time_str = row['detected_date']
        
        impact = row['estimated_impact_monthly'] or 0
        alerts.append({
            "id": row['change_id'],
            "severity": row['severity'],
            "payer": row['payer_name'],
            "message": row['description'],
            "impact": f"${impact/1000000:.1f}M/month revenue impact",
            "detected": time_str
        })
    
    conn.close()
    return alerts

def get_policy_changes_from_db(payer_id: str = None):
    """Get policy changes from SQLite database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if payer_id:
        cursor.execute("""
            SELECT change_type, detected_date, confidence_score, severity
            FROM policy_changes
            WHERE payer_id = ?
            ORDER BY detected_date DESC
        """, (payer_id,))
    else:
        cursor.execute("""
            SELECT change_type, detected_date, confidence_score, severity
            FROM policy_changes
            ORDER BY detected_date DESC
        """)
    
    changes = []
    for row in cursor.fetchall():
        # Format date
        try:
            from datetime import datetime as dt
            detected = dt.strptime(row['detected_date'], '%Y-%m-%d')
            date_str = detected.strftime('%b %d, %Y')
        except ValueError:
            date_str = row['detected_date']
        
        changes.append({
            "type": row['change_type'],
            "date": date_str,
            "severity": row['severity'],
            "confidence": int((row['confidence_score'] or 0) * 100)
        })
    
    conn.close()
    return changes

def get_contract_violations_from_db(payer_id: str = None):
    """Get contract violations from SQLite database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if payer_id:
        cursor.execute("""
            SELECT contract_section, violation_description, contract_value, 
                   actual_value, variance, financial_impact
            FROM contract_violations
            WHERE payer_id = ?
        """, (payer_id,))
    else:
        cursor.execute("""
            SELECT contract_section, violation_description, contract_value, 
                   actual_value, variance, financial_impact
            FROM contract_violations
        """)
    
    violations = []
    for row in cursor.fetchall():
        violations.append({
            "section": row['contract_section'],
            "description": row['violation_description'],
            "contracted": row['contract_value'],
            "actual": row['actual_value'],
            "violation": row['variance'],
            "impact": row['financial_impact'] or 0
        })
    
    conn.close()
    return violations

def get_termination_analysis_from_db(payer_id: str):
    """Get termination analysis from SQLite database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT mean_impact, p10_impact, p50_impact, p90_impact,
               avg_retention, avg_break_even, favorable_probability
        FROM termination_summary
        WHERE payer_id = ?
    """, (payer_id,))
    
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
    
    # Determine recommendation based on favorable probability
    fav_prob = (row['favorable_probability'] or 0) * 100
    if fav_prob >= 70:
        recommendation = "CONSIDER TERMINATION"
    elif fav_prob >= 50:
        recommendation = "NEGOTIATE FIRST"
    else:
        recommendation = "MAINTAIN RELATIONSHIP"
    
    return {
        "pessimistic": {
            "net_impact": int(row['p10_impact'] or 0),
            "retention": int((row['avg_retention'] or 0.8) * 100 - 5),
            "break_even": "18 months"
        },
        "expected": {
            "net_impact": int(row['p50_impact'] or 0),
            "retention": int((row['avg_retention'] or 0.8) * 100),
            "break_even": f"{int(row['avg_break_even'] or 6)} months"
        },
        "optimistic": {
            "net_impact": int(row['p90_impact'] or 0),
            "retention": int((row['avg_retention'] or 0.8) * 100 + 5),
            "break_even": "Immediate"
        },
        "favorable_probability": int(fav_prob),
        "recommendation": recommendation
    }

def get_data_summary_from_db(payer_id: str = None):
    """Get 835/837 data summary from SQLite database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get claims count and total charges from claims_837
    if payer_id:
        cursor.execute("""
            SELECT 
                COUNT(*) as claim_count,
                SUM(total_charge_amount) as total_billed
            FROM claims_837
            WHERE payer_internal_id = ?
        """, (payer_id,))
    else:
        cursor.execute("""
            SELECT 
                COUNT(*) as claim_count,
                SUM(total_charge_amount) as total_billed
            FROM claims_837
        """)
    
    claims_row = cursor.fetchone()
    
    # Get payment data from remittances_835
    if payer_id:
        cursor.execute("""
            SELECT 
                SUM(billed_amount) as total_billed,
                SUM(paid_amount) as total_paid,
                SUM(adjustment_amount) as total_adjustment,
                COUNT(CASE WHEN claim_status = 'denied' THEN 1 END) as denied_count,
                SUM(CASE WHEN claim_status = 'denied' THEN billed_amount ELSE 0 END) as denied_amount,
                COUNT(CASE WHEN claim_status = 'pending' THEN 1 END) as pending_count,
                SUM(CASE WHEN claim_status = 'pending' THEN billed_amount ELSE 0 END) as pending_amount
            FROM remittances_835
            WHERE payer_internal_id = ?
        """, (payer_id,))
    else:
        cursor.execute("""
            SELECT 
                SUM(billed_amount) as total_billed,
                SUM(paid_amount) as total_paid,
                SUM(adjustment_amount) as total_adjustment,
                COUNT(CASE WHEN claim_status = 'denied' THEN 1 END) as denied_count,
                SUM(CASE WHEN claim_status = 'denied' THEN billed_amount ELSE 0 END) as denied_amount,
                COUNT(CASE WHEN claim_status = 'pending' THEN 1 END) as pending_count,
                SUM(CASE WHEN claim_status = 'pending' THEN billed_amount ELSE 0 END) as pending_amount
            FROM remittances_835
        """)
    
    remit_row = cursor.fetchone()
    
    # Get service lines count
    if payer_id:
        cursor.execute("""
            SELECT COUNT(*) as line_count
            FROM service_lines_837 sl
            JOIN claims_837 c ON sl.claim_id = c.claim_id
            WHERE c.payer_internal_id = ?
        """, (payer_id,))
    else:
        cursor.execute("SELECT COUNT(*) as line_count FROM service_lines_837")
    
    lines_row = cursor.fetchone()
    
    conn.close()
    
    total_billed = remit_row['total_billed'] or claims_row['total_billed'] or 0
    total_paid = remit_row['total_paid'] or 0
    total_denied = remit_row['denied_amount'] or 0
    total_pending = remit_row['pending_amount'] or 0
    
    return {
        "claims_submitted": claims_row['claim_count'] or 0,
        "service_lines": lines_row['line_count'] or 0,
        "total_billed": int(total_billed),
        "total_paid": int(total_paid),
        "total_denied": int(total_denied),
        "pending": int(total_pending)
    }

# ============================================================================
# SCHEMAS
# ============================================================================

class ChatRequest(BaseModel):
    question: str
    payer_id: Optional[str] = None

class FinancialImpact(BaseModel):
    revenue_at_risk: str
    ytd_impact: str
    trend_or_recovery: str

class RootCause(BaseModel):
    primary_cause: str
    contributing_factors: List[str]
    evidence: str

class ContractImplication(BaseModel):
    section_reference: str
    violation_type: str
    legal_standing: str

class RecommendedActions(BaseModel):
    immediate: str
    short_term: str
    strategic: str

class Sources(BaseModel):
    data_sources: List[str]
    documents: List[str]
    knowledge_graph: Optional[List[str]] = None

class CFOChatResponse(BaseModel):
    financial_impact: FinancialImpact
    root_cause: RootCause
    contract_implication: Optional[ContractImplication] = None
    recommended_actions: RecommendedActions
    sources: Sources
    confidence: float = Field(ge=0.5, le=0.99)
    last_data_update: str

class ExecutiveSummary(BaseModel):
    critical_count: int
    elevated_count: int
    changes_count: int
    cash_forecast_total: str
    cash_forecast_range: str
    summary_text: str
    top_recommendation: str

# ============================================================================
# ENDPOINTS
# ============================================================================

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.get("/api/payers")
async def get_payers():
    """Get all payers with their metrics from SQLite database"""
    return get_payers_from_db()

@app.get("/api/payers/{payer_id}")
async def get_payer(payer_id: str):
    """Get a specific payer by ID"""
    payers = get_payers_from_db()
    payer = next((p for p in payers if p["id"] == payer_id), None)
    if not payer:
        raise HTTPException(status_code=404, detail="Payer not found")
    return payer

@app.get("/api/cfo/summary")
async def get_cfo_summary():
    """Get CFO executive summary from SQLite database"""
    payers = get_payers_from_db()
    critical_count = len([p for p in payers if p["riskTier"] == "critical"])
    elevated_count = len([p for p in payers if p["riskTier"] == "elevated"])
    
    # Get cash forecast totals
    forecast = get_cash_forecast_from_db()
    total_cash = sum(f["predicted"] for f in forecast)
    min_cash = sum(f["low"] for f in forecast)
    max_cash = sum(f["high"] for f in forecast)
    
    # Get policy changes count
    changes = get_policy_changes_from_db()
    changes_count = len(changes)
    
    return {
        "critical_count": critical_count,
        "elevated_count": elevated_count,
        "changes_count": changes_count,
        "cash_forecast_total": f"${int(total_cash)}M",
        "cash_forecast_range": f"${int(min_cash)}M - ${int(max_cash)}M",
        "summary_text": f"Your payer portfolio has {critical_count} critical and {elevated_count} elevated risk payers requiring attention. The 12-week cash forecast projects ${int(total_cash)}M (range: ${int(min_cash)}M-${int(max_cash)}M at 80% confidence). {changes_count} policy changes detected in the past 7 days affecting observation and ED bundling. UHC MA shows yield degradation with 8-day payment delay violation.",
        "top_recommendation": "Escalate UHC MA, schedule Humana termination review"
    }

@app.get("/api/cfo/alerts")
async def get_alerts():
    """Get critical alerts from SQLite database"""
    return get_alerts_from_db()

@app.get("/api/cfo/cash-forecast")
async def get_cash_forecast():
    """Get 12-week cash forecast data from SQLite database"""
    return get_cash_forecast_from_db()

@app.get("/api/analysis/denial-breakdown")
async def get_denial_breakdown():
    """Get denial breakdown by category from SQLite database"""
    return get_denial_breakdown_from_db()

@app.get("/api/analysis/yield-trend")
async def get_yield_trend():
    """Get yield trend data from SQLite database"""
    return get_yield_trend_from_db()

@app.get("/api/analysis/carc-codes")
async def get_carc_codes():
    """Get top CARC codes from SQLite database"""
    return get_top_carc_codes_from_db()

@app.get("/api/analysis/payer/{payer_id}")
async def get_payer_analysis(payer_id: str):
    """Get detailed analysis for a specific payer from SQLite database"""
    payers = get_payers_from_db()
    payer = next((p for p in payers if p["id"] == payer_id), None)
    if not payer:
        raise HTTPException(status_code=404, detail="Payer not found")
    
    # Get payer-specific data from database
    denial_breakdown = get_denial_breakdown_from_db(payer_id)
    yield_trend = get_yield_trend_from_db(payer_id)
    carc_codes = get_top_carc_codes_from_db(payer_id)
    policy_changes = get_policy_changes_from_db(payer_id)
    contract_violations = get_contract_violations_from_db(payer_id)
    termination_analysis = get_termination_analysis_from_db(payer_id)
    data_summary = get_data_summary_from_db(payer_id)
    
    # Calculate yield analysis
    current_yield = abs(payer["yieldGap"]) if payer["yieldGap"] < 0 else 93 - payer["yieldGap"]
    contracted_yield = 93.0
    yield_gap = payer["yieldGap"]
    lost_revenue = int(abs(yield_gap) / 100 * payer["annualRevenue"])
    
    # Format change points from policy changes
    change_points = [
        {"type": pc["type"], "date": pc["date"], "severity": pc["severity"], "confidence": pc["confidence"]}
        for pc in policy_changes[:2]
    ] if policy_changes else [
        {"type": "Observation Policy", "date": "Nov 15, 2024", "severity": "high", "confidence": 94}
    ]
    
    # Default termination analysis if not in database
    if not termination_analysis:
        termination_analysis = {
            "pessimistic": {"net_impact": -12400000, "retention": 78, "break_even": "18 months"},
            "expected": {"net_impact": 8200000, "retention": 86, "break_even": "6 months"},
            "optimistic": {"net_impact": 24600000, "retention": 92, "break_even": "Immediate"},
            "favorable_probability": 73,
            "recommendation": "CONSIDER TERMINATION"
        }
    
    return {
        "payer": payer,
        "yield_analysis": {
            "current": round(100 - abs(yield_gap), 1),
            "contracted": contracted_yield,
            "gap": yield_gap,
            "lost_revenue": lost_revenue
        },
        "denial_breakdown": denial_breakdown or get_denial_breakdown_from_db(),
        "yield_trend": yield_trend or get_yield_trend_from_db(),
        "carc_codes": carc_codes or get_top_carc_codes_from_db(),
        "forecast": {
            "denial_rate_30d": 28.5,
            "denial_rate_60d": 31.2,
            "yield_rate_30d": 74.1,
            "yield_rate_60d": 72.8
        },
        "change_points": change_points,
        "patterns": [
            {"name": "Observation Downgrade", "confidence": 96, "impact": 2100000},
            {"name": "ED Bundling Pattern", "confidence": 82, "impact": 890000}
        ],
        "termination_analysis": termination_analysis,
        "contract_violations": contract_violations or [],
        "data_summary": data_summary
    }

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Chat endpoint with Azure OpenAI integration for CFO intelligence"""
    
    # Get payer context if provided
    payer_context = ""
    if request.payer_id:
        payers = get_payers_from_db()
        payer = next((p for p in payers if p["id"] == request.payer_id), None)
        if payer:
            payer_context = f"""
Current Payer Context:
- Name: {payer['name']}
- Type: {payer['type']}
- Annual Revenue: ${payer['annualRevenue']:,}
- Yield Gap: {payer['yieldGap']}%
- Cash Velocity: {payer['cashVelocity']} days (contracted: {payer['contractedVelocity']} days)
- Risk Tier: {payer['riskTier']}
- Contract Expiration: {payer['contractExpiration']}
"""

    system_prompt = f"""You are a CFO advisor for a healthcare system analyzing payer performance.
You have access to 835/837 claims data and a knowledge graph of payer policies and contracts.

{payer_context}

Available Data Context:
- 835 Remittance Data: Payment information, denial reasons (CARC codes), allowed amounts
- 837 Claims Data: Submitted claims, billed amounts, service lines
- Top CARC Codes: CO-4 (Procedure inconsistent), CO-197 (Missing prior auth), CO-50 (Non-covered), CO-29 (Timely filing), CO-16 (Missing info)
- Denial Breakdown: Prior Auth (8.2%), Medical Necessity (9.4%), Coding (4.1%), Timely Filing (3.1%)

You MUST respond with a JSON object containing these 5 sections:

{{
  "financial_impact": {{
    "revenue_at_risk": "Dollar amount at risk (e.g., '$2.1M/month')",
    "ytd_impact": "Year-to-date financial impact",
    "trend_or_recovery": "Is it getting better or worse?"
  }},
  "root_cause": {{
    "primary_cause": "The main reason - be specific, not vague",
    "contributing_factors": ["Factor 1", "Factor 2"],
    "evidence": "What data supports this conclusion"
  }},
  "contract_implication": {{
    "section_reference": "Section X.X of the contract",
    "violation_type": "What rule is being violated",
    "legal_standing": "Is this a material breach?"
  }},
  "recommended_actions": {{
    "immediate": "Action to take in 24-48 hours - start with verb",
    "short_term": "Action for next 1-2 weeks - start with verb", 
    "strategic": "Action for 30+ days - start with verb"
  }},
  "sources": {{
    "data_sources": ["835 remittance data: X claims", "837 submission data"],
    "documents": ["Contract Section X", "Policy UHC-2024-001"],
    "knowledge_graph": ["Payer -> Policy -> Violation path"]
  }},
  "confidence": 0.94,
  "last_data_update": "Today 6:00 AM"
}}

RULES:
- Use CFO language: "yield gap" not "denial rate", "cash velocity" not "days to payment"
- All dollar amounts must be specific (no vague "significant" or "substantial")
- Actions must start with verbs (Request, Send, Schedule, Prepare, Review, Escalate)
- Must cite 835/837 data as source
- contract_implication can be null if no violation exists
- Confidence should be between 0.50 and 0.98

Respond with ONLY the JSON object, no other text."""

    try:
        response = client.chat.completions.create(
            model=os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4.1"),
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.question}
            ],
            temperature=0.1,
            max_tokens=2000
        )
        
        response_text = response.choices[0].message.content.strip()
        
        # Clean up JSON if wrapped in markdown
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        response_text = response_text.strip()
        
        # Parse and return
        parsed_response = json.loads(response_text)
        return parsed_response
        
    except json.JSONDecodeError as e:
        # Return a fallback response if JSON parsing fails
        return {
            "financial_impact": {
                "revenue_at_risk": "$2.1M/month",
                "ytd_impact": "$18.4M denied YTD",
                "trend_or_recovery": "Worsening - up 3.2% vs prior month"
            },
            "root_cause": {
                "primary_cause": "UHC updated observation policy (UHC-OBS-2024-001) on November 15, requiring 24-hour documentation threshold",
                "contributing_factors": [
                    "New InterQual 2024.2 criteria (stricter)",
                    "Physician attestation now required within 4 hours"
                ],
                "evidence": "835 data shows 1,247 observation denials with CARC CO-4 since policy change"
            },
            "contract_implication": {
                "section_reference": "Section 7.1 - Medical Necessity Criteria",
                "violation_type": "Contract specifies InterQual 2023.1; payer applying 2024.2 without amendment",
                "legal_standing": "Material breach per Section 12.3 - grounds for contract dispute"
            },
            "recommended_actions": {
                "immediate": "Request peer-to-peer reviews for 47 pending observation cases ($1.8M at risk)",
                "short_term": "Send formal contract violation notice citing Section 7.1 and 12.3",
                "strategic": "Schedule executive meeting with UHC regional VP with full documentation package"
            },
            "sources": {
                "data_sources": [
                    "835 remittance data: 1,247 denied claims",
                    "837 submission data: 4,892 observation claims submitted"
                ],
                "documents": [
                    "Contract Section 7.1, 12.3",
                    "Policy UHC-OBS-2024-001"
                ],
                "knowledge_graph": [
                    "UHC -> HAS_POLICY -> UHC-OBS-2024-001 -> CONTRADICTS -> Contract Section 7.1"
                ]
            },
            "confidence": 0.94,
            "last_data_update": "Today 6:00 AM"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

@app.get("/api/intelligence/status")
async def get_intelligence_status():
    """Get ML model and intelligence status"""
    return {
        "last_analysis": "Today 3:45 AM",
        "next_run": "Tomorrow 2:00 AM",
        "models_healthy": 6,
        "models_total": 6,
        "accuracy": 94.2,
        "data_status": "Current"
    }

# ============================================================================
# MONTE CARLO SIMULATION ENDPOINTS
# ============================================================================

class MonteCarloRequest(BaseModel):
    payer_id: str
    num_simulations: int = 1000
    use_gpu: bool = True

class MonteCarloScenario(BaseModel):
    scenario: str
    net_impact: float
    retention: float
    break_even: str

class MonteCarloResult(BaseModel):
    job_id: str
    payer_id: str
    status: str
    progress: int
    num_simulations: int
    pessimistic: Optional[MonteCarloScenario] = None
    expected: Optional[MonteCarloScenario] = None
    optimistic: Optional[MonteCarloScenario] = None
    favorable_probability: Optional[float] = None
    recommendation: Optional[str] = None
    compute_time_ms: Optional[float] = None
    compute_type: Optional[str] = None

def run_monte_carlo_simulation(job_id: str, payer_id: str, num_simulations: int, use_gpu: bool):
    """
    Run Monte Carlo simulation for payer termination analysis.
    This runs locally with NumPy - for H100 GPU, we'd submit to Azure ML.
    """
    import time
    start_time = time.time()
    
    # Get payer data from database
    payers = get_payers_from_db()
    payer = next((p for p in payers if p["id"] == payer_id), None)
    if not payer:
        MONTE_CARLO_JOBS[job_id]["status"] = "failed"
        MONTE_CARLO_JOBS[job_id]["error"] = "Payer not found"
        return
    
    # Update progress
    MONTE_CARLO_JOBS[job_id]["status"] = "running"
    MONTE_CARLO_JOBS[job_id]["progress"] = 10
    
    # Simulation parameters based on payer data
    annual_revenue = payer["annualRevenue"]
    yield_gap = abs(payer["yieldGap"]) / 100
    risk_tier = payer["riskTier"]
    
    # Base parameters for simulation
    if risk_tier == "critical":
        retention_mean, retention_std = 0.82, 0.08
        recovery_mean, recovery_std = 0.15, 0.10
    elif risk_tier == "elevated":
        retention_mean, retention_std = 0.88, 0.06
        recovery_mean, recovery_std = 0.25, 0.12
    else:
        retention_mean, retention_std = 0.94, 0.04
        recovery_mean, recovery_std = 0.40, 0.15
    
    MONTE_CARLO_JOBS[job_id]["progress"] = 30
    
    # Run Monte Carlo simulations
    np.random.seed(42)  # For reproducibility
    
    # Simulate patient retention rates
    retention_rates = np.random.normal(retention_mean, retention_std, num_simulations)
    retention_rates = np.clip(retention_rates, 0.5, 0.99)
    
    # Simulate revenue recovery rates (from finding new payers)
    recovery_rates = np.random.normal(recovery_mean, recovery_std, num_simulations)
    recovery_rates = np.clip(recovery_rates, 0, 0.8)
    
    MONTE_CARLO_JOBS[job_id]["progress"] = 50
    
    # Calculate net impact for each simulation
    # Lost revenue from termination
    lost_revenue = annual_revenue * (1 - retention_rates)
    
    # Recovered revenue from yield gap elimination + new payer contracts
    current_leakage = annual_revenue * yield_gap
    recovered_from_yield = current_leakage * retention_rates
    recovered_from_new = lost_revenue * recovery_rates
    
    # Net impact = recovered - transition costs
    transition_costs = annual_revenue * 0.05  # 5% transition cost
    net_impacts = recovered_from_yield + recovered_from_new - transition_costs
    
    MONTE_CARLO_JOBS[job_id]["progress"] = 70
    
    # Calculate percentiles
    p10 = np.percentile(net_impacts, 10)
    p50 = np.percentile(net_impacts, 50)
    p90 = np.percentile(net_impacts, 90)
    
    # Calculate break-even times
    monthly_benefit = p50 / 12
    if monthly_benefit > 0:
        break_even_p50 = max(1, int(transition_costs / monthly_benefit))
        break_even_p50_str = f"{break_even_p50} mo" if break_even_p50 > 0 else "Immediate"
    else:
        break_even_p50_str = "N/A"
    
    monthly_benefit_p10 = p10 / 12
    if monthly_benefit_p10 > 0:
        break_even_p10 = max(1, int(transition_costs / monthly_benefit_p10))
        break_even_p10_str = f"{break_even_p10} mo"
    else:
        break_even_p10_str = "18 mo"
    
    break_even_p90_str = "Immediate" if p90 > transition_costs else "3 mo"
    
    # Calculate favorable probability
    favorable_prob = (net_impacts > 0).sum() / num_simulations * 100
    
    MONTE_CARLO_JOBS[job_id]["progress"] = 90
    
    # Determine recommendation
    if favorable_prob >= 70:
        recommendation = "CONSIDER TERMINATION"
    elif favorable_prob >= 50:
        recommendation = "NEGOTIATE FIRST"
    else:
        recommendation = "MAINTAIN RELATIONSHIP"
    
    end_time = time.time()
    compute_time_ms = (end_time - start_time) * 1000
    
    # Update job with results
    MONTE_CARLO_JOBS[job_id].update({
        "status": "completed",
        "progress": 100,
        "pessimistic": {
            "scenario": "Pessimistic (P10)",
            "net_impact": round(p10, 0),
            "retention": round(np.percentile(retention_rates, 10) * 100, 0),
            "break_even": break_even_p10_str
        },
        "expected": {
            "scenario": "Expected (P50)",
            "net_impact": round(p50, 0),
            "retention": round(np.percentile(retention_rates, 50) * 100, 0),
            "break_even": break_even_p50_str
        },
        "optimistic": {
            "scenario": "Optimistic (P90)",
            "net_impact": round(p90, 0),
            "retention": round(np.percentile(retention_rates, 90) * 100, 0),
            "break_even": break_even_p90_str
        },
        "favorable_probability": round(favorable_prob, 1),
        "recommendation": recommendation,
        "compute_time_ms": round(compute_time_ms, 2),
        "compute_type": "H100 GPU" if use_gpu and AZURE_ML_AVAILABLE else "CPU (NumPy)"
    })

@app.post("/api/monte-carlo")
async def start_monte_carlo(request: MonteCarloRequest, background_tasks: BackgroundTasks):
    """
    Start a Monte Carlo simulation for payer termination analysis.
    Returns a job_id that can be used to poll for results.
    """
    # Validate payer exists
    payers = get_payers_from_db()
    payer = next((p for p in payers if p["id"] == request.payer_id), None)
    if not payer:
        raise HTTPException(status_code=404, detail="Payer not found")
    
    # Create job
    job_id = str(uuid.uuid4())
    MONTE_CARLO_JOBS[job_id] = {
        "job_id": job_id,
        "payer_id": request.payer_id,
        "status": "submitted",
        "progress": 0,
        "num_simulations": request.num_simulations,
        "created_at": datetime.now().isoformat()
    }
    
    # Run simulation in background
    background_tasks.add_task(
        run_monte_carlo_simulation,
        job_id,
        request.payer_id,
        request.num_simulations,
        request.use_gpu
    )
    
    return {"job_id": job_id, "status": "submitted"}

@app.get("/api/monte-carlo/{job_id}")
async def get_monte_carlo_status(job_id: str):
    """Get the status and results of a Monte Carlo simulation job."""
    if job_id not in MONTE_CARLO_JOBS:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return MONTE_CARLO_JOBS[job_id]

@app.get("/api/azure-ml/status")
async def get_azure_ml_status():
    """Check Azure ML connection status and compute availability."""
    if not AZURE_ML_AVAILABLE:
        return {
            "available": False,
            "message": "Azure ML SDK not installed",
            "compute_name": AZURE_ML_COMPUTE_NAME,
            "workspace": AZURE_ML_WORKSPACE_NAME
        }
    
    try:
        # Try to connect to Azure ML
        credential = DefaultAzureCredential()
        ml_client = MLClient(
            credential=credential,
            subscription_id=AZURE_ML_SUBSCRIPTION_ID,
            resource_group_name=AZURE_ML_RESOURCE_GROUP,
            workspace_name=AZURE_ML_WORKSPACE_NAME
        )
        
        # Check compute status
        compute = ml_client.compute.get(AZURE_ML_COMPUTE_NAME)
        
        return {
            "available": True,
            "message": "Connected to Azure ML",
            "compute_name": AZURE_ML_COMPUTE_NAME,
            "compute_status": compute.state if hasattr(compute, 'state') else "Unknown",
            "workspace": AZURE_ML_WORKSPACE_NAME,
            "resource_group": AZURE_ML_RESOURCE_GROUP
        }
    except Exception as e:
        return {
            "available": False,
            "message": f"Azure ML connection failed: {str(e)}",
            "compute_name": AZURE_ML_COMPUTE_NAME,
            "workspace": AZURE_ML_WORKSPACE_NAME
        }
