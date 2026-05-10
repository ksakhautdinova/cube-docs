# Архитектура дизайна приложения Cube Documentation

## 1. Анализ текущего состояния

### Проблемы текущей реализации
- Эмодзи используются как основные иконки (📊 📖 ✏️ 🔗 📦 🔀 📝 ⚠️ 💾 📄 📋)
- Цветовая палитра не согласована и содержит множество ad-hoc цветов
- Стиль не соответствует корпоративным приложениям (не похож на VS Code, SQL Server, Airflow)
- Элементы управления имеют базовый дизайн без профессиональной полировки
- Нет централизованной системы токенов дизайна

### Текущие цвета и их использование
- **Навигация**: Gradient `#2c3e50` → `#34495e` (тёмный slate)
- **Активный элемент**: `#3498db` (яркий голубой)
- **Текст**: `#7f8c8d` (серый)
- **Фон**: `#f5f5f5` (светлый серый)
- **Таблицы**: `#ecf0f1` (очень светлый серый)

---

## 2. Палитра токенов дизайна

### 2.1 Основные цвета (3 основных + теплые сигналы)

#### Первичный цвет (Primary) — Темный индиго
- **Primary-950**: `#0F1623` — Очень тёмный, используется для фона высокой контрастности
- **Primary-900**: `#1A2A52` — Основной тёмный для навигации, headers
- **Primary-700**: `#2D4A8F` — Для интерактивных элементов при hover
- **Primary-600**: `#3D5DB8` — Основной цвет действий и активных элементов
- **Primary-500**: `#4F6FDB` — Яркий primary для выделения, кнопок
- **Primary-400**: `#6B8AE8` — Light version для secondary elements
- **Primary-100**: `#E8ECFA` — Очень светлый фон для highlighted areas

#### Вторичный цвет (Secondary) — Стальной серый
- **Secondary-950**: `#0D0E11` — Для темных элементов
- **Secondary-800**: `#1F2937` — Основной серый для текста и бордюров
- **Secondary-600**: `#4B5563` — Placeholder text, disabled states
- **Secondary-400**: `#9CA3AF` — Hint text, secondary labels
- **Secondary-200**: `#E5E7EB` — Borders, dividers
- **Secondary-50**: `#F9FAFB` — Светлый фон для контента

#### Третичный цвет (Tertiary) — Тёмная бирюза
- **Tertiary-700**: `#0F766E` — Для успеха, positive states
- **Tertiary-600**: `#14B8A6` — Success highlights
- **Tertiary-100**: `#CCFBF1` — Light background для success

#### Сигнальные цвета (Semantic)

**Success/Positive**
- **Success-700**: `#15803D` — Основной для успеха
- **Success-600**: `#22C55E` — Яркий зелёный для highlights
- **Success-100**: `#DCFCE7` — Light background

**Warning/Caution**
- **Warning-700**: `#B45309` — Основной для warning
- **Warning-600**: `#F59E0B` — Янтарный для внимания
- **Warning-100**: `#FEF3C7` — Light background

**Error/Danger**
- **Error-700**: `#B91C1C` — Основной для ошибок
- **Error-600**: `#EF4444` — Яркий красный для errors
- **Error-100**: `#FEE2E2` — Light background

**Info/Notice**
- **Info-600**: `#0284C7` — Голубой для информации
- **Info-100**: `#CFFAFE` — Light background

### 2.2 Нейтральные цвета

| Название | HEX | Использование |
|----------|-----|---------------|
| **Text-Primary** | `#0F1623` | Основной текст, заголовки |
| **Text-Secondary** | `#4B5563` | Вторичный текст, labels |
| **Text-Tertiary** | `#9CA3AF` | Disabled, hints, placeholders |
| **Text-Inverse** | `#F9FAFB` | Текст на тёмных фонах |
| **Background-Primary** | `#FFFFFF` | Основной фон контента |
| **Background-Secondary** | `#F9FAFB` | Фон secondary areas, striping |
| **Background-Tertiary** | `#F3F4F6` | Фон элементов в фокусе |
| **Border-Light** | `#E5E7EB` | Основные границы |
| **Border-Dark** | `#D1D5DB` | Выделенные границы |
| **Divider** | `#E5E7EB` | Разделители, строки таблиц |

### 2.3 Shadow система (для корпоративного вида)

