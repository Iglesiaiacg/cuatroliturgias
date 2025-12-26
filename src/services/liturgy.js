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
        
        ROL: Eres un EXPERTO LITURGISTA y MAESTRO DE CEREMONIAS.
        OBJETIVO: Generar un MISAL DE ALTAR COMPLETO para celebrar la misa REAL.
        
        ⚠️ REGLA DE ORO DE CONTENIDO (ANTI-RESUMEN):
        NO escribas "Aquí va el Canon". NO escribas "Recitación en secreto".
        ESCRIBE EL TEXTO LITÚRGICO COMPLETO VERBATIM (Palabra por palabra).
        Si es una oración fija (Te Igitur, Pater Noster), ESCRIBELA COMPLETA.

        ⚠️ REGLA DE VERSIONES BÍBLICAS (CRÍTICO):
        NUNCA USES EL NOMBRE "JEHOVÁ". ES PROHIBIDO EN ESTA LITURGIA.
        Usa siempre "EL SEÑOR" o "DIOS" (Tradición Católica/Anglicana).
        Usa versiones como Biblia de Jerusalén, Nácar-Colunga o BCP.
        
        ⚠️ REGLA DE FORMATO "VOX SECRETA":
        Para las oraciones que el sacerdote dice en secreto (Secreto, Ofertorio, Canon bajo), usa el formato de CITA (Blockquote con >).
        Ejemplo: 
        > Suscipe, Sancte Pater, omnipotens aeterne Deus...
    `;

    // DETECTAR REGLAS DE OMISIÓN POR TIEMPO LITÚRGICO Y TRADICIÓN
    const season = getSeason(selectedDate);

    // Calcular Septuagésima (solo relevante para Tridentina/Ordinariato)
    // 3rd Sunday before Lent (approx 63 days before Easter)
    const easterDate = getEasterDate(selectedDate.getFullYear());
    const septuagesima = new Date(easterDate);
    septuagesima.setDate(easterDate.getDate() - 63);
    const ashWednesday = new Date(easterDate);
    ashWednesday.setDate(easterDate.getDate() - 46);

    let omissionRules = "";

    // LOGICA ESPECÍFICA POR TRADICIÓN
    if (tradition === 'tridentina' || tradition === 'ordinariato') {
        const isPreLent = selectedDate >= septuagesima && selectedDate < ashWednesday;

        if (season === 'cuaresma' || season === 'semana_santa' || isPreLent) {
            omissionRules = "⚠️ RÚBRICA: TIEMPO DE PENITENCIA (Septuagésima/Cuaresma). OMITIR 'GLORIA' Y 'ALELUYA'. Usar TRACTO en lugar de Aleluya.";
        } else if (season === 'adviento') {
            omissionRules = "⚠️ RÚBRICA: ADVIENTO. OMITIR 'GLORIA'. MANTENER 'ALELUYA' (excepto ferias).";
        } else {
            omissionRules = "RÚBRICA: Incluir Gloria y Aleluya (o Gradual).";
        }
    } else {
        // Romana y Anglicana (Calendario Moderno)
        if (season === 'cuaresma' || season === 'semana_santa') {
            omissionRules = "⚠️ RÚBRICA: CUARESMA. OMITIR EL 'GLORIA' Y EL 'ALELUYA' (y el verso aleluyático).";
        } else if (season === 'adviento') {
            omissionRules = "⚠️ RÚBRICA: ADVIENTO. OMITIR EL 'GLORIA'. Mantener Aleluya.";
        } else {
            omissionRules = "RÚBRICA: Incluir Gloria y Aleluya.";
        }
    }

    // --- 1. MISA TRIDENTINA (EXHAUSTIVA CON LATÍN) ---
    if (tradition === 'tridentina') {
        return `
            ${basePrompt}
            FUENTE: Missale Romanum 1962.
            IDIOMA: LATÍN (Texto Principal) y ESPAÑOL (Rúbricas).
            
            ESTRUCTURA OBLIGATORIA (DEBES ESCRIBIR CADA TEXTO COMPLETO CON SU TÍTULO):
            
            I. RITOS INICIALES Y ANTEPREPARACIÓN
            0. PROCESIÓN DE ENTRADA (Rúbrica de revestimiento y procesión al altar).
            1. Asperges Me (o Vidi Aquam). Antífona y Oración completas.
            2. Salmo 42 (Iudica me) y Confiteor. (Escribe el diálogo competo Sacerdote/Ministro).
            3. Aufer a nobis y Oramus te (Oraciones de subida al altar - VOX SECRETA >).
            4. Introito (Texto propio completo). Kyrie (Griego). Gloria (Completo, si aplica).
            
            II. INSTRUCCIÓN (MISA DE LOS CATECÚMENOS)
            5. Colecta (Propia del día). 
            6. Epístola (Lectura completa - Rúbrica: LEÍDA POR EL SUBDIÁCONO O LECTOR, de espaldas al pueblo).
            7. Gradual y Aleluya (o Tracto en Cuaresma).
               ⚠️ REGLA: Escribe el texto del VERSO DEL ALELUYA completo ("Alleluia. V. [Texto]"), no solo la palabra "Aleluya".
            8. Evangelio (Lectura completa - Rúbrica: CANTADO POR EL DIÁCONO O SACERDOTE hacia el norte).
            9. Credo (Texto latino completo, si aplica).
            
            III. OFERTORIO (TEXTOS COMPLETOS OBLIGATORIOS)
            10. Antífona de Ofertorio.
            11. ORACIONES SECRETAS (Usar >):
               > Suscipe, Sancte Pater...
               > Offerimus tibi, Domine, calicem...
               > In spiritu humilitatis...
               > Veni, sanctificator...
            12. Incienso (si aplica) y Lavabo (Salmo 25 completo).
            13. Suscipe Sancta Trinitas (>). Orate Fratres. Secreta (Propia).
            
            IV. CANON MISSAE (LO MÁS IMPORTANTE - TODO TEXTO LATINO COMPLETO)
            14. Prefacio (Propio o Común) y Sanctus.
            15. TE IGITUR:
               > Te igitur, clementissime Pater... (hasta el final).
            16. MEMENTO VIVORUM:
               > Memento, Domine, famulorum famularumque...
            17. COMMUNICANTES:
               > Communicantes, et memoriam venerantes...
            18. CONSAGRACIÓN (Rúbricas de elevación y campanillas detalladas):
               > Hanc igitur (Manos sobre las ofrendas).
               > Quam oblationem...
               > Qui pridie... HOC EST ENIM CORPUS MEUM. (Adoración).
               > Simili modo... HIC EST ENIM CALIX SANGUINIS MEI... (Adoración).
            19. EPÍCLESIS Y MEMENTO DIFUNTOS:
               > Unde et memores...
               > Supra quae...
               > Supplices te rogamus...
               > Memento etiam, Domine...
               > Nobis quoque peccatoribus...
            
            V. COMUNIÓN Y RITOS FINALES
            20. Pater Noster (Completo). Libera nos (>).
            21. Agnus Dei. Oraciones privadas antes de la comunión (> Domine Jesu Christe...).
            22. Domine, non sum dignus (x3). Comunión del Sacerdote y Fieles. Antífona de Comunión.
            23. Post-Comunión (Propia). 
            24. AVISOS PARROQUIALES (Rubrica breve).
            25. Ite Missa est.
            26. PLACEAT TIBI (Oración final secreta ante el altar >):
               > Placeat tibi, sancta Trinitas, obsequium servitutis meae...
            27. BENDICIÓN FINAL (Benedicat vos omnipotens Deus...).
            28. Último Evangelio (Initium sancti Evangelii secundum Ioannem - TEXTO COMPLETO).
            29. PROCESIÓN DE SALIDA (Rúbrica).
        `;
    }

    // --- 2. MISA ANGLICANA (BCP 2019) ---
    if (tradition === 'anglicana') {
        return `
            ${basePrompt}
            FUENTE: Libro de Oración Común (ACNA 2019 - Edición en Español).
            ESTILO: Español Moderno Solemne ("Tú/Usted"). 
            ⛔ PROHIBIDO: "Vos", "Os", "Vuestros" (Arcaísmos). Usa lenguaje actual y fiel al BCP 2019.
            
            ESTRUCTURA OBLIGATORIA (TEXTOS COMPLETOS - CON TÍTULOS CLAROS):
            0. PROCESIÓN DE ENTRADA (Himno y Rúbrica).
            1. RITOS INICIALES:
               - Aclamación Inicial ("Bendito sea Dios: Padre, Hijo y Espíritu Santo...").
               - Colecta de Pureza ("Omnipotente Dios, para quien todos los corazones...").
            2. EL DECÁLOGO o EL SUMARIO DE LA LEY (Leído completo).
            3. KYRIE ELEISON (Señor, ten piedad) y GLORIA (si corresponde).
            4. COLECTA DEL DÍA (Propia).
            5. LITURGIA DE LA PALABRA:
               - Primera Lectura (Antiguo Testamento).
               - SALMO RESPONSORIAL (Indica la Antífona y las Estrofas).
               - Segunda Lectura (Epístola).
               - ALELUYA (Incluye el VERSO propio antes del Evangelio).
               - Evangelio (Leído por Diácono/Sacerdote).
            6. HOMILÍA y CREDO NICENO (Texto completo "Creemos en un solo Dios...").
            7. ORACIÓN DE LOS FIELES:
               ⚠️ ADAPTADA A LAS LECTURAS: Redacta peticiones específicas basadas en el Evangelio/Lecturas de hoy.
               (Formato BCP completo).
            8. CONFESIÓN Y ABSOLUCIÓN:
               - Exhortación breve.
               - Confesión General ("Omnipotente y misericordiosísimo Padre...").
               - Absolución y Palabras de Consuelo.
            9. LA PAZ.
            10. LITURGIA EUCARÍSTICA:
               - Ofertorio.
               - Doxología.
               - GRAN ACCIÓN DE GRACIAS (Plegaria Eucarística):
                 - Sursum Corda ("El Señor esté con ustedes...").
                 - Prefacio Propio y Sanctus.
                 - Oración de Consagración (Texto completo).
                 - Aclamación Memorial.
                 - Epíclesis y Doxología Final.
            11. RITO DE COMUNIÓN:
               - PADRE NUESTRO ("Y ahora, como nuestro Salvador Cristo nos enseñó...").
               - Oración de Humilde Acceso (Prayer of Humble Access: "No presumimos...").
               - Agnus Dei (Cordero de Dios).
               - Comunión de los fieles.
            12. POST-COMUNIÓN:
               - Oración de Acción de Gracias.
            13. RITOS FINALES:
               - AVISOS DE LA COMUNIDAD.
               - BENDICIÓN Y DESPEDIDA.
               - PROCESIÓN DE SALIDA.
        `;
    }

    // --- 3. ORDINARIATO (DIVINE WORSHIP) ---
    if (tradition === 'ordinariato') {
        return `
            ${basePrompt}
            FUENTE: Divine Worship: The Missal.
            ESTILO: Español Sacro Elevado (Patrimonio Anglicano).
            
            ESTRUCTURA OBLIGATORIA (CON TÍTULOS):
            0. PROCESIÓN DE ENTRADA.
            1. Introit y Ritos Iniciales (Colecta de Pureza obligatoria).
            2. Palabra: 
               - Profecía (Lector).
               - Gradual o Tracto (Canto interleccional).
               - Epístola (Subdiácono/Lector).
               - ALELUYA (Incluye el texto del VERSO propio).
               - Evangelio (Diácono/Sacerdote).
            3. Sermón y Credo.
            4. ORACIÓN DE LOS FIELES Y PENITENCIAL:
               - Intercesiones (ADAPTADAS AL TEMA DE LAS LECTURAS).
               - Confesión y Absolución.
            5. Ofertorio (Antífona) y Orate Fratres.
            6. CANON DE LA MISA (VERSIÓN PATRIMONIAL):
               - Prefacio y Sanctus.
               - CANON ROMANO COMPLETO (Texto: "Te igitur" versión DW).
               > "Te rogamos pues, clementísimo Padre..." (Todo el texto verbatim).
               > Rúbricas de genuflexión y elevación claras.
            7. Rito de Comunión:
               - Padre Nuestro.
               - Rito de la Paz.
               - Agnus Dei.
               - Oración de Humilde Acceso ("No presumimos...").
            8. Oración de Acción de Gracias y Último Evangelio.
            9. AVISOS Y BENDICIÓN.
            10. PROCESIÓN DE SALIDA.
        `;
    }

    // --- 4. ROMANA (NOVUS ORDO) ---
    // Fallback
    return `
        ${basePrompt}
        FUENTE: Misal Romano (3ª Edición).
        IDIOMA: Español.
        
        ESTRUCTURA OBLIGATORIA (CON TÍTULOS):
        0. PROCESIÓN DE ENTRADA (Rúbrica e Himno).
        1. Ritos Iniciales: Antífona, Saludo, Acto Penitencial (Confieso completo), Kyrie, Gloria, Colecta.
        2. Liturgia de la Palabra: 
           - 1ª Lectura (Lector).
           - Salmo Responsorial (Salmista - Indica respuesta).
           - 2ª Lectura (Lector).
           - ALELUYA (Incluye el VERSO propio antes del Evangelio).
           - Evangelio (Diácono/Sacerdote).
        3. Homilía y Credo. 
        4. ORACIÓN UNIVERSAL (ADAPTADA A LAS LECTURAS DE HOY).
        5. Liturgia Eucarística:
           - Ofertorio (Bendito seas Señor...).
           - Oración sobre ofrendas.
           - PLEGARIA EUCARÍSTICA II (Texto COMPLETO obligatotio):
             - Prefacio y Santo.
             - "Santo eres en verdad, Señor, fuente de toda santidad..."
             - Relato de Institución (Verbatim).
             - "Este es el Sacramento de nuestra fe..." (Aclamación).
             - Anamnesis ("Así pues, Padre...").
             - Epíclesis de comunión y Doxología.
        6. Rito de Comunión (Padre Nuestro, Paz, Cordero, Comunión, Oración Post-comunión).
        7. RITO DE CONCLUSIÓN:
           - AVISOS PARROQUIALES BREVES.
           - Bendición final.
           - DESPEDIDA: "Podéis ir en paz" - "Demos gracias a Dios".
           - PROCESIÓN DE SALIDA (Canto Final).
    `;
};
