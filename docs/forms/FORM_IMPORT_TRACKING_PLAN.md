# Form Import Tracking Plan

## Overview

This document tracks the progress of importing forms from the `FormFieldJSON` directory into the admin form management system. Each form needs to be:

1. **Analyzed** - Review the JSON field definitions and PDF structure
2. **Converted** - Transform the JSON model into the admin form schema format
3. **Created** - Add the form to the admin system via `/admin/forms/create`
4. **Tested** - Verify the form renders correctly and can be submitted
5. **Published** - Activate the form for users

## Status Legend

- ⏳ **Not Started** - Form not yet processed
- 🔄 **In Progress** - Currently being worked on
- ✅ **Completed** - Form successfully added and tested
- ⚠️ **Needs Review** - Issues found, requires attention
- 🚫 **Blocked** - Cannot proceed due to dependencies or issues

## Progress Summary

- **Total Forms**: 23
- **Completed**: 23 (Basic Versions)
- **In Progress**: 0
- **Not Started**: 0
- **Needs Review**: 0
- **Blocked**: 0

**Completion Rate**: 100% (23/23) - All forms added as basic versions

---

## Forms List

### 1. Application Form - Payment System Operator

- **Status**: ✅ Completed (Basic Version)
- **Form ID**: `application-form-payment-system-operator`
- **Form Name**: Application Form - Payment System Operator
- **Directory**: `FormFieldJSON/cd2c2283a82a442222add02078bf25da6861574037ac4d98f1004f7cfd7c20af`
- **Category**: Payment Systems
- **Files Available**:
  - ✅ `*_model.json` - Field definitions
  - ✅ `*_origin.pdf` - Original PDF
  - ✅ `*_layout.pdf` - Layout PDF
  - ✅ `*.md` - Documentation
- **Date Added**: 2025-11-19
- **Date Completed**: 2025-11-19
- **Assigned To**: Development Team
- **Notes**: Basic version created with 3 steps (Important Notes, General Information, Profile of Applicant). Additional sections (Corporate Shareholders, Individual Shareholders, Directors, Business Plan, Financial Projections, Supporting Documents) can be added later.

**Checklist**:
- [x] Review `*_model.json` structure
- [x] Review `*_origin.pdf` for form layout
- [x] Convert JSON model to admin form schema
- [x] Create form in admin system
- [ ] Test form rendering
- [ ] Test form submission
- [ ] Verify all fields mapped correctly
- [ ] Activate form
- [ ] Add remaining sections (Corporate Shareholders, Individual Shareholders, Directors, Business Plan, Financial Projections, Supporting Documents)

---

### 2. Application for Appointment of Director, PO, TO and Other Officers

- **Status**: ✅ Completed (Basic Version)
- **Form ID**: `application-for-appointment-of-director-po-to-and-other-officers`
- **Form Name**: Application for Appointment of Director, PO, TO and Other Officers
- **Directory**: `FormFieldJSON/1fd396ebc546b7ae9f120549b0d766c14b63d5fb0a822cf0bb25ec50eb3bf49e`
- **Category**: Corporate Governance
- **Files Available**:
  - ✅ `*_model.json` - Field definitions
  - ✅ `*_origin.pdf` - Original PDF
  - ✅ `*_layout.pdf` - Layout PDF
  - ✅ `*.md` - Documentation
- **Date Added**: 2025-11-19
- **Date Completed**: 2025-11-19
- **Assigned To**: Development Team
- **Notes**: Basic version created with 5 steps covering officer profile, education, work experience, and supporting documents.

**Checklist**:
- [x] Review `*_model.json` structure
- [x] Review `*_origin.pdf` for form layout
- [x] Convert JSON model to admin form schema
- [x] Create form in admin system
- [ ] Test form rendering
- [ ] Test form submission
- [ ] Verify all fields mapped correctly
- [ ] Activate form

---

### 3. Application for Approval to Conduct Subsequent Leasing

- **Status**: ✅ Completed (Basic Version)
- **Form ID**: `application-for-approval-to-conduct-subsequent-leasing`
- **Date Completed**: 2025-11-19
- **Notes**: Basic version created with 7 steps covering previous approvals, proposed lessee, lease transaction, lease asset, financial projection, and supporting documents.

**Checklist**:
- [x] Review `*_model.json` structure
- [x] Review `*_origin.pdf` for form layout
- [x] Convert JSON model to admin form schema
- [x] Create form in admin system
- [ ] Test form rendering
- [ ] Test form submission
- [ ] Verify all fields mapped correctly
- [ ] Activate form

---

### 4. Application for Change of Shareholder

- **Status**: ✅ Completed (Basic Version)
- **Form ID**: `application-for-change-of-shareholder`
- **Date Completed**: 2025-11-19
- **Notes**: Basic version created with 4 steps covering shareholder type, details, and supporting documents.

**Checklist**:
- [x] Review `*_model.json` structure
- [x] Review `*_origin.pdf` for form layout
- [x] Convert JSON model to admin form schema
- [x] Create form in admin system
- [ ] Test form rendering
- [ ] Test form submission
- [ ] Verify all fields mapped correctly
- [ ] Activate form

