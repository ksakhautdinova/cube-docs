# OLAP Parser - Documentation

## Overview

This OLAP parser converts the `olap.md` file (JSON/TMSL format) into a structured `cubeData.json` file that is used by the React application to display cube catalog information.

## What Was Implemented

### 1. Parser Modules

Located in `scripts/modules/`:

- **jsonLoader.js** - Loads and parses the OLAP model JSON from `olap.md`
- **modelExtractor.js** - Extracts tables, relationships, and cultures from the OLAP model
- **translationIndexer.js** - Builds fast lookup indexes for translations (O(1) performance)
- **entityTransformer.js** - Transforms OLAP tables into target entity format
- **relationshipBuilder.js** - Builds and deduplicates relationships
- **outputGenerator.js** - Generates the final `cubeData.json` file

### 2. Main Orchestrator

**scripts/parseOlap.js** - Coordinates all modules and runs the complete parsing process

### 3. Data Flow

```
olap.md (95,884 lines)
    ↓
Parser (Node.js script)
    ↓
cubeData.json (1,011 KB, 141 entities)
    ↓
React Application (catalog display)
```

## How It Works

### Parsing Logic

The parser extracts the following for each table:

1. **name** - Technical table name from `model.tables[].name`
2. **translatedCaption** - Russian translation from `model.cultures[].translations.model.tables[]`
3. **relationships** - All relationships where the table appears as `fromTable` or `toTable`

### Entity Types

**A) Facts (tables starting with 'F'):**
- Contains `measures` array with:
  - `name` (technical name)
  - `expression` (DAX formula, joined if array)
  - `translatedCaption` (Russian translation)

**B) Dimensions (tables NOT starting with 'F'):**
- Contains `columns` array with:
  - `name` (technical name)
  - `translatedCaption` (Russian translation)

### Rules

- Translations matched strictly by `name`
- Missing translations: `translatedCaption: null`
- Expression arrays joined with space
- Empty measures/fields: return empty array `[]`
- No duplicate relationships

## Usage

### Running the Parser Manually

```bash
npm run parse-olap
```

This will:
1. Read `olap.md` from the workspace root
2. Parse and transform the data
3. Generate `cube-docs/src/data/cubeData.json`

### Automatic Parsing

The parser runs automatically before:
- **Development server**: `npm run dev` (parses, then starts Vite)
- **Production build**: `npm run build` (parses, then builds)

### When to Run the Parser

Run the parser whenever:
- `olap.md` file is updated
- You want to refresh the cube data
- Starting development for the first time

## Output Structure

The generated `cubeData.json` has the following structure:

```json
{
  "entities": [/* All entities (facts + dimensions) */],
  "measureGroups": [/* Only fact tables */],
  "dimensionEntities": [/* Only dimension tables */],
  "tableRelations": [/* All relationships */]
}
```

### Example Entity (Fact Table)

```json
{
  "id": "F01100_assortment_matrix_AUP",
  "name": "F01100 АЕП, кол-во ТТ",
  "description": "",
  "tableName": "F01100_assortment_matrix_AUP",
  "measures": [
    {
      "name": "tt_plan_count",
      "expression": "COUNT(f01100_assortment_matrix_AUP[guid])",
      "translatedCaption": "F01100 Количество ТТ (план)"
    }
  ],
  "dimensions": ["D00001_main_calendar", "D00750_products", ...]
}
```

### Example Entity (Dimension Table)

```json
{
  "id": "D00001_main_calendar",
  "name": "D00001 Основной календарь",
  "description": "",
  "tableName": "D00001_main_calendar",
  "columns": [
    {
      "name": "calendar_date",
      "translatedCaption": "D00001 дата"
    },
    {
      "name": "month_name",
      "translatedCaption": "D00001 месяц"
    }
  ],
  "type": "dimension"
}
```

## Parsing Statistics

From the current `olap.md` file:

- **Total entities**: 141
- **Fact tables**: 64 (tables starting with 'F')
- **Dimension tables**: 77 (all other tables)
- **Relationships**: 347 (deduplicated)
- **Output size**: 1,011 KB
- **Parsing time**: < 2 seconds

## Integration with React App

The React application uses the parsed data through `src/mockData.js`, which:

1. Imports `cubeData.json`
2. Applies an adapter layer to convert `translatedCaption` → `translation` for compatibility
3. Exports `CUBE_DATA` object and helper functions

### Helper Functions Available

