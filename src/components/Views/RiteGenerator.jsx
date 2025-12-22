
import { useState } from 'react';

export default function RiteGenerator({ rite, onGenerate, onCancel }) {
    // Initialize form state with empty values (or defaults from rite definition if we had them)
    const [formData, setFormData] = useState({});

    const handleChange = (id, value) => {
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = () => {
        const content = rite.generate(formData);
        onGenerate(content, rite.title);
    };

    return (
        <div className="max-w-2xl mx-auto p-6 neumorphic-card animate-fade-in relative">
            <button
                onClick={onCancel}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
                <span className="material-symbols-outlined">close</span>
            </button>

            <div className="text-center mb-8">
                <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                    Generador Sacramental
                </span>
                <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mt-4">{rite.title}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">{rite.description}</p>
            </div>

            <div className="space-y-6">
                {rite.inputs.map(input => (
                    <div key={input.id} className="flex flex-col gap-2">
                        <label htmlFor={input.id} className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            {input.label}
                        </label>
                        {input.type === 'date' ? (
                            <input
                                type="date"
                                id={input.id}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-gray-900 dark:text-white"
                                onChange={(e) => handleChange(input.id, e.target.value)}
                            />
                        ) : (
                            <input
                                type="text"
                                id={input.id}
                                placeholder={input.placeholder}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                                onChange={(e) => handleChange(input.id, e.target.value)}
                            />
                        )}
                    </div>
                ))}

                <button
                    onClick={handleSubmit}
                    className="w-full py-3 bg-primary hover:bg-red-800 text-white font-bold rounded-lg shadow-lg hover:shadow-primary/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-8"
                >
                    <span className="material-symbols-outlined">auto_awesome</span>
                    Generar Rito Personalizado
                </button>
            </div>
        </div>
    );
}