```css
--shadow-xs: 0 1px 2px 0 rgba(15, 22, 35, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(15, 22, 35, 0.1), 0 1px 2px -1px rgba(15, 22, 35, 0.1);
--shadow-md: 0 4px 6px -1px rgba(15, 22, 35, 0.1), 0 2px 4px -2px rgba(15, 22, 35, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(15, 22, 35, 0.1), 0 4px 6px -4px rgba(15, 22, 35, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(15, 22, 35, 0.1), 0 8px 10px -6px rgba(15, 22, 35, 0.1);
```

### 2.4 Типографика

| Уровень | Font-size | Font-weight | Line-height | Использование |
|---------|-----------|------------|-------------|--------------|
| **H1** | 2.5rem (40px) | 700 | 1.2 | Заголовки страниц |
| **H2** | 2rem (32px) | 700 | 1.25 | Заголовки секций |
| **H3** | 1.5rem (24px) | 600 | 1.3 | Подзаголовки |
| **H4** | 1.25rem (20px) | 600 | 1.35 | Заголовки карточек |
| **Body-L** | 1.1rem (18px) | 400 | 1.6 | Основной текст |
| **Body-M** | 1rem (16px) | 400 | 1.5 | Стандартный текст |
| **Body-S** | 0.875rem (14px) | 400 | 1.5 | Secondary text |
| **Caption** | 0.75rem (12px) | 400 | 1.4 | Подписи, hints |
| **Code-M** | 0.95rem (15px) | 500 | 1.6 | Inline code, DAX |
| **Code-S** | 0.85rem (13px) | 400 | 1.5 | Code blocks |

**Шрифтовой стек:**
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'SF Pro Display',
  'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
  'Helvetica Neue', sans-serif;
```

### 2.5 Spacing система (8px grid)

| Размер | Px | Использование |
|--------|-----|--------------|
| **xs** | 4px | Micro-spacing между inline элементами |
| **sm** | 8px | Spacing внутри компонентов |
| **md** | 16px | Стандартное spacing между элементами |
| **lg** | 24px | Spacing между секциями |
| **xl** | 32px | Spacing между major sections |
| **2xl** | 48px | Page padding |
| **3xl** | 64px | Large section separation |

### 2.6 Размеры компонентов

| Элемент | Высота | Ширина | Используется |
|---------|--------|--------|-------------|
| **Button-sm** | 32px | auto | Secondary actions |
| **Button-md** | 40px | auto | Primary actions |
| **Button-lg** | 48px | auto | Feature buttons |
| **Input-sm** | 32px | auto | Compact forms |
| **Input-md** | 40px | auto | Standard forms |
| **Header-height** | 70px | 100% | Navbar |
| **Sidebar-width** | — | 280px | For future sidebar |
| **Max-width** | — | 1600px | Content container |

---

## 3. Выбор иконок

### 3.1 Решение: Feather Icons

**Обоснование выбора:**
- ✅ Минималистичный, корпоративный стиль (VS Code, GitHub используют похожие)
- ✅ Согласованная толщина линий (2px) для всех иконок
- ✅ Отличная интеграция с React
- ✅ Бесплатно, open-source (MIT лицензия)
- ✅ 287 иконок, покрывают 95% случаев
- ✅ Поддержка RTL
- ✅ Кастомизируемые размеры и цвета

**Альтернативы и почему отклонены:**
- Material Design Icons: Слишком тяжёлые, не похожи на VS Code
- FontAwesome: Красивые, но требуют платной лицензии для полного набора
- Phosphor: Подходит, но более декоративные
- Heroicons: Отличный вариант, но Feather более лёгкий

### 3.2 Маппинг эмодзи на иконки Feather

| Эмодзи | Контекст | Feather Icon | Цвет | Размер |
|--------|----------|--------------|------|--------|
| 📊 | Logo, Catalog tab | `BarChart3` | Primary-600 | 20px |
| 📖 | Catalog navigation | `Book` | Primary-600 | 18px |
| ✏️ | Requirements | `FileText` или `Edit3` | Primary-600 | 18px |
| 🔗 | Data Lineage | `GitBranch` | Primary-600 | 18px |
| 📦 | Feature list | `Package` | Success-600 | 16px |
| 🔀 | Feature list | `GitMerge` | Success-600 | 16px |
| 📝 | Feature list | `FileText` | Success-600 | 16px |
| ⚠️ | Warning state | `AlertCircle` | Warning-600 | 18px |
| 💾 | Save button | `Save` | Success-600 | 18px |
| 📄 | Export Markdown | `Download` | Info-600 | 18px |
| 📋 | Export DOCX | `File` | Info-600 | 18px |
| + | Add button | `Plus` | Primary-600 | 18px |
| ✕ | Delete button | `X` | Error-600 | 18px |
| ← → | Relations | `ArrowRight` / `ArrowLeft` | Secondary-600 | 16px |

### 3.3 Установка и интеграция

#### Шаг 1: Установка пакета
```bash
npm install react-feather --save-dev
```

#### Шаг 2: Создание компонента-обёртки (минимизирует риск)

Файл: `src/components/ui/Icon.jsx`
```javascript
import { 
  BarChart3, Book, FileText, GitBranch, Package, GitMerge,
  AlertCircle, Save, Download, File, Plus, X, ArrowRight, ArrowLeft,
  Edit3, AlertTriangle, ChevronDown, Search, Menu, Command, Settings
} from 'react-feather';

