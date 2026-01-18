
// Test para verificar extractCitation con el nuevo regex
const text = "Carta I de San Pablo a los Corintios 1,1-3.\n\nPablo, llamado a ser Apóstol...";

const patterns = [
    /^(Libro de[^\.]+\d+[,\d\.\-ab]+)/i,
    /^(Evangelio según[^\.]+\d+[,\d\.\-]+)/i,
    /^(Salmo \d+[^\n]*)/i,
    /^(Lectura de[^\.]+\d+[,\d\.\-]+)/i,
    /^(Carta [^\.]+\d+[,\d\.\-]+)/i,
    /^(Libro de los Hechos[^\.]+\d+[,\d\.\-]+)/i
];

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

console.log('--- TEST REGEX ---');
console.log('Texto original:', text.substring(0, 50) + '...');
console.log('Cita extraída:', citation);
console.log('Texto limpio:', cleanText.substring(0, 20) + '...');

if (citation === "Carta I de San Pablo a los Corintios 1,1-3") {
    console.log('✅ ÉXITO: La cita se extrajo correctamente.');
} else {
    console.log('❌ FALLO: La cita no se extrajo.');
}
