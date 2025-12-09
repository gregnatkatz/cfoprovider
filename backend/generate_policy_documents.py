#!/usr/bin/env python3
"""
Payer Policy & Contract Document Generator for RAG
===================================================
Generates detailed policy documents, contract terms, medical policies,
and denial management guides for the CFO Payer Intelligence RAG system.

This creates realistic healthcare payer documentation that can be:
1. Chunked and embedded for vector search
2. Used to build a knowledge graph
3. Referenced by the AI assistant for policy explanations

Usage:
    python generate_policy_documents.py --output ./policy_docs --format all

Requirements:
    pip install pandas numpy faker markdown --break-system-packages

Author: Devin AI Assistant
For: AdventHealth CFO Payer Intelligence Platform - RAG Component
"""

import argparse
import json
import os
import random
from datetime import datetime, timedelta
from typing import Dict, List
import hashlib

import pandas as pd
import numpy as np
from faker import Faker

fake = Faker()
Faker.seed(42)
random.seed(42)

# =============================================================================
# PAYER CONFIGURATION
# =============================================================================

PAYERS = {
    "uhc": {
        "name": "UnitedHealthcare",
        "legal_name": "UnitedHealthcare Insurance Company",
        "plan_types": ["Medicare Advantage", "Commercial", "Medicaid"],
        "region": "Florida",
        "contact": {
            "provider_services": "1-877-842-3210",
            "claims": "1-800-624-8822",
            "prior_auth": "1-866-752-7021",
            "appeals": "1-888-936-7246"
        },
        "portal": "https://www.uhcprovider.com",
        "edi_payer_id": "87726"
    },
    "humana": {
        "name": "Humana",
        "legal_name": "Humana Insurance Company",
        "plan_types": ["Medicare Advantage", "Commercial"],
        "region": "Florida",
        "contact": {
            "provider_services": "1-800-448-6262",
            "claims": "1-800-457-4708",
            "prior_auth": "1-800-523-0023",
            "appeals": "1-800-457-4708"
        },
        "portal": "https://www.humana.com/provider",
        "edi_payer_id": "61101"
    },
    "bcbs": {
        "name": "Florida Blue",
        "legal_name": "Blue Cross and Blue Shield of Florida, Inc.",
        "plan_types": ["Commercial", "Medicare Advantage", "ACA"],
        "region": "Florida",
        "contact": {
            "provider_services": "1-800-727-2227",
            "claims": "1-800-727-2227",
            "prior_auth": "1-800-727-2227",
            "appeals": "1-800-727-2227"
        },
        "portal": "https://www.floridablue.com/providers",
        "edi_payer_id": "00590"
    },
    "aetna": {
        "name": "Aetna",
        "legal_name": "Aetna Life Insurance Company",
        "plan_types": ["Commercial", "Medicare Advantage"],
        "region": "National",
        "contact": {
            "provider_services": "1-800-624-0756",
            "claims": "1-888-632-3862",
            "prior_auth": "1-800-624-0756",
            "appeals": "1-888-632-3862"
        },
        "portal": "https://www.availity.com",
        "edi_payer_id": "60054"
    },
    "cigna": {
        "name": "Cigna",
        "legal_name": "Cigna Health and Life Insurance Company",
        "plan_types": ["Commercial", "Medicare Advantage"],
        "region": "National",
        "contact": {
            "provider_services": "1-800-244-6224",
            "claims": "1-800-244-6224",
            "prior_auth": "1-800-244-6224",
            "appeals": "1-800-244-6224"
        },
        "portal": "https://www.cignaforhcp.com",
        "edi_payer_id": "62308"
    },
    "medicare": {
        "name": "Medicare",
        "legal_name": "Centers for Medicare & Medicaid Services",
        "plan_types": ["Medicare FFS"],
        "region": "National",
        "contact": {
            "provider_services": "1-800-633-4227",
            "claims": "1-800-633-4227",
            "prior_auth": "N/A",
            "appeals": "1-800-633-4227"
        },
        "portal": "https://www.cms.gov",
        "edi_payer_id": "00308"
    }
}


# =============================================================================
# MEDICAL POLICY DOCUMENTS
# =============================================================================

