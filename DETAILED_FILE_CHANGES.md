# Детальный план изменений для каждого файла

## Документ содержит точные инструкции для каждого файла с указанием строк

---

## FILE 1: index.html

**Тип операции:** MODIFY  
**Приоритет:** P1 (низкий)  
**Время:** 5 минут

### Текущее состояние (строки 1-14)
```html
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cube Documentation - Каталог куба и требования</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### Что менять
- [ ] **Строка 7** (title): изменить на более профессиональный формат
  - Было: `Cube Documentation - Каталог куба и требования`
  - Будет: `Cube Documentation — Каталог и требования` (em-dash)

- [ ] **Добавить перед closing </head>** (после строки 6):
  - Добавить мета-description для SEO

### Новое содержание
```html
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="description" content="Профессиональный инструмент управления кубами данных, каталогом сущностей и требованиями расширения витрин данных." />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <title>Cube Documentation — Каталог и требования</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## FILE 2: src/index.css

**Тип операции:** REPLACE  
**Приоритет:** P0 (высокий)  
**Время:** 5 минут

### Текущее содержание (полностью)
```css
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
}

#root {
  width: 100%;
  height: 100%;
}
```

### Новое содержание (ПОЛНАЯ ЗАМЕНА)
```css
@import './styles/tokens.css';
@import './styles/base.css';
@import './styles/typography.css';
@import './styles/shadows.css';
```

### Почему
- Централизует все глобальные стили
- Обеспечивает последовательность CSS cascade
- Улучшает maintainability

---

## FILE 3: src/App.css

**Тип операции:** REFACTOR  
**Приоритет:** P0 (высокий)  
**Время:** 15-20 минут

### Область изменений: весь файл

Заменить все hardcoded цвета на CSS variables:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'SF Pro Display',
    'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
    'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: var(--background-secondary);
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Navbar */
.navbar {
  background: linear-gradient(135deg, var(--primary-900) 0%, var(--primary-700) 100%);
  color: white;
  box-shadow: var(--shadow-md);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--header-height);
}

.nav-logo {
  font-size: 1.5em;
  font-weight: 700;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.nav-links {
  display: flex;
  gap: var(--space-sm);
}

.nav-link {
  background: transparent;
  color: white;
  border: none;
  padding: 10px 20px;
  margin: 0;
  font-size: 1em;
  font-weight: 500;
  cursor: pointer;
  border-radius: var(--border-radius-md);
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.nav-link.active {
  background: rgba(79, 111, 219, 0.1);
  border-bottom: 3px solid var(--primary-500);
}

/* Main Content */
.main-content {
  flex: 1;
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: var(--background-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--secondary-400);
  border-radius: var(--border-radius-md);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--secondary-600);
}

/* Responsive */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: var(--space-lg);
    padding: var(--space-lg);
    height: auto;
  }

  .nav-logo {
    font-size: 1.2em;
  }

  .nav-links {
    width: 100%;
  }

  .nav-link {
    flex: 1;
    text-align: center;
    justify-content: center;
  }
}
```

### Ключевые замены
| Было | Стало |
|------|-------|
| `#2c3e50` | `var(--primary-900)` |
| `#34495e` | `var(--primary-700)` |
| `#3498db` | `var(--primary-500)` |
| `rgba(52, 152, 219, 0.3)` | `rgba(79, 111, 219, 0.1)` |
| `0 2px 8px rgba(0, 0, 0, 0.15)` | `var(--shadow-md)` |
| `#f1f1f1` | `var(--background-secondary)` |
| `#888` | `var(--secondary-400)` |
| `#555` | `var(--secondary-600)` |

---

## FILE 4: src/App.jsx

**Тип операции:** REFACTOR  
**Приоритет:** P0 (высокий)  
**Время:** 10 минут

### Изменения

#### Добавить импорт (после строки 3)
```jsx
import { Icon } from './components/ui/Icon';
```

#### Заменить навбар (строки 10-28)

