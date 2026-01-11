/**
 * Static Catholic Mass Structure Template
 * Used when tradition === 'catolica' to avoid Gemini RECITATION blocks
 * Readings are injected from Evangelizo API
 */

export const buildCatholicMassTemplate = ({ feastLabel, season, date, liturgicalColor, alleluiaVerse, intercessions, preface, properPrayers, antiphons }) => {
    // Defaults
    const defaultAlleluiaVerse = "Proclama el reino de Dios y sana a los enfermos.";
    const finalAlleluiaVerse = alleluiaVerse || defaultAlleluiaVerse;

    const finalPreface = preface || "En verdad es justo y necesario...";
    const finalProperPrayers = properPrayers || {};
    const finalAntiphons = antiphons || {};
    // Use default generic intercessions if none provided
    const defaultIntercessions = `
**Diácono/Lector:**

Por la santa Iglesia de Dios: para que el Señor la proteja y la santifique.

**Pueblo:** Te rogamos, óyenos.

**Diácono/Lector:**

Por nuestro Papa, nuestros obispos y todos los ministros del Evangelio: para que sean fieles dispensadores de los misterios de Dios.

**Pueblo:** Te rogamos, óyenos.

**Diácono/Lector:**

Por los gobernantes de las naciones: para que busquen la justicia y la paz.

**Pueblo:** Te rogamos, óyenos.

**Diácono/Lector:**

Por los enfermos, los que sufren y los marginados: para que experimenten el amor sanador de Cristo.

**Pueblo:** Te rogamos, óyenos.

**Diácono/Lector:**

Por nuestra comunidad: para que crezcamos en santidad y en el amor mutuo.

**Pueblo:** Te rogamos, óyenos.
`;

    const finalIntercessions = intercessions || defaultIntercessions;

    return `
# Santa Misa - ${feastLabel}

**Color Litúrgico:** ${liturgicalColor?.emoji || '🟢'} ${liturgicalColor?.color || 'Verde'}

[[Se toca la campana. Procesión de entrada con cruz procesional, cirios y ministros]]

${finalAntiphons.entrance ? `**Antífona de Entrada:** ${finalAntiphons.entrance}

` : ''}---

## RITOS INICIALES

### Procesión de Entrada

[[El Sacerdote y los ministros se acercan al altar mientras se canta el canto de entrada]]

[[Todos están de pie]]

[[Al llegar al altar, el Sacerdote y el Diácono hacen una reverencia profunda. Si hay sagrario con el Santísimo, hacen genuflexión]]

[[El Sacerdote sube al altar y lo besa]]

[[Si se usa incienso, el Sacerdote inciensa la cruz y el altar]]

### Saludo

[[El Sacerdote se dirige a su sede. Todos están de pie]]

[[El Sacerdote y el pueblo se santiguan]]

**Sacerdote:** En el nombre del Padre, y del Hijo, y del Espíritu Santo.

**Pueblo:** Amén.

[[El Sacerdote extiende las manos]]

**Sacerdote:** La gracia de nuestro Señor Jesucristo, el amor del Padre y la comunión del Espíritu Santo estén con todos vosotros.

**Pueblo:** Y con tu espíritu.

---

### Acto Penitencial

[[El Sacerdote invita al arrepentimiento]]

**Sacerdote:** Hermanos: para celebrar dignamente estos sagrados misterios, reconozcamos nuestros pecados.

[[Breve pausa de silencio]]

[[Todos golpean el pecho en las palabras "por mi culpa"]]

[[INSERTAR_YO_CONFIESO]]

**Sacerdote:** Dios todopoderoso tenga misericordia de nosotros, perdone nuestros pecados y nos lleve a la vida eterna.

**Pueblo:** Amén.

---

### Señor, Ten Piedad (Kyrie)

[[Puede ser cantado o recitado]]

**Sacerdote:** Señor, ten piedad.

**Pueblo:** Señor, ten piedad.

**Sacerdote:** Cristo, ten piedad.

**Pueblo:** Cristo, ten piedad.

**Sacerdote:** Señor, ten piedad.

**Pueblo:** Señor, ten piedad.

---

### Gloria

[[Se omite en Adviento y Cuaresma. Se canta o recita en todos los domingos fuera de estos tiempos, solemnidades y fiestas]]

[[Todos están de pie]]

[[INSERTAR_GLORIA]]

---

### Oración Colecta

[[El Sacerdote, con las manos juntas, dice]]

**Sacerdote:** Oremos.

[[Breve pausa de silencio para orar]]

[[El Sacerdote extiende las manos]]

**Sacerdote:** ${finalProperPrayers.collect || `Oh Dios, que en la festividad de ${feastLabel} manifiestas tu gloria, concede a tu pueblo la gracia de celebrar dignamente este santo misterio.

Por nuestro Señor Jesucristo, tu Hijo, que vive y reina contigo en la unidad del Espíritu Santo y es Dios por los siglos de los siglos.`}

**Pueblo:** Amén.

[[Todos se sientan]]

---

## LITURGIA DE LA PALABRA

### Primera Lectura

[[El lector va al ambón. Todos sentados y atentos]]

[[LECTURA_1]]

[[Breve silencio]]

**Lector:** Palabra de Dios.

**Pueblo:** Te alabamos, Señor.

[[El lector vuelve a su lugar]]

---

### Salmo Responsorial

[[El salmista va al ambón o canta desde su lugar]]

[[Todos sentados. El salmo se canta o recita]]

[[SALMO]]

---

### Segunda Lectura

[[El lector va al ambón]]

[[LECTURA_2]]

[[Breve silencio]]

**Lector:** Palabra de Dios.

**Pueblo:** Te alabamos, Señor.

---

### Aclamación antes del Evangelio

[[Todos se ponen de pie para honrar a Cristo presente en el Evangelio]]

[[Si se usa incienso, el Sacerdote inciensa el Evangeliario]]

[[Puede cantarse con instrumentos musicales]]

**Pueblo:** Aleluya, aleluya.

${finalAlleluiaVerse}

Aleluya.

---

### Evangelio

[[El Diácono o el Sacerdote va al ambón llevando el Evangeliario]]

[[Si hay Diácono, pide la bendición al Sacerdote]]

[[El Diácono o Sacerdote saluda al pueblo]]

**Sacerdote:** El Señor esté con vosotros.

**Pueblo:** Y con tu espíritu.

**Sacerdote:** Lectura del santo Evangelio según san [[EVANGELISTA]].

[[El Sacerdote o Diácono hace la señal de la cruz sobre el Evangeliario y luego sobre su frente, labios y pecho. Todos hacen lo mismo]]

**Pueblo:** Gloria a ti, Señor.

[[Si se usa incienso, el libro es incensado antes de la lectura]]

[[EVANGELIO]]

[[Al terminar, el Sacerdote o Diácono besa el Evangeliario]]

**Sacerdote:** Palabra del Señor.

**Pueblo:** Gloria a ti, Señor Jesús.

---

### Homilía

[[El Sacerdote predica sobre las lecturas del día]]

[[Todos sentados escuchan con atención]]

[[Breve silencio para la reflexión]]

---

### Profesión de Fe (Credo)

[[Todos se ponen de pie]]

[[En las palabras "Y por obra del Espíritu Santo... y se hizo hombre", todos hacen una inclinación profunda de cabeza. En Navidad y Anunciación se hace genuflexión]]

[[INSERTAR_CREDO]]

---

### Oración Universal (Oración de los Fieles)

[[Todos de pie. El Sacerdote introduce la oración con las manos juntas]]

**Sacerdote:** Hermanos, oremos al Padre por las necesidades de la Iglesia y del mundo.

[[El Diácono o un lector proclama las intenciones desde el ambón]]

${finalIntercessions}

[[El Sacerdote concluye con las manos extendidas]]

**Sacerdote:** Escucha, Padre, las oraciones de tu pueblo, y concédenos lo que te pedimos con fe. Por Jesucristo nuestro Señor.

**Pueblo:** Amén.

---

## LITURGIA EUCARÍSTICA

### Presentación de las Ofrendas

[[Todos sentados. Algunos fieles llevan el pan y el vino al altar en procesión]]

[[El Sacerdote recibe las ofrendas y las coloca sobre el altar]]

[[Puede haber un canto de ofertorio]]

[[El Sacerdote toma la patena con el pan y la eleva un poco sobre el altar]]

**Sacerdote:** Bendito seas, Señor, Dios del universo, por este pan, fruto de la tierra y del trabajo del hombre, que recibimos de tu generosidad y ahora te presentamos; él será para nosotros pan de vida.

**Pueblo:** Bendito seas por siempre, Señor.

[[El Sacerdote deja la patena sobre el corporal]]

[[El Diácono o el Sacerdote echa vino y un poco de agua en el cáliz, diciendo en secreto: "Por el misterio de esta agua y este vino..."]]

[[El Sacerdote toma el cáliz y lo eleva un poco sobre el altar]]

**Sacerdote:** Bendito seas, Señor, Dios del universo, por este vino, fruto de la vid y del trabajo del hombre, que recibimos de tu generosidad y ahora te presentamos; él será para nosotros bebida de salvación.

**Pueblo:** Bendito seas por siempre, Señor.

[[El Sacerdote deja el cáliz sobre el corporal]]

[[Inclinado, el Sacerdote dice en secreto: "Acepta, Señor, nuestro corazón contrito..."]]

[[Si se usa incienso, el Sacerdote inciensa las ofrendas, la cruz y el altar. Luego el Diácono o un ministro inciensa al Sacerdote y al pueblo]]

[[El Sacerdote se lava las manos en el lado del altar, diciendo en secreto: "Lava del todo mi delito, Señor..."]]

---

### Oración sobre las Ofrendas

[[El Sacerdote, en el centro del altar, invita al pueblo]]

**Sacerdote:** Orad, hermanos, para que este sacrificio mío y vuestro sea agradable a Dios, Padre todopoderoso.

[[Todos se ponen de pie]]

**Pueblo:** El Señor reciba de tus manos este sacrificio, para alabanza y gloria de su nombre, para nuestro bien y el de toda su santa Iglesia.

[[El Sacerdote, con las manos extendidas, dice la oración]]

**Sacerdote:** ${finalProperPrayers.offerings || `Acepta, Señor, las ofrendas de tu Iglesia, y concede que, alimentados con el Cuerpo y la Sangre de tu Hijo, participemos de su vida divina.

Él, que vive y reina por los siglos de los siglos.`}

**Pueblo:** Amén.

---

### Plegaria Eucarística

[[El Sacerdote comienza el Prefacio con las manos extendidas]]

**Sacerdote:** El Señor esté con vosotros.

**Pueblo:** Y con tu espíritu.

**Sacerdote:** Levantemos el corazón.

**Pueblo:** Lo tenemos levantado hacia el Señor.

**Sacerdote:** Demos gracias al Señor, nuestro Dios.

**Pueblo:** Es justo y necesario.

**Sacerdote:** ${finalPreface}

---

### Santo

[[Todos de pie. Puede cantarse]]

[[INSERTAR_SANTO]]

[[Después del Santo, algunos se arrodillan. Donde no es costumbre arrodillarse, se hace una inclinación profunda cuando el Sacerdote extiende las manos sobre las ofrendas]]

---

### Consagración

[[El Sacerdote, con las manos extendidas sobre las ofrendas, invoca al Espíritu Santo]]

[[INSERTAR_CONSAGRACION]]

[[Al elevar la Hostia consagrada, puede hacerse sonar la campanilla. Todos adoran en silencio]]

[[Al elevar el Cáliz consagrado, puede hacerse sonar la campanilla. Todos adoran en silencio]]

[[Si se usa incienso, el Diácono inciensa la Hostia y el Cáliz en cada elevación]]

---

### Aclamación Memorial

**Sacerdote:** Este es el sacramento de nuestra fe.

[[Todos proclaman]]

**Pueblo:** Anunciamos tu muerte, proclamamos tu resurrección. ¡Ven, Señor Jesús!

---

### Doxología

[[El Sacerdote toma la patena con la Hostia y el cáliz, los eleva y dice o canta]]

**Sacerdote:** Por Cristo, con él y en él, a ti, Dios Padre omnipotente, en la unidad del Espíritu Santo, todo honor y toda gloria por los siglos de los siglos.

[[Todos aclaman]]

**Pueblo:** Amén.

[[Todos se ponen de pie]]

---

## RITO DE LA COMUNIÓN

### Padre Nuestro

[[El Sacerdote, con las manos juntas, introduce]]

**Sacerdote:** Fieles a la recomendación del Salvador y siguiendo su divina enseñanza, nos atrevemos a decir:

[[El Sacerdote extiende las manos]]

[[INSERTAR_PADRE_NUESTRO]]

---

### Embolismo

[[El Sacerdote, con las manos extendidas, continúa solo]]

**Sacerdote:** Líbranos de todos los males, Señor, y concédenos la paz en nuestros días, para que, ayudados por tu misericordia, vivamos siempre libres de pecado y protegidos de toda perturbación, mientras esperamos la gloriosa venida de nuestro Salvador Jesucristo.

[[El pueblo concluye la oración con la aclamación]]

**Pueblo:** Tuyo es el reino, tuyo el poder y la gloria, por siempre, Señor.

---

### Rito de la Paz

[[El Sacerdote, con las manos extendidas, dice]]

**Sacerdote:** Señor Jesucristo, que dijiste a tus apóstoles: "La paz os dejo, mi paz os doy", no tengas en cuenta nuestros pecados, sino la fe de tu Iglesia, y, conforme a tu palabra, concédele la paz y la unidad.

Tú que vives y reinas por los siglos de los siglos.

**Pueblo:** Amén.

[[El Sacerdote, extendiendo y juntando las manos, saluda]]

**Sacerdote:** La paz del Señor esté siempre con vosotros.

**Pueblo:** Y con tu espíritu.

[[El Diácono o el Sacerdote puede añadir]]

**Diácono/Sacerdote:** Daos fraternalmente la paz.

[[Se intercambia el signo de la paz según las costumbres del lugar. El Sacerdote da la paz al Diácono o al ministro]]

---

### Cordero de Dios

[[El Sacerdote parte la Hostia consagrada sobre la patena. Una partícula la echa en el cáliz, diciendo en secreto: "El Cuerpo y la Sangre..."]]

[[Mientras tanto, se canta o recita el Cordero de Dios]]

[[INSERTAR_CORDERO]]

[[Después del Cordero de Dios, todos se arrodillan]]

---

### Comunión

[[El Sacerdote hace genuflexión, toma la Hostia y, sosteniéndola un poco elevada sobre la patena o el cáliz, dice]]

**Sacerdote:** Este es el Cordero de Dios, que quita el pecado del mundo. Dichosos los invitados a la cena del Señor.

[[El Sacerdote y el pueblo se golpean el pecho]]

**Pueblo:** Señor, no soy digno de que entres en mi casa, pero una palabra tuya bastará para sanarme.

[[El Sacerdote comulga con reverencia el Cuerpo y la Sangre de Cristo]]

[[Luego distribuye la Comunión a los fieles]]

[[Los comulgantes se acercan procesionalmente, hacen reverencia antes de recibir]]

**Sacerdote:** El Cuerpo de Cristo.

**Comulgante:** Amén.

[[Si se da el Cáliz]]

**Ministro:** La Sangre de Cristo.

**Comulgante:** Amén.

[[Durante la distribución, puede haber un canto de comunión o silencio contemplativo]]

${finalAntiphons.communion ? `**Antífona de Comunión:** ${finalAntiphons.communion}

` : ''}[[Después de la comunión, el Sacerdote purifica el cáliz y la patena]]

[[Breve silencio, o puede cantarse un himno de alabanza]]

---

### Oración después de la Comunión

[[Todos se ponen de pie]]

[[Breve silencio para la oración personal]]

[[El Sacerdote, con las manos juntas, dice]]

**Sacerdote:** Oremos.

[[El Sacerdote, con las manos extendidas, dice]]

${finalProperPrayers.postCommunion || `Alimentados con el pan del cielo, te pedimos, Señor, que este sacramento, que hemos recibido con fe, sea medicina de nuestras almas.

Por Jesucristo nuestro Señor.`}

**Pueblo:** Amén.

---

## RITO DE CONCLUSIÓN

### Avisos

[[Si los hay, el Diácono o un laico hace breves anuncios al pueblo]]

---

### Bendición Final

[[El Sacerdote saluda al pueblo]]

**Sacerdote:** El Señor esté con vosotros.

**Pueblo:** Y con tu espíritu.

[[El Sacerdote bendice al pueblo, haciendo la señal de la cruz sobre ellos]]

**Sacerdote:** La bendición de Dios todopoderoso, Padre, Hijo ✠ y Espíritu Santo, descienda sobre vosotros.

[[Todos se santiguan]]

**Pueblo:** Amén.

---

### Despedida

[[El Diácono o el Sacerdote despide al pueblo]]

**Diácono/Sacerdote:** Podéis ir en paz.

**Pueblo:** Demos gracias a Dios.

[[El Sacerdote venera el altar con un beso]]

[[El Sacerdote, junto con los ministros, hace reverencia profunda al altar (o genuflexión si hay sagrario)]]

[[Canto final. Procesión de salida con cruz y cirios]]

---

## Después de la Misa

### Antífona Mariana

[[Según el tiempo litúrgico: Alma Redemptoris Mater (Adviento-Navidad), Ave Regina Caelorum (Cuaresma), Regina Caeli (Pascua), Salve Regina (Tiempo Ordinario)]]

[[De rodillas o de pie según la costumbre del lugar]]

**Pueblo:** Dios te salve, Reina y Madre de misericordia, vida, dulzura y esperanza nuestra; Dios te salve. A ti llamamos los desterrados hijos de Eva; a ti suspiramos, gimiendo y llorando en este valle de lágrimas. Ea, pues, Señora, abogada nuestra, vuelve a nosotros esos tus ojos misericordiosos; y después de este destierro, muéstranos a Jesús, fruto bendito de tu vientre. Oh clemente, oh piadosa, oh dulce Virgen María.

**Sacerdote:** Ruega por nosotros, santa Madre de Dios.

**Pueblo:** Para que seamos dignos de alcanzar las promesas de nuestro Señor Jesucristo.

---

*Fin de la Santa Misa*
`;
};
