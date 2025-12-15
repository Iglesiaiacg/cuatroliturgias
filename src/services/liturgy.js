import { CONFIG } from './config';

export const getEasterDate = (year) => {
    const a = year % 19, b = Math.floor(year / 100), c = year % 100;
    const d = Math.floor(b / 4), e = b % 4;
    const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    return new Date(year, Math.floor((h + l - 7 * m + 114) / 31) - 1, ((h + l - 7 * m + 114) % 31) + 1);
};

export const getSeason = (date) => {
    const year = date.getFullYear();
    const pascua = getEasterDate(year);
    const ceniza = new Date(pascua); ceniza.setDate(pascua.getDate() - 46);
    const navidad = new Date(year, 11, 25);
    const adviento = new Date(year, 11, 25 - ((navidad.getDay() === 0 ? 28 : navidad.getDay() + 21)));

    if (date >= adviento && date < navidad) return 'adviento';
    if ((date >= navidad) || (date.getMonth() === 0 && date.getDate() < 13)) return 'navidad';
    if (date >= ceniza && date < pascua) {
        const diff = (pascua - date) / (1000 * 60 * 60 * 24);
        return diff <= 7 ? 'semana_santa' : 'cuaresma';
    }
    const pentecostes = new Date(pascua); pentecostes.setDate(pascua.getDate() + 49);
    if (date >= pascua && date <= pentecostes) {
        if (date.getTime() === pentecostes.getTime()) return 'pentecostes';
        return 'pascua';
    }
    return 'ordinario';
};

export const getLiturgicalCycle = (date) => {
    const year = date.getFullYear();
    const navidad = new Date(year, 11, 25);
    const diaNavidad = navidad.getDay();
    const diasRestar = (diaNavidad === 0) ? 28 : (diaNavidad + 21);
    const inicioAdviento = new Date(year, 11, 25 - diasRestar);

    let targetYear = date >= inicioAdviento ? year + 1 : year;

    const residuo = targetYear % 3;
    let cicloDom = residuo === 1 ? "A (Mateo)" : (residuo === 2 ? "B (Marcos)" : "C (Lucas)");
    let cicloFerial = (targetYear % 2 !== 0) ? "I (Impar)" : "II (Par)";

    return { cicloDom, cicloFerial, text: `${cicloDom} | Año ${cicloFerial}` };
};

export const getTips = () => {
    const tips = [
        "El color morado se usa en Adviento y Cuaresma como signo de penitencia.",
        "La palabra 'Eucaristía' significa 'Acción de Gracias'.",
        "El 'Kyrie Eleison' es la única parte de la misa en griego.",
        "El Domingo de Gaudete permite el uso de vestiduras rosas.",
        "La Cuaresma dura 40 días, recordando el tiempo de Jesús en el desierto.",
        "El Cirio Pascual representa a Cristo Resucitado, luz del mundo.",
        "El incienso simboliza las oraciones de los santos subiendo al cielo."
    ];
    return tips[Math.floor(Math.random() * tips.length)];
};

