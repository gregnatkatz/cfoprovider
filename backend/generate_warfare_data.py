#!/usr/bin/env python3
"""
Generate warfare data for CFO Payer Warfare Platform.
Creates all JSON files needed for the 5 warfare capabilities:
1. Contract Weaponization
2. Policy Change Radar
3. Appeal ROI Optimizer
4. Negotiation Intelligence
5. Regulatory Complaint Generator
"""

import json
import os
from datetime import datetime, timedelta
import random

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "warfare_data")

def generate_contract_violations():
    """Generate active contract violations with interest calculations."""
    violations = [
        {
            "violation_id": "VIO-UHC-PAY-001",
            "payer_id": "uhc",
            "payer_name": "UnitedHealthcare",
            "violation_type": "payment_velocity",
            "contract_section": "4.1",
            "contract_requirement": "Payment within 30 calendar days",
            "actual_performance": "38 days average",
            "gap_days": 8,
            "affected_claims": 4247,
            "principal_late": 12400000,
            "interest_rate_annual": 0.12,
            "interest_rate_monthly": 0.01,
            "interest_owed": 1240000,
            "detection_date": "2024-11-15",
            "status": "active",
            "severity": "critical",
            "evidence": [
                "Average payment time: 38 days (contract: 30 days)",
                "4,247 claims paid after 30-day deadline",
                "Total late principal: $12.4M",
                "Interest accrued since Nov 15: $1.24M"
            ],
            "recommended_action": "Send interest demand letter",
            "expected_recovery": 1054000,
            "success_probability": 0.85
        },
        {
            "violation_id": "VIO-UHC-MN-001",
            "payer_id": "uhc",
            "payer_name": "UnitedHealthcare",
            "violation_type": "criteria_change",
            "contract_section": "7.1",
            "contract_requirement": "InterQual 2023.1 for medical necessity",
            "actual_performance": "Using InterQual 2024.2 without notice",
            "gap_days": None,
            "affected_claims": 847,
            "principal_late": None,
            "interest_rate_annual": None,
            "interest_rate_monthly": None,
            "interest_owed": None,
            "improper_denials": 2100000,
            "detection_date": "2024-11-20",
            "status": "active",
            "severity": "critical",
            "evidence": [
                "Contract specifies InterQual 2023.1 (Section 5.1)",
                "Denials citing 2024.2 criteria since Nov 1",
                "847 observation denials affected",
                "No 60-day advance notice provided (required by Section 5.1)"
            ],
            "recommended_action": "Send contract violation notice",
            "expected_recovery": 1512000,
            "success_probability": 0.72
        },
        {
            "violation_id": "VIO-HUM-PAY-001",
            "payer_id": "humana",
            "payer_name": "Humana",
            "violation_type": "payment_velocity",
            "contract_section": "4.1",
            "contract_requirement": "Payment within 30 calendar days",
            "actual_performance": "42 days average",
            "gap_days": 12,
            "affected_claims": 2891,
            "principal_late": 8900000,
            "interest_rate_annual": 0.12,
            "interest_rate_monthly": 0.01,
            "interest_owed": 890000,
            "detection_date": "2024-11-10",
            "status": "active",
            "severity": "elevated",
            "evidence": [
                "Average payment time: 42 days (contract: 30 days)",
                "2,891 claims paid after 30-day deadline",
                "Total late principal: $8.9M",
                "Interest accrued: $890K"
            ],
            "recommended_action": "Send interest demand letter",
            "expected_recovery": 712000,
            "success_probability": 0.80
        },
        {
            "violation_id": "VIO-HUM-BUND-001",
            "payer_id": "humana",
            "payer_name": "Humana",
            "violation_type": "improper_bundling",
            "contract_section": "6.2",
            "contract_requirement": "Separate payment for ED and observation",
            "actual_performance": "Bundling ED into observation, denying ED charges",
            "gap_days": None,
            "affected_claims": 423,
            "principal_late": None,
            "interest_rate_annual": None,
            "interest_rate_monthly": None,
            "interest_owed": None,
            "improper_denials": 845000,
            "detection_date": "2024-10-25",
            "status": "active",
            "severity": "elevated",
            "evidence": [
                "Policy HUM-BUND-2024-001 bundles ED into observation",
                "Contract Section 6.2 requires separate payment",
                "423 ED claims improperly denied",
                "Total denied: $845K"
            ],
            "recommended_action": "Send contract violation notice",
            "expected_recovery": 591500,
            "success_probability": 0.70
        }
    ]
    return violations


def generate_interest_calculations():
    """Generate detailed interest calculations for late-paid claims."""
    calculations = []
    base_date = datetime(2024, 11, 15)
    
    for i in range(100):
        claim_date = base_date - timedelta(days=random.randint(30, 120))
        payment_date = claim_date + timedelta(days=random.randint(35, 60))
        days_late = (payment_date - claim_date).days - 30
        principal = random.randint(2000, 50000)
        interest = principal * 0.12 / 365 * days_late
        
        calculations.append({
            "claim_id": f"CLM2024{random.randint(10000, 99999)}",
            "payer_id": random.choice(["uhc", "humana"]),
            "service_date": claim_date.strftime("%Y-%m-%d"),
            "payment_date": payment_date.strftime("%Y-%m-%d"),
            "days_to_payment": (payment_date - claim_date).days,
            "contract_days": 30,
            "days_late": days_late,
            "principal": principal,
            "interest_rate_annual": 0.12,
            "interest_owed": round(interest, 2),
            "contract_section": "4.2"
        })
    
    return calculations


