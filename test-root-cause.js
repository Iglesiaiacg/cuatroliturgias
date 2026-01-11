// REAL PROBLEM TEST: The ENTIRE readingsRes is being inserted at [[LECTURA_1]]

const templateSnippet = `### Primera Lectura
[[El lector va al ambón]]

[[LECTURA_1]]

[[Breve silencio]]
**Lector:** Palabra de Dios.
**Pueblo:** Te alabamos, Señor.

---

### Salmo Responsorial
[[SALMO]]

---

### Segunda Lectura
[[LECTURA_2]]

**Lector:** Palabra de Dios.
**Pueblo:** Te alabamos, Señor.

---

### Evangelio
[[EVANGELIO]]

**Sacerdote:** Palabra del Señor.
**Pueblo:** Gloria a ti, Señor Jesús.`;

// This is what Evangelizo returns
const readingsRes = `[[LECTURA_1]]
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

console.log('==== SIMULATING CURRENT BUG ====\n');

// Current (BUGGY) behavior - using simple string replace
let buggyResult = templateSnippet;
buggyResult = buggyResult.replace('[[LECTURA_1]]', readingsRes);

console.log('BUGGY OUTPUT:');
console.log(buggyResult);
console.log('\n==== PROBLEM IDENTIFIED ====');
console.log('Notice that ALL readings appear where [[LECTURA_1]] was!');
console.log('And [[SALMO]], [[LECTURA_2]], [[EVANGELIO]] sections are now EMPTY');
console.log('\n==== ROOT CAUSE ====');
console.log('readingsRes CONTAINS the marker [[LECTURA_1]] inside it!');
console.log('So when we do .replace("[[LECTURA_1]]", readingsRes),');
console.log('we are inserting the ENTIRE readingsRes string (which includes [[LECTURA_1]], [[SALMO]], etc.)');
console.log('Then there are NO MORE [[LECTURA_1]] markers to find in readingsRes!');
