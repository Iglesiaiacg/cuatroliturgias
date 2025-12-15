import { useState } from 'react';

export default function OccasionalServicesView({ onNavigate, setDocContent }) {

    // Content Definitions
    const serviceContent = {
        "Antífonas para el Lucernario": `
            <div class="liturgy-content">
                <h1>Antífonas para el Lucernario</h1>
                <p class="rubric">Este rito se utiliza antes de la Oración Vespertina, especialmente en fiestas o domingos.</p>
                <p class="rubric">Se encienden las velas.</p>
                
                <p>Luz y paz en Jesucristo nuestro Señor.</p>
                <p><strong>Demos gracias a Dios.</strong></p>
                
                <h3>Luz Alegre (Phos Hilaron)</h3>
                <p>Oh Luz alegre del santo esplendor del Padre,<br>
                inmortal, celeste, santo, bendito,<br>
                Jesucristo.</p>
                
                <p>Habiendo llegado a la puesta del sol,<br>
                y viendo la luz de la tarde,<br>
                cantamos a Dios: Padre, Hijo, y Espíritu Santo.</p>
                
                <p>Digno eres en todo momento<br>
                de ser alabado con voces propicias,<br>
                Hijo de Dios, Dador de la vida;<br>
                por tanto el mundo te glorifica.</p>

                <p class="rubric">A continuación puede seguir un himno o salmo de lucernario apropiado, como el Salmo 141.</p>
                
                <h3>Salmo 141</h3>
                <p>Señor, a ti clamo; apresúrate a mí; *<br>
                <strong>escucha mi voz cuando te invoco.</strong></p>
                <p>Suba mi oración delante de ti como el incienso, *<br>
                <strong>el don de mis manos como la ofrenda de la tarde.</strong></p>
                
                <p class="rubric">Se concluye con la Oración.</p>
                
                <p>Oremos.</p>
                <p>Señor Jesucristo, mientras este día se apaga en el anochecer, te pedimos que la luz de tu verdad disipe las tinieblas de nuestros corazones; tú que eres la Luz del mundo, y vives y reinas con el Dios Padre y el Espíritu Santo, un solo Dios, por los siglos de los siglos. <strong>Amén.</strong></p>
            </div>
        `
    };

    const handleServiceClick = (item) => {
        if (serviceContent[item.title]) {
            if (setDocContent) {
                setDocContent(serviceContent[item.title]);
                onNavigate('generator');
            }
        } else {
            // Optional: fallback or toast for items not yet implemented
            console.log("Contenido no disponible para:", item.title);
        }
    };

    const services = [
        {
            category: "El Año Litúrgico",
            items: [
                { title: "Antífonas para el Lucernario", description: "Oraciones al encender las velas." },
                { title: "Antífonas para la Fracción", description: "Cantos para la fracción del pan (Confractoria)." },
                { title: "Bendiciones Estacionales", description: "Bendiciones especiales para cada tiempo litúrgico." },
                { title: "Sobre la Corona de Adviento", description: "Rito para bendecir y encender la corona." },
                { title: "Festival de Lecciones y Música de Adviento", description: "Servicio de lecturas y cánticos de espera." },
                { title: "Vigilia de Nochebuena", description: "Celebración en la víspera de la Natividad." },
                { title: "Estación ante el Pesebre", description: "Devoción especial ante el nacimiento." },
                { title: "Festival de Lecciones y Música de Navidad", description: "Celebración festiva de la Encarnación." },
                { title: "Víspera de Año Nuevo", description: "Oración para recibir el año civil." },
                { title: "Bendición de Hogares (Epifanía)", description: "Tradicional bendición de casas con tiza." },
                { title: "Vigilia Bautismo del Señor", description: "Preparación para la renovación bautismal." },
                { title: "Procesión de la Candelaria", description: "Bendición de las velas y procesión." },
                { title: "El Vía Crucis", description: "Meditación sobre la Pasión del Señor." },
                { title: "Oficio de Tinieblas (Tenebrae)", description: "Liturgia solemne de sombras y luz." },
                { title: "Jueves Santo: Lavatorio", description: "Rito del mandato del amor fraterno." },
                { title: "Jueves Santo: Reserva", description: "Traslado y reserva del Santísimo." },
                { title: "Jueves Santo: Despojo", description: "Despojo del altar tras la misa." },
                { title: "Ágape de Jueves Santo", description: "Cena fraterna recordando la Última Cena." },
                { title: "Bendición de Alimentos (Pascua)", description: "Bendición de la mesa de Pascua." },
                { title: "Bendición de Hogares (Pascua)", description: "Bendición de casas en tiempo pascual." },
                { title: "Procesión de las Rogativas", description: "Súplicas por los frutos de la tierra." },
                { title: "Vigilia de Todos los Santos", description: "Preparación para la solemnidad." },
                { title: "Víspera de Todos los Santos", description: "Servicio de oración (Halloween)." }
            ]
        },
        {
            category: "Servicios Pastorales",
            items: [
                { title: "Bienvenida a Nuevos", description: "Acogida de nuevos miembros a la comunidad." },
                { title: "Despedida de Miembros", description: "Oración al dejar una congregación." },
                { title: "Catecumenado", description: "Preparación de adultos para el Bautismo." },
                { title: "Admisión de Catecúmenos", description: "Rito de entrada al catecumenado." },
                { title: "Inscripción de Candidatos", description: "Elección para el Bautismo." },
                { title: "Entrga del Credo / Padre Nuestro", description: "Ritos de transmisión de la fe." },
                { title: "Vigilia Bautismal", description: "Oración previa al Bautismo." },
                { title: "Reafirmación Votos", description: "Renovación de promesas bautismales." },
                { title: "Recepción de Miembros", description: "Acogida de otras tradiciones cristianas." },
                { title: "Inscripción Cuaresmal", description: "Inicio de la preparación final." },
                { title: "Rito Jueves Santo", description: "Preparación inmediata a los sacramentos." },
                { title: "Bendición de Casa", description: "Celebración y bendición para un hogar." },
                { title: "Bendición Embarazada", description: "Oración por la madre y el hijo." },
                { title: "Padres y Padrinos", description: "Preparación para el rol bautismal." },
                { title: "Aniversario Matrimonio", description: "Renovación de votos matrimoniales." },
                { title: "Servicio de Sanación", description: "Oración pública por la salud." },
                { title: "Sobre el Exorcismo", description: "Notas pastorales sobre liberación." },
                { title: "Entierro no cristiano", description: "Servicio fúnebre pastoral." },
                { title: "Comisionamiento Laicos", description: "Envío a ministerios específicos." },
                { title: "Dedicación Mobiliario", description: "Bendición de ornamentos y objetos." }
            ]
        },
        {
            category: "Misión Episcopal",
            items: [
                { title: "Discernimiento Misión", description: "Liturgia para buscar la voluntad de Dios." },
                { title: "Comisionamiento Plantador", description: "Envío para fundar nuevas iglesias." },
                { title: "Apertura Congregación", description: "Inicio oficial de una nueva misión." },
                { title: "Puesta aparte espacio", description: "Bendición de lugares de culto temporal." },
                { title: "Letanía por la Misión", description: "Súplicas por la expansión del Evangelio." }
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

            {/* Content grid */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">
                {services.map((section, idx) => (
                    <div key={idx} className="animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                        <h3 className="text-sm font-bold text-teal-700 dark:text-teal-400 uppercase tracking-widest mb-4 px-1 sticky top-0 bg-gray-50 dark:bg-background-dark z-10 py-2">
                            {section.category}
                        </h3>

                        {/* Responsive Grid: 1 col mobile, 2 col tablet, 4 col desktop */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                            {section.items.map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleServiceClick(item)}
                                    className="relative flex flex-col p-5 bg-white dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all text-left group h-full"
                                >
                                    <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors text-teal-600 dark:text-teal-400">
                                        <span className="material-symbols-outlined text-[24px]">church</span>
                                    </div>

                                    <h4 className="font-bold text-gray-900 dark:text-white font-display leading-tight mb-2 group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h4>

                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                                        {item.description}
                                    </p>

                                    <div className="mt-auto pt-4 flex items-center text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                                        VER DETALLES <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="px-4 py-8 text-center bg-gray-100 dark:bg-white/5 rounded-xl mx-auto max-w-2xl mt-8">
                    <p className="text-xs text-gray-400 italic">
                        Basado en "The Book of Occasional Services 2003".<br />
                        Los textos completos estarán disponibles próximamente.
                    </p>
                </div>
            </div>
        </main>
    );
}
