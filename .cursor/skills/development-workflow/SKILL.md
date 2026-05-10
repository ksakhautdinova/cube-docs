---
name: development-workflow
description: Orchestrates structured development workflow using specialized subagents (Scout, Architect, Executor, QA) in sequence. Use when implementing new features or making significant code changes to ensure thorough analysis, planning, implementation, and validation.
---

# Development Workflow with Subagents

This skill guides you through a structured development process using specialized subagents in the correct sequence to ensure high-quality implementations.

## Overview

When you receive a development task, follow this systematic workflow:

1. **Scout** → Analyze codebase and find integration points
2. **Architect** → Design architecture and plan implementation
3. **Executor** → Implement the feature with clean code
4. **QA** → Test and validate the implementation

Each phase builds on the previous one, ensuring thorough planning before coding and comprehensive testing after.

## When to Use This Workflow

Apply this workflow for:
- New feature implementation
- Significant refactoring
- Integration of new functionality
- Complex bug fixes requiring architectural changes
- Any task that touches multiple files or modules

**Skip this workflow** for:
- Simple, one-line fixes
- Trivial changes (typos, formatting)
- Documentation-only updates

## Workflow Steps

### Phase 1: Scout - Codebase Analysis

**Purpose:** Understand the current codebase and identify where changes should be made.

**Launch the Scout subagent:**
```
Use the scout subagent to analyze the project and identify where [feature/change] should be integrated
```

**What Scout will provide:**
- Project structure overview
- File dependencies and relationships
- Entry points and key modules
- Existing patterns to follow
- Specific integration points for the new feature
- Potential conflicts or issues
- TODOs and incomplete logic in related areas

**Example Scout prompt:**
```
Use the scout subagent to:
1. Analyze the current export functionality
2. Identify where to add PDF export capability
3. Find existing export patterns (markdown, docx)
4. Map dependencies for export services
5. Suggest specific files to modify
```

**Wait for Scout to complete before proceeding to Phase 2.**

### Phase 2: Architect - Design Planning

**Purpose:** Design the architecture and create implementation plan based on Scout's findings.

**Launch the Architect subagent:**
```
Use the architect subagent to design the architecture for [feature] based on the integration points identified by Scout
```

**Provide context from Scout:**
- Share Scout's findings about integration points
- Mention existing patterns Scout discovered
- Include any constraints or considerations

**What Architect will provide:**
- Module decomposition
- Component specifications with props/interfaces
- Data contracts (input/output types)
- File structure organization
- Implementation roadmap (what to build first)
- Technical decisions and rationale

**Example Architect prompt:**
```
Use the architect subagent to:

Based on Scout's findings that export functionality is in exportService.js:
1. Design the architecture for PDF export feature
2. Define data contracts for PDF generation
3. Specify component interfaces needed
4. Plan file organization for new modules
5. Create implementation roadmap

Follow existing patterns:
- Export functions return Blob objects
- Use Document/Paragraph structure (like DOCX)
- Support same data format as other exporters
```

**Wait for Architect to complete before proceeding to Phase 3.**

### Phase 3: Executor - Implementation

**Purpose:** Implement the feature following Architect's design specifications.

**Launch the Executor subagent:**
```
Use the executor subagent to implement [feature] according to the architecture designed by Architect
```

**Provide context from previous phases:**
- Share Architect's design specifications
- Include data contracts and interfaces
- Reference file organization plan
- Mention Scout's integration points

**What Executor will provide:**
- Complete, working code implementation
- Proper error handling
- Modern JavaScript (ES6+) best practices
- Integration with existing code
- Usage examples

**Example Executor prompt:**
```
Use the executor subagent to implement PDF export functionality:

Architecture from Architect:
- Module: PdfExportService in src/services/pdfExportService.js
- Function: exportToPdf(requirement) -> Promise<Blob>
- Use jsPDF library for PDF generation
- Follow existing exportToDocx() pattern

Integration points from Scout:
- Add to exportService.js alongside exportToDocx
- Import in RequirementForm component
- Add "Export as PDF" button to UI

Implementation requirements:
1. Install jsPDF if needed
2. Create pdfExportService.js module
3. Implement exportToPdf function
4. Add to export menu in UI
5. Handle errors gracefully
```

