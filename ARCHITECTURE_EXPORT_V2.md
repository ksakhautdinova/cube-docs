# Architecture Design: exportToDocxV2() Function

## 1. System Overview

### Purpose
Export RequirementV2 objects (with nested WorkBlocks) to DOCX format with complex document structure including title page, requirement metadata, work blocks, and conditional data tables.

### Technology Stack
- **Library**: docx v8.5.0 (Packer.toBlob)
- **Language**: JavaScript (Node.js compatible)
- **Target Format**: DOCX (Office Open XML)
- **Text Encoding**: UTF-8
- **Locale**: Russian (ru-RU)

### Key Design Decisions

1. **Modular Helper Functions**: Break document generation into focused functions (title page, metadata, work blocks, tables) for testability and reusability.

2. **Data Transformation Pipeline**: 
   - Normalize input data
   - Filter empty/null values
   - Transform to document structure
   - Apply formatting

3. **Table-Driven Approach**: Separate table generation logic by type (measures, attributes, changes) to handle different column structures and content.

4. **Conditional Rendering**: Skip empty blocks, conditionally show tables based on data presence, format entity types appropriately.

5. **Formatting Consistency**: Centralize spacing, styling, and border configurations to maintain document coherence.

---

## 2. Module Architecture

### Main Function
```typescript
exportToDocxV2(requirement: RequirementV2): Promise<Blob>
```

**Responsibility**: Orchestrate document generation pipeline
- Validate input
- Create document sections in sequence
- Combine sections into Document
- Serialize to Blob via Packer

**Error Handling**:
- Validate requirement has title
- Handle missing/null workBlocks
- Gracefully handle incomplete workBlock data
- Return meaningful error messages

---

### Helper Functions Hierarchy

```
exportToDocxV2(requirement)
├── createTitlePage()
│   └── Returns: Paragraph[]
│
├── createRequirementMetadata(title, description)
│   └── Returns: Paragraph[]
│
├── processWorkBlocks(workBlocks)
│   ├── filter(isValidWorkBlock)
│   ├── map(createWorkBlockSection)
│   │   ├── createWorkBlockHeader(workBlock)
│   │   ├── createOperationDescription(workBlock)
│   │   ├── createContentTables(workBlock)
│   │   │   ├── createMeasuresTable(measures)
│   │   │   ├── createAttributesTable(attributes)
│   │   │   ├── createMeasureChangesTable(changes)
│   │   │   └── createAttributeChangesTable(changes)
│   │   └── createRelatedEntitiesList(entities, type)
│   └── Returns: Paragraph[]
│
├── createStyledHeading(text, level, spacing)
│   └── Returns: Paragraph
│
├── createTableHeader(columns, columnWidths)
│   └── Returns: TableRow
│
├── createTableRows(data, schema)
│   └── Returns: TableRow[]
│
└── createBorderedCell(content, width, isHeader)
    └── Returns: TableCell
```

---

## 3. Function Specifications

### 3.1 Main Function: exportToDocxV2

```typescript
/**
 * Export RequirementV2 to DOCX format
 * @param {RequirementV2} requirement - Requirement object with workBlocks
 * @returns {Promise<Blob>} DOCX file blob
 * @throws {Error} If requirement invalid or generation fails
 */
async function exportToDocxV2(requirement) {
  // Input validation
  if (!requirement || !requirement.title) {
    throw new Error('Requirement must have a title');
  }
  
  const sections = [];
  
  // Title page
  sections.push(...createTitlePage());
  
  // Requirement metadata (title + description)
  sections.push(...createRequirementMetadata(requirement.title, requirement.description));
  
  // Work blocks
  if (requirement.workBlocks && requirement.workBlocks.length > 0) {
    const validBlocks = requirement.workBlocks.filter(isValidWorkBlock);
    for (let i = 0; i < validBlocks.length; i++) {
      sections.push(...createWorkBlockSection(validBlocks[i], i));
    }
  }
  
  // Generate Document
  const doc = new Document({
    sections: [{
      children: sections,
      properties: {
        // Optional: page settings
      }
    }]
  });
  
  // Serialize to Blob
  const blob = await Packer.toBlob(doc);
  return blob;
}
```

**Input Contract**:
```typescript
interface RequirementV2Input {
  title: string;              // Required, non-empty
  description?: string;       // Optional
  workBlocks?: WorkBlock[];   // Optional, default []
  createdAt?: Date;          // Optional
  version: number;           // Should be 2
}
```

**Output Contract**:
```typescript
interface ExportOutput {
  blob: Blob;                // DOCX file data
  metadata: {
    size: number;            // File size in bytes
    generatedAt: string;      // ISO timestamp
  }
}
```