def generate_medical_policies() -> List[Dict]:
    """Generate detailed medical policy documents for each payer (20+ documents)."""
    
    policies = []
    
    # ==========================================================================
    # UNITEDHEALTHCARE POLICIES (6 policies)
    # ==========================================================================
    
    uhc_policies = [
        {
            "policy_id": "UHC-OBS-2024-001",
            "payer_id": "uhc",
            "payer_name": "UnitedHealthcare",
            "policy_type": "Medical Necessity",
            "title": "Observation Services Medical Necessity Criteria",
            "effective_date": "2024-11-01",
            "last_updated": "2024-10-15",
            "version": "2024.2",
            "status": "Active",
            "summary": "Defines medical necessity criteria for observation services billing",
            "full_text": """
# UnitedHealthcare Medical Policy: Observation Services

## Policy Number: UHC-OBS-2024-001
## Effective Date: November 1, 2024
## Last Review: October 15, 2024

### 1. PURPOSE

This policy establishes medical necessity criteria for observation services (CPT codes 99218-99226) for UnitedHealthcare Medicare Advantage members in Florida.

### 2. DEFINITIONS

**Observation Services**: Hospital outpatient services furnished to determine whether the patient needs to be admitted as an inpatient or can be safely discharged.

**Observation Status**: A well-defined set of specific, clinically appropriate services, which include ongoing short-term treatment, assessment, and reassessment.

### 3. MEDICAL NECESSITY CRITERIA

Observation services are considered medically necessary when ALL of the following criteria are met:

#### 3.1 Clinical Criteria (InterQual 2024.2)

The patient must meet ONE of the following clinical thresholds:

a) **Cardiovascular**
   - Chest pain with negative initial troponin requiring serial monitoring
   - New onset atrial fibrillation with controlled rate
   - Syncope requiring cardiac monitoring
   - Heart failure exacerbation with BNP < 500 pg/mL

b) **Respiratory**
   - Asthma exacerbation with peak flow 40-70% predicted after treatment
   - COPD exacerbation requiring frequent nebulizer treatments
   - Pneumonia with CURB-65 score of 0-1

c) **Gastrointestinal**
   - Abdominal pain requiring serial examinations
   - Dehydration requiring IV fluid resuscitation
   - GI bleeding with hemoglobin > 10 g/dL and stable vitals

d) **Neurological**
   - TIA with ABCD2 score < 4
   - Seizure in known epileptic, post-ictal

#### 3.2 Documentation Requirements

**CRITICAL: Effective November 1, 2024, the following documentation requirements apply:**

1. **Physician Attestation**: The attending physician must document observation status decision within **4 hours** of patient presentation.

2. **24-Hour Threshold**: 
   - Observation services must be expected to last less than 24 hours
   - If observation extends beyond 24 hours, inpatient admission must be reconsidered
   - Documentation must include clinical rationale if observation exceeds 24 hours

3. **Condition-Specific Documentation**:
   - Primary diagnosis with ICD-10 code
   - Clinical indicators supporting observation vs. inpatient
   - Expected duration of observation
   - Criteria for discharge or admission conversion

4. **Reassessment Requirements**:
   - Clinical reassessment documented every 8 hours minimum
   - Each reassessment must include continued observation justification

### 4. BILLING REQUIREMENTS

#### 4.1 Covered CPT Codes
- 99218: Initial observation care, low severity
- 99219: Initial observation care, moderate severity  
- 99220: Initial observation care, high severity
- 99224: Subsequent observation care, problem focused
- 99225: Subsequent observation care, expanded
- 99226: Subsequent observation care, detailed

#### 4.2 Time-Based Billing
- Initial observation: Bill based on medical decision-making complexity
- Subsequent observation: Bill once per calendar day
- Same-day admit/discharge: Use 99234-99236

#### 4.3 Facility Fees
- Observation room and board: Revenue code 0762
- Hourly observation: Revenue code 0760

### 5. PRIOR AUTHORIZATION

Prior authorization is **NOT** required for initial observation placement.

Prior authorization **IS** required for:
- Observation extending beyond 48 hours
- Observation for procedures not meeting criteria
- Repeat observation within 72 hours of discharge

### 6. CLAIM SUBMISSION

Claims must be submitted within 90 days of service date.

Required claim elements:
- Condition code 44 (if inpatient changed to outpatient)
- Occurrence span code 72 with observation hours
- Principal diagnosis supporting observation criteria

### 7. DENIAL AND APPEAL PROCESS

Claims not meeting the above criteria will be denied with:
- CARC CO-50: Non-covered service
- CARC OA-23: Medical necessity not established
- RARC N386: Missing/incomplete documentation

Appeals must be filed within 60 days including:
- Detailed clinical notes
- Physician attestation with timestamp
- InterQual criteria met documentation

### 8. POLICY CHANGES FROM PRIOR VERSION

**Changes effective November 1, 2024:**

| Element | Previous (2023.1) | Current (2024.2) |
|---------|-------------------|------------------|
| InterQual Version | 2023.1 | 2024.2 |
| Physician Attestation | 8 hours | 4 hours |
| 24-hour documentation | Recommended | Required |
| Reassessment frequency | 12 hours | 8 hours |

### 9. CONTACT INFORMATION

Medical Policy Questions: 1-866-752-7021
Clinical Review: 1-877-842-3210
Appeals: 1-888-936-7246

---
*This policy is proprietary to UnitedHealthcare. Provider compliance is required per participation agreement.*
""",
            "applicable_cpt_codes": ["99218", "99219", "99220", "99224", "99225", "99226"],
            "applicable_icd10_codes": ["R07.9", "I48.91", "R55", "J44.1", "J18.9", "K92.2"],
            "interqual_version": "2024.2",
            "prior_auth_required": False,
            "tags": ["observation", "medical necessity", "interqual", "documentation", "attestation"]
        },
        {
            "policy_id": "UHC-PA-2024-001",
            "payer_id": "uhc",
            "payer_name": "UnitedHealthcare",
            "policy_type": "Prior Authorization",
            "title": "Advanced Imaging Prior Authorization Requirements",
            "effective_date": "2024-10-15",
            "last_updated": "2024-10-01",
            "version": "2024.4",
            "status": "Active",
            "summary": "Prior authorization requirements for CT, MRI, and PET imaging",
            "full_text": """
# UnitedHealthcare Prior Authorization Policy: Advanced Imaging

## Policy Number: UHC-PA-2024-001
## Effective Date: October 15, 2024

### 1. SCOPE

This policy applies to the following advanced imaging procedures:

**Computed Tomography (CT)**
- 70450-70498: Head/Brain CT
- 71250-71275: Chest CT
- 74150-74178: Abdomen/Pelvis CT

**Magnetic Resonance Imaging (MRI)**
- 70551-70559: Brain MRI
- 72141-72158: Spine MRI
- 73718-73723: Lower Extremity MRI

**Positron Emission Tomography (PET)**
- 78811-78816: PET imaging

### 2. PRIOR AUTHORIZATION REQUIREMENTS

#### 2.1 Services Requiring Prior Authorization

Effective October 15, 2024, prior authorization is REQUIRED for:

| Service Category | CPT Range | Auth Required |
|-----------------|-----------|---------------|
| CT Head | 70450-70498 | Yes - all |
| CT Chest | 71250-71275 | Yes - all |
| CT Abdomen/Pelvis | 74150-74178 | Yes - all |
| MRI Brain | 70551-70559 | Yes - all |
| MRI Spine | 72141-72158 | Yes - all |
| MRI Extremity | 73718-73723 | Yes - w/contrast only |
| PET | 78811-78816 | Yes - all |

#### 2.2 Exemptions

Prior authorization is NOT required for:
- Emergency department imaging (ED place of service)
- Inpatient imaging
- Post-operative imaging within 90 days of surgery
- Imaging ordered by oncologist for active cancer treatment

### 3. AUTHORIZATION PROCESS

#### 3.1 Submission Methods
- Online: UHCProvider.com/priorauth
- Phone: 1-866-752-7021
- Fax: 1-866-560-8293

#### 3.2 Required Information
1. Member ID and demographics
2. Ordering physician NPI
3. Rendering facility NPI
4. CPT code(s) requested
5. ICD-10 diagnosis code(s)
6. Clinical documentation supporting medical necessity
7. Previous conservative treatment attempts

#### 3.3 Turnaround Times
- Urgent: 24 hours
- Routine: 3-5 business days
- Retrospective: 30 days

### 4. MEDICAL NECESSITY CRITERIA

Authorization will be granted when clinical documentation demonstrates:

**CT Imaging**
- Suspected acute condition (fracture, hemorrhage, obstruction)
- Staging/restaging of malignancy
- Follow-up of known abnormality
- Pre-surgical planning

**MRI Imaging**
- Soft tissue evaluation not adequately assessed by CT
- Neurological symptoms requiring detailed evaluation
- Joint pathology assessment
- Contraindication to CT contrast

**PET Imaging**
- Initial staging of confirmed malignancy
- Restaging after treatment
- Evaluation of suspected recurrence
- Solitary pulmonary nodule characterization

### 5. DENIAL REASONS

Common denial reasons include:
- CO-197: Prior authorization not obtained
- CO-204: Service not authorized for date of service
- RARC N527: Medical necessity not established

### 6. APPEALS

If authorization is denied:
1. Peer-to-peer review available within 5 business days
2. Written appeal within 60 days
3. External review available for Medicare Advantage members

---
*UnitedHealthcare reserves the right to modify this policy with 30 days notice.*
""",
            "applicable_cpt_codes": ["70450", "70553", "71250", "71260", "74177", "78815"],
            "applicable_icd10_codes": [],
            "interqual_version": "N/A",
            "prior_auth_required": True,
            "tags": ["prior authorization", "imaging", "CT", "MRI", "PET", "radiology"]
        },
        {
            "policy_id": "UHC-PAY-2024-001",
            "payer_id": "uhc",
            "payer_name": "UnitedHealthcare",
            "policy_type": "Payment Policy",
            "title": "Clean Claim Payment Terms",
            "effective_date": "2024-01-01",
            "last_updated": "2024-01-01",
            "version": "2024.1",
            "status": "Active",
            "summary": "Payment terms and timely filing requirements",
            "full_text": """
# UnitedHealthcare Payment Policy: Clean Claim Terms

## Policy Number: UHC-PAY-2024-001
## Effective Date: January 1, 2024

### 1. CLEAN CLAIM DEFINITION

A clean claim is a claim that:
- Is submitted on the appropriate form (CMS-1500 or UB-04)
- Contains all required data elements
- Has no defect, impropriety, or circumstance requiring special treatment

### 2. PAYMENT TIMEFRAMES

#### 2.1 Electronic Claims
- Clean claims: Payment within **30 calendar days**
- Claims requiring review: 45 calendar days
- Complex claims: 60 calendar days

#### 2.2 Paper Claims  
- Clean claims: Payment within **45 calendar days**
- Claims requiring review: 60 calendar days

### 3. INTEREST ON LATE PAYMENTS

Per Florida Statute 627.6131:
- Interest accrues at 12% per annum on claims paid after deadline
- Interest calculated from 31st day (electronic) or 46th day (paper)
- Provider must request interest payment in writing

### 4. TIMELY FILING REQUIREMENTS

| Claim Type | Filing Deadline |
|------------|-----------------|
| Initial claim | 90 days from DOS |
| Corrected claim | 90 days from initial denial |
| Appeal | 60 days from denial notice |
| Coordination of benefits | 90 days from primary EOB |

### 5. REQUIRED CLAIM ELEMENTS

**Professional Claims (CMS-1500)**
- Patient name, DOB, member ID
- Provider name, NPI, tax ID
- Date of service
- Place of service code
- CPT/HCPCS codes with modifiers
- ICD-10 diagnosis codes
- Billed charges

**Institutional Claims (UB-04)**
- All professional claim elements plus:
- Type of bill
- Revenue codes
- Admission/discharge dates (if applicable)
- Condition codes
- Occurrence codes/spans

### 6. CLAIM STATUS INQUIRY

Check claim status via:
- UHCProvider.com
- EDI 276/277 transaction
- Phone: 1-800-624-8822

---
*Payment terms subject to provider contract. Contact your Provider Relations representative for contract-specific terms.*
""",
            "applicable_cpt_codes": [],
            "applicable_icd10_codes": [],
            "interqual_version": "N/A",
            "prior_auth_required": False,
            "tags": ["payment", "clean claim", "timely filing", "interest"]
        }
    ]
    
    # Additional UHC Policies
    uhc_policies.extend([
        {
            "policy_id": "UHC-INP-2024-001",
            "payer_id": "uhc",
            "payer_name": "UnitedHealthcare",
            "policy_type": "Medical Necessity",
            "title": "Inpatient Admission Criteria - Acute Care",
            "effective_date": "2024-01-01",
            "last_updated": "2024-06-15",
            "version": "2024.2",
            "status": "Active",
            "summary": "InterQual-based criteria for acute inpatient admissions",
            "full_text": """
# UnitedHealthcare Medical Policy: Inpatient Admission Criteria

## Policy Number: UHC-INP-2024-001
## Effective Date: January 1, 2024

### 1. PURPOSE

This policy establishes medical necessity criteria for acute inpatient hospital admissions for UnitedHealthcare Medicare Advantage and Commercial members.

### 2. CRITERIA SOURCE

UnitedHealthcare utilizes InterQual® Acute Care criteria (version 2024.2) for inpatient admission determinations.

### 3. ADMISSION CRITERIA

#### 3.1 Severity of Illness (SI)

Patient must demonstrate ONE of the following:
- Vital sign instability requiring continuous monitoring
- Acute change in mental status
- Lab values indicating organ dysfunction
- Acute respiratory failure or distress
- Hemodynamic instability
- Active bleeding requiring intervention
- Acute neurological deficit

#### 3.2 Intensity of Service (IS)

Treatment plan must include ONE of the following:
- IV medications requiring titration or monitoring
- Continuous cardiac monitoring
- Respiratory therapy every 4 hours or more
- Wound care requiring sterile technique
- Surgical intervention within 24 hours
- Blood transfusion
- Intensive nursing (q2h assessments)

### 4. DOCUMENTATION REQUIREMENTS

#### 4.1 Required Elements

1. **History and Physical (H&P)**
   - Must be completed within 24 hours of admission
   - Must document SI and IS criteria met
   - Must include admission diagnosis with ICD-10

2. **Physician Orders**
   - Admit order with level of care
   - Monitoring requirements
   - Treatment plan

3. **Progress Notes**
   - Daily documentation of continued need
   - Response to treatment
   - Discharge planning

#### 4.2 Certification Requirements

- Initial certification: Within 24 hours of admission
- Continued stay review: Day 3, then every 2-3 days
- Physician attestation required for stays >7 days

### 5. LEVEL OF CARE DETERMINATIONS

| Level | Criteria | Examples |
|-------|----------|----------|
| ICU | Critical illness, ventilator, vasopressors | Septic shock, respiratory failure |
| Stepdown | Telemetry, frequent monitoring | Post-MI, arrhythmia |
| Med/Surg | General acute care | Pneumonia, CHF exacerbation |
| Observation | <24 hour expected | Chest pain r/o MI |

### 6. NOTIFICATION REQUIREMENTS

**Emergent Admissions**
- Notify within 24 hours of admission
- Phone: 1-877-842-3210
- Fax: 1-866-560-8283

**Elective Admissions**
- Prior authorization required
- Submit 5 business days in advance

### 7. CONCURRENT REVIEW

UHC conducts concurrent review on:
- All admissions exceeding geometric mean LOS
- High-cost DRGs
- Readmissions within 30 days
- Transfers from other facilities

### 8. DENIAL REASONS

Common denial codes:
- OA-23: Does not meet SI/IS criteria
- CO-50: Level of care not appropriate
- CO-204: Not authorized for admission date

### 9. APPEALS

1. Peer-to-peer: Within 10 business days
2. Written appeal: Within 60 days
3. External review: Available for MA members

---
*InterQual is a registered trademark of Change Healthcare.*
""",
            "applicable_cpt_codes": ["99221", "99222", "99223", "99231", "99232", "99233", "99238", "99239"],
            "applicable_icd10_codes": ["J18.9", "I50.9", "N17.9", "J96.00", "I21.3", "K92.2"],
            "interqual_version": "2024.2",
            "prior_auth_required": False,
            "tags": ["inpatient", "admission", "medical necessity", "interqual", "acute care"]
        },
        {
            "policy_id": "UHC-SURG-2024-001",
            "payer_id": "uhc",
            "payer_name": "UnitedHealthcare",
            "policy_type": "Prior Authorization",
            "title": "Elective Surgery Prior Authorization Requirements",
            "effective_date": "2024-01-01",
            "last_updated": "2024-09-01",
            "version": "2024.3",
            "status": "Active",
            "summary": "Prior authorization requirements for elective surgical procedures",
            "full_text": """
# UnitedHealthcare Prior Authorization: Elective Surgery

## Policy Number: UHC-SURG-2024-001
## Effective Date: January 1, 2024

### 1. SCOPE

This policy applies to elective (non-emergent) surgical procedures performed in:
- Inpatient hospital setting
- Ambulatory Surgery Centers (ASC)
- Hospital Outpatient Departments (HOPD)

### 2. PROCEDURES REQUIRING PRIOR AUTHORIZATION

#### 2.1 Orthopedic Surgery
| CPT Code | Description | Auth Required |
|----------|-------------|---------------|
| 27447 | Total knee arthroplasty | Yes |
| 27130 | Total hip arthroplasty | Yes |
| 23472 | Total shoulder arthroplasty | Yes |
| 22612 | Lumbar fusion | Yes |
| 29881 | Knee arthroscopy with meniscectomy | Yes - if bilateral |

#### 2.2 Cardiac Surgery
| CPT Code | Description | Auth Required |
|----------|-------------|---------------|
| 33533 | CABG, arterial | Yes |
| 33405 | Aortic valve replacement | Yes |
| 33430 | Mitral valve replacement | Yes |
| 92928 | PCI with stent | No - emergent exempt |

#### 2.3 General Surgery
| CPT Code | Description | Auth Required |
|----------|-------------|---------------|
| 43644 | Laparoscopic gastric bypass | Yes |
| 43775 | Sleeve gastrectomy | Yes |
| 47562 | Laparoscopic cholecystectomy | No |
| 44970 | Laparoscopic appendectomy | No - emergent |

#### 2.4 Spine Surgery
| CPT Code | Description | Auth Required |
|----------|-------------|---------------|
| 22551 | Cervical fusion | Yes |
| 22612 | Lumbar fusion | Yes |
| 63030 | Lumbar laminectomy | Yes |
| 22558 | Lumbar interbody fusion | Yes |

### 3. EXEMPTIONS

Prior authorization NOT required for:
- Emergency surgery (life/limb threatening)
- Surgery during authorized inpatient stay
- Cancer-related surgery ordered by oncologist
- Obstetric procedures

### 4. AUTHORIZATION PROCESS

#### 4.1 Submission Timeline
- Submit at least 5 business days before scheduled procedure
- Urgent: 72-hour turnaround available

#### 4.2 Required Documentation
1. Physician order/recommendation
2. Relevant diagnostic imaging reports
3. Conservative treatment history (when applicable)
4. Medical records supporting necessity
5. Procedure-specific clinical criteria

#### 4.3 Submission Methods
- Online: UHCProvider.com/priorauth
- Phone: 1-866-752-7021
- Fax: 1-866-560-8293

### 5. CLINICAL CRITERIA

#### 5.1 Total Joint Replacement
Authorization granted when:
- BMI < 40 (or documented weight loss program)
- Failed 6 months conservative treatment
- Functional limitation documented
- X-ray showing bone-on-bone or severe OA

#### 5.2 Spine Surgery
Authorization granted when:
- Failed 6-12 weeks conservative treatment
- MRI/CT showing correlating pathology
- Neurological deficit documented
- Pain affecting daily function

#### 5.3 Bariatric Surgery
Authorization granted when:
- BMI ≥ 40, or BMI ≥ 35 with comorbidity
- Failed supervised diet program
- Psychological clearance
- No active substance abuse

### 6. DETERMINATION TIMEFRAMES

| Request Type | Turnaround |
|--------------|------------|
| Standard | 5 business days |
| Urgent | 72 hours |
| Retrospective | 30 days |

### 7. DENIAL AND APPEALS

If denied:
- Peer-to-peer review available
- Written appeal within 60 days
- Include additional clinical documentation

Common denial reasons:
- CO-197: Prior auth not obtained
- OA-23: Does not meet clinical criteria
- CO-50: Not covered procedure

---
*Prior authorization does not guarantee payment. Coverage subject to member eligibility and benefit verification.*
""",
            "applicable_cpt_codes": ["27447", "27130", "23472", "22612", "33533", "43644", "43775", "22551", "63030"],
            "applicable_icd10_codes": ["M17.11", "M16.11", "M47.816", "E66.01"],
            "interqual_version": "N/A",
            "prior_auth_required": True,
            "tags": ["prior authorization", "surgery", "elective", "orthopedic", "spine", "bariatric"]
        },
        {
            "policy_id": "UHC-DME-2024-001",
            "payer_id": "uhc",
            "payer_name": "UnitedHealthcare",
            "policy_type": "Coverage Policy",
            "title": "Durable Medical Equipment Coverage and Authorization",
            "effective_date": "2024-01-01",
            "last_updated": "2024-07-01",
            "version": "2024.2",
            "status": "Active",
            "summary": "Coverage criteria and prior authorization for DME items",
            "full_text": """
# UnitedHealthcare Coverage Policy: Durable Medical Equipment (DME)

## Policy Number: UHC-DME-2024-001
## Effective Date: January 1, 2024

### 1. DEFINITION

Durable Medical Equipment (DME) is equipment that:
- Can withstand repeated use
- Is primarily for medical purpose
- Is not useful in absence of illness/injury
- Is appropriate for home use

### 2. COVERED DME CATEGORIES

#### 2.1 Mobility Equipment
- Wheelchairs (manual and power)
- Walkers and rollators
- Canes and crutches
- Scooters (with medical necessity)

#### 2.2 Respiratory Equipment
- CPAP/BiPAP devices
- Oxygen concentrators
- Nebulizers
- Ventilators

#### 2.3 Hospital Beds and Accessories
- Hospital beds
- Pressure-reducing mattresses
- Bed rails
- Trapeze bars

#### 2.4 Other DME
- Glucose monitors
- Infusion pumps
- Wound VAC therapy
- TENS units

### 3. PRIOR AUTHORIZATION REQUIREMENTS

#### 3.1 Items Requiring Prior Auth
| Category | HCPCS Range | Auth Required |
|----------|-------------|---------------|
| Power wheelchairs | K0856-K0864 | Yes |
| Hospital beds | E0250-E0373 | Yes - if motorized |
| CPAP/BiPAP | E0601, E0470 | Yes |
| Oxygen | E0424-E0444 | Yes |
| Wound VAC | E2402 | Yes |

#### 3.2 Items NOT Requiring Prior Auth
- Standard manual wheelchairs
- Canes, walkers, crutches
- Nebulizers
- Basic glucose monitors

### 4. CLINICAL CRITERIA

#### 4.1 Power Mobility Devices
Authorization requires:
- Face-to-face examination
- Mobility limitation in home
- Unable to use manual wheelchair
- Home assessment if >$1,000

#### 4.2 CPAP/BiPAP
Authorization requires:
- Sleep study (PSG or HST) showing:
  - AHI ≥ 15 for CPAP
  - AHI ≥ 5 with symptoms for CPAP
  - AHI ≥ 10 with BiPAP criteria
- 30-day compliance review required

#### 4.3 Home Oxygen
Authorization requires:
- Qualifying blood gas or oximetry:
  - PaO2 ≤ 55 mmHg or SaO2 ≤ 88%
  - PaO2 56-59 with cor pulmonale
- Physician certification of need
- Recertification every 12 months

### 5. DOCUMENTATION REQUIREMENTS

Required for all DME requests:
1. Physician order with diagnosis
2. Medical records supporting need
3. Face-to-face notes (when required)
4. Prior conservative treatment
5. Functional status assessment

### 6. RENTAL VS. PURCHASE

| Item | Acquisition | Timeline |
|------|-------------|----------|
| Oxygen | Rental | 36 months to purchase |
| CPAP | Rental | 13 months to purchase |
| Hospital bed | Rental | Based on need |
| Power wheelchair | Purchase | One-time |

### 7. SUPPLIER REQUIREMENTS

DME must be obtained from:
- Medicare-enrolled supplier
- Accredited supplier (ABC, BOC, ACHC)
- In-network when applicable

---
*Contact DME Authorization: 1-800-842-2656*
""",
            "applicable_cpt_codes": [],
            "applicable_icd10_codes": ["G47.33", "J96.10", "Z99.81", "Z99.3"],
            "interqual_version": "N/A",
            "prior_auth_required": True,
            "tags": ["DME", "durable medical equipment", "CPAP", "oxygen", "wheelchair", "coverage"]
        }
    ])
    
    # ==========================================================================
    # HUMANA POLICIES (5 policies)
    # ==========================================================================
    
    humana_policies = [
        {
            "policy_id": "HUM-BUND-2024-001",
            "payer_id": "humana",
            "payer_name": "Humana",
            "policy_type": "Billing Policy",
            "title": "Emergency Department and Observation Bundling Policy",
            "effective_date": "2024-09-01",
            "last_updated": "2024-08-15",
            "version": "2024.3",
            "status": "Active",
            "summary": "Bundling rules for ED visits that result in observation placement",
            "full_text": """
# Humana Billing Policy: ED and Observation Bundling

## Policy Number: HUM-BUND-2024-001
## Effective Date: September 1, 2024

### 1. PURPOSE

This policy establishes bundling rules when emergency department services are followed by observation placement during the same encounter.

### 2. BUNDLING RULES

#### 2.1 Same-Day ED to Observation

When a patient presents to the ED and is subsequently placed in observation on the same calendar day:

**Facility Billing (UB-04)**
- Bill ED services with Revenue Code 0450-0459
- Bill observation with Revenue Code 0762
- Use condition code G0 (both services same day)
- DO NOT bill separately - services are bundled

**Professional Billing (CMS-1500)**
- Bill ED E/M (99281-99285) 
- Bill observation E/M (99218-99220) with modifier 25
- Both services payable if medically necessary and documented

#### 2.2 ED to Observation Different Day

If ED visit is one calendar day and observation begins on the next:
- Bill ED and observation as separate claims
- No bundling applies
- Each service adjudicated independently

### 3. FACILITY FEE BUNDLING

The following facility services are bundled into observation:
- Nursing services
- Routine supplies
- Bed charges
- Vital sign monitoring

Separately billable:
- Drugs (Revenue codes 0250-0259)
- Lab tests (Revenue codes 0300-0319)
- Radiology (Revenue codes 0320-0359)
- OR/procedure room (Revenue codes 0360-0379)

### 4. CLAIM EDITS

Claims will be denied or adjusted for:
- Duplicate ED/observation facility charges (edit 101)
- Unbundled services (edit 204)
- Missing condition code G0 (edit 305)

Denial codes:
- CO-97: Payment included in allowance for another service
- CARC CO-18: Duplicate claim/service

### 5. APPEALS

If you believe bundling was incorrectly applied:
1. Submit appeal within 60 days
2. Include clinical documentation showing services were distinct
3. Reference applicable CPT/AMA guidelines

Contact: 1-800-457-4708

---
*This policy supersedes HUM-BUND-2023-002 effective September 1, 2024.*
""",
            "applicable_cpt_codes": ["99281", "99282", "99283", "99284", "99285", "99218", "99219", "99220"],
            "applicable_icd10_codes": [],
            "interqual_version": "N/A",
            "prior_auth_required": False,
            "tags": ["bundling", "emergency department", "observation", "facility billing"]
        },
        {
            "policy_id": "HUM-PAY-2024-001",
            "payer_id": "humana",
            "payer_name": "Humana",
            "policy_type": "Payment Policy",
            "title": "Payment Terms and Timely Filing",
            "effective_date": "2024-01-01",
            "last_updated": "2024-01-01",
            "version": "2024.1",
            "status": "Active",
            "summary": "Payment timeframes and filing requirements",
            "full_text": """
# Humana Payment Policy

## Policy Number: HUM-PAY-2024-001
## Effective Date: January 1, 2024

### 1. PAYMENT TIMEFRAMES

#### Medicare Advantage
- Electronic clean claims: **30 calendar days**
- Paper clean claims: **45 calendar days**

#### Commercial
- Electronic clean claims: **30 calendar days**
- Paper clean claims: **45 calendar days**

### 2. TIMELY FILING

| Claim Type | Deadline |
|------------|----------|
| Initial | 90 days |
| Corrected | 120 days from original |
| COB secondary | 90 days from primary EOB |
| Appeal | 60 days |

### 3. INTEREST PAYMENTS

Florida law requires interest payment at 12% annually for claims paid late.
- Interest accrues from day 31 (electronic) or day 46 (paper)
- Submit interest request in writing with claim reference

### 4. ELECTRONIC SUBMISSION

EDI Payer ID: 61101

Accepted formats:
- 837I (Institutional)
- 837P (Professional)

Clearinghouses:
- Availity
- Change Healthcare
- Trizetto

---
*Contact Provider Services: 1-800-448-6262*
""",
            "applicable_cpt_codes": [],
            "applicable_icd10_codes": [],
            "interqual_version": "N/A",
            "prior_auth_required": False,
            "tags": ["payment", "timely filing", "EDI", "interest"]
        },
        {
            "policy_id": "HUM-OBS-2024-001",
            "payer_id": "humana",
            "payer_name": "Humana",
            "policy_type": "Medical Necessity",
            "title": "Observation Services Medical Necessity Guidelines",
            "effective_date": "2024-01-01",
            "last_updated": "2024-08-01",
            "version": "2024.2",
            "status": "Active",
            "summary": "Clinical criteria for observation services coverage",
            "full_text": """
# Humana Medical Policy: Observation Services

## Policy Number: HUM-OBS-2024-001
## Effective Date: January 1, 2024

### 1. DEFINITION

Observation services are outpatient hospital services provided to assess whether a patient requires inpatient admission or can be safely discharged.

### 2. MEDICAL NECESSITY CRITERIA

Observation is medically necessary when:

#### 2.1 Clinical Indications
- Chest pain requiring serial troponins and monitoring
- Syncope requiring cardiac evaluation
- Asthma/COPD exacerbation responding to treatment
- Dehydration requiring IV fluids
- Abdominal pain requiring serial exams
- Head injury requiring neurological monitoring
- Allergic reaction requiring observation post-treatment

#### 2.2 Expected Duration
- Generally 8-24 hours
- Should not exceed 48 hours
- If >24 hours, reassess for inpatient criteria

### 3. CRITERIA NOT MET

Observation is NOT appropriate for:
- Patients clearly meeting inpatient criteria
- Social admissions
- Placement issues
- Patients awaiting nursing home bed
- Elective procedures

### 4. DOCUMENTATION REQUIREMENTS

Required documentation:
1. Physician order for observation with time
2. Clinical justification for observation vs. inpatient
3. Expected duration
4. Monitoring plan
5. Reassessment every 8-12 hours
6. Discharge criteria

### 5. BILLING GUIDELINES

**Facility (UB-04)**
- Revenue code 0762 (observation room)
- HCPCS G0378 (observation per hour)
- Condition code 44 if converted from inpatient

**Professional (CMS-1500)**
- Initial observation: 99218-99220
- Subsequent: 99224-99226
- Same-day discharge: 99234-99236

### 6. TWO-MIDNIGHT BENCHMARK

Per CMS guidelines:
- If physician expects 2+ midnights, inpatient generally appropriate
- Observation should not routinely span 2 midnights
- Document clinical rationale if >2 midnights

---
*Clinical questions: 1-800-523-0023*
""",
            "applicable_cpt_codes": ["99218", "99219", "99220", "99224", "99225", "99226", "G0378"],
            "applicable_icd10_codes": ["R07.9", "R55", "J44.1", "E86.0", "R10.9"],
            "interqual_version": "2023.2",
            "prior_auth_required": False,
            "tags": ["observation", "medical necessity", "two-midnight", "outpatient"]
        },
        {
            "policy_id": "HUM-CARD-2024-001",
            "payer_id": "humana",
            "payer_name": "Humana",
            "policy_type": "Prior Authorization",
            "title": "Cardiac Procedures Prior Authorization",
            "effective_date": "2024-01-01",
            "last_updated": "2024-05-01",
            "version": "2024.1",
            "status": "Active",
            "summary": "Prior authorization requirements for cardiac interventions",
            "full_text": """
# Humana Prior Authorization: Cardiac Procedures

## Policy Number: HUM-CARD-2024-001
## Effective Date: January 1, 2024

### 1. SCOPE

This policy covers prior authorization requirements for cardiac diagnostic and interventional procedures.

### 2. PROCEDURES REQUIRING PRIOR AUTH

#### 2.1 Diagnostic Procedures
| CPT Code | Description | Auth Required |
|----------|-------------|---------------|
| 93458 | Left heart catheterization | Yes - elective |
| 93459 | L/R heart catheterization | Yes - elective |
| 93306 | Transthoracic echo complete | No |
| 93350 | Stress echocardiography | Yes |
| 78452 | Nuclear stress test | Yes |

#### 2.2 Interventional Procedures
| CPT Code | Description | Auth Required |
|----------|-------------|---------------|
| 92928 | PCI single vessel with stent | Yes - elective |
| 92937 | PCI multiple vessels | Yes - elective |
| 33533 | CABG arterial | Yes |
| 33405 | AVR | Yes |
| 33430 | MVR | Yes |

### 3. EMERGENCY EXEMPTIONS

Prior auth NOT required for:
- STEMI intervention
- Unstable angina requiring emergent cath
- Acute heart failure requiring urgent intervention
- Cardiac arrest

### 4. CLINICAL CRITERIA

#### 4.1 Elective Cardiac Catheterization
- Abnormal stress test
- Unstable or refractory angina
- New onset heart failure
- Pre-operative evaluation (high risk)

#### 4.2 Elective PCI
- Significant stenosis (>70%) on angiography
- Documented ischemia on functional testing
- ACS management per guidelines
- CTO with documented viability

#### 4.3 CABG
- Left main disease >50%
- Three-vessel disease with LVEF <50%
- Two-vessel disease with LAD involvement
- Failed PCI with ongoing ischemia

### 5. SUBMISSION REQUIREMENTS

Include:
1. Recent cardiac testing results
2. Angiography report (if available)
3. Functional capacity assessment
4. Medication list
5. Comorbidity documentation

Submit to:
- Phone: 1-800-523-0023
- Fax: 1-800-949-2961

### 6. DETERMINATION TIMELINE

- Urgent: 24 hours
- Routine: 5 business days

---
*Humana Cardiac Prior Auth: 1-800-523-0023*
""",
            "applicable_cpt_codes": ["93458", "93459", "93350", "78452", "92928", "92937", "33533", "33405"],
            "applicable_icd10_codes": ["I25.10", "I21.3", "I50.9", "I35.0"],
            "interqual_version": "N/A",
            "prior_auth_required": True,
            "tags": ["cardiac", "prior authorization", "catheterization", "PCI", "CABG"]
        },
        {
            "policy_id": "HUM-ONCO-2024-001",
            "payer_id": "humana",
            "payer_name": "Humana",
            "policy_type": "Coverage Policy",
            "title": "Oncology Services Coverage and Prior Authorization",
            "effective_date": "2024-01-01",
            "last_updated": "2024-06-01",
            "version": "2024.2",
            "status": "Active",
            "summary": "Coverage criteria for cancer treatment services",
            "full_text": """
# Humana Coverage Policy: Oncology Services

## Policy Number: HUM-ONCO-2024-001
## Effective Date: January 1, 2024

### 1. OVERVIEW

Humana covers medically necessary oncology services including chemotherapy, radiation therapy, surgical oncology, and supportive care.

### 2. COVERED SERVICES

#### 2.1 Chemotherapy
- FDA-approved drugs for labeled indications
- Compendia-supported off-label uses
- Oral and IV chemotherapy
- Targeted therapy
- Immunotherapy

#### 2.2 Radiation Therapy
- External beam radiation (EBRT)
- IMRT/IGRT
- Stereotactic radiosurgery (SRS/SBRT)
- Brachytherapy
- Proton beam therapy (select indications)

#### 2.3 Surgical Oncology
- Tumor resection
- Lymph node dissection
- Reconstructive surgery
- Palliative surgery

### 3. PRIOR AUTHORIZATION REQUIREMENTS

#### 3.1 Services Requiring Auth
| Service | Auth Required |
|---------|---------------|
| Chemotherapy (IV) | No - at oncologist discretion |
| Specialty oral oncology drugs | Yes |
| Proton beam therapy | Yes |
| CAR-T therapy | Yes |
| PET scans | Yes - after initial staging |
| Genetic testing | Yes |

#### 3.2 Chemotherapy Drug Authorization
Drugs requiring prior auth:
- Pembrolizumab (Keytruda)
- Nivolumab (Opdivo)
- CAR-T products
- Drugs >$10,000/month

### 4. CLINICAL PATHWAY PROGRAM

Humana utilizes clinical pathways based on NCCN guidelines. Adherence to pathways:
- Expedites authorization
- May waive step therapy
- Supports optimal outcomes

### 5. SUPPORTIVE CARE

Covered supportive services:
- Antiemetics
- Growth factors (G-CSF)
- Pain management
- Palliative care
- Hospice

### 6. CLINICAL TRIAL COVERAGE

Humana covers routine care costs for members in:
- NCI-sponsored trials
- FDA-approved trials
- Trials at NCI-designated cancer centers

---
*Oncology Prior Auth: 1-800-555-2546*
""",
            "applicable_cpt_codes": ["96413", "96415", "77385", "77386", "77520", "0537T"],
            "applicable_icd10_codes": ["C34.90", "C50.919", "C61", "C18.9"],
            "interqual_version": "N/A",
            "prior_auth_required": True,
            "tags": ["oncology", "chemotherapy", "radiation", "cancer", "coverage"]
        }
    ]
    
    # ==========================================================================
    # FLORIDA BLUE POLICIES (4 policies)
    # ==========================================================================
    
    # Florida Blue Policies
    bcbs_policies = [
        {
            "policy_id": "FLB-MN-2024-001",
            "payer_id": "bcbs",
            "payer_name": "Florida Blue",
            "policy_type": "Medical Necessity",
            "title": "Inpatient Admission Medical Necessity Criteria",
            "effective_date": "2024-01-01",
            "last_updated": "2024-06-01",
            "version": "2024.2",
            "status": "Active",
            "summary": "InterQual-based inpatient admission criteria",
            "full_text": """
# Florida Blue Medical Necessity Policy: Inpatient Admissions

## Policy Number: FLB-MN-2024-001
## Effective Date: January 1, 2024

### 1. OVERVIEW

Florida Blue utilizes InterQual® criteria (version 2023.1) for inpatient admission medical necessity determinations.

### 2. CRITERIA APPLICATION

#### 2.1 Acute Care Admissions

Inpatient admission is appropriate when:
- Patient meets InterQual Acute Adult or Pediatric criteria
- Severity of illness AND intensity of service criteria are met
- Outpatient or observation care cannot safely meet patient needs

#### 2.2 Severity of Illness Indicators
- Acute onset requiring immediate intervention
- Vital sign instability
- Lab values significantly outside normal range
- Altered mental status
- Acute respiratory distress

#### 2.3 Intensity of Service Indicators
- IV medications requiring titration
- Cardiac monitoring
- Respiratory therapy every 4 hours or more frequently
- Nursing assessment every 4 hours or more frequently
- Surgical procedure requiring post-op observation

### 3. DOCUMENTATION REQUIREMENTS

Medical records must include:
1. History and physical within 24 hours of admission
2. Physician orders documenting level of care
3. Nursing assessments supporting intensity criteria
4. Progress notes with continued stay justification

### 4. CONCURRENT REVIEW

Florida Blue conducts concurrent review on:
- All admissions exceeding 3 days
- High-cost DRGs
- Transfers from other facilities
- Readmissions within 30 days

Notification required within 24 hours of admission.
Fax: 1-800-955-6556
Phone: 1-800-727-2227

### 5. RETROSPECTIVE REVIEW

Claims may be reviewed retrospectively for:
- Medical necessity
- Level of care appropriateness  
- Coding accuracy
- DRG validation

### 6. DENIAL AND APPEALS

If admission is determined not medically necessary:
- CARC OA-23 applies
- Peer-to-peer review available
- Written appeal within 60 days
- Include additional clinical documentation

---
*Florida Blue - An Independent Licensee of the Blue Cross and Blue Shield Association*
""",
            "applicable_cpt_codes": ["99221", "99222", "99223", "99231", "99232", "99233"],
            "applicable_icd10_codes": [],
            "interqual_version": "2023.1",
            "prior_auth_required": False,
            "tags": ["inpatient", "medical necessity", "interqual", "admission criteria"]
        },
        {
            "policy_id": "FLB-ED-2024-001",
            "payer_id": "bcbs",
            "payer_name": "Florida Blue",
            "policy_type": "Coverage Policy",
            "title": "Emergency Department Services Coverage",
            "effective_date": "2024-01-01",
            "last_updated": "2024-03-01",
            "version": "2024.1",
            "status": "Active",
            "summary": "Coverage criteria for emergency department visits",
            "full_text": """
# Florida Blue Coverage Policy: Emergency Department Services

## Policy Number: FLB-ED-2024-001
## Effective Date: January 1, 2024

### 1. EMERGENCY SERVICES DEFINITION

An emergency medical condition is:
- Acute symptoms of sufficient severity (including severe pain)
- Such that a prudent layperson with average knowledge of health could reasonably expect:
  - Absence of immediate medical attention could place health in serious jeopardy
  - Serious impairment to bodily functions
  - Serious dysfunction of any bodily organ or part

### 2. PRUDENT LAYPERSON STANDARD

Florida Blue applies the prudent layperson standard for ED coverage determinations. Services are covered based on presenting symptoms, not final diagnosis.

### 3. COVERED ED SERVICES

When prudent layperson criteria met:
- ED facility fees
- Professional fees
- Diagnostic testing
- Treatment services
- Stabilization services

### 4. ED LEVELS OF SERVICE

| CPT Code | Level | Description |
|----------|-------|-------------|
| 99281 | 1 | Self-limited problem |
| 99282 | 2 | Low severity |
| 99283 | 3 | Moderate severity |
| 99284 | 4 | High severity |
| 99285 | 5 | Highest severity |

### 5. NON-EMERGENT ED USE

For non-emergent conditions:
- Member cost-sharing may apply
- Education on appropriate care settings
- Steerage to urgent care when appropriate

### 6. OUT-OF-NETWORK ED

Emergency services at out-of-network facilities:
- Covered at in-network rates
- No balance billing (per No Surprises Act)
- Member only responsible for in-network cost-sharing

### 7. POST-STABILIZATION CARE

After patient is stabilized:
- Transfer to in-network facility when safe
- Continued care requires authorization
- Post-stabilization observation: 24-48 hours

---
*Emergency claims questions: 1-800-727-2227*
""",
            "applicable_cpt_codes": ["99281", "99282", "99283", "99284", "99285"],
            "applicable_icd10_codes": ["R07.9", "R55", "S72.001A", "I21.3"],
            "interqual_version": "N/A",
            "prior_auth_required": False,
            "tags": ["emergency", "ED", "prudent layperson", "coverage"]
        },
        {
            "policy_id": "FLB-REHAB-2024-001",
            "payer_id": "bcbs",
            "payer_name": "Florida Blue",
            "policy_type": "Medical Necessity",
            "title": "Inpatient Rehabilitation Facility (IRF) Criteria",
            "effective_date": "2024-01-01",
            "last_updated": "2024-04-01",
            "version": "2024.1",
            "status": "Active",
            "summary": "Medical necessity criteria for inpatient rehabilitation admissions",
            "full_text": """
# Florida Blue Medical Policy: Inpatient Rehabilitation

## Policy Number: FLB-REHAB-2024-001
## Effective Date: January 1, 2024

### 1. DEFINITION

Inpatient Rehabilitation Facility (IRF) services provide intensive, interdisciplinary rehabilitation for patients with functional deficits.

### 2. ADMISSION CRITERIA

Patient must meet ALL of the following:

#### 2.1 Medical Necessity
- Requires active and ongoing physician supervision
- Requires 24-hour nursing care
- Medical condition is stable enough to participate

#### 2.2 Rehabilitation Need
- Significant functional impairment
- Requires intensive therapy (3+ hours/day)
- Requires coordinated interdisciplinary team
- Expected to benefit from rehabilitation

#### 2.3 Level of Care
- Requires IRF level (not SNF or home health)
- Cannot be treated at lower level
- Practical considerations support IRF

### 3. QUALIFYING CONDITIONS

Common qualifying diagnoses:
- Stroke (CVA)
- Hip fracture
- Major multiple trauma
- Brain injury
- Spinal cord injury
- Amputation
- Joint replacement (complex cases)
- Neurological disorders

### 4. DOCUMENTATION REQUIREMENTS

Pre-admission assessment must include:
1. Functional status (FIM scores)
2. Therapy potential assessment
3. Medical stability documentation
4. Rehabilitation goals
5. Estimated length of stay
6. Discharge plan

### 5. PRIOR AUTHORIZATION

Prior authorization REQUIRED:
- Submit 48-72 hours before admission
- Include pre-admission evaluation
- FIM scores required
- Physician attestation

### 6. CONTINUED STAY REVIEW

Review occurs at:
- Day 7
- Weekly thereafter
- Must show functional progress
- FIM improvement required

### 7. LENGTH OF STAY GUIDELINES

| Diagnosis | Typical LOS |
|-----------|-------------|
| Stroke | 12-16 days |
| Hip fracture | 10-14 days |
| Joint replacement | 5-7 days |
| Brain injury | 14-21 days |
| Spinal cord | 21-30 days |

### 8. DENIAL REASONS

- Does not meet IRF criteria (SNF appropriate)
- Not making functional progress
- Medically unstable
- Non-compliant with therapy

---
*IRF Authorization: 1-800-727-2227, option 3*
""",
            "applicable_cpt_codes": ["97110", "97140", "97530", "97542"],
            "applicable_icd10_codes": ["I63.9", "S72.001A", "S06.9X0A", "G82.20"],
            "interqual_version": "2023.1",
            "prior_auth_required": True,
            "tags": ["rehabilitation", "IRF", "inpatient", "therapy", "medical necessity"]
        },
        {
            "policy_id": "FLB-PAY-2024-001",
            "payer_id": "bcbs",
            "payer_name": "Florida Blue",
            "policy_type": "Payment Policy",
            "title": "Clean Claim Processing and Payment Terms",
            "effective_date": "2024-01-01",
            "last_updated": "2024-01-01",
            "version": "2024.1",
            "status": "Active",
            "summary": "Payment timeframes and clean claim requirements",
            "full_text": """
# Florida Blue Payment Policy

## Policy Number: FLB-PAY-2024-001
## Effective Date: January 1, 2024

### 1. CLEAN CLAIM DEFINITION

A clean claim contains:
- Valid member ID
- Correct provider information (NPI, Tax ID)
- Accurate dates of service
- Appropriate coding (CPT, ICD-10, HCPCS)
- Required supporting documentation

### 2. PAYMENT TIMEFRAMES

Per Florida Statute 627.6131:

| Claim Type | Electronic | Paper |
|------------|-----------|-------|
| Clean claims | 20 days | 40 days |
| Incomplete claims | 45 days after completion | 45 days |

### 3. INTEREST ON LATE PAYMENTS

If payment exceeds timeframe:
- Interest: 12% per annum
- Calculated from deadline date
- Automatically applied by Florida Blue

### 4. TIMELY FILING

| Claim Type | Deadline |
|------------|----------|
| Initial | 180 days |
| Corrected | 180 days from denial |
| COB/Secondary | 180 days from primary EOB |
| Appeal | 60 days |

### 5. CLAIM SUBMISSION

**Electronic Submission (Preferred)**
- EDI Payer ID: 00590
- Clearinghouses: Availity, Change Healthcare
- Format: 837I, 837P

**Paper Submission**
- CMS-1500 (Professional)
- UB-04 (Institutional)
- Mail to designated lockbox

### 6. CLAIM STATUS

Check status via:
- Availity portal
- Provider portal: FloridaBlue.com/providers
- EDI 276/277
- Phone: 1-800-727-2227

---
*Claims questions: 1-800-727-2227*
""",
            "applicable_cpt_codes": [],
            "applicable_icd10_codes": [],
            "interqual_version": "N/A",
            "prior_auth_required": False,
            "tags": ["payment", "clean claim", "timely filing", "Florida statute"]
        }
    ]
    
    # ==========================================================================
    # AETNA POLICIES (3 policies)
    # ==========================================================================
    
    aetna_policies = [
        {
            "policy_id": "AET-MN-2024-001",
            "payer_id": "aetna",
            "payer_name": "Aetna",
            "policy_type": "Medical Necessity",
            "title": "Inpatient and Observation Medical Necessity Criteria",
            "effective_date": "2024-01-01",
            "last_updated": "2024-05-01",
            "version": "2024.2",
            "status": "Active",
            "summary": "MCG-based criteria for level of care determinations",
            "full_text": """
# Aetna Medical Policy: Level of Care Criteria

## Policy Number: AET-MN-2024-001
## Effective Date: January 1, 2024

### 1. OVERVIEW

Aetna utilizes MCG (Milliman Care Guidelines) for medical necessity and level of care determinations.

### 2. CRITERIA APPLICATION

#### 2.1 Inpatient Admission
MCG Inpatient & Surgical Care criteria apply:
- Severity of Illness
- Intensity of Service
- Discharge Screens

#### 2.2 Observation Services
MCG Observation Care criteria apply when:
- Patient does not meet inpatient criteria
- Expected stay < 24 hours
- Requires active monitoring

### 3. DOCUMENTATION REQUIREMENTS

Required for all admissions:
1. Admission H&P (within 24 hours)
2. Physician orders with level of care
3. Nursing assessments
4. Daily progress notes
5. Discharge planning documentation

### 4. NOTIFICATION REQUIREMENTS

**Emergent Admissions**
- Notify within 48 hours
- Phone: 1-800-624-0756
- Online: Availity

**Elective Admissions**
- Prior authorization required
- Submit 5 business days in advance

### 5. CONCURRENT REVIEW

Aetna conducts concurrent review:
- Initial review: Day 1-2
- Continued stay: Per MCG guidelines
- Must demonstrate continued need

### 6. APPEAL PROCESS

1. Peer-to-peer: Within 14 days
2. Written appeal: Within 180 days
3. Include additional clinical documentation

---
*MCG is a registered trademark of Milliman, Inc.*
""",
            "applicable_cpt_codes": ["99221", "99222", "99223", "99218", "99219", "99220"],
            "applicable_icd10_codes": [],
            "interqual_version": "N/A - Uses MCG",
            "prior_auth_required": False,
            "tags": ["medical necessity", "MCG", "inpatient", "observation", "level of care"]
        },
        {
            "policy_id": "AET-IMG-2024-001",
            "payer_id": "aetna",
            "payer_name": "Aetna",
            "policy_type": "Prior Authorization",
            "title": "Advanced Imaging Prior Authorization (via EviCore)",
            "effective_date": "2024-01-01",
            "last_updated": "2024-08-01",
            "version": "2024.3",
            "status": "Active",
            "summary": "Prior authorization requirements for advanced imaging through EviCore",
            "full_text": """
# Aetna Prior Authorization: Advanced Imaging

## Policy Number: AET-IMG-2024-001
## Effective Date: January 1, 2024

### 1. OVERVIEW

Aetna delegates advanced imaging prior authorization to EviCore Healthcare.

### 2. SERVICES REQUIRING AUTHORIZATION

| Modality | CPT Codes | Auth Required |
|----------|-----------|---------------|
| CT | 70450-74178 | Yes - all |
| MRI | 70551-73723 | Yes - all |
| PET | 78811-78816 | Yes - all |
| Nuclear Cardiology | 78451-78454 | Yes - all |

### 3. EXEMPTIONS

Authorization NOT required for:
- Emergency department imaging
- Inpatient imaging
- Post-operative imaging (90 days)
- Oncology staging (initial)

### 4. EVICORE SUBMISSION

**Online (Preferred)**
- Portal: evicore.com
- Available 24/7
- Real-time decisions for routine cases

**Phone**
- 1-888-693-3211
- Hours: 7am-7pm local time

**Fax**
- 1-888-693-3210

### 5. REQUIRED INFORMATION

1. Member demographics
2. Ordering provider NPI
3. Rendering facility
4. CPT code(s)
5. ICD-10 diagnosis
6. Clinical indication
7. Prior imaging results (if applicable)
8. Conservative treatment history

### 6. DETERMINATION TIMELINE

| Type | Turnaround |
|------|------------|
| Urgent | 24 hours |
| Routine | 2-3 business days |

### 7. CLINICAL CRITERIA

EviCore applies evidence-based guidelines:
- ACR Appropriateness Criteria
- Specialty society guidelines
- Peer-reviewed literature

### 8. PEER-TO-PEER REVIEW

If initial request denied:
- Request P2P via portal
- Schedule within 5 business days
- Ordering physician participates

---
*EviCore Healthcare: 1-888-693-3211*
""",
            "applicable_cpt_codes": ["70450", "70553", "71250", "74177", "78452", "78815"],
            "applicable_icd10_codes": [],
            "interqual_version": "N/A - EviCore criteria",
            "prior_auth_required": True,
            "tags": ["prior authorization", "imaging", "EviCore", "CT", "MRI", "PET"]
        },
        {
            "policy_id": "AET-PAY-2024-001",
            "payer_id": "aetna",
            "payer_name": "Aetna",
            "policy_type": "Payment Policy",
            "title": "Payment Terms and Claim Filing Requirements",
            "effective_date": "2024-01-01",
            "last_updated": "2024-01-01",
            "version": "2024.1",
            "status": "Active",
            "summary": "Payment timeframes and filing requirements",
            "full_text": """
# Aetna Payment Policy

## Policy Number: AET-PAY-2024-001
## Effective Date: January 1, 2024

### 1. PAYMENT TIMEFRAMES

| Claim Type | Electronic | Paper |
|------------|-----------|-------|
| Clean claims | 30 days | 45 days |
| Requires review | 45 days | 60 days |

### 2. TIMELY FILING

| Type | Deadline |
|------|----------|
| Initial claim | 90 days |
| Corrected claim | 120 days from denial |
| Appeal | 180 days |

### 3. ELECTRONIC SUBMISSION

- EDI Payer ID: 60054
- Portal: Availity
- Formats: 837I, 837P

### 4. INTEREST

Per state requirements where applicable.
- Florida: 12% annually from day 31/46
- Other states: Per state law

---
*Claims: 1-888-632-3862*
""",
            "applicable_cpt_codes": [],
            "applicable_icd10_codes": [],
            "interqual_version": "N/A",
            "prior_auth_required": False,
            "tags": ["payment", "timely filing", "claims"]
        }
    ]
    
    # ==========================================================================
    # CIGNA POLICIES (2 policies)
    # ==========================================================================
    
    cigna_policies = [
        {
            "policy_id": "CIG-MN-2024-001",
            "payer_id": "cigna",
            "payer_name": "Cigna",
            "policy_type": "Medical Necessity",
            "title": "Utilization Management Medical Necessity Criteria",
            "effective_date": "2024-01-01",
            "last_updated": "2024-06-01",
            "version": "2024.2",
            "status": "Active",
            "summary": "MCG-based criteria for utilization management",
            "full_text": """
# Cigna Medical Policy: Utilization Management

## Policy Number: CIG-MN-2024-001
## Effective Date: January 1, 2024

### 1. OVERVIEW

Cigna utilizes MCG (Milliman Care Guidelines) for medical necessity and utilization management.

### 2. CRITERIA APPLICATION

MCG criteria applied for:
- Inpatient admissions
- Observation services
- Skilled nursing facility
- Inpatient rehabilitation
- Home health services

### 3. NOTIFICATION REQUIREMENTS

**Emergent Admissions**
- Notify within 24-48 hours
- Phone: 1-800-244-6224
- Fax: 1-859-410-3172

**Elective Admissions**
- Precertification required
- Submit 5-10 business days in advance

### 4. CONTINUED STAY REVIEW

- Initial authorization: Based on diagnosis
- Concurrent review: Per MCG care duration
- Extension requests: 24-48 hours before expiration

### 5. APPEAL PROCESS

Level 1: Internal review (30 days)
Level 2: Peer-to-peer (15 days)
External: State review if applicable

---
*Cigna UM: 1-800-244-6224*
""",
            "applicable_cpt_codes": ["99221", "99222", "99223", "99218", "99219", "99220"],
            "applicable_icd10_codes": [],
            "interqual_version": "N/A - Uses MCG",
            "prior_auth_required": False,
            "tags": ["medical necessity", "MCG", "utilization management"]
        },
        {
            "policy_id": "CIG-PAY-2024-001",
            "payer_id": "cigna",
            "payer_name": "Cigna",
            "policy_type": "Payment Policy",
            "title": "Payment Terms and Requirements",
            "effective_date": "2024-01-01",
            "last_updated": "2024-01-01",
            "version": "2024.1",
            "status": "Active",
            "summary": "Payment timeframes and submission requirements",
            "full_text": """
# Cigna Payment Policy

## Policy Number: CIG-PAY-2024-001
## Effective Date: January 1, 2024

### 1. PAYMENT TIMEFRAMES

| Type | Timeline |
|------|----------|
| Electronic clean | 30 days |
| Paper clean | 45 days |

### 2. TIMELY FILING

| Claim Type | Deadline |
|------------|----------|
| Initial | 90 days |
| Corrected | 120 days |
| Appeal | 180 days |

### 3. SUBMISSION

- EDI: 62308
- Portal: CignaforHCP.com
- Clearinghouses: All major

---
*Cigna Claims: 1-800-244-6224*
""",
            "applicable_cpt_codes": [],
            "applicable_icd10_codes": [],
            "interqual_version": "N/A",
            "prior_auth_required": False,
            "tags": ["payment", "claims", "timely filing"]
        }
    ]
    
    # Medicare Policies (keep existing)
    medicare_policies = [
        {
            "policy_id": "CMS-OBS-2024-001",
            "payer_id": "medicare",
            "payer_name": "Medicare",
            "policy_type": "Coverage Determination",
            "title": "Outpatient Observation Services Coverage",
            "effective_date": "2024-01-01",
            "last_updated": "2024-01-01",
            "version": "2024.1",
            "status": "Active",
            "summary": "Medicare coverage rules for observation services",
            "full_text": """
# Medicare Coverage: Outpatient Observation Services

## Reference: Medicare Benefit Policy Manual, Chapter 6

### 1. DEFINITION

Observation services are furnished on a hospital's premises and include use of a bed and periodic monitoring by nursing or other staff.

### 2. COVERAGE REQUIREMENTS

Observation services are covered only when:
- Ordered by a physician or qualified practitioner
- Reasonable and necessary to evaluate or stabilize the patient's condition
- Expected to be completed in less than 24 hours

### 3. TIME COUNTING

For billing purposes:
- Begin counting time at clock time of order
- End time when all medically necessary services completed
- Do not count time waiting for transportation or administrative reasons

### 4. TWO-MIDNIGHT RULE

If physician expects patient to require two or more midnights of hospital care:
- Inpatient admission is generally appropriate
- Observation should not extend beyond two midnights except in rare circumstances

### 5. PHYSICIAN CERTIFICATION

The physician must certify:
- Observation services are reasonable and necessary
- Expected duration
- Why inpatient admission is not appropriate

### 6. BILLING

**Hospital (UB-04)**
- Revenue code 0762 (Observation room)
- HCPCS G0378 (Hospital observation per hour)
- Report hours in units

**Physician**
- Bill observation E/M codes (99218-99220, 99224-99226)
- Time-based billing applies

### 7. BENEFICIARY NOTICE

Medicare Outpatient Observation Notice (MOON) required:
- Delivered within 36 hours of observation start
- Explains outpatient status
- Describes financial implications

---
*Source: CMS Medicare Benefit Policy Manual, Chapter 6, Section 20.6*
""",
            "applicable_cpt_codes": ["99218", "99219", "99220", "99224", "99225", "99226", "G0378"],
            "applicable_icd10_codes": [],
            "interqual_version": "N/A",
            "prior_auth_required": False,
            "tags": ["observation", "two-midnight rule", "medicare", "coverage"]
        },
        {
            "policy_id": "CMS-INP-2024-001",
            "payer_id": "medicare",
            "payer_name": "Medicare",
            "policy_type": "Coverage Determination",
            "title": "Inpatient Hospital Admission Requirements",
            "effective_date": "2024-01-01",
            "last_updated": "2024-01-01",
            "version": "2024.1",
            "status": "Active",
            "summary": "Medicare inpatient admission criteria and two-midnight rule",
            "full_text": """
# Medicare Coverage: Inpatient Hospital Admissions

## Reference: Medicare Benefit Policy Manual, Chapter 1

### 1. INPATIENT ADMISSION CRITERIA

A Medicare beneficiary is considered an inpatient when formally admitted by hospital with expectation of:
- Medically necessary care
- Requiring 2 or more midnights of hospital care

### 2. TWO-MIDNIGHT RULE

#### 2.1 General Principle
Inpatient admission is generally appropriate when:
- Physician expects patient to require hospital care spanning 2 or more midnights
- Admission is based on complex medical factors
- Documentation supports the clinical expectation

#### 2.2 Exceptions
Inpatient admission may be appropriate for <2 midnights when:
- Death occurs
- Transfer to another facility
- Patient leaves AMA
- Unexpected recovery
- Procedures on "Inpatient Only" list

### 3. PHYSICIAN DOCUMENTATION

Required documentation:
1. Admission order
2. Authentication (signature, date, time)
3. Reason for admission
4. Expected duration
5. Treatment plan

### 4. CONDITION CODE 44

Use when inpatient changed to outpatient:
- Before discharge
- Must be physician decision
- Utilization review involvement
- Patient notification required

### 5. DRG PAYMENT

Inpatient stays paid under IPPS:
- Based on MS-DRG
- Geographic adjustment
- Teaching/DSH add-ons
- Outlier payments available

### 6. MEDICAL REVIEW

MACs may review for:
- Medical necessity
- Level of care
- DRG validation
- Documentation sufficiency

---
*Source: CMS Medicare Benefit Policy Manual, Chapter 1*
""",
            "applicable_cpt_codes": ["99221", "99222", "99223", "99231", "99232", "99233"],
            "applicable_icd10_codes": [],
            "interqual_version": "N/A",
            "prior_auth_required": False,
            "tags": ["inpatient", "two-midnight rule", "medicare", "DRG", "admission"]
        },
        {
            "policy_id": "CMS-TIMELY-2024-001",
            "payer_id": "medicare",
            "payer_name": "Medicare",
            "policy_type": "Billing Policy",
            "title": "Medicare Timely Filing Requirements",
            "effective_date": "2024-01-01",
            "last_updated": "2024-01-01",
            "version": "2024.1",
            "status": "Active",
            "summary": "Timely filing deadlines for Medicare claims",
            "full_text": """
# Medicare Billing Policy: Timely Filing

## Reference: 42 CFR 424.44

### 1. GENERAL RULE

Medicare claims must be filed within:
- **12 months** (1 calendar year) from date of service
- For services Oct 1 - Sept 30: Due by Sept 30 of following year

### 2. EXCEPTIONS

Extended filing allowed for:
- Retroactive Medicare entitlement
- Retroactive disenrollment from MA plan
- Administrative error by CMS or MAC
- Natural disaster

### 3. SECONDARY PAYER

When Medicare is secondary:
- File within 12 months of primary payer determination
- Include primary EOB/remittance

### 4. CORRECTED CLAIMS

No specific deadline, but recommended:
- Submit within 12 months of original payment
- Use appropriate frequency code

### 5. APPEALS

- **Redetermination**: 120 days from initial determination
- **Reconsideration**: 180 days from redetermination
- **ALJ Hearing**: 60 days from reconsideration
- **Medicare Appeals Council**: 60 days from ALJ
- **Federal Court**: 60 days from Council

### 6. LATE FILING

Claims filed after deadline:
- Denied with reason "timely filing"
- No appeal rights for late filing
- Provider cannot bill beneficiary

---
*Source: 42 CFR 424.44, Medicare Claims Processing Manual Chapter 1*
""",
            "applicable_cpt_codes": [],
            "applicable_icd10_codes": [],
            "interqual_version": "N/A",
            "prior_auth_required": False,
            "tags": ["timely filing", "medicare", "deadlines", "appeals", "billing"]
        }
    ]
    
    # Combine all policies (23 total)
    all_policies = (
        uhc_policies +      # 6 policies
        humana_policies +   # 5 policies  
        bcbs_policies +     # 4 policies
        aetna_policies +    # 3 policies
        cigna_policies +    # 2 policies
        medicare_policies   # 3 policies
    )
    
    return all_policies


