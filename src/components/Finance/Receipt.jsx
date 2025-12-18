import { forwardRef } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { numberToWords } from '../../utils/numberToWords';

const Receipt = forwardRef(({ data }, ref) => {
    if (!data) return null;

    return (
        <div ref={ref} className="bg-white p-8 w-[800px] h-[500px] flex items-center justify-center">
            {/* Outline Box */}
            <div className="border-4 border-black w-full h-full p-8 relative flex flex-col justify-between">

                {/* Header */}
                <h1 className="text-3xl font-bold text-center mb-6 uppercase tracking-wider">Recibo</h1>

                {/* Top Row: Recibido de & Fecha */}
                <div className="flex justify-between items-end mb-8 relative">
                    <div className="flex-1 flex gap-2 items-end">
                        <span className="font-bold text-lg whitespace-nowrap">Recibido de:</span>
                        <div className="flex-1 border-b-2 border-black px-2 font-handwriting text-xl">
                            {/* If it's an expense, we pay TO someone, but standard receipt says "Recibido de" implies incoming. 
                                For expense, maybe "Pagado a"? 
                                User asked for "Recibo" so we stick to the format provided.
                                We will put the 'beneficiary' here. */}
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

                {/* Concept & Amount Section */}
                <div className="flex gap-4 flex-1 mb-4">
                    {/* Left: Concept */}
                    <div className="flex-1 flex flex-col gap-2">
                        <div className="font-handwriting text-2xl leading-relaxed pl-8 pt-4">
                            {data.description}
                        </div>
                        <div className="font-handwriting text-lg text-gray-600 pl-12">
                            - P. Roger Griffin
                        </div>
                    </div>

                    {/* Right: Amount Column */}
                    <div className="w-1/4 flex flex-col justify-start pt-4 gap-4">
                        <div className="border-b-2 border-black text-right pr-2 font-mono text-xl font-bold">
                            ${data.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="border-b-2 border-black h-8"></div>
                        <div className="border-b-2 border-black h-8"></div>
                    </div>
                </div>

                {/* Total & Words */}
                <div className="flex justify-end gap-2 items-end mb-2">
                    <span className="font-bold text-lg">TOTAL</span>
                    <div className="w-1/4 border-b-2 border-black text-right pr-2 font-mono text-xl font-bold">
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