**Error Handling**:
```typescript
{
  errorCode: 'INVALID_REQUIREMENT' | 'EMPTY_TITLE' | 'GENERATION_FAILED',
  message: string,
  details?: any
}
```

---

### 3.2 Title Page Section

```typescript
/**
 * Create title page paragraphs
 * @returns {Paragraph[]} Title page elements
 */
function createTitlePage() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return [
    new Paragraph({
      text: 'Функциональные требования',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      run: {
        font: 'Arial',
        size: 22,  // 11pt = 22 half-points
      }
    }),
    
    new Paragraph({
      text: dateStr,
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      run: {
        font: 'Arial',
        size: 22,
      }
    }),
    
    new Paragraph({
      text: 'Версия: 2.0',
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      run: {
        font: 'Arial',
        size: 22,
      }
    })
  ];
}
```

**Formatting**:
- H1: "Функциональные требования", centered, Arial 11pt
- Date: Current date in Russian locale format
- Version: "Версия: 2.0"
- Spacing: 240 after H1, 120 after date, 400 after version

---

### 3.3 Requirement Metadata

```typescript
/**
 * Create requirement title and description section
 * @param {string} title - Requirement title
 * @param {string} description - Requirement description
 * @returns {Paragraph[]} Metadata paragraphs
 */
function createRequirementMetadata(title, description) {
  const paragraphs = [];
  
  // Title as H2
  paragraphs.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
      run: {
        font: 'Arial',
        size: 22,
      }
    })
  );
  
  // Description section if present
  if (description && description.trim()) {
    paragraphs.push(
      new Paragraph({
        text: 'Описание',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 120, after: 120 },
        run: {
          font: 'Arial',
          size: 22,
        }
      })
    );
    
    paragraphs.push(
      new Paragraph({
        text: description,
        spacing: { after: 120 },
        run: {
          font: 'Arial',
          size: 22,
        }
      })
    );
  }
  
  return paragraphs;
}
```

**H2 Spacing Convention**:
- Before: 12pt (240 twips)
- After: 6pt (120 twips)

---

### 3.4 Work Block Section

```typescript
/**
 * Create complete work block section
 * @param {WorkBlock} workBlock - Work block to render
 * @param {number} index - Block index for numbering
 * @returns {Paragraph[]} Work block section paragraphs and tables
 */
function createWorkBlockSection(workBlock, index) {
  const sections = [];
  
  // Work Block Header (H3)
  sections.push(createWorkBlockHeader(workBlock, index));
  
  // Operation Description
  sections.push(...createOperationDescription(workBlock));
  
  // Content-based Tables
  const tables = createContentTables(workBlock);
  sections.push(...tables);
  
  // Related Entities List
  if (workBlock.relatedEntities && workBlock.relatedEntities.length > 0) {
    sections.push(...createRelatedEntitiesList(
      workBlock.relatedEntities,
      workBlock.entityType
    ));
  }
  
  // Spacing after block
  sections.push(new Paragraph({
    text: '',
    spacing: { after: 120 }
  }));
  
  return sections;
}
```

---

### 3.5 Work Block Header

```typescript
/**
 * Create H3 header for work block
 * Format: "Entity Name (fact/dimension)"
 * @param {WorkBlock} workBlock - Work block data
 * @param {number} index - Block index
 * @returns {Paragraph} Header paragraph
 */
function createWorkBlockHeader(workBlock, index) {
  const entityTypeLabel = workBlock.entityType === 'fact' ? 'факт' : 'справочник';
  const headerText = `${workBlock.entityName} (${entityTypeLabel})`;
  
  return new Paragraph({
    text: headerText,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 120, after: 60 },
    run: {
      font: 'Arial',
      size: 22,
    }
  });
}
```

**Format**: Entity name in single quotes + entity type in parentheses
**H3 Spacing**: 6pt before (120 twips), 3pt after (60 twips)

---

### 3.6 Operation Description

```typescript
/**
 * Create operation description based on workBlock type
 * @param {WorkBlock} workBlock - Work block data
 * @returns {Paragraph[]} Description paragraphs
 */
function createOperationDescription(workBlock) {
  const descriptions = [];
  
  if (workBlock.type === 'new') {
    descriptions.push(
      new Paragraph({
        text: `Необходимо добавить новую сущность-${workBlock.entityType === 'fact' ? 'таблицу' : 'справочник'}: '${workBlock.entityName}'`,
        spacing: { after: 120 },
        run: {
          font: 'Arial',
          size: 22,
        }
      })
    );
  } else if (workBlock.type === 'existing') {
    descriptions.push(
      new Paragraph({
        text: `Необходимо изменить существующую сущность-${workBlock.entityType === 'fact' ? 'таблицу' : 'справочник'}: '${workBlock.entityName}'`,
        spacing: { after: 120 },
        run: {
          font: 'Arial',
          size: 22,
        }
      })
    );
  }
  
  return descriptions;
}
```

