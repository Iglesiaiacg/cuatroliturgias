import { CONFIG } from './config.js';

// --- DATE MATH HELPERS ---
const OneDay = 1000 * 60 * 60 * 24;

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

// Returns date with time set to noon to avoid timezone overlaps
const normalizeDate = (d) => {
    const newD = new Date(d);
    newD.setHours(12, 0, 0, 0);
    return newD;
};

const getAdventStart = (year) => {
    const christmas = new Date(year, 11, 25);
    const dow = christmas.getDay(); // 0 is Sunday
    const daysToSubtract = (dow === 0) ? 28 : (dow + 21);
    return new Date(year, 11, 25 - daysToSubtract);
};

// --- CORE IDENTIFICATION LOGIC ---

export const identifyFeast = (date) => {
    const d = normalizeDate(date);
    const year = d.getFullYear();

    // Fixed Feasts (Examples, expandable)
    const month = d.getMonth(); // 0-11
    const day = d.getDate();

    if (month === 11 && day === 25) return "Natividad del Señor";
    if (month === 0 && day === 1) return "Santa María, Madre de Dios";
    if (month === 0 && day === 6) return "Epifanía del Señor";
    if (month === 10 && day === 1) return "Todos los Santos";
    if (month === 10 && day === 2) return "Fieles Difuntos";

    // Moveable Feasts
    const easter = normalizeDate(getEasterDate(year));
    const christmas = normalizeDate(new Date(year, 11, 25));
    const adventStart = normalizeDate(getAdventStart(year));

    // Calculate offsets
    const diffEaster = Math.round((d - easter) / OneDay);

    // 1. ADVENT SEASON
    if (d >= adventStart && d < christmas) {
        const daysIn = Math.floor((d - adventStart) / OneDay);
        const sundayNum = Math.floor(daysIn / 7) + 1;
        const weekDay = d.getDay();

        if (weekDay === 0) return `${sundayNum}º Domingo de Adviento`;
        return `Feria de Adviento (${sundayNum}ª Semana)`;
    }

    // 2. CHRISTMAS SEASON (Simplified)
    // Note: Epiphany range logic might need tuning but basics here
    if (d >= christmas || (month === 0 && day <= 13 && diffEaster < -60)) {
        return "Tiempo de Navidad";
    }

    // 3. LENT & HOLY WEEK
    const ashWed = new Date(easter);
    ashWed.setDate(easter.getDate() - 46);
    // ashWed is already noon-based because easter is noon-based
    const diffAsh = Math.round((d - ashWed) / OneDay);

    if (diffAsh === 0) return "Miércoles de Ceniza";
    if (diffAsh > 0 && diffEaster < 0) {
        if (diffEaster >= -7) {
            // Holy Week
            if (diffEaster === -7) return "Domingo de Ramos";
            if (diffEaster === -3) return "Jueves Santo";
            if (diffEaster === -2) return "Viernes Santo";
            if (diffEaster === -1) return "Sábado Santo / Vigilia Pascual";
            return "Semana Santa";
        }

        const sundayNum = Math.floor(diffAsh / 7) + 1;
        if (d.getDay() === 0) return `${sundayNum}º Domingo de Cuaresma`;
        return `Feria de Cuaresma (${sundayNum}ª Semana)`;
    }

    // 4. EASTERTIDE
    if (diffEaster >= 0 && diffEaster <= 49) {
        if (diffEaster === 0) return "Domingo de Resurrección";
        if (diffEaster === 49) return "Domingo de Pentecostés";

        const sundayNum = Math.floor(diffEaster / 7) + 1;
        if (d.getDay() === 0) return `${sundayNum}º Domingo de Pascua`;
        return `Feria de Pascua (${sundayNum}ª Semana)`;
    }

    // 5. POST-PENTECOST SOLEMNITIES
    const pentecost = new Date(easter);
    pentecost.setDate(easter.getDate() + 49);

    const trinity = new Date(pentecost);
    trinity.setDate(pentecost.getDate() + 7);
    if (d.getTime() === trinity.getTime()) return "Santísima Trinidad";

    // Corpus Christi
    const corpus = new Date(trinity);
    corpus.setDate(trinity.getDate() + 7); // Following Sunday
    if (d.getTime() === corpus.getTime()) return "Corpus Christi (Solemne)";

    // Christ the King (Last Sunday before Advent)
    const christKing = new Date(adventStart);
    christKing.setDate(adventStart.getDate() - 7);
    if (d.getTime() === christKing.getTime()) return "Jesucristo, Rey del Universo";

    // 6. ORDINARY TIME
    // Part 1: After Baptism until Ash Wednesday
    // Part 2: After Pentecost until Advent

    // Helper: Calculate Ordinary Time Week
    const getOTWeek = (d) => {
        // Target: Christ the King is Week 34
        // We calculate backwards from Christ the King for the second part of the year (Green Season)
        // This ensures we land on Week 34 correctly regardless of when Easter fell.

        const adventStart = getAdventStart(year);
        const christKing = new Date(adventStart);
        christKing.setDate(adventStart.getDate() - 7);
        christKing.setHours(12, 0, 0, 0);

        if (d > pentecost) {
            // Second part of the year
            const msPerWeek = 1000 * 60 * 60 * 24 * 7;
            const diffTime = christKing.getTime() - d.getTime();
            const weeksBeforeKing = Math.round(diffTime / msPerWeek);
            const weekNum = 34 - weeksBeforeKing;

            // Calculate "Proper" for Lectionary (Common Worship / BCP / RCL uses Propers linked to dates)
            // But strict Ordinary Time number is Week X.
            // Valid weeks are usually 6-34 in this period.
            return { week: weekNum, proper: `Propio ${weekNum - 5}` }; // Aprox rule: Week 34 = Proper 29
        } else {
            // First part of the year (Epiphany to Lent)
            // Starts after Baptism of the Lord.
            // Baptism is the Sunday after Jan 6 (Epiphany).
            let baptism = new Date(year, 0, 6);
            while (baptism.getDay() !== 0) {
                baptism.setDate(baptism.getDate() + 1);
            }
            // If Epiphany (Jan 6) IS Sunday, Baptism is usually transferred to Monday, 
            // but for simplicity let's stick to the Sunday following Jan 6 as the anchor for "Week 1" logic begins week after.
            // Actually, the Sunday AFTER Baptism is the Second Sunday.

            const msPerWeek = 1000 * 60 * 60 * 24 * 7;
            const diffTime = d.getTime() - baptism.getTime();
            const weeksAfterBaptism = Math.floor(diffTime / msPerWeek);

            // 1 week after baptism = 2nd Sunday
            return { week: weeksAfterBaptism + 1, proper: null };
        }
    };

    if (d.getDay() === 0) {
        const { week, proper } = getOTWeek(d);
        const properText = proper ? ` (${proper})` : '';
        return `${week}º Domingo del Tiempo Ordinario${properText}`;
    }

    const { week } = getOTWeek(d);
    return `Feria del Tiempo Ordinario (${week}ª Semana)`;
};

