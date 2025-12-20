import { useState } from 'react';
import { getApiKey, saveApiKey } from '../../services/storage';

export default function SettingsModal({ isOpen, onClose }) {
    const [key, setKey] = useState(() => getApiKey());
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        saveApiKey(key.trim());
        setSaved(true);
        setTimeout(() => onClose(), 1000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 p-6 animate-scale-in">

                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    ⚙️ Configuración
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Google Gemini API Key</label>
                        <input
                            type="password"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="Pega tu llave aquí (AIza...)"
                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all font-mono"
                        />
                        <p className="text-[10px] text-gray-400 mt-2">
                            Tu llave se guarda de forma segura en tu navegador.
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary hover:underline ml-1 font-bold">
                                Obtener llave gratis aquí →
                            </a>
                        </p>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-bold text-sm">Cancelar</button>
                        <button
                            onClick={handleSave}
                            disabled={!key}
                            className={`px-6 py-2 rounded-lg font-bold text-sm text-white transition-all shadow-lg transform active:scale-95 ${saved ? 'bg-green-500' : 'bg-gray-900 hover:bg-black'}`}
                        >
                            {saved ? '¡Guardado!' : 'Guardar Llave'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
