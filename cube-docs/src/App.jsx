import React, { useState } from 'react';
import { BookOpen, Database, FileText } from 'lucide-react';
import { CatalogPage } from './components/CatalogPage';
import { RequirementsPage } from './components/RequirementsPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('catalog');

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <Database size={18} />
            <span>Cube Documentation</span>
          </div>
          <div className="nav-links">
            <button
              className={`nav-link ${currentPage === 'catalog' ? 'active' : ''}`}
              onClick={() => setCurrentPage('catalog')}
            >
              <BookOpen size={16} />
              <span>Каталог куба</span>
            </button>
            <button
              className={`nav-link ${currentPage === 'requirements' ? 'active' : ''}`}
              onClick={() => setCurrentPage('requirements')}
            >
              <FileText size={16} />
              <span>Требования</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {currentPage === 'catalog' && <CatalogPage />}
        {currentPage === 'requirements' && <RequirementsPage />}
      </main>
    </div>
  );
}

export default App;