const ICONS = {
  barChart: BarChart3,
  book: Book,
  fileText: FileText,
  gitBranch: GitBranch,
  package: Package,
  gitMerge: GitMerge,
  warning: AlertCircle,
  save: Save,
  download: Download,
  file: File,
  plus: Plus,
  delete: X,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  edit: Edit3,
  alertTriangle: AlertTriangle,
  chevronDown: ChevronDown,
  search: Search,
  menu: Menu,
  command: Command,
  settings: Settings,
};

export const Icon = ({ name, size = 18, color = 'currentColor', ...props }) => {
  const IconComponent = ICONS[name];
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  return <IconComponent size={size} color={color} {...props} />;
};
```

**Преимущества этого подхода:**
- ✅ Централизованное управление иконками
- ✅ Легко заменить (например, на другую библиотеку) в одном месте
- ✅ Консистентные параметры (размер, цвет)
- ✅ Минимизирует прямые импорты из `react-feather`
- ✅ Типобезопасность

#### Шаг 3: Использование в компонентах
```jsx
// Вместо: <span>📊</span>
import { Icon } from './components/ui/Icon';

<Icon name="barChart" size={20} color="#3D5DB8" />
```

---

## 4. Архитектура файловой структуры

### 4.1 Новая структура после рефактора

```
cube-docs/
├── src/
│   ├── components/
│   │   ├── ui/                          # ← NEW: Переиспользуемые UI компоненты
│   │   │   ├── Icon.jsx                 # Обёртка для иконок Feather
│   │   │   ├── Button.jsx               # Кнопки с unified styling
│   │   │   ├── Input.jsx                # Inputs с unified styling
│   │   │   ├── Tabs.jsx                 # Табы компонент
│   │   │   ├── Table.jsx                # Таблица компонент
│   │   │   ├── Card.jsx                 # Карточка компонент
│   │   │   ├── Badge.jsx                # Бейджи для статусов
│   │   │   ├── Select.jsx               # Dropdown select
│   │   │   └── index.js                 # Public API
│   │   ├── CatalogPage.jsx              # Эксистирующий компонент (с рефактором)
│   │   ├── CatalogPage.css              # Переработанные стили
│   │   ├── RequirementsPage.jsx         # Эксистирующий компонент (с рефактором)
│   │   ├── RequirementsPage.css         # Переработанные стили
│   │   └── WorkBlockEditor.jsx          # ← NEW: Extracted subcomponent
│   │
│   ├── styles/                          # ← NEW: Централизованные стили
│   │   ├── tokens.css                   # CSS Custom Properties (палитра)
│   │   ├── base.css                     # Global base styles
│   │   ├── typography.css               # Типографика
│   │   ├── shadows.css                  # Shadow система
│   │   ├── responsive.css               # Media queries utils
│   │   └── animations.css               # Transitions и animations
│   │
│   ├── App.jsx                          # Root компонент (с рефактором)
│   ├── App.css                          # Переработанные глобальные стили
│   ├── index.css                        # Переработанные базовые стили
│   ├── main.jsx
│   └── [другие файлы...]
│
├── index.html                           # С обновленной мета информацией
├── package.json                         # С добавлением react-feather
└── [другие файлы...]
```

### 4.2 Новые файлы для создания

**Фазу 1 — Токены и базовые стили:**
1. `src/styles/tokens.css` — CSS variables для палитры
2. `src/styles/base.css` — Reset и основные стили
3. `src/styles/typography.css` — Типографика система
4. `src/styles/shadows.css` — Shadow система
5. `src/components/ui/Icon.jsx` — Icon wrapper

**Фазу 2 — UI компоненты:**
6. `src/components/ui/Button.jsx`
7. `src/components/ui/Input.jsx`
8. `src/components/ui/Tabs.jsx`
9. `src/components/ui/Badge.jsx`
10. `src/components/ui/Card.jsx`
11. `src/components/ui/Select.jsx` (Combobox заменить)

**Фазу 3 — Рефактор страниц:**
12. `src/components/WorkBlockEditor.jsx` — Extracted component

---

## 5. Изменения по файлам

### 5.1 Файлы на изменение (с кратким описанием)

| Файл | Тип изменения | Описание |
|------|---------------|----------|
| `index.html` | Modify | Обновить мета title, favicon, добавить charset |
| `src/index.css` | Replace | Заменить на import tokens и base styles |
| `src/App.css` | Refactor | Переписать с использованием CSS variables |
| `src/App.jsx` | Refactor | Заменить эмодзи на Icon компонент |
| `src/components/CatalogPage.css` | Refactor | Переписать с CSS variables и удалить эмодзи |
| `src/components/CatalogPage.jsx` | Refactor | Заменить эмодзи, улучшить компоненты |
| `src/components/RequirementsPage.css` | Refactor | Переписать с CSS variables |
| `src/components/RequirementsPage.jsx` | Refactor | Заменить эмодзи, Extract WorkBlockEditor |
| `package.json` | Modify | Добавить `react-feather` в dependencies |

### 5.2 Файлы на создание (6 новых)

| Файл | Назначение | Приоритет |
|------|-----------|----------|
| `src/styles/tokens.css` | CSS Custom Properties палитра | P0 |
| `src/styles/base.css` | Global reset + base styles | P0 |
| `src/styles/typography.css` | Типографика classes | P1 |
| `src/styles/shadows.css` | Shadow utilities | P1 |
| `src/components/ui/Icon.jsx` | Icon wrapper component | P0 |
| `src/components/WorkBlockEditor.jsx` | Extracted subcomponent | P1 |

### 5.3 Итого изменений
- **На изменение**: 8 файлов
- **На создание**: 6 файлов
- **Всего затронутых файлов**: 14

---

## 6. Конкретный список изменений

### 6.1 `index.html` — Обновление заголовка и мета

**Изменения:**
- [ ] Обновить `<title>` на: "Cube Documentation — Каталог и требования"
- [ ] Добавить мета description: `<meta name="description" content="Профессиональный инструмент управления кубами данных, каталогом сущностей и требованиями расширения">`
- [ ] Обновить favicon (опционально)

---

### 6.2 `src/index.css` — Переписать на imports

**Было:**
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

**Будет:**
```css
@import './styles/tokens.css';
@import './styles/base.css';
@import './styles/typography.css';
@import './styles/shadows.css';
```

---

### 6.3 `src/App.css` — Рефактор с CSS variables

**Изменения:**
- [ ] Заменить hardcoded цвета на CSS variables
  - `#2c3e50` → `var(--primary-900)`
  - `#34495e` → `var(--primary-700)`
  - `#3498db` → `var(--primary-500)`
  - `#7f8c8d` → `var(--text-secondary)`
  - `#f5f5f5` → `var(--background-secondary)`