// --- REST OF SERVICE ---

export const getSeason = (date) => {
    // Re-use logic or call identifyFeast if needed, but keeping separate for simple checks
    // This function remains similar but optimized
    const year = normalizeDate(date).getFullYear();
    const easter = getEasterDate(year);
    const ashWed = new Date(easter); ashWed.setDate(easter.getDate() - 46);
    const adventStart = getAdventStart(year);
    const christmas = new Date(year, 11, 25);

    if (date >= adventStart && date < christmas) return 'adviento';
    if (date >= christmas || (date.getMonth() === 0 && date.getDate() <= 13)) return 'navidad';
    if (date >= ashWed && date < easter) {
        const diff = (easter - date) / OneDay;
        return diff <= 7 ? 'semana_santa' : 'cuaresma';
    }
    const pentecost = new Date(easter); pentecost.setDate(easter.getDate() + 49);
    if (date >= easter && date <= pentecost) {
        if (date.getTime() === pentecost.getTime()) return 'pentecostes';
        return 'pascua';
    }
    return 'ordinario';
};

export const getLiturgicalCycle = (date) => {
    const year = date.getFullYear();
    const adventStart = getAdventStart(year);

    let targetYear = date >= adventStart ? year + 1 : year;
    const residuo = targetYear % 3;
    let cicloDom = residuo === 1 ? "A (Mateo)" : (residuo === 2 ? "B (Marcos)" : "C (Lucas)");
    let cicloFerial = (targetYear % 2 !== 0) ? "I (Impar)" : "II (Par)";

    return { cicloDom, cicloFerial, text: `${cicloDom} | Año ${cicloFerial}` };
};