**Было:**
```jsx
<div className="app">
  <nav className="navbar">
    <div className="nav-container">
      <div className="nav-logo">📊 Cube Documentation</div>
      <div className="nav-links">
        <button
          className={`nav-link ${currentPage === 'catalog' ? 'active' : ''}`}
          onClick={() => setCurrentPage('catalog')}
        >
          📖 Каталог куба
        </button>
        <button
          className={`nav-link ${currentPage === 'requirements' ? 'active' : ''}`}
          onClick={() => setCurrentPage('requirements')}
        >
          ✏️ Требования
        </button>
      </div>
    </div>
  </nav>
  ...
</div>
```

**Будет:**
```jsx
<div className="app">
  <nav className="navbar">
    <div className="nav-container">
      <div className="nav-logo">
        <Icon name="barChart" size={20} color="white" />
        Cube Documentation
      </div>
      <div className="nav-links">
        <button
          className={`nav-link ${currentPage === 'catalog' ? 'active' : ''}`}
          onClick={() => setCurrentPage('catalog')}
          title="Перейти к каталогу"
        >
          <Icon name="book" size={18} color="inherit" />
          Каталог куба
        </button>
        <button
          className={`nav-link ${currentPage === 'requirements' ? 'active' : ''}`}
          onClick={() => setCurrentPage('requirements')}
          title="Перейти к требованиям"
        >
          <Icon name="fileText" size={18} color="inherit" />
          Требования
        </button>
      </div>
    </div>
  </nav>
  ...
</div>
```

---

## FILE 5: src/components/CatalogPage.jsx

**Тип операции:** REFACTOR  
**Приоритет:** P0 (высокий)  
**Время:** 10-15 минут

### Изменение 1: Добавить импорт (строка 3)
```jsx
import { Icon } from './ui/Icon';
```

### Изменение 2: Заменить эмодзи в табах (строки 60-72)

**Было:**
```jsx
<div className="tabs">
  <button 
    className={`tab ${activeTab === 'catalog' ? 'active' : ''}`}
    onClick={() => setActiveTab('catalog')}
  >
    📊 Каталог
  </button>
  <button 
    className={`tab ${activeTab === 'lineage' ? 'active' : ''}`}
    onClick={() => setActiveTab('lineage')}
  >
    🔗 Data Lineage (DBT/Git)
  </button>
</div>
```

**Будет:**
```jsx
<div className="tabs">
  <button 
    className={`tab ${activeTab === 'catalog' ? 'active' : ''}`}
    onClick={() => setActiveTab('catalog')}
  >
    <Icon name="barChart" size={18} color="inherit" />
    Каталог
  </button>
  <button 
    className={`tab ${activeTab === 'lineage' ? 'active' : ''}`}
    onClick={() => setActiveTab('lineage')}
  >
    <Icon name="gitBranch" size={18} color="inherit" />
    Data Lineage (DBT/Git)
  </button>
</div>
```

### Изменение 3: Заменить arrows в таблице связей (строка 229)

**Было:**
```jsx
<td className="direction-cell">{isOutgoing ? '→' : '←'}</td>
```

**Будет:**
```jsx
<td className="direction-cell">
  {isOutgoing ? (
    <Icon name="arrowRight" size={16} color="var(--text-secondary)" />
  ) : (
    <Icon name="arrowLeft" size={16} color="var(--text-secondary)" />
  )}
</td>
```

---

## FILE 6: src/components/CatalogPage.css

**Тип операции:** REFACTOR  
**Приоритет:** P1 (средний)  
**Время:** 20-25 минут

### Область: весь файл (~367 строк)

Заменить все hardcoded цвета (примеры ключевых замен):