def generate_demand_letters():
    """Generate ready-to-send demand letters."""
    letters = [
        {
            "letter_id": "LTR-UHC-INT-001",
            "violation_id": "VIO-UHC-PAY-001",
            "payer_id": "uhc",
            "payer_name": "UnitedHealthcare",
            "letter_type": "interest_demand",
            "subject": "Demand for Payment of Accrued Interest - Section 4.2",
            "recipient": {
                "name": "UnitedHealthcare Claims Department",
                "address": "P.O. Box 740800, Atlanta, GA 30374-0800",
                "attention": "Provider Dispute Resolution"
            },
            "body": """Dear Claims Administrator:

Pursuant to Section 4.2 of our Provider Agreement (Contract ID: CTR-UHC-2024-FL-001) and Florida Statute 627.6131, we hereby demand payment of accrued interest on late-paid claims.

SUMMARY OF VIOLATION:

Contract Requirement (Section 4.1): Payment of clean claims within 30 calendar days of receipt.

Actual Performance: Average payment time of 38 calendar days.

Affected Period: September 1, 2024 through November 30, 2024

Affected Claims: 4,247 claims

Total Principal Paid Late: $12,400,000

Interest Rate: 1% per month (12% annually) as specified in Section 4.2

Interest Owed: $1,240,000

DEMAND:

We demand payment of $1,240,000 in accrued interest within thirty (30) days of receipt of this letter.

Failure to remit payment will result in:
1. Formal complaint to the Florida Office of Insurance Regulation
2. Complaint to the Centers for Medicare & Medicaid Services
3. Pursuit of all available legal remedies

A detailed spreadsheet of affected claims with interest calculations is attached.

Sincerely,

[CFO Name]
Chief Financial Officer
AdventHealth Orlando""",
            "attachments": [
                "Claims analysis spreadsheet (4,247 claims)",
                "Interest calculation detail by claim",
                "Contract excerpt (Sections 4.1, 4.2)"
            ],
            "status": "ready",
            "created_date": "2024-12-09",
            "expected_recovery": 1054000,
            "success_probability": 0.85
        },
        {
            "letter_id": "LTR-UHC-VIO-001",
            "violation_id": "VIO-UHC-MN-001",
            "payer_id": "uhc",
            "payer_name": "UnitedHealthcare",
            "letter_type": "violation_notice",
            "subject": "Notice of Material Contract Breach - Section 7.1 Medical Necessity Criteria",
            "recipient": {
                "name": "UnitedHealthcare Provider Relations",
                "address": "P.O. Box 740800, Atlanta, GA 30374-0800",
                "attention": "Contract Compliance Department"
            },
            "body": """Dear Contract Administrator:

This letter serves as formal notice of material breach of our Provider Agreement (Contract ID: CTR-UHC-2024-FL-001) pursuant to Section 12.1.

NATURE OF BREACH:

Section 5.1 of our Agreement specifies that medical necessity determinations shall be made using InterQual criteria version 2023.1. Any updates to criteria require 60 days advance notice to the Facility.

Beginning November 1, 2024, UnitedHealthcare has applied InterQual 2024.2 criteria to observation service determinations without providing the required 60-day notice.

IMPACT:

Affected Claims: 847 observation service claims
Improper Denials: $2,100,000
Period: November 1, 2024 to present

DEMAND:

1. Immediate reprocessing of all 847 affected claims using InterQual 2023.1 criteria
2. Payment of all improperly denied claims within 30 days
3. Written confirmation of criteria version to be used going forward
4. Compliance with 60-day notice requirement for any future criteria changes

Pursuant to Section 12.2, failure to cure this breach within 30 days will result in pursuit of all available remedies, including contract termination and regulatory complaints.

Sincerely,

[CFO Name]
Chief Financial Officer
AdventHealth Orlando""",
            "attachments": [
                "List of affected claims (847 claims)",
                "Denial letters citing InterQual 2024.2",
                "Contract excerpt (Sections 5.1, 7.1, 12.1)"
            ],
            "status": "ready",
            "created_date": "2024-12-09",
            "expected_recovery": 1512000,
            "success_probability": 0.72
        }
    ]
    return letters


