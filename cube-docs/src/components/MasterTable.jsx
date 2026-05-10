import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, ChevronsUpDown, MoreVertical } from 'lucide-react';
import './MasterTable.css';

const getByPath = (row, key) => row?.[key];

const normalize = (value) => String(value ?? '').toLowerCase();
const collator = new Intl.Collator(['ru-RU', 'en-US'], { sensitivity: 'base', numeric: true });

export const MasterTable = ({
  columns = [],
  data = [],
  getRowId,
  searchableFields = [],
  filterConfigs = [],
  defaultSort,
  renderExpanded,
  rowActions = [],
  onCellChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState({});
  const [sortState, setSortState] = useState(defaultSort || null);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [openedActionRowId, setOpenedActionRowId] = useState(null);

  const hasExpandable = typeof renderExpanded === 'function';
  const hasActions = rowActions.length > 0;

  const rowIdGetter = getRowId || ((row, index) => row?.id ?? row?.measureId ?? row?.name ?? index);

  const filteredRows = useMemo(() => {
    const searched = data.filter((row) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return searchableFields.some((field) => normalize(getByPath(row, field)).includes(query));
    });

    return searched.filter((row) => {
      return filterConfigs.every((config) => {
        const selected = filterState[config.key];
        if (!selected || selected === '__all') return true;
        return normalize(getByPath(row, config.key)) === normalize(selected);
      });
    });
  }, [data, filterConfigs, filterState, searchQuery, searchableFields]);

  const sortedRows = useMemo(() => {
    if (!sortState?.key) return filteredRows;
    const sorted = [...filteredRows];
    sorted.sort((a, b) => {
      const left = String(getByPath(a, sortState.key) ?? '');
      const right = String(getByPath(b, sortState.key) ?? '');
      const result = collator.compare(left, right);
      return sortState.direction === 'asc' ? result : -result;
    });
    return sorted;
  }, [filteredRows, sortState]);

  const handleSort = (columnKey, sortable) => {
    if (sortable === false) return;
    setSortState((prev) => {
      if (!prev || prev.key !== columnKey) return { key: columnKey, direction: 'asc' };
      if (prev.direction === 'asc') return { key: columnKey, direction: 'desc' };
      return null;
    });
  };

  const renderCell = (row, column) => {
    const value = getByPath(row, column.key);
    if (column.render) {
      return column.render(value, row);
    }

    if (column.editable) {
      const inputProps = {
        value: value ?? '',
        placeholder: column.placeholder || '',
        onChange: (event) => onCellChange?.(row, column.key, event.target.value),
        className: 'master-table-input'
      };

      if (column.editor === 'textarea') {
        return <textarea rows={3} {...inputProps} className="master-table-textarea" />;
      }
      return <input type="text" {...inputProps} />;
    }

    return <span>{String(value ?? '')}</span>;
  };

  return (
    <div className="master-table">
      <div className="master-table-toolbar">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="master-table-search"
          placeholder="Поиск по таблице..."
        />
        {filterConfigs.map((config) => {
          const options = config.options || [
            { value: '__all', label: 'Все' },
            ...Array.from(new Set(data.map((row) => String(getByPath(row, config.key) ?? ''))))
              .filter(Boolean)
              .map((value) => ({ value, label: value }))
          ];

          const hasAllOption = options.some((option) => option.value === '__all');
          const normalizedOptions = hasAllOption ? options : [{ value: '__all', label: 'Все' }, ...options];

          return (
            <label key={config.key} className="master-table-filter">
              <span>{config.label}</span>
              <select
                value={filterState[config.key] || '__all'}
                onChange={(event) =>
                  setFilterState((prev) => ({ ...prev, [config.key]: event.target.value }))
                }
              >
                {normalizedOptions.map((option) => (
                  <option key={`${config.key}-${option.value}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          );
        })}
      </div>

      <table className="master-table-grid">
        <thead>
          <tr>
            {hasExpandable && <th className="master-table-col-expand" />}
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => handleSort(column.key, column.sortable)}
                className={column.sortable === false ? '' : 'is-sortable'}
              >
                <span>{column.label}</span>
                {column.sortable === false ? null : <ChevronsUpDown size={14} />}
              </th>
            ))}
            {hasActions && <th className="master-table-col-actions">Действия</th>}
          </tr>
        </thead>
        <tbody>
          {sortedRows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (hasExpandable ? 1 : 0) + (hasActions ? 1 : 0)} className="master-table-empty">
                Нет данных по текущим фильтрам
              </td>
            </tr>
          ) : (
            sortedRows.map((row, index) => {
              const rowId = rowIdGetter(row, index);
              const isExpanded = expandedRowId === rowId;
              const isActionOpened = openedActionRowId === rowId;
              return (
                <React.Fragment key={rowId}>
                  <tr className="master-table-row">
                    {hasExpandable && (
                      <td className="master-table-col-expand">
                        <button
                          type="button"
                          className="master-table-icon-btn"
                          onClick={() => setExpandedRowId(isExpanded ? null : rowId)}
                          aria-label="Развернуть строку"
                        >
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={`${rowId}-${column.key}`}>{renderCell(row, column)}</td>
                    ))}
                    {hasActions && (
                      <td className="master-table-col-actions">
                        <div className="master-table-actions">
                          <button
                            type="button"
                            className="master-table-icon-btn"
                            onClick={() => setOpenedActionRowId(isActionOpened ? null : rowId)}
                            aria-label="Открыть действия"
                          >
                            <MoreVertical size={15} />
                          </button>
                          {isActionOpened && (
                            <div className="master-table-actions-menu">
                              {rowActions.map((action) => (
                                <button
                                  key={`${rowId}-${action.id}`}
                                  type="button"
                                  className={`master-table-action-item ${action.variant === 'danger' ? 'is-danger' : ''}`}
                                  onClick={() => {
                                    action.onClick?.(row);
                                    setOpenedActionRowId(null);
                                  }}
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                  {hasExpandable && isExpanded && (
                    <tr className="master-table-expanded-row">
                      <td colSpan={columns.length + 1 + (hasActions ? 1 : 0)}>
                        <div className="master-table-expanded-card">{renderExpanded(row)}</div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