```css
/* Заголовки */
.catalog-page h1 {
  color: var(--text-primary);
  margin-bottom: 10px;
  font-size: 2.5em;
}

.description {
  color: var(--text-secondary);
  margin-bottom: 20px;
  font-size: 1.1em;
}

/* Табы */
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid var(--border-light);
}

.tab {
  padding: 12px 24px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 1em;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.tab:hover {
  background: rgba(79, 111, 219, 0.1);
  color: var(--text-primary);
}

.tab.active {
  color: var(--primary-500);
  border-bottom-color: var(--primary-500);
  font-weight: 600;
}

/* Таблицы */
.measures-table, .attributes-table, .relations-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--background-primary);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.measures-table thead, .attributes-table thead, .relations-table thead {
  background: var(--background-tertiary);
  color: var(--text-primary);
  font-weight: 600;
}

.measures-table tbody tr:hover, 
.attributes-table tbody tr:hover, 
.relations-table tbody tr:hover {
  background: var(--background-secondary);
}

.measures-table th, .attributes-table th, .relations-table th {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-light);
}

.measures-table td, .attributes-table td, .relations-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--divider);
  color: var(--text-primary);
}

.no-data {
  text-align: center;
  color: var(--text-tertiary);
  padding: 24px 16px;
  font-style: italic;
}

.item-name code, .item-translation, .item-expr {
  color: var(--text-primary);
}

.item-name code {
  background: var(--background-tertiary);
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
  color: var(--primary-700);
  font-family: 'SF Mono', 'Monaco', monospace;
}

.expression-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-secondary);
  font-size: 0.9em;
}

.direction-cell {
  text-align: center;
  color: var(--text-secondary);
}

/* Combobox & Dropdown */
.combobox-input {
  padding: 10px 14px;
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-md);
  font-size: 1em;
  background: var(--background-primary);
  color: var(--text-primary);
}

.combobox-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(79, 111, 219, 0.1);
}

.combobox-input::placeholder {
  color: var(--text-tertiary);
}

.dropdown-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--background-primary);
  border: 1px solid var(--border-light);
  border-top: none;
  border-radius: 0 0 var(--border-radius-md) var(--border-radius-md);
  box-shadow: var(--shadow-md);
  max-height: 300px;
  overflow-y: auto;
  z-index: 10;
}

.dropdown-group-label {
  padding: 8px 16px;
  font-size: 0.75em;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-tertiary);
  background: var(--background-secondary);
}

.dropdown-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  color: var(--text-primary);
}

.dropdown-item:hover {
  background: var(--background-tertiary);
}

.dropdown-item.selected {
  background: rgba(79, 111, 219, 0.1);
  color: var(--primary-500);
  font-weight: 500;
}

/* Placeholder */
.placeholder-box {
  background: var(--background-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-lg);
  padding: 48px 32px;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.placeholder-text {
  color: var(--text-secondary);
  font-size: 1.1em;
  margin: 16px 0;
}

.placeholder-note {
  color: var(--warning-600);
  font-weight: 500;
  margin-top: 24px;
}

.feature-list {
  color: var(--text-secondary);
  text-align: left;
  display: inline-block;
  margin-top: 16px;
}

.feature-list li {
  margin: 8px 0;
}
```

---

## FILE 7: src/components/RequirementsPage.jsx

**Тип операции:** REFACTOR + EXTRACT  
**Приоритет:** P0 (высокий)  
**Время:** 20-30 минут

### Изменение 1: Добавить импорты (после строки 5)
```jsx
import { Icon } from './ui/Icon';
import { WorkBlockEditor } from './WorkBlockEditor';
```

### Изменение 2: Удалить компонент WorkBlockEditor (строки 168-691)
- Скопировать все содержание компонента
- Удалить из этого файла
- Вставить в новый файл `src/components/WorkBlockEditor.jsx`

### Изменение 3: Заменить кнопки экспорта (строки 139-160)

**Было:**
```jsx
<section className="form-section actions-section">
  <div className="actions-grid">
    <button
      className="btn-save"
      onClick={handleSave}
      disabled={!title.trim() || workBlocks.length === 0}
    >
      💾 Сохранить требование
    </button>
    <button
      className="btn-export"
      onClick={handleExportMarkdown}
      disabled={!title.trim() || workBlocks.length === 0}
    >
      📄 Экспорт Markdown
    </button>
    <button
      className="btn-export"
      onClick={handleExportDocx}
      disabled={!title.trim() || workBlocks.length === 0}
    >
      📋 Экспорт DOCX
    </button>
  </div>
</section>
```

**Будет:**
```jsx
<section className="form-section actions-section">
  <div className="actions-grid">
    <button
      className="btn-save"
      onClick={handleSave}
      disabled={!title.trim() || workBlocks.length === 0}
      title="Сохранить требование в браузер"
    >
      <Icon name="save" size={18} color="inherit" />
      Сохранить требование
    </button>
    <button
      className="btn-export"
      onClick={handleExportMarkdown}
      disabled={!title.trim() || workBlocks.length === 0}
      title="Экспортировать в формат Markdown"
    >
      <Icon name="download" size={18} color="inherit" />
      Экспорт Markdown
    </button>
    <button
      className="btn-export"
      onClick={handleExportDocx}
      disabled={!title.trim() || workBlocks.length === 0}
      title="Экспортировать в формат Word"
    >
      <Icon name="file" size={18} color="inherit" />
      Экспорт DOCX
    </button>
  </div>
</section>
```