def generate_action_center():
    """Generate prioritized action center items."""
    actions = [
        {
            "action_id": "ACT-001",
            "priority": 1,
            "title": "Send UHC Interest Demand Letter",
            "description": "Demand $1.24M interest owed for late payments (Section 4.2)",
            "action_type": "demand_letter",
            "violation_id": "VIO-UHC-PAY-001",
            "letter_id": "LTR-UHC-INT-001",
            "payer_id": "uhc",
            "expected_recovery": 1054000,
            "success_probability": 0.85,
            "effort_hours": 2,
            "status": "ready",
            "category": "contract_warfare"
        },
        {
            "action_id": "ACT-002",
            "priority": 2,
            "title": "Send UHC Contract Violation Notice",
            "description": "Formal notice of Section 7.1 violation for criteria change without notice",
            "action_type": "violation_notice",
            "violation_id": "VIO-UHC-MN-001",
            "letter_id": "LTR-UHC-VIO-001",
            "payer_id": "uhc",
            "expected_recovery": 1512000,
            "success_probability": 0.72,
            "effort_hours": 4,
            "status": "ready",
            "category": "contract_warfare"
        },
        {
            "action_id": "ACT-003",
            "priority": 3,
            "title": "Send Humana Interest Demand Letter",
            "description": "Demand $890K interest owed for late payments (42 days vs 30 days)",
            "action_type": "demand_letter",
            "violation_id": "VIO-HUM-PAY-001",
            "letter_id": None,
            "payer_id": "humana",
            "expected_recovery": 712000,
            "success_probability": 0.80,
            "effort_hours": 2,
            "status": "ready",
            "category": "contract_warfare"
        },
        {
            "action_id": "ACT-004",
            "priority": 4,
            "title": "File CMS Complaint - UHC Criteria Change",
            "description": "File complaint for Medicare Advantage medical necessity violations",
            "action_type": "regulatory_complaint",
            "violation_id": "VIO-UHC-MN-001",
            "complaint_id": "CMP-CMS-001",
            "payer_id": "uhc",
            "expected_recovery": 500000,
            "success_probability": 0.65,
            "effort_hours": 8,
            "status": "ready",
            "category": "regulatory"
        },
        {
            "action_id": "ACT-005",
            "priority": 5,
            "title": "Bulk Appeal Top 50 High-Value Claims",
            "description": "Submit appeals for top 50 claims by expected value ($425K potential)",
            "action_type": "bulk_appeal",
            "violation_id": None,
            "payer_id": "multiple",
            "expected_recovery": 425000,
            "success_probability": 0.68,
            "effort_hours": 20,
            "status": "ready",
            "category": "appeals"
        },
        {
            "action_id": "ACT-006",
            "priority": 6,
            "title": "Prepare UHC Contract Negotiation",
            "description": "Contract expires March 2025 - prepare negotiation with $8.2M rate gap",
            "action_type": "negotiation_prep",
            "violation_id": None,
            "payer_id": "uhc",
            "expected_recovery": 8200000,
            "success_probability": 0.45,
            "effort_hours": 40,
            "status": "in_progress",
            "category": "negotiation"
        }
    ]
    return actions


def generate_policy_signals():
    """Generate detected policy change signals."""
    signals = [
        {
            "signal_id": "SIG-001",
            "payer_id": "humana",
            "signal_type": "earnings_call",
            "source": "Humana Q3 2024 Earnings Call",
            "date": "2024-10-15",
            "content": "CFO mentioned 'enhanced prior authorization for advanced imaging' as cost management initiative",
            "relevance_score": 0.85,
            "related_policy_area": "prior_authorization"
        },
        {
            "signal_id": "SIG-002",
            "payer_id": "aetna",
            "signal_type": "competitor_action",
            "source": "Aetna Provider Bulletin",
            "date": "2024-09-20",
            "content": "Aetna expanded prior auth to all outpatient MRI/CT - Humana typically follows within 45 days",
            "relevance_score": 0.78,
            "related_policy_area": "prior_authorization"
        },
        {
            "signal_id": "SIG-003",
            "payer_id": "uhc",
            "signal_type": "earnings_call",
            "source": "UHC Q3 2024 Earnings Call",
            "date": "2024-10-18",
            "content": "CEO referenced 'documentation integrity initiatives' and 'medical cost management'",
            "relevance_score": 0.72,
            "related_policy_area": "medical_necessity"
        },
        {
            "signal_id": "SIG-004",
            "payer_id": "uhc",
            "signal_type": "provider_bulletin",
            "source": "UHC Provider Bulletin 2024-42",
            "date": "2024-10-25",
            "content": "New 4-hour attestation requirement for observation services effective Jan 1, 2025",
            "relevance_score": 0.90,
            "related_policy_area": "observation"
        },
        {
            "signal_id": "SIG-005",
            "payer_id": "uhc",
            "signal_type": "criteria_update",
            "source": "InterQual Release Notes",
            "date": "2024-09-15",
            "content": "InterQual 2024.2 released - UHC historically adopts within 60 days",
            "relevance_score": 0.88,
            "related_policy_area": "medical_necessity"
        }
    ]
    return signals


