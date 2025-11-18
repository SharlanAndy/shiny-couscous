#!/usr/bin/env python3
"""
Seed script to create a sample Labuan Company Management License Application form.

This form is based on the official Labuan FSA form documentation.
"""

import asyncio
import json
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from labuan_fsa.database import AsyncSessionLocal, init_db
from labuan_fsa.models.form import Form


def create_labuan_company_management_form_schema():
    """Create the Labuan Company Management License Application form schema."""
    return {
        "formId": "labuan-company-management-license",
        "formName": "Application for Licence to Carry on Labuan Company Management Business",
        "version": "1.0.0",
        "steps": [
            {
                "stepId": "step-1-general-info",
                "stepName": "General Information",
                "stepOrder": 1,
                "stepDescription": "Party responsible for submission and officer details",
                "fields": [
                    {
                        "fieldId": "important-notes",
                        "fieldType": "help-text",
                        "fieldName": "importantNotes",
                        "label": "IMPORTANT NOTES",
                        "content": """1. The completed application form and supporting documents should be submitted to:
Head of Authorization and Licensing Unit
Labuan Financial Services Authority
Level 17, Main Office Tower
Financial Park Complex
Jalan Merdeka
87000 Labuan F.T.
Malaysia

2. Applicant may also submit a soft copy of the completed application form and supporting documents via email to licensing@labuanfsa.gov.my for preliminary review by the officer.

3. Submission of application which does not comply with Labuan FSA's requirement or which are unsatisfactory may be returned.

4. The form and supporting documents serves as general requirement of the application, Labuan FSA reserves the right to request for additional information and/or documents to support the application.

5. Any information supplied pursuant to this form will be dealt with in confidence in accordance with Section 178 of the Labuan Financial Services and Securities Act 2010/Section 139 of the Labuan Islamic Financial Services and Securities Act 2010.

6. Documents may be certified by any authorised person including, but not limited to, commissioner for oaths, notary public, certified public accountants, advocates or solicitors, company secretaries and Malaysian/foreign embassies. Copy of bank statements must be certified by the bank. Where documents are not in the national language of Malaysia or in English, please provide English-translated version of the documents, duly certified/notarized.

7. This document belongs to Labuan FSA, no modification or tampering with the format or its contents is permitted.

8. Labuan FSA has a whistle blowing policy in place where suppliers, consultants or even members of the public can report to the Designated Officers in writing as per the Whistle Blowing Disclosure Form if there is any element of wrongdoings by any staff of Labuan FSA or its subsidiaries in relation to the application or licence being awarded.

9. For details of applicable legislations and guidelines pertaining to company management business, please visit our website at www.labuanfsa.gov.my.

10. Processing fee and client charter:
   • Normal Processing: USD 350.00 (30 working days)
   • Fast Track Processing: USD 1,550.00 (15 working days)

11. Terms and conditions of fast track application:
   (i) Labuan FSA reserved the right to accept or decline any fast track application submitted.
   (ii) The fast track processing timeline will only commence upon compliance with the following:
       (a) Submission of complete documentation;
       (b) Payment of fast track processing fee; and
       (c) Acceptance of fast track application by Labuan FSA.
   (iii) The fast track processing fee will be forfeited should the applicant decided to withdraw after the fast track application has been accepted by Labuan FSA.
   (iv) Labuan FSA reserved the right to change the status of the application from fast track to normal processing. The applicant will be notified and the fast track processing fee paid will be refunded accordingly.""",
                        "format": "plain",
                        "position": "above",
                        "required": False,
                        "hidden": False,
                        "style": {
                            "containerClassName": "bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6",
                            "className": "text-sm text-gray-800 whitespace-pre-line leading-relaxed"
                        }
                    },
                    {
                        "fieldId": "party-responsible",
                        "fieldType": "radio",
                        "fieldName": "partyResponsible",
                        "label": "Party responsible for submission of application",
                        "required": True,
                        "options": [
                            {"value": "applicant-shareholder", "label": "Applicant's Shareholder/Head Office"},
                            {"value": "labuan-trust-company", "label": "Labuan Trust Company"},
                            {"value": "others", "label": "Others"}
                        ],
                        "defaultValue": None
                    },
                    {
                        "fieldId": "party-responsible-other",
                        "fieldType": "text-input",
                        "inputType": "text",
                        "fieldName": "partyResponsibleOther",
                        "label": "Please specify (if Others)",
                        "required": False,
                        "placeholder": "Enter party responsible",
                        "conditionalDisplay": {
                            "when": "partyResponsible",
                            "equals": "others",
                            "show": True
                        }
                    },
                    {
                        "fieldId": "officer-name",
                        "fieldType": "text-input",
                        "inputType": "text",
                        "fieldName": "officerName",
                        "label": "Officer Name",
                        "required": True,
                        "placeholder": "Enter officer name"
                    },
                    {
                        "fieldId": "officer-company",
                        "fieldType": "text-input",
                        "inputType": "text",
                        "fieldName": "officerCompany",
                        "label": "Company",
                        "required": True,
                        "placeholder": "Enter company name"
                    },
                    {
                        "fieldId": "officer-designation",
                        "fieldType": "text-input",
                        "inputType": "text",
                        "fieldName": "officerDesignation",
                        "label": "Designation",
                        "required": True,
                        "placeholder": "Enter designation"
                    },
                    {
                        "fieldId": "officer-contact",
                        "fieldType": "phone",
                        "fieldName": "officerContact",
                        "label": "Contact No.",
                        "required": True,
                        "placeholder": "+60 X-XXX XXXX"
                    },
                    {
                        "fieldId": "officer-email",
                        "fieldType": "email",
                        "fieldName": "officerEmail",
                        "label": "Email",
                        "required": True,
                        "placeholder": "officer@example.com"
                    },
                    {
                        "fieldId": "how-know-labuan",
                        "fieldType": "checkbox",
                        "fieldName": "howKnowLabuan",
                        "label": "How do you know about Labuan IBFC?",
                        "required": True,
                        "options": [
                            {"value": "website", "label": "Website"},
                            {"value": "newspaper-media", "label": "Newspaper/Media"},
                            {"value": "previous-experience", "label": "Previous Experience"},
                            {"value": "business-referral", "label": "Business Referral"},
                            {"value": "labuan-trust-company", "label": "Labuan Trust Company"},
                            {"value": "labuan-ibfc-inc", "label": "Labuan IBFC Inc. Sdn. Bhd."},
                            {"value": "others", "label": "Others"}
                        ],
                        "multiple": True
                    },
                    {
                        "fieldId": "how-know-labuan-other",
                        "fieldType": "text-input",
                        "inputType": "text",
                        "fieldName": "howKnowLabuanOther",
                        "label": "Please specify (if Others)",
                        "required": False,
                        "placeholder": "Enter how you know about Labuan IBFC",
                        "conditionalDisplay": {
                            "when": "howKnowLabuan",
                            "contains": "others",
                            "show": True
                        }
                    },
                    {
                        "fieldId": "consent-disclosure",
                        "fieldType": "radio",
                        "fieldName": "consentDisclosure",
                        "label": "Consent for disclosure of information to be used for marketing/promotional purposes by Labuan FSA and Labuan IBFC Inc. Sdn. Bhd.",
                        "required": True,
                        "options": [
                            {"value": "yes", "label": "Yes"},
                            {"value": "no", "label": "No"}
                        ]
                    }
                ]
            },
            {
                "stepId": "step-2-applicant-profile",
                "stepName": "Profile of Applicant",
                "stepOrder": 2,
                "stepDescription": "Information about the proposed Labuan company",
                "fields": [
                    {
                        "fieldId": "applicant-name",
                        "fieldType": "text-input",
                        "inputType": "text",
                        "fieldName": "applicantName",
                        "label": "Name of Applicant (refers to the proposed Labuan company)",
                        "required": True,
                        "placeholder": "Enter proposed company name"
                    },
                    {
                        "fieldId": "license-type",
                        "fieldType": "checkbox",
                        "fieldName": "licenseType",
                        "label": "Type of Licence Applied",
                        "required": True,
                        "options": [
                            {"value": "conventional", "label": "Conventional"},
                            {"value": "islamic", "label": "Islamic"}
                        ],
                        "multiple": True
                    },
                    {
                        "fieldId": "legal-entity",
                        "fieldType": "radio",
                        "fieldName": "legalEntity",
                        "label": "Nature of Legal Entity",
                        "required": True,
                        "options": [
                            {"value": "labuan-company-subsidiary", "label": "Labuan Company - Subsidiary"},
                            {"value": "foreign-labuan-company-branch", "label": "Foreign Labuan Company - Branch"}
                        ]
                    },
                    {
                        "fieldId": "marketing-office",
                        "fieldType": "radio",
                        "fieldName": "marketingOffice",
                        "label": "Marketing Office to be Established",
                        "required": True,
                        "options": [
                            {"value": "yes", "label": "Yes"},
                            {"value": "no", "label": "No"}
                        ]
                    },
                    {
                        "fieldId": "paid-up-capital",
                        "fieldType": "currency",
                        "fieldName": "paidUpCapital",
                        "label": "Proposed Paid-up Capital/Working Fund",
                        "required": True,
                        "placeholder": "0.00",
                        "currency": "USD",
                        "helpText": "Please specify currency used"
                    },
                    {
                        "fieldId": "processing-type",
                        "fieldType": "radio",
                        "fieldName": "processingType",
                        "label": "Processing Type",
                        "required": True,
                        "options": [
                            {"value": "normal", "label": "Normal (USD 350.00 - 30 working days)"},
                            {"value": "fast-track", "label": "Fast Track (USD 1,550.00 - 15 working days)"}
                        ],
                        "helpText": "Select your preferred processing type and timeline"
                    },
                    {
                        "fieldId": "shareholders",
                        "fieldType": "repeater",
                        "fieldName": "shareholders",
                        "label": "Proposed Shareholder(s)",
                        "required": True,
                        "helpText": "Each shareholder is required to complete Part II and/or Part III",
                        "fields": [
                            {
                                "fieldId": "shareholder-name",
                                "fieldType": "text-input",
                                "inputType": "text",
                                "fieldName": "shareholderName",
                                "label": "Name of Shareholder",
                                "required": True
                            },
                            {
                                "fieldId": "shareholder-country",
                                "fieldType": "text-input",
                                "inputType": "text",
                                "fieldName": "shareholderCountry",
                                "label": "Country of Origin",
                                "required": True
                            },
                            {
                                "fieldId": "shareholder-percentage",
                                "fieldType": "percentage",
                                "fieldName": "shareholderPercentage",
                                "label": "Percentage of Shareholding",
                                "required": True,
                                "min": 0,
                                "max": 100
                            }
                        ]
                    },
                    {
                        "fieldId": "directors",
                        "fieldType": "repeater",
                        "fieldName": "directors",
                        "label": "Proposed Director(s)/Principal Officer",
                        "required": True,
                        "helpText": "Each Director/Principal Officer is required to complete Part IV",
                        "fields": [
                            {
                                "fieldId": "director-name",
                                "fieldType": "text-input",
                                "inputType": "text",
                                "fieldName": "directorName",
                                "label": "Name of Director",
                                "required": True
                            },
                            {
                                "fieldId": "director-nationality",
                                "fieldType": "text-input",
                                "inputType": "text",
                                "fieldName": "directorNationality",
                                "label": "Nationality",
                                "required": True
                            },
                            {
                                "fieldId": "director-position",
                                "fieldType": "text-input",
                                "inputType": "text",
                                "fieldName": "directorPosition",
                                "label": "Position to be Held",
                                "required": True
                            }
                        ]
                    },
                    {
                        "fieldId": "shariah-advisors",
                        "fieldType": "repeater",
                        "fieldName": "shariahAdvisors",
                        "label": "Proposed Shariah Advisor(s) (if applicable)",
                        "required": False,
                        "helpText": "Only required for Islamic license type",
                        "fields": [
                            {
                                "fieldId": "advisor-name",
                                "fieldType": "text-input",
                                "inputType": "text",
                                "fieldName": "advisorName",
                                "label": "Name of Advisor",
                                "required": True
                            },
                            {
                                "fieldId": "advisor-nationality",
                                "fieldType": "text-input",
                                "inputType": "text",
                                "fieldName": "advisorNationality",
                                "label": "Nationality",
                                "required": True
                            },
                            {
                                "fieldId": "advisor-experience",
                                "fieldType": "number",
                                "fieldName": "advisorExperience",
                                "label": "Years of Experience in Islamic Financial Business",
                                "required": True,
                                "min": 0
                            }
                        ]
                    },
                    {
                        "fieldId": "other-information",
                        "fieldType": "rich-text",
                        "fieldName": "otherInformation",
                        "label": "Any Other Information Relevant For Consideration of the Application",
                        "required": False,
                        "placeholder": "Enter any additional relevant information"
                    }
                ]
            },
            {
                "stepId": "step-3-business-plan",
                "stepName": "Business Plan & Financial Projection",
                "stepOrder": 3,
                "stepDescription": "Business operational and strategic plan with financial projections",
                "fields": [
                    {
                        "fieldId": "objective-establishment",
                        "fieldType": "rich-text",
                        "fieldName": "objectiveEstablishment",
                        "label": "Objective of Establishment",
                        "required": True,
                        "placeholder": "Describe the objective of establishing this business"
                    },
                    {
                        "fieldId": "type-products-services",
                        "fieldType": "rich-text",
                        "fieldName": "typeProductsServices",
                        "label": "Type of Products/Services",
                        "required": True,
                        "placeholder": "Describe the types of products and services to be offered"
                    },
                    {
                        "fieldId": "target-market",
                        "fieldType": "table",
                        "fieldName": "targetMarket",
                        "label": "Target Market",
                        "required": True,
                        "helpText": "Specify whether it is individual and/or corporate client and the percentage",
                        "columns": [
                            {"key": "territorialScope", "label": "Territorial Scope", "type": "text"},
                            {"key": "percentage", "label": "%", "type": "number"}
                        ]
                    },
                    {
                        "fieldId": "territorial-scope",
                        "fieldType": "table",
                        "fieldName": "territorialScope",
                        "label": "Territorial Scope",
                        "required": True,
                        "helpText": "Specify the country and percentage",
                        "columns": [
                            {"key": "country", "label": "Country", "type": "text"},
                            {"key": "percentage", "label": "%", "type": "number"}
                        ]
                    },
                    {
                        "fieldId": "business-operational-plan",
                        "fieldType": "rich-text",
                        "fieldName": "businessOperationalPlan",
                        "label": "Business Operational and Strategic Plan",
                        "required": True,
                        "helpText": "A credible and viable business plan including Treasury Processing Services, Managerial Services, etc.",
                        "placeholder": "Provide a comprehensive business operational and strategic plan"
                    },
                    {
                        "fieldId": "internal-policies",
                        "fieldType": "rich-text",
                        "fieldName": "internalPolicies",
                        "label": "Internal policies and controls that commensurate with the business profile or risks",
                        "required": True,
                        "placeholder": "Describe internal policies and controls"
                    },
                    {
                        "fieldId": "marketing-strategy",
                        "fieldType": "rich-text",
                        "fieldName": "marketingStrategy",
                        "label": "Marketing Strategy",
                        "required": True,
                        "placeholder": "Describe your marketing strategy"
                    },
                    {
                        "fieldId": "manpower-planning",
                        "fieldType": "table",
                        "fieldName": "manpowerPlanning",
                        "label": "Manpower Planning",
                        "required": True,
                        "columns": [
                            {"key": "category", "label": "Category", "type": "text"},
                            {"key": "malaysian", "label": "Malaysian", "type": "number"},
                            {"key": "nonMalaysian", "label": "Non-Malaysian", "type": "number"},
                            {"key": "total", "label": "Total", "type": "number"},
                            {"key": "expectedRemuneration", "label": "Expected Remuneration", "type": "currency"}
                        ]
                    },
                    {
                        "fieldId": "functional-structure-labuan",
                        "fieldType": "rich-text",
                        "fieldName": "functionalStructureLabuan",
                        "label": "Functional Structure of Management Office in Labuan",
                        "required": True,
                        "placeholder": "Describe the functional structure"
                    },
                    {
                        "fieldId": "functional-structure-marketing",
                        "fieldType": "rich-text",
                        "fieldName": "functionalStructureMarketing",
                        "label": "Functional Structure of Marketing Office (if any)",
                        "required": False,
                        "placeholder": "Describe the functional structure of marketing office"
                    },
                    {
                        "fieldId": "financial-projection-currency",
                        "fieldType": "select",
                        "fieldName": "financialProjectionCurrency",
                        "label": "Currency for Financial Projection",
                        "required": True,
                        "options": [
                            {"value": "USD", "label": "USD - US Dollar"},
                            {"value": "MYR", "label": "MYR - Malaysian Ringgit"},
                            {"value": "EUR", "label": "EUR - Euro"},
                            {"value": "GBP", "label": "GBP - British Pound"},
                            {"value": "SGD", "label": "SGD - Singapore Dollar"}
                        ]
                    },
                    {
                        "fieldId": "financial-projection-income",
                        "fieldType": "table",
                        "fieldName": "financialProjectionIncome",
                        "label": "Three Years Financial Projection - Statement of Comprehensive Income",
                        "required": True,
                        "columns": [
                            {"key": "item", "label": "Item", "type": "text"},
                            {"key": "year1", "label": "Year 1", "type": "currency"},
                            {"key": "year2", "label": "Year 2", "type": "currency"},
                            {"key": "year3", "label": "Year 3", "type": "currency"}
                        ],
                        "defaultRows": [
                            {"item": "Revenue"},
                            {"item": "Operating Expenses"},
                            {"item": "Operating Profit/(Loss)"},
                            {"item": "Other Income"},
                            {"item": "General and Administrative Expenses"},
                            {"item": "Income/(Loss) Before Tax"},
                            {"item": "Tax"},
                            {"item": "Income/(Loss) After Tax"}
                        ]
                    },
                    {
                        "fieldId": "financial-projection-balance",
                        "fieldType": "table",
                        "fieldName": "financialProjectionBalance",
                        "label": "Three Years Financial Projection - Statement of Financial Position",
                        "required": True,
                        "columns": [
                            {"key": "item", "label": "Item", "type": "text"},
                            {"key": "year1", "label": "Year 1", "type": "currency"},
                            {"key": "year2", "label": "Year 2", "type": "currency"},
                            {"key": "year3", "label": "Year 3", "type": "currency"}
                        ],
                        "defaultRows": [
                            {"item": "Non-current assets"},
                            {"item": "Current assets"},
                            {"item": "Total Assets"},
                            {"item": "Long term liabilities"},
                            {"item": "Short term liabilities"},
                            {"item": "Total Liabilities"},
                            {"item": "Head office account / paid up capital"},
                            {"item": "Retained profits / accumulated losses"},
                            {"item": "Other reserves"},
                            {"item": "Total Shareholders' Funds / Head Office Account"}
                        ]
                    },
                    {
                        "fieldId": "projection-basis",
                        "fieldType": "rich-text",
                        "fieldName": "projectionBasis",
                        "label": "Basis of Assumption",
                        "required": True,
                        "helpText": "Please provide basis of assumption in deriving to the projected figure",
                        "placeholder": "Explain the basis and assumptions used for the financial projections"
                    }
                ]
            },
            {
                "stepId": "step-4-documents",
                "stepName": "Supporting Documents",
                "stepOrder": 4,
                "stepDescription": "Upload all required supporting documents",
                "fields": [
                    {
                        "fieldId": "document-checklist",
                        "fieldType": "document-checklist",
                        "fieldName": "documentChecklist",
                        "label": "Required Documents Checklist",
                        "required": True,
                        "documents": [
                            {
                                "id": "corporate-shareholding-structure",
                                "label": "Detailed information of applicant's shareholder(s) - Group corporate shareholding structure",
                                "required": True
                            },
                            {
                                "id": "certificate-incorporation",
                                "label": "Certified true copy of certificate of incorporation",
                                "required": True
                            },
                            {
                                "id": "certificate-license",
                                "label": "Certified true copy of certificate of licence granted by relevant authority(s)",
                                "required": False
                            },
                            {
                                "id": "letter-awareness",
                                "label": "Letter of awareness or approvals of authorities from the home country",
                                "required": True
                            },
                            {
                                "id": "board-resolution",
                                "label": "Certified true copy of board resolution or minutes of general meeting",
                                "required": True
                            },
                            {
                                "id": "memorandum-articles",
                                "label": "Certified true copy of memorandum & articles of association",
                                "required": True
                            },
                            {
                                "id": "audited-financial-statements",
                                "label": "Copy of two (2) years audited financial statements/annual reports",
                                "required": True
                            },
                            {
                                "id": "letter-guarantee",
                                "label": "Letter of guarantee or undertaking by shareholder/head office",
                                "required": True
                            },
                            {
                                "id": "nric-passport",
                                "label": "Certified true copy of NRIC (Malaysian) or passport (non-Malaysian)",
                                "required": True
                            },
                            {
                                "id": "academic-certificates",
                                "label": "Certified true copy of relevant academic and professional certificates",
                                "required": True
                            },
                            {
                                "id": "referral-letters",
                                "label": "Two (2) referral letters from corporations, institutions and/or professional bodies",
                                "required": True
                            },
                            {
                                "id": "net-worth-statement",
                                "label": "Net worth statement certified by qualified accountant or bank statements",
                                "required": True
                            },
                            {
                                "id": "organisation-chart",
                                "label": "Proposed organisation chart of the applicant",
                                "required": True
                            },
                            {
                                "id": "declaration-true-correct",
                                "label": "Declaration of True and Correct Information Submitted",
                                "required": True
                            },
                            {
                                "id": "statutory-declaration-service-provider",
                                "label": "Statutory Declaration by Service Provider Responsible for Submission",
                                "required": True
                            },
                            {
                                "id": "kyc-policy",
                                "label": "Framework on Know-Your-Customers' policy and AML compliance",
                                "required": True
                            }
                        ]
                    },
                    {
                        "fieldId": "supporting-documents",
                        "fieldType": "file-upload",
                        "fieldName": "supportingDocuments",
                        "label": "Upload Supporting Documents",
                        "required": True,
                        "multiple": True,
                        "maxFileSize": 10485760,
                        "allowedExtensions": [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"],
                        "helpText": "Upload all required documents. Maximum file size: 10MB per file. Accepted formats: PDF, DOC, DOCX, JPG, JPEG, PNG"
                    }
                ]
            },
            {
                "stepId": "step-5-declaration",
                "stepName": "Declaration & Submission",
                "stepOrder": 5,
                "stepDescription": "Review and confirm your application",
                "fields": [
                    {
                        "fieldId": "declaration-accurate",
                        "fieldType": "checkbox",
                        "fieldName": "declarationAccurate",
                        "label": "I declare that all information submitted in this application is accurate, true and correct",
                        "required": True,
                        "options": [
                            {"value": "yes", "label": "Yes, I confirm"}
                        ],
                        "multiple": False
                    },
                    {
                        "fieldId": "declaration-understand",
                        "fieldType": "checkbox",
                        "fieldName": "declarationUnderstand",
                        "label": "I understand that making any misrepresentation in this application is an offence punishable pursuant to Section 192 of the LFSSA",
                        "required": True,
                        "options": [
                            {"value": "yes", "label": "Yes, I understand"}
                        ],
                        "multiple": False
                    },
                    {
                        "fieldId": "declaration-consent",
                        "fieldType": "checkbox",
                        "fieldName": "declarationConsent",
                        "label": "I consent to the processing of my personal data in accordance with the Labuan FSA's data protection policy",
                        "required": True,
                        "options": [
                            {"value": "yes", "label": "Yes, I consent"}
                        ],
                        "multiple": False
                    },
                    {
                        "fieldId": "signature",
                        "fieldType": "signature",
                        "fieldName": "signature",
                        "label": "Digital Signature",
                        "required": True,
                        "helpText": "Please provide your digital signature"
                    },
                    {
                        "fieldId": "signature-date",
                        "fieldType": "date",
                        "fieldName": "signatureDate",
                        "label": "Date of Signature",
                        "required": True,
                        "defaultValue": None
                    }
                ]
            }
        ],
        "submitButton": {
            "text": "Submit Application",
            "className": "bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
        }
    }


async def create_sample_form():
    """Create the sample Labuan Company Management License Application form."""
    print("🔧 Initializing database...")
    await init_db()

    print("📋 Creating sample Labuan Company Management License Application form...")

    async with AsyncSessionLocal() as session:
        # Check if form already exists
        form_id = "labuan-company-management-license"
        result = await session.execute(
            select(Form).where(Form.form_id == form_id)
        )
        existing_form = result.scalar_one_or_none()

        schema_data = create_labuan_company_management_form_schema()

        if existing_form:
            print(f"ℹ️  Form '{form_id}' already exists. Updating...")
            existing_form.name = schema_data["formName"]
            existing_form.description = "Application for Licence to Carry on Labuan Company Management Business under Sections 131, Labuan Financial Services and Securities Act 2010"
            existing_form.category = "Licensing"
            existing_form.version = schema_data["version"]
            existing_form.schema_data = schema_data
            existing_form.is_active = True
            existing_form.requires_auth = True
            existing_form.estimated_time = "2-3 hours"
            print(f"✅ Updated form: {form_id}")
        else:
            new_form = Form(
                form_id=form_id,
                name=schema_data["formName"],
                description="Application for Licence to Carry on Labuan Company Management Business under Sections 131, Labuan Financial Services and Securities Act 2010",
                category="Licensing",
                version=schema_data["version"],
                schema_data=schema_data,
                is_active=True,
                requires_auth=True,
                estimated_time="2-3 hours",
            )
            session.add(new_form)
            print(f"✅ Created form: {form_id}")

        await session.commit()
        print("✨ Sample form setup complete!")
        print(f"\n📝 Form Details:")
        print(f"   Form ID: {form_id}")
        print(f"   Name: {schema_data['formName']}")
        print(f"   Steps: {len(schema_data['steps'])}")
        print(f"   Estimated Time: 2-3 hours")
        print(f"\n🌐 Access the form at:")
        print(f"   Frontend: http://localhost:3000/forms/{form_id}")
        print(f"   API: http://localhost:8000/api/forms/{form_id}/schema")


if __name__ == "__main__":
    asyncio.run(create_sample_form())