### Изменение 4: Обновить вызов WorkBlockEditor (строка 124)

**Было:**
```jsx
<WorkBlockEditor
  key={block.id}
  block={block}
  index={index}
  onUpdate={(updates) => handleUpdateWorkBlock(block.id, updates)}
  onRemove={() => handleRemoveWorkBlock(block.id)}
/>
```

**Станет:**
```jsx
<WorkBlockEditor
  key={block.id}
  block={block}
  index={index}
  onUpdate={(updates) => handleUpdateWorkBlock(block.id, updates)}
  onRemove={() => handleRemoveWorkBlock(block.id)}
/>
```

(Остаётся так же, но компонент теперь импортируется)

### Изменение 5: Удалить определение компонента WorkBlockEditor (строки 168-691)
- Весь код компонента будет перемещён в отдельный файл

### Итоговый файл будет содержать только:
- Импорты (обновлённые)
- `RequirementsPage` компонент (без WorkBlockEditor)
- Вспомогательная функция `exportToMarkdownV2`

---

## FILE 8: src/components/RequirementsPage.css

**Тип операции:** REFACTOR  
**Приоритет:** P1 (средний)  
**Время:** 20-25 минут

### Область: весь файл

Заменить все hardcoded цвета примеры:

```css
.requirements-page {
  max-width: 1600px;
  margin: 0 auto;
  padding: 30px;
  background: var(--background-secondary);
  min-height: 100vh;
}

.requirements-page h1 {
  color: var(--text-primary);
  margin-bottom: 10px;
  font-size: 2.5em;
}

.requirements-page h2 {
  color: var(--text-primary);
  margin-bottom: 20px;
  font-size: 2em;
}

.requirements-page h3 {
  color: var(--text-primary);
  margin-bottom: 15px;
}

.requirements-page h4, .requirements-page h5 {
  color: var(--text-primary);
  margin-bottom: 10px;
}

.description {
  color: var(--text-secondary);
  margin-bottom: 20px;
  font-size: 1.1em;
}

/* Контейнер */
.requirements-container-v2 {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* Секции */
.form-section {
  background: var(--background-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
}

.section-header h2 {
  margin: 0;
  flex: 1;
}

/* Форма */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-primary);
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="number"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-md);
  font-size: 1em;
  background: var(--background-primary);
  color: var(--text-primary);
  transition: border-color 0.2s;
}

.form-group input[type="text"]:focus,
.form-group input[type="email"]:focus,
.form-group input[type="number"]:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(79, 111, 219, 0.1);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: var(--text-tertiary);
}

.input-large {
  font-size: 1.1em;
  font-weight: 500;
}

/* Кнопки */
.btn-primary, .btn-secondary, .btn-save, .btn-export, .btn-danger {
  padding: 12px 24px;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.btn-primary {
  background: var(--primary-500);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-600);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background: var(--background-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--border-light);
  transform: translateY(-2px);
}

.btn-save {
  background: var(--success-600);
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: var(--success-700);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-export {
  background: var(--info-600);
  color: white;
}

.btn-export:hover:not(:disabled) {
  background: var(--primary-600);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-danger {
  background: var(--error-600);
  color: white;
  padding: 8px 16px;
  font-size: 0.9em;
}

.btn-danger:hover:not(:disabled) {
  background: var(--error-700);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Карточки блоков */
.work-block-card {
  background: var(--background-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 20px;
}

.work-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
}

.work-block-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.work-block-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Таблица изменений мер */
.measures-changes-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--background-primary);
  border: 1px solid var(--border-light);
}

.measures-changes-table thead {
  background: var(--background-tertiary);
  color: var(--text-primary);
  font-weight: 600;
}

.measures-changes-table th {
  padding: 12px 8px;
  text-align: left;
  border-bottom: 1px solid var(--border-light);
  font-size: 0.95em;
}

.measures-changes-table td {
  padding: 12px 8px;
  border-bottom: 1px solid var(--divider);
  color: var(--text-primary);
}

.measures-changes-table tbody tr:hover {
  background: var(--background-secondary);
}

.formula-cell {
  max-width: 200px;
}

.formula-preview {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.85em;
  color: var(--text-secondary);
  font-family: monospace;
}

/* Чекбоксы и радио */
.radio-group, .entity-checkbox {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.radio-group label, .entity-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text-primary);
}

input[type="radio"], input[type="checkbox"] {
  cursor: pointer;
  accent-color: var(--primary-500);
}

/* Empty states */
.empty-state-large, .empty-state-small {
  background: var(--background-secondary);
  border: 1px dashed var(--border-light);
  border-radius: var(--border-radius-md);
  padding: 32px 16px;
  text-align: center;
  color: var(--text-secondary);
}

.empty-state-small {
  padding: 16px;
  font-size: 0.95em;
}

.hint, .hint-text, .optional {
  color: var(--text-tertiary);
  font-size: 0.9em;
  margin-top: 4px;
}

/* Списки */
.attributes-list, .relations-list, .feature-list {
  list-style-position: inside;
  color: var(--text-primary);
  margin-left: 16px;
}

.attributes-list li, .relations-list li {
  margin: 8px 0;
}

.attributes-list code, .relations-list code {
  background: var(--background-tertiary);
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
  color: var(--primary-700);
}

/* Actions grid */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .requirements-page {
    padding: 16px;
  }

  .form-section {
    padding: 16px;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .work-block-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .measures-changes-table {
    font-size: 0.85em;
  }

  .measures-changes-table th,
  .measures-changes-table td {
    padding: 8px 4px;
  }
}
```

