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
import { CalculationProvider, useCalculation } from './context/CalculationContext';
import { FileText } from 'lucide-react';

export default function App() {
  return (
    <CalculationProvider>
      <AppContent />
    </CalculationProvider>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<'database' | 'calculation' | 'evidence'>('calculation');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { state } = useCalculation();

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
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => setActiveTab('calculation')}
            >
              <div className="bg-amber-500 p-1.5 rounded-lg">
                <Calculator size={24} className="text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">Beam Selector Pro</span>
            </div>
            <nav className="flex items-center space-x-1 sm:space-x-4">
              <button
                onClick={() => setActiveTab('calculation')}
                className={`px-2 sm:px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                  activeTab === 'calculation'
                    ? 'bg-amber-500 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Calculator size={18} />
                <span className="hidden sm:inline">Cálculo</span>
              </button>
              <button
                onClick={() => setActiveTab('evidence')}
                disabled={!state.results?.selectedProfile}
                className={`px-2 sm:px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                  activeTab === 'evidence'
                    ? 'bg-amber-500 text-white'
                    : !state.results?.selectedProfile
                    ? 'text-slate-500 cursor-not-allowed opacity-50'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                title={!state.results?.selectedProfile ? "Seleccione un perfil en Cálculo primero" : ""}
              >
                <FileText size={18} />
                <span className="hidden sm:inline">Avanzado</span>
              </button>
              <button
                onClick={() => setActiveTab('database')}
                className={`px-2 sm:px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                  activeTab === 'database'
                    ? 'bg-amber-500 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Database size={18} />
                <span className="hidden sm:inline">Base de Datos</span>
              </button>
              <div className="w-px h-6 bg-slate-700 mx-1 sm:mx-2"></div>
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col relative overflow-y-auto lg:overflow-hidden">
        <div className={`flex-1 flex flex-col ${activeTab === 'calculation' ? '' : 'hidden'}`}>
          <CalculationTab onGoToEvidence={() => setActiveTab('evidence')} />
        </div>
        <div className={`flex-1 flex flex-col ${activeTab === 'evidence' ? '' : 'hidden'}`}>
          <EvidenceTab />
        </div>
        <div className={`flex-1 flex flex-col ${activeTab === 'database' ? '' : 'hidden'}`}>
          <DatabaseTab />
        </div>
        <InfoPopup />
      </main>
    </div>
  );
}
