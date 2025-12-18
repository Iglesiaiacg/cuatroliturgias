import StyledCard from '../Common/StyledCard';
import SacristyChecklist from '../Dashboard/SacristyChecklist';
import NextLiturgyCard from '../Dashboard/NextLiturgyCard';
import FinanceCard from '../Dashboard/FinanceCard';
import RolesCard from '../Dashboard/RolesCard';
import IntentionsCard from '../Dashboard/IntentionsCard';
import InventoryCard from '../Dashboard/InventoryCard';

export default function Dashboard({ onNavigate, date }) {
    return (
        <main className="flex-1 flex flex-col px-4 pt-6 space-y-8 overflow-y-auto w-full max-w-7xl mx-auto animate-fade-in">


            {/* Greeting Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
                    {(() => {
                        const hour = new Date().getHours();
                        if (hour < 12) return "Buenos días";
                        if (hour < 20) return "Buenas tardes";
                        return "Buenas noches";
                    })()},
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    {date ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'full' }).format(date) : 'Bienvenido'}
                </p>
            </div>

            {/* Sacristy Digital Checklist */}
            <section className="mb-2">
                <SacristyChecklist date={date} />
            </section>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">

                {/* Column 1: Priority (Next Liturgy & Actions) */}
                <div className="space-y-6">
                    <section>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Próxima Celebración</h3>
                        <NextLiturgyCard onClick={() => onNavigate('generator')} />
                    </section>

                    <section>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Accesos</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <StyledCard
                                title="Liturgia"
                                description="Generador"
                                icon="menu_book"
                                onClick={() => onNavigate('generator')}
                                actionText="Ir"
                                compact={true}
                            />
                            <StyledCard
                                title="Servicios"
                                description="Ocasionales"
                                icon="church"
                                onClick={() => onNavigate('occasional')}
                                actionText="Ir"
                                compact={true}
                            />
                        </div>
                    </section>
                </div>

                {/* Column 2: Management */}
                <div className="space-y-6">
                    <section>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Gestión</h3>
                        <RolesCard />
                    </section>
                    <section>
                        <IntentionsCard />
                    </section>
                </div>

                {/* Column 3: Finance & Checklist */}
                <div className="space-y-6">
                    <section>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Finanzas</h3>
                        <FinanceCard />
                    </section>
                    <section>
                        <InventoryCard />
                    </section>
                    <section>
                        <SacristyChecklist date={date} />
                    </section>
                </div>

            </div>
        </main>
    );
}