---

## FILE 9: src/components/WorkBlockEditor.jsx (NEW)

**Тип операции:** CREATE  
**Приоритет:** P1 (средний)  
**Время:** 10 минут (copy + update)

### Содержание

Скопировать компонент `WorkBlockEditor` из `RequirementsPage.jsx` (бывшие строки 168-691) с следующими изменениями:

#### Добавить импорт в начало файла:
```jsx
import React, { useState, useMemo } from 'react';
import { CUBE_DATA, getEntity, getMeasuresForGroup } from '../mockData';
import { MeasureChange, NewMeasure, NewAttribute } from '../types';
import { Icon } from './ui/Icon';
```

#### Заменить эмодзи в компоненте:

**Было:**
```jsx
<button className="btn-danger" onClick={onRemove}>
  Удалить блок
</button>
...
<button className="btn-danger-small" onClick={() => handleRemoveNewMeasure(idx)}>✕</button>
...
<button className="btn-secondary" onClick={handleAddNewMeasure}>
  + Добавить показатель
</button>
```

**Будет:**
```jsx
<button className="btn-danger" onClick={onRemove}>
  <Icon name="delete" size={18} />
  Удалить блок
</button>
...
<button className="btn-danger-small" onClick={() => handleRemoveNewMeasure(idx)}>
  <Icon name="delete" size={14} />
</button>
...
<button className="btn-secondary" onClick={handleAddNewMeasure}>
  <Icon name="plus" size={18} /> Добавить показатель
</button>
```

#### Экспортировать компонент в конце файла:
```jsx
export const WorkBlockEditor = ({ block, index, onUpdate, onRemove }) => {
  // ... весь код компонента ...
};
```

---

## FILE 10: src/components/ui/Icon.jsx (NEW)

**Тип операции:** CREATE  
**Приоритет:** P0 (высокий)  
**Время:** 15 минут

### Содержание полного файла

