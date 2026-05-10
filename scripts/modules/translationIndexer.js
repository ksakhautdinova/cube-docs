/**
 * Build a translation index for fast lookups
 * @param {Array} cultures - Array of culture objects
 * @returns {Map} Translation index
 */
export function buildTranslationIndex(cultures) {
  const index = new Map();

  for (const culture of cultures) {
    const translations = culture?.translations?.model?.tables || [];
    
    for (const table of translations) {
      const tableName = table.name;
      
      // Store table translation
      if (table.translatedCaption) {
        index.set(`table:${tableName}`, table.translatedCaption);
      }

      // Store measure translations
      if (table.measures) {
        for (const measure of table.measures) {
          if (measure.translatedCaption) {
            const key = `${tableName}:measure:${measure.name}`;
            index.set(key, measure.translatedCaption);
          }
        }
      }

      // Store column translations
      if (table.columns) {
        for (const column of table.columns) {
          if (column.translatedCaption) {
            const key = `${tableName}:column:${column.name}`;
            index.set(key, column.translatedCaption);
          }
        }
      }
    }
  }

  return index;
}

/**
 * Get translated table name
 * @param {Map} index - Translation index
 * @param {string} tableName - Original table name
 * @returns {string|null} Translated name or null
 */
export function getTableTranslation(index, tableName) {
  return index.get(`table:${tableName}`) || null;
}

/**
 * Get translated column name
 * @param {Map} index - Translation index
 * @param {string} tableName - Table name
 * @param {string} columnName - Column name
 * @returns {string|null} Translated name or null
 */
export function getColumnTranslation(index, tableName, columnName) {
  return index.get(`${tableName}:column:${columnName}`) || null;
}

/**
 * Get translated measure name
 * @param {Map} index - Translation index
 * @param {string} tableName - Table name
 * @param {string} measureName - Measure name
 * @returns {string|null} Translated name or null
 */
export function getMeasureTranslation(index, tableName, measureName) {
  return index.get(`${tableName}:measure:${measureName}`) || null;
}
