// Test script to verify merge logic preserves dialogues

const templateSnippet = `### Segunda Lectura

[[El lector va al ambón]]

[[LECTURA_2]]

[[Breve silencio]]

**Lector:** Palabra de Dios.

**Pueblo:** Te alabamos, Señor.

---

### Evangelio

[[El Diácono o el Sacerdote va al ambón llevando el Evangeliario]]

**Sacerdote:** El Señor esté con vosotros.

**Pueblo:** Y con tu espíritu.

**Sacerdote:** Lectura del santo Evangelio según san [[EVANGELISTA]].

**Pueblo:** Gloria a ti, Señor.

[[EVANGELIO]]

**Sacerdote:** Palabra del Señor.

**Pueblo:** Gloria a ti, Señor Jesús.`;

const readingsContent = `[[LECTURA_2]]
**Libro de los Hechos de los Apóstoles 10,34-38.**

Entonces Pedro, tomando la palabra, dijo: "Verdaderamente, comprendo que Dios no hace acepción de personas,
y que en cualquier nación, todo el que lo teme y practica la justicia es agradable a él.

[[EVANGELIO]]
**Evangelio según San Mateo 3,13-17.**

Entonces Jesús fue desde Galilea hasta el Jordán y se presentó a Juan para ser bautizado por él.`;

// Extract content function (from useLiturgy.js)
const extractReadingContent = (text, marker) => {
    const regex = new RegExp(`\\[\\[${marker}\\]\\]\\s*([\\s\\S]*?)(?=\\[\\[|$)`, 'i');
    const match = text.match(regex);
    if (match && match[1]) {
        let content = match[1].trim();
        content = content.replace(/^###\s+.+$/gm, '').trim();
        return content;
    }
    return null;
};

// Test the merge
let result = templateSnippet;

const markers = ['LECTURA_2', 'EVANGELIO'];
markers.forEach((marker) => {
    const content = extractReadingContent(readingsContent, marker);
    if (content) {
        console.log(`\n==== Replacing [[${marker}]] with: ====`);
        console.log(content.substring(0, 100) + '...');
        result = result.replace(`[[${marker}]]`, content);
    }
});

result = result.replace('[[EVANGELISTA]]', 'Mateo');

console.log('\n\n==== FINAL RESULT: ====\n');
console.log(result);

// Check if dialogues are preserved
const hasLectorDialog = result.includes('**Lector:** Palabra de Dios.');
const hasPuebloDialog = result.includes('**Pueblo:** Te alabamos, Señor.');
const hasGospelDialogs = result.includes('**Sacerdote:** Palabra del Señor.');

console.log('\n\n==== DIALOG VERIFICATION: ====');
console.log('Lector dialog preserved:', hasLectorDialog ? '✓' : '✗');
console.log('Pueblo dialog preserved:', hasPuebloDialog ? '✓' : '✗');
console.log('Gospel closing dialog preserved:', hasGospelDialogs ? '✓' : '✗');
