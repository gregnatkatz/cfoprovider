#!/usr/bin/env python3
"""
835/837 Synthetic Claims Data Generator
=======================================
Generates 6 months of realistic healthcare claims data for CFO Payer Intelligence Platform.

Usage:
    python generate_claims_data.py --output ./data --format parquet
    python generate_claims_data.py --output ./data --format csv
    python generate_claims_data.py --output ./data --format sqlite

Requirements:
    pip install pandas numpy faker pyarrow --break-system-packages

Author: Devin AI Assistant
For: AdventHealth CFO Payer Intelligence Platform
"""

import argparse
import os
import random
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
import hashlib

import numpy as np
import pandas as pd
from faker import Faker

# Initialize
fake = Faker()
Faker.seed(42)
np.random.seed(42)
random.seed(42)

# =============================================================================
# CONFIGURATION
# =============================================================================

CONFIG = {
    "hospital": {
        "name": "AdventHealth Orlando",
        "npi": "1234567890",
        "tax_id": "59-1234567",
        "address": {
            "street": "601 E Rollins St",
            "city": "Orlando",
            "state": "FL",
            "zip": "32803"
        }
    },
    "date_range": {
        "start": "2025-06-01",
        "end": "2025-11-30"  # 6 months
    },
    "volume": {
        "claims_per_month": 12000,  # ~72,000 total claims
        "service_lines_per_claim": (1, 8),  # Min/max service lines
    },
    "payers": [
        {
            "id": "uhc",
            "name": "UnitedHealthcare MA",
            "payer_id": "87726",
            "plan_type": "Medicare Advantage",
            "revenue_share": 0.22,
            "base_yield": 0.763,  # 76.3% - problematic
            "denial_rate": 0.248,  # 24.8%
            "avg_days_to_pay": 38,
            "contract_days": 30,
            "risk_tier": "critical"
        },
        {
            "id": "humana",
            "name": "Humana MA",
            "payer_id": "61101",
            "plan_type": "Medicare Advantage",
            "revenue_share": 0.17,
            "base_yield": 0.718,  # Even worse
            "denial_rate": 0.282,
            "avg_days_to_pay": 42,
            "contract_days": 30,
            "risk_tier": "critical"
        },
        {
            "id": "bcbs",
            "name": "Florida Blue",
            "payer_id": "00590",
            "plan_type": "Commercial",
            "revenue_share": 0.12,
            "base_yield": 0.916,
            "denial_rate": 0.084,
            "avg_days_to_pay": 28,
            "contract_days": 30,
            "risk_tier": "elevated"
        },
        {
            "id": "aetna",
            "name": "Aetna",
            "payer_id": "60054",
            "plan_type": "Commercial",
            "revenue_share": 0.08,
            "base_yield": 0.938,
            "denial_rate": 0.062,
            "avg_days_to_pay": 32,
            "contract_days": 30,
            "risk_tier": "elevated"
        },
        {
            "id": "cigna",
            "name": "Cigna",
            "payer_id": "62308",
            "plan_type": "Commercial",
            "revenue_share": 0.06,
            "base_yield": 0.979,
            "denial_rate": 0.021,
            "avg_days_to_pay": 29,
            "contract_days": 30,
            "risk_tier": "stable"
        },
        {
            "id": "medicare",
            "name": "Traditional Medicare",
            "payer_id": "00308",
            "plan_type": "Medicare FFS",
            "revenue_share": 0.35,
            "base_yield": 1.012,  # Slight overpayment
            "denial_rate": 0.045,
            "avg_days_to_pay": 14,
            "contract_days": 14,
            "risk_tier": "stable"
        }
    ]
}

# CARC (Claim Adjustment Reason Codes) - realistic denial reasons
CARC_CODES = {
    "CO-4": {"desc": "Procedure code inconsistent with modifier or diagnosis", "weight": 0.18},
    "CO-16": {"desc": "Missing/incomplete claim information", "weight": 0.08},
    "CO-18": {"desc": "Duplicate claim/service", "weight": 0.05},
    "CO-29": {"desc": "Time limit for filing has expired", "weight": 0.07},
    "CO-45": {"desc": "Charges exceed fee schedule/maximum allowable", "weight": 0.12},
    "CO-50": {"desc": "Non-covered service", "weight": 0.10},
    "CO-96": {"desc": "Non-covered charge(s)", "weight": 0.06},
    "CO-97": {"desc": "Payment adjusted - already adjudicated", "weight": 0.04},
    "CO-197": {"desc": "Precertification/authorization/notification absent", "weight": 0.15},
    "CO-204": {"desc": "Service not authorized on this date of service", "weight": 0.08},
    "OA-23": {"desc": "Payment adjusted - medical necessity", "weight": 0.07}
}

# RARC (Remittance Advice Remark Codes)
RARC_CODES = ["N362", "N386", "N479", "N522", "N527", "N539", "N545", "N576", "N591", "N657"]