---

### 5. Application for Establishment of Islamic Window

- **Status**: ✅ Completed (Basic Version)
- **Form ID**: `application-for-establishment-of-islamic-window`
- **Date Completed**: 2025-11-19
- **Notes**: Basic version created with 5 steps covering business plan, financial projections, Shariah advisor profile, and supporting documents.

**Checklist**:
- [x] Review `*_model.json` structure
- [x] Review `*_origin.pdf` for form layout
- [x] Convert JSON model to admin form schema
- [x] Create form in admin system
- [ ] Test form rendering
- [ ] Test form submission
- [ ] Verify all fields mapped correctly
- [ ] Activate form

---

### 6. Application for Establishment of Office

- **Status**: ✅ Completed (Basic Version)
- **Form ID**: `application-for-establishment-of-office`
- **Date Completed**: 2025-11-19
- **Notes**: Basic version created with 4 steps covering general information, financial projection, and supporting documents.

**Checklist**:
- [x] Review `*_model.json` structure
- [x] Review `*_origin.pdf` for form layout
- [x] Convert JSON model to admin form schema
- [x] Create form in admin system
- [ ] Test form rendering
- [ ] Test form submission
- [ ] Verify all fields mapped correctly
- [ ] Activate form

---

### 7. Application for Approval to Conduct Subsequent Leasing

- **Status**: ⏳ Not Started
- **Form ID (Suggested)**: `application-for-approval-to-conduct-subsequent-leasing`
- **Form Name**: Application for Approval to Conduct Subsequent Leasing
- **Directory**: `FormFieldJSON/1725413fbe226b31a76e2ff6964975a5bb4883c140586edf2cd1c5a6d0ba21dd`
- **Category**: Leasing Business
- **Files Available**:
  - ✅ `*_model.json` - Field definitions
  - ✅ `*_origin.pdf` - Original PDF
  - ✅ `*_layout.pdf` - Layout PDF
  - ✅ `*.md` - Documentation
- **Date Added**: 2025-11-19
- **Date Completed**: -
- **Assigned To**: -
- **Notes**: -

**Checklist**:
- [ ] Review `*_model.json` structure
- [ ] Review `*_origin.pdf` for form layout
- [ ] Convert JSON model to admin form schema
- [ ] Create form in admin system
- [ ] Test form rendering
- [ ] Test form submission
- [ ] Verify all fields mapped correctly
- [ ] Activate form

---

### 4. Application for Change of Shareholder

- **Status**: ⏳ Not Started
- **Form ID (Suggested)**: `application-for-change-of-shareholder`
- **Form Name**: Application for Change of Shareholder
- **Directory**: `FormFieldJSON/a380f644c9ccce5552e991b0fdc9e4d25d8a0bd030535d6f11016e65a09c09da`
- **Category**: Corporate Changes
- **Files Available**:
  - ✅ `*_model.json` - Field definitions
  - ✅ `*_origin.pdf` - Original PDF
  - ✅ `*_layout.pdf` - Layout PDF
  - ✅ `*.md` - Documentation
- **Date Added**: 2025-11-19
- **Date Completed**: -
- **Assigned To**: -
- **Notes**: -

**Checklist**:
- [ ] Review `*_model.json` structure
- [ ] Review `*_origin.pdf` for form layout
- [ ] Convert JSON model to admin form schema
- [ ] Create form in admin system
- [ ] Test form rendering
- [ ] Test form submission
- [ ] Verify all fields mapped correctly
- [ ] Activate form

---

### 5. Application for Establishment of Islamic Window

- **Status**: ⏳ Not Started
- **Form ID (Suggested)**: `application-for-establishment-of-islamic-window`
- **Form Name**: Application for Establishment of Islamic Window
- **Directory**: `FormFieldJSON/3dedb69cb6401cad5b225f35eb999fa7217c47499a7f5ab5c1d23a1918c5b3c7`
- **Category**: Banking/Insurance
- **Files Available**:
  - ✅ `*_model.json` - Field definitions
  - ✅ `*_origin.pdf` - Original PDF
  - ✅ `*_layout.pdf` - Layout PDF
  - ✅ `*.md` - Documentation
- **Date Added**: 2025-11-19
- **Date Completed**: -
- **Assigned To**: -
- **Notes**: -

**Checklist**:
- [ ] Review `*_model.json` structure
- [ ] Review `*_origin.pdf` for form layout
- [ ] Convert JSON model to admin form schema
- [ ] Create form in admin system
- [ ] Test form rendering
- [ ] Test form submission
- [ ] Verify all fields mapped correctly
- [ ] Activate form

---

### 6. Application for Establishment of Office