```jsx
import {
  BarChart3,
  Book,
  FileText,
  GitBranch,
  Package,
  GitMerge,
  AlertCircle,
  Save,
  Download,
  File,
  Plus,
  X,
  ArrowRight,
  ArrowLeft,
  Edit3,
  AlertTriangle,
  ChevronDown,
  Search,
  Menu,
  Command,
  Settings,
  Trash2
} from 'react-feather';

/**
 * Icon Component — Централизованный реестр иконок Feather
 * 
 * Использование:
 * <Icon name="save" size={18} color="#3D5DB8" />
 * <Icon name="delete" size={16} color="var(--error-600)" />
 * <Icon name="book" color="white" /> (inherit parent color)
 */

const ICONS = {
  // Navigation & primary
  barChart: BarChart3,
  book: Book,
  fileText: FileText,
  gitBranch: GitBranch,
  
  // Features
  package: Package,
  gitMerge: GitMerge,
  
  // Alerts
  warning: AlertCircle,
  alertTriangle: AlertTriangle,
  
  // Actions
  save: Save,
  download: Download,
  file: File,
  plus: Plus,
  delete: X,
  delete2: Trash2,
  
  // Navigation
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  chevronDown: ChevronDown,
  
  // Utilities
  edit: Edit3,
  search: Search,
  menu: Menu,
  command: Command,
  settings: Settings,
};

export const Icon = ({ 
  name, 
  size = 18, 
  color = 'currentColor',
  strokeWidth = 2,
  className = '',
  ...props 
}) => {
  const IconComponent = ICONS[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in Icon registry`);
    return null;
  }
  
  return (
    <IconComponent
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={`icon ${className}`}
      {...props}
    />
  );
};
```

---

## FILE 11: src/styles/tokens.css (NEW)

**Тип операции:** CREATE  
**Приоритет:** P0 (высокий)  
**Время:** 10 минут

### Содержание полного файла

```css
/**
 * Design Tokens — CSS Custom Properties
 * Централизованная палитра для всего приложения
 * 
 * Использование:
 * background-color: var(--primary-500);
 * color: var(--text-primary);
 */