---

### 3.7 Content Tables Generator

```typescript
/**
 * Create all applicable tables for work block content
 * Conditional rendering based on data presence
 * @param {WorkBlock} workBlock - Work block with data
 * @returns {(Paragraph | Table)[]} Table elements with labels
 */
function createContentTables(workBlock) {
  const elements = [];
  
  // New Measures Table
  if (workBlock.newMeasures && workBlock.newMeasures.length > 0) {
    elements.push(
      new Paragraph({
        text: 'Новые меры',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 120, after: 60 },
        run: {
          font: 'Arial',
          size: 22,
          bold: true,
        }
      })
    );
    elements.push(createMeasuresTable(workBlock.newMeasures));
    elements.push(new Paragraph({ text: '', spacing: { after: 120 } }));
  }
  
  // New Attributes Table
  if (workBlock.newAttributes && workBlock.newAttributes.length > 0) {
    elements.push(
      new Paragraph({
        text: 'Новые атрибуты',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 120, after: 60 },
        run: {
          font: 'Arial',
          size: 22,
          bold: true,
        }
      })
    );
    elements.push(createAttributesTable(workBlock.newAttributes));
    elements.push(new Paragraph({ text: '', spacing: { after: 120 } }));
  }
  
  // Measure Changes Table
  if (workBlock.measureChanges && workBlock.measureChanges.length > 0) {
    elements.push(
      new Paragraph({
        text: 'Изменения существующих мер',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 120, after: 60 },
        run: {
          font: 'Arial',
          size: 22,
          bold: true,
        }
      })
    );
    elements.push(createMeasureChangesTable(workBlock.measureChanges));
    elements.push(new Paragraph({ text: '', spacing: { after: 120 } }));
  }
  
  // Attribute Changes Table
  if (workBlock.attributeChanges && workBlock.attributeChanges.length > 0) {
    elements.push(
      new Paragraph({
        text: 'Изменения существующих атрибутов',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 120, after: 60 },
        run: {
          font: 'Arial',
          size: 22,
          bold: true,
        }
      })
    );
    elements.push(createAttributeChangesTable(workBlock.attributeChanges));
    elements.push(new Paragraph({ text: '', spacing: { after: 120 } }));
  }
  
  return elements;
}
```

---

### 3.8 New Measures Table

```typescript
/**
 * Create "Новые меры" table
 * Columns: Название | Перевод | Выражение | Формат
 * @param {NewMeasure[]} measures - Array of new measures
 * @returns {Table} Formatted table
 */
function createMeasuresTable(measures) {
  const COLUMN_WIDTHS = [1500, 1500, 2000, 1500]; // DXA units
  const TOTAL_WIDTH = 6500;
  
  // Header row
  const headerRow = new TableRow({
    children: [
      createTableHeaderCell('Название', COLUMN_WIDTHS[0]),
      createTableHeaderCell('Перевод', COLUMN_WIDTHS[1]),
      createTableHeaderCell('Выражение', COLUMN_WIDTHS[2]),
      createTableHeaderCell('Формат', COLUMN_WIDTHS[3]),
    ],
  });
  
  // Data rows
  const dataRows = (measures || []).map(measure =>
    new TableRow({
      children: [
        createBorderedCell(measure.name || '-', COLUMN_WIDTHS[0]),
        createBorderedCell(measure.translation || '-', COLUMN_WIDTHS[1]),
        createBorderedCell(measure.expression || '-', COLUMN_WIDTHS[2]),
        createBorderedCell(measure.format || '-', COLUMN_WIDTHS[3]),
      ],
    })
  );
  
  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}
```

**Table Schema**:

| Column | Width (DXA) | Content |
|--------|-------------|---------|
| Название | 1500 | Measure name |
| Перевод | 1500 | Measure translation |
| Выражение | 2000 | Measure expression (formula) |
| Формат | 1500 | Format string |

---

### 3.9 New Attributes Table

