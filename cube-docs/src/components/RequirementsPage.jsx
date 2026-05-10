import React, { useState, useMemo } from 'react';
import { Check, Copy, File, FileText, Plus, Save, Trash2, X } from 'lucide-react';
import { CUBE_DATA, getEntity, getMeasuresForGroup } from '../mockData';
import { RequirementV2, WorkBlock, MeasureChange, NewMeasure, NewAttribute } from '../types';
import { exportToDocxV2, downloadFile } from '../exportService';
import { storageService } from '../storageService';
import { MasterTable } from './MasterTable';
import { tokenizeDaxExpression } from '../utils/daxFormatter';
import './RequirementsPage.css';

const collator = new Intl.Collator(['ru-RU', 'en-US'], {
  sensitivity: 'base',
  numeric: true
});

const sortByName = (items = []) =>
  [...items].sort((a, b) =>
    collator.compare(a?.name || '', b?.name || '') ||
    collator.compare(a?.id || '', b?.id || '')
  );

export const RequirementsPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [workBlocks, setWorkBlocks] = useState([]);

  const handleAddWorkBlock = () => {
    const newBlock = new WorkBlock();
    setWorkBlocks([...workBlocks, newBlock]);
  };

  const handleRemoveWorkBlock = (blockId) => {
    setWorkBlocks(workBlocks.filter(b => b.id !== blockId));
  };

  const handleUpdateWorkBlock = (blockId, updates) => {
    setWorkBlocks(workBlocks.map(b => 
      b.id === blockId ? { ...b, ...updates } : b
    ));
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
      alert('Ошибка при экспорте в DOCX: ' + error.message);
    }
  };

  return (
    <div className="requirements-page">
      <h1>Конструктор функциональных требований</h1>
      <p className="description">Создавайте требования для расширения куба данных</p>

      <div className="requirements-container-v2">
        {/* Общая информация */}
        <section className="form-section">
          <h2>Общая информация</h2>
          
          <div className="form-group">
            <label>Название требования *</label>
            <input
              type="text"
              placeholder="Например: Добавление новых мер для анализа скидок"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-large"
            />
          </div>

          <div className="form-group">
            <label>Описание</label>
            <textarea
              placeholder="Подробное описание требования..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
            />
          </div>
        </section>

        {/* Блоки работ */}
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
              <p className="hint">Блок работы - это изменение или создание одной сущности (факта или справочника)</p>
            </div>
          ) : (
            <div className="work-blocks-list">
              {workBlocks.map((block, index) => (
                <WorkBlockEditor
                  key={block.id}
                  block={block}
                  index={index}
                  onUpdate={(updates) => handleUpdateWorkBlock(block.id, updates)}
                  onRemove={() => handleRemoveWorkBlock(block.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Экспорт и сохранение */}
        <section className="form-section actions-section">
          <div className="actions-grid">
            <button
              className="btn-save"
              onClick={handleSave}
              disabled={!title.trim() || workBlocks.length === 0}
            >
              <Save size={16} />
              <span>Сохранить требование</span>
            </button>
            <button
              className="btn-export"
              onClick={handleExportMarkdown}
              disabled={!title.trim() || workBlocks.length === 0}
            >
              <FileText size={16} />
              <span>Экспорт Markdown</span>
            </button>
            <button
              className="btn-export"
              onClick={handleExportDocx}
              disabled={!title.trim() || workBlocks.length === 0}
            >
              <File size={16} />
              <span>Экспорт DOCX</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

// Компонент для редактирования одного блока работы
const WorkBlockEditor = ({ block, index, onUpdate, onRemove }) => {
  const [comboboxValue, setComboboxValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const selectedEntity = block.entityId ? getEntity(block.entityId) : null;
  const isFactTable = selectedEntity?.id?.startsWith('F');

  const pruneRelatedForEntityRole = (relatedIds, isFactBlock) =>
    relatedIds.filter(id => {
      const e = getEntity(id);
      if (!e) return false;
      return isFactBlock ? e.id.startsWith('D') : e.id.startsWith('F');
    });

  const blockIsFact = useMemo(() => {
    if (block.type === 'existing') {
      if (!block.entityId) return undefined;
      return selectedEntity?.id?.startsWith('F');
    }
    return block.entityType === 'fact';
  }, [block.type, block.entityId, block.entityType, selectedEntity]);
  
  // Фильтрация сущностей для комбобокса
  const filteredEntities = useMemo(() => {
    if (block.type !== 'existing') return [];
    if (!comboboxValue) return sortByName(CUBE_DATA.entities);
    const term = comboboxValue.toLowerCase();
    return sortByName(
      CUBE_DATA.entities.filter(ent =>
        ent.name.toLowerCase().includes(term) ||
        ent.id.toLowerCase().includes(term)
      )
    );
  }, [comboboxValue, block.type]);

  const handleSelectEntity = (entityId) => {
    const entity = getEntity(entityId);
    const entityType = entityId.startsWith('F') ? 'fact' : 'dimension';
    
    let measureChanges = [];
    if (entityType === 'fact') {
      const measures = getMeasuresForGroup(entityId);
      measureChanges = measures.map(m => new MeasureChange(
        m.id || m.name,
        m.name,
        m.translation || '',
        m.expression || ''
      ));
    }

    onUpdate({
      entityId,
      entityName: entity.name,
      tableName: entity.tableName,
      entityType,
      measureChanges
    });
  };

  const handleMeasureChangeToggle = (measureId, field, value) => {
    const updatedChanges = block.measureChanges.map(mc =>
      mc.measureId === measureId ? { ...mc, [field]: value } : mc
    );
    onUpdate({ measureChanges: updatedChanges });
  };

  const handleMeasureChangeUpdate = (measureId, field, value) => {
    const updatedChanges = block.measureChanges.map(mc =>
      mc.measureId === measureId ? { ...mc, [field]: value } : mc
    );
    onUpdate({ measureChanges: updatedChanges });
  };

  const handleMeasureAction = (actionId, row) => {
    const updatedChanges = block.measureChanges.map((mc) => {
      if (mc.measureId !== row.measureId) return mc;
      if (actionId === 'rename') {
        return { ...mc, needsRename: true, needsFormulaChange: false };
      }
      if (actionId === 'formula') {
        return { ...mc, needsRename: false, needsFormulaChange: true };
      }
      if (actionId === 'both') {
        return { ...mc, needsRename: true, needsFormulaChange: true };
      }
      if (actionId === 'reset') {
        return {
          ...mc,
          needsRename: false,
          needsFormulaChange: false,
          newName: '',
          newTranslation: '',
          newExpression: ''
        };
      }
      return mc;
    });
    onUpdate({ measureChanges: updatedChanges });
  };

  const handleAddNewMeasure = () => {
    onUpdate({ newMeasures: [...block.newMeasures, new NewMeasure()] });
  };

  const handleUpdateNewMeasure = (index, field, value) => {
    const updated = [...block.newMeasures];
    updated[index][field] = value;
    onUpdate({ newMeasures: updated });
  };

  const handleRemoveNewMeasure = (index) => {
    onUpdate({ newMeasures: block.newMeasures.filter((_, i) => i !== index) });
  };

  const handleAddNewAttribute = () => {
    onUpdate({ newAttributes: [...block.newAttributes, new NewAttribute()] });
  };

  const handleUpdateNewAttribute = (index, field, value) => {
    const updated = [...block.newAttributes];
    updated[index][field] = value;
    onUpdate({ newAttributes: updated });
  };

  const handleRemoveNewAttribute = (index) => {
    onUpdate({ newAttributes: block.newAttributes.filter((_, i) => i !== index) });
  };

  const handleToggleRelatedEntity = (entityId) => {
    const exists = block.relatedEntities.includes(entityId);
    if (exists) {
      onUpdate({ relatedEntities: block.relatedEntities.filter(id => id !== entityId) });
    } else {
      onUpdate({ relatedEntities: [...block.relatedEntities, entityId] });
    }
  };

  // Получаем связи для отображения
  const relatedEntitiesData = useMemo(
    () => sortByName(block.relatedEntities.map(id => getEntity(id)).filter(Boolean)),
    [block.relatedEntities]
  );

  const availableRelatedEntities = useMemo(() => {
    // Determine if current block is a Fact or Dimension
    let currentEntityIsFact = false;
    
    if (block.type === 'existing' && selectedEntity) {
      currentEntityIsFact = selectedEntity.id.startsWith('F');
    } else if (block.type === 'new') {
      currentEntityIsFact = block.entityType === 'fact';
    }
    
    // Filter entities based on complementary type
    const filtered = CUBE_DATA.entities.filter(e => {
      // Exclude current entity
      if (e.id === block.entityId) return false;
      
      // If current is Fact, show only Dimensions (D*)
      if (currentEntityIsFact) {
        return e.id.startsWith('D');
      }
      
      // If current is Dimension, show only Facts (F*)
      if (!currentEntityIsFact) {
        return e.id.startsWith('F');
      }
      
      return false;
    });
    
    return sortByName(filtered);
  }, [block.type, block.entityId, block.entityType, selectedEntity]);

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
        {/* Тип блока */}
        <div className="form-group">
          <label>Тип работы:</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                checked={block.type === 'existing'}
                onChange={() => onUpdate({ type: 'existing', entityId: '', entityName: '', measureChanges: [], newMeasures: [], newAttributes: [] })}
              />
              Изменить существующую сущность
            </label>
            <label>
              <input
                type="radio"
                checked={block.type === 'new'}
                onChange={() => onUpdate({ type: 'new', entityId: '', entityName: '', measureChanges: [] })}
              />
              Создать новую сущность
            </label>
          </div>
        </div>

        {block.type === 'existing' ? (
          <>
            {/* Выбор существующей сущности */}
            <div className="form-group">
              <label>Выберите сущность:</label>
              <div className="combobox-wrapper">
                <input
                  type="text"
                  className="combobox-input"
                  placeholder="Введите или выберите..."
                  value={comboboxValue || selectedEntity?.name || ''}
                  onChange={(e) => {
                    setComboboxValue(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => {
                    setComboboxValue('');
                    setShowDropdown(true);
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setShowDropdown(false);
                      setComboboxValue('');
                    }, 200);
                  }}
                />
                {showDropdown && (
                  <div className="dropdown-list">
                    <div className="dropdown-group">
                      <div className="dropdown-group-label">Факты</div>
                      {filteredEntities
                        .filter(e => e.id.startsWith('F'))
                        .map(ent => (
                          <div
                            key={ent.id}
                            className={`dropdown-item ${ent.id === block.entityId ? 'selected' : ''}`}
                            onMouseDown={() => {
                              handleSelectEntity(ent.id);
                              setShowDropdown(false);
                              setComboboxValue('');
                            }}
                          >
                            {ent.name}
                          </div>
                        ))}
                    </div>
                    <div className="dropdown-group">
                      <div className="dropdown-group-label">Измерения</div>
                      {filteredEntities
                        .filter(e => e.id.startsWith('D'))
                        .map(ent => (
                          <div
                            key={ent.id}
                            className={`dropdown-item ${ent.id === block.entityId ? 'selected' : ''}`}
                            onMouseDown={() => {
                              handleSelectEntity(ent.id);
                              setShowDropdown(false);
                              setComboboxValue('');
                            }}
                          >
                            {ent.name}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Для фактов - таблица с мерами */}
            {selectedEntity && isFactTable && (
              <div className="measures-changes-section">
                <h4>Существующие показатели</h4>
                <MasterTable
                  data={block.measureChanges.map((mc) => ({
                    ...mc,
                    changeMode: mc.needsRename && mc.needsFormulaChange
                      ? 'Имя и формула'
                      : mc.needsRename
                      ? 'Имя'
                      : mc.needsFormulaChange
                      ? 'Формула'
                      : 'Без изменений'
                  }))}
                  getRowId={(row) => row.measureId}
                  searchableFields={['originalName', 'originalTranslation', 'originalExpression']}
                  filterConfigs={[
                    {
                      key: 'changeMode',
                      label: 'Режим изменения',
                      options: [
                        { value: '__all', label: 'Все' },
                        { value: 'Без изменений', label: 'Без изменений' },
                        { value: 'Имя', label: 'Только имя' },
                        { value: 'Формула', label: 'Только формула' },
                        { value: 'Имя и формула', label: 'Имя и формула' }
                      ]
                    }
                  ]}
                  columns={[
                    {
                      key: 'originalName',
                      label: 'Название',
                      render: (value) => <code>{value}</code>
                    },
                    {
                      key: 'originalTranslation',
                      label: 'Перевод'
                    },
                    {
                      key: 'changeMode',
                      label: 'Текущий режим',
                      sortable: false
                    },
                    {
                      key: 'newName',
                      label: 'Новое название',
                      editable: true,
                      placeholder: 'Новое название',
                      render: (value, row) => (
                        <input
                          type="text"
                          className="master-table-input"
                          value={value || ''}
                          placeholder="Новое название"
                          onChange={(event) => {
                            handleMeasureChangeUpdate(row.measureId, 'newName', event.target.value);
                            if (event.target.value) {
                              handleMeasureChangeToggle(row.measureId, 'needsRename', true);
                            }
                          }}
                        />
                      )
                    },
                    {
                      key: 'newTranslation',
                      label: 'Новый перевод',
                      sortable: false,
                      render: (value, row) => (
                        <input
                          type="text"
                          className="master-table-input"
                          value={value || ''}
                          placeholder="Новый перевод"
                          onChange={(event) => {
                            handleMeasureChangeUpdate(row.measureId, 'newTranslation', event.target.value);
                            if (event.target.value) {
                              handleMeasureChangeToggle(row.measureId, 'needsRename', true);
                            }
                          }}
                        />
                      )
                    },
                    {
                      key: 'newExpression',
                      label: 'Новая формула',
                      sortable: false,
                      render: (value, row) => (
                        <textarea
                          className="master-table-textarea"
                          rows={3}
                          value={value || ''}
                          placeholder="Новая формула DAX"
                          onChange={(event) => {
                            handleMeasureChangeUpdate(row.measureId, 'newExpression', event.target.value);
                            if (event.target.value) {
                              handleMeasureChangeToggle(row.measureId, 'needsFormulaChange', true);
                            }
                          }}
                        />
                      )
                    }
                  ]}
                  rowActions={[
                    { id: 'rename', label: 'Изменить только имя', onClick: (row) => handleMeasureAction('rename', row) },
                    { id: 'formula', label: 'Изменить только формулу', onClick: (row) => handleMeasureAction('formula', row) },
                    { id: 'both', label: 'Изменить имя и формулу', onClick: (row) => handleMeasureAction('both', row) },
                    { id: 'reset', label: 'Сбросить изменения', variant: 'danger', onClick: (row) => handleMeasureAction('reset', row) }
                  ]}
                  renderExpanded={(row) => (
                    <MeasureDaxCard
                      originalExpression={row.originalExpression}
                      newExpression={row.newExpression}
                    />
                  )}
                />
              </div>
            )}

            {/* Для справочников - список атрибутов */}
            {selectedEntity && !isFactTable && (
              <div className="attributes-section">
                <h4>Атрибуты справочника</h4>
                <ul className="attributes-list">
                  {selectedEntity.columns?.map((col, idx) => (
                    <li key={idx}>
                      <code>{col.name}</code> - {col.translation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Создание новой сущности */}
            <div className="form-group">
              <label>Тип сущности:</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    checked={block.entityType === 'fact'}
                    onChange={() => onUpdate({ entityType: 'fact', newAttributes: [] })}
                  />
                  Факт (таблица фактов)
                </label>
                <label>
                  <input
                    type="radio"
                    checked={block.entityType === 'dimension'}
                    onChange={() => onUpdate({ entityType: 'dimension', newMeasures: [] })}
                  />
                  Справочник (измерение)
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Название новой сущности:</label>
              <input
                type="text"
                placeholder="Например: F00099 Новые продажи"
                value={block.entityName}
                onChange={(e) => onUpdate({ entityName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Имя таблицы в БД <span className="optional">(опционально)</span>:</label>
              <input
                type="text"
                placeholder="Например: F00099_new_sales (заполняется автоматически, если не указано)"
                value={block.tableName}
                onChange={(e) => onUpdate({ tableName: e.target.value })}
              />
              <p className="hint">Если не указано, будет сгенерировано автоматически на основе названия сущности</p>
            </div>
          </>
        )}

        {/* Добавление новых мер (для фактов) */}
        {(block.entityType === 'fact' || isFactTable) && (
          <div className="new-measures-section">
            <div className="section-header">
              <h4>Новые показатели</h4>
              <button className="btn-secondary" onClick={handleAddNewMeasure}>
                <Plus size={15} />
                <span>Добавить показатель</span>
              </button>
            </div>
            {block.newMeasures.length === 0 ? (
              <p className="empty-state-small">Нет новых показателей</p>
            ) : (
              <div className="new-measures-list">
                {block.newMeasures.map((measure, idx) => (
                  <div key={idx} className="new-measure-card">
                    <div className="card-header-small">
                      <span>Показатель #{idx + 1}</span>
                      <button className="btn-danger-small" onClick={() => handleRemoveNewMeasure(idx)}>
                        <X size={14} />
                      </button>
                    </div>
                    <div className="form-row">
                      <input
                        type="text"
                        placeholder="Название (англ)"
                        value={measure.name}
                        onChange={(e) => handleUpdateNewMeasure(idx, 'name', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Перевод (рус)"
                        value={measure.translation}
                        onChange={(e) => handleUpdateNewMeasure(idx, 'translation', e.target.value)}
                      />
                    </div>
                    <textarea
                      placeholder="Формула DAX"
                      value={measure.expression}
                      onChange={(e) => handleUpdateNewMeasure(idx, 'expression', e.target.value)}
                      rows="2"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Добавление новых атрибутов (для справочников) */}
        {(block.entityType === 'dimension' || (!isFactTable && selectedEntity)) && (
          <div className="new-attributes-section">
            <div className="section-header">
              <h4>Новые атрибуты</h4>
              <button className="btn-secondary" onClick={handleAddNewAttribute}>
                <Plus size={15} />
                <span>Добавить атрибут</span>
              </button>
            </div>
            {block.newAttributes.length === 0 ? (
              <p className="empty-state-small">Нет новых атрибутов</p>
            ) : (
              <div className="new-attributes-list">
                {block.newAttributes.map((attr, idx) => (
                  <div key={idx} className="new-attribute-card">
                    <div className="card-header-small">
                      <span>Атрибут #{idx + 1}</span>
                      <button className="btn-danger-small" onClick={() => handleRemoveNewAttribute(idx)}>
                        <X size={14} />
                      </button>
                    </div>
                    <div className="form-row">
                      <input
                        type="text"
                        placeholder="Название поля"
                        value={attr.name}
                        onChange={(e) => handleUpdateNewAttribute(idx, 'name', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Перевод"
                        value={attr.translation}
                        onChange={(e) => handleUpdateNewAttribute(idx, 'translation', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Связи */}
        <div className="relations-section">
          <h4>Связи с другими сущностями</h4>
          <p className="hint-text">
            {blockIsFact === true 
              ? 'Выберите справочники (измерения), с которыми связана эта таблица фактов' 
              : blockIsFact === false 
              ? 'Выберите таблицы фактов, с которыми связан этот справочник'
              : 'Выберите сущности, с которыми связана данная таблица'}
          </p>
          
          <div className="relations-selector">
            <div className="available-entities">
              <h5>Доступные сущности:</h5>
              <div className="entities-grid">
                {availableRelatedEntities.map(entity => (
                    <label key={entity.id} className="entity-checkbox">
                      <input
                        type="checkbox"
                        checked={block.relatedEntities.includes(entity.id)}
                        onChange={() => handleToggleRelatedEntity(entity.id)}
                      />
                      <span className={entity.id.startsWith('F') ? 'entity-fact' : 'entity-dim'}>
                        {entity.name}
                      </span>
                    </label>
                  ))}
              </div>
            </div>
          </div>

          {relatedEntitiesData.length > 0 && (
            <div className="selected-relations">
              <h5>Выбранные связи ({relatedEntitiesData.length}):</h5>
              <ul className="relations-list">
                {relatedEntitiesData.map(entity => (
                  <li key={entity.id}>{entity.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MeasureDaxCard = ({ originalExpression, newExpression }) => {
  const [copied, setCopied] = useState('');

  const copyValue = async (value, key) => {
    try {
      await navigator.clipboard.writeText(value || '');
      setCopied(key);
      setTimeout(() => setCopied(''), 1200);
    } catch (error) {
      console.error('Copy failed', error);
    }
  };

  return (
    <div className="measure-dax-card">
      <div className="measure-dax-item">
        <div className="measure-dax-header">
          <strong>Текущая формула</strong>
          <button type="button" className="copy-code-btn" onClick={() => copyValue(originalExpression, 'current')}>
            {copied === 'current' ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied === 'current' ? 'Скопировано' : 'Копировать'}</span>
          </button>
        </div>
        <pre>{originalExpression ? <DaxHighlightedCode expression={originalExpression} /> : 'Формула не задана'}</pre>
      </div>
      <div className="measure-dax-item">
        <div className="measure-dax-header">
          <strong>Новая формула</strong>
          <button type="button" className="copy-code-btn" onClick={() => copyValue(newExpression, 'new')}>
            {copied === 'new' ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied === 'new' ? 'Скопировано' : 'Копировать'}</span>
          </button>
        </div>
        <pre>{newExpression ? <DaxHighlightedCode expression={newExpression} /> : 'Новая формула пока не заполнена'}</pre>
      </div>
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
            <span key={`line-${lineIndex}-${tokenIndex}`} className={`dax-token dax-token-${token.type}`}>
              {token.value}
            </span>
          ))}
        </span>
      ))}
    </code>
  );
};

// Простой экспорт в Markdown для v2
const exportToMarkdownV2 = (requirement) => {
  let md = `# ${requirement.title}\n\n`;
  
  if (requirement.description) {
    md += `## Описание\n${requirement.description}\n\n`;
  }

  md += `## Блоки работ\n\n`;

  requirement.workBlocks.forEach((block, index) => {
    md += `### Блок ${index + 1}: ${block.entityName || 'Новая сущность'}\n\n`;
    md += `- **Тип работы**: ${block.type === 'existing' ? 'Изменение существующей' : 'Создание новой'}\n`;
    md += `- **Тип сущности**: ${block.entityType === 'fact' ? 'Факт' : 'Справочник'}\n`;
    if (block.tableName) md += `- **Таблица БД**: \`${block.tableName}\`\n`;
    md += `\n`;

    // Изменения мер
    if (block.measureChanges && block.measureChanges.length > 0) {
      const hasChanges = block.measureChanges.some(mc => mc.needsRename || mc.needsFormulaChange);
      if (hasChanges) {
        md += `#### Изменения существующих показателей\n\n`;
        block.measureChanges.forEach(mc => {
          if (mc.needsRename || mc.needsFormulaChange) {
            md += `- **${mc.originalName}** (${mc.originalTranslation})\n`;
            if (mc.needsRename) md += `  - Новое название: ${mc.newName} (${mc.newTranslation})\n`;
            if (mc.needsFormulaChange) md += `  - Новая формула: \`${mc.newExpression}\`\n`;
          }
        });
        md += `\n`;
      }
    }

    // Новые меры
    if (block.newMeasures && block.newMeasures.length > 0) {
      md += `#### Новые показатели\n\n`;
      block.newMeasures.forEach(m => {
        md += `- **${m.name}** (${m.translation})\n`;
        md += `  - Формула: \`${m.expression}\`\n`;
      });
      md += `\n`;
    }

    // Новые атрибуты
    if (block.newAttributes && block.newAttributes.length > 0) {
      md += `#### Новые атрибуты\n\n`;
      block.newAttributes.forEach(a => {
        md += `- **${a.name}** (${a.translation})\n`;
      });
      md += `\n`;
    }

    // Связи
    if (block.relatedEntities && block.relatedEntities.length > 0) {
      md += `#### Связи\n\n`;
      block.relatedEntities.forEach(entityId => {
        const entity = getEntity(entityId);
        if (entity) md += `- ${entity.name}\n`;
      });
      md += `\n`;
    }
  });

  md += `\n---\n`;
  md += `*Создано: ${new Date(requirement.createdAt).toLocaleString('ru-RU')}*\n`;

  return md;
};