:root {
  /* ===== PRIMARY COLOR (Indigo) ===== */
  --primary-950: #0F1623;   /* Darkest */
  --primary-900: #1A2A52;   /* Navbar background */
  --primary-700: #2D4A8F;   /* Navbar gradient */
  --primary-600: #3D5DB8;   /* Interactive hover */
  --primary-500: #4F6FDB;   /* Main accent, buttons */
  --primary-400: #6B8AE8;   /* Light interactive */
  --primary-100: #E8ECFA;   /* Light background */

  /* ===== SECONDARY COLOR (Steel Gray) ===== */
  --secondary-950: #0D0E11;
  --secondary-800: #1F2937; /* Primary text */
  --secondary-600: #4B5563; /* Secondary text */
  --secondary-400: #9CA3AF; /* Hint text */
  --secondary-200: #E5E7EB; /* Borders */
  --secondary-50:  #F9FAFB; /* Light background */

  /* ===== TERTIARY COLOR (Teal) ===== */
  --tertiary-700: #0F766E;
  --tertiary-600: #14B8A6;
  --tertiary-100: #CCFBF1;

  /* ===== SEMANTIC COLORS ===== */
  /* Success */
  --success-700: #15803D;
  --success-600: #22C55E;
  --success-100: #DCFCE7;

  /* Warning */
  --warning-700: #B45309;
  --warning-600: #F59E0B;
  --warning-100: #FEF3C7;

  /* Error */
  --error-700: #B91C1C;
  --error-600: #EF4444;
  --error-100: #FEE2E2;

  /* Info */
  --info-600: #0284C7;
  --info-100: #CFFAFE;

  /* ===== TEXT COLORS ===== */
  --text-primary: #0F1623;
  --text-secondary: #4B5563;
  --text-tertiary: #9CA3AF;
  --text-inverse: #F9FAFB;

  /* ===== BACKGROUND COLORS ===== */
  --background-primary: #FFFFFF;
  --background-secondary: #F9FAFB;
  --background-tertiary: #F3F4F6;

  /* ===== BORDER COLORS ===== */
  --border-light: #E5E7EB;
  --border-dark: #D1D5DB;
  --divider: #E5E7EB;

  /* ===== SHADOWS ===== */
  --shadow-xs: 0 1px 2px 0 rgba(15, 22, 35, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(15, 22, 35, 0.1), 0 1px 2px -1px rgba(15, 22, 35, 0.1);
  --shadow-md: 0 4px 6px -1px rgba(15, 22, 35, 0.1), 0 2px 4px -2px rgba(15, 22, 35, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(15, 22, 35, 0.1), 0 4px 6px -4px rgba(15, 22, 35, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(15, 22, 35, 0.1), 0 8px 10px -6px rgba(15, 22, 35, 0.1);

  /* ===== SPACING (8px grid) ===== */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;

  /* ===== FONT SIZES ===== */
  --font-size-h1: 2.5rem;      /* 40px */
  --font-size-h2: 2rem;        /* 32px */
  --font-size-h3: 1.5rem;      /* 24px */
  --font-size-h4: 1.25rem;     /* 20px */
  --font-size-body-l: 1.1rem;  /* 18px */
  --font-size-body-m: 1rem;    /* 16px */
  --font-size-body-s: 0.875rem;/* 14px */
  --font-size-caption: 0.75rem;/* 12px */
  --font-size-code: 0.95rem;   /* 15px */

  /* ===== LINE HEIGHTS ===== */
  --line-height-h1: 1.2;
  --line-height-h2: 1.25;
  --line-height-h3: 1.3;
  --line-height-body: 1.5;
  --line-height-code: 1.6;

  /* ===== FONT WEIGHTS ===== */
  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* ===== BORDER RADIUS ===== */
  --border-radius-sm: 4px;
  --border-radius-md: 6px;
  --border-radius-lg: 8px;
  --border-radius-xl: 12px;
  --border-radius-full: 9999px;

  /* ===== LAYOUT ===== */
  --max-width: 1600px;
  --header-height: 70px;
  --sidebar-width: 280px;

  /* ===== TRANSITIONS ===== */
  --transition-fast: 0.15s ease;
  --transition-base: 0.2s ease;
  --transition-slow: 0.3s ease;

  /* ===== Z-INDEX ===== */
  --z-base: 0;
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-fixed: 30;
  --z-modal: 1000;
  --z-tooltip: 1001;
}

/* High contrast mode adjustments */
@media (prefers-contrast: more) {
  :root {
    --text-primary: #000000;
    --text-secondary: #333333;
    --border-light: #999999;
  }
}

/* Dark mode support (future) */
@media (prefers-color-scheme: dark) {
  /* Можно добавить тёмную тему позже */
}
```

---

## FILE 12: src/styles/base.css (NEW)

**Тип операции:** CREATE  
**Приоритет:** P0 (высокий)  
**Время:** 5 минут

### Содержание

```css
/**
 * Base Styles — Global resets and foundational styles
 */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'SF Pro Display',
    'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
    'Helvetica Neue', sans-serif;
  font-size: var(--font-size-body-m);
  line-height: var(--line-height-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--background-secondary);
  color: var(--text-primary);
}

#root {
  width: 100%;
  height: 100%;
}

/* Links */
a {
  color: var(--primary-500);
  text-decoration: none;
  transition: color var(--transition-base);
}

a:hover {
  color: var(--primary-600);
  text-decoration: underline;
}

a:active {
  color: var(--primary-700);
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: var(--background-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--secondary-400);
  border-radius: var(--border-radius-md);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--secondary-600);
}

/* Selection */
::selection {
  background: var(--primary-500);
  color: white;
}

/* Focus visible */
:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

/* Remove default button styles */
button {
  font-family: inherit;
  font-size: inherit;
}

/* Remove default input styles */
input, textarea, select {
  font-family: inherit;
  font-size: inherit;
  border: none;
  background: transparent;
  color: inherit;
}

/* Placeholder styling */
::placeholder {
  color: var(--text-tertiary);
}

/* Table defaults */
table {
  border-collapse: collapse;
  width: 100%;
}

th, td {
  text-align: left;
  vertical-align: top;
}

/* List resets */
ul, ol {
  list-style: none;
}
```

---

## FILE 13: src/styles/typography.css (NEW)

**Тип операции:** CREATE  
**Приоритет:** P1 (средний)  
**Время:** 10 минут

### Содержание

```css
/**
 * Typography System — Heading, body, and code styles
 */

h1 {
  font-size: var(--font-size-h1);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-h1);
  color: var(--text-primary);
  margin-bottom: var(--space-md);
}

h2 {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-h2);
  color: var(--text-primary);
  margin-bottom: var(--space-md);
}

h3 {
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-h3);
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
}

h4 {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-h3);
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
}

h5, h6 {
  font-size: var(--font-size-body-l);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
}

p, body {
  font-size: var(--font-size-body-m);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-body);
  color: var(--text-primary);
}

