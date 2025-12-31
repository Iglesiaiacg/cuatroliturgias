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

export const getLiturgicalRubrics = (date, tradition) => {
    const season = getSeason(date);
    const day = date.getDay(); // 0 is Sunday

    // Default Defaults (Ordinary Time)
    let rubrics = {
        gloria: day === 0, // Gloria on Sundays
        credo: day === 0,  // Credo on Sundays
        alleluia: true,
        preface: 'Común / Dominical'
    };

    // Calculate Septuagesima for Tridentine/Ordinariate
    const year = date.getFullYear();
    const easter = getEasterDate(year);
    const septuagesima = new Date(easter); septuagesima.setDate(easter.getDate() - 63);
    const ashWed = new Date(easter); ashWed.setDate(easter.getDate() - 46);

    const isPreLent = date >= septuagesima && date < ashWed;

    // SEASONAL OVERRIDES
    if (season === 'adviento') {
        rubrics.gloria = false; // No Gloria in Advent (Romana)
        // Tridentine override for Advent: Still YES Alleluia, NO Gloria.
        rubrics.preface = 'Adviento';
    }

    if (season === 'navidad') {
        rubrics.gloria = true;
        rubrics.credo = true; // Even weekdays in Octave? Simplified: Yes for season.
        rubrics.preface = 'Navidad';
    }

    if (season === 'cuaresma') {
        rubrics.gloria = false;
        rubrics.alleluia = false; // No Alleluia at all
        rubrics.preface = 'Cuaresma';
    }

    if (season === 'semana_santa') {
        rubrics.gloria = false; // Holy Thursday is exception (handle separately if needed)
        rubrics.alleluia = false;
        rubrics.preface = 'La Pasión';
    }

    if (season === 'pascua') {
        rubrics.gloria = true;
        rubrics.alleluia = true; // Double Alleluia
        rubrics.preface = 'Pascua';
    }

    // TRADITION SPECIFIC OVERRIDES
    if (tradition === 'tridentina' || tradition === 'ordinariato') {
        if (isPreLent) {
            rubrics.gloria = false; // No Gloria in Septuagesima
            rubrics.alleluia = false; // No Alleluia (use Tract)
            rubrics.preface = 'Trinidad (Domingo) / Común';
        }
    }

    return rubrics;
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

export const getMarianAntiphon = (date) => {
    // 1. Alma Redemptoris Mater (Advent - Feb 2)
    const year = date.getFullYear();
    const adventStart = getAdventStart(year);
    const feb2 = new Date(year, 1, 2); // Month is 0-indexed, so 1 = Feb

    // Check if date is in the "end of year" Advent part OR "beginning of year" until Feb 2
    // If date is Jan/Feb (until Feb 2) -> belongs to previous year's Advent/Christmas cycle technically for antiphon
    if (date >= adventStart || (date.getMonth() === 0) || (date.getMonth() === 1 && date.getDate() <= 2)) {
        return { name: "Alma Redemptoris Mater", text: "Alma Redemptoris Mater..." };
    }

    // 2. Regina Caeli (Easter - Pentecost)
    const easter = getEasterDate(year);
    const pentecost = new Date(easter);
    pentecost.setDate(easter.getDate() + 49);

    // Normalize to handle day comparisons properly
    const d = normalizeDate(date);
    const startEaster = normalizeDate(easter);
    const endPentecost = normalizeDate(pentecost);

    if (d >= startEaster && d <= endPentecost) {
        return { name: "Regina Caeli", text: "Regina Caeli, laetare, alleluia..." };
    }

    // 3. Ave Regina Caelorum (Feb 3 - Wednesday of Holy Week)
    // Spy Wednesday is 3 days before Easter Sunday (Sunday - 4 = Wed) -> Wait, Spy Wed is diff -3 from Easter Sunday?
    // Easter is Sunday. Holy Week starts Palm Sunday (-7). 
    // Tradition: Until Compline of Wednesday of Holy Week? Or until Triduum starts (Holy Thursday)?
    // Keeping simple: From Feb 3 until Holy Thursday exclusive.
    const holyThursday = new Date(easter);
    holyThursday.setDate(easter.getDate() - 3);

    // Initial part of year between Feb 2 and Easter
    if (d > new Date(year, 1, 2) && d < normalizeDate(holyThursday)) {
        return { name: "Ave Regina Caelorum", text: "Ave, Regina caelorum..." };
    }

    // 4. Salve Regina (Trinity Sunday/Corpus - Start of Advent)
    // Basically "the rest of the year" (Post-Pentecost)
    return { name: "Salve Regina", text: "Salve, Regina, mater misericordiae..." };
};

export const buildPrompt = ({ selectedDate, tradition, celebrationLabel }) => {
    const cycle = getLiturgicalCycle(selectedDate);
    const dateStr = selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const marianAntiphon = getMarianAntiphon(selectedDate);

    // --- DETECTION OF EXCEPTIONS ---
    const isGoodFriday = celebrationLabel.toLowerCase().includes("viernes santo");
    const isAshWednesday = celebrationLabel.toLowerCase().includes("ceniza");

    let basePrompt = `
        FECHA: ${dateStr}.
        CICLO DOMINICAL: ${cycle.cicloDom} (A = Mateo, B = Marcos, C = Lucas).
        CICLO FERIAL: Año ${cycle.cicloFerial}.
        TRADICIÓN: ${tradition.toUpperCase()}.
        ${CONFIG.RULES}

    ROL: Eres un EXPERTO LITURGISTA y MAESTRO DE CEREMONIAS.
        OBJETIVO: Generar un MISAL DE ALTAR COMPLETO para celebrar la misa REAL.
        
        ⚠️ REGLA DE ORO DE LECTURAS (NO ALUCINAR):
        - DEBES USAR LAS LECTURAS EXACTAS DEL CICLO INDICADO ARRIBA.
        - Si dice "CICLO A", el Evangelio casi siempre será MATEO.
        - Si dice "CICLO C", el Evangelio será LUCAS.
        - CASO CRÍTICO 28 DIC 2025: Es Domingo de la Sagrada Familia (CICLO A). El Evangelio OBLIGATORIO es MATEO 2, 13-15. 19-23 (Huida a Egipto).
        - VERIFICA MENTALMENTE QUE LA CITA BÍBLICA CORRESPONDA AL DÍA Y AÑO LITÚRGICO.
        - Si es una FIESTA (San Juan, Navidad, etc.), usa las lecturas PROPIAS de la fiesta, ignorando el ciclo ferial.

        🛡️ PROTOCOLO DE VERACIDAD FINAL:
        1. Tu prioridad #1 es la EXACTITUD BÍBLICA.
        2. Si el usuario te da una FECHA del futuro (ej. 2025), NO uses el ciclo de este año actual (2024). USA EL CICLO QUE TE HE CALCULADO ARRIBA (Ciclo ${cycle.cicloDom}).
        3. Si hay contradicción, EL CICLO CALCULADO GANA.
        
        ⚠️ REGLA DE ORO DE CONTENIDO(ANTI - RESUMEN):
        NO escribas "Aquí va el Canon".NO escribas "Recitación en secreto".
        ESCRIBE EL TEXTO LITÚRGICO COMPLETO VERBATIM(Palabra por palabra).
        Si es una oración fija(Te Igitur, Pater Noster), ESCRIBELA COMPLETA.

        ⚠️ REGLA DE VERSIONES BÍBLICAS(CRÍTICO - ANTI COPYRIGTH):
        NUNCA USES EL NOMBRE "JEHOVÁ".ES PROHIBIDO EN ESTA LITURGIA.
        Usa siempre "EL SEÑOR" o "DIOS".
        PARA EVITAR BLOQUEOS DE COPYRIGHT Y GARANTIZAR TEXTO COMPLETO:
        USA ÚNICAMENTE VERSIONES DE DOMINIO PÚBLICO:
- "Torres Amat"(Católica Antigua).
        - "Vulgata Traducida".
        NO USES "Biblia de Jerusalén" ni "Latinoamericana"(Tienen Copyright estricto).
        NUNCA USES REINA VALERA(Protestante).
        
        ⚠️ ESTRATEGIA ANTI - BLOQUEO(COPYRIGHT / RECITATION):
        TU PRIORIDAD ES DAR EL TEXTO COMPLETO.NO LO RECORTES.
        Si una oración moderna es problemática, usa una antigua.
        Si es imposible, tradúcela tú mismo fielmente.Pero NO DEJES SOLO EL TÍTULO.
        
        ⚠️ REGLA DE FORMATO "VOX SECRETA":
        Para las oraciones que el sacerdote dice en secreto(Secreto, Ofertorio, Canon bajo), usa el formato de CITA(Blockquote con >).
    Ejemplo: 
        > Suscipe, Sancte Pater, omnipotens aeterne Deus...

        ⚠️ REGLA DE ROLES Y MINISTERIOS(CRÍTICO):
        NO ASIGNES TODO AL SACERDOTE.DISTRIBUYE LOS ROLES CORRECTAMENTE:
- LECTOR: Lee 1ª Lectura, Salmo(si no hay Salmista), 2ª Lectura(Epístola) y Oración de los Fieles.
        - SALMISTA: Canta el Salmo.
        - DIÁCONO(o Sacerdote): Lee el Evangelio, dice las invitaciones("Demos gracias...", "Podéis ir en paz").
        - SACERDOTE(Celebrante): Ritos Iniciales, Colecta, Homilía, Plegaria Eucarística(Canon), Bendición.
        - PUEBLO / ASAMBLEA: Respuestas("Y con tu espíritu", "Te alabamos Señor", "Amén").
        
        ETIQUETA CLARAMENTE QUIÉN HABLA.

        ⚠️ REGLA DE ESTILO Y FORMATO(ELEGANCIA VISUAL - IMPORTANTÍSIMO):
        El usuario exige un documento "LUCIDO", "ELEGANTE" y "CUIDADO".
        
        1. ESTRUCTURA VISUAL DE LUJO:
- Usa Markdown \`# TÍTULO DE LA FIESTA\` al inicio (Se renderizará centrado y grande).
           - Usa Markdown \`## GRANDES PARTES\` para secciones (RITOS INICIALES, LITURGIA DE LA PALABRA...).
           - Usa separadores \`---\` para dividir momentos clave.

        2. RÚBRICAS (ROJAS):
           - TODA instrucción (sentarse, de pie, hacer la señal de la cruz) DEBE ir entre DOBLES CORCHETES: \`[[Todos hacen la señal de la cruz]]\`.
           - NO uses paréntesis normales para las rúbricas. Usa \`[[...]]\`.

        3. ROLES (CLARIDAD ABSOLUTA):
           - Usa SIEMPRE negrita y mayúsculas para el que habla: \`**SACERDOTE:**\`, \`**LECTOR:**\`, \`**TODOS:**\`.
           - Alinea los diálogos para que sean fáciles de leer en voz alta.

        4. CALIDAD DEL TEXTO:
           - Evita textos "burdos" o telegráficos. Usa un lenguaje solemne.
           - Deja líneas en blanco entre rúbricas y oraciones para que respire el texto.

        5. TÍTULOS BILINGÜES (LATÍN/ESPAÑOL) OBLIGATORIOS PARA TODO:
           - El usuario exige ver el nombre tradicional en latín junto al español en TODAS las secciones mayores y menores.
           - ⚠️ CRÍTICO: ¡SOLO LOS TÍTULOS VAN EN LATÍN!
           - EL TEXTO DE LAS ORACIONES Y LECTURAS DEBE SER EN ESPAÑOL (Salvo Misa Tridentina que es todo latín).
           - EJEMPLO CORRECTO: "PATER NOSTER (Padre Nuestro): Padre nuestro que estás en el cielo..."
           - EJEMPLO INCORRECTO: "PATER NOSTER: Pater noster, qui es in caelis..." (Esto está PROHIBIDO en Misa Romana/Anglicana).
           - USA ESTOS TÍTULOS (o equivalentes) SIEMPRE:
             * "INTROITUS (Canto de Entrada)"
             * "KYRIE ELEISON (Señor, ten piedad)"
             * "GLORIA IN EXCELSIS (Gloria a Dios)"
             * "COLLECTA (Oración Colecta)"
             * "LECTIO / EPISTOLA (Primera Lectura / Epístola)"
             * "GRADUALE / TRACTUS (Gradual / Salmo / Tracto)"
             * "EVANGELIUM (Santo Evangelio)"
             * "CREDO IN UNUM DEUM (Credo)"
             * "OFFERTORIUM (Ofertorio)"
             * "ORATIO SUPER OBLATA / SECRETA (Oración sobre las Ofrendas)"
             * "PRAEFATIO (Prefacio)"
             * "SANCTUS (Santo, Santo, Santo)"
             * "CANON MISSAE / PREX EUCHARISTICA (Plegaria Eucarística)"
             * "PATER NOSTER (Padre Nuestro)"
             * "AGNUS DEI (Cordero de Dios)"
             * "COMMUNIO (Antífona de Comunión)"
             * "POSTCOMMUNIO (Oración Post-comunión)"
             * "BENEDICTIO (Bendición Final)"
             * "ITE, MISSA EST (Despedida)"
           - Aplica esto rigurosamente en TODO el misal.

        6. ORATIO FIDELIUM (Oración de los Fieles) - REGLA DE ORO DE COMPOSICIÓN (CRÍTICA):
           - ¡PROHIBIDO USAR PETICIONES GENÉRICAS O PREFABRICADAS!
           - Tienes la OBLIGACIÓN de componer las peticiones basándote EXPLICITAMENTE en el Evangelio y las Lecturas de hoy.
           - EJEMPLO: Si el Evangelio habla de 'la curación de un ciego', la petición por los enfermos debe decir "Por los que sufren ceguera espiritual o física, como el ciego del Evangelio...".
           - EJEMPLO: Si es Domingo de Ramos, pide "Para que podamos acompañar al Señor en su Pasión...".
           - Menciona personajes, parábolas o acciones específicas del texto bíblico del día dentro de las peticiones.
           - Esto es vital para conectar la homilía con la oración.

        7. CITA PATRÍSTICA PARA PORTADA (ALEATORIA):
           - AL FINAL DEL DOCUMENTO (después de la procesión de salida), OBLIGATORIAMENTE incluye una línea con una frase MEMORABLE de un Padre de la Iglesia.
           - Formato EXACTO:
             > CITA_PATRISTICA: "La medida del amor es amar sin medida." - San Agustín
           - Elige una frase que tenga que ver con la liturgia de hoy o el tiempo litúrgico.

        8. REGLA DEL SALMO (CRÍTICA - NO GRADUAL):
           - Para Misa ROMANA, ANGLICANA y ORDINARIATO:
           - EL SALMO DEBE SER SIEMPRE RESPONSORIAL (Diálogo Lector/Pueblo).
           - ¡PROHIBIDO USAR "GRADUAL" O "TRACTO" en estas tradiciones! (Eso es solo para Tridentina).
           - Debes escribir explícitamente la RESPUESTA ("R.") y las ESTROFAS.

        9. REGLA ANTI-BLOQUEO (CRÍTICA):
           - ¡NO escribas letras de canciones o himnos modernos (ej. 'Pescador de hombres', 'Vienen con Alegría')! Google bloqueará tu respuesta por Copyright.
           - USA EXCLUSIVAMENTE LAS ANTÍFONAS BÍBLICAS DEL MISAL (Introito, Ofertorio, Comunión).
           - Si no tienes la antífona exacta, genera una frase bíblica genérica basada en el Salmo del día.
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

    // 🔥🔥 CRITICAL GOOD FRIDAY OVERRIDE 🔥🔥
    if (isGoodFriday) {
        return `
            ${basePrompt}
            ⚠️⚠️⚠️ **CELEBRACIÓN ESPECIAL DETECTADA: VIERNES SANTO** ⚠️⚠️⚠️
            
            ESTRUCTURA DE LA CELEBRACIÓN DE LA PASIÓN DEL SEÑOR (NO ES UNA MISA).
            COLOR: ROJO.
            NO HAY RITOS INICIALES (Entrada en silencio y postración). NO HAY CONSAGRACIÓN.
            
            ESTRUCTURA OBLIGATORIA:
            1. RITOS INICIALES:
               - Entrada en silencio absoluto.
               - Rúbrica: Sacerdote se postra en tierra. Fieles de rodillas.
               - Oración Colecta (Sin "Oremos" ni saludo).
            
            2. LITURGIA DE LA PALABRA:
               - 1ª Lectura: Isaías 52, 13 – 53, 12 (El siervo sufriente).
               - Salmo 30: "Padre, a tus manos encomiendo mi espíritu".
               - 2ª Lectura: Hebreos 4, 14-16; 5, 7-9.
               - TRACTO (Cristo se humilló a sí mismo...).
               - PASIÓN DE NUESTRO SEÑOR JESUCRISTO SEGÚN SAN JUAN (Jn 18, 1 – 19, 42). 
                 (Indica rúbrica para que la LEAN 3 PERSONAS: CRONISTA, SINAGOGA, JESÚS).
               - HOMILÍA BREVE.
               - ORACIÓN UNIVERSAL SOLEMNE (10 intenciones: Por la Iglesia, el Papa, los ministros, catecúmenos, unidad de los cristianos, judíos, no creyentes, gobernantes, tribulados).
                 (Escribe SOLO los títulos de las 10 intenciones, no todo el texto largo).

            3. ADORACIÓN DE LA SANTA CRUZ:
               - Rúbrica de presentación ("Mirad el árbol de la Cruz...").
               - Respuesta: "Venid y adoremos".
               - Cantos de adoración (Improperios).
            
            4. SAGRADA COMUNIÓN:
               - Rúbrica: Altar cubierto con mantel, corporal y misal.
               - Padre Nuestro.
               - Comunión de los fieles (con Pan consagrado el Jueves).
               - Oración después de la comunión.
               - ORACIÓN SOBRE EL PUEBLO (Sin bendición formal).
               - SALIDA EN SILENCIO.

             **NO INCLUYAS PLEGARIA EUCARÍSTICA NI CONSAGRACIÓN BAJO NINGUNA CIRCUNSTANCIA.**
        `;
    }

    // --- 1. MISA TRIDENTINA (EXHAUSTIVA CON LATÍN) ---
    if (tradition === 'tridentina') {
        const marianAntiphonText = `Antífona Mariana Final: ${marianAntiphon.name} (${marianAntiphon.text})`;

        return `
            ${basePrompt}
            FUENTE: Missale Romanum 1962.
            IDIOMA: LATÍN (Texto Principal) y ESPAÑOL (Rúbricas).
            ${omissionRules}
            
            ESTRUCTURA OBLIGATORIA (DEBES ESCRIBIR CADA TEXTO COMPLETO CON SU TÍTULO):
            
            I. RITOS INICIALES Y ANTEPREPARACIÓN
            0. PROCESIÓN DE ENTRADA (Rúbrica de revestimiento y procesión al altar).
            1. Asperges Me (o Vidi Aquam). Antífona y Oración completas.
            2. Salmo 42 (Iudica me) y Confiteor. (Escribe el diálogo competo Sacerdote/Ministro).
            3. Aufer a nobis y Oramus te (Oraciones de subida al altar - VOX SECRETA >).
            4. Introito (Texto propio completo). Kyrie (Griego). Gloria (Completo, si aplica).
            
            II. INSTRUCCIÓN (MISA DE LOS CATECÚMENOS)
            5. Colecta (Propia del día). 
            6. Epístola [SUBDIÁCONO/LECTOR]: (Lectura completa - ⚠️ ESCRIBE EL TEXTO LATINO/ESPAÑOL COMPLETO).
            7. Gradual y Aleluya [CORO/SCHOLA]: (o Tracto en Cuaresma).
               ⚠️ REGLA: Escribe el texto del VERSO DEL ALELUYA completo ("Alleluia. V. [Texto]"), no solo la palabra "Aleluya".
            8. Evangelio [DIÁCONO/SACERDOTE]: (Lectura completa - ⚠️ ESCRIBE EL TEXTO COMPLETO - Rúbrica: CANTADO hacia el norte).
               ${isAshWednesday ? `
               ⚠ **MIÉRCOLES DE CENIZA - BENDICIÓN E IMPOSICIÓN DE CENIZAS**
               (Insertar aquí el rito completo de bendición e imposición de cenizas ANTES del Ofertorio).
               - Antífona: Exaudi nos, Domine...
               - 4 Oraciones de bendición.
               - Rúbrica: Imposición con la fórmula "Memento, homo, quia pulvis es...".
               ` : ''}
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
            14. PREFACIO PROPIO (Del Tiempo o Fiesta) y Sanctus.
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
            20. Pater Noster (Completo). 
            21. EMBOLISMO ("Libera nos, quaesumus..." - VOX SECRETA > Completo).
            22. Agnus Dei. Oraciones privadas antes de la comunión (> Domine Jesu Christe...).
            23. Domine, non sum dignus (x3). Comunión del Sacerdote y Fieles. Antífona de Comunión.
            24. Post-Comunión (Propia). 
            25. AVISOS PARROQUIALES (Rubrica breve).
            26. Ite Missa est.
            27. PLACEAT TIBI (Oración final secreta ante el altar >):
               > Placeat tibi, sancta Trinitas, obsequium servitutis meae...
            28. BENDICIÓN FINAL (Benedicat vos omnipotens Deus...).
            29. Último Evangelio (Initium sancti Evangelii secundum Ioannem - TEXTO COMPLETO).
            30. ${marianAntiphonText}
            31. PROCESIÓN DE SALIDA (Rúbrica).
        `;
    }

    // --- 2. MISA ANGLICANA (BCP 2019) ---
    if (tradition === 'anglicana') {
        const marianAntiphonText = `(Opcional) Antífona Mariana: ${marianAntiphon.name}.`;

        return `
            ${basePrompt}
            FUENTE: Libro de Oración Común (ACNA 2019 - Edición en Español).
            ESTILO: Español Moderno Solemne ("Tú/Usted"). 
            ⛔ PROHIBIDO: "Vos", "Os", "Vuestros" (Arcaísmos). Usa lenguaje actual y fiel al BCP 2019.
            ${omissionRules}

            ⚠️ INSTRUCCIÓN DE SEGURIDAD PARA ORACIONES FIJAS (CRÍTICO):
            NO ESCRIBAS el texto del Gloria, Credo, Santo, Padre Nuestro ni Cordero.
            EN SU LUGAR, USA EXCLUSIVAMENTE ESTOS MARCADORES EXACTOS (Yo los reemplazaré por el texto oficial):
            - [[INSERTAR_GLORIA]]
            - [[INSERTAR_CREDO]]
            - [[INSERTAR_SANTO]]
            - [[INSERTAR_PADRE_NUESTRO]]
            - [[INSERTAR_CORDERO]]
            (Nota: Para el "Kyrie" o "Decálogo" usa texto propio si varía del romano, pero para lo demás usa marcadores).

            ESTRUCTURA OBLIGATORIA (TEXTOS COMPLETOS - CON TÍTULOS CLAROS):
            0. PROCESIÓN DE ENTRADA (Himno, Rúbrica de ingreso y Veneración del Altar).
            1. RITOS INICIALES:
               - Aclamación Inicial ("Bendito sea Dios: Padre, Hijo y Espíritu Santo...").
               - Colecta de Pureza ("Omnipotente Dios, para quien todos los corazones...").
            2. EL DECÁLOGO o EL SUMARIO DE LA LEY (Leído completo).
            3. KYRIE ELEISON (Señor, ten piedad).
               ${(season === 'adviento' || season === 'cuaresma') ? '- (NO PONGAS GLORIA: Tiempo Penitencial).' : '- Gloria: USA EL MARCADOR \`[[INSERTAR_GLORIA]]\` (Solo si es Domingo/Solemnidad).'}
            4. COLECTA DEL DÍA (Propia).
               ⚠️ OBLIGATORIO: Incluir el SALUDO ("El Señor esté con ustedes...") antes del Oremos y la Colecta.
            5. LITURGIA DE LA PALABRA:
               - Primera Lectura (Antiguo Testamento) [LECTOR]: ⚠️ ESCRIBE EL TEXTO BÍBLICO COMPLETO (Verbatim).
               - SALMO RESPONSORIAL [SALMISTA o LECTOR]: (Indica la Antífona y las Estrofas COMPLETAS).
               - Segunda Lectura (Epístola) [LECTOR]: ⚠️ ESCRIBE EL TEXTO BÍBLICO COMPLETO (Verbatim).
               ${(season === 'cuaresma') ? '- TRACTO / VERSO [CORO]: (NO PONGAS ALELUYA. Usa el verso antes del Evangelio propio de Cuaresma).' : '- ALELUYA [CORO]: (Incluye el VERSO propio antes del Evangelio).'}
               - Evangelio [DIÁCONO o SACERDOTE]:
                 ⚠️ Incluir SALUDO ("El Señor esté con ustedes...") y Anuncio del Evangelio.
                 ⚠️ LUEGO: ESCRIBE EL TEXTO DEL EVANGELIO COMPLETO PALABRA POR PALABRA.
            6. HOMILÍA y CREDO NICENO.
               ${isAshWednesday ? `
               ⚠ **MIÉRCOLES DE CENIZA**
               **INVITACIÓN A UNA CUARESMA SANTA** (Texto BCP: "Hermanos y hermanas en Cristo...").
               **IMPOSICIÓN DE LA CENIZA**
               - Antes de orar: Rúbrica del silencio.
               - Oración sobre la ceniza (Texto BCP).
               - Imposición: "Acuérdate de que eres povo y al polvo volverás".
               - Salmo 51 (Miserere mei, Deus) recitado durante la imposición.
               (Omitir Credo si así lo indica la rúbrica BCP, o ponerlo después).
               ` : `- Credo: ${selectedDate.getDay() === 0 ? 'USA EL MARCADOR \`[[INSERTAR_CREDO]]\`.' : '(NO PONGAS CREDO: Es día ferial).'}`}
            7. ORACIÓN DE LOS FIELES:
               ⚠️ ADAPTADA A LAS LECTURAS: Redacta peticiones específicas basadas en el Evangelio/Lecturas de hoy.
               (Formato BCP completo).
            8. CONFESIÓN Y ABSOLUCIÓN:
               - Exhortación breve.
               - Confesión General ("Omnipotente y misericordiosísimo Padre...").
               - Absolución y Palabras de Consuelo.
            9. LA PAZ.
               ${(celebrationLabel && celebrationLabel.toLowerCase().includes('jueves santo')) ? '(OMITIR RITO DE LA PAZ por Jueves Santo).' : ''}
            10. LITURGIA EUCARÍSTICA:
               - Ofertorio.
               - Doxología.
               - GRAN ACCIÓN DE GRACIAS (Plegaria Eucarística):
                 - Sursum Corda ("El Señor esté con ustedes...").
                 - PREFACIO PROPIO (Estacional o de Fiesta) y Sanctus: USA EL MARCADOR \`[[INSERTAR_SANTO]]\`.
                 - Oración de Consagración (Texto completo BCP 2019 Estándar).
                 - Aclamación Memorial.
                 - Epíclesis y Doxología Final.
            11. RITO DE COMUNIÓN:
               - PADRE NUESTRO: USA EL MARCADOR \`[[INSERTAR_PADRE_NUESTRO]]\`.
               - DOXOLOGÍA O EMBOLISMO (Según uso BCP).
               - Oración de Humilde Acceso (Prayer of Humble Access: "No presumimos...").
               - Agnus Dei: USA EL MARCADOR \`[[INSERTAR_CORDERO]]\`.
               - Comunión de los fieles.
            12. POST-COMUNIÓN:
               - Oración de Acción de Gracias.
            13. RITOS FINALES:
               - AVISOS DE LA COMUNIDAD.
               - BENDICIÓN Y DESPEDIDA.
               - ${marianAntiphonText}
               - PROCESIÓN DE SALIDA.
        `;
    }

    // --- 3. ORDINARIATO (DIVINE WORSHIP) ---
    if (tradition === 'ordinariato') {
        const marianAntiphonText = `Antífona Final a la Virgen: ${marianAntiphon.name}.`;

        return `
            ${basePrompt}
            FUENTE MISAL: Divine Worship: The Missal.
            Fuente LECTURAS: Leccionario Romano (RSV-2CE) - Coincide con el Ciclo Romano EXACTO (mismas lecturas que la Misa Romana).
            ESTILO: Español Sacro Elevado (Patrimonio Anglicano).
            ${omissionRules}

            ⚠️ INSTRUCCIÓN DE SEGURIDAD PARA ORACIONES FIJAS:
            - [[INSERTAR_GLORIA]]
            - [[INSERTAR_CREDO]]
            - [[INSERTAR_SANTO]]
            - [[INSERTAR_PADRE_NUESTRO]]
            - [[INSERTAR_CORDERO]]

            ESTRUCTURA OBLIGATORIA (CON TÍTULOS BILINGÜES):
            0. PROCESIÓN DE ENTRADA.
            1. INTROITUS (Canto de Entrada) y Ritos Iniciales (Colecta de Pureza obligatoria).
               ${(season === 'adviento' || season === 'cuaresma') ? '- (NO PONGAS GLORIA: Tiempo Penitencial).' : '- GLORIA IN EXCELSIS: USA EL MARCADOR \`[[INSERTAR_GLORIA]]\`.'}
            2. COLLECTA (Oración Colecta).
            3. LITURGIA DE LA PALABRA:
               - LECTIO / PRIMERA LECTURA [LECTOR]: ⚠️ TEXTO COMPLETO (Sigue el Leccionario Romano de hoy).
               - SALMO RESPONSORIAL [LECTOR Y PUEBLO]: (¡OBLIGATORIO RESPONSORIAL! NO GRADUAL).
                 * Escribe la RESPUESTA (R.) y las ESTROFAS claramente. 
               - EPISTOLA / SEGUNDA LECTURA [LECTOR]: ⚠️ TEXTO COMPLETO.
               ${(season === 'cuaresma') ? '- TRACTUS (Aclamación antes del Evangelio sin Aleluya).' : '- ALELUYA [CORO]: (Incluye el texto del VERSO propio).'}
               - EVANGELIUM [DIÁCONO]: ⚠️ TEXTO COMPLETO.
            4. Sermón y CREDO: ${selectedDate.getDay() === 0 ? 'USA EL MARCADOR \`[[INSERTAR_CREDO]]\`.' : '(NO PONGAS CREDO: Es día ferial).'}
            ${isAshWednesday ? `
            ⚠ **MIÉRCOLES DE CENIZA**
            - BENDICIÓN E IMPOSICIÓN DE CENIZA.
            - Salmo 50 (Miserere mei, Deus).
            - Oración Final de las Cenizas.
            ` : ''}
            5. ORATIO FIDELIUM (Oración Universal):
               - Intercesiones (ADAPTADAS AL TEMA DE LAS LECTURAS).
               - Confesión y Absolución (Penitential Rite).
            6. OFFERTORIUM (Antífona) y Orate Fratres.
            7. CANON MISSAE (VERSIÓN PATRIMONIAL EN ESPAÑOL):
               - PRAEFATIO PROPIO y SANCTUS: USA EL MARCADOR \`[[INSERTAR_SANTO]]\`.
               - CANON ROMANO COMPLETO (Oración Eucarística I).
               > "Te rogamos pues, clementísimo Padre..." (Todo el texto verbatim en ESPAÑOL).
            8. Rito de Comunión:
               - PATER NOSTER: USA EL MARCADOR \`[[INSERTAR_PADRE_NUESTRO]]\`.
               - EMBOLISMO ("Líbranos Señor...").
               - Rito de la Paz.
               ${(celebrationLabel && celebrationLabel.toLowerCase().includes('jueves santo')) ? '(OMITIR RITO DE LA PAZ por Jueves Santo).' : ''}
               - AGNUS DEI: USA EL MARCADOR \`[[INSERTAR_CORDERO]]\`.
               - Oración de Humilde Acceso (Prayer of Humble Access).
            9. COMMUNIO y Oración de Acción de Gracias.
            10. AVISOS, BENEDICTIO y Despedida.
            11. ${marianAntiphonText}
            12. PROCESIÓN DE SALIDA.
        `;
    }

    // --- 4. ROMANA (NOVUS ORDO) ---
    // Fallback
    const marianAntiphonText = `Saludo a la Virgen: ${marianAntiphon.name}.`;

    return `
        ${basePrompt}
        FUENTE: Misal Romano (3ª Edición).
        IDIOMA: Español.
        ${omissionRules}
        
        ⚠️ INSTRUCCIÓN DE SEGURIDAD PARA ORACIONES FIJAS (CRÍTICO):
        NO ESCRIBAS el texto del Gloria, Credo, Santo, Padre Nuestro ni Cordero.
        EN SU LUGAR, USA EXCLUSIVAMENTE ESTOS MARCADORES EXACTOS (Yo los reemplazaré por el texto oficial):
        - [[INSERTAR_YO_CONFIESO]]
        - [[INSERTAR_GLORIA]]
        - [[INSERTAR_CREDO]]
        - [[INSERTAR_SANTO]]
        - [[INSERTAR_PADRE_NUESTRO]]
        - [[INSERTAR_CORDERO]]

        ESTRUCTURA OBLIGATORIA:
        1. RITOS INICIALES:
           - Rúbrica de entrada y Saludo.
           - Acto Penitencial: Escribe ÚNICAMENTE el marcador \`[[INSERTAR_YO_CONFIESO]]\`. ¡NO escribas la oración manualmente!
           - Kyrie (Señor ten piedad).
           ${(season === 'adviento' || season === 'cuaresma') ? '- (NO PONGAS GLORIA: Tiempo Penitencial).' : '- Gloria: USA EL MARCADOR \`[[INSERTAR_GLORIA]]\` (Solo si es Domingo/Solemnidad).'}
           - Oración Colecta (Propia del día).

        2. LITURGIA DE LA PALABRA:
           - 1ª Lectura [LECTOR]: ⚠️ TEXTO BÍBLICO COMPLETO (Verbatim - Usa Torres Amat).
           - Salmo Responsorial [SALMISTA]: (Respuesta y estrofas completas).
           - 2ª Lectura [LECTOR]: ⚠️ TEXTO BÍBLICO COMPLETO (Verbatim).
           ${(season === 'cuaresma') ? '- TRACTO / VERSO [CORO]: (NO PONGAS ALELUYA. Usa el verso antes del Evangelio propio de Cuaresma).' : '- ALELUYA [CORO]: Verso propio.'}
           - Evangelio [DIÁCONO/SACERDOTE]: ⚠️ TEXTO COMPLETO (Verbatim).
        
        3. HOMILÍA Y CREDO:
           - Homilía (Reflexión breve).
           ${isAshWednesday ? `
           ⚠ **MIÉRCOLES DE CENIZA**
           **BENDICIÓN E IMPOSICIÓN DE LA CENIZA**
           - Rúbrica: Después de la homilía, el sacerdote de pie dice la oración de bendición.
           - Oración: "Oh Dios, que te dejas vencer..."
           - Rúbrica: Imposición con la fórmula "Conviértete y cree en el Evangelio" o "Acuérdate de que eres polvo...".
           - Mientras se impone la ceniza se canta: (Sugerir canto o salmo penitencial).
           - Terminada la imposición, el sacerdote se lava las manos.
           
           (OMITIR ACTO PENITENCIAL DE RITOS INICIALES CUANDO HAY CENIZA).
           (NO HAY CREDO).
           ` : `- Credo: ${selectedDate.getDay() === 0 ? 'USA EL MARCADOR \`[[INSERTAR_CREDO]]\`.' : '(NO PONGAS CREDO: Es día ferial).'}`}

        4. ORACIÓN UNIVERSAL:
           - Redacta peticiones adaptadas a las lecturas de hoy.

        5. LITURGIA EUCARÍSTICA:
           - Ofertorio y Oración sobre las ofrendas.
           - PLEGARIA EUCARÍSTICA:
             - Prefacio y Santo: USA EL MARCADOR \`[[INSERTAR_SANTO]]\`.
             - Plegaria Eucarística II (Texto completo, consagración verbatim).
             - Doxología final.

        6. RITO DE COMUNIÓN:
           - Padre Nuestro: USA EL MARCADOR \`[[INSERTAR_PADRE_NUESTRO]]\`.
           - Embolismo.
           ${(celebrationLabel && celebrationLabel.toLowerCase().includes('jueves santo')) ? '- (RITO DE LA PAZ OMITIDO por Jueves Santo).' : '- Rito de la Paz.'}
           - Cordero: USA EL MARCADOR \`[[INSERTAR_CORDERO]]\`.
           - Comunión y Oración Post-comunión.

        7. RITO DE CONCLUSIÓN:
           - Avisos y Bendición final.
           - ${marianAntiphonText}
    `;
};