# =============================================================================
# CONTRACT DOCUMENTS
# =============================================================================

def generate_contract_documents() -> List[Dict]:
    """Generate contract document excerpts for each payer."""
    
    contracts = []
    
    # UHC Contract
    contracts.append({
        "contract_id": "CTR-UHC-2024-FL-001",
        "payer_id": "uhc",
        "payer_name": "UnitedHealthcare",
        "contract_type": "Medicare Advantage Facility Agreement",
        "effective_date": "2024-01-01",
        "expiration_date": "2025-12-31",
        "auto_renewal": True,
        "termination_notice_days": 90,
        "full_text": """
# FACILITY PARTICIPATION AGREEMENT

## Between: UnitedHealthcare Insurance Company ("Plan")
## And: AdventHealth Orlando ("Facility")
## Contract ID: CTR-UHC-2024-FL-001

### ARTICLE 1: DEFINITIONS

1.1 "Clean Claim" means a claim submitted on the appropriate form with all required information.

1.2 "Covered Services" means medically necessary services covered under a Member's benefit plan.

1.3 "Medical Necessity" shall be determined using InterQual® criteria version 2023.1 unless otherwise specified.

### ARTICLE 2: FACILITY OBLIGATIONS

2.1 Facility agrees to provide Covered Services to Members in accordance with accepted medical standards.

2.2 Facility shall submit claims electronically via EDI 837I within 90 days of date of service.

2.3 Facility shall obtain prior authorization for services listed in Exhibit A.

### ARTICLE 3: PLAN OBLIGATIONS

3.1 Plan agrees to reimburse Facility for Covered Services in accordance with the Fee Schedule (Exhibit B).

3.2 Plan shall process Clean Claims within 30 calendar days of receipt.

3.3 Plan shall provide reason codes for any claim adjustment or denial.

### ARTICLE 4: PAYMENT TERMS

4.1 **Payment Timeframe**: Plan shall pay Clean Claims within thirty (30) calendar days of receipt.

4.2 **Interest**: For claims not paid within the timeframe specified in Section 4.1, Plan shall pay interest at the rate of one percent (1%) per month, calculated from day 31.

4.3 **Contractual Adjustments**: Facility agrees to accept Plan's allowed amount as payment in full for Covered Services. Facility may not balance bill Members except for applicable copayments, deductibles, and coinsurance.

4.4 **Coordination of Benefits**: When Plan is secondary, payment shall be made within 30 days of receipt of primary carrier's explanation of benefits.

### ARTICLE 5: MEDICAL NECESSITY AND UTILIZATION REVIEW

5.1 **Criteria**: Plan utilizes InterQual® criteria version 2023.1 for medical necessity determinations. Any updates to criteria shall be communicated to Facility with 60 days notice.

5.2 **Concurrent Review**: Facility shall notify Plan within 24 hours of any inpatient admission. Plan reserves the right to conduct concurrent review.

5.3 **Retrospective Review**: Plan may conduct retrospective review of claims for medical necessity, appropriate level of care, and coding accuracy.

### ARTICLE 6: CLAIMS AND BILLING

6.1 **Timely Filing**: Claims must be submitted within 90 days of date of service or 90 days from date of denial by primary payer for secondary claims.

6.2 **Corrected Claims**: Corrected claims must be submitted within 90 days of initial claim denial.

6.3 **Appeals**: Facility may appeal claim denials within 60 days of denial notification.

### ARTICLE 7: MEDICAL NECESSITY DISPUTES

7.1 Facility may request peer-to-peer review within 10 business days of adverse determination.

7.2 Written appeals must include clinical documentation supporting medical necessity.

7.3 Plan shall respond to appeals within 30 days.

### ARTICLE 8: TERM AND TERMINATION

8.1 **Initial Term**: This Agreement shall be effective from January 1, 2024 through December 31, 2025.

8.2 **Auto-Renewal**: This Agreement shall automatically renew for successive one-year terms unless terminated.

8.3 **Termination Without Cause**: Either party may terminate with 90 days written notice.

8.4 **Termination for Cause**: Either party may terminate immediately for material breach with 30 days to cure.

### ARTICLE 9: DISPUTE RESOLUTION

9.1 Disputes shall first be addressed through informal negotiation.

9.2 If not resolved within 30 days, parties agree to mediation.

9.3 Venue for any legal action shall be Orange County, Florida.

### ARTICLE 10: COMPLIANCE

10.1 Both parties shall comply with all applicable federal and state laws.

10.2 Facility shall maintain all required licenses and accreditations.

10.3 Plan shall comply with CMS Medicare Advantage regulations.

### ARTICLE 11: AMENDMENTS

11.1 Plan may amend fee schedules with 60 days notice.

11.2 Plan may update medical policies with 30 days notice.

11.3 Material amendments require written agreement of both parties.

### ARTICLE 12: MATERIAL BREACH

12.1 The following constitute material breach:
    a) Failure to pay claims within contractual timeframes for more than 60 consecutive days
    b) Pattern of inappropriate medical necessity denials
    c) Unilateral modification of contracted rates
    d) Failure to maintain required credentials

12.2 Upon material breach, non-breaching party may seek all available remedies including contract termination.

---

**SIGNATURES**

_________________________  Date: ____________
UnitedHealthcare Insurance Company

_________________________  Date: ____________
AdventHealth Orlando

---

### EXHIBIT A: PRIOR AUTHORIZATION REQUIREMENTS
[See separate document UHC-PA-2024-001]

### EXHIBIT B: FEE SCHEDULE
[Confidential - See separate attachment]

### EXHIBIT C: MEDICAL POLICIES
[See UHCProvider.com/policies]
""",
        "key_terms": {
            "payment_days": 30,
            "interest_rate": "1% per month (12% annually)",
            "timely_filing_days": 90,
            "appeal_days": 60,
            "termination_notice_days": 90,
            "interqual_version": "2023.1",
            "auto_renewal": True
        },
        "sections": [
            {"number": "4.1", "title": "Payment Timeframe", "summary": "30 calendar days for clean claims"},
            {"number": "4.2", "title": "Interest", "summary": "1% per month from day 31"},
            {"number": "5.1", "title": "Medical Necessity Criteria", "summary": "InterQual 2023.1"},
            {"number": "7.1", "title": "Medical Necessity Disputes", "summary": "Peer-to-peer within 10 days"},
            {"number": "12.1", "title": "Material Breach", "summary": "Payment delays >60 days, inappropriate denials"}
        ],
        "tags": ["contract", "UHC", "payment terms", "medical necessity", "termination"]
    })
    
    # Humana Contract
    contracts.append({
        "contract_id": "CTR-HUM-2024-FL-001",
        "payer_id": "humana",
        "payer_name": "Humana",
        "contract_type": "Medicare Advantage Facility Agreement",
        "effective_date": "2024-01-01",
        "expiration_date": "2025-12-31",
        "auto_renewal": True,
        "termination_notice_days": 90,
        "full_text": """
# HUMANA FACILITY PARTICIPATION AGREEMENT

## Contract ID: CTR-HUM-2024-FL-001
## Facility: AdventHealth Orlando

### KEY CONTRACT TERMS

**Payment Terms (Section 4)**
- Clean claim payment: 30 calendar days
- Interest on late payment: 12% annually (Florida law)
- Electronic submission required

**Medical Necessity (Section 5)**
- InterQual criteria version 2023.2
- Concurrent review notification: 24 hours
- Prior authorization per Exhibit A

**Filing Requirements (Section 6)**
- Initial claims: 90 days
- Corrected claims: 120 days
- Appeals: 60 days

**Termination (Section 8)**
- Without cause: 90 days notice
- For cause: 30 days to cure
- Material breach: immediate with notice

### MATERIAL BREACH PROVISIONS

Section 12.1 defines material breach as:
a) Systematic claim payment delays exceeding 45 days
b) Denial rate exceeding 25% without clinical justification
c) Unilateral policy changes without notice
d) Failure to provide required member notices

---
[Abbreviated version - full contract on file]
""",
        "key_terms": {
            "payment_days": 30,
            "interest_rate": "12% annually",
            "timely_filing_days": 90,
            "appeal_days": 60,
            "termination_notice_days": 90,
            "interqual_version": "2023.2",
            "auto_renewal": True
        },
        "sections": [],
        "tags": ["contract", "Humana", "payment terms", "termination"]
    })
    
    return contracts