/* Text utility classes */
.text-primary {
  color: var(--text-primary);
}

.text-secondary {
  color: var(--text-secondary);
}

.text-tertiary {
  color: var(--text-tertiary);
}

.text-success {
  color: var(--success-600);
}

.text-warning {
  color: var(--warning-600);
}

.text-error {
  color: var(--error-600);
}

.text-info {
  color: var(--info-600);
}

.text-small {
  font-size: var(--font-size-body-s);
}

.text-caption {
  font-size: var(--font-size-caption);
}

.text-bold {
  font-weight: var(--font-weight-bold);
}

.text-semibold {
  font-weight: var(--font-weight-semibold);
}

/* Code styles */
code {
  font-family: 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono',
    'Inconsolata', 'Courier New', monospace;
  font-size: var(--font-size-code);
  font-weight: var(--font-weight-medium);
  background-color: var(--background-tertiary);
  color: var(--primary-700);
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
  line-height: var(--line-height-code);
}

pre {
  background-color: var(--secondary-800);
  color: #E2E8F0;
  padding: var(--space-md);
  border-radius: var(--border-radius-md);
  overflow-x: auto;
  font-family: 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono',
    'Inconsolata', 'Courier New', monospace;
}

pre code {
  background-color: transparent;
  color: inherit;
  padding: 0;
  border-radius: 0;
}

/* Mark / highlight */
mark {
  background-color: var(--warning-100);
  color: var(--warning-700);
  padding: 0 4px;
  border-radius: var(--border-radius-sm);
}

/* Strong / bold */
strong, b {
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

/* Emphasis / italic */
em, i {
  font-style: italic;
  color: var(--text-secondary);
}

/* Abbreviations */
abbr[title] {
  border-bottom: 1px dotted var(--border-light);
  cursor: help;
}

/* Blockquotes */
blockquote {
  margin: var(--space-md) 0;
  padding-left: var(--space-lg);
  border-left: 4px solid var(--primary-500);
  color: var(--text-secondary);
  font-style: italic;
}
```

---

## FILE 14: src/styles/shadows.css (NEW)

**Тип операции:** CREATE  
**Приоритет:** P1 (средний)  
**Время:** 3 минуты

### Содержание

```css
/**
 * Shadow Utilities — Visual hierarchy through depth
 */

.shadow-xs {
  box-shadow: var(--shadow-xs);
}

.shadow-sm {
  box-shadow: var(--shadow-sm);
}

.shadow-md {
  box-shadow: var(--shadow-md);
}

.shadow-lg {
  box-shadow: var(--shadow-lg);
}

.shadow-xl {
  box-shadow: var(--shadow-xl);
}

.shadow-none {
  box-shadow: none;
}

/* Interactive shadow states */
.shadow-hover:hover {
  box-shadow: var(--shadow-lg);
  transition: box-shadow var(--transition-base);
}

.shadow-focus:focus,
.shadow-focus:focus-visible {
  box-shadow: var(--shadow-lg), 0 0 0 3px rgba(79, 111, 219, 0.1);
  transition: box-shadow var(--transition-base);
}

.shadow-active:active {
  box-shadow: var(--shadow-md);
}
```

---

## FILE 15: package.json

**Тип операции:** MODIFY  
**Приоритет:** P0 (высокий)  
**Время:** 2 минуты

### Текущее содержание (dependencies)
```json
"dependencies": {
  "react": "^18.x",
  "react-dom": "^18.x"
}
```

### Новое содержание
```json
"dependencies": {
  "react": "^18.x",
  "react-dom": "^18.x",
  "react-feather": "^2.0.10"
}
```

### После изменения
```bash
npm install
```

---

## ИТОГОВАЯ СТАТИСТИКА

| Метрика | Количество |
|---------|-----------|
| Файлов на создание | 6 |
| Файлов на изменение | 8 |
| Файлов на полную замену | 1 |
| Всего затронутых файлов | 14 |
| Примерное время разработки | 2.5-3.5 часа |
| Строк CSS для создания | ~550 |
| Новых iконок (Feather) | 23 |
| CSS переменных (tokens) | 66 |
| Замен эмодзи | 15 |

---

**Документ создан:** 10 Май 2026  
**Версия:** 1.0 Final  
**Статус:** Ready for Implementation
