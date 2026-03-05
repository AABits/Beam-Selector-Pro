import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, Download } from 'lucide-react';
import type { BeamType, BeamProfile, Material } from '../types';

export const getBeamIcon = (name: string) => {
  const n = name.toUpperCase();
  if (n.includes('CUADRADO')) {
    return (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-600">
        <rect x="3" y="3" width="10" height="10" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    );
  }
  if (n.includes('RECTANGULAR')) {
    return (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-600">
        <rect x="2" y="4" width="12" height="8" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    );
  }
  if (n.includes('REDONDO')) {
    return (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-600">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    );
  }
  if (n.includes('IPE') || n.includes('IPN') || n.includes('HEA') || n.includes('HEB') || n.includes('W') || (n.includes('I') && !n.includes('MECANICO'))) {
    return (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-600">
        <path d="M3 2H13V4H9V12H13V14H3V12H7V4H3V2Z" fill="currentColor"/>
      </svg>
    );
  }
  if (n.includes('U') || n.includes('C') || n.includes('UPN')) {
    return (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-600">
        <path d="M12 2H4V14H12V12H7V4H12V2Z" fill="currentColor"/>
      </svg>
    );
  }
  if (n.includes('L')) {
    return (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-600">
        <path d="M4 2H7V11H14V14H4V2Z" fill="currentColor"/>
      </svg>
    );
  }
  if (n.includes('T')) {
    return (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-600">
        <path d="M2 2H14V5H9.5V14H6.5V5H2V2Z" fill="currentColor"/>
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-600">
      <path d="M2 2H14V14H2V2ZM5 5V11H11V5H5Z" fill="currentColor"/>
    </svg>
  );
};

export default function DatabaseTab() {
  const [activeTab, setActiveTab] = useState<'beams' | 'materials'>('beams');
  
  const [beamTypes, setBeamTypes] = useState<BeamType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [profiles, setProfiles] = useState<BeamProfile[]>([]);
  
  const [newTypeName, setNewTypeName] = useState('');
  
  const [editingProfileId, setEditingProfileId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<BeamProfile>>({});

  // Materials state
  const [materials, setMaterials] = useState<Material[]>([]);
  const [newMaterialName, setNewMaterialName] = useState('');
  const [editingMaterialId, setEditingMaterialId] = useState<number | null>(null);
  const [editMaterialForm, setEditMaterialForm] = useState<Partial<Material>>({});

  useEffect(() => {
    fetchTypes();
    fetchMaterials();
  }, []);

  useEffect(() => {
    if (selectedTypeId && activeTab === 'beams') {
      fetchProfiles(selectedTypeId);
    } else {
      setProfiles([]);
    }
  }, [selectedTypeId, activeTab]);

  const fetchTypes = async () => {
    const res = await fetch('/api/beam-types');
    const data = await res.json();
    setBeamTypes(data.sort((a: BeamType, b: BeamType) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })));
    if (data.length > 0 && !selectedTypeId) {
      setSelectedTypeId(data[0].id);
    }
  };

  const fetchMaterials = async () => {
    const res = await fetch('/api/materials');
    const data = await res.json();
    setMaterials(data.sort((a: Material, b: Material) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })));
  };

  const fetchProfiles = async (typeId: number) => {
    const res = await fetch(`/api/beam-profiles?type_id=${typeId}`);
    const data = await res.json();
    setProfiles(data.sort((a: BeamProfile, b: BeamProfile) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })));
  };

  const handleAddType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    const res = await fetch('/api/beam-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTypeName.trim() }),
    });
    if (res.ok) {
      setNewTypeName('');
      fetchTypes();
    }
  };

  const handleDeleteType = async (id: number) => {
    if (!confirm('¿Estás seguro? Esto eliminará todos los perfiles de este tipo.')) return;
    const res = await fetch(`/api/beam-types/${id}`, { method: 'DELETE' });
    if (res.ok) {
      if (selectedTypeId === id) setSelectedTypeId(null);
      fetchTypes();
    }
  };

  const handleAddProfile = async () => {
    if (!selectedTypeId) return;
    const newProfile = {
      type_id: selectedTypeId,
      name: 'Nuevo Perfil',
      h: 0, b: 0, e: 0, e1: 0, a: 0, ix: 0, wx: 0, iy: 0, wy: 0, p: 0
    };
    const res = await fetch('/api/beam-profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProfile),
    });
    if (res.ok) {
      fetchProfiles(selectedTypeId);
    }
  };

  const handleEditProfile = (profile: BeamProfile) => {
    setEditingProfileId(profile.id);
    setEditForm(profile);
  };

  const handleSaveProfile = async () => {
    if (!editingProfileId) return;
    const res = await fetch(`/api/beam-profiles/${editingProfileId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      setEditingProfileId(null);
      if (selectedTypeId) fetchProfiles(selectedTypeId);
    }
  };

  const handleDeleteProfile = async (id: number) => {
    if (!confirm('¿Eliminar este perfil?')) return;
    try {
      const res = await fetch(`/api/beam-profiles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedTypeId) fetchProfiles(selectedTypeId);
      } else {
        const err = await res.json();
        alert(`Error al eliminar el perfil: ${err.error || 'Desconocido'}`);
      }
    } catch (e) {
      alert('Error de conexión al eliminar perfil');
    }
  };

  const handleEditMaterial = (material: Material) => {
    setEditingMaterialId(material.id);
    setEditMaterialForm(material);
  };

  const handleSaveMaterial = async () => {
    if (!editingMaterialId) return;
    const res = await fetch(`/api/materials/${editingMaterialId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editMaterialForm),
    });
    if (res.ok) {
      setEditingMaterialId(null);
      fetchMaterials();
    }
  };

  const handleDeleteMaterial = async (id: number) => {
    if (!confirm('¿Eliminar este material?')) return;
    try {
      const res = await fetch(`/api/materials/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchMaterials();
      } else {
        const err = await res.json();
        alert(`Error al eliminar el material: ${err.error || 'Desconocido'}`);
      }
    } catch (e) {
      alert('Error de conexión al eliminar material');
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/api/export');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `respaldo_vigas_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Error al exportar los datos');
    }
  };

  const currentTypeName = beamTypes.find(t => t.id === selectedTypeId)?.name.toUpperCase() || '';
  const isRound = currentTypeName.includes('REDONDO');
  const isTube = currentTypeName.includes('TUBO');

  return (
    <div className="flex h-full bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-2 border-b border-slate-200 dark:border-slate-700 flex gap-2">
          <button
            onClick={() => setActiveTab('beams')}
            className={`flex-1 py-1.5 text-sm font-medium rounded ${activeTab === 'beams' ? 'bg-white dark:bg-slate-800 shadow-sm text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
          >
            Vigas
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`flex-1 py-1.5 text-sm font-medium rounded ${activeTab === 'materials' ? 'bg-white dark:bg-slate-800 shadow-sm text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
          >
            Materiales
          </button>
        </div>

        {activeTab === 'beams' && (
          <>
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Tipos de Viga</h2>
              <form onSubmit={handleAddType} className="flex gap-2">
                <input
                  type="text"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="ej. HEA"
                  className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button type="submit" className="p-1.5 bg-amber-500 text-white rounded hover:bg-amber-600">
                  <Plus size={18} />
                </button>
              </form>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {beamTypes.map(type => (
                <div
                  key={type.id}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer mb-1 ${
                    selectedTypeId === type.id ? 'bg-amber-100 text-amber-900' : 'hover:bg-slate-200 text-slate-700'
                  }`}
                  onClick={() => setSelectedTypeId(type.id)}
                >
                  <div className="flex items-center gap-2">
                    {getBeamIcon(type.name)}
                    <span className="font-medium text-sm">{type.name}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteType(type.id); }}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 mt-auto">
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Download size={16} /> Exportar Respaldo
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'materials' ? (
          <>
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
              <h2 className="text-lg font-semibold text-slate-800">
                Materiales
              </h2>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!newMaterialName.trim()) return;
                const res = await fetch('/api/materials', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: newMaterialName.trim(), fy: 250, e: 200 })
                });
                if (res.ok) {
                  fetchMaterials();
                  setNewMaterialName('');
                }
              }} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMaterialName}
                  onChange={e => setNewMaterialName(e.target.value)}
                  placeholder="Nombre del material..."
                  className="w-64 px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 text-white text-sm font-medium rounded hover:bg-amber-600"
                >
                  <Plus size={16} /> Agregar Material
                </button>
              </form>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-sm text-slate-600">
                    <th className="py-2 px-3 font-semibold">Nombre</th>
                    <th className="py-2 px-3 font-semibold">fy (MPa)</th>
                    <th className="py-2 px-3 font-semibold">E (GPa)</th>
                    <th className="py-2 px-3 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {materials.map(material => {
                    const isEditing = editingMaterialId === material.id;
                    return (
                      <tr key={material.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-2 px-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editMaterialForm.name || ''}
                              onChange={e => setEditMaterialForm({ ...editMaterialForm, name: e.target.value })}
                              className="w-full px-2 py-1 border rounded"
                            />
                          ) : (
                            <span className="font-medium text-slate-800">{material.name}</span>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editMaterialForm.fy || ''}
                              onChange={e => setEditMaterialForm({ ...editMaterialForm, fy: parseFloat(e.target.value) || 0 })}
                              className="w-24 px-2 py-1 border rounded"
                            />
                          ) : (
                            <span className="text-slate-600">{material.fy}</span>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editMaterialForm.e || ''}
                              onChange={e => setEditMaterialForm({ ...editMaterialForm, e: parseFloat(e.target.value) || 0 })}
                              className="w-24 px-2 py-1 border rounded"
                            />
                          ) : (
                            <span className="text-slate-600">{material.e}</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {isEditing ? (
                            <div className="flex justify-end gap-2">
                              <button onClick={handleSaveMaterial} className="text-emerald-600 hover:text-emerald-700">
                                <Save size={16} />
                              </button>
                              <button onClick={() => setEditingMaterialId(null)} className="text-slate-400 hover:text-slate-600">
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleEditMaterial(material)} className="text-amber-600 hover:text-amber-800">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => handleDeleteMaterial(material.id)} className="text-red-500 hover:text-red-700">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {materials.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">
                        No se encontraron materiales.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : selectedTypeId ? (
          <>
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
              <h2 className="text-lg font-semibold text-slate-800">
                Perfiles para {beamTypes.find(t => t.id === selectedTypeId)?.name}
              </h2>
              <button
                onClick={handleAddProfile}
                className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 text-white text-sm font-medium rounded hover:bg-amber-600"
              >
                <Plus size={16} /> Agregar Perfil
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-sm text-slate-600">
                    <th className="py-2 px-3 font-semibold">Nombre</th>
                    <th className="py-2 px-3 font-semibold">{isRound ? 'D (mm)' : 'h (mm)'}</th>
                    <th className="py-2 px-3 font-semibold">{isRound ? '-' : 'b (mm)'}</th>
                    <th className="py-2 px-3 font-semibold">{isTube ? 't (mm)' : 'e (mm)'}</th>
                    <th className="py-2 px-3 font-semibold">{isTube ? '-' : 'e1 (mm)'}</th>
                    <th className="py-2 px-3 font-semibold">A (cm²)</th>
                    <th className="py-2 px-3 font-semibold">Ix (cm⁴)</th>
                    <th className="py-2 px-3 font-semibold">Wx (cm³)</th>
                    <th className="py-2 px-3 font-semibold">Iy (cm⁴)</th>
                    <th className="py-2 px-3 font-semibold">Wy (cm³)</th>
                    <th className="py-2 px-3 font-semibold">p (kg/m)</th>
                    <th className="py-2 px-3 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {profiles.map(profile => {
                    const isEditing = editingProfileId === profile.id;
                    return (
                      <tr key={profile.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-2 px-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.name || ''}
                              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                              className="w-full px-2 py-1 border rounded"
                            />
                          ) : (
                            <span className="font-medium text-slate-800">{profile.name}</span>
                          )}
                        </td>
                        {['h', 'b', 'e', 'e1', 'a', 'ix', 'wx', 'iy', 'wy', 'p'].map((field) => {
                          const isDisabled = (isRound && field === 'b') || (isTube && field === 'e1');
                          return (
                            <td key={field} className="py-2 px-3">
                              {isEditing ? (
                                !isDisabled ? (
                                  <input
                                    type="number"
                                    value={editForm[field as keyof BeamProfile] || ''}
                                    onChange={e => setEditForm({ ...editForm, [field]: parseFloat(e.target.value) || 0 })}
                                    className="w-16 px-2 py-1 border rounded"
                                  />
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )
                              ) : (
                                <span className="text-slate-600">{isDisabled ? '-' : profile[field as keyof BeamProfile]}</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="py-2 px-3 text-right">
                          {isEditing ? (
                            <div className="flex justify-end gap-2">
                              <button onClick={handleSaveProfile} className="text-emerald-600 hover:text-emerald-700">
                                <Save size={16} />
                              </button>
                              <button onClick={() => setEditingProfileId(null)} className="text-slate-400 hover:text-slate-600">
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleEditProfile(profile)} className="text-amber-600 hover:text-amber-800">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => handleDeleteProfile(profile.id)} className="text-red-500 hover:text-red-700">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {profiles.length === 0 && (
                    <tr>
                      <td colSpan={12} className="py-8 text-center text-slate-500">
                        No se encontraron perfiles. Agrega uno para comenzar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            Selecciona un tipo de viga para ver sus perfiles
          </div>
        )}
      </div>
    </div>
  );
}
