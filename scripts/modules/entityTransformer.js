import {
  getTableTranslation,
  getColumnTranslation,
  getMeasureTranslation
} from './translationIndexer.js';

/**
 * Transform a table into the target entity format
 * @param {object} table - Raw table object from OLAP model
 * @param {Map} translationIndex - Translation lookup index
 * @param {Array} relationships - All relationships for dimension linking
 * @returns {object} Transformed entity
 */
export function transformTable(table, translationIndex, relationships) {
  const tableName = table.name;
  const isFact = tableName.startsWith('F');

  const translatedName = getTableTranslation(translationIndex, tableName);
  const displayName = translatedName || tableName;

  const entity = {
    id: tableName,
    name: displayName,
    description: '',
    tableName: tableName
  };

  if (isFact) {
    const measures = (table.measures || []).map(measure => {
      const expression = Array.isArray(measure.expression)
        ? measure.expression.join(' ')
        : (measure.expression || '');

      const translatedCaption = getMeasureTranslation(
        translationIndex,
        tableName,
        measure.name
      );

      return {
        name: measure.name,
        expression,
        translatedCaption
      };
    });

    const dimensions = relationships
      .filter(rel => rel.fromTable === tableName)
      .map(rel => rel.toTable)
      .filter((value, index, self) => self.indexOf(value) === index);

    entity.measures = measures;
    entity.dimensions = dimensions;
  } else {
    const columns = (table.columns || []).map(column => {
      const translatedCaption = getColumnTranslation(
        translationIndex,
        tableName,
        column.name
      );

      return {
        name: column.name,
        translatedCaption
      };
    });

    entity.columns = columns;
    entity.type = 'dimension';
  }

  return entity;
}