**Wait for Executor to complete before proceeding to Phase 4.**

### Phase 4: QA - Testing and Validation

**Purpose:** Thoroughly test the implementation and identify any issues.

**Launch the QA subagent:**
```
Use the qa subagent to test the [feature] implementation and validate it works correctly
```

**Provide context:**
- What was implemented
- Which files were changed
- Expected behavior
- Edge cases to test

**What QA will provide:**
- Comprehensive test results
- Edge case testing results
- UX evaluation
- Bug reports (if any found)
- Improvement suggestions
- Overall quality assessment

**Example QA prompt:**
```
Use the qa subagent to test the PDF export feature:

Implementation details:
- New function: exportToPdf() in pdfExportService.js
- UI: "Export as PDF" button added
- Changes in: exportService.js, RequirementForm.jsx

Test requirements:
1. Basic PDF generation and download
2. Edge cases: empty fields, special characters (дока), long text
3. Table formatting in PDF
4. File size reasonable
5. UX: button placement, loading state, error messages
6. Cross-browser compatibility
7. Compare with existing DOCX export quality

Report any bugs and suggest improvements.
```

**Based on QA findings, may need to return to Executor for fixes.**

## Workflow Example: Complete Feature Implementation

**Task:** Add ability to import requirements from JSON file

### Step 1: Scout Analysis
```
Use the scout subagent to analyze the project and identify:
1. Current file handling patterns (we have export, need import)
2. Where file upload UI should be added
3. Data validation patterns used
4. Storage mechanism for requirements
5. Integration point for new import feature
```

**Scout Output Summary:**
- File handling: FileReader API used in similar contexts
- UI location: Add to RequirementsList header
- Validation: No current validation service, needs creation
- Storage: localStorage via RequirementManager
- Integration: Add importFromJson() method to RequirementManager

### Step 2: Architect Design
```
Use the architect subagent to design JSON import feature:

Based on Scout findings:
- Add to RequirementManager class
- File upload in RequirementsList component
- Needs validation service

Design:
1. Module structure for import functionality
2. Data contracts for JSON validation
3. Component design for file upload UI
4. Error handling strategy
5. Implementation phases
```

**Architect Output Summary:**
- Module: ImportService in services/importService.js
- Interface: validateRequirementJson(data) -> {valid: bool, errors: []}
- Component: FileUploadButton with drag-drop
- Error handling: Show user-friendly messages, don't crash
- Phases: (1) Validation (2) UI (3) Integration

### Step 3: Executor Implementation
```
Use the executor subagent to implement JSON import:

Architecture (from Architect):
- Create services/importService.js
- Functions: validateJson(), parseRequirements(), importFromJson()
- Add FileUploadButton component
- Integrate with RequirementManager

Implementation:
1. Create importService.js with validation
2. Create FileUploadButton.jsx component
3. Add import method to RequirementManager
4. Wire up in RequirementsList
5. Add error handling and user feedback
```

**Executor Output:**
- ✅ importService.js created with validation
- ✅ FileUploadButton component with drag-drop
- ✅ RequirementManager.import() method added
- ✅ UI integrated with success/error messages

### Step 4: QA Testing
```
Use the qa subagent to test JSON import feature:

Implementation:
- importService.js validates and parses JSON
- FileUploadButton in RequirementsList
- Imports via RequirementManager.import()

Test:
1. Valid JSON file import
2. Invalid JSON (malformed, wrong schema)
3. Empty file, very large file
4. Special characters in data (дока)
5. Import duplicate IDs
6. UI feedback (success, errors, loading)
7. State updates without reload
8. Integration with existing requirements
```

**QA Output:**
- ✅ Basic functionality works
- ⚠️ Found bug: duplicate IDs crash app
- ⚠️ UX issue: no loading indicator
- 🟢 Suggestion: add preview before import

**Return to Executor to fix bugs** → **Re-run QA** → **✅ All tests pass**

## Best Practices

### 1. Always Follow the Sequence

Don't skip phases:
- ❌ Don't jump straight to Executor without Scout/Architect
- ❌ Don't skip QA testing
- ✅ Follow: Scout → Architect → Executor → QA

### 2. Pass Context Between Phases