# =============================================================================
# DENIAL MANAGEMENT GUIDES
# =============================================================================

def generate_denial_guides() -> List[Dict]:
    """Generate denial code guides and appeal templates."""
    
    guides = []
    
    # CARC Code Reference
    guides.append({
        "guide_id": "GUIDE-CARC-2024",
        "title": "Claim Adjustment Reason Codes (CARC) Reference Guide",
        "category": "Denial Management",
        "last_updated": "2024-11-01",
        "content": """
# CARC Code Reference Guide

## Overview

Claim Adjustment Reason Codes (CARCs) are used on remittance advice to explain claim adjustments. Understanding these codes is essential for effective denial management.

## Most Common Denial CARCs

### CO-4: Procedure Code Inconsistent with Modifier/Diagnosis

**Meaning**: The procedure code billed does not match the modifier used or is not supported by the diagnosis code.

**Common Causes**:
- Missing or incorrect modifier
- Diagnosis code does not support medical necessity
- Gender/age mismatch

**Resolution**:
1. Review procedure and diagnosis code combination
2. Verify modifier is appropriate
3. Submit corrected claim with proper codes

**Appeal Strategy**: Provide documentation showing clinical appropriateness of procedure for diagnosis.

---

### CO-16: Missing/Incomplete Claim Information

**Meaning**: The claim is missing required data elements.

**Common Causes**:
- Missing NPI
- Incomplete patient demographics
- Missing date of service
- Missing place of service

**Resolution**:
1. Review claim for missing fields
2. Submit corrected claim with all required information

**Appeal Strategy**: Generally not appealable - resubmit corrected claim.

---

### CO-18: Duplicate Claim/Service

**Meaning**: The service has already been paid on another claim.

**Common Causes**:
- Claim submitted multiple times
- Service billed on wrong claim
- Bundling edit applied

**Resolution**:
1. Verify original claim was paid
2. If bundling edit, review unbundling rules
3. If truly duplicate, do not appeal

**Appeal Strategy**: If not duplicate, provide documentation showing distinct services.

---

### CO-29: Time Limit for Filing Expired

**Meaning**: The claim was submitted after the payer's timely filing deadline.

**Common Causes**:
- Claim not submitted within deadline
- Missing proof of timely filing
- Incorrect date calculation

**Resolution**:
1. Verify submission date
2. Gather proof of timely filing (clearinghouse report)
3. Appeal with documentation

**Appeal Strategy**: Provide clearinghouse receipt or other proof of original timely submission.

---

### CO-45: Charges Exceed Fee Schedule/Maximum Allowable

**Meaning**: The billed amount exceeds the contracted or allowed amount.

**Explanation**: This is typically a contractual adjustment, not a denial. The difference between billed and allowed is written off.

**Action**: No action needed - this is expected behavior for contracted providers.

---

### CO-50: Non-Covered Service

**Meaning**: The service is not covered under the member's benefit plan.

**Common Causes**:
- Service excluded from plan
- Benefit maximum reached
- Service not appropriate for diagnosis

**Resolution**:
1. Verify member benefits
2. Review medical necessity criteria
3. Consider billing patient if appropriate

**Appeal Strategy**: If medically necessary, appeal with clinical documentation.

---

### CO-96: Non-Covered Charge(s)

**Meaning**: Similar to CO-50 but may apply to specific line items rather than entire claim.

**Resolution**: Same as CO-50.

---

### CO-97: Payment Adjusted - Already Adjudicated

**Meaning**: The benefit for this service is included in the payment for another service.

**Common Causes**:
- Bundling edit applied
- Service included in global period
- Facility fee included in professional fee

**Resolution**:
1. Review bundling edits
2. Verify if services are truly distinct
3. Appeal with modifier 59 if appropriate

**Appeal Strategy**: Document distinct services with separate documentation.

---

### CO-197: Precertification/Authorization Absent

**Meaning**: Prior authorization was required but not obtained.

**Common Causes**:
- Auth not requested
- Auth obtained for different service
- Auth expired
- Retro auth not approved

**Resolution**:
1. Check if auth was obtained
2. Request retro auth if available
3. Appeal with clinical documentation

**Appeal Strategy**: Request retro authorization or provide clinical urgency documentation.

---

### CO-204: Service Not Authorized for Date of Service

**Meaning**: Authorization exists but does not cover the date the service was performed.

**Resolution**:
1. Verify auth dates
2. Request auth extension if possible
3. Appeal with clinical necessity for service date

---

### OA-23: Payment Adjusted - Medical Necessity

**Meaning**: The service does not meet medical necessity criteria.

**Common Causes**:
- Does not meet InterQual criteria
- Insufficient documentation
- Level of care not appropriate

**Resolution**:
1. Review InterQual criteria
2. Gather additional clinical documentation
3. Request peer-to-peer review

**Appeal Strategy**: 
- Obtain peer-to-peer review first
- Submit detailed clinical notes
- Reference specific criteria met
- Include physician attestation

---

## Remittance Advice Remark Codes (RARCs)

RARCs provide additional explanation for CARCs:

| RARC | Description |
|------|-------------|
| N362 | Missing/incomplete clinical documentation |
| N386 | Documentation does not support medical necessity |
| N479 | Service denied based on payer policy |
| N522 | Duplicate information submitted |
| N527 | Medical necessity criteria not met |
| N539 | Prior authorization was required |
| N545 | Payment based on fee schedule |
| N576 | Service not covered for this diagnosis |
| N591 | Documentation submitted does not support level billed |
| N657 | Service exceeds benefit limitation |

---

## Appeal Templates

### Medical Necessity Appeal Template

```
[Date]
[Payer Name]
[Appeals Department Address]

RE: Appeal for Medical Necessity Denial
    Member: [Name]
    Member ID: [ID]
    Claim #: [Number]
    DOS: [Date]
    Denial Code: OA-23

Dear Appeals Committee:

We are appealing the denial of [service] for the above-referenced member.

CLINICAL SUMMARY:
[Provide brief clinical history]

MEDICAL NECESSITY JUSTIFICATION:
The following criteria support medical necessity:
1. [Criterion 1]
2. [Criterion 2]
3. [Criterion 3]

SUPPORTING DOCUMENTATION:
- H&P dated [date]
- Progress notes [dates]
- Test results [specify]
- Physician attestation (attached)

REQUEST:
We respectfully request reconsideration of this denial based on the enclosed documentation.

Sincerely,
[Provider Name]
[Contact Information]

Enclosures: [List]
```

---

*This guide is updated quarterly. Last update: November 2024*
""",
        "tags": ["CARC", "denial codes", "appeals", "reference guide"]
    })
    
    return guides