def generate_policy_alerts():
    """Generate active policy change predictions."""
    alerts = [
        {
            "alert_id": "ALT-001",
            "payer_id": "humana",
            "payer_name": "Humana",
            "alert_type": "prior_auth_expansion",
            "title": "Humana Prior Auth Expansion - Advanced Imaging",
            "severity": "critical",
            "confidence": 0.82,
            "predicted_date": "2025-01-15",
            "days_until": 37,
            "potential_impact": 1500000,
            "signals": ["SIG-001", "SIG-002"],
            "description": "High probability Humana will expand prior authorization requirements to all outpatient MRI and CT scans",
            "recommended_actions": [
                "Update radiology order templates with prior auth fields",
                "Train schedulers on new requirements",
                "Prepare appeal templates for expected denials",
                "Pre-authorize high-volume imaging procedures"
            ],
            "status": "active"
        },
        {
            "alert_id": "ALT-002",
            "payer_id": "uhc",
            "payer_name": "UnitedHealthcare",
            "alert_type": "documentation_change",
            "title": "UHC Observation Documentation Requirements",
            "severity": "elevated",
            "confidence": 0.75,
            "predicted_date": "2025-01-01",
            "days_until": 23,
            "potential_impact": 800000,
            "signals": ["SIG-003", "SIG-004"],
            "description": "UHC likely to enforce stricter documentation requirements for observation services including 4-hour attestation",
            "recommended_actions": [
                "Update observation documentation templates",
                "Train case managers on 4-hour attestation requirement",
                "Implement automated documentation reminders",
                "Prepare contract violation notice if applied retroactively"
            ],
            "status": "active"
        }
    ]
    return alerts


def generate_appeal_outcomes():
    """Generate historical appeal outcomes for win rate analysis."""
    outcomes = []
    carc_codes = ["CO-4", "CO-16", "CO-50", "CO-97", "CO-197", "OA-23", "PR-1", "PR-2"]
    payers = ["uhc", "humana", "bcbs", "aetna", "cigna"]
    
    # Win rates by CARC code (realistic)
    win_rates = {
        "CO-16": 0.78,  # Missing info - easy to fix
        "CO-197": 0.68,  # Prior auth - moderate
        "OA-23": 0.52,  # Medical necessity - harder
        "CO-4": 0.35,  # Not covered - difficult
        "CO-50": 0.45,  # Non-covered service
        "CO-97": 0.62,  # Benefit max
        "PR-1": 0.25,  # Deductible - rarely overturned
        "PR-2": 0.30   # Coinsurance - rarely overturned
    }
    
    for i in range(2000):
        carc = random.choice(carc_codes)
        payer = random.choice(payers)
        amount = random.randint(500, 25000)
        won = random.random() < win_rates.get(carc, 0.50)
        
        outcomes.append({
            "appeal_id": f"APP2024{i:05d}",
            "claim_id": f"CLM2024{random.randint(10000, 99999)}",
            "payer_id": payer,
            "carc_code": carc,
            "amount": amount,
            "appeal_date": (datetime(2024, 1, 1) + timedelta(days=random.randint(0, 300))).strftime("%Y-%m-%d"),
            "resolution_date": (datetime(2024, 1, 1) + timedelta(days=random.randint(30, 330))).strftime("%Y-%m-%d"),
            "outcome": "won" if won else "lost",
            "recovered": amount if won else 0
        })
    
    return outcomes


def generate_appeal_win_rates():
    """Generate win rates by CARC code and payer."""
    win_rates = {
        "by_carc": {
            "CO-16": {"rate": 0.78, "description": "Missing/incomplete information", "recommendation": "High priority - easy fix"},
            "CO-197": {"rate": 0.68, "description": "Prior authorization required", "recommendation": "Medium priority - document auth"},
            "CO-97": {"rate": 0.62, "description": "Benefit maximum reached", "recommendation": "Medium priority - verify benefits"},
            "OA-23": {"rate": 0.52, "description": "Medical necessity", "recommendation": "Selective - strong documentation needed"},
            "CO-50": {"rate": 0.45, "description": "Non-covered service", "recommendation": "Low priority - policy review needed"},
            "CO-4": {"rate": 0.35, "description": "Not covered by plan", "recommendation": "Low priority - benefit verification"},
            "PR-2": {"rate": 0.30, "description": "Coinsurance", "recommendation": "Skip - patient responsibility"},
            "PR-1": {"rate": 0.25, "description": "Deductible", "recommendation": "Skip - patient responsibility"}
        },
        "by_payer": {
            "uhc": {"overall_rate": 0.58, "avg_days_to_resolution": 32},
            "humana": {"overall_rate": 0.55, "avg_days_to_resolution": 38},
            "bcbs": {"overall_rate": 0.62, "avg_days_to_resolution": 28},
            "aetna": {"overall_rate": 0.54, "avg_days_to_resolution": 35},
            "cigna": {"overall_rate": 0.51, "avg_days_to_resolution": 40}
        }
    }
    return win_rates