- [ ] Обновить gradient на navbar на smooth темный индиго
- [ ] Добавить modern shadows вместо базовых
- [ ] Улучшить hover/active состояния

---

### 6.4 `src/App.jsx` — Замена эмодзи на Icon

**Было:**
```jsx
<div className="nav-logo">📊 Cube Documentation</div>
<button>📖 Каталог куба</button>
<button>✏️ Требования</button>
```

**Будет:**
```jsx
import { Icon } from './components/ui/Icon';

<div className="nav-logo">
  <Icon name="barChart" size={20} color="white" /> Cube Documentation
</div>
<button>
  <Icon name="book" size={18} color="inherit" /> Каталог куба
</button>
<button>
  <Icon name="fileText" size={18} color="inherit" /> Требования
</button>
```

---

### 6.5 `src/components/CatalogPage.jsx` — Замена эмодзи

**Места для замены:**
- [ ] Строка 64: `📊 Каталог` → `<Icon name="barChart" /> Каталог`
- [ ] Строка 70: `🔗 Data Lineage` → `<Icon name="gitBranch" /> Data Lineage`
- [ ] Строка 229: `→` / `←` → `<Icon name="arrowRight" />` / `<Icon name="arrowLeft" />`

**Добавить импорт:**
```jsx
import { Icon } from './ui/Icon';
```

---

### 6.6 `src/components/CatalogPage.css` — Переписать стили

**Изменения:**
- [ ] Заменить hardcoded цвета на CSS variables
- [ ] Обновить таблицы со striping: `var(--background-secondary)`
- [ ] Улучшить hover состояния
- [ ] Добавить shadows для карточек