# =============================================================================
# KNOWLEDGE GRAPH ENTITIES
# =============================================================================

def generate_knowledge_graph_data() -> Dict[str, List[Dict]]:
    """Generate entities and relationships for knowledge graph."""
    
    # Entities
    entities = []
    relationships = []
    
    # Payer entities
    for payer_id, payer in PAYERS.items():
        entities.append({
            "entity_id": f"PAYER_{payer_id.upper()}",
            "entity_type": "Payer",
            "name": payer["name"],
            "attributes": {
                "legal_name": payer["legal_name"],
                "edi_payer_id": payer["edi_payer_id"],
                "plan_types": payer["plan_types"],
                "region": payer["region"],
                "portal": payer["portal"]
            }
        })
    
    # Policy entities
    for policy in generate_medical_policies():
        entities.append({
            "entity_id": policy["policy_id"],
            "entity_type": "Policy",
            "name": policy["title"],
            "attributes": {
                "policy_type": policy["policy_type"],
                "effective_date": policy["effective_date"],
                "version": policy["version"],
                "status": policy["status"],
                "interqual_version": policy.get("interqual_version"),
                "prior_auth_required": policy.get("prior_auth_required", False)
            }
        })
        
        # Relationship: Payer -> Policy
        relationships.append({
            "relationship_id": f"REL_{policy['policy_id']}_PAYER",
            "source_entity": f"PAYER_{policy['payer_id'].upper()}",
            "target_entity": policy["policy_id"],
            "relationship_type": "HAS_POLICY",
            "attributes": {}
        })
        
        # Relationship: Policy -> CPT codes
        for cpt in policy.get("applicable_cpt_codes", []):
            entities.append({
                "entity_id": f"CPT_{cpt}",
                "entity_type": "CPT_Code",
                "name": cpt,
                "attributes": {}
            })
            relationships.append({
                "relationship_id": f"REL_{policy['policy_id']}_CPT_{cpt}",
                "source_entity": policy["policy_id"],
                "target_entity": f"CPT_{cpt}",
                "relationship_type": "APPLIES_TO",
                "attributes": {}
            })
    
    # CARC code entities
    carc_codes = {
        "CO-4": "Procedure code inconsistent with modifier or diagnosis",
        "CO-16": "Missing/incomplete claim information",
        "CO-18": "Duplicate claim/service",
        "CO-29": "Time limit for filing has expired",
        "CO-45": "Charges exceed fee schedule/maximum allowable",
        "CO-50": "Non-covered service",
        "CO-96": "Non-covered charge(s)",
        "CO-97": "Payment adjusted - already adjudicated",
        "CO-197": "Precertification/authorization/notification absent",
        "CO-204": "Service not authorized on this date of service",
        "OA-23": "Payment adjusted - medical necessity"
    }
    
    for code, desc in carc_codes.items():
        entities.append({
            "entity_id": f"CARC_{code.replace('-', '_')}",
            "entity_type": "CARC_Code",
            "name": code,
            "attributes": {
                "description": desc,
                "category": code.split("-")[0]
            }
        })
    
    # Service category entities
    service_categories = {
        "observation": "Observation Services (99218-99226)",
        "emergency": "Emergency Department (99281-99285)",
        "inpatient": "Inpatient Hospital (99221-99239)",
        "imaging": "Advanced Imaging (CT/MRI/PET)",
        "surgery": "Surgical Procedures",
        "laboratory": "Laboratory Services",
        "cardiology": "Cardiology Services"
    }
    
    for cat_id, cat_name in service_categories.items():
        entities.append({
            "entity_id": f"SERVICE_{cat_id.upper()}",
            "entity_type": "Service_Category",
            "name": cat_name,
            "attributes": {}
        })
    
    return {
        "entities": entities,
        "relationships": relationships
    }


