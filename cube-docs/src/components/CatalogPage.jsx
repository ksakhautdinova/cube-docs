import React, { useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, Check, ChevronDown, ChevronRight, Copy, GitBranch, History, Package, Plus, Shuffle, X } from 'lucide-react';
import { CUBE_DATA, getEntity, getRelationsForEntity } from '../mockData';
import { MasterTable } from './MasterTable';
import { tokenizeDaxExpression } from '../utils/daxFormatter';
import './CatalogPage.css';

const collator = new Intl.Collator(['ru-RU', 'en-US'], {
  sensitivity: 'base',
  numeric: true
});

const sortByName = (items = []) =>
  [...items].sort((a, b) =>
    collator.compare(a?.name || '', b?.name || '') ||
    collator.compare(a?.id || '', b?.id || '')
  );

export const CatalogPage = () => {
  const [selectedEntityId, setSelectedEntityId] = useState(CUBE_DATA.entities[0]?.id);
  const [selectedRelationId, setSelectedRelationId] = useState('');
  const [compareEntityIds, setCompareEntityIds] = useState([]);
  const [activeTab, setActiveTab] = useState('catalog'); // catalog | lineage
  const [treeSearch, setTreeSearch] = useState('');
  const [expandedFacts, setExpandedFacts] = useState(true);
  const [expandedDimensions, setExpandedDimensions] = useState(true);
  const [expandedEntityRelations, setExpandedEntityRelations] = useState({});

  const entity = getEntity(selectedEntityId);
  const isFactTable = entity?.id?.startsWith('F');

  const filteredEntities = useMemo(() => {
    const term = treeSearch.trim().toLowerCase();
    if (!term) return sortByName(CUBE_DATA.entities);
    return sortByName(
      CUBE_DATA.entities.filter((ent) =>
        ent.name.toLowerCase().includes(term) || ent.id.toLowerCase().includes(term)
      )
    );
  }, [treeSearch]);

  const factEntities = useMemo(
    () => filteredEntities.filter((ent) => ent.id.startsWith('F')),
    [filteredEntities]
  );
  const dimensionEntities = useMemo(
    () => filteredEntities.filter((ent) => ent.id.startsWith('D')),
    [filteredEntities]
  );

  const catalogRows = useMemo(() => {
    if (!entity) return [];
    const items = sortByName(isFactTable ? entity.measures : entity.columns || []);
    if (isFactTable) {
      return items.map((item, index) => ({
        ...item,
        rowId: item.id || `${item.name}-${index}`,
        hasExpression: item.expression ? 'Есть' : 'Нет'
      }));
    }
    return items.map((item, index) => ({
      ...item,
      rowId: `${item.name}-${index}`,
      hasTranslation: item.translation ? 'Есть' : 'Нет'
    }));
  }, [entity, isFactTable]);

  const addEntityToCompare = (entityId) => {
    if (!entityId || entityId === selectedEntityId) return;
    setCompareEntityIds((prev) => (prev.includes(entityId) ? prev : [...prev, entityId]));
  };

  const removeEntityFromCompare = (entityId) => {
    setCompareEntityIds((prev) => prev.filter((id) => id !== entityId));
  };

  const toggleEntityRelations = (entityId) => {
    setExpandedEntityRelations((prev) => ({ ...prev, [entityId]: !prev[entityId] }));
  };

  const getEntityRelationTargets = (entityId) => {
    const entityRelations = getRelationsForEntity(entityId);
    return entityRelations.map((rel, idx) => {
      const targetId = rel.fromTable === entityId ? rel.toTable : rel.fromTable;
      const targetEntity = getEntity(targetId);
      const fromColumn = rel.fromTable === entityId ? rel.fromColumn : rel.toColumn;
      const toColumn = rel.fromTable === entityId ? rel.toColumn : rel.fromColumn;
      return {
        id: `${entityId}-${targetId}-${idx}`,
        targetId,
        targetName: targetEntity?.name || targetId,
        relationLabel: `[${fromColumn}] -> [${toColumn}]`
      };
    });
  };

  const currentRelationTargets = useMemo(
    () => getEntityRelationTargets(selectedEntityId),
    [selectedEntityId]
  );
  const compareRelationsByEntity = useMemo(() => {
    const map = new Map();
    compareEntityIds.forEach((entityId) => {
      if (entityId !== selectedEntityId) {
        map.set(entityId, getEntityRelationTargets(entityId));
      }
    });
    return map;
  }, [compareEntityIds, selectedEntityId]);

  const relationComparisonRows = useMemo(() => {
    const currentMap = new Map();
    const perCompareMaps = new Map();

    currentRelationTargets.forEach((item) => {
      if (!currentMap.has(item.targetId)) currentMap.set(item.targetId, []);
      currentMap.get(item.targetId).push(item.relationLabel);
    });

    compareRelationsByEntity.forEach((targets, entityId) => {
      const compareMap = new Map();
      targets.forEach((item) => {
        if (!compareMap.has(item.targetId)) compareMap.set(item.targetId, []);
        compareMap.get(item.targetId).push(item.relationLabel);
      });
      perCompareMaps.set(entityId, compareMap);
    });

    const allTargetIds = new Set([...currentMap.keys()]);
    perCompareMaps.forEach((compareMap) => compareMap.forEach((_, targetId) => allTargetIds.add(targetId)));

    return Array.from(allTargetIds)
      .map((targetId) => {
        const targetEntity = getEntity(targetId);
        const leftValues = currentMap.get(targetId) || [];
        const compareValues = {};
        let hasAnyMatch = false;
        perCompareMaps.forEach((compareMap, entityId) => {
          const values = compareMap.get(targetId) || [];
          compareValues[entityId] = values;
          if (leftValues.length > 0 && values.length > 0) hasAnyMatch = true;
        });
        return {
          targetId,
          targetName: targetEntity?.name || targetId,
          leftValues,
          compareValues,
          isMatch: hasAnyMatch
        };
      })
      .sort((a, b) => collator.compare(a.targetName, b.targetName));
  }, [compareRelationsByEntity, currentRelationTargets]);

  const formatEntityTitle = (entityId) => {
    const entityItem = getEntity(entityId);
    return entityItem ? `${entityId} ${entityItem.name}` : entityId;
  };

  const formatComparisonHeader = (entityId, suffix) => {
    const entityItem = getEntity(entityId);
    const tableName = entityItem?.tableName || entityId;
    return `${tableName} (${suffix})`;
  };

  return (
    <div className="catalog-page">
      <h1>Каталог куба</h1>
      <p className="description">Справка по всем фактам, измерениям и связям в кубе</p>

      {/* Табы */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'catalog' ? 'active' : ''}`}
          onClick={() => setActiveTab('catalog')}
        >
          <BarChart3 size={16} />
          <span>Каталог</span>
        </button>
        <button 
          className={`tab ${activeTab === 'lineage' ? 'active' : ''}`}
          onClick={() => setActiveTab('lineage')}
        >
          <GitBranch size={16} />
          <span>Data Lineage (DBT/Git)</span>
        </button>
      </div>

      {activeTab === 'catalog' ? (
        <div className="catalog-layout">
          <aside className="entity-tree">
            <div className="entity-tree-header">
              <input
                type="text"
                className="entity-tree-search"
                placeholder="Поиск сущности..."
                value={treeSearch}
                onChange={(event) => setTreeSearch(event.target.value)}
              />
            </div>
            <div className="entity-tree-content">
              <TreeGroup
                title="Факты"
                expanded={expandedFacts}
                onToggle={() => setExpandedFacts((prev) => !prev)}
                entities={factEntities}
                selectedEntityId={selectedEntityId}
                expandedEntityRelations={expandedEntityRelations}
                onToggleEntityRelations={toggleEntityRelations}
                getEntityRelationTargets={getEntityRelationTargets}
                onSelectEntity={(entityId) => {
                  setSelectedEntityId(entityId);
                  setSelectedRelationId('');
                  setCompareEntityIds((prev) => prev.filter((id) => id !== entityId));
                }}
                selectedRelationId={selectedRelationId}
                onSelectRelation={(target, sourceId) => {
                  setSelectedEntityId(target.targetId);
                  setSelectedRelationId(`${sourceId}:${target.id}`);
                  setCompareEntityIds((prev) => prev.filter((id) => id !== target.targetId));
                }}
                onAddCompare={addEntityToCompare}
                onRemoveCompare={removeEntityFromCompare}
                compareEntityIds={compareEntityIds}
              />
              <TreeGroup
                title="Измерения"
                expanded={expandedDimensions}
                onToggle={() => setExpandedDimensions((prev) => !prev)}
                entities={dimensionEntities}
                selectedEntityId={selectedEntityId}
                expandedEntityRelations={expandedEntityRelations}
                onToggleEntityRelations={toggleEntityRelations}
                getEntityRelationTargets={getEntityRelationTargets}
                onSelectEntity={(entityId) => {
                  setSelectedEntityId(entityId);
                  setSelectedRelationId('');
                  setCompareEntityIds((prev) => prev.filter((id) => id !== entityId));
                }}
                selectedRelationId={selectedRelationId}
                onSelectRelation={(target, sourceId) => {
                  setSelectedEntityId(target.targetId);
                  setSelectedRelationId(`${sourceId}:${target.id}`);
                  setCompareEntityIds((prev) => prev.filter((id) => id !== target.targetId));
                }}
                onAddCompare={addEntityToCompare}
                onRemoveCompare={removeEntityFromCompare}
                compareEntityIds={compareEntityIds}
              />
            </div>
          </aside>

          <div className="catalog-main">
            <div className="selected-entity-panel">
              <span className="selected-entity-id">{entity?.id}</span>
              <strong>{entity?.name}</strong>
              <span className="selected-entity-meta">{isFactTable ? 'Таблица фактов' : 'Справочник'}</span>
            </div>
            {/* Показатели (для фактов) или Атрибуты (для измерений) */}
            <div className="items-section">
              <h3>{isFactTable ? `Показатели (${catalogRows.length})` : `Атрибуты (${catalogRows.length})`}</h3>
              <MasterTable
                data={catalogRows}
                getRowId={(row) => row.rowId}
                searchableFields={isFactTable ? ['name', 'translation', 'expression'] : ['name', 'translation']}
                filterConfigs={[]}
                defaultSort={{ key: 'name', direction: 'asc' }}
                renderExpanded={isFactTable ? (row) => <DaxPreviewCard expression={row.expression} /> : undefined}
                columns={
                  isFactTable
                    ? [
                        {
                          key: 'name',
                          label: 'Название',
                          render: (value) => <code>{value}</code>
                        },
                        {
                          key: 'translation',
                          label: 'Перевод'
                        }
                      ]
                    : [
                        {
                          key: 'name',
                          label: 'Столбец (имя в кубе)',
                          render: (value) => <code>{value}</code>
                        },
                        {
                          key: 'translation',
                          label: 'Перевод'
                        }
                      ]
                }
              />
            </div>

            {/* Связи */}
            <div className="relations-section">
              <div className="relations-compare-header">
                <h3>Сравнение связей ({currentRelationTargets.length})</h3>
                <div className="compare-entity-chips">
                  {compareEntityIds.length === 0 ? (
                    <span className="compare-empty-hint">Добавьте таблицы в сравнение через + в дереве</span>
                  ) : (
                    compareEntityIds.map((entityId) => {
                      return (
                        <span key={entityId} className="compare-chip">
                          <span>{formatEntityTitle(entityId)}</span>
                          <button type="button" className="compare-chip-remove" onClick={() => removeEntityFromCompare(entityId)} aria-label="Убрать из сравнения">
                            <X size={12} />
                          </button>
                        </span>
                      );
                    })
                  )}
                </div>
              </div>
              <table className="relations-compare-table">
                <thead>
                  <tr>
                    <th>Общая сущность</th>
                    <th>{formatComparisonHeader(selectedEntityId, 'текущая')}</th>
                    {compareEntityIds.map((entityId) => (
                      <th key={`head-${entityId}`}>{formatComparisonHeader(entityId, 'сравнение')}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {relationComparisonRows.length === 0 ? (
                    <tr>
                      <td className="relations-compare-empty" colSpan={2 + compareEntityIds.length}>Связи не найдены</td>
                    </tr>
                  ) : (
                    relationComparisonRows.map((row) => (
                      <tr key={row.targetId} className={row.isMatch ? 'is-match' : ''}>
                        <td>
                          <code>{row.targetId}</code>
                          <div>{row.targetName}</div>
                        </td>
                        <td>
                          {row.leftValues.length === 0
                            ? '-'
                            : row.leftValues.map((value, idx) => (
                                <div key={`left-${row.targetId}-${idx}`} className="relation-signature">{value}</div>
                              ))}
                        </td>
                        {compareEntityIds.map((entityId) => {
                          const values = row.compareValues[entityId] || [];
                          return (
                            <td key={`${row.targetId}-${entityId}`}>
                              {values.length === 0
                                ? '-'
                                : values.map((value, idx) => (
                                    <div key={`right-${row.targetId}-${entityId}-${idx}`} className="relation-signature">{value}</div>
                                  ))}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="lineage-section">
          <div className="placeholder-box">
            <h2>
              <GitBranch size={18} />
              <span>Data Lineage</span>
            </h2>
            <p className="placeholder-text">
              Здесь будет отображаться информация о том, на основе каких источников строится эта сущность в витрине данных.
            </p>
            <ul className="feature-list">
              <li><Package size={16} /> <span>Интеграция с DBT проектом</span></li>
              <li><Shuffle size={16} /> <span>Интеграция с Git репозиторием</span></li>
              <li><BarChart3 size={16} /> <span>Визуализация data lineage</span></li>
              <li><History size={16} /> <span>История изменений схемы</span></li>
            </ul>
            <p className="placeholder-note">
              <AlertTriangle size={16} />
              <span>Функционал в разработке</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const TreeGroup = ({
  title,
  expanded,
  onToggle,
  entities,
  selectedEntityId,
  expandedEntityRelations,
  onToggleEntityRelations,
  getEntityRelationTargets,
  onSelectEntity,
  selectedRelationId,
  onSelectRelation,
  onAddCompare,
  onRemoveCompare,
  compareEntityIds
}) => {
  return (
    <div className="tree-group">
      <button type="button" className="tree-group-button" onClick={onToggle}>
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span>{title}</span>
      </button>
      {expanded && (
        <div className="tree-entities">
          {entities.map((ent) => {
            const relationTargets = getEntityRelationTargets(ent.id);
            const isOpen = Boolean(expandedEntityRelations[ent.id]);
            const isCompareAdded = compareEntityIds.includes(ent.id);
            return (
              <div key={ent.id} className="tree-entity-block">
                <div className="tree-entity-row">
                  <button
                    type="button"
                    className="tree-node-toggle"
                    onClick={() => onToggleEntityRelations(ent.id)}
                    aria-label="Раскрыть связи сущности"
                  >
                    {relationTargets.length === 0 ? null : isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  </button>
                  <div className={`tree-entity-main ${selectedEntityId !== ent.id ? 'has-compare-action' : ''} ${isCompareAdded ? 'is-added' : ''}`}>
                    <button
                      type="button"
                      className={`tree-entity-button ${selectedEntityId === ent.id ? 'active' : ''}`}
                      onClick={() => onSelectEntity(ent.id)}
                    >
                      <span className="tree-entity-id">{ent.id}</span>
                      <span className="tree-entity-name">{ent.name}</span>
                    </button>
                    {selectedEntityId !== ent.id && (
                      <button
                        type="button"
                        className={`tree-add-compare-btn ${isCompareAdded ? 'is-added' : ''}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (isCompareAdded) {
                            onRemoveCompare(ent.id);
                          } else {
                            onAddCompare(ent.id);
                          }
                        }}
                        title={isCompareAdded ? 'Убрать из сравнения' : 'Добавить в сравнение'}
                        aria-label={isCompareAdded ? 'Убрать из сравнения' : 'Добавить в сравнение'}
                      >
                        <span className="icon-plus"><Plus size={12} /></span>
                        <span className="icon-remove"><X size={12} /></span>
                      </button>
                    )}
                  </div>
                </div>
                {isOpen && relationTargets.length > 0 && (
                  <div className="tree-relation-list">
                    {relationTargets.map((target) => (
                      <button
                        key={target.id}
                        type="button"
                        className={`tree-relation-button ${selectedRelationId === `${ent.id}:${target.id}` ? 'active' : ''}`}
                        onClick={() => onSelectRelation(target, ent.id)}
                      >
                        <span>{target.targetName}</span>
                        <span className="tree-relation-label">{target.relationLabel}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const DaxHighlightedCode = ({ expression }) => {
  const tokenLines = tokenizeDaxExpression(expression || '');
  return (
    <code className="dax-highlighted-code">
      {tokenLines.map((line, lineIndex) => (
        <span key={`line-${lineIndex}`} className="dax-highlighted-line">
          {line.map((token, tokenIndex) => (
            <span key={`line-${lineIndex}-token-${tokenIndex}`} className={`dax-token dax-token-${token.type}`}>
              {token.value}
            </span>
          ))}
        </span>
      ))}
    </code>
  );
};

const DaxPreviewCard = ({ expression }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(expression || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch (error) {
      console.error('Copy failed', error);
    }
  };

  return (
    <div className="dax-preview-card">
      <div className="dax-preview-header">
        <strong>Выражение DAX</strong>
        <button type="button" className="copy-code-btn" onClick={handleCopy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Скопировано' : 'Копировать'}</span>
        </button>
      </div>
      <pre>{expression ? <DaxHighlightedCode expression={expression} /> : 'Нет выражения'}</pre>
    </div>
  );
};
