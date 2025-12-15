import { useState } from 'react';

export default function OccasionalServicesView({ onNavigate }) {
    const services = [
        {
            category: "El Año Litúrgico",
            items: [
                "Antífonas para el Lucernario (Al encender las velas)",
                "Antífonas para la Fracción del Pan (Confractoria)",
                "Bendiciones Estacionales",
                "Sobre la Corona de Adviento",
                "Festival de Lecciones y Música de Adviento",
                "Vigilia de Nochebuena",
                "Estación ante el Pesebre de Navidad",
                "Festival de Lecciones y Música de Navidad",
                "Servicio para la Víspera de Año Nuevo",
                "Bendición de los Hogares en la Epifanía",
                "Vigilia para la Víspera del Bautismo de Nuestro Señor",
                "Procesión de la Candelaria",
                "El Vía Crucis",
                "Oficio de Tinieblas (Tenebrae)",
                "Jueves Santo: El Lavatorio de Pies",
                "Jueves Santo: Reserva del Sacramento",
                "Jueves Santo: Despojo del Altar",
                "Ágape para el Jueves Santo",
                "Bendición de los Alimentos en Pascua",
                "Bendición de los Hogares en Pascua",
                "Procesión de las Rogativas",
                "Vigilia para la Víspera de Todos los Santos",
                "Servicio para la Víspera de Todos los Santos (Halloween)"
            ]
        },
        {
            category: "Servicios Pastorales",
            items: [
                "Bienvenida a Nuevas Personas en la Congregación",
                "Cuando Miembros Dejan una Congregación",
                "Preparación de Adultos para el Santo Bautismo (Catecumenado)",
                "Rito de Admisión de Catecúmenos",
                "Inscripción de Candidatos para el Bautismo",
                "Presentación del Credo / Padre Nuestro",
                "Vigilia en la Víspera del Bautismo",
                "Reafirmación de los Votos Bautismales",
                "Bienvenida a Miembros que Regresan o de Otras Tradiciones",
                "Inscripción para la Preparación Cuaresmal",
                "Rito de Preparación del Jueves Santo",
                "Celebración para un Hogar (Bendición de Casa)",
                "Bendición de una Mujer Embarazada",
                "Preparación de Padres y Padrinos",
                "Aniversario de Matrimonio",
                "Servicio Público de Sanación",
                "Sobre el Exorcismo",
                "Entierro de quien no profesa la fe cristiana",
                "Comisionamiento para Ministerios Laicos",
                "Dedicación de Mobiliario y Ornamentos de la Iglesia"
            ]
        },
        {
            category: "Misión Episcopal",
            items: [
                "Liturgia para el Discernimiento de una Nueva Misión",
                "Comisionamiento de un Plantador de Iglesias",
                "Apertura de una Nueva Congregación",
                "Puesta aparte de un espacio secular para uso sagrado",
                "Letanía por la Misión de la Iglesia"
            ]
        }
    ];

    return (
        <main className="flex-1 flex flex-col w-full h-full bg-gray-50 dark:bg-background-dark animate-fade-in pb-24 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-white/5 shrink-0 z-10 shadow-sm">
                <button
                    onClick={() => onNavigate('dashboard')}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-colors -ml-2"
                >
                    <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">arrow_back</span>
                </button>
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display leading-none">Servicios Ocasionales</h2>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Libro de Servicios Ocasionales 2003</span>
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {services.map((section, idx) => (
                    <div key={idx} className="animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                        <h3 className="text-sm font-bold text-teal-700 dark:text-teal-400 uppercase tracking-widest mb-3 px-2">
                            {section.category}
                        </h3>
                        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden divide-y divide-gray-50 dark:divide-white/5">
                            {section.items.map((item, i) => (
                                <button
                                    key={i}
                                    className="w-full text-left px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between group"
                                >
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-primary transition-colors pr-4">
                                        {item}
                                    </span>
                                    <span className="material-symbols-outlined text-gray-300 group-hover:text-primary/50 text-[20px]">chevron_right</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="px-4 py-8 text-center">
                    <p className="text-xs text-gray-400 italic">
                        Basado en "The Book of Occasional Services 2003".<br />
                        Los textos completos estarán disponibles próximamente.
                    </p>
                </div>
            </div>
        </main>
    );
}