# =============================================================================
# FAQ AND COMMON QUESTIONS
# =============================================================================

def generate_faq_data() -> List[Dict]:
    """Generate FAQ data for common payer questions."""
    
    faqs = [
        {
            "faq_id": "FAQ-001",
            "question": "Why is UHC denying observation cases?",
            "answer": """UnitedHealthcare updated their observation policy (UHC-OBS-2024-001) effective November 1, 2024. Key changes include:

1. **InterQual Version Update**: Now using InterQual 2024.2 instead of 2023.1
2. **Physician Attestation**: Must be documented within 4 hours (previously 8 hours)
3. **24-Hour Threshold**: Documentation required if observation exceeds 24 hours
4. **Reassessment Frequency**: Every 8 hours (previously 12 hours)

**Impact**: We're seeing a 15% increase in observation denials since November 15.

**Contract Violation**: This may violate Section 7.1 of our contract which specifies InterQual 2023.1 criteria.

**Recommended Actions**:
- Request peer-to-peer reviews for pending denials
- Send formal contract violation notice
- Schedule executive meeting with UHC regional VP""",
            "payers": ["uhc"],
            "categories": ["observation", "denials", "policy change"],
            "confidence": 0.94
        },
        {
            "faq_id": "FAQ-002",
            "question": "What is our payment velocity violation with UHC?",
            "answer": """Our contract with UHC (Section 4.1) specifies 30-day payment terms for clean claims. Current performance:

**Contract**: 30 days
**Actual**: 38 days average
**Violation**: 8 days over contract

**Financial Impact**:
- Delayed cash flow: ~$12.4M
- Interest owed (per Section 4.2): ~$124K at 1% monthly

**Evidence**:
- 835 remittance data shows consistent 35-42 day payment cycles
- Pattern began September 2024

**Recommended Actions**:
1. Send formal interest claim per contract Section 4.2
2. Document pattern for potential material breach claim (Section 12.1)
3. Include in next JOC meeting agenda""",
            "payers": ["uhc"],
            "categories": ["payment", "contract violation", "cash velocity"],
            "confidence": 0.96
        },
        {
            "faq_id": "FAQ-003",
            "question": "Should we terminate the Humana contract?",
            "answer": """Based on Monte Carlo simulation analysis (1,000 scenarios):

**Termination Analysis Summary**:
| Scenario | Net Impact | Retention | Break-Even |
|----------|-----------|-----------|------------|
| P10 (Pessimistic) | -$12.4M | 78% | 18 months |
| P50 (Expected) | +$8.2M | 86% | 6 months |
| P90 (Optimistic) | +$24.6M | 92% | Immediate |

**Favorable Outcome Probability**: 73%

**Key Factors**:
- Current yield: 71.8% (worst in portfolio)
- Denial rate: 28.2%
- Payment velocity: 42 days (12 over contract)
- Annual revenue at risk: $412M

**Recommendation**: Consider termination with 90-day notice period per contract Section 8.3. Expected net positive outcome with 6-month break-even in most scenarios.

**Required Steps**:
1. Board approval required
2. 90-day notice to Humana
3. Patient transition plan
4. Alternative payer negotiations""",
            "payers": ["humana"],
            "categories": ["termination", "contract", "strategic"],
            "confidence": 0.89
        },
        {
            "faq_id": "FAQ-004",
            "question": "What are the top denial reasons for UHC?",
            "answer": """Top 5 CARC codes for UnitedHealthcare (last 30 days):

| Rank | CARC | Description | Amount | % of Denials |
|------|------|-------------|--------|--------------|
| 1 | CO-4 | Procedure/diagnosis mismatch | $3.2M | 18% |
| 2 | CO-197 | Prior auth not obtained | $2.8M | 15% |
| 3 | OA-23 | Medical necessity | $2.1M | 12% |
| 4 | CO-50 | Non-covered service | $1.4M | 8% |
| 5 | CO-29 | Timely filing | $0.7M | 4% |

**Root Causes**:
1. **CO-4**: Often related to observation downgrades
2. **CO-197**: New prior auth requirements for imaging (Oct 2024)
3. **OA-23**: InterQual criteria changes

**Trending**: OA-23 denials increased 45% since November (observation policy change)""",
            "payers": ["uhc"],
            "categories": ["denials", "CARC codes", "analysis"],
            "confidence": 0.92
        },
        {
            "faq_id": "FAQ-005",
            "question": "How do I appeal a medical necessity denial?",
            "answer": """Medical necessity appeal process:

**Step 1: Peer-to-Peer Review** (within 10 business days)
- Call payer's clinical review line
- Have attending physician available
- Reference specific InterQual criteria

**Step 2: Written Appeal** (within 60 days)
Required elements:
- Member information
- Claim number and DOS
- Clinical summary
- Specific criteria met
- Supporting documentation
- Physician attestation

**Step 3: External Review** (Medicare Advantage)
- Available if internal appeal denied
- Independent review organization
- 45-day timeline

**Documentation Checklist**:
☐ H&P with admission criteria
☐ Progress notes showing clinical status
☐ Test results supporting severity
☐ Physician attestation statement
☐ InterQual criteria reference

**Contact Numbers**:
- UHC Appeals: 1-888-936-7246
- Humana Appeals: 1-800-457-4708
- Florida Blue Appeals: 1-800-727-2227""",
            "payers": ["uhc", "humana", "bcbs", "aetna", "cigna"],
            "categories": ["appeals", "medical necessity", "process"],
            "confidence": 0.95
        }
    ]
    
    return faqs


