import React, { useState, useMemo } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, BarChart3, GitBranch, History, Package, Shuffle } from 'lucide-react';
import { CUBE_DATA, getEntity, getRelationsForEntity } from '../mockData';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('catalog'); // catalog | lineage
  const [comboboxValue, setComboboxValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const entity = getEntity(selectedEntityId);
  const isFactTable = entity?.id?.startsWith('F');
  const relations = getRelationsForEntity(selectedEntityId);

  // Фильтрация сущностей для комбобокса
  const filteredEntities = useMemo(() => {
    if (!comboboxValue) return sortByName(CUBE_DATA.entities);
    const term = comboboxValue.toLowerCase();
    return sortByName(
      CUBE_DATA.entities.filter(ent =>
        ent.name.toLowerCase().includes(term) ||
        ent.id.toLowerCase().includes(term)
      )
    );
  }, [comboboxValue]);

  // Поиск по мерам или атрибутам
  const filteredItems = useMemo(() => {
    if (!entity) return [];
    
    const items = sortByName(isFactTable ? entity.measures : entity.columns || []);
    if (!searchTerm) return items;
    
    const term = searchTerm.toLowerCase();
    return items.filter(item =>
      item.name?.toLowerCase().includes(term) ||
      item.translation?.toLowerCase().includes(term)
    );
  }, [entity, isFactTable, searchTerm]);

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
        <>
          {/* Контролы */}
          <div className="catalog-controls">
            <div className="entity-selector">
              <label>Выберите сущность:</label>
              <div className="combobox-wrapper">
                <input
                  type="text"
                  className="combobox-input"
                  placeholder="Введите или выберите сущность..."
                  value={comboboxValue || entity?.name || ''}
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
                            className={`dropdown-item ${ent.id === selectedEntityId ? 'selected' : ''}`}
                            onMouseDown={() => {
                              setSelectedEntityId(ent.id);
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
                            className={`dropdown-item ${ent.id === selectedEntityId ? 'selected' : ''}`}
                            onMouseDown={() => {
                              setSelectedEntityId(ent.id);
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
              <input
                type="text"
                className="search-input"
                placeholder={`Поиск по ${isFactTable ? 'показателям' : 'атрибутам'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Показатели (для фактов) или Атрибуты (для измерений) */}
          <div className="items-section">
            <h3>{isFactTable ? `Показатели (${filteredItems.length})` : `Атрибуты (${filteredItems.length})`}</h3>
            
            {isFactTable ? (
              <table className="measures-table">
                <thead>
                  <tr>
                    <th>Название</th>
                    <th>Перевод</th>
                    <th>Выражение (DAX)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr><td colSpan="3" className="no-data">Показатели не найдены</td></tr>
                  ) : (
                    filteredItems.map(measure => (
                      <tr key={measure.id || measure.name}>
                        <td className="item-name"><code>{measure.name}</code></td>
                        <td className="item-translation">{measure.translation}</td>
                        <td className="item-expr">
                          <div className="expression-cell" title={measure.expression}>
                            {measure.expression}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="attributes-table">
                <thead>
                  <tr>
                    <th>Столбец (имя в кубе)</th>
                    <th>Перевод</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr><td colSpan="2" className="no-data">Атрибуты не найдены</td></tr>
                  ) : (
                    filteredItems.map((attr, idx) => (
                      <tr key={idx}>
                        <td className="item-name"><code>{attr.name}</code></td>
                        <td className="item-translation">{attr.translation}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Связи */}
          <div className="relations-section">
            <h3>Связи с другими таблицами ({relations.length})</h3>
            {relations.length === 0 ? (
              <p className="no-data">Связи не найдены</p>
            ) : (
              <table className="relations-table">
                <thead>
                  <tr>
                    <th>Направление</th>
                    <th>Из таблицы</th>
                    <th>В таблицу</th>
                  </tr>
                </thead>
                <tbody>
                  {relations.map((rel, idx) => {
                    const fromEntity = getEntity(rel.fromTable);
                    const toEntity = getEntity(rel.toTable);
                    const isOutgoing = rel.fromTable === selectedEntityId;
                    
                    return (
                      <tr key={idx}>
                        <td className="direction-cell">
                          {isOutgoing ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
                        </td>
                        <td>
                          <code>{fromEntity?.tableName || rel.fromTable}([{rel.fromColumn}])</code>
                        </td>
                        <td>
                          <code>{toEntity?.tableName || rel.toTable}([{rel.toColumn}])</code>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
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
