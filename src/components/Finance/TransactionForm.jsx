import { useRef, useEffect } from 'react';
import { FINANCE_CATEGORIES as categories } from '../../utils/financeCategories';

export default function TransactionForm({ formData, onChange, onSubmit, onCancel, loading }) {
    const formRef = useRef(null);

    // Auto-scroll to form on mount
    useEffect(() => {
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }, []);

    return (
        <div className="lg:col-span-2 animate-slide-in">
            <form
                ref={formRef}
                onSubmit={onSubmit}
                className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-6xl text-primary">post_add</span>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                        Registrar Movimiento
                    </h3>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                        <span className="material-symbols-outlined text-gray-500">close</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Type */}
                    <div>
                        <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Tipo de Movimiento</label>
                        <div className="flex gap-4">
                            <label className={`flex-1 cursor-pointer relative overflow-hidden rounded-xl border-2 transition-all p-3 text-center ${formData.type === 'income' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'border-gray-200 dark:border-gray-700 hover:border-green-200'}`}>
                                <input
                                    type="radio"
                                    name="type"
                                    value="income"
                                    checked={formData.type === 'income'}
                                    onChange={onChange}
                                    className="hidden"
                                />
                                <div className="relative z-10 flex flex-col items-center gap-1">
                                    <span className="material-symbols-outlined">arrow_upward</span>
                                    <span className="font-bold text-sm">Ingreso</span>
                                </div>
                            </label>
                            <label className={`flex-1 cursor-pointer relative overflow-hidden rounded-xl border-2 transition-all p-3 text-center ${formData.type === 'expense' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'border-gray-200 dark:border-gray-700 hover:border-red-200'}`}>
                                <input
                                    type="radio"
                                    name="type"
                                    value="expense"
                                    checked={formData.type === 'expense'}
                                    onChange={onChange}
                                    className="hidden"
                                />
                                <div className="relative z-10 flex flex-col items-center gap-1">
                                    <span className="material-symbols-outlined">arrow_downward</span>
                                    <span className="font-bold text-sm">Egreso</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Monto</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={onChange}
                                className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono font-bold text-lg"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Concepto / Categoría</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={onChange}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none"
                            required
                        >
                            <option value="" disabled>Seleccionar Categoría</option>
                            {categories[formData.type].map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Fecha</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={onChange}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                        <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Notas / Descripción (Opcional)</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={onChange}
                            rows="2"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                            placeholder="Detalles adicionales..."
                        ></textarea>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary px-8"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">save</span>
                                Guardar
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
