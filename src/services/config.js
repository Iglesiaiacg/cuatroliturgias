export const CONFIG = {
    // API_KEY removed for security. Use Settings Modal.
    ENDPOINTS: {
        GENERATE: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent"
    },
    ICONS: {
        adviento: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="liturgy-icon"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor"/><path d="M12 2v20M2 12h20M12 8a4 4 0 0 1 4 4M8 12a4 4 0 0 1 4-4" fill="none" stroke="currentColor"/></svg>`,
        navidad: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="liturgy-icon"><path d="M12 2l3 7h7l-5 5 2 7-7-4-7 4 2-7-5-5h7z" fill="none" stroke="currentColor"/></svg>`,
        cuaresma: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="liturgy-icon"><path d="M8 2v20M2 8h12M16 12a4 4 0 0 1 0 8 4 4 0 0 1 0-8z" fill="none" stroke="currentColor"/></svg>`,
        semana_santa: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="liturgy-icon"><path d="M10 2v20M4 8h12" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
        pascua: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="liturgy-icon"><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" fill="none" stroke="currentColor"/></svg>`,
        pentecostes: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="liturgy-icon"><path d="M12 2s-6 7-6 12a6 6 0 1 0 12 0c0-5-6-12-6-12z" fill="none" stroke="currentColor"/></svg>`,
        ordinario: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="liturgy-icon"><path d="M5 3h14v2l-2 6h-10l-2-6v-2zM9 11v3a3 3 0 0 0 6 0v-3M12 14v6M7 21h10" fill="none" stroke="currentColor"/><circle cx="12" cy="2" r="2" fill="none" stroke="currentColor"/></svg>`
    },
    RULES: `
        REGLAS DE FORMATO MANDATORIAS (NO MODIFICAR):
        1. FORMATO DE DIÁLOGO: 
           - PUEBLO / RESPUESTAS: SIEMPRE EN **NEGRITA**.
           - SACERDOTE / LECTOR: SIEMPRE EN TEXTO NORMAL.
        2. LECTURAS:
           - Escribe el Título (Ej. "Lectura de...").
           - IMPERATIVO: ESCRIBE EL TEXTO BÍBLICO COMPLETO DEBAJO. NO PONGAS SOLO LA CITA (Ej. "Juan 3:16").
        3. TÉCNICO:
           - NO uses tablas Markdown.
           - NO uses LaTeX ($).
           - Rúbricas siempre entre [[doble corchete]] o en *cursiva*.
    `
};

export const LITURGY_PROPIOS = {
    "catolica": [
        { label: "--- DÍAS CLAVE DEL CALENDARIO", disabled: true },
        { value: "HOY_CALENDARIO", label: "Propio de la Fecha Actual (Ferial/Dominical)" },
        { value: "PROXIMO_DOMINGO", label: "Propio del Próximo Domingo" },
        { label: "--- PROPIOS MÓVILES (NOVUS ORDO)", disabled: true },
        { value: "ADVIENTO_I", label: "I Domingo de Adviento" },
        { value: "ADVIENTO_II", label: "II Domingo de Adviento" },
        { value: "ADVIENTO_III", label: "III Domingo de Adviento (Gaudete)" },
        { value: "CENIZA", label: "Miércoles de Ceniza" },
        { value: "CUARESMA_I", label: "I Domingo de Cuaresma" },
        { value: "RESURRECCION", label: "Domingo de Resurrección" },
        { value: "TRINIDAD", label: "Santísima Trinidad" },
        { value: "CRISTO_REY", label: "Jesucristo, Rey del Universo" },
    ],
    "ordinariato": [
        { label: "--- DÍAS CLAVE DEL CALENDARIO", disabled: true },
        { value: "HOY_CALENDARIO", label: "Propio de la Fecha Actual (Ferial/Dominical)" },
        { value: "PROXIMO_DOMINGO", label: "Propio del Próximo Domingo" },
        { label: "--- PROPIOS MÓVILES (DIVINE WORSHIP)", disabled: true },
        { value: "ADVIENTO_I", label: "I Sunday of Advent" },
        { value: "ADVIENTO_II", label: "II Sunday of Advent" },
        { value: "ADVIENTO_III", label: "III Sunday of Advent (Gaudete)" },
        { value: "CENIZA", label: "Ash Wednesday" },
        { value: "CUARESMA_I", label: "I Sunday in Lent" },
        { value: "RESURRECCION", label: "Easter Day" },
        { value: "TRINIDAD", label: "Trinity Sunday" },
        { value: "CORPUS", label: "Corpus Christi" },
        { value: "CRISTO_REY", label: "Christ the King" },
    ],
    "anglicana": [
        { label: "--- DÍAS CLAVE DEL CALENDARIO", disabled: true },
        { value: "HOY_CALENDARIO", label: "Propio de la Fecha Actual (Ferial/Dominical)" },
        { value: "PROXIMO_DOMINGO", label: "Propio del Próximo Domingo" },
        { label: "--- PROPIOS MÓVILES (LOC 2019)", disabled: true },
        { value: "ADVIENTO_I", label: "First Sunday of Advent" },
        { value: "ADVIENTO_II", label: "Second Sunday of Advent" },
        { value: "ADVIENTO_III", label: "Third Sunday of Advent" },
        { value: "CENIZA", label: "Ash Wednesday" },
        { value: "CUARESMA_I", label: "First Sunday in Lent" },
        { value: "RESURRECCION", label: "Easter Day" },
        { value: "PENTECOSTES", label: "The Day of Pentecost" },
        { value: "TRINIDAD", label: "Trinity Sunday" },
        { value: "CRISTO_REY", label: "Christ the King (Last Sunday after Pentecost)" },
    ],
    "tridentina": [
        { label: "--- DÍAS CLAVE DEL CALENDARIO", disabled: true },
        { value: "HOY_CALENDARIO", label: "Propio de la Fecha Actual (Ferial/Dominical)" },
        { label: "--- PROPIOS MÓVILES (MISSALE 1962)", disabled: true },
        { value: "ADVIENTO_I", label: "Dominica I Adventus" },
        { value: "ADVIENTO_II", label: "Dominica II Adventus" },
        { value: "SEPTUAGESIMA", label: "Septuagesima Sunday" },
        { value: "SEXAGESIMA", label: "Sexagesima Sunday" },
        { value: "CENIZA", label: "Feria Quarta Cinerum" },
        { value: "CUARESMA_I", label: "Dominica I in Quadragesima" },
        { value: "PASSION_I", label: "Dominica I Passionis" },
        { value: "PALMS", label: "Dominica II Passionis seu de Palmis" },
        { value: "RESURRECCION", label: "Dominica Resurrectionis" },
        { value: "PENTECOSTES", label: "Dominica Pentecostes" },
        { value: "TRINIDAD", label: "Dominica Sanctissimae Trinitatis" },
        { value: "PENTECOSTES_IV", label: "Dominica IV Post Pentecostes" },
    ]
};
