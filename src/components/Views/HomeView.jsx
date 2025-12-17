import StyledCard from '../Common/StyledCard';

export default function Dashboard({ onNavigate, date, feastName }) {
    return (
        <main className="flex-1 flex flex-col px-4 pt-6 space-y-8 overflow-y-auto w-full max-w-7xl mx-auto animate-fade-in">


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

                    {/* Card 2: Liturgia Horas */}
                    <StyledCard
                        title="Liturgia Horas"
                        description="Laudes y Vísperas"
                        icon="schedule"
                        onClick={() => { }}
                        actionText="Próximamente"
                    />

                    {/* Card 3: Santoral */}
                    <StyledCard
                        title="Santoral"
                        description="Vida de Santos"
                        icon="diversity_3"
                        onClick={() => { }}
                        actionText="Próximamente"
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
