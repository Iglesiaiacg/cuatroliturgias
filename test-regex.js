// Quick test of the new regex pattern for Segunda Lectura
const testText = `
Salmo 40(39),2.4.7-8.9.10.

Esperé confiadamente en el Señor

Carta I de San Pablo a los Corintios <font dir="ltr">1,1-3.</font>

Pablo, llamado a ser Apóstol de Jesucristo por la voluntad de Dios...

Evangelio según San Juan <font dir="ltr">1,29-34.</font>
`;

const segundaMatch = testText.match(/((?:Carta (?:I|II|primera|segunda)? ?de San Pablo|Carta de San|Libro de los Hechos|Lectura de la (?:primera |segunda )?carta)[^<]+<[^>]+>[\d,\.\-]+[^<]*<\/[^>]+>[\s\S]*?)(?=Evangelio según|$)/i);

if (segundaMatch) {
    console.log('✅ SUCCESS: Found Segunda Lectura!');
    console.log('Matched text:', segundaMatch[1].substring(0, 100) + '...');
} else {
    console.log('❌ FAILED: Could not find Segunda Lectura');
}