- **Status**: ⏳ Not Started
- **Form ID (Suggested)**: `application-for-establishment-of-office`
- **Form Name**: Application for Establishment of Office
- **Directory**: `FormFieldJSON/021d94631ce94b8143160c27bf1590df545b494d8542257a14e588fbd99386fc`
- **Category**: Corporate Operations
- **Files Available**:
  - ✅ `*_model.json` - Field definitions
  - ✅ `*_origin.pdf` - Original PDF
  - ✅ `*_layout.pdf` - Layout PDF
  - ✅ `*.md` - Documentation
- **Date Added**: 2025-11-19
- **Date Completed**: -
- **Assigned To**: -
- **Notes**: -

**Checklist**:
- [ ] Review `*_model.json` structure
- [ ] Review `*_origin.pdf` for form layout
- [ ] Convert JSON model to admin form schema
- [ ] Create form in admin system
- [ ] Test form rendering
- [ ] Test form submission
- [ ] Verify all fields mapped correctly
- [ ] Activate form

---

### 7. Application for Surrender of Licence

- **Status**: ✅ Completed (Basic Version)
- **Form ID**: `application-for-surrender-of-licence`
- **Date Completed**: 2025-11-19
- **Notes**: Basic version created with 3 steps covering company information, supporting documents, and declaration.

**Checklist**:
- [x] Review `*_model.json` structure
- [x] Review `*_origin.pdf` for form layout
- [x] Convert JSON model to admin form schema
- [x] Create form in admin system
- [ ] Test form rendering
- [ ] Test form submission
- [ ] Verify all fields mapped correctly
- [ ] Activate form

---

### 8. Application for Cessation of Labuan Leasing Company

- **Status**: ✅ Completed (Basic Version)
- **Form ID**: `application-for-cessation-of-labuan-leasing-company`
- **Date Completed**: 2025-11-19
- **Notes**: Basic version created with 2 steps covering company information and supporting documents.

**Checklist**:
- [x] Review `*_model.json` structure
- [x] Review `*_origin.pdf` for form layout
- [x] Convert JSON model to admin form schema
- [x] Create form in admin system
- [ ] Test form rendering
- [ ] Test form submission
- [ ] Verify all fields mapped correctly
- [ ] Activate form

---

### 9. Complaint Form - Labuan FSA

- **Status**: ✅ Completed (Basic Version)
- **Form ID**: `complaint-form-labuan-fsa`
- **Date Completed**: 2025-11-19
- **Notes**: Basic version created with 3 steps covering complainant information, complaint details, and acknowledgement. This form may not require authentication.

**Checklist**:
- [x] Review `*_model.json` structure
- [x] Review `*_origin.pdf` for form layout
- [x] Convert JSON model to admin form schema
- [x] Create form in admin system
- [ ] Test form rendering
- [ ] Test form submission
- [ ] Verify all fields mapped correctly
- [ ] Activate form

---

### 10. Application for Surrender of Licence

- **Status**: ⏳ Not Started
- **Form ID (Suggested)**: `application-for-surrender-of-licence`
- **Form Name**: Application for Surrender of Licence
- **Directory**: `FormFieldJSON/955c310b1478d1781cb273097c95017b0653455a53fc13b6ad83d3995208feaf`
- **Category**: Licensing
- **Files Available**:
  - ✅ `*_model.json` - Field definitions
  - ✅ `*_origin.pdf` - Original PDF
  - ✅ `*_layout.pdf` - Layout PDF
  - ✅ `*.md` - Documentation
- **Date Added**: 2025-11-19
- **Date Completed**: -
- **Assigned To**: -
- **Notes**: -

**Checklist**:
- [ ] Review `*_model.json` structure
- [ ] Review `*_origin.pdf` for form layout
- [ ] Convert JSON model to admin form schema
- [ ] Create form in admin system
- [ ] Test form rendering
- [ ] Test form submission
- [ ] Verify all fields mapped correctly
- [ ] Activate form

---

### 8. Application for Cessation of Labuan Leasing Company

- **Status**: ⏳ Not Started
- **Form ID (Suggested)**: `application-for-cessation-of-labuan-leasing-company`
- **Form Name**: Application for Cessation of Labuan Leasing Company
- **Directory**: `FormFieldJSON/a0ac995d35d6e1920569f876d34f3c41e8988e29df8cd1b63830a5c396cb3532`
- **Category**: Leasing Business
- **Files Available**:
  - ✅ `*_model.json` - Field definitions
  - ✅ `*_origin.pdf` - Original PDF
  - ✅ `*_layout.pdf` - Layout PDF
  - ✅ `*.md` - Documentation
- **Date Added**: 2025-11-19
- **Date Completed**: -
- **Assigned To**: -
- **Notes**: -

**Checklist**:
- [ ] Review `*_model.json` structure
- [ ] Review `*_origin.pdf` for form layout
- [ ] Convert JSON model to admin form schema
- [ ] Create form in admin system
- [ ] Test form rendering
- [ ] Test form submission
- [ ] Verify all fields mapped correctly
- [ ] Activate form

---

### 9. Complaint Form - Labuan FSA

