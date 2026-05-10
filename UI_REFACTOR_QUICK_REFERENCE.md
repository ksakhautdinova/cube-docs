# UI Refactor — Краткая справка для разработчика

## 1. Палитра токенов (HEX коды)

### Основные цвета
```
PRIMARY (Индиго)
  --primary-950: #0F1623    (darkest)
  --primary-900: #1A2A52    ← navbar background
  --primary-700: #2D4A8F    ← navbar gradient
  --primary-600: #3D5DB8    ← interactive elements
  --primary-500: #4F6FDB    ← active accent (main blue)
  --primary-400: #6B8AE8    ← light interactive
  --primary-100: #E8ECFA    ← light background

SECONDARY (Steel Gray)
  --secondary-950: #0D0E11
  --secondary-800: #1F2937  ← text
  --secondary-600: #4B5563  ← secondary text
  --secondary-400: #9CA3AF  ← hints
  --secondary-200: #E5E7EB  ← borders
  --secondary-50:  #F9FAFB  ← light background

SEMANTIC
  --success-600: #22C55E    (green)
  --warning-600: #F59E0B    (amber)
  --error-600:   #EF4444    (red)
  --info-600:    #0284C7    (blue)
```

## 2. Иконки Feather (замена эмодзи)

```
📊 → BarChart3        (size: 20px)
📖 → Book             (size: 18px)
✏️ → FileText         (size: 18px)
🔗 → GitBranch        (size: 18px)
📦 → Package          (size: 16px, color: success)
🔀 → GitMerge         (size: 16px, color: success)
📝 → FileText         (size: 16px, color: success)
⚠️ → AlertCircle      (size: 18px, color: warning)
💾 → Save             (size: 18px, color: success)
📄 → Download         (size: 18px, color: info)
📋 → File             (size: 18px, color: info)
+  → Plus             (size: 18px, color: primary)
✕  → X                (size: 18px, color: error)
→  → ArrowRight       (size: 16px, color: secondary)
←  → ArrowLeft        (size: 16px, color: secondary)
```

## 3. Использование Icon компонента

```jsx
import { Icon } from './components/ui/Icon';

// Базовое использование
<Icon name="save" size={18} color="#4F6FDB" />

// С переменной
<Icon name="barChart" size={20} color="var(--primary-500)" />

// Inherit color from parent
<button>
  <Icon name="download" color="inherit" /> Export
</button>

// White icon (for navbar)
<Icon name="book" size={18} color="white" />
```

## 4. Новые файлы на создание

| Файл | Тип | Содержание |
|------|-----|-----------|
| `src/styles/tokens.css` | CSS | CSS Custom Properties палитра |
| `src/styles/base.css` | CSS | Global reset + scrollbar |
| `src/styles/typography.css` | CSS | h1-h4, body, code |
| `src/styles/shadows.css` | CSS | Shadow utilities |
| `src/components/ui/Icon.jsx` | JSX | Icon wrapper |
| `src/components/WorkBlockEditor.jsx` | JSX | Extracted component |

## 5. Файлы на изменение

| Файл | Что менять | Время |
|------|-----------|-------|
| `index.html` | Title + meta | 5 мин |
| `src/index.css` | Заменить на imports | 5 мин |
| `src/App.css` | Hardcoded цвета → var() | 15 мин |
| `src/App.jsx` | Эмодзи → Icon | 10 мин |
| `src/components/CatalogPage.css` | Цвета → var() | 20 мин |
| `src/components/CatalogPage.jsx` | Эмодзи → Icon (3 места) | 10 мин |
| `src/components/RequirementsPage.css` | Цвета → var() | 20 мин |
| `src/components/RequirementsPage.jsx` | Extract + эмодзи | 20 мин |
| `package.json` | Добавить react-feather | 2 мин |

## 6. Критические изменения цветов

```css
/* Было → Стало */
#2c3e50  → var(--primary-900)
#34495e  → var(--primary-700)
#3498db  → var(--primary-500)
#7f8c8d  → var(--text-secondary)
#f5f5f5  → var(--background-secondary)
#ecf0f1  → var(--border-light)
#2c3e50  → var(--text-primary)
```

## 7. CSS Variables в корне

```css
:root {
  /* COLORS */
  --primary-900: #1A2A52;
  --primary-700: #2D4A8F;
  --primary-500: #4F6FDB;
  --text-secondary: #4B5563;
  --background-secondary: #F9FAFB;
  --border-light: #E5E7EB;
  /* ... полный список в tokens.css */

  /* SHADOWS */
  --shadow-md: 0 4px 6px -1px rgba(15, 22, 35, 0.1), 0 2px 4px -2px rgba(15, 22, 35, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(15, 22, 35, 0.1), 0 4px 6px -4px rgba(15, 22, 35, 0.1);

  /* SPACING */
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
}
```

## 8. Установка react-feather

```bash
npm install react-feather
```

После этого готово использовать Icon компонент.

## 9. Порядок реализации (рекомендуемый)

1. **Создать CSS токены** (30 мин)
   - tokens.css, base.css, typography.css, shadows.css
   - Обновить index.css

2. **Создать Icon компонент** (15 мин)
   - src/components/ui/Icon.jsx

3. **Обновить App** (25 мин)
   - App.css + App.jsx

4. **Обновить CatalogPage** (30 мин)
   - CatalogPage.css + CatalogPage.jsx

5. **Обновить RequirementsPage** (40 мин)
   - RequirementsPage.css
   - Extract WorkBlockEditor.jsx
   - RequirementsPage.jsx

6. **QA и тестирование** (30 мин)

**Итого: 2.5-3.5 часа разработки**

## 10. QA Checklist (Краткий)

- [ ] No hardcoded цветов (только var())
- [ ] No эмодзи в рендере (только иконки)
- [ ] Все иконки отображаются
- [ ] Цвета совпадают с палитрой
- [ ] Таблицы читаемы
- [ ] Контрастность ≥ 4.5:1
- [ ] mobile/tablet/desktop работают
- [ ] Export функция работает
- [ ] No console errors

## 11. Примеры кода

### Было (App.jsx)
```jsx
<div className="nav-logo">📊 Cube Documentation</div>
```

### Стало (App.jsx)
```jsx
import { Icon } from './components/ui/Icon';

<div className="nav-logo">
  <Icon name="barChart" size={20} color="white" /> 
  Cube Documentation
</div>
```

### Было (CatalogPage.jsx)
```jsx
<button className="tab">📊 Каталог</button>
<td className="direction-cell">→</td>
```

### Стало (CatalogPage.jsx)
```jsx
import { Icon } from './ui/Icon';

<button className="tab">
  <Icon name="barChart" size={18} /> Каталог
</button>
<td className="direction-cell">
  <Icon name="arrowRight" size={16} color="var(--text-secondary)" />
</td>
```

### Было (App.css)
```css
.nav-link.active {
  background: rgba(52, 152, 219, 0.3);
  border-bottom: 3px solid #3498db;
}
```

### Стало (App.css)
```css
.nav-link.active {
  background: rgba(79, 111, 219, 0.1);
  border-bottom: 3px solid var(--primary-500);
}
```

## 12. Контакты и документация

**Полная документация:** `UI_DESIGN_ARCHITECTURE.md`
- Раздел 2: Полная палитра с назначением
- Раздел 3: Icon интеграция
- Раздел 5-6: Детальные изменения по файлам
- Раздел 7: QA Checklist

**Токены:** `src/styles/tokens.css` (66 переменных)

**Icon реестр:** `src/components/ui/Icon.jsx` (23 иконки)