---

### 6.7 `src/components/RequirementsPage.jsx` — Замена эмодзи + Extract

**Места для замены эмодзи:**
- [ ] Строка 144: `💾 Сохранить` → `<Icon name="save" /> Сохранить`
- [ ] Строка 151: `📄 Экспорт Markdown` → `<Icon name="download" /> Экспорт Markdown`
- [ ] Строка 158: `📋 Экспорт DOCX` → `<Icon name="file" /> Экспорт DOCX`

**Extract компонента:**
- [ ] Перенести `WorkBlockEditor` (lines 168-691) в отдельный файл
- [ ] Обновить импорт

**Добавить импорты:**
```jsx
import { Icon } from './ui/Icon';
import { WorkBlockEditor } from './WorkBlockEditor';
```

---

### 6.8 `src/components/RequirementsPage.css` — Переписать стили

**Изменения:**
- [ ] Заменить hardcoded цвета на CSS variables
- [ ] Обновить все оттенки серого
- [ ] Добавить modern shadows
- [ ] Улучшить layout для карточек

---

### 6.9 `src/components/WorkBlockEditor.jsx` — NEW файл (Extracted)

**Содержание:**
- [ ] Скопировать компонент `WorkBlockEditor` из RequirementsPage.jsx
- [ ] Обновить импорты (mockData, types, иконки)
- [ ] Добавить замену эмодзи на Icon компоненты (+ в WorkBlockEditor, ✕ для удаления)

**Иконки в этом компоненте:**
- `+` → `<Icon name="plus" />`
- `✕` → `<Icon name="delete" />`

---

### 6.10 `src/components/ui/Icon.jsx` — NEW файл (Component)

**Содержание:** (см. раздел 3.3)
- [ ] Импортировать иконки из `react-feather`
- [ ] Создать компонент-обёртку с централизованным реестром
- [ ] Обрабатывать unknown icons gracefully

---

### 6.11 `src/styles/tokens.css` — NEW файл (Design Tokens)

**Содержание:**
```css
:root {
  /* Primary Colors */
  --primary-950: #0F1623;
  --primary-900: #1A2A52;
  --primary-700: #2D4A8F;
  --primary-600: #3D5DB8;
  --primary-500: #4F6FDB;
  --primary-400: #6B8AE8;
  --primary-100: #E8ECFA;

  /* Secondary (Neutral) */
  --secondary-950: #0D0E11;
  --secondary-800: #1F2937;
  --secondary-600: #4B5563;
  --secondary-400: #9CA3AF;
  --secondary-200: #E5E7EB;
  --secondary-50: #F9FAFB;

  /* Tertiary */
  --tertiary-700: #0F766E;
  --tertiary-600: #14B8A6;
  --tertiary-100: #CCFBF1;

  /* Semantic Colors */
  --success-700: #15803D;
  --success-600: #22C55E;
  --success-100: #DCFCE7;

  --warning-700: #B45309;
  --warning-600: #F59E0B;
  --warning-100: #FEF3C7;

  --error-700: #B91C1C;
  --error-600: #EF4444;
  --error-100: #FEE2E2;

  --info-600: #0284C7;
  --info-100: #CFFAFE;

  /* Text Colors */
  --text-primary: #0F1623;
  --text-secondary: #4B5563;
  --text-tertiary: #9CA3AF;
  --text-inverse: #F9FAFB;

  /* Background Colors */
  --background-primary: #FFFFFF;
  --background-secondary: #F9FAFB;
  --background-tertiary: #F3F4F6;

  /* Border Colors */
  --border-light: #E5E7EB;
  --border-dark: #D1D5DB;
  --divider: #E5E7EB;

  /* Shadows */
  --shadow-xs: 0 1px 2px 0 rgba(15, 22, 35, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(15, 22, 35, 0.1), 0 1px 2px -1px rgba(15, 22, 35, 0.1);
  --shadow-md: 0 4px 6px -1px rgba(15, 22, 35, 0.1), 0 2px 4px -2px rgba(15, 22, 35, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(15, 22, 35, 0.1), 0 4px 6px -4px rgba(15, 22, 35, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(15, 22, 35, 0.1), 0 8px 10px -6px rgba(15, 22, 35, 0.1);

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;

  /* Font Sizes */
  --font-size-h1: 2.5rem;
  --font-size-h2: 2rem;
  --font-size-h3: 1.5rem;
  --font-size-h4: 1.25rem;
  --font-size-body-l: 1.1rem;
  --font-size-body-m: 1rem;
  --font-size-body-s: 0.875rem;
  --font-size-caption: 0.75rem;

  /* Borders */
  --border-radius-sm: 4px;
  --border-radius-md: 6px;
  --border-radius-lg: 8px;
  --border-radius-xl: 12px;
  --border-radius-full: 9999px;

  /* Max Width */
  --max-width: 1600px;

  /* Header Height */
  --header-height: 70px;
}
```

