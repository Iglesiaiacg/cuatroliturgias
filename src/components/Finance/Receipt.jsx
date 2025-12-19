import { forwardRef } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { numberToWords } from '../../utils/numberToWords';

import { FINANCE_CATEGORIES } from '../../utils/financeCategories';

const Receipt = forwardRef(({ data }, ref) => {
    if (!data) return null;

    const currentCategories = FINANCE_CATEGORIES[data.type] || [];

    return (
        <div ref={ref} className="bg-white p-8 w-[800px] h-[500px] flex items-center justify-center">
            {/* Outline Box */}
            <div className="border-4 border-black w-full h-full p-8 relative flex flex-col justify-between">

                {/* Header */}
                <h1 className="text-3xl font-bold text-center mb-6 uppercase tracking-wider">Recibo</h1>

                {/* Top Row: Recibido de & Fecha */}
                <div className="flex justify-between items-end mb-6 relative">
                    <div className="flex-1 flex gap-2 items-end">
                        <span className="font-bold text-lg whitespace-nowrap">Recibido de:</span>
                        <div className="flex-1 border-b-2 border-black px-2 font-handwriting text-xl">
                            {data.beneficiary || "_________________"}
                        </div>
                    </div>
                    <div className="w-1/3 flex gap-2 items-end ml-4">
                        <span className="font-bold text-lg whitespace-nowrap">Fecha:</span>
                        <div className="flex-1 border-b-2 border-black px-2 text-center font-handwriting text-xl">
                            {format(new Date(data.date), "dd/MMM/yyyy", { locale: es })}
                        </div>
                    </div>
                </div>

                {/* Conceptos Grid */}
                <div className="mb-4">
                    <span className="font-bold text-sm uppercase mb-2 block">Concepto:</span>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                        {currentCategories.map(cat => (
                            <div key={cat.id} className="flex items-center gap-2">
                                <div className={`w-4 h-4 border-2 border-black flex items-center justify-center ${data.category === cat.id ? 'bg-black' : ''}`}>
                                    {data.category === cat.id && <span className="text-white font-bold text-xs">✓</span>}
                                </div>
                                <span className={data.category === cat.id ? 'font-bold' : ''}>{cat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Concept & Amount Section */}
                <div className="flex-1 mb-4 flex flex-col justify-start gap-4">
                    {/* Row 1 (Data) */}
                    <div className="flex gap-4 items-end">
                        <div className="flex-1 border-b-2 border-black pb-1 px-4 font-handwriting text-2xl relative">
                            <span className="text-gray-900">{data.description}</span>
                        </div>
                        <div className="w-1/4 border-b-2 border-black pb-1 text-right pr-2 font-mono text-xl font-bold" style={{ color: '#991b1b' }}>
                            ${data.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </div>
                    </div>

                    {/* Row 2 (Empty/Placeholder) */}
                    <div className="flex gap-4 items-end">
                        <div className="flex-1 border-b-2 border-black h-8"></div>
                        <div className="w-1/4 border-b-2 border-black h-8"></div>
                    </div>
                </div>

                {/* Total & Words */}
                <div className="flex justify-end gap-2 items-end mb-2">
                    <span className="font-bold text-lg">TOTAL</span>
                    <div className="w-1/4 border-b-2 border-black text-right pr-2 font-mono text-xl font-bold" style={{ color: '#991b1b' }}>
                        ${data.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </div>
                </div>
                <div className="text-right text-sm font-medium pr-2 mb-8 uppercase">
                    {numberToWords(data.amount)}
                </div>

                {/* Footer / Signature */}
                <div className="flex flex-col items-center justify-center mt-auto relative">
                    {/* Signature Line */}
                    <div className="w-1/2 border-b-2 border-black mb-2 relative">
                        {/* Fake Signature Image or Text */}
                        <div className="absolute bottom-1 left-10 font-handwriting text-4xl text-blue-900 -rotate-3 opacity-80">
                            Firma Autorizada
                        </div>
                    </div>
                    <span className="font-bold text-sm">(Firma y Nombre)</span>

                    <p className="text-[10px] text-center mt-4 max-w-2xl leading-tight">
                        Este recibo debe llenarse por duplicado. El tesorero recibirá el original y el dinero, y quien verifique el recibo entregará la copia a la secretaria. Iglesia Anglicana Comunidad de Gracia
                    </p>
                </div>

                {/* Address Footer */}
                <div className="absolute bottom-1 left-8 right-8 text-[9px] text-gray-600 text-center">
                    Iglesia Anglicana Comunidad de Gracia. Calle Benito Quijano, Xalapa, Mexico, 91064, Ver. Tel. 2281215962. Correo electrónico: iacgmx@gmail.com
                </div>

            </div>
        </div>
    );
});

export default Receipt;
