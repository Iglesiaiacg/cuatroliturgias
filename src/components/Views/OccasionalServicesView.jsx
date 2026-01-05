import { useState } from 'react';
import StyledCard from '../Common/StyledCard';
import RiteGenerator from './RiteGenerator';
import { baptismRite } from '../../utils/rites/baptism';
import { marriageRite } from '../../utils/rites/marriage';
import { serviceContent } from '../../data/occasionalServicesData';

export default function OccasionalServicesView({ onNavigate, setDocContent, setServiceTitle }) {
    const [activeGenerator, setActiveGenerator] = useState(null);

    const handleGeneratorSubmit = (content, title) => {
        setDocContent(content);
        setServiceTitle(title);
        onNavigate('generator'); // Or wherever we view the result
        // Note: The parent App.jsx logic for 'generator' tab might need to know to show the doc immediately.
        // In App.jsx, if docContent is set, it shows preview.
    };

    const handleServiceClick = (item) => {
        if (item.type === 'generator') {
            setActiveGenerator(item.riteId);
            return;
        }

        if (serviceContent[item.title]) {
            if (setDocContent) {
                setDocContent(serviceContent[item.title]);
                if (setServiceTitle) setServiceTitle(item.title);
                onNavigate('generator');
            }
        } else {

        }
    };

    const services = [
        {
            category: "Sacramentos Mayores (Generadores)",
            items: [
                { title: "Santo Bautismo", description: "Generador de rito bautismal personalizado.", icon: "water_drop", type: 'generator', riteId: 'baptism' },
                { title: "Santo Matrimonio", description: "Generador de rito matrimonial personalizado.", icon: "favorite", type: 'generator', riteId: 'marriage' }
            ]
        },
        {
            category: "Liturgia Diaria",
            items: [
                { title: "Liturgia Horas", description: "Laudes y Vísperas", icon: "schedule" },
                { title: "Santoral", description: "Vida de Santos", icon: "diversity_3" }
            ]
        },
        {
            category: "El Año Litúrgico",
            items: [
                { title: "Antífonas para el Lucernario", description: "Oraciones al encender las velas.", icon: "light_mode" },
                { title: "Antífonas para la Fracción", description: "Cantos para la fracción del pan (Confractoria).", icon: "bakery_dining" },
                { title: "Bendiciones Estacionales", description: "Bendiciones especiales para cada tiempo litúrgico.", icon: "calendar_month" },
                { title: "Sobre la Corona de Adviento", description: "Rito para bendecir y encender la corona.", icon: "candle" },
                { title: "Festival de Lecciones y Música de Adviento", description: "Servicio de lecturas y cánticos de espera.", icon: "library_music" },
                { title: "Vigilia de Nochebuena", description: "Celebración en la víspera de la Natividad.", icon: "bedtime" },
                { title: "Estación ante el Pesebre", description: "Devoción especial ante el nacimiento.", icon: "child_care" },
                { title: "Festival de Lecciones y Música de Navidad", description: "Celebración festiva de la Encarnación.", icon: "music_note" },
                { title: "Víspera de Año Nuevo", description: "Oración para recibir el año civil.", icon: "hourglass_empty" },
                { title: "Bendición de Hogares (Epifanía)", description: "Tradicional bendición de casas con tiza.", icon: "home_work" },
                { title: "Vigilia Bautismo del Señor", description: "Preparación para la renovación bautismal.", icon: "water_drop" },
                { title: "Procesión de la Candelaria", description: "Bendición de las velas y procesión.", icon: "candle" },
                { title: "El Vía Crucis", description: "Meditación sobre la Pasión del Señor.", icon: "conversion_path" },
                { title: "Oficio de Tinieblas (Tenebrae)", description: "Liturgia solemne de sombras y luz.", icon: "dark_mode" },
                { title: "Jueves Santo: Lavatorio", description: "Rito del mandato del amor fraterno.", icon: "wash" },
                { title: "Jueves Santo: Reserva", description: "Traslado y reserva del Santísimo.", icon: "inventory_2" },
                { title: "Jueves Santo: Despojo", description: "Despojo del altar tras la misa.", icon: "layers_clear" },
                { title: "Ágape de Jueves Santo", description: "Cena fraterna recordando la Última Cena.", icon: "restaurant" },
                { title: "Bendición de Alimentos (Pascua)", description: "Bendición de la mesa de Pascua.", icon: "restaurant_menu" },
                { title: "Bendición de Hogares (Pascua)", description: "Bendición de casas en tiempo pascual.", icon: "holiday_village" },
                { title: "Procesión de las Rogativas", description: "Súplicas por los frutos de la tierra.", icon: "agriculture" },
                { title: "Vigilia de Todos los Santos", description: "Preparación para la solemnidad.", icon: "groups" },
                { title: "Víspera de Todos los Santos", description: "Servicio de oración (Halloween).", icon: "face" }
            ]
        },
        {
            category: "Servicios Pastorales",
            items: [
                { title: "Bienvenida a Nuevos", description: "Acogida de nuevos miembros a la comunidad.", icon: "handshake" },
                { title: "Despedida de Miembros", description: "Oración al dejar una congregación.", icon: "waving_hand" },
                { title: "Catecumenado", description: "Preparación de adultos para el Bautismo.", icon: "school" },
                { title: "Admisión de Catecúmenos", description: "Rito de entrada al catecumenado.", icon: "how_to_reg" },
                { title: "Inscripción de Candidatos", description: "Elección para el Bautismo.", icon: "edit_document" },
                { title: "Entrega del Credo / Padre Nuestro", description: "Ritos de transmisión de la fe.", icon: "book" },
                { title: "Vigilia Bautismal", description: "Oración previa al Bautismo.", icon: "water" },
                { title: "Reafirmación Votos", description: "Renovación de promesas bautismales.", icon: "published_with_changes" },
                { title: "Recepción de Miembros", description: "Acogida de otras tradiciones cristianas.", icon: "door_front" },
                { title: "Inscripción Cuaresmal", description: "Inicio de la preparación final.", icon: "edit_calendar" },
                { title: "Rito Jueves Santo", description: "Preparación inmediata a los sacramentos.", icon: "event" },
                { title: "Bendición de Casa", description: "Celebración y bendición para un hogar.", icon: "doorbell" },
                { title: "Bendición Embarazada", description: "Oración por la madre y el hijo.", icon: "pregnant_woman" },
                { title: "Padres y Padrinos", description: "Preparación para el rol bautismal.", icon: "family_restroom" },
                { title: "Aniversario Matrimonio", description: "Renovación de votos matrimoniales.", icon: "favorite" },
                { title: "Servicio de Sanación", description: "Oración pública por la salud.", icon: "healing" },
                { title: "Sobre el Exorcismo", description: "Notas pastorales sobre liberación.", icon: "shield" },
                { title: "Entierro no cristiano", description: "Servicio fúnebre pastoral.", icon: "church" },
                { title: "Comisionamiento Laicos", description: "Envío a ministerios específicos.", icon: "badge" },
                { title: "Dedicación Mobiliario", description: "Bendición de ornamentos y objetos.", icon: "chair" }
            ]
        },
        {
            category: "Misión Episcopal",
            items: [
                { title: "Discernimiento Misión", description: "Liturgia para buscar la voluntad de Dios.", icon: "explore" },
                { title: "Comisionamiento Plantador", description: "Envío para fundar nuevas iglesias.", icon: "nature" },
                { title: "Apertura Congregación", description: "Inicio oficial de una nueva misión.", icon: "storefront" },
                { title: "Puesta aparte espacio", description: "Bendición de lugares de culto temporal.", icon: "architecture" },
                { title: "Letanía por la Misión", description: "Súplicas por la expansión del Evangelio.", icon: "campaign" }
            ]
        }
    ];

    return (
        <main className="flex-1 flex flex-col w-full h-full animate-fade-in overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 px-6 py-4 shrink-0 z-10">
                <button
                    onClick={() => onNavigate('dashboard')}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-colors -ml-2"
                >
                    <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">arrow_back</span>
                </button>
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display leading-none">Servicios Ocasionales</h2>
                    <span className="text-xs text-gray-600 dark:text-gray-500 mt-1">Libro de Servicios Ocasionales 2003</span>
                </div>
            </div>



            {/* Content grid or Active Generator */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">
                {activeGenerator ? (
                    <RiteGenerator
                        rite={activeGenerator === 'baptism' ? baptismRite : marriageRite}
                        onGenerate={handleGeneratorSubmit}
                        onCancel={() => setActiveGenerator(null)}
                    />
                ) : (
                    <>
                        {
                            services.map((section, idx) => (
                                <div key={idx} className="animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <h3 className="text-sm font-bold text-[var(--color-primary)] dark:text-red-400 uppercase tracking-widest mb-4 px-1 sticky top-0 bg-[var(--color-background-light)] dark:bg-background-dark z-10 py-2 border-b border-primary/10">
                                        {section.category}
                                    </h3>

                                    {/* Responsive Grid: 1 col mobile, 2 col tablet, 4 col desktop */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                                        {section.items.map((item, i) => (
                                            <StyledCard
                                                key={i}
                                                title={item.title}
                                                description={item.description}
                                                icon={item.icon || "church"}
                                                onClick={() => handleServiceClick(item)}
                                                actionText={item.type === 'generator' ? "Crear Rito" : "Ver Detalles"}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))
                        }

                        <div className="px-4 py-8 text-center bg-[var(--color-primary)]/5 dark:bg-white/5 rounded-xl mx-auto max-w-2xl mt-8 border border-[var(--color-primary)]/10">
                            <p className="text-xs text-gray-600 italic">
                                Basado en "The Book of Occasional Services 2003".<br />
                                Los textos completos estarán disponibles próximamente.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </main >
    );
}