---

### 6.12 `src/styles/base.css` — NEW файл

**Содержание:**
```css
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
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--background-secondary);
  color: var(--text-primary);
}

#root {
  width: 100%;
  height: 100%;
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
```

---

### 6.13 `src/styles/typography.css` — NEW файл

**Содержание:**
```css
h1 {
  font-size: var(--font-size-h1);
  font-weight: 700;
  line-height: 1.2;
  color: var(--text-primary);
}

h2 {
  font-size: var(--font-size-h2);
  font-weight: 700;
  line-height: 1.25;
  color: var(--text-primary);
}

h3 {
  font-size: var(--font-size-h3);
  font-weight: 600;
  line-height: 1.3;
  color: var(--text-primary);
}

h4 {
  font-size: var(--font-size-h4);
  font-weight: 600;
  line-height: 1.35;
  color: var(--text-primary);
}

body, p {
  font-size: var(--font-size-body-m);
  font-weight: 400;
  line-height: 1.5;
  color: var(--text-primary);
}

.text-secondary {
  color: var(--text-secondary);
}

.text-tertiary {
  color: var(--text-tertiary);
}

code {
  font-family: 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono',
    'Inconsolata', 'Courier New', monospace;
  font-size: 0.95rem;
  font-weight: 500;
  background-color: var(--background-tertiary);
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
  color: var(--primary-700);
}

pre code {
  background-color: var(--secondary-800);
  color: #E2E8F0;
  padding: var(--space-md);
  border-radius: var(--border-radius-md);
  display: block;
  overflow-x: auto;
}
```

---

### 6.14 `src/styles/shadows.css` — NEW файл

**Содержание:**
```css
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
```

---

### 6.15 `package.json` — Добавить зависимость

**Изменение:**
```json
"dependencies": {
  "react": "^18.x",
  "react-dom": "^18.x",
  "react-feather": "^2.0.10"
}
```

---

## 7. Критерии приемки (QA Чеклист)

### 7.1 Визуальный дизайн

- [ ] **Палитра цветов**
  - [ ] Все синие элементы используют оттенки `--primary-*` (индиго)
  - [ ] Все серые элементы используют оттенки `--secondary-*`
  - [ ] Success статусы зелёные (`--success-*`)
  - [ ] Warning статусы янтарные (`--warning-*`)
  - [ ] Error статусы красные (`--error-*`)
  - [ ] Контрастность текста на всех фонах ≥ 4.5:1 (WCAG AA)

- [ ] **Иконки**
  - [ ] Все эмодзи заменены на Feather иконки
  - [ ] Эмодзи не присутствуют в рендере компонентов
  - [ ] Иконки выровнены вертикально с текстом
  - [ ] Иконки консистентного размера (18-20px для основных)
  - [ ] Иконки соответствуют цветам (белые в navbar, primary в контенте)

- [ ] **Типографика**
  - [ ] H1 заголовки: 40px, weight 700
  - [ ] H2 заголовки: 32px, weight 700
  - [ ] Основной текст: 16px, weight 400
  - [ ] Code элементы: 15px, monospace, weight 500
  - [ ] Все шрифты согласованы (Segoe UI → SF Pro Display)

- [ ] **Spacing и Layout**
  - [ ] Используется 8px grid система (4px, 8px, 16px, 24px, 32px, 48px, 64px)
  - [ ] Таблицы имеют равномерный padding
  - [ ] Вертикальный rhythm соблюден
  - [ ] No arbitrary pixel values

- [ ] **Shadows**
  - [ ] Navbar: `--shadow-md`
  - [ ] Карточки: `--shadow-sm` или `--shadow-md`
  - [ ] Modal/Dropdown: `--shadow-lg`
  - [ ] Shadows соответствуют глубине элемента

### 7.2 Компонентная архитектура

- [ ] **Icon компонент**
  - [ ] Icon.jsx существует и экспортируется
  - [ ] Все используемые иконки зарегистрированы в ICONS объекте
  - [ ] Неизвестная иконка выводит warning в консоль
  - [ ] Компонент принимает props: name, size, color
  - [ ] Icon компонент не содержит жёстко закодированные цвета