```typescript
/**
 * Create "Новые атрибуты" table
 * Columns: Название | Перевод
 * @param {NewAttribute[]} attributes - Array of new attributes
 * @returns {Table} Formatted table
 */
function createAttributesTable(attributes) {
  const COLUMN_WIDTHS = [3000, 3000]; // DXA units
  
  const headerRow = new TableRow({
    children: [
      createTableHeaderCell('Название', COLUMN_WIDTHS[0]),
      createTableHeaderCell('Перевод', COLUMN_WIDTHS[1]),
    ],
  });
  
  const dataRows = (attributes || []).map(attr =>
    new TableRow({
      children: [
        createBorderedCell(attr.name || '-', COLUMN_WIDTHS[0]),
        createBorderedCell(attr.translation || '-', COLUMN_WIDTHS[1]),
      ],
    })
  );
  
  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}
```

**Table Schema**:

| Column | Width (DXA) |
|--------|-------------|
| Название | 3000 |
| Перевод | 3000 |

---

### 3.10 Measure Changes Table

```typescript
/**
 * Create "Изменения существующих мер" table
 * Columns: Исходное название | Новое название | Исходная формула | Новая формула | Примечание
 * @param {MeasureChange[]} changes - Array of measure changes
 * @returns {Table} Formatted table
 */
function createMeasureChangesTable(changes) {
  const COLUMN_WIDTHS = [1200, 1200, 1500, 1500, 1100]; // DXA units
  
  const headerRow = new TableRow({
    children: [
      createTableHeaderCell('Исходное название', COLUMN_WIDTHS[0]),
      createTableHeaderCell('Новое название', COLUMN_WIDTHS[1]),
      createTableHeaderCell('Исходная формула', COLUMN_WIDTHS[2]),
      createTableHeaderCell('Новая формула', COLUMN_WIDTHS[3]),
      createTableHeaderCell('Примечание', COLUMN_WIDTHS[4]),
    ],
  });
  
  const dataRows = (changes || []).map(change =>
    new TableRow({
      children: [
        createBorderedCell(change.originalName || '-', COLUMN_WIDTHS[0]),
        createBorderedCell(change.newName || change.originalName || '-', COLUMN_WIDTHS[1]),
        createBorderedCell(change.originalExpression || '-', COLUMN_WIDTHS[2]),
        createBorderedCell(change.newExpression || '-', COLUMN_WIDTHS[3]),
        createBorderedCell(change.notes || '-', COLUMN_WIDTHS[4]),
      ],
    })
  );
  
  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}
```

**Table Schema**:

| Column | Width (DXA) |
|--------|-------------|
| Исходное название | 1200 |
| Новое название | 1200 |
| Исходная формула | 1500 |
| Новая формула | 1500 |
| Примечание | 1100 |

---

### 3.11 Attribute Changes Table

```typescript
/**
 * Create "Изменения существующих атрибутов" table
 * @param {AttributeChange[]} changes - Array of attribute changes
 * @returns {Table} Formatted table
 */
function createAttributeChangesTable(changes) {
  const COLUMN_WIDTHS = [1500, 1500, 1500, 1500]; // DXA units
  
  const headerRow = new TableRow({
    children: [
      createTableHeaderCell('Исходное название', COLUMN_WIDTHS[0]),
      createTableHeaderCell('Новое название', COLUMN_WIDTHS[1]),
      createTableHeaderCell('Исходный перевод', COLUMN_WIDTHS[2]),
      createTableHeaderCell('Новый перевод', COLUMN_WIDTHS[3]),
    ],
  });
  
  const dataRows = (changes || []).map(change =>
    new TableRow({
      children: [
        createBorderedCell(change.originalName || '-', COLUMN_WIDTHS[0]),
        createBorderedCell(change.newName || change.originalName || '-', COLUMN_WIDTHS[1]),
        createBorderedCell(change.originalTranslation || '-', COLUMN_WIDTHS[2]),
        createBorderedCell(change.newTranslation || '-', COLUMN_WIDTHS[3]),
      ],
    })
  );
  
  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}
```

---

### 3.12 Related Entities List

```typescript
/**
 * Create related entities list as paragraphs
 * @param {string[]} relatedEntities - Array of entity IDs or names
 * @param {string} entityType - 'fact' or 'dimension'
 * @returns {Paragraph[]} Formatted list paragraphs
 */
function createRelatedEntitiesList(relatedEntities, entityType) {
  const paragraphs = [];
  
  if (!relatedEntities || relatedEntities.length === 0) {
    return paragraphs;
  }
  
  const typeLabel = entityType === 'fact' ? 'таблиц' : 'справочников';
  
  paragraphs.push(
    new Paragraph({
      text: `Связанные сущности-${typeLabel}:`,
      spacing: { before: 120, after: 60 },
      run: {
        font: 'Arial',
        size: 22,
        bold: true,
      }
    })
  );
  
  relatedEntities.forEach((entity, idx) => {
    paragraphs.push(
      new Paragraph({
        text: entity,
        spacing: { after: 40 },
        indent: { left: 720 }, // 0.5" indent for bullet-like appearance
        run: {
          font: 'Arial',
          size: 22,
        }
      })
    );
  });
  
  return paragraphs;
}
```

