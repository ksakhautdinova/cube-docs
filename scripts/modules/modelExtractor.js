/**
 * Extract tables from the model
 * @param {object} model - The OLAP model object
 * @returns {Array} Array of table objects
 */
export function extractTables(model) {
  return model?.tables || [];
}

/**
 * Extract relationships from the model
 * @param {object} model - The OLAP model object
 * @returns {Array} Array of relationship objects
 */
export function extractRelationships(model) {
  return model?.relationships || [];
}

/**
 * Extract cultures (translations) from the model
 * @param {object} model - The OLAP model object
 * @returns {Array} Array of culture objects
 */
export function extractCultures(model) {
  return model?.cultures || [];
}