# Service categories with CPT ranges and typical charges
SERVICE_CATEGORIES = {
    "emergency": {
        "cpt_codes": ["99281", "99282", "99283", "99284", "99285"],
        "charge_range": (250, 2500),
        "weight": 0.15
    },
    "observation": {
        "cpt_codes": ["99218", "99219", "99220", "99224", "99225", "99226"],
        "charge_range": (800, 3500),
        "weight": 0.12,
        "high_denial_uhc": True  # UHC denies these more
    },
    "inpatient": {
        "cpt_codes": ["99221", "99222", "99223", "99231", "99232", "99233", "99238", "99239"],
        "charge_range": (1500, 8000),
        "weight": 0.20
    },
    "surgery": {
        "cpt_codes": ["27447", "33533", "44970", "47562", "49505", "52000", "66984"],
        "charge_range": (5000, 75000),
        "weight": 0.10
    },
    "imaging": {
        "cpt_codes": ["70553", "71250", "71260", "72148", "73721", "74177", "77067"],
        "charge_range": (300, 4000),
        "weight": 0.18
    },
    "laboratory": {
        "cpt_codes": ["80053", "85025", "80061", "84443", "83036", "82947", "81001"],
        "charge_range": (25, 500),
        "weight": 0.15
    },
    "cardiology": {
        "cpt_codes": ["93000", "93306", "93458", "93010", "93015", "93350"],
        "charge_range": (200, 8000),
        "weight": 0.10
    }
}

# ICD-10 diagnosis codes (common)
ICD10_CODES = [
    "I10", "I25.10", "I50.9", "E11.9", "J18.9", "N17.9", "K80.20", "J44.1",
    "R07.9", "R55", "S72.001A", "I21.3", "J96.00", "N39.0", "K92.2", "R10.9",
    "E87.6", "J06.9", "M54.5", "G43.909", "F32.9", "K21.0", "D64.9", "I48.91"
]

# Place of service codes
POS_CODES = {
    "11": "Office",
    "21": "Inpatient Hospital",
    "22": "Outpatient Hospital",
    "23": "Emergency Room",
    "24": "Ambulatory Surgical Center",
    "31": "Skilled Nursing Facility"
}


# =============================================================================
# DATA GENERATORS
# =============================================================================