---

### 3.13 Utility: Create Table Header Cell

```typescript
/**
 * Create styled table header cell
 * Background: Light gray (RGB 220, 220, 220)
 * @param {string} text - Cell content
 * @param {number} width - Cell width in DXA
 * @returns {TableCell} Styled header cell
 */
function createTableHeaderCell(text, width) {
  return new TableCell({
    children: [
      new Paragraph({
        text: text,
        run: {
          bold: true,
          font: 'Arial',
          size: 22,
          color: '000000',
        },
        alignment: AlignmentType.CENTER,
      })
    ],
    borders: {
      top: { style: BorderStyle.single, size: 1, color: '000000' },
      bottom: { style: BorderStyle.single, size: 1, color: '000000' },
      left: { style: BorderStyle.single, size: 1, color: '000000' },
      right: { style: BorderStyle.single, size: 1, color: '000000' },
    },
    shading: {
      type: ShadingType.CLEAR,
      color: 'DCDCDC', // RGB 220, 220, 220 in hex
    },
    width: { size: width, type: WidthType.DXA },
  });
}
```

---

### 3.14 Utility: Create Bordered Cell

```typescript
/**
 * Create table data cell with borders
 * @param {string} text - Cell content
 * @param {number} width - Cell width in DXA
 * @returns {TableCell} Bordered data cell
 */
function createBorderedCell(text, width) {
  return new TableCell({
    children: [
      new Paragraph({
        text: text || '-',
        run: {
          font: 'Arial',
          size: 22,
        }
      })
    ],
    borders: {
      top: { style: BorderStyle.single, size: 1, color: '000000' },
      bottom: { style: BorderStyle.single, size: 1, color: '000000' },
      left: { style: BorderStyle.single, size: 1, color: '000000' },
      right: { style: BorderStyle.single, size: 1, color: '000000' },
    },
    width: { size: width, type: WidthType.DXA },
  });
}
```

---

### 3.15 Validation Helper

```typescript
/**
 * Check if work block has any content to display
 * @param {WorkBlock} workBlock - Work block to validate
 * @returns {boolean} True if block has displayable content
 */
function isValidWorkBlock(workBlock) {
  if (!workBlock) return false;
  
  const hasNewMeasures = workBlock.newMeasures && workBlock.newMeasures.length > 0;
  const hasNewAttributes = workBlock.newAttributes && workBlock.newAttributes.length > 0;
  const hasMeasureChanges = workBlock.measureChanges && workBlock.measureChanges.length > 0;
  const hasAttributeChanges = workBlock.attributeChanges && workBlock.attributeChanges.length > 0;
  const hasRelatedEntities = workBlock.relatedEntities && workBlock.relatedEntities.length > 0;
  
  return hasNewMeasures || hasNewAttributes || hasMeasureChanges || hasAttributeChanges || hasRelatedEntities;
}
```

---

## 4. Data Contracts

### 4.1 RequirementV2 Input Contract

```typescript
interface RequirementV2 {
  id: string;                 // Auto-generated: REQ-{timestamp}
  title: string;              // Required, non-empty
  description?: string;       // Optional
  workBlocks: WorkBlock[];    // Array of work blocks
  createdAt: Date;            // Optional, defaults to now
  version: 2;                 // Must be 2
}
```

### 4.2 WorkBlock Contract

```typescript
interface WorkBlock {
  id: string;                          // Auto-generated: WB-{timestamp}-{random}
  type: 'existing' | 'new';           // Block operation type
  entityType: 'fact' | 'dimension';   // Target entity type
  entityId: string;                   // Entity identifier
  entityName: string;                 // Entity display name
  tableName?: string;                 // Database table name
  measureChanges: MeasureChange[];    // Existing measure modifications
  newMeasures: NewMeasure[];          // New measures to add
  newAttributes: NewAttribute[];      // New attributes to add
  attributeChanges?: AttributeChange[]; // Existing attribute modifications
  relatedEntities?: string[];         // Related entity IDs/names
}
```

### 4.3 Supporting Data Contracts

```typescript
interface NewMeasure {
  name: string;           // Measure identifier
  translation: string;    // User-facing name
  expression?: string;    // Formula/expression (optional)
}

interface NewAttribute {
  name: string;           // Attribute identifier
  translation: string;    // User-facing name
}

interface MeasureChange {
  measureId: string;
  originalName: string;
  originalTranslation: string;
  originalExpression: string;
  needsRename?: boolean;
  newName?: string;
  newTranslation?: string;
  needsFormulaChange?: boolean;
  newExpression?: string;
  notes?: string;
}

interface AttributeChange {
  originalName: string;
  originalTranslation: string;
  newName?: string;
  newTranslation?: string;
}
```