Each phase builds on previous ones:
- Share Scout's findings with Architect
- Share Architect's design with Executor
- Share implementation details with QA
- Share QA bugs back to Executor for fixes

### 3. Wait for Completion

Don't launch next phase until current one completes:
- Let Scout finish full analysis
- Let Architect complete design doc
- Let Executor finish implementation
- Let QA complete testing

### 4. Iterate When Needed

If QA finds issues:
1. Return to Executor to fix bugs
2. If bugs reveal design flaws, return to Architect
3. Re-run QA after fixes
4. Repeat until QA approves

### 5. Document Decisions

Keep track of:
- Why certain approaches were chosen (Architect)
- What was implemented and where (Executor)
- What issues were found and fixed (QA)
- Trade-offs made during development

## Quick Reference: When to Use Each Subagent

| Subagent | Use When | Outputs |
|----------|----------|---------|
| **Scout** | Need to understand codebase structure, find integration points, locate existing patterns | File map, dependencies, integration points, existing patterns |
| **Architect** | Need to design architecture, plan module structure, define data contracts | Module specs, component designs, data contracts, implementation roadmap |
| **Executor** | Need to write actual code, implement features, integrate with existing code | Working code, implementations, integrations, usage examples |
| **QA** | Need to test functionality, validate edge cases, check UX, find bugs | Test reports, bug list, improvement suggestions, quality assessment |

## Workflow Checklist

For each development task:

```
Development Task: [Feature Name]

Phase 1: Scout
- [ ] Launch Scout subagent
- [ ] Review codebase analysis
- [ ] Note integration points
- [ ] Document existing patterns

Phase 2: Architect  
- [ ] Launch Architect subagent
- [ ] Share Scout's findings
- [ ] Review architecture design
- [ ] Approve implementation plan

Phase 3: Executor
- [ ] Launch Executor subagent
- [ ] Share Architect's design
- [ ] Review implementation
- [ ] Verify code quality

Phase 4: QA
- [ ] Launch QA subagent
- [ ] Share implementation details
- [ ] Review test results
- [ ] Address any issues found

Completion:
- [ ] All phases completed
- [ ] QA approved implementation
- [ ] Documentation updated
- [ ] Feature ready for use
```

## Handling Different Task Types

### Small Feature (1-2 files)
```
Scout → Architect → Executor → QA
(All phases, but each should be quick)
```

### Large Feature (multiple modules)
```
Scout (thorough analysis) →
Architect (detailed design) →
Executor Phase 1 (core module) →
QA Phase 1 (core testing) →
Executor Phase 2 (integrations) →
QA Phase 2 (integration testing) →
Final QA (complete validation)
```

### Bug Fix (with architectural implications)
```
Scout (find bug location and related code) →
Architect (design fix approach) →
Executor (implement fix) →
QA (verify fix, test regressions)
```

### Refactoring
```
Scout (map current structure and dependencies) →
Architect (design new structure) →
Executor Phase 1 (create new structure) →
Executor Phase 2 (migrate code) →
QA (verify functionality maintained)
```

## Common Pitfalls to Avoid

1. **Skipping Scout**
   - ❌ Problem: Implement in wrong location, miss existing patterns
   - ✅ Solution: Always start with Scout to understand codebase

2. **Implementing Without Design**
   - ❌ Problem: Poor architecture, need to rewrite later
   - ✅ Solution: Let Architect plan before Executor implements

3. **No Testing**
   - ❌ Problem: Bugs in production, poor UX, edge cases missed
   - ✅ Solution: Always run QA after implementation

4. **Not Iterating on QA Findings**
   - ❌ Problem: Ship with known bugs
   - ✅ Solution: Fix issues and re-test until QA approves

5. **Launching All Subagents at Once**
   - ❌ Problem: Later phases lack context from earlier ones
   - ✅ Solution: Launch sequentially, pass context forward

## Summary

This workflow ensures:
- ✅ Thorough understanding before coding (Scout)
- ✅ Well-planned architecture (Architect)
- ✅ Clean, maintainable implementation (Executor)
- ✅ Comprehensive testing and validation (QA)

**Result:** High-quality features that integrate well, follow best practices, and work reliably.

Remember: The workflow is a guide, not a prison. For trivial changes, you can skip phases. But for any significant development, following this sequence will save time and prevent issues.
