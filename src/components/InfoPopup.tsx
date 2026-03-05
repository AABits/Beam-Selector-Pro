import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

export default function InfoPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'instrucciones' | 'parametros' | 'importancia'>('instrucciones');

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-12 h-12 bg-amber-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-amber-600 transition-colors z-50"
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
                <li><strong>Base de Datos:</strong> Primero, asegúrate de tener los perfiles y materiales que necesitas en la pestaña "Base de Datos". Puedes agregar nuevos tipos de vigas (ej. HEB, IPE, UPN) y sus respectivos perfiles con sus propiedades geométricas.</li>
                <li><strong>Selección de Material:</strong> En la pestaña "Cálculo", elige el material de la viga. Esto definirá el límite de fluencia (fy) y el módulo de elasticidad (E).</li>
                <li><strong>Condiciones de Apoyo y Carga:</strong> Selecciona cómo está apoyada la viga y qué tipo de carga soporta. Ingresa la longitud de la viga y la magnitud de la carga.</li>
                <li><strong>Unidades:</strong> Puedes mezclar unidades. Por ejemplo, la longitud en metros (m) y la carga en kilogramos masa (kg). El sistema realizará las conversiones automáticamente.</li>
                <li><strong>Calcular:</strong> Haz clic en "Calcular". El software filtrará los perfiles que cumplen con los requisitos de resistencia (Momento Flector) y rigidez (Deflexión), ordenándolos del más ligero al más pesado.</li>
              </ol>
            </div>
          )}

          {activeTab === 'parametros' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Glosario de Parámetros</h3>
              <ul className="space-y-3">
                <li><strong>fy (Límite de Fluencia):</strong> Esfuerzo a partir del cual el material comienza a deformarse plásticamente (permanentemente). Unidades comunes: MPa, psi.</li>
                <li><strong>E (Módulo de Elasticidad):</strong> Medida de la rigidez del material. Para el acero suele ser ~200 GPa.</li>
                <li><strong>Wx (Módulo Resistente):</strong> Propiedad geométrica de la sección transversal usada para calcular esfuerzos por flexión. Unidades: cm³.</li>
                <li><strong>Ix (Momento de Inercia):</strong> Propiedad geométrica que indica la resistencia de la sección a curvarse (deflexión). Unidades: cm⁴.</li>
                <li><strong>Factor de Seguridad (FS):</strong> Coeficiente que reduce el esfuerzo permisible (f_perm = fy / FS) para garantizar que la estructura trabaje en un rango seguro, lejos de la falla.</li>
                <li><strong>kgf vs kg:</strong> Se hace la distinción explícita de "kgf" (kilogramo-fuerza) para cargas, ya que el "kg" es unidad de masa. 1 kgf ≈ 9.81 N. Si ingresas "kg" o "lb", el sistema lo asume como masa y lo multiplica por la gravedad para obtener la fuerza real.</li>
              </ul>
            </div>
          )}

          {activeTab === 'importancia' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Importancia del Cálculo Estructural</h3>
              <p>El diseño de vigas se rige por dos criterios fundamentales que este software evalúa simultáneamente:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Criterio de Resistencia (Estado Límite Último):</strong> Garantiza que la viga no se rompa ni sufra deformaciones permanentes bajo la carga máxima. Se verifica asegurando que el esfuerzo actuante sea menor al esfuerzo permisible (fy / FS). Esto se traduce en requerir un Módulo Resistente (Wx) mínimo.</li>
                <li><strong>Criterio de Rigidez (Estado Límite de Servicio):</strong> Garantiza que la viga no se flexione (pandee) excesivamente, lo cual podría dañar acabados (como cielos rasos o vidrios) o causar incomodidad a los usuarios. Se verifica limitando la deflexión máxima a un valor fraccionario de la longitud (ej. L/250). Esto requiere un Momento de Inercia (Ix) mínimo.</li>
              </ul>
              <p>El software selecciona el perfil <strong>más ligero</strong> que cumple con ambos criterios, optimizando así el costo del material sin comprometer la seguridad.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
