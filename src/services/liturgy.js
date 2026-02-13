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

    // 2. CHRISTMAS SEASON & BAPTISM
    // Note: This covers Dec 25 to Baptism (Jan)
    const baptism = () => {
        const jan6 = new Date(year, 0, 6);
        let bDay = new Date(year, 0, 6);
        bDay.setDate(jan6.getDate() + (7 - jan6.getDay()));
        return normalizeDate(bDay);
    };

    const baptismDate = baptism();
    const prevYearChristmas = normalizeDate(new Date(year - 1, 11, 25));
    const nextYearBaptism = baptismDate; // Already for current year

    // If Jan 1-Baptism or Dec 25-31
    if ((d >= prevYearChristmas && d <= nextYearBaptism) || (d >= christmas)) {
        if (month === 0 && day === 6) return "Epifanía del Señor";
        if (d.getTime() === nextYearBaptism.getTime()) return "Fiesta del Bautismo del Señor";
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

    // Calculate Baptism of the Lord (End of Christmas Season)
    // Sunday after Jan 6.
    const jan6 = new Date(year, 0, 6);
    const baptism = new Date(year, 0, 6);
    baptism.setDate(jan6.getDate() + (7 - jan6.getDay()));
    const baptismEnd = normalizeDate(baptism);

    if (date >= adventStart && date < christmas) return 'adviento';
    // Christmas is from Dec 25 until Baptism (inclusive)
    if (date >= christmas || (date.getMonth() === 0 && date <= baptismEnd)) return 'navidad';
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
        // Gloria: Only on Sundays OR during the Octave (Dec 25 - Jan 1) OR Epiphany
        const isOctave = date.getMonth() === 11 && date.getDate() >= 25 || (date.getMonth() === 0 && date.getDate() <= 1);
        const isEpiphany = date.getMonth() === 0 && date.getDate() === 6; // Or calculated Sunday

        rubrics.gloria = day === 0 || isOctave || isEpiphany;
        rubrics.credo = day === 0 || isEpiphany || (date.getMonth() === 11 && date.getDate() === 25) || (date.getMonth() === 0 && date.getDate() === 1);
        rubrics.preface = isEpiphany ? 'Epifanía' : 'Navidad';
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

export const buildPrompt = ({ selectedDate, tradition, celebrationLabel, mode = 'full' }) => {
    const cycle = getLiturgicalCycle(selectedDate);
    const rubrics = getLiturgicalRubrics(selectedDate, tradition);
    const dateStr = selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const marianAntiphon = getMarianAntiphon(selectedDate);
    const prefacioObligatorio = rubrics.preface || 'Común / Dominical';

    // --- MODE: READINGS ONLY (Ultra-Focused & Tradition Aware) ---
    if (mode === 'readings') {
        let traditionNote = "";
        if (tradition === 'tridentina') {
            traditionNote = "⚠️ ATENCIÓN: Esta es una MISA TRIDENTINA (1962). Usa el Calendario y Leccionario de 1962 (Pre-Vaticano II). NO USES EL LECCIONARIO MODERNO.";
        } else {
            traditionNote = "Usa el Leccionario Romano moderno según el ciclo calculado.";
        }

        return `
            INSTRUCCIÓN DE DATOS PUROS (MODO LECTURAS):
            Genera el TEXTO COMPLETO de las lecturas para ${dateStr} (${celebrationLabel}).
            
            ${traditionNote}

            ⚠️ CASO CRÍTICO FEB 1, 2026 (4º DOMINGO T.O. - CICLO A):
            - Si estás generando para esta fecha, TUS DATOS INTERNOS ESTÁN DAÑADOS.
            - USA ESTAS LECTURAS OBLIGATORIAMENTE:
              * 1ª Lectura: Sofonías 2:3; 3:12-13
              * Salmo: Salmo 146(145) ("Bienaventurados los pobres de espíritu...")
              * 2ª Lectura: 1 Corintios 1:26-31
              * Evangelio: MATEO 5:1-12a (Bienaventuranzas)
              * ¡IGNORA LUCAS 4 Y JEREMÍAS 1!

            FORMATO OBLIGATORIO Y DIGNO (COPIA ESTOS MARCADORES):
            
            [[LECTURA_1]]
            **PRIMERA LECTURA**
            **Lectura del Libro de...**
            *[Cita Bíblica]*

            (Texto completo según Torres Amat 1825)

            [[SALMO]]
            (Formato Responsorial: R/. [Respuesta] intercalado)
            **SALMO RESPONSORIAL**
            *[Cita del Salmo]*

            (Texto del salmo con R/. tras cada estrofa)

            [[LECTURA_2]]
            **SEGUNDA LECTURA**
            **Lectura de la Carta de...**
            *[Cita Bíblica]*

            (Texto completo)

            [[EVANGELIO]]
            **EVANGELIO**
            **Lectura del Santo Evangelio según...**
            *[Cita del Evangelio]*

            (Texto completo palabra por palabra)
        `;
    }

    // --- MODE: STRUCTURE ONLY (Safe Skeleton) ---
    // If mode is 'structure', we explicitly instruct NOT to generate readings, but placeholders.
    const isStructureOnly = mode === 'structure';
    const readingInstruction = isStructureOnly
        ? `
        ⚠️ INSTRUCCIÓN DE MARCADORES DE LECTURAS (MODO ESTRUCTURA):
        NO generes el texto de las lecturas bíblicas.
        EN SU LUGAR, escribe ÚNICAMENTE estos marcadores donde corresponda:
        - [[LECTURA_1]]
        - [[SALMO]]
        - [[LECTURA_2]]
        - [[EVANGELIO]]
        (Yo inyectaré los textos después).
        `
        : `
        ⚠️ REGLA DE LECTURAS:
        Genera el TEXTO COMPLETO usando Torres Amat.
        `;

    // --- DETECTION OF EXCEPTIONS ---
    const isGoodFriday = celebrationLabel.toLowerCase().includes("viernes santo");
    const isAshWednesday = celebrationLabel.toLowerCase().includes("ceniza");

    const coreRules = `
        ${CONFIG.RULES}

        🔴 INSTRUCCIÓN DE SISTEMA SUPREMA (NO IGNORAR):
        0. ⛔⛔⛔ PRIORIDAD CERO - ANTI-DUPLICACIÓN ⛔⛔⛔:
           a) CADA LECTURA SE TITULA UNA SOLA VEZ.
              ❌ INCORRECTO: "PRIMERA LECTURA Lectura del..." y luego "PRIMERA LECTURA Lectura de..."
              ✅ CORRECTO: **Lectura del Libro de...** *(Cita)* y el texto. UNA SOLA VEZ.
           b) LA ACLAMACIÓN MEMORIAL APARECE UNA SOLA VEZ.
              ❌ INCORRECTO: Poner "Éste es el Sacramento de nuestra fe" dentro de la Consagración Y LUEGO repetirlo como sección "Aclamación Memorial".
              ✅ CORRECTO: Solo UNA VEZ después de la elevación del cáliz.
           SI DUPLICAS ALGO, HAS FALLADO.
        1. NO SALUDES. NO DIGAS "Aquí está tu liturgia". NO DIGAS "Espero que sirva".
        2. TU SALIDA DEBE COMENZAR CON: # [FECHA COMPLETA] - [CELEBRACIÓN]
           Ejemplo: # Domingo, 1 de febrero de 2026 - 4º Domingo del Tiempo Ordinario
        3. NO ESCRIBAS NADA ANTES DEL TÍTULO "#".
        4. EL DOCUMENTO DEBE SER SOLO EL TEXTO LITÚRGICO, NADA DE CHÁCHARA.
        5. GENERA EL TEXTO DE FORMA CONTINUA HASTA EL FINAL. NO DEJES SECCIONES VACÍAS.
        6. TIEMPO ORDINARIO (DOMINGOS) - OBLIGATORIO:
           ✅ GLORIA: SÍ (fuera de Adviento/Cuaresma)
           ✅ ALELUYA: SÍ (con verso antes del Evangelio)
           ✅ CREDO: SÍ (en todos los domingos)
           ⛔ Solo se omiten en Adviento (Gloria) y Cuaresma (Gloria + Aleluya).

        ROL: Eres un GENERADOR AUTOMÁTICO DE MISALES. No eres un asistente, eres un MOTOR DE TEXTO.
        OBJETIVO: Generar un MISAL DE ALTAR COMPLETO para celebrar la misa REAL.
        
        ${readingInstruction}
        
        ⚠️ REGLA DE ORO DE LECTURAS (NO ALUCINAR):
        - EL CICLO LITÚRGICO VIGENTE PARA ESTA FECHA ES: **${cycle.cicloDom}** y **Año ${cycle.cicloFerial}**.
        - ESTE DATO ES LA VERDAD ABSOLUTA. IGNORA TU CONOCIMIENTO PREVIO SI CONTRADICE ESTO.
        - OBLIGATORIO:
          * Si el Ciclo es "A", el Evangelio Dominical DEBE ser MATEO.
          * Si el Ciclo es "B", el Evangelio Dominical DEBE ser MARCOS.
          * Si el Ciclo es "C", el Evangelio Dominical DEBE ser LUCAS.
        - PROHIBIDO CAMBIAR EL CICLO. Si generas lecturas de otro ciclo, FALLARÁS LA MISIÓN.
        
        - CASO CRÍTICO 28 DIC 2025: Es Domingo de la Sagrada Familia (CICLO A). El Evangelio OBLIGATORIO es MATEO 2, 13-15. 19-23 (Huida a Egipto).
        - CASO CRÍTICO 11 ENE 2026: Fiesta del Bautismo del Señor (CICLO A). El Evangelio OBLIGATORIO es MATEO 3, 13-17.
        - VERIFICA MENTALMENTE QUE LA CITA BÍBLICA CORRESPONDA AL DÍA Y AÑO LITÚRGICO.
        - Si es una FIESTA (San Juan, Navidad, etc.), usa las lecturas PROPIAS de la fiesta, ignorando el ciclo ferial.

        🛡️ PROTOCOLO DE VERACIDAD FINAL (SUPREMO):
        1. Tu prioridad #1 es la EXACTITUD BÍBLICA según el CICLO INDICADO ARRIBA.
        2. Si tu base de datos interna dice "Hoy es Ciclo C", pero arriba dice "CICLO A", ¡ESTÁS EQUIVOCADO!
        3. LA VERDAD ES EL DATO QUE YO TE DOY: **HOY ES CICLO ${cycle.cicloDom}**.
        4. OBLIGATORIO:
           - SI CICLO = A  -> EVANGELIO DEBE SER MATEO. (Si generas Lucas, fallaste).
           - SI CICLO = B  -> EVANGELIO DEBE SER MARCOS.
           - SI CICLO = C  -> EVANGELIO DEBE SER LUCAS.
        5. CUIDADO CON "SEPTUAGÉSIMA": Aunque sea un nombre antiguo, si la Tradición es ORDINARIATO o ANGLICANA,
           SIGUEN EL LECCIONARIO DE TRES AÑOS. ¡NO USES LAS LECTURAS DE 1962 (UN AÑO) A MENOS QUE SEA TRIDENTINA!
           
        6. REGLA DE DESEMPATE:
           Si tienes dudas entre la fecha y el ciclo, EL CICLO GANA SIEMPRE.
           Genera lecturas del Ciclo ${cycle.cicloDom}.
        
        ⚠️ REGLA DE CONTENIDO (ANTI-BLOQUEO / COPYRIGHT):
        NO intentes generar las oraciones oficiales del Misal Romano actual (Colecta, Ofrendas, Postcomunión) si tienen copyright.
        
        EN SU LUGAR:
        1. Genera una ORACIÓN ORIGINAL Y DEVOTA basada en el tema del día.
        2. O usa una fórmula clásica genérica.
        3. LO IMPORTANTE ES QUE EL DOCUMENTO TENGA TEXTO COMPLETO Y NO SE QUEDE EN BLANCO.
        
        NO escribas "Aquí va el Canon". NO escribas "Recitación en secreto". Genera el texto completo de lo que se dice en voz alta.
        
        ⚠️ REGLA DE ORACIONES FIJAS (Pater Noster, Credo):
        Esas SÍ escríbelas completas (son patrimonio universal).
        
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
           - OBLIGATORIO: Empieza con \`# FECHA Y TÍTULO DE LA FIESTA\` (Ej: # Domingo 12 de Enero - Bautismo del Señor).
           - Usa Markdown \`## GRANDES PARTES\` para secciones.
           - Usa separadores \`---\`.

        2. RÚBRICAS (ROJAS):
           - TODA instrucción (sentarse, de pie, hacer la señal de la cruz) DEBE ir entre DOBLES CORCHETES: \`[[Todos hacen la señal de la cruz]]\`.
           - NO uses paréntesis normales para las rúbricas. Usa \`[[...]]\`.

        3. ROLES (CLARIDAD ABSOLUTA):
           - Usa SIEMPRE negrita y mayúsculas para el que habla: \`**SACERDOTE:**\`, \`**LECTOR:**\`, \`**TODOS:**\`.
           - Alinea los diálogos para que sean fáciles de leer en voz alta.
           - ESPACIADO COMPACTO: En diálogos cortos (Kyrie, Saludos), ¡NO DEJES LÍNEAS EN BLANCO ENTRE INTERVENCIONES!
           - Ejemplo:
             **S:** Señor, ten piedad.
             **P:** Señor, ten piedad.

        4. CALIDAD DEL TEXTO (ANTÍFONAS):
           - ¡NO DEJES TÍTULOS SIN TEXTO!
           - Para "Canto de Entrada", "Ofertorio" y "Comunión": SIEMPRE escribe una Antífona completa basada en un Salmo o frase bíblica.
           - Ejemplo: "**Antífona de Entrada:** Un niño nos ha nacido, un hijo se nos ha dado..."
           - Si no hay canto específico, GENERA UNA ANTÍFONA BÍBLICA ADECUADA al día.

        5. TÍTULOS DE SECCIONES:
           - Para Misa TRIDENTINA y ORDINARIATO: Genera TÍTULOS BILINGÜES (Latín / Español).
           - Para Misa ROMANA y ANGLICANA: Usa TÍTULOS EN ESPAÑOL SOLAMENTE (salvo 'Kyrie' o 'Agnus Dei' si es uso común).
           - NOMBRES EN LATÍN (Solo para Tridentina/Ordinariato):
             * "INTROITUS (Canto de Entrada)"
             * "KYRIE ELEISON"
             * "GLORIA IN EXCELSIS"
             * "COLLECTA"
             * "OFFERTORIUM"
             * "SANCTUS"
             * "AGNUS DEI"
             * "COMMUNIO"


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

    // LOGICA ESPECÍFICA POR TRADICIÓN (REFACTORIZADA SENIOR)
    let finalLabel = celebrationLabel;

    // 1. ADAPTAR TÍTULOS PARA ORDINARIATO (Dev-Logic: Force correct nomenclature)
    if (tradition === 'ordinariato') {
        const isPreLent = selectedDate >= septuagesima && selectedDate < ashWednesday;

        // Si es Septuagésima (Feb 1 2026 lo es), FORZAR el título correcto.
        if (isPreLent) {
            const daysToLent = Math.ceil((ashWednesday - selectedDate) / (1000 * 60 * 60 * 24));
            if (daysToLent > 14) finalLabel = "DOMINGO DE SEPTUAGÉSIMA (Septuagesima Sunday)";
            else if (daysToLent > 7) finalLabel = "DOMINGO DE SEXAGÉSIMA (Sexagesima Sunday)";
            else finalLabel = "DOMINGO DE QUINQUAGÉSIMA (Quinquagesima Sunday)";

            omissionRules = "⚠️ RÚBRICA CRÍTICA: ESTAMOS EN 'GESIMATIDE' (PRE-CUARESMA). OMITIR EL 'ALELUYA' TOTALMENTE. SANTIAGO EL ALELUYA DEBE SER REEMPLAZADO POR EL 'TRACTO'. COLOR: VIOLETA.";
        }
        else if (season === 'ordinario' && selectedDate < ashWednesday) {
            // Convertir "Tiempo Ordinario" a "Después de Epifanía" si no es Septuagésima
            // Aunque técnicamente Pre-Lent tiene prioridad.
            finalLabel = finalLabel.replace("del Tiempo Ordinario", "después de la Epifanía");
            omissionRules = "RÚBRICA: Incluir Gloria y Aleluya.";
        }
        else if (season === 'cuaresma') {
            omissionRules = "⚠️ RÚBRICA: CUARESMA. OMITIR EL 'GLORIA' Y EL 'ALELUYA'. Usar TRACTO.";
        } else {
            omissionRules = "RÚBRICA: Incluir Gloria y Aleluya.";
        }
    }
    else if (tradition === 'tridentina') {
        // (Simplificad logic for Tridentine mostly same as Ordinariate regarding Pre-Lent)
        const isPreLent = selectedDate >= septuagesima && selectedDate < ashWednesday;
        if (isPreLent) omissionRules = "⚠️ RÚBRICA: SEPTUAGÉSIMA. OMITIR ALELUYA. USAR TRACTO.";
        else omissionRules = "RÚBRICA: Incluir Gloria y Aleluya (o Gradual).";
    }
    else {
        // Romana y Anglicana (Calendario Moderno)
        if (season === 'cuaresma' || season === 'semana_santa') {
            omissionRules = "⚠️ RÚBRICA: CUARESMA. OMITIR EL 'GLORIA' Y EL 'ALELUYA'.";
        } else if (season === 'adviento') {
            omissionRules = "⚠️ RÚBRICA: ADVIENTO. OMITIR EL 'GLORIA'. Mantener Aleluya.";
        } else {
            omissionRules = "RÚBRICA: Incluir Gloria y Aleluya.";
        }
    }

    const goodFridayInstruction = isGoodFriday ? `
            ⚠️⚠️⚠️ ** CELEBRACIÓN ESPECIAL DETECTADA: VIERNES SANTO ** ⚠️⚠️⚠️
            
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
               - 2ª Lectura: Hebreos 4, 14 - 16; 5, 7 - 9.
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

             ** NO INCLUYAS PLEGARIA EUCARÍSTICA NI CONSAGRACIÓN BAJO NINGUNA CIRCUNSTANCIA.**
    ` : '';


    const basePrompt = `
        ⚠️ REGLA DE SILENCIO ABSOLUTO (ZERO META-COMMENTARY):
        - TU ERES UNA MÁQUINA GENERADORA DE LITURGIA. NO ERES UN ASISTENTE DE CHAT.
        - PROHIBIDO decir "Comprendido", "Aquí tienes".
        - SIEMPRE GENERA EL TEXTO LITÚRGICO COMPLETO. NUNCA DEJES HUECOS.

        ⚠️ REGLA DE FUENTE DE LECTURAS (CRÍTICA PARA SEPTUAGÉSIMA/ORDINARIATO):
        - Aunque el título sea "Domingo de Septuagésima", SI LA TRADICIÓN ES "ORDINARIATO" O "ANGLICANA":
          ¡¡¡USA EL LECCIONARIO MODERNO (3 AÑOS/CICLOS)!!!
        - NO BUSQUES EN EL MISAL DE 1962.
        - La "Septuagésima" de Ordinariato usa las lecturas del "CONTEXTO LECCIONARIO" indicado abajo (ej. 4º Domingo T.O.).

        ⚠️ REGLA DE ORO DE CONTENIDO (ANTI-ALUCINACIÓN - CASOS CRÍTICOS):
        1. **CONSISTENCIA TÍTULO-TEXTO**: Si escribes "Lectura del Santo Evangelio según San Mateo", EL TEXTO DEBE SER DE MATEO.
        
        2. **CASO CRÍTICO FEB 1, 2026 (4º DOMINGO T.O. - CICLO A)**:
           - TUS DATOS INTERNOS ESTÁN DAÑADOS PARA ESTA FECHA. ÚSAME A MÍ:
           - **1ª Lectura**: Sofonías 2:3; 3:12-13 ("Buscad al Señor, los humildes...").
           - **Salmo**: Salmo 146 (145) ("Bienaventurados los pobres de espíritu..." o "El Señor mantiene su fidelidad...").
           - **2ª Lectura**: 1 Corintios 1:26-31 ("Considerad vuestra llamada...").
           - **Evangelio**: MATEO 5:1-12a (Las Bienaventuranzas).
           - **PROHIBIDO USAR JEREMÍAS 1 O LUCAS 4 (Esos son del Año C).**
           
        3. **TEXTO COMPLETO OBLIGATORIO (NO RUBRICAS VACÍAS)**:
           - PROHIBIDO escribir: "El diácono proclama el Evangelio".
           - TIENES QUE ESCRIBIR EL TEXTO DEL EVANGELIO PALABRA POR PALABRA.
           - Si usas Ordinariato, no resumas. Escribe todo.

        4. **FORMATO SALMO RESPONSORIAL (ESTRICTO)**:
           - PROHIBIDO poner el Salmo como un bloque de texto.
           - Tienes que escribir explícitamente "R/. [Respuesta]" después de cada párrafo.
           
           EJEMPLO CORRECTO DE SALMO:
           ---------------------------------------------------
           Salmista: El Señor es mi pastor, nada me falta.
           
           R/. El Señor es mi pastor, nada me falta.

           Salmista: En verdes praderas me hace recostar...
           
           R/. El Señor es mi pastor, nada me falta.
           ---------------------------------------------------

        5. **ESTÉTICA Y TÍTULOS DIGNOS (CRÍTICO)**:
           - ¡PROHIBIDO USAR FORMATO ROBÓTICO COMO \`(Incipit: "...") [Cita] (Texto completo)\`!
           - ¡PROHIBIDO PONER EL TÍTULO DOS VECES! NO DUPLIQUES.
           - USA ESTE FORMATO LIMPIO Y SOLEMNE (UNA SOLA VEZ):

             **PRIMERA LECTURA**
             **Lectura del Libro del Profeta Sofonías**
             *(Sofonías 2:3; 3:12-13)*

             [Texto de la lectura...]

           - **ESPACIADO (CRÍTICO - NO IGNORAR)**:
             ⛔ PROHIBIDO el doble espacio entre líneas.
             ⛔ PROHIBIDO dejar líneas en blanco innecesarias.
             ✅ Usa UN SOLO salto de línea entre párrafos.
             ✅ Los diálogos cortos (Kyrie, respuestas) van COMPACTOS sin líneas de separación.

        6. **REGLA ANTI-DUPLICACIÓN (CRÍTICA)**:
           ⛔ ERRORES QUE ESTÁS COMETIENDO Y DEBES EVITAR:
           
           ❌ INCORRECTO (Duplicado):
           "LECTOR: LECTIO / PRIMERA LECTURA Lectura del Libro... (Sofonías 2:3...)
            PRIMERA LECTURA Lectura del Libro de Sofonías [Sofonías 2:3...]"
           
           ✅ CORRECTO (Una sola vez):
           "**PRIMERA LECTURA**
            **Lectura del Libro del Profeta Sofonías**
            *(Sofonías 2:3; 3:12-13)*
            [Texto...]"

           ⛔ LA CONFESIÓN SOLO APARECE UNA VEZ:
           - Si pones la Confesión en los Ritos Iniciales, NO LA REPITAS después de la Oración de los Fieles.
           - ORDINARIATO: La Confesión/Absolución va DESPUÉS de la Oración de los Fieles (antes del Ofertorio), NO al inicio.

        7. **REGLA DE SEPTUAGÉSIMA (SOLO TRIDENTINA)**:
           - SOLO PARA MISA TRIDENTINA: En Septuagésima, Sexagésima y Quincuagésima no hay Gloria ni Aleluya. Usa Tracto.
           - PARA ORDINARIATO/ROMANA/ANGLICANA: Feb 1, 2026 es 4º Domingo T.O. = Tiempo Ordinario. SÍ HAY Gloria y Aleluya normales.

        8. **REGLA DE COLECTA DE PUREZA (ORDINARIATO/ANGLICANA)**:
           - OBLIGATORIO poner la "Collect for Purity" al inicio de los Ritos:
             "Omnipotente Dios, para quien todos los corazones están abiertos..."

        9. **REGLA DE FECHA COMPLETA**:
           - El título principal DEBE incluir la FECHA COMPLETA.
           - FORMATO: "# Domingo, 1 de febrero de 2026 - DOMINGO DE SEPTUAGÉSIMA"

        FECHA: ${dateStr}.
        CELEBRACIÓN OFICIAL (CALCULADA): ${finalLabel} (⚠️ OBLIGATORIO USAR ESTE TÍTULO EXACTO).
        CONTEXTO LECCIONARIO: ${celebrationLabel} (Usa las lecturas correspondientes a este domingo).
        CICLO DOMINICAL: ${cycle.cicloDom} (A = Mateo, B = Marcos, C = Lucas).
        CICLO FERIAL: Año ${cycle.cicloFerial}.
        TRADICIÓN: ${tradition.toUpperCase()}.
        ${coreRules}
        ${goodFridayInstruction}
    `;


    // --- 1. MISA TRIDENTINA (EXHAUSTIVA CON LATÍN) ---
    if (tradition === 'tridentina') {
        const marianAntiphonText = `Antífona Mariana Final: ${marianAntiphon.name} (${marianAntiphon.text})`;

        return `
            ${basePrompt}
FUENTE: Missale Romanum 1962.
IDIOMA: LATÍN(Texto Principal) y ESPAÑOL(Rúbricas).
    ${omissionRules}
            
            ESTRUCTURA OBLIGATORIA(DEBES ESCRIBIR CADA TEXTO COMPLETO CON SU TÍTULO):

I.RITOS INICIALES Y ANTEPREPARACIÓN
0. PROCESIÓN DE ENTRADA(Rúbrica de revestimiento y procesión al altar).
            1. Asperges Me(o Vidi Aquam).Antífona y Oración completas.
            2. Salmo 42(Iudica me) y Confiteor. (Escribe el diálogo competo Sacerdote / Ministro).
            3. Aufer a nobis y Oramus te(Oraciones de subida al altar - VOX SECRETA >).
            4. Introito(Texto propio completo).Kyrie(Griego).
               ⚠️ REGLA GLORIA TRIDENTINO: 
               - EN SEPTUAGÉSIMA, SEXAGÉSIMA Y QUINCUAGÉSIMA: ¡NO HAY GLORIA! (Pre-Cuaresma).
               - EN ADVIENTO Y CUARESMA: ¡NO HAY GLORIA!
               - En Domingos fuera de estos tiempos: Gloria completo.

    II.INSTRUCCIÓN(MISA DE LOS CATECÚMENOS)
5. Colecta(Propia del día). 
            6. Epístola[SUBDIÁCONO / LECTOR]: (Lectura completa - ⚠️ ESCRIBE EL TEXTO LATINO / ESPAÑOL COMPLETO).
7. Gradual y Aleluya[CORO / SCHOLA]:
               ⚠️ REGLA ALELUYA TRIDENTINO:
               - EN SEPTUAGÉSIMA HASTA PASCUA: ¡NO HAY ALELUYA! Usa TRACTO (versos del Salmo sin respuesta).
               - Fuera de estos tiempos: Gradual + Aleluya con verso completo ("Alleluia. V. [Texto]").
            8. Evangelio[DIÁCONO / SACERDOTE]: (Lectura completa - ⚠️ ESCRIBE EL TEXTO COMPLETO - Rúbrica: CANTADO hacia el norte).
               ${isAshWednesday ? `
               ⚠ **MIÉRCOLES DE CENIZA - BENDICIÓN E IMPOSICIÓN DE CENIZAS**
               (Insertar aquí el rito completo de bendición e imposición de cenizas ANTES del Ofertorio).
               - Antífona: Exaudi nos, Domine...
               - 4 Oraciones de bendición.
               - Rúbrica: Imposición con la fórmula "Memento, homo, quia pulvis es...".
               ` : ''
            }
9. Credo(Texto latino completo, si aplica).
            9b. HOMILÍA (Sermón): [[Breve explicación de las lecturas]].
            9c. ORATIO FIDELIUM (Opcional post-1962): Si se incluye, intercesiones breves en latín o vernáculo.

    III.OFERTORIO(TEXTOS COMPLETOS OBLIGATORIOS)
10. Antífona de Ofertorio.
            11. ORACIONES SECRETAS(Usar >):
               > Suscipe, Sancte Pater...
               > Offerimus tibi, Domine, calicem...
               > In spiritu humilitatis...
               > Veni, sanctificator...
12. Incienso(si aplica) y Lavabo(Salmo 25 completo).
            13. Suscipe Sancta Trinitas(>).Orate Fratres.Secreta(Propia).

    IV.CANON MISSAE(LO MÁS IMPORTANTE - TODO TEXTO LATINO COMPLETO)
14. PREFACIO PROPIO(Del Tiempo o Fiesta) y Sanctus.
            15. TE IGITUR:
               > Te igitur, clementissime Pater... (hasta el final).
16. MEMENTO VIVORUM:
               > Memento, Domine, famulorum famularumque...
17. COMMUNICANTES:
               > Communicantes, et memoriam venerantes...
18. CONSAGRACIÓN(Rúbricas de elevación y campanillas detalladas):
               > Hanc igitur(Manos sobre las ofrendas).
               > Quam oblationem...
               > Qui pridie... HOC EST ENIM CORPUS MEUM. (Adoración).
               > Simili modo... HIC EST ENIM CALIX SANGUINIS MEI... (Adoración).
            19. EPÍCLESIS Y MEMENTO DIFUNTOS:
               > Unde et memores...
               > Supra quae...
               > Supplices te rogamus...
               > Memento etiam, Domine...
               > Nobis quoque peccatoribus...

V.COMUNIÓN Y RITOS FINALES
20. Pater Noster(Completo). 
            21. EMBOLISMO("Libera nos, quaesumus..." - VOX SECRETA > Completo - NO OMITIR):
               > "Libera nos, quaesumus, Domine, ab omnibus malis, praeteritis, praesentibus et futuris..."
            21b. PAX (Rito de la Paz - Solo en Misa Solemne):
               - Sacerdote: "Pax Domini sit semper vobiscum."
               - Pueblo: "Et cum spiritu tuo."
               - (Instrumentum Pacis transmitido entre ministros).
            22. Agnus Dei. Oraciones privadas antes de la comunión (> Domine Jesu Christe...).
            23. Domine, non sum dignus(x3). Comunión del Sacerdote y Fieles. Antífona de Comunión.
            24. Post-Comunión(Propia). 
            25. AVISOS PARROQUIALES(Rubrica breve).
            26. Ite Missa est.
            27. PLACEAT TIBI(Oración final secreta ante el altar >):
               > Placeat tibi, sancta Trinitas, obsequium servitutis meae...
28. BENDICIÓN FINAL(Benedicat vos omnipotens Deus...).
            29. Último Evangelio(Initium sancti Evangelii secundum Ioannem - TEXTO COMPLETO).
            30. ${marianAntiphonText}
31. PROCESIÓN DE SALIDA(Rúbrica).
        `;
    }

    // --- 2. MISA ANGLICANA (BCP 2019) ---
    if (tradition === 'anglicana') {
        const marianAntiphonText = `(Opcional) Antífona Mariana: ${marianAntiphon.name}.`;

        return `
            ${basePrompt}
FUENTE: Libro de Oración Común(ACNA 2019 - Edición en Español).
    ESTILO: Español Moderno Solemne("Tú/Usted"). 
            ⛔ PROHIBIDO: "Vos", "Os", "Vuestros"(Arcaísmos).Usa lenguaje actual y fiel al BCP 2019.
            ${omissionRules}

            🔴 INSTRUCCIÓN: GENERA TODO EL TEXTO LITÚRGICO NECESARIO(Salvo los marcadores fijos).
            - NO saludes.
            - NO pongas notas para el usuario.


            ⚠️ INSTRUCCIÓN DE SEGURIDAD PARA ORACIONES FIJAS(CRÍTICO):
            NO ESCRIBAS el texto del Gloria, Credo, Santo, Padre Nuestro ni Cordero.
            EN SU LUGAR, USA EXCLUSIVAMENTE ESTOS MARCADORES EXACTOS(Yo los reemplazaré por el texto oficial):
-[[INSERTAR_GLORIA]]
    - [[INSERTAR_CREDO]]
    - [[INSERTAR_SANTO]]
    - [[INSERTAR_PADRE_NUESTRO]]
    - [[INSERTAR_CORDERO]]
        (Nota: Para el "Kyrie" o "Decálogo" usa texto propio si varía del romano, pero para lo demás usa marcadores).

            ESTRUCTURA OBLIGATORIA(TEXTOS COMPLETOS - CON TÍTULOS CLAROS):
0. PROCESIÓN DE ENTRADA(Himno, Rúbrica de ingreso y Veneración del Altar).
            1. RITOS INICIALES:
- Aclamación Inicial("Bendito sea Dios: Padre, Hijo y Espíritu Santo...").
               - Colecta de Pureza("Omnipotente Dios, para quien todos los corazones...").
            2. EL DECÁLOGO o EL SUMARIO DE LA LEY(Leído completo).
            3. KYRIE ELEISON(Señor, ten piedad).
    ${(season === 'adviento' || season === 'cuaresma') ? '- (NO PONGAS GLORIA: Tiempo Penitencial).' : '- Gloria: USA EL MARCADOR \`[[INSERTAR_GLORIA]]\` (Solo si es Domingo/Solemnidad).'}
4. COLECTA DEL DÍA(Propia).
               ⚠️ OBLIGATORIO: Incluir el SALUDO("El Señor esté con ustedes...") antes del Oremos y la Colecta.
            5. LITURGIA DE LA PALABRA:
- Primera Lectura[LECTOR]: ${isStructureOnly ? '[[LECTURA_1]]' : '⚠️ ESCRIBE EL TEXTO BÍBLICO COMPLETO (Usa Biblia Torres Amat)'}.
- SALMO RESPONSORIAL[SALMISTA]: ${isStructureOnly ? '[[SALMO]]' : '(Indica la Antífona y las Estrofas COMPLETAS)'}.
- Segunda Lectura[LECTOR]: ${isStructureOnly ? '[[LECTURA_2]]' : '⚠️ ESCRIBE EL TEXTO BÍBLICO COMPLETO (Usa Biblia Torres Amat)'}.
               ${(season === 'cuaresma') ? '- TRACTO / VERSO [CORO]: (NO PONGAS ALELUYA).' : '- ALELUYA [CORO]: (Incluye el VERSO).'}
- Evangelio[DIÁCONO]:
                 ⚠️ Incluir SALUDO y Anuncio.
    ${isStructureOnly ? '[[EVANGELIO]]' : '⚠️ ESCRIBE EL TEXTO DEL EVANGELIO COMPLETO (Usa Biblia Torres Amat)'}.
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
               ` : `- Credo: ${selectedDate.getDay() === 0 ? 'USA EL MARCADOR \`[[INSERTAR_CREDO]]\`.' : '(NO PONGAS CREDO: Es día ferial).'}`
            }
7. ORACIÓN DE LOS FIELES:
               ⚠️ ADAPTADA A LAS LECTURAS: Redacta peticiones específicas basadas en el Evangelio / Lecturas de hoy.
               (Formato BCP completo).
            8. CONFESIÓN Y ABSOLUCIÓN:
- Exhortación breve.
               - Confesión General("Omnipotente y misericordiosísimo Padre...").
               - Absolución y Palabras de Consuelo.
            9. LA PAZ.
    ${(celebrationLabel && celebrationLabel.toLowerCase().includes('jueves santo')) ? '(OMITIR RITO DE LA PAZ por Jueves Santo).' : ''}
10. LITURGIA EUCARÍSTICA:
               ⚠️ OFERTORIO COMPLETO (NO RESUMIR):
               - Antífona de Ofertorio (Texto bíblico).
               - Presentación de las ofrendas.
               - Oración sobre las ofrendas: > "Bendito seas, Señor, Dios del universo..."
               - LAVABO: > "Lava del todo mi delito, Señor, limpia mi pecado."
               - ORATE FRATRES: "Orad, hermanos, para que este sacrificio..."
               - Respuesta del pueblo: "El Señor reciba de tus manos..."
               - ORACIÓN SOBRE LAS OFRENDAS (Super Oblata): > [Oración propia del día].
               
               - GRAN ACCIÓN DE GRACIAS (Plegaria Eucarística):
                 - Sursum Corda ("El Señor esté con ustedes...").
                 - PREFACIO PROPIO (Estacional o de Fiesta):
                   > [Escribe el texto completo del Prefacio apropiado al tiempo/fiesta].
                 - Sanctus: USA EL MARCADOR \`[[INSERTAR_SANTO]]\`.
                 - Oración de Consagración (Texto completo BCP 2019 Estándar).
                 - Aclamación Memorial: "Cristo ha muerto, Cristo ha resucitado..."
                 - Epíclesis y Doxología Final.
            11. RITO DE COMUNIÓN:
               - PADRE NUESTRO: USA EL MARCADOR \`[[INSERTAR_PADRE_NUESTRO]]\`.
               - EMBOLISMO (OBLIGATORIO - NO OMITIR):
                 > "Líbranos de todos los males, Señor, y concédenos la paz en nuestros días,
                 > para que, ayudados por tu misericordia, vivamos siempre libres de pecado
                 > y protegidos de toda perturbación, mientras esperamos la gloriosa venida
                 > de nuestro Salvador Jesucristo."
               - DOXOLOGÍA DEL PUEBLO: > "Tuyo es el reino, tuyo el poder y la gloria, por siempre, Señor."
               - RITO DE LA PAZ:
                 - Sacerdote: "La paz del Señor esté siempre con vosotros."
                 - Pueblo: "Y con tu espíritu."
                 - "Daos fraternalmente la paz."
               - Oración de Humilde Acceso (Prayer of Humble Access): 
                 > "No presumimos acercarnos a esta tu Mesa, oh Señor misericordioso..."
               - Agnus Dei: USA EL MARCADOR \`[[INSERTAR_CORDERO]]\`.
               - Comunión de los fieles.
               - ANTÍFONA DE COMUNIÓN: > [Texto bíblico apropiado].
            12. POST-COMUNIÓN:
               - Oración de Acción de Gracias (Propia del día).
            13. RITOS FINALES:
               - AVISOS DE LA COMUNIDAD.
               - BENDICIÓN Y DESPEDIDA.
               - ${marianAntiphonText}
               - PROCESIÓN DE SALIDA.
        `;
    }

    // --- 3. ORDINARIATO (DIVINE WORSHIP) ---
    if (tradition === 'ordinariato') {
        // --- RUBRICISTA MAYOR 2026 LOGIC (STRICT DWM) ---
        // FORCE 2026 CYCLE A
        const currentYear = selectedDate.getFullYear();
        let cycleText = cycle.text;
        if (currentYear === 2026) {
            cycleText = "CICLO A (Mateo)";
        }

        // 1. ZONA LITÚRGICA (GESIMAS & LENT)
        let liturgicalZone = "ORDINARY";
        let zoneRules = "Reglas estándar del tiempo litúrgico.";

        // FECHAS CLAVE 2026
        const dateTime = selectedDate.getTime();
        const septuagesima = new Date(2026, 1, 1).getTime(); // 1 Feb
        const ashWednesday = new Date(2026, 1, 18).getTime(); // 18 Feb
        const easterSunday = new Date(2026, 3, 5).getTime(); // 5 Abr (Approx)

        if (currentYear === 2026) {
            if (dateTime >= septuagesima && dateTime < ashWednesday) {
                liturgicalZone = "GESIMATIDE";
                zoneRules = "Zona 2 (Gesimatide): Morado. GLORIA: NO. ALELUYA: NO (Tracto).";
            } else if (dateTime >= ashWednesday && dateTime < easterSunday) {
                liturgicalZone = "LENT";
                zoneRules = "Zona 3 (Cuaresma): Morado. GLORIA: NO. ALELUYA: NO (Tracto).";
            } else if (dateTime >= easterSunday) {
                liturgicalZone = "EASTER";
                zoneRules = "Zona 4 (Pascua): Blanco. GLORIA: SÍ. ALELUYA: SÍ.";
            }
        }

        // Alias para compatibilidad
        let specificLabel2026 = finalLabel;

        // Override Label for Quinquagesima
        if (dateTime === new Date(2026, 1, 15).getTime()) {
            specificLabel2026 = "DOMINGO DE QUINQUAGÉSIMA (DOMINICA QUINQUAGESIMAE)";
        }

        // LÓGICA DE INSTRUCCIONES ESPECÍFICAS
        let readingsInstruction = "";
        let collectInstruction = "Texto propio del día. Si es Quinquagésima, menciona la CARIDAD.";

        if (specificLabel2026.toUpperCase().includes("QUINQUAGÉSIMA")) {
            readingsInstruction = `
                LECTURAS PROPIAS DE QUINQUAGÉSIMA (Ciclo A 2026):
                - Epístola: 1 Corintios 13:1-13 (El himno a la caridad).
                - Evangelio: Lucas 18:31-43 (Jesús predice su pasión / Ciego de Jericó).
                - TRACTO: Jubilate Deo (Salmo 99) - NO Aleluya.
            `;
        }

        const ordinariatoPrompt = `
            INSTRUCCIÓN: Actúa como el **RUBRICISTA MAYOR DEL ORDINARIATO**.
            Genera la Santa Misa según el *Divine Worship: The Missal* (DWM).

            FECHA: **${dateStr}**
            CELEBRACIÓN: **${specificLabel2026}**
            CICLO: **${cycleText}**
            ZONA LITÚRGICA: **${liturgicalZone}**

            REGLAS DE LA ZONA (${currentYear}):
            ${zoneRules}

            IDIOMA: **ESPAÑOL SACRO SOLEMNE** ("Vosotros", "Tu bondad").
            - TODO el texto hablado (Canon, Colectas, Evangelio) en ESPAÑOL.
            - Títulos pueden ir en Inglés/Latín.

            PROTOCOLO VISUAL "RED & BLACK" (STRICT):
            1. REGLA DEL RENGLÓN ÚNICO (AIRE):
               - CADA intervención (**S:** o **P:**) DEBE ir en SU PROPIA LÍNEA.
               - JAMÁS juntes S y P en el mismo párrafo.
               - DEJA UNA LÍNEA EN BLANCO entre cada intervención.
            
            2. REGLA DE LA RÚBRICA ROJA (ACCIONES ESPECÍFICAS):
               - ***[Rúbricas en Negrita Cursiva]*** SIEMPRE en línea separada.
               - NO USES "Rúbrica" genérica. USA LA ACCIÓN: ***[Se arrodillan]***, ***[Genuflexión]***, ***[Se signan]***.
            
            3. VOZ DEL PUEBLO:
               - Texto del Pueblo (**P:**) SIEMPRE EN NEGRITA.

            ${readingsInstruction}

            ---
            ### ESTRUCTURA DE SALIDA (MISSAL FORMAT):

            # ${specificLabel2026.toUpperCase()}
            ## ${dateStr}

            ---

            ## I. RITOS INICIALES (INTRODUCTORY RITES)
            ***[Procesión de entrada. El pueblo se pone de pie.]***
            
            1. **Introito:** (Texto completo del Salmo propio).
            
            2. **S:** En el nombre del Padre... 
            **P: Amén.**
            
            3. **Colecta de la Pureza:** "Dios todopoderoso, para quien todos los corazones están manifiestos..." (Solo Sacerdote).
            
            4. **Sumario de la Ley:** (O Decálogo si es Zona 2 o 3).
            
            5. **Kyrie:** (En Griego - Alternado S/P).
            
            6. **Gloria:** ${liturgicalZone === 'GESIMATIDE' || liturgicalZone === 'LENT' ? '***[Se omite el Gloria.]***' : '(Texto completo)'}.
            
            7. **Colecta del Día:** ${collectInstruction}

            ---

            ## II. LITURGIA DE LA PALABRA (${cycleText})
            ***[El pueblo se sienta.]***
            
            1. **Primera Lectura:** [[LECTURA_1]] (Texto completo).
            
            2. **Salmo Gradual:** [[SALMO]] (Texto completo).
            
            3. **Segunda Lectura:** [[LECTURA_2]] (Texto completo).
            
            ***[El pueblo se pone de pie.]***
            
            4. **${liturgicalZone === 'GESIMATIDE' || liturgicalZone === 'LENT' ? 'TRACTO' : 'ALELUYA'}:** [[ACCLAMATION]] (Texto completo).
            
            5. **Santo Evangelio:** 
               ***[El Sacerdote signa el libro y se signa a sí mismo +.]***
               **S:** El Señor esté con vosotros. 
               **P: Y con tu espíritu.**
               
               **S:** Lectura del Santo Evangelio... 
               **P: Gloria a ti, Señor.**
               
               [[EVANGELIO]] (Mateo).
               
               **S:** El Evangelio del Señor. 
               **P: Te alabamos, Señor.**
            
            6. **Homilía:** ***[Se sienta el pueblo.]***
            
            7. **Credo Niceno:** 
               ***[El pueblo se pone de pie.]***
               "Creo en un solo Dios..." (Texto completo en Español).
               ***[Todos se inclinan en "Y por obra del Espíritu Santo..."]***
            
            8. **Oración de los Fieles:** (Estilo DWM. **P: Te rogamos, óyenos**).

            ---

            ## III. RITO PENITENCIAL (PENITENTIAL RITE)
            ***[El pueblo se arrodilla.]***
            
            1. **Invitación:** **S:** Vosotros que os arrepentís...
            
            2. **Confesión General:** **S y P:** "Dios todopoderoso, Padre de nuestro Señor Jesucristo..." (Texto completo).
            
            3. **Absolución:** ***[El Sacerdote se pone de pie y da la absolución +.]***
            
            4. **Palabras de Consuelo (Comfortable Words):** (Sacerdote recita las 4 citas: Mt 11:28, Jn 3:16, 1 Tim 1:15, 1 Jn 2:1 - TEXTO ESPAÑOL COMPLETO).

            ---

            ## IV. LITURGIA EUCARÍSTICA (LITURGY OF THE EUCHARIST)
            ***[Ofertorio. El pueblo se sienta.]***
            
            1. **Antífona de Ofertorio:** (Texto completo).
            
            2. **Oración sobre las Ofrendas.**
            
            ***[El pueblo se pone de pie.]***

             ---
            ## V. PLEGARIA EUCARÍSTICA (CANON ROMANO)
            ***[El pueblo se arrodilla para el Canon.]***

            1. **Prefacio:** (Propio del tiempo).
            **S:** El Señor esté con vosotros... Levantemos el corazón...
            **P: Santo, Santo, Santo...**

            2. **Te Igitur:** (Primera parte del Canon).
            
            3. **Consagración:** 
               ***[El Sacerdote pronuncia las palabras sobre el Pan.]***
               HOC EST ENIM CORPUS MEUM.
               ***[Genuflexión. Elevación de la Hostia. Campanillas.]***
               
               ***[El Sacerdote pronuncia las palabras sobre el Vino.]***
               HIC EST ENIM CALIX SANGUINIS MEI...
               ***[Genuflexión. Elevación del Cáliz. Campanillas.]***
            
            4. **Mysterium Fidei:**
               **P: Anunciamos tu muerte, Señor, proclamamos tu resurrección...**
            
            5. **Padre Nuestro:** (S y P recitan juntos).
            
            6. **La Paz:** (Rito de la Paz).
            
            7. **Agnus Dei:** (Cordero de Dios...).
            
            8. **Oración de Humilde Acceso:**
               **P: No presumimos venir a esta tu Mesa...**

            ---

            ## VI. RITOS FINALES
            1. **Comunión.**
            2. **Oración Post-Comunión.**
            3. **Bendición.**
            
            4. **Último Evangelio (Last Gospel):**
               ***[El Sacerdote lee Juan 1:1-14.]***
               (Texto completo en Español).
               ***[Genuflexión a las palabras "Y EL VERBO SE HIZO CARNE".]***
               **P: Demos gracias a Dios.**
        `;
        return ordinariatoPrompt;
    }

    // --- 4. ROMANA (NOVUS ORDO) ---
    // Fallback
    const marianAntiphonText = `Saludo a la Virgen: ${marianAntiphon.name}.`;

    // SENIOR LITURGIST ENFORCEMENT:

    return `
        ${basePrompt}
        FUENTE: Misal Romano (Tercera Edición).
        ESTILO OBLIGATORIO: "HIGH CHURCH" (Solemne y Tradicional).
        TITULACIÓN: Usa Títulos en LATÍN y ESPAÑOL (Ej: RITUS INITIALES / Ritos Iniciales).
        ${omissionRules}
        
        🔴 INSTRUCCIÓN: MISA SOLEMNE COMPLETA.
        - NO resumas.
        - NO converses.

        
        ⚠️ INSTRUCCIÓN DE SEGURIDAD PARA ORACIONES FIJAS (CRÍTICO):
        NO ESCRIBAS el texto del Gloria, Credo, Santo, Padre Nuestro ni Cordero.
        EN SU LUGAR, USA EXCLUSIVAMENTE ESTOS MARCADORES EXACTOS (Yo los reemplazaré por el texto oficial):
        - [[INSERTAR_YO_CONFIESO]]
        - [[INSERTAR_GLORIA]]
        - [[INSERTAR_CREDO]]
        - [[INSERTAR_SANTO]]
        - [[INSERTAR_PADRE_NUESTRO]]
        - [[INSERTAR_CORDERO]]

        ESTRUCTURA OBLIGATORIA (TEXTOS COMPLETOS - CON TÍTULOS BILINGÜES):

        I. RITOS INICIALES (RITUS INITIALES)
        0. [[Procesión de Entrada]]
        1. INTROITUS (Canto de Entrada):
           - ${isStructureOnly ? '[[Momento del Canto]]' : '⚠️ OBLIGATORIO: GENERA UNA ANTÍFONA BÍBLICA COMPLETA.'}
        2. SALUDO Y ACTO PENITENCIAL:
           - [[Saludo del Celebrante]]
           - Acto Penitencial: USA EL MARCADOR \`[[INSERTAR_YO_CONFIESO]]\`.
           - KYRIE ELEISON: (Escribe el diálogo Señor, ten piedad completo).
        3. GLORIA IN EXCELSIS:
           ${(season === 'adviento' || season === 'cuaresma') ? '- [[OMITIR GLORIA: Tiempo Penitencial]]' : '- USA EL MARCADOR \`[[INSERTAR_GLORIA]]\`.'}
        4. COLLECTA (Oración Colecta):
           - [[Oremos]]
           - ⚠️ IMPORTANTE: Genera la Oración Colecta en BLOQUE DE CITA (Markdown > ) para que se vea solemne.
           > "Dios todopoderoso..." (Escribe una oración propia y completa).

        II. LITURGIA DE LA PALABRA (LITURGIA VERBI)
        5. LECTIO I (Primera Lectura):
           ${isStructureOnly ? '[[LECTURA_1]]' : '⚠️ TEXTO COMPLETO (Usa Biblia Torres Amat 1825).'}
        
        6. PSALMUS RESPONSORIALIS (Salmo Responsorial):
           ⚠️ INSTRUCCIÓN DE SEGURIDAD MÁXIMA:
           1. ESTE ES EL MOMENTO DE MAYOR RIESGO DE ALUCINACIÓN.
           2. SOLO ESCRIBE 3 ESTROFAS. SOLO 3.
           3. NO MEZCLES LA SEGUNDA LECTURA AQUÍ.
           
           🚫 ERROR COMÚN A EVITAR:
           - INCORRECTO: "R/. Te alabamos, Señor" (ESTO ESTÁ PROHIBIDO).
           - CORRECTO: "R/. Dichosos los pobres en el espíritu" (o la frase bíblica del día).

           FORMATO OBLIGATORIO (COPIA ESTO):

           **SALMISTA:** [Primera estrofa del Salmo]
           
           **PUEBLO:** [Antífona del Leccionario - FRASE BÍBLICA COMPLETA]

           **SALMISTA:** [Segunda estrofa del Salmo]

           **PUEBLO:** [Antífona del Leccionario]

           **SALMISTA:** [Tercera estrofa del Salmo]

           **PUEBLO:** [Antífona del Leccionario]

           ${isStructureOnly ? '[[SALMO]]' : '(Usa el texto del Leccionario).'}

           *****************************************************************
           🛑 ALTO. DETENTE. FIN DEL SALMO. CAMBIO DE LIBRO. 🛑
           *****************************************************************

        7. LECTIO II (Segunda Lectura):
           - [[Sube el Lector de la Epístola]]
           ⚠️ INICIO DE NUEVA SECCIÓN: CARTA APOSTÓLICA.
           - Título: Lectura de...
           ${isStructureOnly ? '[[LECTURA_2]]' : '⚠️ TEXTO COMPLETO (Usa Biblia Torres Amat 1825).'}
        
        8. ALLELUIA (o Tractus):
           - [[Aleluya de pie]]
           - Escribe el verso del Aleluya completo.
        
        9. EVANGELIUM (Santo Evangelio):
           - [[Lectura del Santo Evangelio]]
           ${isStructureOnly ? '[[EVANGELIO]]' : '⚠️ TEXTO COMPLETO (Usa Biblia Torres Amat 1825).'}
        
        III. HOMILÍA Y CREDO (CREDO IN UNUM DEUM)
        10. Homilía: [[Breve momento de silencio]]
        11. Credo:
            ${rubrics.credo ? '- USA EL MARCADOR \`[[INSERTAR_CREDO]]\`.' : '- [[Omitir Credo en ferias]]'}

        IV. ORACIÓN DE LOS FIELES (ORATIO FIDELIUM)
        12. Oración Universal:
            ⚠️ TEMA OBLIGATORIO: Peticiones basadas en el Evangelio.
            - Redacta 5-6 peticiones específicas.
            > V. Roguemos al Señor.
            > R. Te rogamos, óyenos.

        V. LITURGIA EUCARÍSTICA (LITURGIA EUCHARISTICA)
        13. OFFERTORIUM (Rito de Ofertorio):
            - [[Presentación de Ofrendas]]
            - Antífona: > [Texto de la Antífona de Ofertorio]
            - Sacerdote: > "Bendito seas, Señor... por este pan..."
            - [[Lavabo]]: > "Lava del todo mi delito, Señor..."
            - Orate Fratres.
            - ORATIO SUPER OBLATA (Oración sobre las Ofrendas):
            > (Escribe la oración completa en bloque de cita).
        
        14. PREX EUCHARISTICA (Plegaria Eucarística):
            - PRAEFATIO: > (Escribe el texto del Prefacio con cloaking ~).
            - SANCTUS: USA EL MARCADOR \`[[INSERTAR_SANTO]]\`.
            - CONSAGRACIÓN Y ANAMNESIS:
              USA EL MARCADOR \`[[INSERTAR_CONSAGRACION]]\`.
              (No escribas el texto de la consagración, usa el marcador).
            - DOXOLOGÍA FINAL:
              > "Por Cristo, con Él y en Él..."

        VI. RITO DE COMUNIÓN (RITUS COMMUNIONIS)
        15. PATER NOSTER: 
            - USA EL MARCADOR \`[[INSERTAR_PADRE_NUESTRO]]\`.
            - EMBOLISMO (Sacerdote): 
              > "Líbranos de todos los males, Señor... esperamos la venida gloriosa de nuestro Salvador Jesucristo."
            - DOXOLOGÍA (Pueblo): 
              > "Tuyo es el reino, tuyo el poder y la gloria, por siempre, Señor."
        16. Rito de la Paz: 
            - Sacerdote: "La paz del Señor esté siempre con vosotros."
            - Pueblo: "Y con tu espíritu."
            - [[Intercambio de la Paz]]
        17. AGNUS DEI: USA EL MARCADOR \`[[INSERTAR_CORDERO]]\`.
        18. COMMUNIO (Antífona de Comunión):
            - Antífona: > [Escribe la Antífona Bíblica Completa]
        19. ORATIO POST COMMUNIO (Oración Post-comunión):
            - [[Oremos]]
            - ⚠️ OBLIGATORIO: Genera la oración completa de Post-Comunión.
            > (Escribe la oración completa en bloque de cita).

        VII. RITOS DE CONCLUSIÓN (RITUS CONCLUSIONIS)
        20. BENDICIÓN Y DESPEDIDA:
            - [[El Señor esté con vosotros...]]
            - [[Podéis ir en paz...]]
        21. [[Procesión de Salida]]

        VIII. EXTRAS (CRÍTICO PARA PORTADA)
        22. CITA_PATRISTICA: "Escribe aquí una frase breve y profunda de un Padre de la Iglesia (San Agustín, San Juan Crisóstomo, etc.) relacionada con las lecturas de hoy" - Nombre del Santo.
    `;
};
