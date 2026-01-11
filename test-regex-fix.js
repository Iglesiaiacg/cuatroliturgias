// Test updated regex pattern

const readingsContent = `[[LECTURA_1]]
**Libro de Isaías 42,1-4.6-7.**

Así habla el Señor:
Este es mi Servidor...

[[SALMO]]
**Salmo 29(28),1a.2.3ac-4.3b.9b-10.**

¡Aclamen al Señor, hijos de Dios!...

[[LECTURA_2]]
**Libro de los Hechos de los Apóstoles 10,34-38.**

Entonces Pedro, tomando la palabra...

[[EVANGELIO]]
**Evangelio según San Mateo 3,13-17.**

Entonces Jesús fue desde Galilea...`;

// NEW regex with \s* instead of \n
const extractReadingContent = (text, marker) => {
    if (!text) return null;

    // Look for pattern: [[MARKER]]\nContent (until next marker or end)
    // Note: Between markers there can be multiple newlines, so use \s* before next [[
    const regex = new RegExp(`\\[\\[${marker}\\]\\]\\s*([\\s\\S]*?)(?=\\s*\\[\\[|$)`, 'i');
    const match = text.match(regex);

    if (match && match[1]) {
        let content = match[1].trim();
        console.log(`✅ Extracted ${marker}:`);
        console.log(`   Length: ${content.length} chars`);
        console.log(`   Preview: ${content.substring(0, 60)}...`);
        console.log('');
        return content;
    }

    console.warn(`⚠️ Could not extract ${marker}`);
    return null;
};

console.log('==== TESTING IMPROVED REGEX ====\n');

const markers = ['LECTURA_1', 'SALMO', 'LECTURA_2', 'EVANGELIO'];
markers.forEach(marker => {
    extractReadingContent(readingsContent, marker);
});

console.log('==== VERIFICATION ====');
console.log('Each reading should be extracted separately');
console.log('LECTURA_1 should NOT contain SALMO content');
