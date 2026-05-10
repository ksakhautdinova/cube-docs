// Import parsed data from cubeData.json
import rawCubeData from './data/cubeData.json' with { type: 'json' };

const collator = new Intl.Collator(['ru-RU', 'en-US'], {
  sensitivity: 'base',
  numeric: true
});

const sortByDisplayName = (items) =>
  [...items].sort((a, b) =>
    collator.compare(a?.name || '', b?.name || '') ||
    collator.compare(a?.id || '', b?.id || '')
  );

function adaptEntity(entity) {
  const adapted = { ...entity };

  if (adapted.measures) {
    adapted.measures = sortByDisplayName(
      adapted.measures.map(m => ({
        ...m,
        id: m.id || m.name,
        translation: m.translatedCaption || m.name,
        description: m.description || ''
      }))
    );
  }

  if (adapted.columns) {
    adapted.columns = sortByDisplayName(
      adapted.columns.map(c => ({
        ...c,
        id: c.id || c.name,
        translation: c.translatedCaption || c.name,
        description: c.description || ''
      }))
    );
  }

  if (adapted.dimensions) {
    adapted.dimensions = [...adapted.dimensions];
  }

  return adapted;
}

const adaptedEntities = sortByDisplayName(
  (rawCubeData.entities || []).map(adaptEntity)
);

const adaptedMeasureGroups = sortByDisplayName(
  (rawCubeData.measureGroups || []).map(adaptEntity)
);

const adaptedDimensionEntities = sortByDisplayName(
  (rawCubeData.dimensionEntities || []).map(adaptEntity)
);

export const CUBE_DATA = {
  entities: adaptedEntities,
  measureGroups: adaptedMeasureGroups,
  dimensionEntities: adaptedDimensionEntities,
  tableRelations: rawCubeData.tableRelations || []
};

export const getEntity = (entityId) => {
  return CUBE_DATA.entities.find(e => e.id === entityId);
};

export const getMeasureGroup = (groupId) => {
  return CUBE_DATA.measureGroups.find(g => g.id === groupId);
};

export const getDimensionEntity = (dimId) => {
  return CUBE_DATA.dimensionEntities.find(d => d.id === dimId);
};

export const getRelationsForEntity = (entityId) => {
  return CUBE_DATA.tableRelations.filter(r => r.fromTable === entityId || r.toTable === entityId);
};

export const getMeasuresForGroup = (groupId) => {
  const group = getMeasureGroup(groupId);
  return group ? group.measures : [];
};

export const getDimensionsForGroup = (groupId) => {
  const group = getMeasureGroup(groupId);
  if (!group || !group.dimensions) return [];

  return sortByDisplayName(
    group.dimensions
      .map(dimId => getDimensionEntity(dimId))
      .filter(Boolean)
  );
};