# =============================================================================
# OUTPUT FUNCTIONS
# =============================================================================

def save_documents(output_dir: str, format_type: str):
    """Save all policy documents in requested format."""
    
    os.makedirs(output_dir, exist_ok=True)
    
    print("📚 Generating Policy Documents...")
    
    # Generate all data
    policies = generate_medical_policies()
    contracts = generate_contract_documents()
    guides = generate_denial_guides()
    kg_data = generate_knowledge_graph_data()
    faqs = generate_faq_data()
    
    print(f"   Generated {len(policies)} medical policies")
    print(f"   Generated {len(contracts)} contract documents")
    print(f"   Generated {len(guides)} reference guides")
    print(f"   Generated {len(kg_data['entities'])} knowledge graph entities")
    print(f"   Generated {len(kg_data['relationships'])} knowledge graph relationships")
    print(f"   Generated {len(faqs)} FAQ entries")
    
    if format_type in ["json", "all"]:
        print("\n📄 Saving JSON files...")
        
        # Policies
        with open(os.path.join(output_dir, "medical_policies.json"), "w") as f:
            json.dump(policies, f, indent=2)
        
        # Contracts
        with open(os.path.join(output_dir, "contracts.json"), "w") as f:
            json.dump(contracts, f, indent=2)
        
        # Guides
        with open(os.path.join(output_dir, "denial_guides.json"), "w") as f:
            json.dump(guides, f, indent=2)
        
        # Knowledge graph
        with open(os.path.join(output_dir, "knowledge_graph.json"), "w") as f:
            json.dump(kg_data, f, indent=2)
        
        # FAQs
        with open(os.path.join(output_dir, "faqs.json"), "w") as f:
            json.dump(faqs, f, indent=2)
        
        # Payer reference
        with open(os.path.join(output_dir, "payers.json"), "w") as f:
            json.dump(PAYERS, f, indent=2)
    
    if format_type in ["markdown", "all"]:
        print("\n📝 Saving Markdown files...")
        
        md_dir = os.path.join(output_dir, "markdown")
        os.makedirs(md_dir, exist_ok=True)
        
        # Save each policy as markdown
        for policy in policies:
            filename = f"{policy['policy_id']}.md"
            with open(os.path.join(md_dir, filename), "w") as f:
                f.write(f"# {policy['title']}\n\n")
                f.write(f"**Policy ID**: {policy['policy_id']}\n")
                f.write(f"**Payer**: {policy['payer_name']}\n")
                f.write(f"**Type**: {policy['policy_type']}\n")
                f.write(f"**Effective**: {policy['effective_date']}\n")
                f.write(f"**Version**: {policy['version']}\n\n")
                f.write(policy['full_text'])
        
        # Save contracts
        for contract in contracts:
            filename = f"{contract['contract_id']}.md"
            with open(os.path.join(md_dir, filename), "w") as f:
                f.write(contract['full_text'])
        
        # Save guides
        for guide in guides:
            filename = f"{guide['guide_id']}.md"
            with open(os.path.join(md_dir, filename), "w") as f:
                f.write(guide['content'])
    
    if format_type in ["chunks", "all"]:
        print("\n🧩 Generating text chunks for embedding...")
        
        chunks = []
        chunk_id = 0
        
        # Chunk policies
        for policy in policies:
            # Summary chunk
            chunks.append({
                "chunk_id": f"chunk_{chunk_id:05d}",
                "source_id": policy["policy_id"],
                "source_type": "policy",
                "payer_id": policy["payer_id"],
                "chunk_type": "summary",
                "text": f"{policy['title']}. {policy['summary']}. Effective {policy['effective_date']}. Version {policy['version']}.",
                "metadata": {
                    "policy_type": policy["policy_type"],
                    "tags": policy["tags"]
                }
            })
            chunk_id += 1
            
            # Full text chunks (split by sections)
            sections = policy["full_text"].split("\n### ")
            for section in sections:
                if len(section.strip()) > 100:
                    chunks.append({
                        "chunk_id": f"chunk_{chunk_id:05d}",
                        "source_id": policy["policy_id"],
                        "source_type": "policy",
                        "payer_id": policy["payer_id"],
                        "chunk_type": "section",
                        "text": section[:2000],  # Limit chunk size
                        "metadata": {
                            "policy_type": policy["policy_type"]
                        }
                    })
                    chunk_id += 1
        
        # Chunk FAQs
        for faq in faqs:
            chunks.append({
                "chunk_id": f"chunk_{chunk_id:05d}",
                "source_id": faq["faq_id"],
                "source_type": "faq",
                "payer_id": faq["payers"][0] if faq["payers"] else None,
                "chunk_type": "qa",
                "text": f"Question: {faq['question']}\n\nAnswer: {faq['answer']}",
                "metadata": {
                    "categories": faq["categories"],
                    "confidence": faq["confidence"]
                }
            })
            chunk_id += 1
        
        # Save chunks
        with open(os.path.join(output_dir, "text_chunks.json"), "w") as f:
            json.dump(chunks, f, indent=2)
        
        # Also save as JSONL for easier processing
        with open(os.path.join(output_dir, "text_chunks.jsonl"), "w") as f:
            for chunk in chunks:
                f.write(json.dumps(chunk) + "\n")
        
        print(f"   Generated {len(chunks)} text chunks")
    
    print("\n✅ Policy documents saved")