### 4.4 Export Function Output Contract

```typescript
interface ExportToDocxV2Output {
  blob: Blob;              // DOCX file data
  metadata: {
    size: number;          // File size in bytes
    generatedAt: string;    // ISO 8601 timestamp
    workBlocksCount: number;
  }
}
```

### 4.5 Error Handling Contract

```typescript
interface ExportError {
  code: 'INVALID_INPUT' | 'EMPTY_TITLE' | 'GENERATION_FAILED' | 'PACKER_ERROR';
  message: string;
  details?: {
    field?: string;
    value?: any;
    originalError?: Error;
  }
}
```

---

## 5. File Structure & Organization

### Current Structure
```
cube-docs/src/
├── exportService.js          # Main export functions
├── RequirementsPage.jsx       # Integration point
├── types.js                   # Data type definitions
├── mockData.js               # Sample data
└── storageService.js         # Persistence layer
```

### Updated exportService.js Structure

```javascript
// Imports
import { Document, Packer, Paragraph, Table, TableCell, TableRow, 
         TextRun, HeadingLevel, BorderStyle, AlignmentType, 
         WidthType, ShadingType } from 'docx';

// ========================
// MAIN EXPORT FUNCTION
// ========================
export const exportToDocxV2 = async (requirement) => { ... }

// ========================
// TITLE PAGE & METADATA
// ========================
const createTitlePage = () => { ... }
const createRequirementMetadata = (title, description) => { ... }

// ========================
// WORK BLOCK PROCESSING
// ========================
const createWorkBlockSection = (workBlock, index) => { ... }
const createWorkBlockHeader = (workBlock, index) => { ... }
const createOperationDescription = (workBlock) => { ... }
const createContentTables = (workBlock) => { ... }

// ========================
// TABLE GENERATORS
// ========================
const createMeasuresTable = (measures) => { ... }
const createAttributesTable = (attributes) => { ... }
const createMeasureChangesTable = (changes) => { ... }
const createAttributeChangesTable = (changes) => { ... }
const createRelatedEntitiesList = (entities, type) => { ... }

// ========================
// TABLE UTILITIES
// ========================
const createTableHeaderCell = (text, width) => { ... }
const createBorderedCell = (text, width) => { ... }

// ========================
// VALIDATION & HELPERS
// ========================
const isValidWorkBlock = (workBlock) => { ... }

// ========================
// EXISTING EXPORTS
// ========================
export const exportToMarkdown = (requirement) => { ... }
export const exportToDocx = async (requirement) => { ... }
export const downloadFile = (blob, filename) => { ... }
```

---

## 6. Formatting Specifications

### Typography
- **Font**: Arial, 11pt (size: 22 in half-points)
- **Encoding**: UTF-8
- **Locale**: Russian (ru-RU)

### Heading Levels

| Level | Style | Spacing Before | Spacing After |
|-------|-------|-----------------|---|
| H1 | "Функциональные требования", centered | - | 240 twips (12pt) |
| H2 | Requirement/Section title | 240 twips (12pt) | 120 twips (6pt) |
| H3 | Work block header / Table label | 120 twips (6pt) | 60 twips (3pt) |

### Paragraph Spacing
- **Between sections**: 120 twips (6pt after)
- **After tables**: 120 twips (6pt)
- **Default after paragraph**: 60-120 twips