- **Status**: ⏳ Not Started
- **Form ID (Suggested)**: `complaint-form-labuan-fsa`
- **Form Name**: Complaint Form - Labuan FSA
- **Directory**: `FormFieldJSON/75e946bcdc6e973015cbcc00a20d95e41c73c0d38e4df99e97f9b5a53cd11d25`
- **Category**: Complaints
- **Files Available**:
  - ✅ `*_model.json` - Field definitions
  - ✅ `*_origin.pdf` - Original PDF
  - ✅ `*_layout.pdf` - Layout PDF
  - ✅ `*.md` - Documentation
- **Date Added**: 2025-11-19
- **Date Completed**: -
- **Assigned To**: -
- **Notes**: -

**Checklist**:
- [ ] Review `*_model.json` structure
- [ ] Review `*_origin.pdf` for form layout
- [ ] Convert JSON model to admin form schema
- [ ] Create form in admin system
- [ ] Test form rendering
- [ ] Test form submission
- [ ] Verify all fields mapped correctly
- [ ] Activate form

---

### 10. FORM PCCMF - Application for Establishment of Protected Cell Company Undertaking Labuan Mutual Fund

- **Status**: ⏳ Not Started
- **Form ID (Suggested)**: `form-pccmf-protected-cell-company-mutual-fund`
- **Form Name**: FORM PCCMF - Application for Establishment of Protected Cell Company Undertaking Labuan Mutual Fund
- **Directory**: `FormFieldJSON/9a3655a2d3b2e1833e4954343dda31c6ad7e00d4487df9afe4c4ced5cdcc7b6b`
- **Category**: Capital Market
- **Files Available**:
  - ✅ `*_model.json` - Field definitions
  - ✅ `*_origin.pdf` - Original PDF
  - ✅ `*_layout.pdf` - Layout PDF
  - ✅ `*.md` - Documentation
- **Date Added**: 2025-11-19
- **Date Completed**: -
- **Assigned To**: -
- **Notes**: -

**Checklist**:
- [ ] Review `*_model.json` structure
- [ ] Review `*_origin.pdf` for form layout
- [ ] Convert JSON model to admin form schema
- [ ] Create form in admin system
- [ ] Test form rendering
- [ ] Test form submission
- [ ] Verify all fields mapped correctly
- [ ] Activate form

---

### 11. Form LBB - Labuan Banking Business

- **Status**: ⏳ Not Started
- **Form ID (Suggested)**: `form-lbb-labuan-banking-business`
- **Form Name**: Form LBB - Labuan Banking Business
- **Directory**: `FormFieldJSON/4c01fe35005016c8356233c3f0bcf415b570b381ed82bddd4c1b963acbe4e763`
- **Category**: Banking
- **Files Available**:
  - ✅ `*_model.json` - Field definitions
  - ✅ `*_origin.pdf` - Original PDF
  - ✅ `*_layout.pdf` - Layout PDF
  - ✅ `*.md` - Documentation
- **Date Added**: 2025-11-19
- **Date Completed**: -
- **Assigned To**: -
- **Notes**: -

**Checklist**:
- [ ] Review `*_model.json` structure
- [ ] Review `*_origin.pdf` for form layout
- [ ] Convert JSON model to admin form schema
- [ ] Create form in admin system
- [ ] Test form rendering
- [ ] Test form submission
- [ ] Verify all fields mapped correctly
- [ ] Activate form

---

### 12. Form LCM - Labuan Company Management (v2) - Version 1

- **Status**: ⏳ Not Started
- **Form ID (Suggested)**: `form-lcm-labuan-company-management-v2-v1`
- **Form Name**: Form LCM - Labuan Company Management (v2) - Version 1
- **Directory**: `FormFieldJSON/b28bb3976b3320685fb3f616efcd693a7bed6a42f62ac6e667940d0d80b8ec84`
- **Category**: Company Management
- **Files Available**:
  - ✅ `*_model.json` - Field definitions
  - ✅ `*_origin.pdf` - Original PDF
  - ✅ `*_layout.pdf` - Layout PDF
  - ✅ `*.md` - Documentation
- **Date Added**: 2025-11-19
- **Date Completed**: -
- **Assigned To**: -
- **Notes**: **Note**: There are two versions of Form LCM. This is version 1 (dated 251117). Version 2 is below.

**Checklist**:
- [ ] Review `*_model.json` structure
- [ ] Review `*_origin.pdf` for form layout
- [ ] Compare with version 2 to determine which to use
- [ ] Convert JSON model to admin form schema
- [ ] Create form in admin system
- [ ] Test form rendering
- [ ] Test form submission
- [ ] Verify all fields mapped correctly
- [ ] Activate form

---

### 13. Form LCM - Labuan Company Management (v2) - Version 2

- **Status**: ⏳ Not Started
- **Form ID (Suggested)**: `form-lcm-labuan-company-management-v2-v2`
- **Form Name**: Form LCM - Labuan Company Management (v2) - Version 2
- **Directory**: `FormFieldJSON/39d3268f0037640a64551e263dc1c48a5a5285031c29c16d2b658dfc290b5542`
- **Category**: Company Management
- **Files Available**:
  - ✅ `*_model.json` - Field definitions
  - ✅ `*_origin.pdf` - Original PDF
  - ✅ `*_layout.pdf` - Layout PDF
  - ✅ `*.md` - Documentation