```javascript
getEntity(entityId)              // Get entity by ID
getMeasureGroup(groupId)         // Get fact table by ID
getDimensionEntity(dimId)        // Get dimension by ID
getRelationsForEntity(entityId)  // Get relationships for entity
getMeasuresForGroup(groupId)     // Get measures for fact table
getDimensionsForGroup(groupId)   // Get related dimensions
```

## File Locations

```
workspace-root/
├── olap.md                                    # Source OLAP model
├── scripts/
│   ├── parseOlap.js                          # Main parser script
│   └── modules/
│       ├── jsonLoader.js                     # JSON loading
│       ├── modelExtractor.js                 # Data extraction
│       ├── translationIndexer.js             # Translation indexing
│       ├── entityTransformer.js              # Entity transformation
│       ├── relationshipBuilder.js            # Relationship building
│       └── outputGenerator.js                # Output generation
└── cube-docs/
    ├── package.json                          # Updated with parse-olap script
    └── src/
        ├── data/
        │   └── cubeData.json                 # Generated data (DO NOT EDIT MANUALLY)
        └── mockData.js                       # Data adapter (imports cubeData.json)
```

## Performance Considerations

- **Fast translation lookups**: O(1) using Map-based index
- **Single-pass transformation**: Each table processed once
- **Efficient deduplication**: Set-based relationship deduplication
- **Memory efficient**: Streams through data, no excessive copying

## Error Handling

The parser handles the following errors:

- **File not found**: Clear error message with file path
- **Invalid JSON**: Shows parse error with details
- **Invalid structure**: Specifies missing required fields
- **Write errors**: Shows output path and error details

All errors exit with code 1 and display user-friendly messages.

## Troubleshooting

### Parser fails with "FILE_NOT_FOUND"

**Solution**: Ensure `olap.md` exists in the workspace root.

### Dev server fails to start

**Solution**: 
1. Run `npm run parse-olap` manually
2. Check for errors in parsing
3. Verify `cubeData.json` was created in `cube-docs/src/data/`

### Data not appearing in React app

**Solution**:
1. Check browser console for errors
2. Verify `cubeData.json` has data (> 0 bytes)
3. Verify `mockData.js` imports correctly
4. Hard refresh browser (Ctrl+Shift+R)

### Translations missing or incorrect

**Solution**:
1. Check `olap.md` has translations in `model.cultures[].translations`
2. Verify translation names match exactly (case-sensitive)
3. Null translations are expected for fields without translations

## Development Workflow

### Making Changes to the Parser

1. Modify parser modules in `scripts/modules/`
2. Test with: `npm run parse-olap`
3. Verify output in `cubeData.json`
4. Test React app: `npm run dev`
5. Check browser for correct display

### Adding New Fields

To add new fields to the output:

1. Update `entityTransformer.js` to extract the field
2. Update `outputGenerator.js` if structure changes
3. Update `mockData.js` adapter if field name mapping needed
4. Update React components to display the new field

## Technical Details

- **Runtime**: Node.js (ES Modules)
- **Dependencies**: Node.js built-ins only (`fs/promises`, `path`, `url`)
- **Input format**: JSON (with .md extension)
- **Output format**: JSON (2-space indentation)
- **Encoding**: UTF-8 (supports Russian text)

## Migration Notes

### Before (mockData.js)

- **5 hardcoded entities** (2 facts, 3 dimensions)
- **Manually maintained data**
- **Limited to sample data**

### After (cubeData.json)

- **141 entities** (64 facts, 77 dimensions)
- **Automatically generated from OLAP model**
- **Complete cube data with translations**
- **28x more entities**
- **69x more relationships** (5 → 347)

## Future Enhancements

Possible improvements (not currently implemented):

1. **Incremental parsing** - Only parse changed tables
2. **Watch mode** - Auto-regenerate on olap.md changes
3. **Multi-language support** - Extract all cultures, not just ru-RU
4. **Schema validation** - Validate output against JSON Schema
5. **CLI options** - `--input`, `--output`, `--verbose` flags
6. **Metadata extraction** - Include formatString, dataType, isHidden
7. **DAX expression parsing** - Extract dependencies from formulas

## Support

For issues or questions:
1. Check this README first
2. Review error messages in console
3. Verify `olap.md` structure matches expected format
4. Check parser module implementations for detailed comments

---

**Last Updated**: May 6, 2026
**Parser Version**: 1.0.0
**Status**: Production Ready ✅