class ClaimsDataGenerator:
    """Generate realistic 835/837 claims data."""
    
    def __init__(self, config: Dict):
        self.config = config
        self.start_date = datetime.strptime(config["date_range"]["start"], "%Y-%m-%d")
        self.end_date = datetime.strptime(config["date_range"]["end"], "%Y-%m-%d")
        self.payers = {p["id"]: p for p in config["payers"]}
        
        # Track metrics for consistency
        self.claim_counter = 0
        self.patient_cache = {}
        
    def generate_patient(self) -> Dict:
        """Generate a patient with consistent demographics."""
        patient_id = f"P{random.randint(100000, 999999)}"
        
        if patient_id not in self.patient_cache:
            gender = random.choice(["M", "F"])
            # Medicare population skews older
            if random.random() < 0.52:  # 52% Medicare
                age = random.randint(65, 95)
            else:
                age = random.randint(18, 85)
            
            dob = datetime.now() - timedelta(days=age*365 + random.randint(0, 364))
            
            self.patient_cache[patient_id] = {
                "patient_id": patient_id,
                "member_id": f"MBR{random.randint(10000000, 99999999)}",
                "first_name": fake.first_name_male() if gender == "M" else fake.first_name_female(),
                "last_name": fake.last_name(),
                "dob": dob.strftime("%Y-%m-%d"),
                "gender": gender,
                "address": fake.street_address(),
                "city": fake.city(),
                "state": "FL",
                "zip": fake.zipcode_in_state("FL")
            }
        
        return self.patient_cache[patient_id]
    
    def select_payer(self) -> Dict:
        """Select payer based on revenue share weights."""
        weights = [p["revenue_share"] for p in self.config["payers"]]
        return random.choices(self.config["payers"], weights=weights)[0]
    
    def select_service_category(self) -> Tuple[str, Dict]:
        """Select service category based on weights."""
        categories = list(SERVICE_CATEGORIES.keys())
        weights = [SERVICE_CATEGORIES[c]["weight"] for c in categories]
        category = random.choices(categories, weights=weights)[0]
        return category, SERVICE_CATEGORIES[category]
    
    def generate_claim_id(self) -> str:
        """Generate unique claim ID."""
        self.claim_counter += 1
        return f"CLM{self.start_date.year}{self.claim_counter:08d}"
    
    def generate_service_date(self) -> datetime:
        """Generate random service date within range."""
        days_range = (self.end_date - self.start_date).days
        return self.start_date + timedelta(days=random.randint(0, days_range))
    
    def calculate_payment(self, payer: Dict, billed_amount: float, 
                          service_category: str, service_date: datetime) -> Dict:
        """Calculate payment, adjustments, and denial logic."""
        
        # Base denial probability from payer config
        denial_prob = payer["denial_rate"]
        
        # UHC observation denial spike (policy change Nov 15)
        if payer["id"] == "uhc" and service_category == "observation":
            if service_date >= datetime(2025, 11, 15):
                denial_prob += 0.15  # 15% additional denial rate
            elif service_date >= datetime(2025, 10, 1):
                denial_prob += 0.05  # Gradual increase
        
        # Humana has elevated denials across the board
        if payer["id"] == "humana":
            denial_prob += 0.03
        
        # Determine if claim is denied
        is_denied = random.random() < denial_prob
        
        if is_denied:
            # Select denial reason
            carc_weights = [CARC_CODES[c]["weight"] for c in CARC_CODES]
            carc_code = random.choices(list(CARC_CODES.keys()), weights=carc_weights)[0]
            
            # Partial vs full denial
            if random.random() < 0.3:  # 30% partial denial
                paid_amount = billed_amount * random.uniform(0.2, 0.6)
                adjustment_amount = billed_amount - paid_amount
                claim_status = "partial_denial"
            else:
                paid_amount = 0
                adjustment_amount = billed_amount
                claim_status = "denied"
            
            return {
                "status": claim_status,
                "paid_amount": round(paid_amount, 2),
                "adjustment_amount": round(adjustment_amount, 2),
                "carc_code": carc_code,
                "carc_desc": CARC_CODES[carc_code]["desc"],
                "rarc_code": random.choice(RARC_CODES)
            }
        else:
            # Paid claim - apply yield factor
            yield_factor = payer["base_yield"] * random.uniform(0.95, 1.05)
            allowed_amount = billed_amount * min(yield_factor, 1.0)
            
            # Contractual adjustment
            contractual_adj = billed_amount - allowed_amount
            
            # Patient responsibility (deductible/copay)
            patient_resp = allowed_amount * random.uniform(0.05, 0.20) if random.random() < 0.4 else 0
            paid_amount = allowed_amount - patient_resp
            
            return {
                "status": "paid",
                "paid_amount": round(paid_amount, 2),
                "allowed_amount": round(allowed_amount, 2),
                "adjustment_amount": round(contractual_adj, 2),
                "patient_responsibility": round(patient_resp, 2),
                "carc_code": "CO-45" if contractual_adj > 0 else None,
                "carc_desc": "Contractual adjustment" if contractual_adj > 0 else None,
                "rarc_code": None
            }
    
    def calculate_payment_date(self, service_date: datetime, payer: Dict) -> datetime:
        """Calculate when payment was received."""
        base_days = payer["avg_days_to_pay"]
        variance = random.gauss(0, 5)
        actual_days = max(7, int(base_days + variance))
        return service_date + timedelta(days=actual_days)
    
    def generate_837_claim(self) -> Dict:
        """Generate a single 837 (claim submission) record."""
        patient = self.generate_patient()
        payer = self.select_payer()
        service_date = self.generate_service_date()
        category, service_info = self.select_service_category()
        
        claim_id = self.generate_claim_id()
        
        # Generate service lines
        num_lines = random.randint(*self.config["volume"]["service_lines_per_claim"])
        service_lines = []
        total_charge = 0
        
        for line_num in range(1, num_lines + 1):
            cpt_code = random.choice(service_info["cpt_codes"])
            charge = round(random.uniform(*service_info["charge_range"]), 2)
            units = random.randint(1, 3)
            line_charge = charge * units
            total_charge += line_charge
            
            service_lines.append({
                "claim_id": claim_id,
                "line_number": line_num,
                "cpt_code": cpt_code,
                "modifier": random.choice([None, "25", "26", "59", "76"]),
                "icd10_code": random.choice(ICD10_CODES),
                "units": units,
                "charge_amount": round(line_charge, 2),
                "service_date": service_date.strftime("%Y-%m-%d"),
                "place_of_service": random.choice(list(POS_CODES.keys())),
                "rendering_provider_npi": f"1{random.randint(100000000, 999999999)}"
            })
        
        return {
            "claim": {
                "claim_id": claim_id,
                "patient_id": patient["patient_id"],
                "member_id": patient["member_id"],
                "payer_id": payer["payer_id"],
                "payer_name": payer["name"],
                "payer_internal_id": payer["id"],
                "plan_type": payer["plan_type"],
                "billing_provider_npi": self.config["hospital"]["npi"],
                "billing_provider_name": self.config["hospital"]["name"],
                "billing_provider_tax_id": self.config["hospital"]["tax_id"],
                "service_date_start": service_date.strftime("%Y-%m-%d"),
                "service_date_end": service_date.strftime("%Y-%m-%d"),
                "admission_date": service_date.strftime("%Y-%m-%d") if category in ["inpatient", "observation"] else None,
                "discharge_date": (service_date + timedelta(days=random.randint(1, 5))).strftime("%Y-%m-%d") if category in ["inpatient", "observation"] else None,
                "claim_type": "institutional" if category in ["inpatient", "observation", "emergency"] else "professional",
                "service_category": category,
                "total_charge_amount": round(total_charge, 2),
                "primary_diagnosis": random.choice(ICD10_CODES),
                "drg_code": f"{random.randint(1, 999):03d}" if category == "inpatient" else None,
                "submission_date": (service_date + timedelta(days=random.randint(1, 7))).strftime("%Y-%m-%d"),
                "created_at": datetime.now().isoformat()
            },
            "service_lines": service_lines,
            "patient": patient,
            "payer": payer,
            "service_category": category,
            "service_date": service_date
        }
    
    def generate_835_remittance(self, claim_837: Dict) -> Dict:
        """Generate 835 (remittance/payment) record for a claim."""
        claim = claim_837["claim"]
        payer = claim_837["payer"]
        service_date = claim_837["service_date"]
        service_category = claim_837["service_category"]
        
        # Calculate payment
        payment_info = self.calculate_payment(
            payer, 
            claim["total_charge_amount"],
            service_category,
            service_date
        )
        
        payment_date = self.calculate_payment_date(service_date, payer)
        
        # Generate check/EFT number
        check_number = f"EFT{random.randint(100000000, 999999999)}"
        
        return {
            "remittance_id": f"REM{claim['claim_id'][3:]}",
            "claim_id": claim["claim_id"],
            "payer_id": claim["payer_id"],
            "payer_name": claim["payer_name"],
            "payer_internal_id": claim["payer_internal_id"],
            "check_eft_number": check_number,
            "payment_date": payment_date.strftime("%Y-%m-%d"),
            "service_date": claim["service_date_start"],
            "billed_amount": claim["total_charge_amount"],
            "allowed_amount": payment_info.get("allowed_amount", 0),
            "paid_amount": payment_info["paid_amount"],
            "adjustment_amount": payment_info["adjustment_amount"],
            "patient_responsibility": payment_info.get("patient_responsibility", 0),
            "claim_status": payment_info["status"],
            "carc_code": payment_info.get("carc_code"),
            "carc_description": payment_info.get("carc_desc"),
            "rarc_code": payment_info.get("rarc_code"),
            "days_to_pay": (payment_date - service_date).days,
            "contract_days": payer["contract_days"],
            "days_over_contract": max(0, (payment_date - service_date).days - payer["contract_days"]),
            "created_at": datetime.now().isoformat()
        }
    
    def generate_all_data(self) -> Dict[str, pd.DataFrame]:
        """Generate complete dataset."""
        print("🏥 Generating 835/837 Claims Data...")
        print(f"   Hospital: {self.config['hospital']['name']}")
        print(f"   Date Range: {self.config['date_range']['start']} to {self.config['date_range']['end']}")
        
        # Calculate total claims
        months = 6
        total_claims = self.config["volume"]["claims_per_month"] * months
        print(f"   Target Claims: {total_claims:,}")
        
        claims_837 = []
        service_lines_837 = []
        remittances_835 = []
        patients = []
        
        for i in range(total_claims):
            if (i + 1) % 10000 == 0:
                print(f"   Progress: {i + 1:,} / {total_claims:,} claims ({(i+1)/total_claims*100:.1f}%)")
            
            # Generate 837 claim
            claim_data = self.generate_837_claim()
            claims_837.append(claim_data["claim"])
            service_lines_837.extend(claim_data["service_lines"])
            
            # Generate 835 remittance (only if payment date is in the past)
            remittance = self.generate_835_remittance(claim_data)
            if datetime.strptime(remittance["payment_date"], "%Y-%m-%d") <= datetime.now():
                remittances_835.append(remittance)
        
        # Collect unique patients
        patients = list(self.patient_cache.values())
        
        print(f"\n✅ Generated:")
        print(f"   837 Claims: {len(claims_837):,}")
        print(f"   837 Service Lines: {len(service_lines_837):,}")
        print(f"   835 Remittances: {len(remittances_835):,}")
        print(f"   Unique Patients: {len(patients):,}")
        
        return {
            "claims_837": pd.DataFrame(claims_837),
            "service_lines_837": pd.DataFrame(service_lines_837),
            "remittances_835": pd.DataFrame(remittances_835),
            "patients": pd.DataFrame(patients),
            "payers": pd.DataFrame(self.config["payers"])
        }


