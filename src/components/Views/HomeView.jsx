import StyledCard from '../Common/StyledCard';
import SacristyChecklist from '../Dashboard/SacristyChecklist';

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

            {/* Quick Access Grid */}
            <section>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display">Accesos Rápidos</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Liturgia */}
                    <StyledCard
                        title="Liturgia"
                        description="Guía de la celebración"
                        icon="menu_book"
                        onClick={() => onNavigate('generator')}
                        actionText="Abrir"
                    />



                    {/* Card 4: Servicios Ocasionales */}
                    <StyledCard
                        title="Servicios Ocasionales"
                        description="Libro de Servicios 2003"
                        icon="church"
                        onClick={() => onNavigate('occasional')}
                        actionText="Abrir"
                    />
                </div>
            </section>
        </main>
    );
}