- [ ] **CSS Variables**
  - [ ] `tokens.css` определяет все палитры, spacing, font-size, shadows
  - [ ] Никакие компоненты не используют hardcoded цвета (только var())
  - [ ] Media queries используют правильные breakpoints
  - [ ] CSS variables правильно каскадируются

- [ ] **Файловая структура**
  - [ ] `src/styles/` содержит: tokens.css, base.css, typography.css, shadows.css
  - [ ] `src/components/ui/` содержит Icon.jsx
  - [ ] WorkBlockEditor.jsx выделен в отдельный файл
  - [ ] Иерархия файлов логична и читаема

### 7.3 Функциональность

- [ ] **App.jsx**
  - [ ] Навигация работает корректно
  - [ ] Активный таб подсвечен правильно
  - [ ] Эмодзи полностью заменены на иконки

- [ ] **CatalogPage**
  - [ ] Таблицы отображаются корректно с нью стилями
  - [ ] Поиск работает
  - [ ] Выпадающий список (dropdown) функционален
  - [ ] Arrows (← →) отображаются как иконки
  - [ ] Кнопки табов отображают иконки

- [ ] **RequirementsPage**
  - [ ] Форма работает корректно
  - [ ] Кнопки Save, Export Markdown, Export DOCX отображают иконки
  - [ ] WorkBlockEditor компонент функционален
  - [ ] Иконки добавления (+) и удаления (✕) отображаются корректно
  - [ ] Dropdown для выбора сущности работает

### 7.4 Производительность и совместимость

- [ ] **Performance**
  - [ ] react-feather bundled в main.js
  - [ ] Нет неиспользуемых импортов
  - [ ] CSS файлы оптимизированы (no duplication)
  - [ ] Bundle size не увеличился значительно (< 50KB новых assets)

- [ ] **Кроссбраузерность**
  - [ ] Chrome ✓
  - [ ] Firefox ✓
  - [ ] Safari ✓
  - [ ] Edge ✓

- [ ] **Responsive**
  - [ ] Mobile (< 768px) ✓
  - [ ] Tablet (768px - 1024px) ✓
  - [ ] Desktop (> 1024px) ✓
  - [ ] Navbar коллапсируется на мобильных (опционально)

### 7.5 Accessibility

- [ ] **Color Contrast**
  - [ ] Text-on-background контрастность ≥ 4.5:1
  - [ ] Button labels читаемы
  - [ ] Таблицы разборчивы

- [ ] **Семантика**
  - [ ] Кнопки используют `<button>` элементы
  - [ ] Заголовки используют правильные `<h1-h6>` теги
  - [ ] Иконки имеют `aria-label` или контекстный текст

- [ ] **Keyboard Navigation**
  - [ ] Tab навигация работает
  - [ ] Активные элементы видны при focus
  - [ ] Все интерактивные элементы доступны с клавиатуры

### 7.6 Code Quality

- [ ] **Lint и Warnings**
  - [ ] npm run lint проходит без ошибок (если настроено)
  - [ ] No console.error или console.warn (кроме intentional)
  - [ ] No commented-out code

- [ ] **TypeScript (если используется)**
  - [ ] Нет `any` типов
  - [ ] Props типизированы
  - [ ] Импорты правильно типизированы

- [ ] **Comments**
  - [ ] Complex логика задокументирована
  - [ ] Нет очевидных комментариев ("// increment", "// set title")

### 7.7 Documentation

- [ ] **Design Document**
  - [ ] `UI_DESIGN_ARCHITECTURE.md` создан и актуален
  - [ ] Палитра задокументирована
  - [ ] Icon маппинг задокументирован
  - [ ] File structure описана

- [ ] **Component Documentation**
  - [ ] Icon.jsx имеет комментарий с примером использования
  - [ ] CSS variables объяснены

### 7.8 Smoke Tests (Basic Functionality)

- [ ] **Страница загружается без ошибок** ✓
- [ ] **Все иконки отображаются правильно** ✓
- [ ] **Цвета соответствуют палитре** ✓
- [ ] **Таблицы читаемы** ✓
- [ ] **Формы функциональны** ✓
- [ ] **Export функции работают** ✓

---

## 8. Рекомендации по реализации

### Фазировка

**Фаза 1: Токены и базовая инфраструктура (1-2 часа)**
1. Создать `src/styles/tokens.css` с палитрой
2. Создать `src/styles/base.css` и другие базовые стили
3. Обновить `src/index.css` на imports
4. Создать `src/components/ui/Icon.jsx`
5. Добавить `react-feather` в `package.json`