# =============================================================================
# AGGREGATION & ANALYTICS TABLES
# =============================================================================

def generate_analytics_tables(data: Dict[str, pd.DataFrame]) -> Dict[str, pd.DataFrame]:
    """Generate pre-aggregated analytics tables for the dashboard."""
    
    print("\n📊 Generating Analytics Tables...")
    
    claims = data["claims_837"]
    remittances = data["remittances_835"]
    
    # Merge for analysis
    merged = remittances.merge(
        claims[["claim_id", "service_category", "primary_diagnosis", "claim_type"]],
        on="claim_id",
        how="left"
    )
    
    # 1. Daily Metrics by Payer
    merged["payment_date_dt"] = pd.to_datetime(merged["payment_date"])
    merged["service_date_dt"] = pd.to_datetime(merged["service_date"])
    
    daily_metrics = merged.groupby(["payment_date", "payer_internal_id", "payer_name"]).agg({
        "claim_id": "count",
        "billed_amount": "sum",
        "paid_amount": "sum",
        "adjustment_amount": "sum",
        "days_to_pay": "mean",
        "days_over_contract": "mean"
    }).reset_index()
    daily_metrics.columns = ["date", "payer_id", "payer_name", "claim_count", 
                             "billed_amount", "paid_amount", "adjustment_amount",
                             "avg_days_to_pay", "avg_days_over_contract"]
    daily_metrics["yield_rate"] = daily_metrics["paid_amount"] / daily_metrics["billed_amount"]
    daily_metrics["denial_rate"] = daily_metrics["adjustment_amount"] / daily_metrics["billed_amount"]
    
    # 2. Monthly Summary by Payer
    merged["month"] = merged["payment_date_dt"].dt.to_period("M").astype(str)
    
    monthly_summary = merged.groupby(["month", "payer_internal_id", "payer_name"]).agg({
        "claim_id": "count",
        "billed_amount": "sum",
        "paid_amount": "sum",
        "adjustment_amount": "sum",
        "days_to_pay": "mean",
        "days_over_contract": ["mean", "sum"]
    }).reset_index()
    monthly_summary.columns = ["month", "payer_id", "payer_name", "claim_count",
                               "billed_amount", "paid_amount", "adjustment_amount",
                               "avg_days_to_pay", "avg_days_over_contract", "total_days_over"]
    monthly_summary["yield_rate"] = monthly_summary["paid_amount"] / monthly_summary["billed_amount"]
    
    # 3. Denial Analysis by CARC Code
    denials = merged[merged["claim_status"].isin(["denied", "partial_denial"])]
    
    denial_by_carc = denials.groupby(["payer_internal_id", "payer_name", "carc_code", "carc_description"]).agg({
        "claim_id": "count",
        "adjustment_amount": "sum"
    }).reset_index()
    denial_by_carc.columns = ["payer_id", "payer_name", "carc_code", "carc_description", 
                              "denial_count", "denial_amount"]
    
    # 4. Service Category Analysis
    category_analysis = merged.groupby(["payer_internal_id", "payer_name", "service_category"]).agg({
        "claim_id": "count",
        "billed_amount": "sum",
        "paid_amount": "sum",
        "adjustment_amount": "sum"
    }).reset_index()
    category_analysis.columns = ["payer_id", "payer_name", "service_category",
                                  "claim_count", "billed_amount", "paid_amount", "adjustment_amount"]
    category_analysis["yield_rate"] = category_analysis["paid_amount"] / category_analysis["billed_amount"]
    category_analysis["denial_rate"] = category_analysis["adjustment_amount"] / category_analysis["billed_amount"]
    
    # 5. Cash Velocity Trend (Weekly)
    merged["week"] = merged["payment_date_dt"].dt.to_period("W").astype(str)
    
    velocity_trend = merged.groupby(["week", "payer_internal_id"]).agg({
        "days_to_pay": "mean",
        "days_over_contract": "mean",
        "paid_amount": "sum"
    }).reset_index()
    velocity_trend.columns = ["week", "payer_id", "avg_days_to_pay", "avg_days_over_contract", "paid_amount"]
    
    # 6. Observation Denial Trend (for UHC policy change analysis)
    obs_claims = merged[merged["service_category"] == "observation"]
    obs_trend = obs_claims.groupby(["payment_date", "payer_internal_id"]).agg({
        "claim_id": "count",
        "billed_amount": "sum",
        "paid_amount": "sum"
    }).reset_index()
    obs_trend.columns = ["date", "payer_id", "claim_count", "billed_amount", "paid_amount"]
    obs_trend["denial_rate"] = 1 - (obs_trend["paid_amount"] / obs_trend["billed_amount"])
    
    # 7. Payer Scorecard (Current State)
    latest_month = monthly_summary["month"].max()
    payer_scorecard = monthly_summary[monthly_summary["month"] == latest_month].copy()
    
    # Add historical comparison
    prev_months = monthly_summary[monthly_summary["month"] < latest_month].groupby("payer_id").agg({
        "yield_rate": "mean",
        "avg_days_to_pay": "mean"
    }).reset_index()
    prev_months.columns = ["payer_id", "historical_yield", "historical_days_to_pay"]
    
    payer_scorecard = payer_scorecard.merge(prev_months, on="payer_id", how="left")
    payer_scorecard["yield_trend"] = payer_scorecard["yield_rate"] - payer_scorecard["historical_yield"]
    payer_scorecard["velocity_trend"] = payer_scorecard["avg_days_to_pay"] - payer_scorecard["historical_days_to_pay"]
    
    # 8. Cash Forecast Data (12 weeks projected)
    weekly_cash = merged.groupby("week")["paid_amount"].sum().reset_index()
    weekly_cash.columns = ["week", "cash_received"]
    
    # Simple forecast - use last 4 weeks average with trend
    recent_avg = weekly_cash["cash_received"].tail(4).mean()
    trend = (weekly_cash["cash_received"].tail(4).mean() - weekly_cash["cash_received"].tail(8).head(4).mean()) / 4
    
    forecast_weeks = []
    for i in range(1, 13):
        projected = recent_avg + (trend * i) + np.random.normal(0, recent_avg * 0.05)
        forecast_weeks.append({
            "week_number": i,
            "projected_cash": round(max(0, projected), 2),
            "low_estimate": round(max(0, projected * 0.9), 2),
            "high_estimate": round(projected * 1.1, 2)
        })
    
    cash_forecast = pd.DataFrame(forecast_weeks)
    
    print("✅ Analytics tables generated")
    
    return {
        "daily_metrics": daily_metrics,
        "monthly_summary": monthly_summary,
        "denial_by_carc": denial_by_carc,
        "category_analysis": category_analysis,
        "velocity_trend": velocity_trend,
        "observation_trend": obs_trend,
        "payer_scorecard": payer_scorecard,
        "cash_forecast": cash_forecast
    }


