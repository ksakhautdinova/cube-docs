/**
 * Build relationships from raw relationship data
 * @param {Array} rawRelationships - Raw relationships from OLAP model
 * @returns {object} Object with tableRelations array and relationshipsByTable map
 */
export function buildRelationships(rawRelationships) {
  const tableRelations = [];
  const seen = new Set();
  const relationshipsByTable = new Map();

  for (const rel of rawRelationships) {
    const { fromTable, toTable, fromColumn, toColumn } = rel;
    
    // Create unique key for deduplication
    const key = `${fromTable}:${toTable}:${fromColumn}:${toColumn}`;
    
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    // Determine relationship type
    // Facts (starting with 'F') to Dimensions = many-to-one
    const type = fromTable.startsWith('F') ? 'many-to-one' : 'one-to-many';

    const relationship = {
      fromTable,
      toTable,
      fromColumn,
      toColumn,
      type
    };

    tableRelations.push(relationship);

    // Index by fromTable for quick lookup
    if (!relationshipsByTable.has(fromTable)) {
      relationshipsByTable.set(fromTable, []);
    }
    relationshipsByTable.get(fromTable).push(relationship);
  }

  return {
    tableRelations,
    relationshipsByTable
  };
}