### Table Formatting
- **Header background**: Light gray (RGB: 220, 220, 220 = #DCDCDC)
- **Header text**: Bold, centered, black
- **Borders**: Single line, black, 1pt
- **Width calculation**: 100% of page width, distributed across columns
- **Cell padding**: Default (minimal)

### DXA Unit Reference
- 1 inch = 1440 DXA
- 1 cm ≈ 567 DXA
- 1 pt ≈ 20 DXA
- 1 twip (1/20 pt) = 1 DXA

---

## 7. Data Flow Diagram

```
RequirementsPage.jsx
    ↓
[User clicks "Export DOCX"]
    ↓
exportToDocxV2(requirement)
    ├→ Validate input
    ├→ createTitlePage()
    │  └→ [Title, Date, Version] → Paragraph[]
    ├→ createRequirementMetadata(title, desc)
    │  └→ [H2 Title, Description] → Paragraph[]
    ├→ For each WorkBlock:
    │  ├→ createWorkBlockHeader()
    │  │  └→ [H3 Entity Name] → Paragraph
    │  ├→ createOperationDescription()
    │  │  └→ [Operation text] → Paragraph[]
    │  ├→ createContentTables()
    │  │  ├→ createMeasuresTable() → Table
    │  │  ├→ createAttributesTable() → Table
    │  │  ├→ createMeasureChangesTable() → Table
    │  │  └→ createAttributeChangesTable() → Table
    │  └→ createRelatedEntitiesList() → Paragraph[]
    ├→ Combine all sections
    ├→ Create Document object
    ├→ Packer.toBlob(document) → Promise<Blob>
    └→ Return Blob
    ↓
downloadFile(blob, filename)
    ↓
[DOCX file downloaded]
```

---

## 8. Error Handling Strategy

### Input Validation
```javascript
// Check requirement exists
if (!requirement) throw new Error('Requirement object is required');

// Check title (required)
if (!requirement.title || !requirement.title.trim()) {
  throw new Error('Requirement must have a non-empty title');
}

// Validate workBlocks array
if (requirement.workBlocks && !Array.isArray(requirement.workBlocks)) {
  throw new Error('workBlocks must be an array');
}
```

### Data Sanitization
```javascript
// Handle missing properties gracefully
const title = requirement.title || 'Untitled';
const description = requirement.description || '';
const workBlocks = requirement.workBlocks || [];

// Filter invalid blocks
const validBlocks = workBlocks.filter(isValidWorkBlock);

// Provide defaults for optional fields
const entityName = workBlock.entityName || 'Unknown Entity';
const measures = workBlock.newMeasures || [];
```

### Fallback Values
- Missing expressions: Display "-"
- Missing translations: Display "-"
- Missing entity names: "Unknown Entity"
- Empty arrays: Skip table generation
- Null/undefined fields: Treat as empty string

### Try-Catch Wrapper
```javascript
export const exportToDocxV2 = async (requirement) => {
  try {
    // Validation logic
    
    // Document generation logic
    
    // Blob generation
    return await Packer.toBlob(doc);
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error(`Failed to generate DOCX: ${error.message}`);
  }
};
```

---

## 9. Integration Plan

### 9.1 Update RequirementsPage.jsx

```javascript
const handleExportDocx = async () => {
  try {
    setExporting(true);
    
    const requirement = new RequirementV2(title, description, workBlocks);
    
    // Call exportToDocxV2
    const blob = await exportToDocxV2(requirement);
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${title || 'requirements'}_${timestamp}.docx`;
    
    // Download file
    downloadFile(blob, filename);
    
    // Show success message
    alert('Требование успешно экспортировано в DOCX!');
  } catch (error) {
    console.error('Export error:', error);
    alert(`Ошибка при экспорте: ${error.message}`);
  } finally {
    setExporting(false);
  }
};
```

### 9.2 Import Statement Update

```javascript
import { 
  exportToMarkdown, 
  exportToDocx,
  exportToDocxV2,  // Add new import
  downloadFile 
} from '../exportService';
```

### 9.3 UI Integration

```javascript
{/* Export Buttons */}
<div className="export-buttons">
  <button 
    onClick={handleExportMarkdown}
    className="btn-secondary"
    disabled={!title.trim()}
  >
    📄 Export Markdown
  </button>
  
  <button 
    onClick={handleExportDocx}
    className="btn-primary"
    disabled={!title.trim() || exporting}
  >
    {exporting ? 'Экспортирование...' : '📋 Export DOCX'}
  </button>