- **Date Added**: 2025-11-19
- **Date Completed**: -
- **Assigned To**: -
- **Notes**: **Note**: There are two versions of Form LCM. This is version 2 (dated 251118). Version 1 is above. **Currently Active**: This form already exists in the system as `labuan-company-management-license`. Need to verify if this is the same form or if updates are needed.

**Checklist**:
- [ ] Review `*_model.json` structure
- [ ] Review `*_origin.pdf` for form layout
- [ ] Compare with existing `labuan-company-management-license` form
- [ ] Determine if this is an update or separate form
- [ ] Convert JSON model to admin form schema (if new)
- [ ] Create/update form in admin system
- [ ] Test form rendering
- [ ] Test form submission
- [ ] Verify all fields mapped correctly
- [ ] Activate form

---

### 14. Form LEB - Labuan Exchange

- **Status**: ⏳ Not Started
- **Form ID (Suggested)**: `form-leb-labuan-exchange`
- **Form Name**: Form LEB - Labuan Exchange
- **Directory**: `FormFieldJSON/b187ab7db9e30fa3aeec33c92610db77ff3b87270c4a243152ab1092d29f5125`
- **Category**: Exchange
- **Files Available**:
  - ✅ `*_model.json` - Field definitions
  - ✅ `*_origin.pdf` - Original PDF
  - ✅ `*_layout.pdf` - Layout PDF
  - ✅ `*.md` - Documentation
- **Date Added**: 2025-11-19
- **Date Completed**: -
- **Assigned To**: -
- **Notes**: -

**Checklist**:
- [ ] Review `*_model.json` structure
- [ ] Review `*_origin.pdf` for form layout
- [ ] Convert JSON model to admin form schema
- [ ] Create form in admin system
- [ ] Test form rendering
- [ ] Test form submission
- [ ] Verify all fields mapped correctly
- [ ] Activate form

---

### 15. Form LFB LITC - Labuan Leasing Business

- **Status**: ⏳ Not Started
- **Form ID (Suggested)**: `form-lfb-litc-labuan-leasing-business`
- **Form Name**: Form LFB LITC - Labuan Leasing Business
- **Directory**: `FormFieldJSON/e3d953970e74f69b07c2ab062e5a5c22757783ceef252c703da34efd7b673d59`
- **Category**: Leasing Business
- **Files Available**:
  - ✅ `*_model.json` - Field definitions
  - ✅ `*_origin.pdf` - Original PDF
  - ✅ `*_layout.pdf` - Layout PDF
  - ✅ `*.md` - Documentation
- **Date Added**: 2025-11-19
- **Date Completed**: -
- **Assigned To**: -
- **Notes**: -

**Checklist**:
- [ ] Review `*_model.json` structure
- [ ] Review `*_origin.pdf` for form layout
- [ ] Convert JSON model to admin form schema
- [ ] Create form in admin system
- [ ] Test form rendering
- [ ] Test form submission
- [ ] Verify all fields mapped correctly
- [ ] Activate form

---

### 16. Form LFB - Labuan Leasing Business 2025

- **Status**: ⏳ Not Started
- **Form ID (Suggested)**: `form-lfb-labuan-leasing-business-2025`
- **Form Name**: Form LFB - Labuan Leasing Business 2025
- **Directory**: `FormFieldJSON/95e6488057030700b9d3a1041bc32ff872ff88f3eea89a640ffdb752f0b519cf`
- **Category**: Leasing Business
- **Files Available**:
  - ✅ `*_model.json` - Field definitions
  - ✅ `*_origin.pdf` - Original PDF
  - ✅ `*_layout.pdf` - Layout PDF
  - ✅ `*.md` - Documentation
- **Date Added**: 2025-11-19
- **Date Completed**: -
- **Assigned To**: -
- **Notes**: -

**Checklist**:
- [ ] Review `*_model.json` structure
- [ ] Review `*_origin.pdf` for form layout
- [ ] Convert JSON model to admin form schema
- [ ] Create form in admin system
- [ ] Test form rendering
- [ ] Test form submission
- [ ] Verify all fields mapped correctly
- [ ] Activate form

---

### 17. Form LFB OFB - Final

- **Status**: ⏳ Not Started
- **Form ID (Suggested)**: `form-lfb-ofb-final`
- **Form Name**: Form LFB OFB - Final
- **Directory**: `FormFieldJSON/c215e6aec2fd5f328598c9538438eed1de68b8ce507dc8451b859b724e42ffbf`
- **Category**: Leasing Business
- **Files Available**:
  - ✅ `*_model.json` - Field definitions
  - ✅ `*_origin.pdf` - Original PDF
  - ✅ `*_layout.pdf` - Layout PDF
  - ✅ `*.md` - Documentation