def generate_appeal_queue():
    """Generate prioritized appeal queue sorted by expected value."""
    queue = []
    carc_codes = ["CO-16", "CO-197", "OA-23", "CO-4", "CO-50"]
    payers = ["uhc", "humana", "bcbs", "aetna", "cigna"]
    
    win_rates = {
        "CO-16": 0.78,
        "CO-197": 0.68,
        "OA-23": 0.52,
        "CO-4": 0.35,
        "CO-50": 0.45
    }
    
    staff_cost_per_appeal = 45  # $45 per appeal (staff time)
    
    for i in range(500):
        carc = random.choice(carc_codes)
        payer = random.choice(payers)
        amount = random.randint(200, 15000)
        win_prob = win_rates.get(carc, 0.50) + random.uniform(-0.1, 0.1)
        win_prob = max(0.05, min(0.95, win_prob))
        expected_value = (amount * win_prob) - staff_cost_per_appeal
        
        queue.append({
            "queue_id": i + 1,
            "claim_id": f"CLM2024{random.randint(10000, 99999)}",
            "payer_id": payer,
            "carc_code": carc,
            "denial_reason": get_carc_description(carc),
            "amount": amount,
            "win_probability": round(win_prob, 2),
            "expected_value": round(expected_value, 2),
            "recommendation": "APPEAL" if expected_value > 0 else "WRITE OFF",
            "denial_date": (datetime(2024, 11, 1) + timedelta(days=random.randint(0, 30))).strftime("%Y-%m-%d"),
            "appeal_deadline": (datetime(2024, 11, 1) + timedelta(days=random.randint(45, 60))).strftime("%Y-%m-%d")
        })
    
    # Sort by expected value descending
    queue.sort(key=lambda x: x["expected_value"], reverse=True)
    
    # Update queue_id after sorting
    for i, item in enumerate(queue):
        item["queue_id"] = i + 1
    
    return queue


def get_carc_description(carc):
    descriptions = {
        "CO-16": "Missing/incomplete information",
        "CO-197": "Prior authorization required",
        "OA-23": "Medical necessity not established",
        "CO-4": "Service not covered by plan",
        "CO-50": "Non-covered service"
    }
    return descriptions.get(carc, "Unknown")


def generate_market_benchmarks():
    """Generate market benchmark rates for negotiation."""
    benchmarks = [
        {
            "service_line": "Cardiac DRG",
            "drg_codes": ["280", "281", "282"],
            "your_rate": 42000,
            "market_p25": 45000,
            "market_p50": 51000,
            "market_p75": 58000,
            "gap_to_p50": -0.18,
            "annual_volume": 1200,
            "annual_gap": 10800000
        },
        {
            "service_line": "Joint Replacement",
            "drg_codes": ["469", "470"],
            "your_rate": 35000,
            "market_p25": 38000,
            "market_p50": 44000,
            "market_p75": 52000,
            "gap_to_p50": -0.20,
            "annual_volume": 800,
            "annual_gap": 7200000
        },
        {
            "service_line": "Observation",
            "cpt_codes": ["99218", "99219", "99220"],
            "your_rate": 1800,
            "market_p25": 1900,
            "market_p50": 2100,
            "market_p75": 2400,
            "gap_to_p50": -0.14,
            "annual_volume": 5000,
            "annual_gap": 1500000
        },
        {
            "service_line": "ED Level 5",
            "cpt_codes": ["99285"],
            "your_rate": 850,
            "market_p25": 900,
            "market_p50": 1050,
            "market_p75": 1200,
            "gap_to_p50": -0.19,
            "annual_volume": 8000,
            "annual_gap": 1600000
        },
        {
            "service_line": "CT Abdomen w/Contrast",
            "cpt_codes": ["74177"],
            "your_rate": 450,
            "market_p25": 480,
            "market_p50": 520,
            "market_p75": 580,
            "gap_to_p50": -0.13,
            "annual_volume": 12000,
            "annual_gap": 840000
        },
        {
            "service_line": "MRI Brain w/Contrast",
            "cpt_codes": ["70553"],
            "your_rate": 680,
            "market_p25": 720,
            "market_p50": 800,
            "market_p75": 900,
            "gap_to_p50": -0.15,
            "annual_volume": 6000,
            "annual_gap": 720000
        },
        {
            "service_line": "Spine Surgery",
            "drg_codes": ["453", "454", "455"],
            "your_rate": 48000,
            "market_p25": 52000,
            "market_p50": 58000,
            "market_p75": 68000,
            "gap_to_p50": -0.17,
            "annual_volume": 400,
            "annual_gap": 4000000
        },
        {
            "service_line": "Bariatric Surgery",
            "cpt_codes": ["43644", "43775"],
            "your_rate": 22000,
            "market_p25": 24000,
            "market_p50": 28000,
            "market_p75": 34000,
            "gap_to_p50": -0.21,
            "annual_volume": 300,
            "annual_gap": 1800000
        },
        {
            "service_line": "Chemotherapy Admin",
            "cpt_codes": ["96413", "96415"],
            "your_rate": 280,
            "market_p25": 300,
            "market_p50": 340,
            "market_p75": 400,
            "gap_to_p50": -0.18,
            "annual_volume": 15000,
            "annual_gap": 900000
        },
        {
            "service_line": "Cardiac Cath",
            "cpt_codes": ["93458", "93459"],
            "your_rate": 3200,
            "market_p25": 3500,
            "market_p50": 4000,
            "market_p75": 4800,
            "gap_to_p50": -0.20,
            "annual_volume": 2000,
            "annual_gap": 1600000
        }
    ]
    return benchmarks