# =============================================================================
# CONTRACT & POLICY DATA
# =============================================================================

def generate_contract_data() -> Dict[str, pd.DataFrame]:
    """Generate contract terms and policy change data."""
    
    print("\n📋 Generating Contract & Policy Data...")
    
    # Contract Terms
    contracts = []
    for payer in CONFIG["payers"]:
        contracts.append({
            "contract_id": f"CTR-{payer['id'].upper()}-2024",
            "payer_id": payer["id"],
            "payer_name": payer["name"],
            "effective_date": "2024-01-01",
            "expiration_date": "2025-12-31" if payer["id"] != "medicare" else None,
            "payment_terms_days": payer["contract_days"],
            "base_reimbursement_rate": 0.93 if payer["plan_type"] != "Medicare FFS" else 1.0,
            "medical_necessity_criteria": "InterQual 2023.1",
            "prior_auth_required": payer["id"] in ["uhc", "humana", "aetna"],
            "timely_filing_days": 90 if payer["plan_type"] != "Medicare FFS" else 365,
            "appeal_deadline_days": 60,
            "auto_adjudication_threshold": 5000 if payer["id"] != "medicare" else None
        })
    
    # Policy Changes (detected from 835/837 patterns)
    policy_changes = [
        {
            "change_id": "POL-UHC-2025-001",
            "payer_id": "uhc",
            "payer_name": "UnitedHealthcare MA",
            "detected_date": "2025-11-15",
            "effective_date": "2025-11-01",
            "change_type": "Medical Necessity Criteria",
            "description": "Updated observation status criteria requiring 24-hour documentation threshold",
            "impacted_services": "Observation (99218-99226)",
            "estimated_impact_monthly": 2100000,
            "confidence_score": 0.94,
            "severity": "critical",
            "contract_section": "Section 7.1 - Medical Necessity",
            "potential_violation": True
        },
        {
            "change_id": "POL-UHC-2025-002",
            "payer_id": "uhc",
            "payer_name": "UnitedHealthcare MA",
            "detected_date": "2025-10-22",
            "effective_date": "2025-10-15",
            "change_type": "Prior Authorization",
            "description": "Expanded prior authorization requirements for advanced imaging",
            "impacted_services": "Imaging (70553, 71260, 74177)",
            "estimated_impact_monthly": 850000,
            "confidence_score": 0.87,
            "severity": "elevated",
            "contract_section": "Section 5.3 - Prior Authorization",
            "potential_violation": False
        },
        {
            "change_id": "POL-HUM-2025-001",
            "payer_id": "humana",
            "payer_name": "Humana MA",
            "detected_date": "2025-09-10",
            "effective_date": "2025-09-01",
            "change_type": "Bundling Logic",
            "description": "New claim bundling rules for ED visits with observation",
            "impacted_services": "Emergency + Observation",
            "estimated_impact_monthly": 920000,
            "confidence_score": 0.82,
            "severity": "elevated",
            "contract_section": "Section 4.5 - Claim Submission",
            "potential_violation": False
        }
    ]
    
    # Contract Violations
    violations = [
        {
            "violation_id": "VIO-UHC-2025-001",
            "payer_id": "uhc",
            "payer_name": "UnitedHealthcare MA",
            "contract_section": "Section 4.2 - Payment Terms",
            "violation_description": "Average payment exceeds 30-day contractual term",
            "contract_value": "30 days",
            "actual_value": "38 days",
            "variance": "8 days",
            "financial_impact": 12400000,
            "detection_date": "2025-11-01",
            "status": "active",
            "recommended_action": "Formal notice + interest claim"
        },
        {
            "violation_id": "VIO-UHC-2025-002",
            "payer_id": "uhc",
            "payer_name": "UnitedHealthcare MA",
            "contract_section": "Section 7.1 - Medical Necessity",
            "violation_description": "Applying InterQual 2024.2 criteria instead of contracted 2023.1",
            "contract_value": "InterQual 2023.1",
            "actual_value": "InterQual 2024.2",
            "variance": "Criteria version mismatch",
            "financial_impact": 25200000,
            "detection_date": "2025-11-15",
            "status": "active",
            "recommended_action": "Executive escalation + legal review"
        },
        {
            "violation_id": "VIO-HUM-2025-001",
            "payer_id": "humana",
            "payer_name": "Humana MA",
            "contract_section": "Section 4.2 - Payment Terms",
            "violation_description": "Average payment exceeds 30-day contractual term",
            "contract_value": "30 days",
            "actual_value": "42 days",
            "variance": "12 days",
            "financial_impact": 18600000,
            "detection_date": "2025-10-15",
            "status": "active",
            "recommended_action": "Formal notice + termination review"
        }
    ]
    
    print("✅ Contract & policy data generated")
    
    return {
        "contracts": pd.DataFrame(contracts),
        "policy_changes": pd.DataFrame(policy_changes),
        "contract_violations": pd.DataFrame(violations)
    }


