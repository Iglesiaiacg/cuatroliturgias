import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import InventoryCard from '../Dashboard/InventoryCard';
import SacristyChecklist from '../Dashboard/SacristyChecklist';

export default function SacristyView({ date }) {
    return (
        <div className="flex-1 flex flex-col w-full h-full overflow-y-auto">
            <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
                        Sacristía
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Gestión de insumos y preparación para: <span className="font-bold text-primary">{format(date, "EEEE, d 'de' MMMM", { locale: es })}</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Checklist Section - Takes up 2 columns on large screens */}
                    <div className="lg:col-span-2 space-y-6">
                        <section>
                            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 ml-1">Preparación Litúrgica</h2>
                            <SacristyChecklist date={date} />
                        </section>
                    </div>

                    {/* Inventory Section - Takes up 1 column */}
                    <div className="space-y-6">
                        <section className="h-full">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 ml-1">Inventario</h2>
                            <InventoryCard />
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