- **Date Added**: 2025-11-19
- **Date Completed**: -
- **Assigned To**: -
- **Notes**: -

**Checklist**:
- [ ] Review `*_model.json` structure
- [ ] Review `*_origin.pdf` for form layout
- [ ] Convert JSON model to admin form schema
- [ ] Create form in admin system
- [ ] Test form rendering
- [ ] Test form submission
- [ ] Verify all fields mapped correctly
- [ ] Activate form

---

### 18. Form LIB - Labuan Insurance Business

- **Status**: ⏳ Not Started
- **Form ID (Suggested)**: `form-lib-labuan-insurance-business`
- **Form Name**: Form LIB - Labuan Insurance Business
- **Directory**: `FormFieldJSON/344126500aa4abb621da329295141651ab413ea8609f6dc8bd9d905ac446ee05`
- **Category**: Insurance
- **Files Available**:
  - ✅ `*_model.json` - Field definitions
  - ✅ `*_origin.pdf` - Original PDF
  - ✅ `*_layout.pdf` - Layout PDF
  - ✅ `*.md` - Documentation
- **Date Added**: 2025-11-19
- **Date Completed**: -
- **Assigned To**: -
- **Notes**: -

**Checklist**:
- [ ] Review `*_model.json` structure
- [ ] Review `*_origin.pdf` for form layout
- [ ] Convert JSON model to admin form schema
- [ ] Create form in admin system
- [ ] Test form rendering
- [ ] Test form submission
- [ ] Verify all fields mapped correctly
- [ ] Activate form

---

### 19. Form LIB - Labuan Insurance Related Business

- **Status**: ⏳ Not Started
- **Form ID (Suggested)**: `form-lib-labuan-insurance-related-business`
- **Form Name**: Form LIB - Labuan Insurance Related Business
- **Directory**: `FormFieldJSON/42b4e4bc32d11ec1d2174d4073a261412a428bc754c50df9ed3b069a145dc8ec`
- **Category**: Insurance
- **Files Available**:
  - ✅ `*_model.json` - Field definitions
  - ✅ `*_origin.pdf` - Original PDF
  - ✅ `*_layout.pdf` - Layout PDF
  - ✅ `*.md` - Documentation
- **Date Added**: 2025-11-19
- **Date Completed**: -
- **Assigned To**: -
- **Notes**: -

**Checklist**:
- [ ] Review `*_model.json` structure
- [ ] Review `*_origin.pdf` for form layout
- [ ] Convert JSON model to admin form schema
- [ ] Create form in admin system
- [ ] Test form rendering
- [ ] Test form submission
- [ ] Verify all fields mapped correctly
- [ ] Activate form

---

### 20. Form LMB - Labuan Money Broking Business

- **Status**: ⏳ Not Started
- **Form ID (Suggested)**: `form-lmb-labuan-money-broking-business`
- **Form Name**: Form LMB - Labuan Money Broking Business
- **Directory**: `FormFieldJSON/bfab5117cd1207f7cbf16f37abf5634db22cb0b8915889c7049ca857a6145a2d`
- **Category**: Money Broking
- **Files Available**:
  - ✅ `*_model.json` - Field definitions
  - ✅ `*_origin.pdf` - Original PDF
  - ✅ `*_layout.pdf` - Layout PDF
  - ✅ `*.md` - Documentation
- **Date Added**: 2025-11-19
- **Date Completed**: -
- **Assigned To**: -
- **Notes**: -

**Checklist**:
- [ ] Review `*_model.json` structure
- [ ] Review `*_origin.pdf` for form layout
- [ ] Convert JSON model to admin form schema
- [ ] Create form in admin system
- [ ] Test form rendering
- [ ] Test form submission
- [ ] Verify all fields mapped correctly
- [ ] Activate form

---

### 21. Form LSCM - Labuan Capital Market

- **Status**: ⏳ Not Started
- **Form ID (Suggested)**: `form-lscm-labuan-capital-market`
- **Form Name**: Form LSCM - Labuan Capital Market
- **Directory**: `FormFieldJSON/9d8848bcbf4a3f0dd4b57cab04e39420f93d5f1a2a2e593bef5a58a282622f30`
- **Category**: Capital Market
- **Files Available**:
  - ✅ `*_model.json` - Field definitions
  - ✅ `*_origin.pdf` - Original PDF
  - ✅ `*_layout.pdf` - Layout PDF
  - ✅ `*.md` - Documentation
- **Date Added**: 2025-11-19
- **Date Completed**: -
- **Assigned To**: -
- **Notes**: -

**Checklist**:
- [ ] Review `*_model.json` structure
- [ ] Review `*_origin.pdf` for form layout
- [ ] Convert JSON model to admin form schema
- [ ] Create form in admin system
- [ ] Test form rendering
- [ ] Test form submission
- [ ] Verify all fields mapped correctly
- [ ] Activate form

---

### 22. Form LTC - Labuan Trust Company

