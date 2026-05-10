// Тип для измерения (dimension)
export class Dimension {
  constructor(id, name, description = "", guid = "") {
    this.id = id;
    this.name = name;
    this.description = description;
    this.guid = guid;
  }
}

// Тип для меры (measure)
export class Measure {
  constructor(id, name, groupId, groupName, description = "", expression = "", formatString = "#,0.00") {
    this.id = id;
    this.name = name;
    this.groupId = groupId;
    this.groupName = groupName;
    this.description = description;
    this.expression = expression;
    this.formatString = formatString;
  }
}

// Тип для связи между мерой и измерением
export class MeasureDimensionRelation {
  constructor(measureId, dimensionId, relationshipType = "MANY_TO_ONE") {
    this.measureId = measureId;
    this.dimensionId = dimensionId;
    this.relationshipType = relationshipType;
  }
}

// Тип для описания группы мер
export class MeasureGroup {
  constructor(id, name, description = "", tableName = "", measures = [], dimensions = []) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.tableName = tableName;
    this.measures = measures;
    this.dimensions = dimensions;
  }
}

// Тип для требований
export class FunctionalRequirement {
  constructor(
    id,
    title,
    measureGroupId,
    measureGroupName,
    isNewGroup = false,
    newGroupName = "",
    newMeasures = [],
    newDimensions = [],
    relations = [],
    description = "",
    createdAt = new Date()
  ) {
    this.id = id;
    this.title = title;
    this.measureGroupId = measureGroupId;
    this.measureGroupName = measureGroupName;
    this.isNewGroup = isNewGroup;
    this.newGroupName = newGroupName;
    this.newMeasures = newMeasures;
    this.newDimensions = newDimensions;
    this.relations = relations;
    this.description = description;
    this.createdAt = createdAt;
  }
}

// Тип для сущности-измерения (с атрибутами/столбцами)
export class DimensionEntity {
  constructor(id, name, description = "", tableName = "", columns = []) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.tableName = tableName;
    this.columns = columns; // [{name, translation, description, dataType}]
    this.type = 'dimension'; // для отличия от fact
  }
}

// Тип для связи между таблицами (relationship)
export class TableRelation {
  constructor(fromTable, toTable, fromColumn, toColumn, type = 'many-to-one') {
    this.fromTable = fromTable;
    this.toTable = toTable;
    this.fromColumn = fromColumn;
    this.toColumn = toColumn;
    this.type = type;
  }
}

// Изменение существующей меры
export class MeasureChange {
  constructor(
    measureId,
    originalName,
    originalTranslation,
    originalExpression,
    needsRename = false,
    newTranslation = '',
    needsFormulaChange = false,
    newExpression = ''
  ) {
    this.measureId = measureId;
    this.originalName = originalName;
    this.originalTranslation = originalTranslation;
    this.originalExpression = originalExpression;
    this.needsRename = needsRename;
    this.newTranslation = newTranslation;
    this.needsFormulaChange = needsFormulaChange;
    this.newExpression = newExpression;
  }
}

// Новая мера для добавления
export class NewMeasure {
  constructor(name = '', translation = '', expression = '') {
    this.name = name;
    this.translation = translation;
    this.expression = expression;
  }
}

// Новый атрибут справочника
export class NewAttribute {
  constructor(name = '', translation = '') {
    this.name = name;
    this.translation = translation;
  }
}

// Блок работы (работа с одной сущностью)
export class WorkBlock {
  constructor(
    type = 'existing', // 'existing' | 'new'
    entityType = 'fact', // 'fact' | 'dimension'
    entityId = '',
    entityName = '',
    measureChanges = [],
    newMeasures = [],
    newAttributes = [],
    relatedEntities = []
  ) {
    this.id = `WB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.type = type;
    this.entityType = entityType;
    this.entityId = entityId;
    this.entityName = entityName;
    this.measureChanges = measureChanges;
    this.newMeasures = newMeasures;
    this.newAttributes = newAttributes;
    this.relatedEntities = relatedEntities;
  }
}

// Новая структура требования
export class RequirementV2 {
  constructor(
    title = '',
    description = '',
    workBlocks = [],
    createdAt = new Date()
  ) {
    this.id = `REQ-${Date.now()}`;
    this.title = title;
    this.description = description;
    this.workBlocks = workBlocks;
    this.createdAt = createdAt;
    this.version = 2;
  }
}