# =============================================================================
# MAIN
# =============================================================================

def main():
    parser = argparse.ArgumentParser(description="Generate Payer Policy Documents for RAG")
    parser.add_argument("--output", "-o", default="./policy_docs", help="Output directory")
    parser.add_argument("--format", "-f", choices=["json", "markdown", "chunks", "all"], 
                        default="all", help="Output format")
    args = parser.parse_args()
    
    print("=" * 60)
    print("PAYER POLICY DOCUMENT GENERATOR FOR RAG")
    print("=" * 60)
    
    save_documents(args.output, args.format)
    
    print("\n" + "=" * 60)
    print("✅ DOCUMENT GENERATION COMPLETE")
    print("=" * 60)
    print(f"\nOutput directory: {args.output}")
    print("\nGenerated files:")
    print("   • medical_policies.json - Detailed payer policies")
    print("   • contracts.json - Contract terms and excerpts")
    print("   • denial_guides.json - CARC code reference")
    print("   • knowledge_graph.json - Entities and relationships")
    print("   • faqs.json - Common questions and answers")
    print("   • payers.json - Payer reference data")
    print("   • text_chunks.json/jsonl - Pre-chunked text for embedding")
    print("   • markdown/ - Human-readable policy documents")
    print("\nNext steps:")
    print("   1. Generate embeddings from text_chunks.jsonl")
    print("   2. Load knowledge_graph.json into graph database")
    print("   3. Index FAQs for quick retrieval")


if __name__ == "__main__":
    main()
