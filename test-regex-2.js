
// Test 2 para verificar extractCitation con el NUEVO regex
const samples = [
    "Carta I de San Pablo a los Corintios 1,1-3.\n\nPablo...",
    "Libro de los Hechos de los Apóstoles 10,34-38.\n\nPedro...",
    "Evangelio según San Juan 1,29-34.\n\nAl día siguiente...",
    "Lectura de la carta del Apóstol San Pablo a los Romanos 1,1-7.\n\nPablo..."
];

const patterns = [
    /^(Libro de.*?\d+[,\d\.\-ab]*)/i,
    /^(Evangelio según.*?\d+[,\d\.\-ab]*)/i,
    /^(Salmo \d+[^\n]*)/i,
    /^(Lectura de.*?\d+[,\d\.\-ab]*)/i,
    /^(Carta .*?\d+[,\d\.\-ab]*)/i,
    /^(Libro de los Hechos.*?\d+[,\d\.\-ab]*)/i
];

console.log('--- TEST REGEX 2 (NON-GREEDY) ---\n');

samples.forEach((text, i) => {
    let citation = '';
    let cleanText = text;

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            citation = match[1].trim();
            cleanText = text.substring(match[0].length).trim();
            break;
        }
    }

    console.log(`Muestra ${i + 1}:`);
    console.log(`   Original: "${text.split('\n')[0]}..."`);
    console.log(`   Cita:     "${citation}"`);
    console.log(`   Cuerpo:   "${cleanText.substring(0, 10)}..."`);

    if (citation.length > 5 && cleanText.length > 0) {
        console.log('   ✅ OK');
    } else {
        console.log('   ❌ FALLO');
    }
    console.log('--------------------------');
});
