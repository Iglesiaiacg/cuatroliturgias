import { useState } from 'react';

export default function OccasionalServicesView({ onNavigate, setDocContent, setServiceTitle }) {

    // Content Definitions
    const serviceContent = {
        "Antífonas para el Lucernario": `
            <div class="liturgy-content">
                <h1>Antífonas para el Lucernario</h1>
                <p class="rubric">Este rito se utiliza antes de la Oración Vespertina, especialmente en fiestas o domingos.</p>
                <p class="rubric">Se encienden las velas.</p>
                
                <p>Luz y paz en Jesucristo nuestro Señor.</p>
                <p><strong>Demos gracias a Dios.</strong></p>
                
                <h3>Luz Alegre (Phos Hilaron)</h3>
                <p>Oh Luz alegre del santo esplendor del Padre,<br>
                inmortal, celeste, santo, bendito,<br>
                Jesucristo.</p>
                
                <p>Habiendo llegado a la puesta del sol,<br>
                y viendo la luz de la tarde,<br>
                cantamos a Dios: Padre, Hijo, y Espíritu Santo.</p>
                
                <p>Digno eres en todo momento<br>
                de ser alabado con voces propicias,<br>
                Hijo de Dios, Dador de la vida;<br>
                por tanto el mundo te glorifica.</p>

                <p class="rubric">A continuación puede seguir un himno o salmo de lucernario apropiado, como el Salmo 141.</p>
                
                <h3>Salmo 141</h3>
                <p>Señor, a ti clamo; apresúrate a mí; *<br>
                <strong>escucha mi voz cuando te invoco.</strong></p>
                <p>Suba mi oración delante de ti como el incienso, *<br>
                <strong>el don de mis manos como la ofrenda de la tarde.</strong></p>
                <p>Pon guarda a mi boca, oh Señor; *<br>
                <strong>guarda la puerta de mis labios.</strong></p>
                <p>No dejes que se incline mi corazón a cosa mala, *<br>
                <strong>a hacer obras impías con los que obran iniquidad; y no coma yo de sus deleites.</strong></p>
                <p>Que el justo me castigue, será un favor, y que me reprenda será un excelente bálsamo *<br>
                <strong>que no me herirá la cabeza; pero mi oración será continuamente contra las maldades de aquéllos.</strong></p>
                <p>Serán despeñados sus jueces en lugares peñascosos, *<br>
                <strong>y oirán mis palabras, que son verdaderas.</strong></p>
                <p>Como quien hiende y rompe la tierra, *<br>
                <strong>son esparcidos nuestros huesos a la boca del Seol.</strong></p>
                <p>Por tanto, a ti, oh Jehová, Señor, miran mis ojos; *<br>
                <strong>en ti he confiado; no desampares mi alma.</strong></p>
                <p>Guárdame de los lazos que me han tendido, *<br>
                <strong>y de las trampas de los que hacen iniquidad.</strong></p>
                <p>Caigan los impíos a una en sus redes, *<br>
                <strong>mientras yo paso adelante.</strong></p>
                
                <p class="rubric">Se concluye con la Oración.</p>
                
                <p>Oremos.</p>
                <p>Señor Jesucristo, mientras este día se apaga en el anochecer, te pedimos que la luz de tu verdad disipe las tinieblas de nuestros corazones; tú que eres la Luz del mundo, y vives y reinas con el Dios Padre y el Espíritu Santo, un solo Dios, por los siglos de los siglos. <strong>Amén.</strong></p>
            </div>
        `,
        "Antífonas para la Fracción": `
            <div class="liturgy-content">
                <h1>Antífonas para la Fracción</h1>
                <p class="rubric">Cantos para la fracción del pan (Confractoria).</p>

                <p class="rubric">Uno de los siguientes himnos u otros apropiados, pueden ser cantados.</p>

                <h3>Cristo Nuestra Pascua (Pascha Nostrum)</h3>
                <p>Aleluya. Cristo nuestra Pascua ha sido sacrificado por nosotros; *<br>
                <strong>por tanto celebremos la fiesta. Aleluya.</strong></p>

                <h3>Cordero de Dios (Agnus Dei)</h3>
                <p>Cordero de Dios, que quitas el pecado del mundo, *<br>
                <strong>ten piedad de nosotros.</strong></p>
                <p>Cordero de Dios, que quitas el pecado del mundo, *<br>
                <strong>ten piedad de nosotros.</strong></p>
                <p>Cordero de Dios, que quitas el pecado del mundo, *<br>
                <strong>danos tu paz.</strong></p>

                <h3>Reconócete, Señor Jesús</h3>
                <p>Reconócete, Señor Jesús, al partir el pan. *<br>
                <strong>Reconócete, Señor Jesús, al partir el pan.</strong></p>
                <p>El pan que partimos es la comunión del cuerpo de Cristo. *<br>
                <strong>Reconócete, Señor Jesús, al partir el pan.</strong></p>
                <p>Un solo cuerpo somos, aunque muchos, pues todos participamos de un solo pan. *<br>
                <strong>Reconócete, Señor Jesús, al partir el pan.</strong></p>
            </div >
        `,
        "Bendiciones Estacionales": `
            <div class="liturgy-content">
                <h1>Bendiciones Estacionales</h1>
                <p class="rubric">Bendiciones especiales para cada tiempo litúrgico.</p>
                <p class="rubric">Una o más de las siguientes bendiciones pueden ser utilizadas por el Obispo (o el Presbítero).</p>

                <h3>Adviento</h3>
                <p>Que el Sol de Justicia brille sobre ustedes y disperse las tinieblas de su camino.<br>
                <strong>Amén.</strong></p>
                <p>Que él los fortalezca y prepare sus corazones para su venida.<br>
                <strong>Amén.</strong></p>
                <p>Que la bendición de Dios Todopoderoso, Padre, Hijo y Espíritu Santo, sea con ustedes y permanezca siempre.<br>
                <strong>Amén.</strong></p>

                <h3>Navidad</h3>
                <p>Que Dios, que amó tanto al mundo que envió a su Hijo Unigénito, les conceda ser hijos de Dios por adopción y gracia.<br>
                <strong>Amén.</strong></p>
                <p>Que Dios, que aceptó nuestra naturaleza terrenal en el Verbo hecho carne, les conceda participar de su vida divina.<br>
                <strong>Amén.</strong></p>
                <p>Que la bendición de Dios Todopoderoso, Padre, Hijo y Espíritu Santo, sea con ustedes y permanezca siempre.<br>
                <strong>Amén.</strong></p>

                <h3>Epifanía</h3>
                <p>Que Cristo, que atrajo a las naciones a su luz, les conceda en esta vida caminar en su luz.<br>
                <strong>Amén.</strong></p>
                <p>Que él, que apareció en nuestra carne, transforme sus vidas a su semejanza.<br>
                <strong>Amén.</strong></p>
                <p>Que la bendición de Dios Todopoderoso, Padre, Hijo y Espíritu Santo, sea con ustedes y permanezca siempre.<br>
                <strong>Amén.</strong></p>

                <h3>Cuaresma</h3>
                <p>Que Dios, que nos concedió estos días de penitencia, les conceda el perdón de sus pecados y la paz.<br>
                <strong>Amén.</strong></p>
                <p>Que él les conceda la gracia de una verdadera conversión y la fortaleza para vencer el mal.<br>
                <strong>Amén.</strong></p>
                <p>Que la bendición de Dios Todopoderoso, Padre, Hijo y Espíritu Santo, sea con ustedes y permanezca siempre.<br>
                <strong>Amén.</strong></p>

                <h3>Pascua</h3>
                <p>Que el Dios de la paz, que resucitó de los muertos a nuestro Señor Jesucristo, el gran Pastor de las ovejas, los haga aptos en toda obra buena para que hagan su voluntad.<br>
                <strong>Amén.</strong></p>
                <p>Que él, que destruyó la muerte por su muerte y restauró la vida por su resurrección, les conceda la inmortalidad.<br>
                <strong>Amén.</strong></p>
                <p>Que la bendición de Dios Todopoderoso, Padre, Hijo y Espíritu Santo, sea con ustedes y permanezca siempre.<br>
                <strong>Amén.</strong></p>

                <h3>Pentecostés</h3>
                <p>Que el Espíritu de la verdad los guíe a toda la verdad y les conceda el don de la sabiduría.<br>
                <strong>Amén.</strong></p>
                <p>Que él, que unió las lenguas de las naciones en la confesión de un solo nombre, los mantenga firmes en la fe.<br>
                <strong>Amén.</strong></p>
                <p>Que la bendición de Dios Todopoderoso, Padre, Hijo y Espíritu Santo, sea con ustedes y permanezca siempre.<br>
                <strong>Amén.</strong></p>
            </div>
        `,
        "Sobre la Corona de Adviento": `
            <div class="liturgy-content">
                <h1>Sobre la Corona de Adviento</h1>
                <p class="rubric">Este rito está pensado para ser parte de la Oración Vespertina o de la Eucaristía, al comienzo del servicio.</p>

                <h3>Bendición de la Corona</h3>
                <p class="rubric">Se usa solo el Primer Domingo de Adviento.</p>
                <p>Oh Dios, por cuya palabra todas las cosas son santificadas, derrama tu bendición sobre esta corona y concédenos que quienes la usen preparen sus corazones para la venida de Cristo, y reciban de Ti abundante gracia. Por Jesucristo nuestro Señor.<br>
                <strong>Amén.</strong></p>

                <h3>Primer Domingo de Adviento</h3>
                <p class="rubric">Se enciende la primera vela (morada).</p>
                <p>Encendemos esta vela, Señor, mientras esperamos tu venida; que la luz de tu amor disipe las tinieblas de nuestro mundo y nos guíe hacia Ti.<br>
                <strong>Amén.</strong></p>

                <h3>Segundo Domingo de Adviento</h3>
                <p class="rubric">Se encienden dos velas (moradas).</p>
                <p>Rey de Paz, enciende en nuestros corazones el fuego de tu amor; que al prepararnos para recibirte, seamos instrumentos de tu paz en el mundo.<br>
                <strong>Amén.</strong></p>

                <h3>Tercer Domingo de Adviento</h3>
                <p class="rubric">Se encienden tres velas (dos moradas y una rosa).</p>
                <p>Dios de Gozo, regocijamos nuestras almas en tu promesa; que la cercanía de nuestra salvación nos llene de alegría y esperanza renovada.<br>
                <strong>Amén.</strong></p>

                <h3>Cuarto Domingo de Adviento</h3>
                <p class="rubric">Se encienden las cuatro velas.</p>
                <p>Emanuel, Dios con nosotros, abre nuestros ojos para ver tu presencia; que al completar nuestra espera, estemos listos para recibirte con fe pura y amor sincero.<br>
                <strong>Amén.</strong></p>
                
                <h3>Nochebuena / Navidad</h3>
                <p class="rubric">Se encienden todas las velas y el cirio central (blanco).</p>
                <p>Gloria a Dios en las alturas, y en la tierra paz. La Palabra se hizo carne y habitó entre nosotros, y hemos visto su gloria. Cristo, la Luz del mundo, ha nacido. ¡Aleluya!<br>
                <strong>Amén.</strong></p>
            </div>
        `,
        "Festival de Lecciones y Música de Adviento": `
            <div class="liturgy-content">
                <h1>Festival de Lecciones y Música de Adviento</h1>
                <p class="rubric">Este servicio celebra la esperanza de la venida de Cristo a través de lecturas bíblicas y música.</p>
                <p class="rubric">Se puede comenzar con una procesión y un himno de entrada (ej. "Ven, ven, Señor, no tardes" o "Ven, oh ven, Emanuel").</p>

                <h3>Oración del Oficiante (Bidding Prayer)</h3>
                <p>Amados en Cristo, en este tiempo de Adviento, es nuestra responsabilidad y gozo preparar nuestros corazones para escuchar una vez más el mensaje de los ángeles; para ir en espíritu a Belén y ver esta cosa que ha sucedido y que el Señor nos ha dado a conocer: el Verbo hecho carne.</p>
                <p>Por tanto, oremos por las necesidades de todo el mundo; por la paz y la justicia en la tierra; por la unidad y la misión de la Iglesia...</p>
                <p>Y para resumir todas estas peticiones, oremos con las palabras que Cristo mismo nos enseñó:</p>
                <p><strong>Padre nuestro...</strong></p>

                <h3>Primera Lección: La Caída</h3>
                <p class="rubric">Génesis 3:1-15 (o selección)</p>
                <p><em>Adán y Eva se rebelan contra Dios y son expulsados del Edén, pero se promete la redención.</em></p>
                <p>[Inserte lectura completa aquí si se desea, o lea directamente de la Biblia]</p>
                <p class="rubric">Se canta un himno o villancico.</p>

                <h3>Segunda Lección: La Promesa a Abraham</h3>
                <p class="rubric">Génesis 22:15-18</p>
                <p><em>Dios promete que en la descendencia de Abraham serán benditas todas las naciones.</em></p>
                <p class="rubric">Se canta un himno o villancico.</p>

                <h3>Tercera Lección: La Profecía de un Salvador</h3>
                <p class="rubric">Isaías 9:2, 6-7</p>
                <p><em>El pueblo que andaba en tinieblas ha visto gran luz... Porque un niño nos es nacido.</em></p>
                <p class="rubric">Se canta un himno o villancico.</p>

                <h3>Cuarta Lección: La Vara de Isaí</h3>
                <p class="rubric">Isaías 11:1-9</p>
                <p><em>Saldrá una vara del tronco de Isaí... y reposará sobre él el Espíritu de Jehová.</em></p>
                <p class="rubric">Se canta un himno o villancico.</p>

                <h3>Quinta Lección: El Anuncio a María</h3>
                <p class="rubric">Lucas 1:26-38</p>
                <p><em>El ángel Gabriel anuncia a María que concebirá y dará a luz un hijo.</em></p>
                <p class="rubric">Se canta un himno o villancico (ej. "Ave María" o Magníficat).</p>

                <h3>Sexta Lección: El Nacimiento de Emmanuel</h3>
                <p class="rubric">Mateo 1:18-23</p>
                <p><em>El ángel se le aparece a José: llamará su nombre Emmanuel.</em></p>
                <p class="rubric">Se canta un himno o villancico.</p>

                <h3>Séptima Lección: La Palabra se hizo Carne</h3>
                <p class="rubric">San Juan 1:1-14</p>
                <p><em>Y aquel Verbo fue hecho carne, y habitó entre nosotros.</em></p>
                <p class="rubric">Se canta un himno o villancico de alabanza.</p>

                <h3>Colecta y Bendición</h3>
                <p>Oremos.</p>
                <p>Oh Dios, que alegras nuestros corazones con la espera de la redención; concédenos que al recibir a tu Unigénito Hijo como nuestro Redentor con gozo, podamos también verle sin temor cuando venga a ser nuestro Juez; quien vive y reina contigo y el Espíritu Santo, un solo Dios, ahora y por siempre.<br>
                <strong>Amén.</strong></p>
                <p>La bendición de Dios Todopoderoso...</p>
            </div>
        `,
        "Vigilia de Nochebuena": `
            <div class="liturgy-content">
                <h1>Vigilia de Nochebuena</h1>
                <p class="rubric">Este rito está destinado a preceder la Eucaristía de la Noche de Navidad. Comienza en silencio o con un preludio musical.</p>

                <h3>Salmo Invitatorio</h3>
                <p>Aleluya. A nosotros un niño nos es nacido; *<br>
                <strong>Venid, adorémosle. Aleluya.</strong></p>

                <h3>Salmo 89 (Selección)</h3>
                <p>Las misericordias de Jehová cantaré perpetuamente; *<br>
                <strong>de generación en generación haré notoria tu fidelidad con mi boca.</strong></p>
                <p>Porque dije: Para siempre será edificada misericordia; *<br>
                <strong>en los cielos mismos afirmarás tu verdad.</strong></p>
                <p>Para siempre confirmaré tu descendencia, *<br>
                <strong>y edificaré tu trono por todas las generaciones.</strong></p>
                <p>Celebrarán los cielos tus maravillas, oh Jehová, *<br>
                <strong>tu verdad también en la congregación de los santos.</strong></p>

                <h3>Lección: La Genealogía de Cristo</h3>
                <p class="rubric">Mateo 1:1-17</p>
                <p>Libro de la genealogía de Jesucristo, hijo de David, hijo de Abraham...</p>
                <p>[Se puede leer el texto completo de la genealogía aquí]</p>
                <p>...así el nacimiento de Jesucristo fue así.</p>

                <h3>Te Deum Laudamus</h3>
                <p class="rubric">Se canta o dice el Te Deum.</p>
                <p>A ti, oh Dios, te alabamos; a ti, Señor, te reconocemos.<br>
                A ti, eterno Padre, te venera toda la tierra.<br>
                Santo, Santo, Santo, Señor Dios de los Ejércitos;<br>
                Llenos están los cielos y la tierra de la majestad de tu gloria.</p>

                <h3>Colecta</h3>
                <p>Oremos.</p>
                <p>Oh Dios, que has iluminado esta noche santísima con el resplandor de la luz verdadera; concédenos que, así como en la tierra hemos conocido el misterio de esa Luz, podamos también gozar de él plenamente en el cielo; donde con el Padre y el Espíritu Santo vive y reina, un solo Dios, en gloria sempiterna.<br>
                <strong>Amén.</strong></p>
            </div>
        `,
        "Estación ante el Pesebre": `
            <div class="liturgy-content">
                <h1>Estación ante el Pesebre</h1>
                <p class="rubric">Este rito puede usarse antes de la Eucaristía de Navidad o como un servicio devocional independiente.</p>
                <p class="rubric">Durante el himno de entrada o procesional, los ministros van hacia el pesebre.</p>

                <h3>Versículo y Respuesta</h3>
                <p>La Palabra se hizo carne y habitó entre nosotros; *<br>
                <strong>Y vimos su gloria.</strong></p>
                <p>Aleluya. A nosotros un niño nos es nacido; *<br>
                <strong>Venid, adorémosle. Aleluya.</strong></p>

                <h3>Lectura</h3>
                <p class="rubric">Lucas 2:1-20 (El Nacimiento de Jesús)</p>
                <p>Aconteció en aquellos días, que se promulgó un edicto de parte de Augusto César, que todo el mundo fuese empadronado...</p>

                <h3>Colecta del Pesebre</h3>
                <p>Oremos.</p>
                <p>Oh Dios, nuestro Padre, tú has amado tanto al mundo que diste a tu único Hijo Jesús, para nacer en un pesebre humilde. Te alabamos y te damos gracias por el don de su presencia entre nosotros. Haz que nuestros corazones sean como el de María, guardando todas estas cosas y meditándolas. Por el mismo Jesucristo nuestro Señor.<br>
                <strong>Amén.</strong></p>
                
                <p class="rubric">Pueden cantarse villancicos como "Noche de Paz" o "A la nanita nana".</p>
            </div>
        `,
        "Festival de Lecciones y Música de Navidad": `
            <div class="liturgy-content">
                <h1>Festival de Lecciones y Música de Navidad</h1>
                <p class="rubric">Este servicio tradicional incluye nueve lecciones bíblicas intercaladas con villancicos.</p>

                <h3>Oración del Oficiante (Bidding Prayer)</h3>
                <p>Amados en Cristo, sea nuestro cuidado y deleite escuchar nuevamente el mensaje de los ángeles, e ir en corazón y mente a Belén y ver esta cosa que ha sucedido y que el Señor nos ha dado a conocer: el Verbo hecho carne.</p>
                <p>Oremos por la paz del mundo... por la unidad de la Iglesia... por los pobres y los desamparados...</p>
                <p>Y sumemos todas nuestras oraciones diciendo:</p>
                <p><strong>Padre nuestro...</strong></p>

                <h3>Primera Lección</h3>
                <p class="rubric">Génesis 3:8-15</p>
                <p><em>Dios anuncia en el jardín del Edén que la simiente de la mujer herirá la cabeza de la serpiente.</em></p>
                <p class="rubric">Se canta un villancico.</p>

                <h3>Segunda Lección</h3>
                <p class="rubric">Génesis 22:15-18</p>
                <p><em>Dios promete al fiel Abraham que en su simiente serán benditas todas las naciones de la tierra.</em></p>
                <p class="rubric">Se canta un villancico.</p>

                <h3>Tercera Lección</h3>
                <p class="rubric">Isaías 9:2-7</p>
                <p><em>El profeta anuncia la venida del Salvador para un pueblo que anda en tinieblas.</em></p>
                <p class="rubric">Se canta un villancico.</p>

                <h3>Cuarta Lección</h3>
                <p class="rubric">Miqueas 5:2-4</p>
                <p><em>El profeta anuncia la gloria de la pequeña Belén.</em></p>
                <p class="rubric">Se canta un villancico (ej. "Oh, pueblecito de Belén").</p>

                <h3>Quinta Lección</h3>
                <p class="rubric">Lucas 1:26-38</p>
                <p><em>El ángel Gabriel saluda a la Santísima Virgen María.</em></p>
                <p class="rubric">Se canta un villancico.</p>

                <h3>Sexta Lección</h3>
                <p class="rubric">Lucas 2:1-7</p>
                <p><em>San Lucas cuenta el nacimiento de Jesús.</em></p>
                <p class="rubric">Se canta un villancico (ej. "Noche de Paz").</p>

                <h3>Séptima Lección</h3>
                <p class="rubric">Lucas 2:8-16</p>
                <p><em>Los pastores van al pesebre.</em></p>
                <p class="rubric">Se canta un villancico.</p>

                <h3>Octava Lección</h3>
                <p class="rubric">Mateo 2:1-12</p>
                <p><em>Los magos son guiados por la estrella a Jesús.</em></p>
                <p class="rubric">Se canta un villancico.</p>

                <h3>Novena Lección</h3>
                <p class="rubric">Juan 1:1-14</p>
                <p><em>San Juan explica el gran misterio de la Encarnación.</em></p>
                <p class="rubric">Se canta un villancico solemne (ej. "Adeste Fideles").</p>

                <h3>Colecta y Bendición</h3>
                <p>Oremos.</p>
                <p>Oh Dios, que haces que nos alegremos con la celebración anual del nacimiento de tu único Hijo Jesucristo; concédenos que, al recibirlo con gozo como nuestro Redentor, podamos con segura confianza contemplarlo cuando venga para ser nuestro Juez; quien vive y reina contigo y el Espíritu Santo, un solo Dios, ahora y por siempre.<br>
                <strong>Amén.</strong></p>
                <p>La bendición de Dios Todopoderoso...</p>
            </div>
        `,
    };

    const handleServiceClick = (item) => {
        if (serviceContent[item.title]) {
            if (setDocContent) {
                setDocContent(serviceContent[item.title]);
                if (setServiceTitle) setServiceTitle(item.title);
                onNavigate('generator');
            }
        } else {
            // Optional: fallback or toast for items not yet implemented
            console.log("Contenido no disponible para:", item.title);
        }
    };

    const services = [
        {
            category: "El Año Litúrgico",
            items: [
                { title: "Antífonas para el Lucernario", description: "Oraciones al encender las velas." },
                { title: "Antífonas para la Fracción", description: "Cantos para la fracción del pan (Confractoria)." },
                { title: "Bendiciones Estacionales", description: "Bendiciones especiales para cada tiempo litúrgico." },
                { title: "Sobre la Corona de Adviento", description: "Rito para bendecir y encender la corona." },
                { title: "Festival de Lecciones y Música de Adviento", description: "Servicio de lecturas y cánticos de espera." },
                { title: "Vigilia de Nochebuena", description: "Celebración en la víspera de la Natividad." },
                { title: "Estación ante el Pesebre", description: "Devoción especial ante el nacimiento." },
                { title: "Festival de Lecciones y Música de Navidad", description: "Celebración festiva de la Encarnación." },
                { title: "Víspera de Año Nuevo", description: "Oración para recibir el año civil." },
                { title: "Bendición de Hogares (Epifanía)", description: "Tradicional bendición de casas con tiza." },
                { title: "Vigilia Bautismo del Señor", description: "Preparación para la renovación bautismal." },
                { title: "Procesión de la Candelaria", description: "Bendición de las velas y procesión." },
                { title: "El Vía Crucis", description: "Meditación sobre la Pasión del Señor." },
                { title: "Oficio de Tinieblas (Tenebrae)", description: "Liturgia solemne de sombras y luz." },
                { title: "Jueves Santo: Lavatorio", description: "Rito del mandato del amor fraterno." },
                { title: "Jueves Santo: Reserva", description: "Traslado y reserva del Santísimo." },
                { title: "Jueves Santo: Despojo", description: "Despojo del altar tras la misa." },
                { title: "Ágape de Jueves Santo", description: "Cena fraterna recordando la Última Cena." },
                { title: "Bendición de Alimentos (Pascua)", description: "Bendición de la mesa de Pascua." },
                { title: "Bendición de Hogares (Pascua)", description: "Bendición de casas en tiempo pascual." },
                { title: "Procesión de las Rogativas", description: "Súplicas por los frutos de la tierra." },
                { title: "Vigilia de Todos los Santos", description: "Preparación para la solemnidad." },
                { title: "Víspera de Todos los Santos", description: "Servicio de oración (Halloween)." }
            ]
        },
        {
            category: "Servicios Pastorales",
            items: [
                { title: "Bienvenida a Nuevos", description: "Acogida de nuevos miembros a la comunidad." },
                { title: "Despedida de Miembros", description: "Oración al dejar una congregación." },
                { title: "Catecumenado", description: "Preparación de adultos para el Bautismo." },
                { title: "Admisión de Catecúmenos", description: "Rito de entrada al catecumenado." },
                { title: "Inscripción de Candidatos", description: "Elección para el Bautismo." },
                { title: "Entrga del Credo / Padre Nuestro", description: "Ritos de transmisión de la fe." },
                { title: "Vigilia Bautismal", description: "Oración previa al Bautismo." },
                { title: "Reafirmación Votos", description: "Renovación de promesas bautismales." },
                { title: "Recepción de Miembros", description: "Acogida de otras tradiciones cristianas." },
                { title: "Inscripción Cuaresmal", description: "Inicio de la preparación final." },
                { title: "Rito Jueves Santo", description: "Preparación inmediata a los sacramentos." },
                { title: "Bendición de Casa", description: "Celebración y bendición para un hogar." },
                { title: "Bendición Embarazada", description: "Oración por la madre y el hijo." },
                { title: "Padres y Padrinos", description: "Preparación para el rol bautismal." },
                { title: "Aniversario Matrimonio", description: "Renovación de votos matrimoniales." },
                { title: "Servicio de Sanación", description: "Oración pública por la salud." },
                { title: "Sobre el Exorcismo", description: "Notas pastorales sobre liberación." },
                { title: "Entierro no cristiano", description: "Servicio fúnebre pastoral." },
                { title: "Comisionamiento Laicos", description: "Envío a ministerios específicos." },
                { title: "Dedicación Mobiliario", description: "Bendición de ornamentos y objetos." }
            ]
        },
        {
            category: "Misión Episcopal",
            items: [
                { title: "Discernimiento Misión", description: "Liturgia para buscar la voluntad de Dios." },
                { title: "Comisionamiento Plantador", description: "Envío para fundar nuevas iglesias." },
                { title: "Apertura Congregación", description: "Inicio oficial de una nueva misión." },
                { title: "Puesta aparte espacio", description: "Bendición de lugares de culto temporal." },
                { title: "Letanía por la Misión", description: "Súplicas por la expansión del Evangelio." }
            ]
        }
    ];

    return (
        <main className="flex-1 flex flex-col w-full h-full bg-gray-50 dark:bg-background-dark animate-fade-in pb-24 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-white/5 shrink-0 z-10 shadow-sm">
                <button
                    onClick={() => onNavigate('dashboard')}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-colors -ml-2"
                >
                    <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">arrow_back</span>
                </button>
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display leading-none">Servicios Ocasionales</h2>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Libro de Servicios Ocasionales 2003</span>
                </div>
            </div>

            {/* Content grid */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">
                {services.map((section, idx) => (
                    <div key={idx} className="animate-slide-up" style={{ animationDelay: `${idx * 100} ms` }}>
                        <h3 className="text-sm font-bold text-teal-700 dark:text-teal-400 uppercase tracking-widest mb-4 px-1 sticky top-0 bg-gray-50 dark:bg-background-dark z-10 py-2">
                            {section.category}
                        </h3>

                        {/* Responsive Grid: 1 col mobile, 2 col tablet, 4 col desktop */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                            {section.items.map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleServiceClick(item)}
                                    className="relative flex flex-col p-5 bg-white dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all text-left group h-full"
                                >
                                    <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors text-teal-600 dark:text-teal-400">
                                        <span className="material-symbols-outlined text-[24px]">church</span>
                                    </div>

                                    <h4 className="font-bold text-gray-900 dark:text-white font-display leading-tight mb-2 group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h4>

                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                                        {item.description}
                                    </p>

                                    <div className="mt-auto pt-4 flex items-center text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                                        VER DETALLES <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="px-4 py-8 text-center bg-gray-100 dark:bg-white/5 rounded-xl mx-auto max-w-2xl mt-8">
                    <p className="text-xs text-gray-400 italic">
                        Basado en "The Book of Occasional Services 2003".<br />
                        Los textos completos estarán disponibles próximamente.
                    </p>
                </div>
            </div>
        </main>
    );
}