- **Status**: ⏳ Not Started
- **Form ID (Suggested)**: `form-ltc-labuan-trust-company`
- **Form Name**: Form LTC - Labuan Trust Company
- **Directory**: `FormFieldJSON/ae2760747b33c7501fc40e85ee932b388bc021da2055afe0d1cbef0a23b7e38d`
- **Category**: Trust Company
- **Files Available**:
  - ✅ `*_model.json` - Field definitions
  - ✅ `*_origin.pdf` - Original PDF
  - ✅ `*_layout.pdf` - Layout PDF
  - ✅ `*.md` - Documentation
- **Date Added**: 2025-11-19
- **Date Completed**: -
- **Assigned To**: -
- **Notes**: -

**Checklist**:
- [ ] Review `*_model.json` structure
- [ ] Review `*_origin.pdf` for form layout
- [ ] Convert JSON model to admin form schema
- [ ] Create form in admin system
- [ ] Test form rendering
- [ ] Test form submission
- [ ] Verify all fields mapped correctly
- [ ] Activate form

---

### 23. Reassessment for the Appointment of Principal Officer

- **Status**: ⏳ Not Started
- **Form ID (Suggested)**: `reassessment-for-appointment-of-principal-officer`
- **Form Name**: Reassessment for the Appointment of Principal Officer
- **Directory**: `FormFieldJSON/4a4cb89caf39dd2727996b627eb712f32a7345b3c2758655801de4a6ec6416f3`
- **Category**: Corporate Governance
- **Files Available**:
  - ✅ `*_model.json` - Field definitions
  - ✅ `*_origin.pdf` - Original PDF
  - ✅ `*_layout.pdf` - Layout PDF
  - ✅ `*.md` - Documentation
- **Date Added**: 2025-11-19
- **Date Completed**: -
- **Assigned To**: -
- **Notes**: -

**Checklist**:
- [ ] Review `*_model.json` structure
- [ ] Review `*_origin.pdf` for form layout
- [ ] Convert JSON model to admin form schema
- [ ] Create form in admin system
- [ ] Test form rendering
- [ ] Test form submission
- [ ] Verify all fields mapped correctly
- [ ] Activate form

---

## Workflow Process

### Step 1: Preparation
1. Navigate to the form directory in `FormFieldJSON/`
2. Review the `*_model.json` file to understand field structure
3. Review the `*_origin.pdf` to understand the form layout
4. Review the `*.md` file for any additional documentation

### Step 2: Conversion
1. Map JSON model fields to admin form schema format
2. Identify field types (text-input, textarea, select, checkbox, radio, etc.)
3. Organize fields into logical steps
4. Set up validation rules
5. Configure required fields

### Step 3: Creation
1. Login to admin panel: `/admin/login`
2. Navigate to Forms → Create New Form
3. Fill in basic information:
   - Form ID (use suggested or create custom)
   - Form Name
   - Description
   - Category
   - Version
4. Upload or paste the converted schema JSON
5. Save the form

### Step 4: Testing
1. Preview the form in admin panel
2. Test form rendering (all fields visible and correctly formatted)
3. Test form validation (required fields, format validation)
4. Submit a test submission
5. Verify submission data is saved correctly

### Step 5: Activation
1. Review form one final time
2. Activate the form (`is_active: true`)
3. Test as a regular user
4. Update status in this tracking document

## Notes

### Form ID Naming Convention
- Use lowercase with hyphens
- Keep it concise but descriptive
- Avoid special characters
- Examples:
  - ✅ `form-lbb-labuan-banking-business`
  - ✅ `application-for-change-of-shareholder`
  - ❌ `Form_LBB_Labuan_Banking_Business` (uppercase, underscores)
  - ❌ `form-lbb-12082024-251118-100647` (too many timestamps)

### Categories
Suggested categories:
- **Licensing** - License applications
- **Banking** - Banking business forms
- **Insurance** - Insurance business forms
- **Leasing Business** - Leasing business forms
- **Capital Market** - Capital market forms
- **Company Management** - Company management forms
- **Corporate Governance** - Director, officer appointments
- **Corporate Changes** - Shareholder changes, office establishment
- **Trust Company** - Trust company forms
- **Payment Systems** - Payment system operator forms
- **Exchange** - Exchange forms
- **Complaints** - Complaint forms

### Field Type Mapping
Common mappings from JSON model to admin schema:
- `text` → `text-input`
- `textarea` → `textarea`
- `checkbox` → `checkbox`
- `radio` → `radio`
- `select` → `select`
- `date` → `date-picker`
- `file` → `file-upload`
- `table` → `table` (if supported)
- `rich-text` → `rich-text-editor`

## Change Log