**Фаза 2: Рефактор App и Navbar (30-45 минут)**
1. Обновить `src/App.css` с CSS variables
2. Обновить `src/App.jsx` с Icon компонентом
3. Протестировать navbar

**Фаза 3: Рефактор CatalogPage (45-60 минут)**
1. Обновить `src/components/CatalogPage.css`
2. Обновить `src/components/CatalogPage.jsx`
3. Протестировать таблицы и иконки

**Фаза 4: Рефактор RequirementsPage (60-90 минут)**
1. Обновить `src/components/RequirementsPage.css`
2. Extract `WorkBlockEditor.jsx`
3. Обновить `src/components/RequirementsPage.jsx`
4. Протестировать формы

**Фаза 5: QA и полировка (30-45 минут)**
1. Провести smoke tests
2. Проверить все иконки
3. Валидировать цвета
4. Проверить accessibility
5. Финальный polish

**Итого: ~4-5 часов разработки**

### Git Strategy

```bash
# Рекомендуемые коммиты:
git commit -m "style: add design tokens and base CSS"
git commit -m "refactor: update App component with new design"
git commit -m "refactor: replace emojis with Feather icons"
git commit -m "refactor: update CatalogPage styling"
git commit -m "refactor: update RequirementsPage and extract WorkBlockEditor"
git commit -m "style: add UI component foundations"
```

---

## 9. Техническая документация

### CSS Variables в действии

**Пример до:**
```css
.navbar {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
}
.nav-link.active {
  background: rgba(52, 152, 219, 0.3);
  border-bottom: 3px solid #3498db;
}
```

**Пример после:**
```css
.navbar {
  background: linear-gradient(135deg, var(--primary-900) 0%, var(--primary-700) 100%);
  box-shadow: var(--shadow-md);
}
.nav-link.active {
  background: rgba(79, 111, 219, 0.1); /* primary-500 with 10% opacity */
  border-bottom: 3px solid var(--primary-500);
}
```

### Icon компонент в действии

**Usage:**
```jsx
import { Icon } from './components/ui/Icon';

// В JSX:
<button>
  <Icon name="save" size={18} color="white" /> 
  Сохранить
</button>

// Output: <svg>...</svg> + текст "Сохранить"
```

### Миграция цветов

| Старый цвет | HEX | Новая переменная |
|-----------|-----|------------------|
| Navbar background | #2c3e50 | --primary-900 |
| Navbar gradient | #34495e | --primary-700 |
| Active accent | #3498db | --primary-500 |
| Secondary text | #7f8c8d | --text-secondary |
| Page background | #f5f5f5 | --background-secondary |
| Table border | #ecf0f1 | --border-light |

---

## 10. Приложение: Полный чеклист для реализации

```markdown
## Предварительные работы
- [ ] Создать git branch: `feature/ui-design-refactor`
- [ ] Установить react-feather: `npm install react-feather`
- [ ] Прочитать весь план

## Этап 1: Токены и инфра (P0)
- [ ] Создать src/styles/tokens.css
- [ ] Создать src/styles/base.css
- [ ] Создать src/styles/typography.css
- [ ] Создать src/styles/shadows.css
- [ ] Обновить src/index.css на imports
- [ ] Создать src/components/ui/Icon.jsx
- [ ] Протестировать imports

## Этап 2: App компонент
- [ ] Обновить src/App.css на CSS variables
- [ ] Обновить src/App.jsx на Icon компонент
- [ ] Обновить index.html meta
- [ ] Протестировать navbar

## Этап 3: CatalogPage
- [ ] Обновить CatalogPage.css
- [ ] Обновить CatalogPage.jsx на Icon
- [ ] Протестировать таблицы
- [ ] Проверить поиск

## Этап 4: RequirementsPage
- [ ] Обновить RequirementsPage.css
- [ ] Extract WorkBlockEditor.jsx
- [ ] Обновить RequirementsPage.jsx
- [ ] Протестировать формы
- [ ] Протестировать экспорт

## Этап 5: QA
- [ ] Визуальный QA (цвета, иконки)
- [ ] Функциональный QA
- [ ] Accessibility QA
- [ ] Performance check
- [ ] Browser compatibility

## Post-Release
- [ ] Создать PR
- [ ] Code review
- [ ] Merge в main
- [ ] Deploy
```

---

**Документ подготовлен:** 10 Май 2026  
**Версия:** 1.0  
**Статус:** Ready for Implementation