export const getLiturgicalColor = (date) => {
    const season = getSeason(date);
    switch (season) {
        case 'adviento':
            return { name: 'Morado', code: 'purple', classes: 'bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-900/50 dark:text-purple-100 dark:border-purple-800' };
        case 'navidad':
            return { name: 'Blanco', code: 'slate', classes: 'bg-slate-100 text-slate-900 border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700' };
        case 'cuaresma':
            return { name: 'Morado', code: 'purple', classes: 'bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-900/50 dark:text-purple-100 dark:border-purple-800' };
        case 'semana_santa':
            return { name: 'Rojo', code: 'red', classes: 'bg-red-100 text-red-900 border-red-200 dark:bg-red-900/50 dark:text-red-100 dark:border-red-800' };
        case 'pascua':
            return { name: 'Blanco', code: 'slate', classes: 'bg-slate-100 text-slate-900 border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700' };
        case 'pentecostes':
            return { name: 'Rojo', code: 'red', classes: 'bg-red-100 text-red-900 border-red-200 dark:bg-red-900/50 dark:text-red-100 dark:border-red-800' };
        default:
            return { name: 'Verde', code: 'green', classes: 'bg-green-100 text-green-900 border-green-200 dark:bg-green-900/50 dark:text-green-100 dark:border-green-800' };
    }
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

export const buildPrompt = ({ selectedDate, tradition, celebrationLabel }) => {
    const cycle = getLiturgicalCycle(selectedDate);
    const dateStr = selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    let basePrompt = `
        FECHA: ${dateStr}.
        TRADICIÓN: ${tradition.toUpperCase()}.
        ${CONFIG.RULES}
        
        ⚠️ INSTRUCCIÓN CRÍTICA DE SEGURIDAD (ANTI-PLAGIO):
        1. NO generes bloques de texto largos verbatim de libros protegidos por derechos de autor (Missale Romanum, BCP 2019, etc.).
        2. PARA TEXTOS FIJOS (Plegaria Eucarística, Canon Romano, Credo, Gloria): Escribe SOLO el título en mayúsculas y las primeras palabras (Incipit) o una descripción de la acción. NO escribas el texto completo.
        3. PARA TEXTOS VARIABLES (Lecturas Bíblicas, Homilía, Oración de los Fieles, Moniciones): Escribe el TEXTO COMPLETO original o generado por ti.
    `;

    // DETECTAR REGLAS DE OMISIÓN POR TIEMPO LITÚRGICO
    const season = getSeason(selectedDate);
    let omissionRules = "";

    if (season === 'cuaresma' || season === 'semana_santa') {
        omissionRules = "⚠️ RÚBRICA: CUARESMA. OMITIR EL 'GLORIA' Y EL 'ALELUYA'. Usar aclamación propia del tiempo.";
    } else if (season === 'adviento') {
        omissionRules = "⚠️ RÚBRICA: ADVIENTO. OMITIR EL 'GLORIA'. Mantener Aleluya. [INCLUIR RITO DE CORONA DE ADVIENTO].";
    } else {
        omissionRules = "RÚBRICA: Incluir Gloria (Incipit) y Aleluya según corresponda.";
    }

    if (tradition === 'tridentina') {
        return `
            ${basePrompt}
            ROL: Maestro de Ceremonias (Missale Romanum 1962).
            CICLO: ${cycle.text} (Referencia).
            REGLA DE ORO: 'Propio del Día' para: ${dateStr}.
            REGLAS DE OMISIÓN: ${omissionRules}
            
            ESTRUCTURA (Bilingüe Latín/Español - TEXTOS VARIABLES COMPLETOS, FIJOS SOLO RÚBRICAS):
            1. Ritos al Pie del Altar (Indicar Salmo 42 y Confiteor como rúbrica).
            2. Introito (TEXTO COMPLETO LAT/ESP), Kyrie (Solo título), Gloria (Solo título si aplica), Colecta (TEXTO COMPLETO).
            3. Epístola (TEXTO COMPLETO), Gradual/Aleluya/Tracto (TEXTO COMPLETO), Evangelio (TEXTO COMPLETO).
            4. Credo (Solo título si aplica).
            5. Ofertorio (Indicar oraciones 'Suscipe Sancte Pater', etc. como rúbrica). Secreta (TEXTO COMPLETO).
            6. CANON ROMANO 1962: NO ESCRIBIR EL TEXTO. Solo indicar los títulos de las partes (TE IGITUR, MEMENTO, etc.) y las acciones del sacerdote.
            7. Agnus Dei, Comunión (Antífona COMPLETA), Post-Comunión (TEXTO COMPLETO).
            8. Ritos Finales, Último Evangelio (Indicar Juan 1:1-14).
        `;
    }

    let specificInstructions = "";
    let eucharistDetail = "";

    if (tradition === 'anglicana') {
        specificInstructions = `
            FUENTE: Libro de Oración Común 2019 (Estilo).
            [MANDATORIO: ORACIÓN DE LOS FIELES GENERADA (NO COPIADA) BASADA EN LECTURAS].
            MANDATORIO: PARA LA PLEGARIA DE CONSAGRACIÓN, NO ESCRIBAS EL TEXTO DEL LIBRO. Usa títulos: 'SURSUM CORDA', 'SANCTUS', 'PREFACIO PROPIO DEL DÍA' (Escribe el texto del prefacio), 'PLEGARIA EUCARÍSTICA' (Indicar acciones: Epíclesis, Institución, Oblación, Doxología).
        `;
        eucharistDetail = `
            1. Ofertorio.
            2. Gran Acción de Gracias (Indicando partes y Prefacio COMPLETO).
            3. Rito de Comunión (Padre Nuestro, Prayer of Humble Access [Texto generado o Incipit], Agnus Dei).
        `;
    } else if (tradition === 'ordinariato') {
        specificInstructions = `
            FUENTE: Uso del Ordinariato (Divine Worship).
            IDIOMA: ESPAÑOL (Estilo Sacro).
            INSTRUCCIÓN: NO generes el texto del Canon Romano.
            CÉNTRATE EN GENERAR EL CONTENIDO VARIABLE DEL DÍA:
            1. Introito y Colecta (COMPLETAS).
            2. LECTURAS BÍBLICAS (COMPLETAS) y Salmo.
            3. HOMILÍA (Generar texto completo).
        `;
        eucharistDetail = `
            1. Ofertorio (Rúbricas).
            2. Orate Fratres.
            3. Plegaria Eucarística (Solo Títulos y Rúbricas).
            4. Rito de Comunión.
        `;
    } else { // Romana / Novus Ordo
        specificInstructions = `
            FUENTE: Misal Romano.
            [MANDATORIO: ORACIÓN UNIVERSAL (Peticiones) GENERADA BASADA EN LECTURAS].
            MANDATORIO: NO ESCRIBIR LA PLEGARIA EUCARÍSTICA COMPLETA. Indicar: 'Prefacio (Escribir texto del prefacio propio)', 'Santo', 'Plegaria Eucarística II/III (Rúbrica de consagración)', 'Aclamación Memorial'.
        `;
        eucharistDetail = `
            1. Ofertorio.
            2. Oración sobre as Ofrendas (COMPLETA).
            3. Plegaria Eucarística (Esquema con Rúbricas).
            4. Rito de Comunión.
        `;
    }

    return `
        ${basePrompt}
        TITULO: ${celebrationLabel}.
        CICLO: ${cycle.text}.
        OMISIONES: ${omissionRules}
        INSTRUCCIONES: ${specificInstructions}
        ESTRUCTURA REQUERIDA:
        1. Ritos Iniciales (Antífona Entrada [COMPLETA], Saludo, Acto Penitencial [Breve], Oración Colecta [COMPLETA]).
        2. Liturgia de la Palabra (1ª Lectura [TEXTO BIBLICO COMPLETO - NO RESUMIR], Salmo [COMPLETO], 2ª Lectura [COMPLETA], Evangelio [COMPLETO]).
        3. Homilía (Bosquejo generado), Credo (Solo Título), Oración Universal (Generar peticiones).
        4. Liturgia Eucarística ${eucharistDetail}.
        5. Rito de Conclusión.
    `;
};