export const buildPrompt = ({ selectedDate, tradition, celebrationKey, celebrationLabel }) => {
    const cycle = getLiturgicalCycle(selectedDate);
    const dateStr = (celebrationKey === 'HOY_CALENDARIO' || celebrationKey === 'PROXIMO_DOMINGO')
        ? selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : celebrationLabel;

    let basePrompt = `
        FECHA: ${dateStr}.
        TRADICIÓN: ${tradition.toUpperCase()}.
        ${CONFIG.RULES}
    `;

    // DETECTAR REGLAS DE OMISIÓN POR TIEMPO LITÚRGICO
    const season = getSeason(selectedDate);
    let omissionRules = "";

    if (season === 'cuaresma' || season === 'semana_santa') {
        omissionRules = "⚠️ RÚBRICA IMPORTANTE: ESTAMOS EN CUARESMA. OMITIR EL 'GLORIA' Y EL 'ALELUYA' (Reemplazar Aleluya por la Aclamación antes del Evangelio propia del tiempo).";
    } else if (season === 'adviento') {
        omissionRules = "⚠️ RÚBRICA IMPORTANTE: ESTAMOS EN ADVIENTO. OMITIR EL 'GLORIA'. (Mantener Aleluya).";
    } else {
        omissionRules = "RÚBRICA: Incluir Gloria y Aleluya según corresponda a la solemnidad/fiesta.";
    }

    if (tradition === 'tridentina') {
        // Reglas tridentinas específicas (Septuagésima, etc.)
        if (celebrationLabel.includes("Septuagesima") || celebrationLabel.includes("Sexagesima") || celebrationLabel.includes("Quinquagesima")) {
            omissionRules += " OMITIR ALELUYA (Tiempo de Septuagésima). Usar Tracto.";
        }

        return `
            ${basePrompt}
            ROL: Maestro de Ceremonias (Missale Romanum 1962).
            REGLA DE ORO: La celebración se refiere al 'Propio del Día' en el calendario Tridentino.
            NO USES CICLOS A/B/C.
            REGLAS DE OMISIÓN ACTIVAS: ${omissionRules}
            [MANDATORIO: ENFOCAR EL SALMO COMO RESPONSORIAL/GRADUAL CON VERSOS]
            ESTRUCTURA (Bilingüe Latín/Español - TEXTO COMPLETO PARA EL PUEBLO):
            1. Ritos al Pie del Altar (Salmo 42, Confiteor, Absolución).
            2. Introito, Kyrie, Gloria (VERIFICAR OMISIÓN), Colecta.
            3. Epístola, Gradual (Salmo Responsorial), Evangelio. [MANDATORIO: TEXTOS BÍBLICOS COMPLETOS]
            4. Credo (si aplica).
            5. Ofertorio (Suscipe Sancte Pater, Offerimus tibi), Lavabo, Orate Fratres, Secreta.
            6. Canon Romano (Prefacio, Sanctus, Canon [Resumido para el pueblo, destacar Consagración], Pater Noster).
            7. Agnus Dei, Comunión, Post-Comunión.
            8. Ritos Finales, Último Evangelio (Juan 1:1-14 COMPLETO).
        `;
    }

    let specificInstructions = "";
    let eucharistDetail = "(Ofertorio, Plegaria Eucarística, Rito de Comunión)"; // Default

    if (tradition === 'anglicana') {
        specificInstructions = "Usa el Libro de Oración Común 2019 (ACNA). [MANDATORIO: ORACIÓN COMÚN (Oración de los Fieles) BASADA EN EL TEMA CENTRAL DE LAS LECTURAS]. Incluir 'Prayer of Humble Access' (Oración de Acceso a la Gracia) antes de la comunión.";
        eucharistDetail = "(Ofertorio, Sursum Corda, Sanctus, Plegaria de Consagración, Padre Nuestro, Oración de Acceso a la Gracia [Humble Access], Agnus Dei, Comunión, Oración de Post-Comunión)";
    } else if (tradition === 'ordinariato') {
        specificInstructions = "Usa 'Divine Worship: The Missal'. Lenguaje sacro ('Vosotros'). Incluye Decálogo en penitencial si es Adviento/Cuaresma. [MANDATORIO: EN ADVIENTO, INCLUIR ORACIÓN Y RÚBRICA PARA EL ENCENDIDO DE LA VELA]. Incluir 'Prayer of Humble Access'.";
        eucharistDetail = "(Ofertorio, Orate Fratres, Prayer over the Offerings, Sursum Corda, Sanctus, Canon Romano [o Plegaria Eucarística], Padre Nuestro, Prayer of Humble Access, Agnus Dei, Comunión, Post-Communión)";
    } else {
        specificInstructions = "Usa el Misal Romano (Conferencia Episcopal Mexicana). [MANDATORIO: ORACIÓN UNIVERSAL CON PETICIONES LIGADAS AL TEMA DE LAS LECTURAS].";
        eucharistDetail = "(Ofertorio, Oración sobre las Ofrendas, Prefacio, Sanctus, Plegaria Eucarística [Consagración], Padre Nuestro, La Paz, Cordero de Dios, Comunión, Oración después de la Comunión)";
    }

    return `
        ${basePrompt}
        TÍTULO LITÚRGICO: ${celebrationLabel}.
        CICLO: ${cycle.text}.
        REGLAS DE OMISIÓN ACTIVAS: ${omissionRules}
        INSTRUCCIONES ESPECÍFICAS: ${specificInstructions}
        ESTRUCTURA (COMPLETA Y DETALLADA - INCLUIR TEXTOS DE LAS PARTES FIJAS PARA EL PUEBLO):
        1. Ritos Iniciales (Antífona de Entrada, Saludo, Acto Penitencial, Kyrie, Gloria [VERIFICAR REGLAS DE OMISIÓN], Oración Colecta).
        2. Liturgia de la Palabra (1ª Lectura, Salmo Responsorial [textos completos], 2ª Lectura, Aleluya/Aclamación [VERIFICAR OMISIÓN], Evangelio).
        3. Homilía (Bosquejo breve), Credo, Oración Universal (Peticiones temáticas).
        4. Liturgia Eucarística ${eucharistDetail}.
        5. Rito de Conclusión (Bendición Solemne, Despedida).
    `;
};