</div>
```

---

## 10. Implementation Roadmap

### Phase 1: Core Infrastructure (Estimated: 2-3 hours)
- [x] Define data contracts
- [ ] Implement utility functions:
  - `createBorderedCell()`
  - `createTableHeaderCell()`
  - `isValidWorkBlock()`
- [ ] Implement title page generation:
  - `createTitlePage()`
- [ ] Add basic error handling

### Phase 2: Metadata & Structure (Estimated: 1-2 hours)
- [ ] Implement `createRequirementMetadata()`
- [ ] Implement `createWorkBlockHeader()`
- [ ] Implement `createOperationDescription()`
- [ ] Test with sample data

### Phase 3: Table Generation (Estimated: 2-3 hours)
- [ ] Implement table generators:
  - `createMeasuresTable()`
  - `createAttributesTable()`
  - `createMeasureChangesTable()`
  - `createAttributeChangesTable()`
- [ ] Implement `createRelatedEntitiesList()`
- [ ] Test column widths and formatting

### Phase 4: Integration (Estimated: 1 hour)
- [ ] Implement main function `exportToDocxV2()`
- [ ] Implement `createWorkBlockSection()`
- [ ] Integrate with `RequirementsPage.jsx`
- [ ] Add loading states and error handling
- [ ] Test end-to-end export workflow

### Phase 5: Testing & Polish (Estimated: 2-3 hours)
- [ ] Test with various data scenarios:
  - Single work block
  - Multiple work blocks
  - Different entity types (fact/dimension)
  - Different operation types (new/existing)
  - Empty optional fields
- [ ] Verify formatting and spacing
- [ ] Test edge cases (very long names, special characters)
- [ ] Performance testing with large requirements
- [ ] QA checklist validation

---

## 11. Testing Strategy

### Unit Tests (by function)

**Table Generators**:
- Test with empty arrays → No table rendered
- Test with single row → Proper header + 1 data row
- Test with multiple rows → Proper scaling
- Test with null/undefined values → "-" displayed
- Test column widths → DXA calculations correct

**Paragraph Generators**:
- Test with empty strings → Skip or handle gracefully
- Test with Russian text → UTF-8 encoding correct
- Test spacing values → Proper twip conversion
- Test heading levels → Correct HeadingLevel applied

**Work Block Processing**:
- Test filtering invalid blocks → Only valid blocks included
- Test block ordering → Maintains input order
- Test conditional rendering → Tables only when data present

### Integration Tests

**Document Generation**:
- Export with minimal data (title only)
- Export with full data (all work block types)
- Export with mixed empty/full work blocks
- Export with special characters in names
- Export with very long descriptions

**File Output**:
- Blob size > 0
- MIME type correct
- File downloadable
- Docx opens in MS Word / LibreOffice

---

## 12. Edge Cases & Handling

| Case | Handling |
|------|----------|
| Empty title | Reject with error message |
| No work blocks | Generate document with title + metadata only |
| Empty work block | Skip from rendering |
| Null/undefined measure name | Display "-" |
| Very long entity name | Let text wrap (docx handles) |
| Special characters (é, ü, ё) | UTF-8 encoding handles |
| Empty newMeasures array | Skip "Новые меры" section |
| All arrays empty | Skip all content tables |
| Missing entityName | Use "Unknown Entity" |
| Invalid entityType | Default to 'fact' |

---

## 13. Performance Considerations

- **Memory**: Document building in JavaScript (no streaming)
- **Rendering**: Packer.toBlob() is async, use loading state
- **File Size**: Estimate 50-200KB for typical requirements
- **Generation Time**: ~500ms-2s for large documents
- **Browser Support**: Modern browsers with Blob support

**Optimization**:
- Lazy table generation (only if data present)
- Pre-calculate column widths once
- Reuse paragraph styling objects
- Batch cell creation in map operations

---

## 14. Dependencies & Requirements

### Required Imports
```javascript
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  HeadingLevel,
  BorderStyle,
  AlignmentType,
  WidthType,
  ShadingType
} from 'docx';
```

### Library Version
- **docx**: v8.5.0 (must support Packer.toBlob)

### Browser APIs
- **Blob**: Native support required
- **URL.createObjectURL()**: For file download
- **Date.toLocaleDateString()**: For date formatting

---

## 15. Key Implementation Notes

1. **Twips vs DXA**: Docx library uses DXA units (1/1440 inch). Spacing values should be in twips converted to DXA (same ratio).

2. **Percentage Width**: Tables use 100% width with column-level DXA widths. Ensure column sum fits page width.

3. **Text Formatting**: Use `run` property within Paragraph for font/bold/size styling. Don't use TextRun for simple text.

4. **Heading Levels**: H1 for title, H2 for sections, H3 for subsections. Follow strict hierarchy.

5. **Cell Alignment**: Center header text, left-align data text (default).

6. **Border Configuration**: Apply to all four sides (top, bottom, left, right) for consistent appearance.

7. **Spacing Units**: 
   - 240 = 12pt
   - 120 = 6pt
   - 60 = 3pt
   - 40 = 2pt

8. **Russian Locale**: Always use 'ru-RU' for date/time formatting. Ensure text strings are in Cyrillic.

9. **Error Recovery**: Don't let one table fail entire export. Wrap table generation in try-catch if needed.

10. **File Naming**: Include timestamp and sanitize title for filename compatibility.

---

## Next Steps

1. Implement core utility functions
2. Build title page and metadata generators
3. Implement table generation functions
4. Assemble main export function
5. Integrate with RequirementsPage.jsx
6. Test with real data
7. Handle edge cases and polish UI

---

**Document Version**: 1.0  
**Created**: 2026-05-07  
**Status**: Ready for Implementation