def generate_negotiation_leverage():
    """Generate leverage analysis for payer negotiations."""
    leverage = [
        {
            "payer_id": "uhc",
            "payer_name": "UnitedHealthcare",
            "contract_expiration": "2025-03-31",
            "days_until_expiration": 112,
            "leverage_score": 72,
            "leverage_rating": "Strong",
            "your_advantages": [
                {"factor": "Active contract violations", "value": "$3.34M documented", "weight": 25},
                {"factor": "Market position", "value": "#2 provider in Orlando (18% of network)", "weight": 20},
                {"factor": "Volume", "value": "12,400 annual admits ($523M revenue)", "weight": 15},
                {"factor": "Interest owed", "value": "$1.24M documented", "weight": 12}
            ],
            "their_advantages": [
                {"factor": "Revenue dependency", "value": "23% of your MA revenue", "weight": -15},
                {"factor": "Market share", "value": "34% local MA market share", "weight": -10}
            ],
            "rate_gap_annual": 8200000,
            "recommended_opening": 0.15,
            "walk_away_point": 0.08,
            "batna": "Terminate and redirect patients to Humana MA plans"
        },
        {
            "payer_id": "humana",
            "payer_name": "Humana",
            "contract_expiration": "2025-12-31",
            "days_until_expiration": 387,
            "leverage_score": 58,
            "leverage_rating": "Moderate",
            "your_advantages": [
                {"factor": "Payment velocity violations", "value": "$890K interest owed", "weight": 15},
                {"factor": "Bundling violations", "value": "$845K improper denials", "weight": 12},
                {"factor": "Market position", "value": "#3 provider in Orlando", "weight": 10}
            ],
            "their_advantages": [
                {"factor": "Revenue dependency", "value": "18% of your MA revenue", "weight": -12},
                {"factor": "Alternative providers", "value": "Multiple alternatives available", "weight": -8}
            ],
            "rate_gap_annual": 4100000,
            "recommended_opening": 0.12,
            "walk_away_point": 0.06,
            "batna": "Reduce to out-of-network, maintain emergency access"
        }
    ]
    return leverage


def generate_negotiation_playbook():
    """Generate full negotiation playbook for UHC."""
    playbook = {
        "payer_id": "uhc",
        "payer_name": "UnitedHealthcare",
        "contract_id": "CTR-UHC-2024-FL-001",
        "expiration_date": "2025-03-31",
        "generated_date": "2024-12-09",
        "executive_summary": """UnitedHealthcare contract expires March 31, 2025. You have strong leverage (72/100) due to documented contract violations worth $3.34M and your position as their #2 provider in Orlando. Market analysis shows you're being paid 18% below median rates, representing $8.2M annual gap. Recommended strategy: Lead with violation resolution, then pivot to rate increases.""",
        "leverage_analysis": {
            "score": 72,
            "rating": "Strong",
            "key_points": [
                "Two active contract violations totaling $3.34M in documented damages",
                "Interest owed of $1.24M under Section 4.2",
                "You are their #2 provider in Orlando market (18% of their network)",
                "12,400 annual admits generating $523M in revenue for them"
            ]
        },
        "rate_analysis": {
            "total_annual_gap": 8200000,
            "key_gaps": [
                {"service": "Cardiac DRG", "gap": "-18%", "annual_impact": 2160000},
                {"service": "Joint Replacement", "gap": "-20%", "annual_impact": 1800000},
                {"service": "Observation", "gap": "-14%", "annual_impact": 750000}
            ]
        },
        "negotiation_strategy": {
            "phase_1": {
                "name": "Violation Resolution",
                "timing": "Weeks 1-2",
                "actions": [
                    "Send interest demand letter ($1.24M)",
                    "Send contract violation notice (Section 7.1)",
                    "Request executive meeting to discuss resolution"
                ],
                "objective": "Establish leverage and recover immediate damages"
            },
            "phase_2": {
                "name": "Rate Negotiation",
                "timing": "Weeks 3-6",
                "actions": [
                    "Present market benchmark analysis",
                    "Propose 15% rate increase across all service lines",
                    "Offer violation settlement as part of package"
                ],
                "objective": "Secure rate increases using violation leverage"
            },
            "phase_3": {
                "name": "Final Terms",
                "timing": "Weeks 7-10",
                "actions": [
                    "Negotiate final rate structure",
                    "Secure payment velocity improvements",
                    "Document criteria notification requirements"
                ],
                "objective": "Lock in improved terms before expiration"
            }
        },
        "positions": {
            "opening": {
                "rate_increase": "15%",
                "violation_settlement": "$3.34M",
                "payment_terms": "25 days",
                "criteria_notice": "90 days"
            },
            "target": {
                "rate_increase": "12%",
                "violation_settlement": "$2.5M",
                "payment_terms": "28 days",
                "criteria_notice": "60 days"
            },
            "walk_away": {
                "rate_increase": "8%",
                "violation_settlement": "$1.5M",
                "payment_terms": "30 days",
                "criteria_notice": "45 days"
            }
        },
        "batna": {
            "description": "Terminate contract and redirect patients to Humana MA plans",
            "feasibility": "Moderate - would require patient communication and referral network adjustments",
            "financial_impact": "Short-term revenue loss of ~$120M, offset by improved rates with other payers",
            "timeline": "90-day notice required per Section 8.3"
        },
        "talking_points": [
            "We've documented $3.34M in contract violations that we're prepared to pursue through regulatory channels",
            "Our market analysis shows we're being paid 18% below median rates for cardiac services",
            "As your #2 provider in Orlando, we're essential to your network adequacy",
            "We're prepared to work collaboratively, but we need to see meaningful improvement in rates and compliance"
        ]
    }
    return playbook


