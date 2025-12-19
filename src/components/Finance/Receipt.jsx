import { forwardRef } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { numberToWords } from '../../utils/numberToWords';

import { FINANCE_CATEGORIES } from '../../utils/financeCategories';

const Receipt = forwardRef(({ data }, ref) => {
    if (!data) return null;

    const currentCategories = FINANCE_CATEGORIES[data.type] || [];

    return (
        <div ref={ref} className="bg-white p-8 w-[800px] h-[500px] flex items-center justify-center relative overflow-hidden">
            {/* Background Texture/Watermark */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center">
                <span className="material-symbols-outlined text-[400px]">church</span>
            </div>

            {/* Main Border Box */}
            <div className="w-full h-full border-4 border-double border-gray-800 p-8 relative flex flex-col justify-between z-10">

                {/* Header */}
                <div className="text-center mb-8 border-b border-gray-900 pb-4">
                    <h1 className="text-4xl font-display font-bold text-gray-900 uppercase tracking-widest mb-1">Recibo de Tesorería</h1>
                    <p className="text-sm font-serif italic text-gray-600">Iglesia Anglicana Comunidad de Gracia</p>
                </div>

                {/* Top Row: Date & No */}
                <div className="flex justify-between items-end mb-8 font-display">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Fecha de Emisión</span>
                        <div className="text-xl border-b border-gray-400 min-w-[200px] pb-1">
                            {format(new Date(data.date), "dd 'de' MMMM, yyyy", { locale: es })}
                        </div>
                    </div>
                    {data.eventId && (
                        <div className="flex flex-col text-right">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Evento Vinculado</span>
                            <div className="text-lg italic text-gray-800">
                                {data.eventTitle || 'Evento Litúrgico'}
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content Info */}
                <div className="grid grid-cols-12 gap-8 mb-4 font-display">
                    {/* Received From / Paid To */}
                    <div className="col-span-8 space-y-6">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                {data.type === 'income' ? 'Recibimos de' : 'Pagado a'}
                            </span>
                            <div className="text-2xl font-bold italic border-b border-gray-400 pb-1">
                                {data.beneficiary || "Anónimo / General"}
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">La cantidad de</span>
                            <div className="text-lg italic border-b border-gray-400 pb-1 capitalize">
                                {numberToWords(data.amount)}
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Por concepto de</span>
                            <div className="text-xl border-b border-gray-400 pb-1">
                                {data.description}
                            </div>
                        </div>
                    </div>

                    {/* Amount Box */}
                    <div className="col-span-4 flex flex-col justify-center items-center">
                        <div className="border-2 border-gray-800 p-4 rounded-lg w-full text-center bg-gray-50">
                            <span className="text-xs font-bold uppercase block mb-2 text-gray-500">Importe Total</span>
                            <span className="text-4xl font-mono font-bold text-gray-900">
                                ${data.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                        </div>

                        {/* Category Badge */}
                        <div className="mt-4 w-full flex justify-center">
                            {currentCategories.map(cat => (
                                data.category === cat.id && (
                                    <span key={cat.id} className="px-3 py-1 bg-gray-200 rounded-full text-xs font-bold uppercase tracking-wide border border-gray-300">
                                        {cat.label}
                                    </span>
                                )
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer / Signature using grid */}
                <div className="grid grid-cols-2 gap-12 mt-auto items-end">
                    <div className="text-[10px] text-gray-500 text-justify leading-tight">
                        Este documento es un comprobante interno de la Iglesia Anglicana Comunidad de Gracia.
                        Cualquier duda o aclaración favor de contactar a la tesorería.
                        <br />Xalapa, Veracruz.
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-full border-b border-gray-900 mb-2 relative h-12">
                            {/* Fake Signature */}
                            <div className="absolute bottom-1 left-10 font-handwriting text-3xl text-blue-900 -rotate-2 opacity-60">
                                Tesorería IACG
                            </div>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider">Firma Autorizada</span>
                    </div>
                </div>

            </div>
        </div>
    );
});

export default Receipt;