# =============================================================================
# TERMINATION ANALYSIS DATA
# =============================================================================

def generate_termination_analysis() -> Dict[str, pd.DataFrame]:
    """Generate Monte Carlo termination scenario data."""
    
    print("\n🎲 Generating Termination Analysis Data...")
    
    scenarios = []
    
    for payer_id in ["uhc", "humana"]:
        payer = next(p for p in CONFIG["payers"] if p["id"] == payer_id)
        
        # Run 1000 Monte Carlo simulations
        for sim in range(1000):
            # Patient retention rate (what % of patients stay with hospital)
            retention_rate = np.random.beta(8, 2)  # Mean ~80%
            
            # Revenue recovery (from other payers)
            recovery_rate = np.random.beta(5, 3)  # Mean ~62%
            
            # Calculate net impact
            current_revenue = payer["revenue_share"] * 2500000000  # $2.5B total
            lost_revenue = current_revenue * (1 - retention_rate)
            recovered_revenue = lost_revenue * recovery_rate
            
            # Cost savings from reduced denials/admin
            admin_savings = current_revenue * payer["denial_rate"] * 0.3
            
            net_impact = recovered_revenue + admin_savings - lost_revenue
            
            # Break-even calculation
            if net_impact > 0:
                break_even_months = max(0, int(np.random.exponential(6)))
            else:
                break_even_months = int(abs(net_impact) / (admin_savings / 12)) if admin_savings > 0 else 36
            
            scenarios.append({
                "payer_id": payer_id,
                "payer_name": payer["name"],
                "simulation_id": sim + 1,
                "retention_rate": round(retention_rate, 4),
                "recovery_rate": round(recovery_rate, 4),
                "current_revenue": round(current_revenue, 2),
                "lost_revenue": round(lost_revenue, 2),
                "recovered_revenue": round(recovered_revenue, 2),
                "admin_savings": round(admin_savings, 2),
                "net_impact": round(net_impact, 2),
                "break_even_months": break_even_months,
                "favorable": net_impact > 0
            })
    
    scenarios_df = pd.DataFrame(scenarios)
    
    # Summary statistics
    summary = scenarios_df.groupby(["payer_id", "payer_name"]).agg({
        "net_impact": ["mean", lambda x: x.quantile(0.10), lambda x: x.quantile(0.50), lambda x: x.quantile(0.90)],
        "retention_rate": "mean",
        "break_even_months": ["mean", lambda x: x.quantile(0.50)],
        "favorable": "mean"
    }).reset_index()
    
    summary.columns = ["payer_id", "payer_name", "mean_impact", "p10_impact", "p50_impact", "p90_impact",
                       "avg_retention", "avg_break_even", "median_break_even", "favorable_probability"]
    
    print(f"✅ Generated {len(scenarios_df):,} termination scenarios")
    
    return {
        "termination_scenarios": scenarios_df,
        "termination_summary": summary
    }


