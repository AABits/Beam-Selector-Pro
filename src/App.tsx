/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Database, Calculator, Sun, Moon } from 'lucide-react';
import DatabaseTab from './components/DatabaseTab';
import CalculationTab from './components/CalculationTab';
import EvidenceTab from './components/EvidenceTab';
import InfoPopup from './components/InfoPopup';
import { CalculationProvider } from './context/CalculationContext';
import { FileText } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'database' | 'calculation' | 'evidence'>('calculation');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col font-sans transition-colors duration-200">
      {/* Header */}
      <header className="bg-slate-900 dark:bg-slate-950 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-amber-500 p-1.5 rounded-lg">
                <Calculator size={24} className="text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">Beam Selector Pro</span>
            </div>
            <nav className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('calculation')}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                  activeTab === 'calculation'
                    ? 'bg-amber-500 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Calculator size={18} />
                Cálculo
              </button>
              <button
                onClick={() => setActiveTab('evidence')}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                  activeTab === 'evidence'
                    ? 'bg-amber-500 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <FileText size={18} />
                Evidencias
              </button>
              <button
                onClick={() => setActiveTab('database')}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                  activeTab === 'database'
                    ? 'bg-amber-500 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Database size={18} />
                Base de Datos
              </button>
              <div className="w-px h-6 bg-slate-700 mx-2"></div>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full text-slate-300 hover:bg-slate-800 hover:text-amber-400 transition-colors"
                title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-hidden flex flex-col relative">
        <CalculationProvider>
          {activeTab === 'database' ? (
            <DatabaseTab />
          ) : activeTab === 'evidence' ? (
            <EvidenceTab />
          ) : (
            <CalculationTab />
          )}
          <InfoPopup />
        </CalculationProvider>
      </main>
    </div>
  );
}
