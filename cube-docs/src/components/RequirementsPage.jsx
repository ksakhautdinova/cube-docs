import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, File, FileText, Plus, Save, Trash2, X } from 'lucide-react';
import { CUBE_DATA, getEntity, getMeasuresForGroup, getRelationsForEntity } from '../mockData';
import { RequirementV2, WorkBlock, MeasureChange, NewMeasure, NewAttribute } from '../types';
import { exportToDocxV2, downloadFile } from '../exportService';
import { storageService } from '../storageService';
import { MasterTable } from './MasterTable';
import './RequirementsPage.css';

const collator = new Intl.Collator(['ru-RU', 'en-US'], { sensitivity: 'base', numeric: true });
const sortByName = (items = []) =>
  [...items].sort((a, b) => collator.compare(a?.name || '', b?.name || '') || collator.compare(a?.id || '', b?.id || ''));
const DRAFT_KEY = 'cube_docs_requirement_draft_v2';

export const RequirementsPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [workBlocks, setWorkBlocks] = useState([]);
  const [activeBlockId, setActiveBlockId] = useState('');
  const [expandedBlocks, setExpandedBlocks] = useState({});
  const [isReqInfoExpanded, setReqInfoExpanded] = useState(true);
  const [draftLoaded, setDraftLoaded] = useState(false);

  const activeBlock = workBlocks.find((block) => block.id === activeBlockId) || null;

  useEffect(() => {
    try {
      const rawDraft = localStorage.getItem(DRAFT_KEY);
      if (rawDraft) {
        const draft = JSON.parse(rawDraft);
        setTitle(draft.title || '');
        setDescription(draft.description || '');
        setWorkBlocks(Array.isArray(draft.workBlocks) ? draft.workBlocks : []);
        setActiveBlockId(draft.activeBlockId || '');
        setExpandedBlocks(draft.expandedBlocks || {});
        setReqInfoExpanded(draft.isReqInfoExpanded ?? true);
      }
    } catch (error) {
      console.error('Draft load failed', error);
    } finally {
      setDraftLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!draftLoaded || workBlocks.length > 0) return;
    const initialBlock = new WorkBlock();
    setWorkBlocks([initialBlock]);
    setActiveBlockId(initialBlock.id);
    setExpandedBlocks({ [initialBlock.id]: false });
  }, [draftLoaded, workBlocks.length]);

  useEffect(() => {
    if (!draftLoaded) return;
    const draft = {
      title,
      description,
      workBlocks,
      activeBlockId,
      expandedBlocks,
      isReqInfoExpanded
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [activeBlockId, description, draftLoaded, expandedBlocks, isReqInfoExpanded, title, workBlocks]);

  const handleAddWorkBlock = () => {
    const newBlock = new WorkBlock();
    setWorkBlocks((prev) => [...prev, newBlock]);
    setActiveBlockId(newBlock.id);
    setExpandedBlocks((prev) => ({ ...prev, [newBlock.id]: false }));
  };

  const handleRemoveWorkBlock = (blockId) => {
    setWorkBlocks((prev) => {
      const updated = prev.filter((block) => block.id !== blockId);
      if (blockId === activeBlockId) {
        setActiveBlockId(updated[0]?.id || '');
      }
      return updated;
    });
  };

  const handleUpdateWorkBlock = (blockId, updates) => {
    setWorkBlocks((prev) => prev.map((block) => (block.id === blockId ? { ...block, ...updates } : block)));
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Пожалуйста, введите название требования');
      return;
    }
    const requirement = new RequirementV2(title, description, workBlocks);
    storageService.saveRequirement(requirement);
    alert('Требование успешно сохранено!');
  };

  const handleExportMarkdown = () => {
    const requirement = new RequirementV2(title, description, workBlocks);
    const markdown = exportToMarkdownV2(requirement);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    downloadFile(blob, `${title || 'requirements'}.md`);
  };

  const handleExportDocx = async () => {
    try {
      if (!title.trim()) {
        alert('Пожалуйста, введите название требования');
        return;
      }
      const requirement = new RequirementV2(title, description, workBlocks);
      const blob = await exportToDocxV2(requirement);
      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const filename = `RequirementV2_${title.replace(/[^\w\s]/g, '')}_${dateStr}.docx`;
      downloadFile(blob, filename);
    } catch (error) {
      console.error('Export error:', error);
      alert(`Ошибка при экспорте в DOCX: ${error.message}`);
    }
  };

  return (
    <div className="requirements-page">
      <h1>Конструктор функциональных требований</h1>
      <p className="description">Создавайте требования для расширения куба данных</p>

      <div className="requirements-container-v2">
        <section className="work-blocks-section">
          <div className="section-header">
            <h2>Блоки работ</h2>
            <button className="btn-primary" onClick={handleAddWorkBlock}>
              <Plus size={16} />
              <span>Добавить блок работы</span>
            </button>
          </div>

          {workBlocks.length === 0 ? (
            <div className="empty-state-large">
              <p>Нет добавленных блоков работ</p>
              <p className="hint">Добавьте блок и настройте сущности, изменения и связи</p>
            </div>
          ) : (
            <div className="work-blocks-workspace">
              <aside className="work-blocks-tree">
                {workBlocks.map((block, index) => {
                  const isExpanded = Boolean(expandedBlocks[block.id]);
                  const entity = block.entityId ? getEntity(block.entityId) : null;
                  const relatedEntities = sortByName(block.relatedEntities.map((id) => getEntity(id)).filter(Boolean));
                  return (
                    <div key={block.id} className={`work-block-tree-node ${activeBlockId === block.id ? 'active' : ''}`}>
                      <div className="work-block-tree-header">
                        <button
                          type="button"
                          className="tree-icon-btn"
                          onClick={() => setExpandedBlocks((prev) => ({ ...prev, [block.id]: !prev[block.id] }))}
                        >
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                        <button type="button" className="work-block-tree-title" onClick={() => setActiveBlockId(block.id)}>
                          <span>Блок #{index + 1}</span>
                          <small>{entity?.name || block.entityName || 'Сущность не выбрана'}</small>
                        </button>
                        <button type="button" className="tree-remove-btn" onClick={() => handleRemoveWorkBlock(block.id)}>
                          <X size={14} />
                        </button>
                      </div>
                      {isExpanded && (
                        <div className="work-block-tree-content">
                          <div className="work-block-tree-item">Тип: {block.type === 'existing' ? 'Изменение' : 'Создание'}</div>
                          <div className="work-block-tree-item">Сущность: {entity?.id || block.entityType}</div>
                          <div className="work-block-tree-relations">
                            {(relatedEntities.length === 0 ? ['Связи не выбраны'] : relatedEntities.map((item) => item.name)).map(
                              (label, idx) => (
                                <div key={`${block.id}-rel-${idx}`} className="work-block-tree-relation-item">
                                  {label}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </aside>

              <div className="work-blocks-editor-pane">
                <div className="requirement-info-card">
                  <button type="button" className="requirement-info-toggle" onClick={() => setReqInfoExpanded((prev) => !prev)}>
                    {isReqInfoExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <span>Наименование требования</span>
                  </button>
                  {isReqInfoExpanded && (
                    <div className="requirement-info-body">
                      <div className="form-group">
                        <label>Название требования *</label>
                        <input
                          type="text"
                          placeholder="Например: Добавление новых мер для анализа скидок"
                          value={title}
                          onChange={(event) => setTitle(event.target.value)}
                          className="input-large"
                        />
                      </div>
                      <div className="form-group">
                        <label>Описание</label>
                        <textarea
                          placeholder="Подробное описание требования..."
                          value={description}
                          onChange={(event) => setDescription(event.target.value)}
                          rows="4"
                        />
                      </div>
                    </div>
                  )}
                </div>
                {activeBlock ? (
                  <WorkBlockEditor
                    block={activeBlock}
                    index={workBlocks.findIndex((item) => item.id === activeBlock.id)}
                    onUpdate={(updates) => handleUpdateWorkBlock(activeBlock.id, updates)}
                    onRemove={() => handleRemoveWorkBlock(activeBlock.id)}
                  />
                ) : (
                  <div className="empty-state-small">Выберите блок в дереве слева</div>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="form-section actions-section">
          <div className="actions-grid">
            <button className="btn-save" onClick={handleSave} disabled={!title.trim() || workBlocks.length === 0}>
              <Save size={16} />
              <span>Сохранить требование</span>
            </button>
            <button className="btn-export" onClick={handleExportMarkdown} disabled={!title.trim() || workBlocks.length === 0}>
              <FileText size={16} />
              <span>Экспорт Markdown</span>
            </button>
            <button className="btn-export" onClick={handleExportDocx} disabled={!title.trim() || workBlocks.length === 0}>
              <File size={16} />
              <span>Экспорт DOCX</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

const ChoiceChipGroup = ({ value, options, onChange }) => (
  <div className="choice-chip-group">
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        className={`choice-chip ${value === option.value ? 'active' : ''}`}
        onClick={() => onChange(option.value)}
      >
        {option.label}
      </button>
    ))}
  </div>
);

const WorkBlockEditor = ({ block, index, onUpdate, onRemove }) => {
  const [treeSearch, setTreeSearch] = useState('');
  const [expandedFacts, setExpandedFacts] = useState(true);
  const [expandedDimensions, setExpandedDimensions] = useState(true);
  const [measureSearch, setMeasureSearch] = useState('');
  const [isAddMeasureModalOpen, setAddMeasureModalOpen] = useState(false);
  const [newChangedMeasureName, setNewChangedMeasureName] = useState('');
  const [newChangedMeasureFormula, setNewChangedMeasureFormula] = useState('');

  const selectedEntity = block.entityId ? getEntity(block.entityId) : null;
  const isFactTable = selectedEntity?.id?.startsWith('F');

  const filteredEntities = useMemo(() => {
    const term = treeSearch.trim().toLowerCase();
    if (!term) return sortByName(CUBE_DATA.entities);
    return sortByName(
      CUBE_DATA.entities.filter(
        (entity) => entity.name.toLowerCase().includes(term) || entity.id.toLowerCase().includes(term)
      )
    );
  }, [treeSearch]);

  const factEntities = useMemo(() => filteredEntities.filter((entity) => entity.id.startsWith('F')), [filteredEntities]);
  const dimensionEntities = useMemo(
    () => filteredEntities.filter((entity) => entity.id.startsWith('D')),
    [filteredEntities]
  );

  const blockIsFact = useMemo(() => {
    if (block.type === 'existing') return selectedEntity?.id?.startsWith('F');
    return block.entityType === 'fact';
  }, [block.entityType, block.type, selectedEntity]);

  const availableRelatedEntities = useMemo(() => {
    const currentEntityId = block.entityId;
    return sortByName(
      CUBE_DATA.entities.filter((entity) => {
        if (entity.id === currentEntityId) return false;
        if (blockIsFact === true) return entity.id.startsWith('D');
        if (blockIsFact === false) return entity.id.startsWith('F');
        return true;
      })
    );
  }, [block.entityId, blockIsFact]);

  const selectedRelatedEntities = useMemo(
    () => {
      const existingIds = block.existingRelatedEntities || [];
      const entities = block.relatedEntities.map((id) => getEntity(id)).filter(Boolean);
      const existing = entities.filter((entityItem) => existingIds.includes(entityItem.id));
      const created = entities.filter((entityItem) => !existingIds.includes(entityItem.id));
      return [...created, ...existing];
    },
    [block.existingRelatedEntities, block.relatedEntities]
  );

  const availableRelationsOnly = useMemo(
    () => availableRelatedEntities.filter((entity) => !block.relatedEntities.includes(entity.id)),
    [availableRelatedEntities, block.relatedEntities]
  );

  const sourceMeasures = useMemo(() => {
    if (block.type !== 'existing' || !isFactTable) return [];
    const fromEntity = selectedEntity?.measures || [];
    const fromGroup = getMeasuresForGroup(block.entityId) || [];
    const merged = fromEntity.length > 0 ? fromEntity : fromGroup;
    return sortByName(merged);
  }, [block.entityId, block.type, isFactTable, selectedEntity]);

  const filteredMeasureCandidates = useMemo(() => {
    const usedIds = new Set(block.measureChanges.map((item) => item.measureId));
    const term = measureSearch.trim().toLowerCase();
    return sourceMeasures.filter((measure) => {
      const measureId = measure.id || measure.name;
      if (usedIds.has(measureId)) return false;
      if (!term) return true;
      return (
        String(measure.name || '').toLowerCase().includes(term) ||
        String(measure.translation || '').toLowerCase().includes(term)
      );
    });
  }, [block.measureChanges, measureSearch, sourceMeasures]);

  useEffect(() => {
    if (block.type !== 'existing' || !block.entityId || block.relatedEntities.length > 0) return;
    const defaultRelated = getRelationsForEntity(block.entityId)
      .map((rel) => (rel.fromTable === block.entityId ? rel.toTable : rel.fromTable))
      .filter((value, idx, arr) => arr.indexOf(value) === idx)
      .filter((id) => {
        if (blockIsFact === true) return id.startsWith('D');
        if (blockIsFact === false) return id.startsWith('F');
        return true;
      });
    if (defaultRelated.length > 0) {
      onUpdate({ relatedEntities: defaultRelated, existingRelatedEntities: defaultRelated });
    }
  }, [block.type, block.entityId, block.relatedEntities.length, blockIsFact, onUpdate]);

  const handleSelectEntity = (entityId) => {
    const entity = getEntity(entityId);
    const entityType = entityId.startsWith('F') ? 'fact' : 'dimension';
    const measureChanges = [];

    const relatedDefaults = getRelationsForEntity(entityId)
      .map((rel) => (rel.fromTable === entityId ? rel.toTable : rel.fromTable))
      .filter((value, idx, arr) => arr.indexOf(value) === idx)
      .filter((id) => (entityType === 'fact' ? id.startsWith('D') : id.startsWith('F')));

    onUpdate({
      entityId,
      entityName: entity?.name || '',
      entityType,
      measureChanges,
      relatedEntities: relatedDefaults,
      existingRelatedEntities: relatedDefaults
    });
    setMeasureSearch('');
  };

  const updateMeasureChange = (measureId, updates) => {
    onUpdate({
      measureChanges: block.measureChanges.map((item) => (item.measureId === measureId ? { ...item, ...updates } : item))
    });
  };

  const removeMeasureChange = (measureId) => {
    onUpdate({ measureChanges: block.measureChanges.filter((item) => item.measureId !== measureId) });
  };

  const handleOpenAddMeasureModal = () => {
    if (!block.entityId) return;
    setNewChangedMeasureName('');
    setNewChangedMeasureFormula('');
    setAddMeasureModalOpen(true);
  };

  const handleCloseAddMeasureModal = () => {
    setAddMeasureModalOpen(false);
    setNewChangedMeasureName('');
    setNewChangedMeasureFormula('');
  };

  const handleAddChangedMeasure = () => {
    const translation = newChangedMeasureName.trim();
    const formula = newChangedMeasureFormula.trim();
    if (!translation || !formula) return;

    const measureId = `MC-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newChange = new MeasureChange(measureId, translation, translation, formula, true, translation, true, formula);
    onUpdate({ measureChanges: [...block.measureChanges, newChange] });
    handleCloseAddMeasureModal();
  };

  const addMeasureToChanges = (measure) => {
    const newChange = new MeasureChange(
      measure.id || measure.name,
      measure.name || '',
      measure.translation || '',
      measure.expression || '',
      false,
      '',
      false,
      ''
    );
    onUpdate({ measureChanges: [...block.measureChanges, newChange] });
  };

  const updateNewMeasure = (index, updates) => {
    const updated = [...block.newMeasures];
    updated[index] = { ...updated[index], ...updates };
    if (updates.translation && !updated[index].name) {
      updated[index].name = updates.translation;
    }
    onUpdate({ newMeasures: updated });
  };

  const updateNewAttribute = (index, updates) => {
    const updated = [...block.newAttributes];
    updated[index] = { ...updated[index], ...updates };
    if (updates.translation && !updated[index].name) {
      updated[index].name = updates.translation;
    }
    onUpdate({ newAttributes: updated });
  };

  return (
    <div className="work-block-card">
      <div className="work-block-header">
        <h3>Блок работы #{index + 1}</h3>
        <button className="btn-danger" onClick={onRemove}>
          <Trash2 size={15} />
          <span>Удалить блок</span>
        </button>
      </div>

      <div className="work-block-body">
        <div className="form-group">
          <label>Тип работы</label>
          <ChoiceChipGroup
            value={block.type}
            onChange={(value) =>
              onUpdate({
                type: value,
                entityId: '',
                entityName: '',
                measureChanges: [],
                newMeasures: [],
                newAttributes: [],
                relatedEntities: []
              })
            }
            options={[
              { value: 'existing', label: 'Изменить существующую сущность' },
              { value: 'new', label: 'Создать новую сущность' }
            ]}
          />
        </div>

        {block.type === 'new' && (
          <div className="form-group">
            <label>Тип сущности</label>
            <ChoiceChipGroup
              value={block.entityType}
              onChange={(value) => onUpdate({ entityType: value, relatedEntities: [] })}
              options={[
                { value: 'fact', label: 'Факт' },
                { value: 'dimension', label: 'Справочник' }
              ]}
            />
          </div>
        )}

        {block.type === 'existing' ? (
          <div className="entity-picker-tree">
            <div className="entity-picker-tree-header">
              <label>Выберите сущность</label>
              <input
                type="text"
                className="req-entity-tree-search"
                placeholder="Поиск сущности..."
                value={treeSearch}
                onChange={(event) => setTreeSearch(event.target.value)}
              />
            </div>
            <div className="entity-picker-tree-body">
              <div className="req-tree-group">
                <button type="button" className="req-tree-group-button" onClick={() => setExpandedFacts((prev) => !prev)}>
                  {expandedFacts ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <span>Факты</span>
                </button>
                {expandedFacts && (
                  <div className="req-tree-entities">
                    {factEntities.map((entityItem) => (
                      <button
                        type="button"
                        key={entityItem.id}
                        className={`req-tree-entity-button ${block.entityId === entityItem.id ? 'active' : ''}`}
                        onClick={() => handleSelectEntity(entityItem.id)}
                      >
                        <span className="req-tree-entity-id">{entityItem.id}</span>
                        <span className="req-tree-entity-name">{entityItem.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="req-tree-group">
                <button type="button" className="req-tree-group-button" onClick={() => setExpandedDimensions((prev) => !prev)}>
                  {expandedDimensions ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <span>Измерения</span>
                </button>
                {expandedDimensions && (
                  <div className="req-tree-entities">
                    {dimensionEntities.map((entityItem) => (
                      <button
                        type="button"
                        key={entityItem.id}
                        className={`req-tree-entity-button ${block.entityId === entityItem.id ? 'active' : ''}`}
                        onClick={() => handleSelectEntity(entityItem.id)}
                      >
                        <span className="req-tree-entity-id">{entityItem.id}</span>
                        <span className="req-tree-entity-name">{entityItem.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="form-group">
            <label>Название новой сущности</label>
            <input
              type="text"
              placeholder={block.entityType === 'fact' ? 'Например: F09999 Новые продажи' : 'Например: D09999 Новый справочник'}
              value={block.entityName}
              onChange={(event) => onUpdate({ entityName: event.target.value })}
            />
          </div>
        )}

        {block.type === 'existing' && isFactTable && (
          <div className="measures-changes-section">
            <div className="section-header">
              <h4>Изменяемые показатели</h4>
              <button type="button" className="btn-secondary" onClick={handleOpenAddMeasureModal} disabled={!block.entityId}>
                <Plus size={15} />
                <span>Добавить показатель</span>
              </button>
            </div>
            <div className="measure-search-panel">
              <input
                type="text"
                className="measure-search-input"
                placeholder="Найти показатель для изменения..."
                value={measureSearch}
                onChange={(event) => setMeasureSearch(event.target.value)}
              />
              <div className="measure-search-results">
                {filteredMeasureCandidates.slice(0, 8).map((measure) => (
                  <button
                    key={`candidate-${measure.id || measure.name}`}
                    type="button"
                    className="measure-candidate-btn"
                    onClick={() => addMeasureToChanges(measure)}
                  >
                    <span>{measure.translation || measure.name}</span>
                    <small>{measure.name}</small>
                  </button>
                ))}
              </div>
            </div>
            <MasterTable
              data={block.measureChanges}
              getRowId={(row) => row.measureId}
              showSearch={false}
              columns={[
                {
                  key: 'originalName',
                  label: 'Название',
                  sortable: false,
                  render: (value, row) => (
                    <input
                      className="master-table-input"
                      value={value || ''}
                      placeholder="Введите название"
                      onChange={(event) => updateMeasureChange(row.measureId, { originalName: event.target.value })}
                    />
                  )
                },
                {
                  key: 'originalTranslation',
                  label: 'Текущий перевод',
                  sortable: false,
                  render: (value, row) => (
                    <input
                      className="master-table-input"
                      value={value || ''}
                      placeholder="Введите перевод"
                      onChange={(event) =>
                        updateMeasureChange(row.measureId, {
                          originalTranslation: event.target.value,
                          newTranslation: event.target.value,
                          needsRename: Boolean(event.target.value.trim())
                        })
                      }
                    />
                  )
                },
                {
                  key: 'originalExpression',
                  label: 'Текущая формула',
                  sortable: false,
                  render: (value, row) => (
                    <textarea
                      className="master-table-textarea"
                      rows={3}
                      value={value || ''}
                      placeholder="Введите формулу DAX"
                      onChange={(event) =>
                        updateMeasureChange(row.measureId, {
                          originalExpression: event.target.value,
                          newExpression: event.target.value,
                          needsFormulaChange: Boolean(event.target.value.trim())
                        })
                      }
                    />
                  )
                },
                {
                  key: 'remove',
                  label: '',
                  sortable: false,
                  render: (_, row) => (
                    <button
                      type="button"
                      className="measure-row-remove-btn"
                      onClick={() => removeMeasureChange(row.measureId)}
                      aria-label="Удалить строку"
                    >
                      <X size={14} />
                    </button>
                  )
                }
              ]}
            />
            {isAddMeasureModalOpen && (
              <div className="req-modal-overlay" role="dialog" aria-modal="true">
                <div className="req-modal-card">
                  <div className="req-modal-header">
                    <h5>Добавить показатель</h5>
                    <button type="button" className="req-modal-close-btn" onClick={handleCloseAddMeasureModal}>
                      <X size={14} />
                    </button>
                  </div>
                  <div className="req-modal-body">
                    <div className="form-group">
                      <label>Название (перевод) *</label>
                      <input
                        type="text"
                        value={newChangedMeasureName}
                        onChange={(event) => setNewChangedMeasureName(event.target.value)}
                        placeholder="Введите название показателя"
                      />
                    </div>
                    <div className="form-group">
                      <label>Формула *</label>
                      <textarea
                        rows={4}
                        value={newChangedMeasureFormula}
                        onChange={(event) => setNewChangedMeasureFormula(event.target.value)}
                        placeholder="Введите формулу DAX"
                      />
                    </div>
                  </div>
                  <div className="req-modal-footer">
                    <button type="button" className="btn-secondary" onClick={handleCloseAddMeasureModal}>
                      Отмена
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleAddChangedMeasure}
                      disabled={!newChangedMeasureName.trim() || !newChangedMeasureFormula.trim()}
                    >
                      Сохранить
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {block.type === 'new' && block.entityType === 'fact' && (
          <div className="new-measures-section">
            <div className="section-header">
              <h4>Новые показатели</h4>
              <button className="btn-secondary" onClick={() => onUpdate({ newMeasures: [...block.newMeasures, new NewMeasure()] })}>
                <Plus size={15} />
                <span>Добавить показатель</span>
              </button>
            </div>
            {block.newMeasures.length === 0 ? (
              <p className="empty-state-small">Нет новых показателей</p>
            ) : (
              <div className="new-measures-list">
                {block.newMeasures.map((measure, indexMeasure) => (
                  <div key={`measure-${indexMeasure}`} className="new-measure-card">
                    <div className="card-header-small">
                      <span>Показатель #{indexMeasure + 1}</span>
                      <button
                        className="btn-danger-small"
                        onClick={() => onUpdate({ newMeasures: block.newMeasures.filter((_, idx) => idx !== indexMeasure) })}
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Название на русском"
                      value={measure.translation || ''}
                      onChange={(event) => updateNewMeasure(indexMeasure, { translation: event.target.value })}
                    />
                    <textarea
                      placeholder="Формула DAX"
                      value={measure.expression || ''}
                      rows={2}
                      onChange={(event) => updateNewMeasure(indexMeasure, { expression: event.target.value })}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {(block.entityType === 'dimension' || (!isFactTable && selectedEntity)) && (
          <div className="new-attributes-section">
            <div className="section-header">
              <h4>Новые атрибуты</h4>
              <button className="btn-secondary" onClick={() => onUpdate({ newAttributes: [...block.newAttributes, new NewAttribute()] })}>
                <Plus size={15} />
                <span>Добавить атрибут</span>
              </button>
            </div>
            {block.newAttributes.length === 0 ? (
              <p className="empty-state-small">Нет новых атрибутов</p>
            ) : (
              <div className="new-attributes-list">
                {block.newAttributes.map((attribute, indexAttribute) => (
                  <div key={`attr-${indexAttribute}`} className="new-attribute-card">
                    <div className="card-header-small">
                      <span>Атрибут #{indexAttribute + 1}</span>
                      <button
                        className="btn-danger-small"
                        onClick={() => onUpdate({ newAttributes: block.newAttributes.filter((_, idx) => idx !== indexAttribute) })}
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Название на русском"
                      value={attribute.translation || ''}
                      onChange={(event) => updateNewAttribute(indexAttribute, { translation: event.target.value })}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="relations-section relations-dual-list">
          <h4>Связи с другими сущностями</h4>
          <div className="relations-transfer-controls">
            <button type="button" className="btn-secondary" onClick={() => onUpdate({ relatedEntities: [] })}>
              Убрать все
            </button>
          </div>
          <div className="relations-transfer-grid">
            <div className="relations-transfer-column">
              <h5>Доступные связи</h5>
              <div className="relations-transfer-list">
                {availableRelationsOnly.length === 0 ? (
                  <p className="empty-state-small">Нет доступных связей</p>
                ) : (
                  availableRelationsOnly.map((entityItem) => (
                    <button
                      key={entityItem.id}
                      type="button"
                      className="transfer-item"
                      onClick={() => onUpdate({ relatedEntities: [...block.relatedEntities, entityItem.id] })}
                    >
                      {entityItem.name}
                    </button>
                  ))
                )}
              </div>
            </div>
            <div className="relations-transfer-column">
              <h5>Выбранные связи</h5>
              <div className="relations-transfer-list">
                {selectedRelatedEntities.length === 0 ? (
                  <p className="empty-state-small">Связи не выбраны</p>
                ) : (
                  selectedRelatedEntities.map((entityItem) => (
                    <button
                      key={entityItem.id}
                      type="button"
                      className={`transfer-item selected ${(block.existingRelatedEntities || []).includes(entityItem.id) ? 'existing' : 'new'}`}
                      onClick={() =>
                        onUpdate({ relatedEntities: block.relatedEntities.filter((id) => id !== entityItem.id) })
                      }
                    >
                      {entityItem.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const exportToMarkdownV2 = (requirement) => {
  let md = `# ${requirement.title}\n\n`;
  if (requirement.description) md += `## Описание\n${requirement.description}\n\n`;
  md += `## Блоки работ\n\n`;

  requirement.workBlocks.forEach((block, index) => {
    md += `### Блок ${index + 1}: ${block.entityName || 'Новая сущность'}\n\n`;
    md += `- **Тип работы**: ${block.type === 'existing' ? 'Изменение существующей' : 'Создание новой'}\n`;
    md += `- **Тип сущности**: ${block.entityType === 'fact' ? 'Факт' : 'Справочник'}\n\n`;

    if (block.measureChanges?.length > 0) {
      const changed = block.measureChanges.filter((item) => item.needsRename || item.needsFormulaChange);
      if (changed.length > 0) {
        md += `#### Изменения существующих показателей\n\n`;
        changed.forEach((item) => {
          md += `- **${item.originalName}**\n`;
          if (item.needsRename) md += `  - Новый перевод: ${item.newTranslation || '-'}\n`;
          if (item.needsFormulaChange) md += `  - Новая формула: \`${item.newExpression || '-'}\`\n`;
        });
        md += `\n`;
      }
    }

    if (block.newMeasures?.length > 0) {
      md += `#### Новые показатели\n\n`;
      block.newMeasures.forEach((item) => {
        md += `- **${item.translation || '-'}**\n`;
        md += `  - Формула: \`${item.expression || '-'}\`\n`;
      });
      md += `\n`;
    }

    if (block.newAttributes?.length > 0) {
      md += `#### Новые атрибуты\n\n`;
      block.newAttributes.forEach((item) => {
        md += `- **${item.translation || '-'}**\n`;
      });
      md += `\n`;
    }

    if (block.relatedEntities?.length > 0) {
      md += `#### Связи\n\n`;
      block.relatedEntities.forEach((entityId) => {
        const entityItem = getEntity(entityId);
        if (entityItem) md += `- ${entityItem.name}\n`;
      });
      md += `\n`;
    }
  });

  md += '\n---\n';
  md += `*Создано: ${new Date(requirement.createdAt).toLocaleString('ru-RU')}*\n`;
  return md;
};