def generate_regulatory_violations():
    """Generate detected regulatory violations."""
    violations = [
        {
            "reg_violation_id": "REG-UHC-001",
            "payer_id": "uhc",
            "payer_name": "UnitedHealthcare",
            "regulation": "CMS Medicare Advantage Medical Necessity Guidelines",
            "regulation_code": "42 CFR 422.101",
            "violation_type": "medical_necessity_criteria",
            "description": "Application of stricter medical necessity criteria than permitted under Medicare Advantage regulations",
            "evidence": [
                "847 observation denials using non-contracted InterQual version",
                "Denial rate 34% higher than Medicare FFS for same services",
                "No advance notice of criteria change as required"
            ],
            "affected_claims": 847,
            "financial_impact": 2100000,
            "detection_date": "2024-11-20",
            "status": "documented",
            "recommended_action": "File CMS complaint",
            "complaint_id": "CMP-CMS-001"
        },
        {
            "reg_violation_id": "REG-UHC-002",
            "payer_id": "uhc",
            "payer_name": "UnitedHealthcare",
            "regulation": "Florida Insurance Code - Prompt Payment",
            "regulation_code": "FL Statute 627.6131",
            "violation_type": "payment_timing",
            "description": "Systematic failure to pay clean claims within statutory timeframe",
            "evidence": [
                "Average payment time 38 days (statute requires 30 days)",
                "4,247 claims paid late",
                "Pattern of delay across multiple months"
            ],
            "affected_claims": 4247,
            "financial_impact": 1240000,
            "detection_date": "2024-11-15",
            "status": "documented",
            "recommended_action": "File Florida OIR complaint",
            "complaint_id": "CMP-FL-001"
        },
        {
            "reg_violation_id": "REG-HUM-001",
            "payer_id": "humana",
            "payer_name": "Humana",
            "regulation": "Florida Insurance Code - Prompt Payment",
            "regulation_code": "FL Statute 627.6131",
            "violation_type": "payment_timing",
            "description": "Systematic failure to pay clean claims within statutory timeframe",
            "evidence": [
                "Average payment time 42 days (statute requires 30 days)",
                "2,891 claims paid late",
                "Consistent pattern over 6 months"
            ],
            "affected_claims": 2891,
            "financial_impact": 890000,
            "detection_date": "2024-11-10",
            "status": "documented",
            "recommended_action": "File Florida OIR complaint",
            "complaint_id": "CMP-FL-002"
        }
    ]
    return violations