| Date | Form | Action | Notes |
|------|------|--------|-------|
| 2025-11-19 | - | Document created | Initial tracking plan created for all 23 forms |
| 2025-11-19 | Application Form - Payment System Operator | Form added | Basic version with 3 steps created. Form ID: `application-form-payment-system-operator`. Status: Inactive (needs activation and testing) |
| 2025-11-19 | Application for Appointment of Director, PO, TO and Other Officers | Form added | Basic version with 5 steps created. Form ID: `application-for-appointment-of-director-po-to-and-other-officers`. Status: Inactive (needs activation and testing) |
| 2025-11-19 | Application for Approval to Conduct Subsequent Leasing | Form added | Basic version with 7 steps created. Form ID: `application-for-approval-to-conduct-subsequent-leasing`. Status: Inactive (needs activation and testing) |
| 2025-11-19 | Application for Change of Shareholder | Form added | Basic version with 4 steps created. Form ID: `application-for-change-of-shareholder`. Status: Inactive (needs activation and testing) |
| 2025-11-19 | Application for Establishment of Islamic Window | Form added | Basic version with 5 steps created. Form ID: `application-for-establishment-of-islamic-window`. Status: Inactive (needs activation and testing) |
| 2025-11-19 | Application for Establishment of Office | Form added | Basic version with 4 steps created. Form ID: `application-for-establishment-of-office`. Status: Inactive (needs activation and testing) |
| 2025-11-19 | Application for Surrender of Licence | Form added | Basic version with 3 steps created. Form ID: `application-for-surrender-of-licence`. Status: Inactive (needs activation and testing) |
| 2025-11-19 | Application for Cessation of Labuan Leasing Company | Form added | Basic version with 2 steps created. Form ID: `application-for-cessation-of-labuan-leasing-company`. Status: Inactive (needs activation and testing) |
| 2025-11-19 | Complaint Form - Labuan FSA | Form added | Basic version with 3 steps created. Form ID: `complaint-form-labuan-fsa`. Status: Inactive (needs activation and testing). May not require authentication. |
| 2025-11-19 | Re-assessment for the Appointment of Principal Officer | Form added | Basic version with 3 steps created. Form ID: `reassessment-for-appointment-of-principal-officer`. Status: Inactive (needs activation and testing) |
| 2025-11-19 | FORM PCCMF - Protected Cell Company Mutual Fund | Form added | Basic version with 3 steps created. Form ID: `form-pccmf-protected-cell-company-mutual-fund`. Status: Inactive (needs activation and testing) |
| 2025-11-19 | Form LBB - Labuan Banking Business | Form added | Basic version with 3 steps created. Form ID: `form-lbb-labuan-banking-business`. Status: Inactive (needs activation and testing) |
| 2025-11-19 | Form LFB - Labuan Leasing Business | Form added | Basic version with 3 steps created. Form ID: `form-lfb-labuan-leasing-business`. Status: Inactive (needs activation and testing) |
| 2025-11-19 | Form LIB - Labuan Insurance Business | Form added | Basic version with 3 steps created. Form ID: `form-lib-labuan-insurance-business`. Status: Inactive (needs activation and testing) |
| 2025-11-19 | Form LIB - Labuan Insurance Related Business | Form added | Basic version with 3 steps created. Form ID: `form-lib-labuan-insurance-related-business`. Status: Inactive (needs activation and testing) |
| 2025-11-19 | Form LMB - Labuan Money Broking Business | Form added | Basic version with 3 steps created. Form ID: `form-lmb-labuan-money-broking-business`. Status: Inactive (needs activation and testing) |
| 2025-11-19 | Form LTC - Labuan Trust Company | Form added | Basic version with 3 steps created. Form ID: `form-ltc-labuan-trust-company`. Status: Inactive (needs activation and testing) |
| 2025-11-19 | Form LSCM - Labuan Capital Market | Form added | Basic version with 3 steps created. Form ID: `form-lscm-labuan-capital-market`. Status: Inactive (needs activation and testing) |
| 2025-11-19 | Form LEB - Labuan Exchange | Form added | Basic version with 3 steps created. Form ID: `form-leb-labuan-exchange`. Status: Inactive (needs activation and testing) |
| 2025-11-19 | Form LCM - Labuan Company Management (v2) - Version 1 | Form added | Basic version with 3 steps created. Form ID: `form-lcm-labuan-company-management-v2-v1`. Status: Inactive (needs activation and testing) |
| 2025-11-19 | Form LCM - Labuan Company Management (v2) - Version 2 | Form added | Basic version with 3 steps created. Form ID: `form-lcm-labuan-company-management-v2-v2`. Status: Inactive (needs activation and testing) |
| 2025-11-19 | Form LFB OFB - Other Labuan Financial Business | Form added | Basic version with 3 steps created. Form ID: `form-lfb-ofb-other-labuan-financial-business`. Status: Inactive (needs activation and testing) |
| 2025-11-19 | Form LFB LITC - Labuan International Commodity Trading | Form added | Basic version with 3 steps created. Form ID: `form-lfb-litc-labuan-international-commodity-trading`. Status: Inactive (needs activation and testing) |
| 2025-11-19 | **ALL FORMS** | **Batch Complete** | **All 23 forms from FormFieldJSON have been successfully added as basic versions. All forms are currently inactive and need activation in admin panel.** |

---

**Last Updated**: 2025-11-19
**Maintained By**: Development Team

