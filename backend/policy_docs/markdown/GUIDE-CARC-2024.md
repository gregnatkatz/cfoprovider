
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