def generate_complaint_templates():
    """Generate pre-filled regulatory complaint templates."""
    complaints = [
        {
            "complaint_id": "CMP-CMS-001",
            "reg_violation_id": "REG-UHC-001",
            "payer_id": "uhc",
            "payer_name": "UnitedHealthcare",
            "complaint_type": "CMS Medicare Advantage",
            "agency": "Centers for Medicare & Medicaid Services",
            "filing_address": "CMS Regional Office, Atlanta, GA",
            "subject": "Complaint Regarding Medicare Advantage Medical Necessity Determinations",
            "body": """COMPLAINT TO CENTERS FOR MEDICARE & MEDICAID SERVICES

Complainant: AdventHealth Orlando
Address: 601 E Rollins St, Orlando, FL 32803
Contact: [CFO Name], Chief Financial Officer

Respondent: UnitedHealthcare Insurance Company
Medicare Advantage Contract: H0028

NATURE OF COMPLAINT:

UnitedHealthcare is applying medical necessity criteria that are more restrictive than those permitted under Medicare Advantage regulations, resulting in improper denials of medically necessary services.

FACTUAL BACKGROUND:

1. Our provider agreement (CTR-UHC-2024-FL-001) specifies that medical necessity determinations shall be made using InterQual criteria version 2023.1.

2. Beginning November 1, 2024, UnitedHealthcare began applying InterQual 2024.2 criteria without providing the required 60-day advance notice.

3. The 2024.2 criteria are more restrictive than the contracted 2023.1 version, resulting in denials that would have been approved under the contracted criteria.

IMPACT:

- Affected Claims: 847 observation service claims
- Improper Denials: $2,100,000
- Affected Period: November 1, 2024 to present
- Denial Rate Increase: 34% higher than Medicare FFS for same services

REGULATORY VIOLATIONS:

1. 42 CFR 422.101 - Coverage of Medicare Advantage benefits
2. 42 CFR 422.504 - Contract provisions requiring compliance with Medicare coverage rules
3. Medicare Managed Care Manual, Chapter 4 - Medical necessity determination requirements

REQUESTED RELIEF:

1. Investigation of UnitedHealthcare's medical necessity determination practices
2. Order requiring reprocessing of all affected claims using contracted criteria
3. Civil monetary penalties for pattern of improper denials
4. Corrective action plan to prevent future violations

ATTACHMENTS:

1. List of affected claims (847 claims)
2. Sample denial letters citing InterQual 2024.2
3. Provider agreement excerpt (Section 5.1)
4. Comparison of 2023.1 vs 2024.2 criteria for observation services

Respectfully submitted,

[CFO Name]
Chief Financial Officer
AdventHealth Orlando""",
            "attachments": [
                "List of affected claims",
                "Sample denial letters",
                "Provider agreement excerpt",
                "Criteria comparison analysis"
            ],
            "status": "ready",
            "estimated_resolution_days": 90,
            "expected_outcome": "Settlement or corrective action",
            "success_probability": 0.65
        },
        {
            "complaint_id": "CMP-FL-001",
            "reg_violation_id": "REG-UHC-002",
            "payer_id": "uhc",
            "payer_name": "UnitedHealthcare",
            "complaint_type": "Florida OIR",
            "agency": "Florida Office of Insurance Regulation",
            "filing_address": "200 E Gaines St, Tallahassee, FL 32399",
            "subject": "Complaint Regarding Violation of Prompt Payment Requirements",
            "body": """COMPLAINT TO FLORIDA OFFICE OF INSURANCE REGULATION

Complainant: AdventHealth Orlando
Address: 601 E Rollins St, Orlando, FL 32803
License Number: [Hospital License]

Respondent: UnitedHealthcare Insurance Company
Florida License Number: [UHC License]

NATURE OF COMPLAINT:

UnitedHealthcare has systematically failed to comply with Florida's prompt payment requirements under Florida Statute 627.6131, resulting in significant financial harm to our facility.

FACTUAL BACKGROUND:

1. Florida Statute 627.6131 requires health insurers to pay clean claims within 30 days of receipt.

2. Our analysis of claims submitted between September 1, 2024 and November 30, 2024 shows:
   - Average payment time: 38 days
   - Claims paid after 30 days: 4,247
   - Total principal paid late: $12,400,000

3. This pattern of late payment has been consistent across multiple months, indicating a systematic compliance failure.

STATUTORY VIOLATIONS:

Florida Statute 627.6131(2)(a): "A health insurer shall pay or deny a claim... within 30 days after receipt of the claim."

Florida Statute 627.6131(4): Provides for interest on late-paid claims.

FINANCIAL IMPACT:

- Late-Paid Claims: 4,247
- Total Principal: $12,400,000
- Interest Owed (12% annually): $1,240,000
- Period: September 1, 2024 - November 30, 2024

REQUESTED RELIEF:

1. Investigation of UnitedHealthcare's claims payment practices
2. Order requiring payment of accrued interest ($1,240,000)
3. Administrative penalties for pattern of violations
4. Corrective action plan with monitoring

ATTACHMENTS:

1. Claims analysis spreadsheet (4,247 claims)
2. Interest calculation detail
3. Provider agreement excerpt (Sections 4.1, 4.2)
4. Sample remittance advices showing late payment

Respectfully submitted,

[CFO Name]
Chief Financial Officer
AdventHealth Orlando""",
            "attachments": [
                "Claims analysis spreadsheet",
                "Interest calculation detail",
                "Provider agreement excerpt",
                "Sample remittance advices"
            ],
            "status": "ready",
            "estimated_resolution_days": 60,
            "expected_outcome": "Interest payment and corrective action",
            "success_probability": 0.75
        }
    ]
    return complaints


def main():
    """Generate all warfare data files."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Generate all data
    data_files = {
        "contract_violations.json": generate_contract_violations(),
        "interest_calculations.json": generate_interest_calculations(),
        "demand_letters.json": generate_demand_letters(),
        "action_center.json": generate_action_center(),
        "policy_signals.json": generate_policy_signals(),
        "policy_alerts.json": generate_policy_alerts(),
        "appeal_outcomes.json": generate_appeal_outcomes(),
        "appeal_win_rates.json": generate_appeal_win_rates(),
        "appeal_queue.json": generate_appeal_queue(),
        "market_benchmarks.json": generate_market_benchmarks(),
        "negotiation_leverage.json": generate_negotiation_leverage(),
        "negotiation_playbook.json": generate_negotiation_playbook(),
        "regulatory_violations.json": generate_regulatory_violations(),
        "complaint_templates.json": generate_complaint_templates()
    }
    
    # Write all files
    for filename, data in data_files.items():
        filepath = os.path.join(OUTPUT_DIR, filename)
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"Generated {filepath}")
    
    # Print summary
    print("\n=== Warfare Data Generation Complete ===")
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Files generated: {len(data_files)}")
    
    # Calculate totals
    actions = data_files["action_center.json"]
    total_recoverable = sum(a["expected_recovery"] for a in actions)
    print(f"\nTotal Recoverable Value: ${total_recoverable:,.0f}")
    print(f"Actions Ready: {len([a for a in actions if a['status'] == 'ready'])}")


if __name__ == "__main__":
    main()