# =============================================================================
# OUTPUT FUNCTIONS
# =============================================================================

def save_to_parquet(data: Dict[str, pd.DataFrame], output_dir: str):
    """Save all dataframes to Parquet format."""
    os.makedirs(output_dir, exist_ok=True)
    
    for name, df in data.items():
        filepath = os.path.join(output_dir, f"{name}.parquet")
        df.to_parquet(filepath, index=False)
        print(f"   📁 {filepath} ({len(df):,} rows)")


def save_to_csv(data: Dict[str, pd.DataFrame], output_dir: str):
    """Save all dataframes to CSV format."""
    os.makedirs(output_dir, exist_ok=True)
    
    for name, df in data.items():
        filepath = os.path.join(output_dir, f"{name}.csv")
        df.to_csv(filepath, index=False)
        print(f"   📁 {filepath} ({len(df):,} rows)")


def save_to_sqlite(data: Dict[str, pd.DataFrame], output_dir: str):
    """Save all dataframes to SQLite database."""
    os.makedirs(output_dir, exist_ok=True)
    
    db_path = os.path.join(output_dir, "claims_data.db")
    conn = sqlite3.connect(db_path)
    
    for name, df in data.items():
        df.to_sql(name, conn, if_exists="replace", index=False)
        print(f"   📊 Table: {name} ({len(df):,} rows)")
    
    # Create indexes for performance
    cursor = conn.cursor()
    
    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_claims_payer ON claims_837(payer_internal_id)",
        "CREATE INDEX IF NOT EXISTS idx_claims_date ON claims_837(service_date_start)",
        "CREATE INDEX IF NOT EXISTS idx_remit_claim ON remittances_835(claim_id)",
        "CREATE INDEX IF NOT EXISTS idx_remit_payer ON remittances_835(payer_internal_id)",
        "CREATE INDEX IF NOT EXISTS idx_remit_date ON remittances_835(payment_date)",
        "CREATE INDEX IF NOT EXISTS idx_remit_status ON remittances_835(claim_status)",
        "CREATE INDEX IF NOT EXISTS idx_lines_claim ON service_lines_837(claim_id)",
        "CREATE INDEX IF NOT EXISTS idx_daily_date ON daily_metrics(date)",
        "CREATE INDEX IF NOT EXISTS idx_monthly_month ON monthly_summary(month)"
    ]
    
    for idx in indexes:
        try:
            cursor.execute(idx)
        except:
            pass
    
    conn.commit()
    conn.close()
    
    print(f"\n   💾 Database: {db_path}")


