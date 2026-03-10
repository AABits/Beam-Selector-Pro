import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

export default function InfoPopup({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'instrucciones' | 'parametros' | 'importancia'>('instrucciones');

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={className || "fixed bottom-6 left-6 w-10 h-10 sm:w-12 sm:h-12 bg-amber-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-amber-600 transition-colors z-50"}
        title="Información y Ayuda"
      >
        <Info size={24} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Info className="text-amber-500" />
            Información del Sistema
          </h2>
          <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-700">
            <X size={24} />
          </button>
        </div>

        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => setActiveTab('instrucciones')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'instrucciones' ? 'border-b-2 border-amber-500 text-amber-600' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Instrucciones de Uso
          </button>
          <button
            onClick={() => setActiveTab('parametros')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'parametros' ? 'border-b-2 border-amber-500 text-amber-600' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Parámetros y Unidades
          </button>
          <button
            onClick={() => setActiveTab('importancia')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'importancia' ? 'border-b-2 border-amber-500 text-amber-600' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            ¿Por qué es importante?
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 text-slate-700 text-sm leading-relaxed">
          {activeTab === 'instrucciones' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">¿Cómo usar Beam Selector Pro?</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li><strong>Configuración Inicial:</strong> Defina el material y el tipo de viga deseado. El sistema cargará automáticamente las propiedades desde la base de datos.</li>
                <li><strong>Definición de Cargas:</strong> Ingrese cargas puntuales, distribuidas (uniformes o trapezoidales) y momentos. Use el botón "+" para añadir múltiples cargas.</li>
                <li><strong>Peso Propio:</strong> Active el interruptor "Incluir Peso Propio" para que el sistema sume automáticamente la carga muerta según la sección transversal.</li>
                <li><strong>Cálculo y Optimización:</strong> Haga clic en "Calcular". El motor de resolución (Macaulay) resolverá la viga, incluso si es estáticamente indeterminada.</li>
                <li><strong>Navegación y Reinicio:</strong> Use el logo para volver al inicio sin perder datos, o el botón rojo (hover sobre Calcular) para limpiar todo.</li>
              </ol>
            </div>
          )}

          {activeTab === 'parametros' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Glosario Técnico Actualizado</h3>
              <ul className="space-y-3">
                <li><strong>Esfuerzo de Von Mises:</strong> Criterio de falla que combina esfuerzos normales (flexión) y cortantes. Es el método más preciso para acero ductil.</li>
                <li><strong>Método de Macaulay:</strong> Técnica matemática basada en funciones de singularidad que permite resolver vigas con cualquier número de apoyos y cargas en una sola ecuación.</li>
                <li><strong>Wx / Ix:</strong> Módulo resistente e Inercia. El sistema calcula los mínimos requeridos y busca en la base de datos el perfil más ligero que cumpla ambos.</li>
                <li><strong>Factor de Seguridad (FS):</strong> Aplicado sobre el límite elástico (Fy). Un FS de 1.5 significa que el material trabajará al 66% de su capacidad.</li>
                <li><strong>Convención de Signos:</strong> Cargas hacia abajo (-), Momentos Horarios (-). Reacciones y deflexiones siguen la física real del sistema.</li>
              </ul>
            </div>
          )}

          {activeTab === 'importancia' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Integridad y Seguridad Estructural</h3>
              <p>Beam Selector Pro no solo busca un perfil que "aguante", sino que optimiza el diseño bajo dos estados límite:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Estado Límite de Resistencia:</strong> Evita la falla por fluencia o rotura. El software verifica flexión pura, corte y el estado combinado de Von Mises.</li>
                <li><strong>Estado Límite de Servicio (Deflexión):</strong> Controla que la viga no se "pandeé" excesivamente. Una viga puede ser resistente pero demasiado flexible, lo que causa daños en acabados o sensación de inseguridad.</li>
              </ul>
              <p className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-amber-800 italic">
                "La ingeniería es el arte de modelar materiales que no comprendemos del todo, en formas que no podemos analizar con precisión, para resistir fuerzas que no podemos predecir, de tal manera que el público no tenga motivos para sospechar de nuestra ignorancia."
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