# =============================================================================
# MAIN
# =============================================================================

def main():
    parser = argparse.ArgumentParser(description="Generate 835/837 Claims Data")
    parser.add_argument("--output", "-o", default="./claims_data", help="Output directory")
    parser.add_argument("--format", "-f", choices=["parquet", "csv", "sqlite", "all"], 
                        default="all", help="Output format")
    args = parser.parse_args()
    
    print("=" * 60)
    print("835/837 SYNTHETIC CLAIMS DATA GENERATOR")
    print("=" * 60)
    
    # Generate base claims data
    generator = ClaimsDataGenerator(CONFIG)
    base_data = generator.generate_all_data()
    
    # Generate analytics tables
    analytics_data = generate_analytics_tables(base_data)
    
    # Generate contract/policy data
    contract_data = generate_contract_data()
    
    # Generate termination analysis
    termination_data = generate_termination_analysis()
    
    # Combine all data
    all_data = {**base_data, **analytics_data, **contract_data, **termination_data}
    
    # Save to requested format(s)
    print(f"\n💾 Saving data to: {args.output}")
    
    if args.format in ["parquet", "all"]:
        print("\n📦 Parquet files:")
        save_to_parquet(all_data, os.path.join(args.output, "parquet"))
    
    if args.format in ["csv", "all"]:
        print("\n📄 CSV files:")
        save_to_csv(all_data, os.path.join(args.output, "csv"))
    
    if args.format in ["sqlite", "all"]:
        print("\n🗄️ SQLite database:")
        save_to_sqlite(all_data, os.path.join(args.output, "sqlite"))
    
    # Print summary
    print("\n" + "=" * 60)
    print("✅ DATA GENERATION COMPLETE")
    print("=" * 60)
    print(f"\nTables generated:")
    for name, df in all_data.items():
        print(f"   • {name}: {len(df):,} rows, {len(df.columns)} columns")
    
    print(f"\nData characteristics:")
    print(f"   • Date range: {CONFIG['date_range']['start']} to {CONFIG['date_range']['end']}")
    print(f"   • Hospital: {CONFIG['hospital']['name']}")
    print(f"   • Payers: {len(CONFIG['payers'])}")
    print(f"   • Total claims: {len(base_data['claims_837']):,}")
    print(f"   • Total remittances: {len(base_data['remittances_835']):,}")
    
    # Key metrics
    remit = base_data["remittances_835"]
    print(f"\nKey metrics:")
    print(f"   • Total billed: ${remit['billed_amount'].sum():,.0f}")
    print(f"   • Total paid: ${remit['paid_amount'].sum():,.0f}")
    print(f"   • Overall yield: {remit['paid_amount'].sum() / remit['billed_amount'].sum():.1%}")
    print(f"   • Average days to pay: {remit['days_to_pay'].mean():.1f}")
    
    denied = remit[remit["claim_status"].isin(["denied", "partial_denial"])]
    print(f"   • Denial rate: {len(denied) / len(remit):.1%}")
    print(f"   • Denied amount: ${denied['adjustment_amount'].sum():,.0f}")


if __name__ == "__main__":
    main()
