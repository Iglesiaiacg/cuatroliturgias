import { useState } from 'react';
import StyledCard from '../Common/StyledCard';

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
                <p><strong>Padre nuestro que estás en el cielo, santificado sea tu Nombre; venga a nosotros tu reino; hágase tu voluntad en la tierra como en el cielo. Danos hoy nuestro pan de cada día. Perdona nuestras ofensas, como también nosotros perdonamos a los que nos ofenden. No nos dejes caer en tentación y líbranos del mal. Porque tuyo es el reino, el poder y la gloria, por los siglos de los siglos. Amén.</strong></p>

                <h3>Primera Lección: La Caída</h3>
                <p class="rubric">Génesis 3:1-15 (o selección)</p>
                <p>Pero la serpiente era astuta, más que todos los animales del campo que el Señor Dios había hecho; la cual dijo a la mujer: ¿Conque Dios os ha dicho: No comáis de todo árbol del huerto? Y la mujer respondió a la serpiente: Del fruto de los árboles del huerto podemos comer; pero del fruto del árbol que está en medio del huerto dijo Dios: No comeréis de él, ni le tocaréis, para que no muráis. Entonces la serpiente dijo a la mujer: No moriréis; sino que sabe Dios que el día que comáis de él, serán abiertos vuestros ojos, y seréis como Dios, sabiendo el bien y el mal. Y vio la mujer que el árbol era bueno para comer, y que era agradable a los ojos, y árbol codiciable para alcanzar la sabiduría; y tomó de su fruto, y comió; y dio también a su marido, el cual comió así como ella. Entonces fueron abiertos los ojos de ambos, y conocieron que estaban desnudos; entonces cosieron hojas de higuera, y se hicieron delantales. Y oyeron la voz del Señor Dios que se paseaba en el huerto, al aire del día; y el hombre y su mujer se escondieron de la presencia del Señor Dios entre los árboles del huerto. Mas el Señor Dios llamó al hombre, y le dijo: ¿Dónde estás tú? Y él respondió: Oí tu voz en el huerto, y tuve miedo, porque estaba desnudo; y me escondí. Y Dios le dijo: ¿Quién te enseñó que estabas desnudo? ¿Has comido del árbol de que yo te mandé no comieses? Y el hombre respondió: La mujer que me diste por compañera me dio del árbol, y yo comí. Entonces el Señor Dios dijo a la mujer: ¿Qué es lo que has hecho? Y dijo la mujer: La serpiente me engañó, y comí. Y el Señor Dios dijo a la serpiente: Por cuanto esto hiciste, maldita serás entre todas las bestias y entre todos los animales del campo; sobre tu pecho andarás, y polvo comerás todos los días de tu vida. Y pondré enemistad entre ti y la mujer, y entre tu simiente y la simiente suya; ésta te herirá en la cabeza, y tú le herirás en el calcañar.</p>
                <p class="rubric">Se canta un himno o villancico.</p>

                <h3>Segunda Lección: La Promesa a Abraham</h3>
                <p class="rubric">Génesis 22:15-18</p>
                <p>Y llamó el ángel del Señor a Abraham por segunda vez desde el cielo, y dijo: Por mí mismo he jurado, dice el Señor, que por cuanto has hecho esto, y no me has rehusado tu hijo, tu único hijo; de cierto te bendeciré, y multiplicaré tu descendencia como las estrellas del cielo y como la arena que está a la orilla del mar; y tu descendencia poseerá las puertas de sus enemigos. En tu simiente serán benditas todas las naciones de la tierra, por cuanto obedeciste a mi voz.</p>
                <p class="rubric">Se canta un himno o villancico.</p>

                <h3>Tercera Lección: La Profecía de un Salvador</h3>
                <p class="rubric">Isaías 9:2, 6-7</p>
                <p>El pueblo que andaba en tinieblas vio gran luz; los que moraban en tierra de sombra de muerte, luz resplandeció sobre ellos. Porque un niño nos es nacido, hijo nos es dado, y el principado sobre su hombro; y se llamará su nombre Admirable, Consejero, Dios Fuerte, Padre Eterno, Príncipe de Paz. Lo dilatado de su imperio y la paz no tendrán límite, sobre el trono de David y sobre su reino, disponiéndolo y confirmándolo en juicio y en justicia desde ahora y para siempre. El celo del Señor de los ejércitos hará esto.</p>
                <p class="rubric">Se canta un himno o villancico.</p>

                <h3>Cuarta Lección: La Vara de Isaí</h3>
                <p class="rubric">Isaías 11:1-9</p>
                <p>Saldrá una vara del tronco de Isaí, y un vástago retoñará de sus raíces. Y reposará sobre él el Espíritu del Señor; espíritu de sabiduría y de inteligencia, espíritu de consejo y de poder, espíritu de conocimiento y de temor del Señor. Y le hará entender diligente en el temor del Señor. No juzgará según la vista de sus ojos, ni argüirá por lo que oigan sus oídos; sino que juzgará con justicia a los pobres, y argüirá con equidad por los mansos de la tierra; y herirá la tierra con la vara de su boca, y con el espíritu de sus labios matará al impío. Y será la justicia cinto de sus lomos, y la fidelidad ceñidor de su cintura. Morará el lobo con el cordero, y el leopardo con el cabrito se acostará; el becerro y el león y la bestia doméstica andarán juntos, y un niño los pastoreará. La vaca y la osa pacerán, sus crías se echarán juntas; y el león como el buey comerá paja. Y el niño de pecho jugará sobre la cueva del áspid, y el recién destetado extenderá su mano sobre la caverna de la víbora. No harán mal ni dañarán en todo mi santo monte; porque la tierra será llena del conocimiento del Señor, como las aguas cubren el mar.</p>
                <p class="rubric">Se canta un himno o villancico.</p>

                <h3>Quinta Lección: El Anuncio a María</h3>
                <p class="rubric">Lucas 1:26-38</p>
                <p>Al sexto mes el ángel Gabriel fue enviado por Dios a una ciudad de Galilea, llamada Nazaret, a una virgen desposada con un varón que se llamaba José, de la casa de David; y el nombre de la virgen era María. Y entrando el ángel en donde ella estaba, dijo: ¡Salve, muy favorecida! El Señor es contigo; bendita tú entre las mujeres. Mas ella, cuando le vio, se turbó por sus palabras, y pensaba qué salutación sería esta. Entonces el ángel le dijo: María, no temas, porque has hallado gracia delante de Dios. Y ahora, concebirás en tu vientre, y darás a luz un hijo, y llamarás su nombre JESÚS. Este será grande, y será llamado Hijo del Altísimo; y el Señor Dios le dará el trono de David su padre; y reinará sobre la casa de Jacob para siempre, y su reino no tendrá fin. Entonces María dijo al ángel: ¿Cómo será esto? pues no conozco varón. Respondiendo el ángel, le dijo: El Espíritu Santo vendrá sobre ti, y el poder del Altísimo te cubrirá con su sombra; por lo cual también el Santo Ser que nacerá, será llamado Hijo de Dios. Y he aquí tu parienta Elisabet, ella también ha concebido hijo en su vejez; y este es el sexto mes para ella, la que llamaban estéril; porque nada hay imposible para Dios. Entonces María dijo: He aquí la sierva del Señor; hágase conmigo conforme a tu palabra. Y el ángel se fue de su presencia.</p>
                <p class="rubric">Se canta un himno o villancico (ej. "Ave María" o Magníficat).</p>

                <h3>Sexta Lección: El Nacimiento de Emmanuel</h3>
                <p class="rubric">Mateo 1:18-23</p>
                <p>El nacimiento de Jesucristo fue así: Estando desposada María su madre con José, antes que se juntasen, se halló que había concebido del Espíritu Santo. José su marido, como era justo, y no quería infamarla, quiso dejarla secretamente. Y pensando él en esto, he aquí un ángel del Señor le apareció en sueños y le dijo: José, hijo de David, no temas recibir a María tu mujer, porque lo que en ella es engendrado, del Espíritu Santo es. Y dará a luz un hijo, y llamarás su nombre JESÚS, porque él salvará a su pueblo de sus pecados. Todo esto aconteció para que se cumpliese lo dicho por el Señor por medio del profeta, cuando dijo: He aquí, una virgen concebirá y dará a luz un hijo, Y llamarás su nombre Emanuel, que traducido es: Dios con nosotros.</p>
                <p class="rubric">Se canta un himno o villancico.</p>

                <h3>Séptima Lección: La Palabra se hizo Carne</h3>
                <p class="rubric">San Juan 1:1-14</p>
                <p>En el principio era el Verbo, y el Verbo era con Dios, y el Verbo era Dios. Este era en el principio con Dios. Todas las cosas por él fueron hechas, y sin él nada de lo que ha sido hecho, fue hecho. En él estaba la vida, y la vida era la luz de los hombres. La luz en las tinieblas resplandece, y las tinieblas no prevalecieron contra ella. Hubo un hombre enviado de Dios, el cual se llamaba Juan. Este vino por testimonio, para que diese testimonio de la luz, a fin de que todos creyesen por él. No era él la luz, sino para que diese testimonio de la luz. Aquella luz verdadera, que alumbra a todo hombre, venía a este mundo. En el mundo estaba, y el mundo por él fue hecho; pero el mundo no le conoció. A lo suyo vino, y los suyos no le recibieron. Mas a todos los que le recibieron, a los que creen en su nombre, les dio potestad de ser hechos hijos de Dios; los cuales no son engendrados de sangre, ni de voluntad de carne, ni de voluntad de varón, sino de Dios. Y aquel Verbo fue hecho carne, y habitó entre nosotros (y vimos su gloria, gloria como del unigénito del Padre), lleno de gracia y de verdad.</p>
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
                <p class="rubric">Salmo 89:1-4, 19-29</p>
                <p>Las misericordias del Señor cantaré perpetuamente; *<br>
                <strong>de generación en generación haré notoria tu fidelidad con mi boca.</strong></p>
                <p>Porque dije: Para siempre será edificada misericordia; *<br>
                <strong>en los cielos mismos afirmarás tu verdad.</strong></p>
                <p>Hice pacto con mi escogido; *<br>
                <strong>juré a David mi siervo, diciendo:</strong></p>
                <p>Para siempre confirmaré tu descendencia, *<br>
                <strong>y edificaré tu trono por todas las generaciones.</strong></p>
                <p>Celebrarán los cielos tus maravillas, oh Señor, *<br>
                <strong>tu verdad también en la congregación de los santos.</strong></p>
                <p>Hallé a David mi siervo; *<br>
                <strong>lo ungí con mi santa unción.</strong></p>
                <p>Mi mano estará siempre con él, *<br>
                <strong>mi brazo también lo fortalecerá.</strong></p>
                <p>No lo sorprenderá el enemigo, *<br>
                <strong>ni hijo de iniquidad lo quebrantará;</strong></p>
                <p>Sino que quebrantaré delante de él a sus enemigos, *<br>
                <strong>y heriré a los que le aborrecen.</strong></p>
                <p>Mi verdad y mi misericordia estarán con él, *<br>
                <strong>y en mi nombre será exaltado su poder.</strong></p>
                <p>Pondré asimismo su mano sobre el mar, *<br>
                <strong>y sobre los ríos su diestra.</strong></p>
                <p>El me clamará: Mi padre eres tú, *<br>
                <strong>mi Dios, y la roca de mi salvación.</strong></p>
                <p>Yo también le pondré por primogénito, *<br>
                <strong>el más excelso de los reyes de la tierra.</strong></p>
                <p>Para siempre le conservaré mi misericordia, *<br>
                <strong>y mi pacto será firme con él.</strong></p>
                <p>Pondré su descendencia para siempre, *<br>
                <strong>y su trono como los días de los cielos.</strong></p>

                <h3>Lección: La Genealogía de Cristo</h3>
                <p class="rubric">Mateo 1:1-17</p>
                <p>Libro de la genealogía de Jesucristo, hijo de David, hijo de Abraham. Abraham engendró a Isaac, Isaac a Jacob, y Jacob a Judá y a sus hermanos. Judá engendró de Tamar a Fares y a Zara, Fares a Esrom, y Esrom a Aram. Aram engendró a Aminadab, Aminadab a Naasón, y Naasón a Salmón. Salmón engendró de Rahab a Booz, Booz engendró de Rut a Obed, y Obed a Isaí. Isaí engendró al rey David, y el rey David engendró a Salomón de la que fue mujer de Urías. Salomón engendró a Roboam, Roboam a Abías, y Abías a Asa. Asa engendró a Josafat, Josafat a Joram, y Joram a Uzías. Uzías engendró a Jotam, Jotam a Acaz, y Acaz a Ezequías. Ezequías engendró a Manasés, Manasés a Amón, y Amón a Josías. Josías engendró a Jeconías y a sus hermanos, en el tiempo de la deportación a Babilonia. Después de la deportación a Babilonia, Jeconías engendró a Salatiel, y Salatiel a Zorobabel. Zorobabel engendró a Abiud, Abiud a Eliaquim, y Eliaquim a Azor. Azor engendró a Sadoc, Sadoc a Aquim, y Aquim a Eliud. Eliud engendró a Eleazar, Eleazar a Matán, Matán a Jacob; y Jacob engendró a José, marido de María, de la cual nació Jesús, llamado el Cristo.</p>
                <p>De manera que todas las generaciones desde Abraham hasta David son catorce; desde David hasta la deportación a Babilonia, catorce; y desde la deportación a Babilonia hasta Cristo, catorce.</p>

                <h3>Te Deum Laudamus</h3>
                <p class="rubric">Se canta o dice el Te Deum.</p>
                <p>A ti, oh Dios, te alabamos; a ti, Señor, te reconocemos.<br>
                A ti, eterno Padre, te venera toda la tierra.<br>
                A ti todos los ángeles, a ti los cielos y todas las potestades.<br>
                A ti los querubines y serafines te cantan con voz incesante:<br>
                Santo, Santo, Santo, Señor Dios de los Ejércitos;<br>
                Llenos están los cielos y la tierra de la majestad de tu gloria.</p>
                <p>A ti te alaba el glorioso coro de los apóstoles.<br>
                A ti la multitud admirable de los profetas.<br>
                A ti el blanco ejército de los mártires.<br>
                A ti la santa Iglesia por toda la tierra te confiesa:<br>
                Padre de inmensa majestad;<br>
                Adorable, verdadero y único Hijo;<br>
                También al Espíritu Santo, el Consolador.</p>
                <p>Tú eres el Rey de la gloria, oh Cristo.<br>
                Tú eres el Hijo eterno del Padre.<br>
                Tú, para liberar al hombre, no te horrorizaste del vientre de la Virgen.<br>
                Tú, habiendo vencido el aguijón de la muerte, abriste el reino de los cielos a los creyentes.<br>
                Tú estás sentado a la diestra de Dios en la gloria del Padre.<br>
                Creemos que habrás de venir como Juez.</p>
                <p>Te rogamos, pues, que socorras a tus siervos, a quienes redimiste con tu preciosa sangre.<br>
                Haz que en la gloria eterna seamos contados con tus santos.</p>
                <p>Salva a tu pueblo, oh Señor, y bendice tu heredad.<br>
                Y pastoréalos y ensálzalos para siempre.<br>
                Día tras día te bendecimos;<br>
                Y alabamos tu Nombre por siempre y para siempre.</p>
                <p>Dígnate, oh Señor, en este día guardarnos sin pecado.<br>
                Ten piedad de nosotros, oh Señor, ten piedad de nosotros.<br>
                Sea tu misericordia, oh Señor, sobre nosotros, como en ti hemos esperado.<br>
                En ti, oh Señor, he confiado; no sea yo confundido jamás.</p>

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
                <p class="rubric">Lucas 2:1-20</p>
                <p>Aconteció en aquellos días, que se promulgó un edicto de parte de Augusto César, que todo el mundo fuese empadronado. Este primer censo se hizo siendo Cirenio gobernador de Siria. E iban todos para ser empadronados, cada uno a su ciudad. Y José subió de Galilea, de la ciudad de Nazaret, a Judea, a la ciudad de David, que se llama Belén, por cuanto era de la casa y familia de David; para ser empadronado con María su mujer, desposada con él, la cual estaba encinta. Y aconteció que estando ellos allí, se cumplieron los días de su alumbramiento. Y dio a luz a su hijo primogénito, y lo envolvió en pañales, y lo acostó en un pesebre, porque no había lugar para ellos en el mesón.</p>
                <p>Había pastores en la misma región, que velaban y guardaban las vigilias de la noche sobre su rebaño. Y he aquí, se les presentó un ángel del Señor, y la gloria del Señor los rodeó de resplandor; y tuvieron gran temor. Pero el ángel les dijo: No temáis; porque he aquí os doy nuevas de gran gozo, que será para todo el pueblo: que os ha nacido hoy, en la ciudad de David, un Salvador, que es CRISTO el Señor. Esto os servirá de señal: Hallaréis al niño envuelto en pañales, acostado en un pesebre. Y repentinamente apareció con el ángel una multitud de las huestes celestiales, que alababan a Dios, y decían: ¡Gloria a Dios en las alturas, Y en la tierra paz, buena voluntad para con los hombres!</p>
                <p>Sucedió que cuando los ángeles se fueron de ellos al cielo, los pastores se dijeron unos a otros: Pasemos, pues, hasta Belén, y veamos esto que ha sucedido, y que el Señor nos ha manifestado. Vinieron, pues, apresuradamente, y hallaron a María y a José, y al niño acostado en el pesebre. Y al verlo, dieron a conocer lo que se les había dicho acerca del niño. Y todos los que oyeron, se maravillaron de lo que los pastores les decían. Pero María guardaba todas estas cosas, meditándolas en su corazón. Y volvieron los pastores glorificando y alabando a Dios por todas las cosas que habían oído y visto, como se les había dicho.</p>

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
                <p>Oremos por la paz del mundo; por la unidad y benevolencia dentro de la Iglesia que él vino a edificar; y por los miembros de esta congregación.</p>
                <p>Y porque esto agradaría a Aquel que es el Señor de vivos y muertos, recordemos en su nombre a los pobres y desamparados, los hambrientos y los oprimidos; los enfermos y los que lloran; los solitarios y los que no son amados; los ancianos y los niños pequeños; y a todos los que no conocen al Señor Jesús, o que no le aman, o que por el pecado le han entristecido el corazón.</p>
                <p>Por último, recordemos ante Dios a todos los que se regocijan con nosotros, pero en otra orilla y en una luz mayor, esa multitud que nadie puede contar, cuya esperanza estaba en el Verbo hecho carne, y con quienes por siempre jamás somos uno en él.</p>
                <p>Estas oraciones y alabanzas las ofrecemos humildemente al trono de la gracia celestial, en las palabras que Cristo mismo nos enseñó:</p>
                <p><strong>Padre nuestro...</strong></p>

                <h3>Primera Lección</h3>
                <p class="rubric">Génesis 3:8-15</p>
                <p>Y oyeron la voz del Señor Dios que se paseaba en el huerto, al aire del día; y el hombre y su mujer se escondieron de la presencia del Señor Dios entre los árboles del huerto. Mas el Señor Dios llamó al hombre, y le dijo: ¿Dónde estás tú? Y él respondió: Oí tu voz en el huerto, y tuve miedo, porque estaba desnudo; y me escondí. Y Dios le dijo: ¿Quién te enseñó que estabas desnudo? ¿Has comido del árbol de que yo te mandé no comieses? Y el hombre respondió: La mujer que me diste por compañera me dio del árbol, y yo comí. Entonces el Señor Dios dijo a la mujer: ¿Qué es lo que has hecho? Y dijo la mujer: La serpiente me engañó, y comí. Y el Señor Dios dijo a la serpiente: Por cuanto esto hiciste, maldita serás entre todas las bestias y entre todos los animales del campo; sobre tu pecho andarás, y polvo comerás todos los días de tu vida. Y pondré enemistad entre ti y la mujer, y entre tu simiente y la simiente suya; ésta te herirá en la cabeza, y tú le herirás en el calcañar.</p>
                <p class="rubric">Se canta un villancico.</p>

                <h3>Segunda Lección</h3>
                <p class="rubric">Génesis 22:15-18</p>
                <p>Y llamó el ángel del Señor a Abraham por segunda vez desde el cielo, y dijo: Por mí mismo he jurado, dice el Señor, que por cuanto has hecho esto, y no me has rehusado tu hijo, tu único hijo; de cierto te bendeciré, y multiplicaré tu descendencia como las estrellas del cielo y como la arena que está a la orilla del mar; y tu descendencia poseerá las puertas de sus enemigos. En tu simiente serán benditas todas las naciones de la tierra, por cuanto obedeciste a mi voz.</p>
                <p class="rubric">Se canta un villancico.</p>

                <h3>Tercera Lección</h3>
                <p class="rubric">Isaías 9:2, 6-7</p>
                <p>El pueblo que andaba en tinieblas vio gran luz; los que moraban en tierra de sombra de muerte, luz resplandeció sobre ellos. Porque un niño nos es nacido, hijo nos es dado, y el principado sobre su hombro; y se llamará su nombre Admirable, Consejero, Dios Fuerte, Padre Eterno, Príncipe de Paz. Lo dilatado de su imperio y la paz no tendrán límite, sobre el trono de David y sobre su reino, disponiéndolo y confirmándolo en juicio y en justicia desde ahora y para siempre. El celo del Señor de los ejércitos hará esto.</p>
                <p class="rubric">Se canta un villancico.</p>

                <h3>Cuarta Lección</h3>
                <p class="rubric">Miqueas 5:2-4</p>
                <p>Pero tú, Belén Efrata, pequeña para estar entre las familias de Judá, de ti me saldrá el que será Señor en Israel; y sus salidas son desde el principio, desde los días de la eternidad. Pero los dejará hasta el tiempo que dé a luz la que ha de dar a luz; y el resto de sus hermanos se volverá con los hijos de Israel. Y él estará, y apacentará con poder del Señor, con grandeza del nombre del Señor su Dios; y morarán seguros, porque ahora será engrandecido hasta los fines de la tierra.</p>
                <p class="rubric">Se canta un villancico (ej. "Oh, pueblecito de Belén").</p>

                <h3>Quinta Lección</h3>
                <p class="rubric">Lucas 1:26-38</p>
                <p>Al sexto mes el ángel Gabriel fue enviado por Dios a una ciudad de Galilea, llamada Nazaret, a una virgen desposada con un varón que se llamaba José, de la casa de David; y el nombre de la virgen era María. Y entrando el ángel en donde ella estaba, dijo: ¡Salve, muy favorecida! El Señor es contigo; bendita tú entre las mujeres. Mas ella, cuando le vio, se turbó por sus palabras, y pensaba qué salutación sería esta. Entonces el ángel le dijo: María, no temas, porque has hallado gracia delante de Dios. Y ahora, concebirás en tu vientre, y darás a luz un hijo, y llamarás su nombre JESÚS. Este será grande, y será llamado Hijo del Altísimo; y el Señor Dios le dará el trono de David su padre; y reinará sobre la casa de Jacob para siempre, y su reino no tendrá fin. Entonces María dijo al ángel: ¿Cómo será esto? pues no conozco varón. Respondiendo el ángel, le dijo: El Espíritu Santo vendrá sobre ti, y el poder del Altísimo te cubrirá con su sombra; por lo cual también el Santo Ser que nacerá, será llamado Hijo de Dios. Y he aquí tu parienta Elisabet, ella también ha concebido hijo en su vejez; y este es el sexto mes para ella, la que llamaban estéril; porque nada hay imposible para Dios. Entonces María dijo: He aquí la sierva del Señor; hágase conmigo conforme a tu palabra. Y el ángel se fue de su presencia.</p>
                <p class="rubric">Se canta un villancico.</p>

                <h3>Sexta Lección</h3>
                <p class="rubric">Lucas 2:1-7</p>
                <p>Aconteció en aquellos días, que se promulgó un edicto de parte de Augusto César, que todo el mundo fuese empadronado. Este primer censo se hizo siendo Cirenio gobernador de Siria. E iban todos para ser empadronados, cada uno a su ciudad. Y José subió de Galilea, de la ciudad de Nazaret, a Judea, a la ciudad de David, que se llama Belén, por cuanto era de la casa y familia de David; para ser empadronado con María su mujer, desposada con él, la cual estaba encinta. Y aconteció que estando ellos allí, se cumplieron los días de su alumbramiento. Y dio a luz a su hijo primogénito, y lo envolvió en pañales, y lo acostó en un pesebre, porque no había lugar para ellos en el mesón.</p>
                <p class="rubric">Se canta un villancico (ej. "Noche de Paz").</p>

                <h3>Séptima Lección</h3>
                <p class="rubric">Lucas 2:8-16</p>
                <p>Había pastores en la misma región, que velaban y guardaban las vigilias de la noche sobre su rebaño. Y he aquí, se les presentó un ángel del Señor, y la gloria del Señor los rodeó de resplandor; y tuvieron gran temor. Pero el ángel les dijo: No temáis; porque he aquí os doy nuevas de gran gozo, que será para todo el pueblo: que os ha nacido hoy, en la ciudad de David, un Salvador, que es CRISTO el Señor. Esto os servirá de señal: Hallaréis al niño envuelto en pañales, acostado en un pesebre. Y repentinamente apareció con el ángel una multitud de las huestes celestiales, que alababan a Dios, y decían: ¡Gloria a Dios en las alturas, Y en la tierra paz, buena voluntad para con los hombres! Sucedió que cuando los ángeles se fueron de ellos al cielo, los pastores se dijeron unos a otros: Pasemos, pues, hasta Belén, y veamos esto que ha sucedido, y que el Señor nos ha manifestado. Vinieron, pues, apresuradamente, y hallaron a María y a José, y al niño acostado en el pesebre.</p>
                <p class="rubric">Se canta un villancico.</p>

                <h3>Octava Lección</h3>
                <p class="rubric">Mateo 2:1-12</p>
                <p>Cuando Jesús nació en Belén de Judea en días del rey Herodes, vinieron del oriente a Jerusalén unos magos, diciendo: ¿Dónde está el rey de los judíos, que ha nacido? Porque su estrella hemos visto en el oriente, y venimos a adorarle. Oyendo esto, el rey Herodes se turbó, y toda Jerusalén con él. Y convocados todos los principales sacerdotes, y los escribas del pueblo, les preguntó dónde había de nacer el Cristo. Ellos le dijeron: En Belén de Judea; porque así está escrito por el profeta: Y tú, Belén, de la tierra de Judá, No eres la más pequeña entre los príncipes de Judá; Porque de ti saldrá un guiador, Que apacentará a mi pueblo Israel. Entonces Herodes, llamando en secreto a los magos, indagó de ellos diligentemente el tiempo de la aparición de la estrella; y enviándolos a Belén, dijo: Id allá y averiguad con diligencia acerca del niño; y cuando le halléis, hacérmelo saber, para que yo también vaya y le adore. Ellos, habiendo oído al rey, se fueron; y he aquí la estrella que habían visto en el oriente iba delante de ellos, hasta que llegando, se detuvo sobre donde estaba el niño. Y al ver la estrella, se regocijaron con muy grande gozo. Y al entrar en la casa, vieron al niño con su madre María, y postrándose, lo adoraron; y abriendo sus tesoros, le ofrecieron presentes: oro, incienso y mirra. Pero siendo avisados por revelación en sueños que no volviesen a Herodes, regresaron a su tierra por otro camino.</p>
                <p class="rubric">Se canta un villancico.</p>

                <h3>Novena Lección</h3>
                <p class="rubric">Juan 1:1-14</p>
                <p>En el principio era el Verbo, y el Verbo era con Dios, y el Verbo era Dios. Este era en el principio con Dios. Todas las cosas por él fueron hechas, y sin él nada de lo que ha sido hecho, fue hecho. En él estaba la vida, y la vida era la luz de los hombres. La luz en las tinieblas resplandece, y las tinieblas no prevalecieron contra ella. Hubo un hombre enviado de Dios, el cual se llamaba Juan. Este vino por testimonio, para que diese testimonio de la luz, a fin de que todos creyesen por él. No era él la luz, sino para que diese testimonio de la luz. Aquella luz verdadera, que alumbra a todo hombre, venía a este mundo. En el mundo estaba, y el mundo por él fue hecho; pero el mundo no le conoció. A lo suyo vino, y los suyos no le recibieron. Mas a todos los que le recibieron, a los que creen en su nombre, les dio potestad de ser hechos hijos de Dios; los cuales no son engendrados de sangre, ni de voluntad de carne, ni de voluntad de varón, sino de Dios. Y aquel Verbo fue hecho carne, y habitó entre nosotros (y vimos su gloria, gloria como del unigénito del Padre), lleno de gracia y de verdad.</p>
                <p class="rubric">Se canta un villancico solemne (ej. "Adeste Fideles").</p>

                <h3>Colecta y Bendición</h3>
                <p>Oremos.</p>
                <p>Oh Dios, que haces que nos alegremos con la celebración anual del nacimiento de tu único Hijo Jesucristo; concédenos que, al recibirlo con gozo como nuestro Redentor, podamos con segura confianza contemplarlo cuando venga para ser nuestro Juez; quien vive y reina contigo y el Espíritu Santo, un solo Dios, ahora y por siempre.<br>
                <strong>Amén.</strong></p>
                <p>La bendición de Dios Todopoderoso, Padre, Hijo y Espíritu Santo, sea con vosotros y more con vosotros eternamente.<br>
                <strong>Amén.</strong></p>
            </div>
        `,
        "Víspera de Año Nuevo": `
            <div class="liturgy-content">
                <h1>Víspera de Año Nuevo</h1>
                <p class="rubric">Este servicio se celebra en la noche del 31 de diciembre. Puede usarse como vigilia preparatoria para la fiesta del Santo Nombre (1 de enero).</p>

                <h3>Salmo de Apertura: Salmo 90 (Selección)</h3>
                <p>Señor, tú nos has sido refugio *<br>
                <strong>de generación en generación.</strong></p>
                <p>Antes que naciesen los montes y formases la tierra y el mundo, *<br>
                <strong>desde el siglo y hasta el siglo, tú eres Dios.</strong></p>
                <p>Vuelves al hombre hasta ser quebrantado, *<br>
                <strong>y dices: Convertíos, hijos de los hombres.</strong></p>
                <p>Porque mil años delante de tus ojos son como el día de ayer, que pasó, *<br>
                <strong>y como una de las vigilias de la noche.</strong></p>
                <p>Enséñanos de tal modo a contar nuestros días, *<br>
                <strong>que traigamos al corazón sabiduría.</strong></p>
                <p>Vuelve, oh Señor; ¿hasta cuándo? *<br>
                <strong>Y arrepiéntete para con tus siervos.</strong></p>
                <p>De mañana sácianos de tu misericordia, *<br>
                <strong>y cantaremos y nos alegraremos todos nuestros días.</strong></p>

                <h3>Lección Bíblica</h3>
                <p class="rubric">Eclesiastés 3:1-15</p>
                <p>Todo tiene su tiempo, y todo lo que se quiere debajo del cielo tiene su hora. Tiempo de nacer, y tiempo de morir; tiempo de plantar, y tiempo de arrancar lo plantado; tiempo de matar, y tiempo de curar; tiempo de destruir, y tiempo de edificar; tiempo de llorar, y tiempo de reír; tiempo de endechar, y tiempo de bailar; tiempo de esparcir piedras, y tiempo de juntar piedras; tiempo de abrazar, y tiempo de abstenerse de abrazar; tiempo de buscar, y tiempo de perder; tiempo de guardar, y tiempo de desechar; tiempo de romper, y tiempo de coser; tiempo de callar, y tiempo de hablar; tiempo de amar, y tiempo de aborrecer; tiempo de guerra, y tiempo de paz. ¿Qué provecho tiene el que trabaja, de aquello en que se afana? Yo he visto el trabajo que Dios ha dado a los hijos de los hombres para que se ocupen en él. Todo lo hizo hermoso en su tiempo; y ha puesto eternidad en el corazón de ellos, sin que alcance el hombre a entender la obra que ha hecho Dios desde el principio hasta el fin. Yo he conocido que no hay para ellos cosa mejor que alegrarse, y hacer bien en su vida; y también que es don de Dios que todo hombre coma y beba, y goce el bien de toda su labor. He entendido que todo lo que Dios hace será perpetuo; sobre aquello no se añadirá, ni de ello se disminuirá; y lo hace Dios, para que delante de él teman los hombres. Aquello que fue, ya es; y lo que ha de ser, fue ya; y Dios restaura lo que pasó.</p>
                <p class="rubric">Se canta un himno apropiado (ej. "Dios, nuestro apoyo en los pasados siglos").</p>

                <h3>Oración por el Nuevo Año</h3>
                <p>Oremos.</p>
                <p>Dios inmortal, Rey de los siglos, te damos gracias por habernos traído a salvo hasta el final de este año. Te pedimos perdón por nuestras faltas y pecados, por el tiempo perdido y las oportunidades desaprovechadas. Concédenos comenzar el nuevo año con corazones renovados, confiando en tu misericordia y dedicados a tu servicio. Que tu Espíritu Santo nos guíe en cada día que nos concedas vivir, para que podamos emplearlos para tu gloria y el bien de nuestro prójimo. Por Jesucristo nuestro Señor, que vive y reina contigo y el Espíritu Santo, un solo Dios, por los siglos de los siglos.<br>
                <strong>Amén.</strong></p>

                <h3>Bendición</h3>
                <p>El Señor los bendiga y los guarde. El Señor haga resplandecer su rostro sobre ustedes, y tenga de ustedes misericordia. El Señor alce sobre ustedes su rostro, y les conceda la paz. Y la bendición de Dios Todopoderoso, Padre, Hijo y Espíritu Santo, sea con ustedes y more con ustedes eternamente.<br>
                <strong>Amén.</strong></p>
            </div>
        `,
        "Bendición de Hogares (Epifanía)": `
            <div class="liturgy-content">
                <h1>Bendición de Hogares (Epifanía)</h1>
                <p class="rubric">Esta bendición tradicional se realiza el día de la Epifanía (6 de enero) o en su octava. Se suele marcar el dintel de la puerta con tiza bendecida.</p>

                <h3>En la Entrada</h3>
                <p>Paz sea a esta casa y a todos los que habitan en ella.</p>
                <p><strong>Y con tu espíritu.</strong></p>
                
                <h3>Antífona</h3>
                <p>Del oriente vinieron los Magos a Belén para adorar al Señor; y abriendo sus tesoros, ofrecieron presentes preciosos: oro para el gran Rey, incienso para el verdadero Dios, y mirra para su sepultura. Aleluya.</p>

                <h3>Salmo 121 (Selección)</h3>
                <p>Alzaré mis ojos a los montes; *<br>
                <strong>¿de dónde vendrá mi socorro?</strong></p>
                <p>Mi socorro viene del Señor, *<br>
                <strong>que hizo los cielos y la tierra.</strong></p>
                <p>El Señor es tu guardador; *<br>
                <strong>el Señor es tu sombra a tu mano derecha.</strong></p>
                <p>El Señor te guardará de todo mal; *<br>
                <strong>él guardará tu alma.</strong></p>
                <p>El Señor guardará tu salida y tu entrada *<br>
                <strong>desde ahora y para siempre.</strong></p>
                
                <h3>La Inscripción con Tiza</h3>
                <p class="rubric">El oficiante inscribe el dintel de la puerta con la siguiente fórmula (C+M+B: Christus Mansionem Benedicat / Caspar, Melchior, Balthasar):</p>
                <p class="text-center font-bold text-xl my-4">20 + C + M + B + [Año Actual]</p>
                <p class="rubric">Mientras escribe, dice:</p>
                <p>Los tres Reyes Magos, Gaspar, Melchor y Baltasar, siguieron la estrella del Hijo de Dios que se hizo hombre, dos mil [siglos] años atrás. Que Cristo bendiga esta casa y permanezca con nosotros durante todo el nuevo año.</p>

                <h3>Oración de Bendición</h3>
                <p>Oremos.</p>
                <p>Oh Dios, que por la guía de una estrella manifestaste a tu Unigénito Hijo a los gentiles: Bendice esta casa y a todos los que en ella habitan. Llénalos de la luz de Cristo, para que su amor se manifieste en sus vidas y sus hogares sean un refugio de paz y de acogida. Que como los Magos te ofrecieron sus dones, nosotros te ofrezcamos el oro de nuestra obediencia, el incienso de nuestra oración y la mirra de nuestro sacrificio. Por Jesucristo nuestro Señor, que vive y reina contigo y el Espíritu Santo, un solo Dios, por los siglos de los siglos.<br>
                <strong>Amén.</strong></p>
            </div>
        `,
        "Vigilia Bautismo del Señor": `
            <div class="liturgy-content">
                <h1>Vigilia Bautismo del Señor</h1>
                <p class="rubric">Esta vigilia prepara a la congregación para la renovación de sus votos bautismales, celebrando el Bautismo de Jesús. Puede incluir la bendición del agua.</p>

                <h3>Salmo 29</h3>
                <p>Tributad al Señor, oh hijos de los poderosos, *<br>
                <strong>tributad al Señor la gloria y la fortaleza.</strong></p>
                <p>Tributad al Señor la gloria debida a su Nombre; *<br>
                <strong>adorad al Señor en la hermosura de la santidad.</strong></p>
                <p>Voz del Señor sobre las aguas; truena el Dios de gloria, *<br>
                <strong>el Señor sobre las muchas aguas.</strong></p>
                <p>Voz del Señor con potencia; *<br>
                <strong>voz del Señor con gloria.</strong></p>
                <p>Voz del Señor que quebranta los cedros; *<br>
                <strong>quebrantó el Señor los cedros del Líbano.</strong></p>
                <p>Los hizo saltar como becerros; *<br>
                <strong>al Líbano y al Sirión como hijos de búfalos.</strong></p>
                <p>Voz del Señor que derrama llamas de fuego; *<br>
                <strong>voz del Señor que hace temblar el desierto; hace temblar el Señor el desierto de Cades.</strong></p>
                <p>Voz del Señor que desgaja las encinas, y desnuda los bosques; *<br>
                <strong>en su templo todo proclama su gloria.</strong></p>
                <p>El Señor preside en el diluvio, *<br>
                <strong>y se sienta el Señor como rey para siempre.</strong></p>
                <p>El Señor dará fortaleza a su pueblo; *<br>
                <strong>el Señor bendecirá a su pueblo con paz.</strong></p>

                <h3>Lectura del Santo Evangelio</h3>
                <p class="rubric">Marcos 1:1-11</p>
                <p>Principio del evangelio de Jesucristo, Hijo de Dios. Como está escrito en Isaías el profeta: He aquí yo envío mi mensajero delante de tu faz, el cual preparará tu camino delante de ti. Voz del que clama en el desierto: Preparad el camino del Señor; enderezad sus sendas. Bautizaba Juan en el desierto, y predicaba el bautismo de arrepentimiento para perdón de pecados. Y salían a él toda la provincia de Judea, y todos los de Jerusalén; y eran bautizados por él en el río Jordán, confesando sus pecados. Y Juan estaba vestido de pelo de camello, y tenía un cinto de cuero alrededor de sus lomos; y comía langostas y miel silvestre. Y predicaba, diciendo: Viene tras mí el que es más poderoso que yo, a quien no soy digno de desatar encorvado la correa de su calzado. Yo a la verdad os he bautizado con agua; pero él os bautizará con Espíritu Santo. Aconteció en aquellos días, que Jesús vino de Nazaret de Galilea, y fue bautizado por Juan en el Jordán. Y luego, cuando subía del agua, vio abrirse los cielos, y al Espíritu como paloma que descendía sobre él. Y vino una voz de los cielos que decía: Tú eres mi Hijo amado; en ti tengo complacencia.</p>

                <h3>Renovación de Votos Bautismales</h3>
                <p>Celebrante: ¿Renunciáis a Satanás y a todas sus obras espirituales de maldad?</p>
                <p><strong>Pueblo: Renuncio a ellos.</strong></p>
                <p>Celebrante: ¿Renunciáis a los poderes malignos de este mundo que corrompen y destruyen las criaturas de Dios?</p>
                <p><strong>Pueblo: Renuncio a ellos.</strong></p>
                <p>Celebrante: ¿Renunciáis a todos los deseos pecaminosos que os apartan del amor de Dios?</p>
                <p><strong>Pueblo: Renuncio a ellos.</strong></p>
                <p>Celebrante: ¿Os entregáis a Jesucristo como vuestro Señor y Salvador?</p>
                <p><strong>Pueblo: Así lo hago.</strong></p>
                <p>Celebrante: ¿Prometéis seguirle y obedecerle como vuestro Señor?</p>
                <p><strong>Pueblo: Así lo hago.</strong></p>

                <h3>Bendición del Agua y Aspersión</h3>
                <p class="rubric">El Celebrante puede bendecir agua y rociar a la congregación en recuerdo de su bautismo.</p>
                <p>El Dios todopoderoso, que por el bautismo de Jesucristo en el río Jordán santificó el agua, nos renueve por su Espíritu Santo, para que permanezcamos fieles a nuestra alianza con él. Por el mismo Jesucristo nuestro Señor.<br>
                <strong>Amén.</strong></p>
            </div>
        `,
        "Procesión de la Candelaria": `
            <div class="liturgy-content">
                <h1>Procesión de la Candelaria</h1>
                <p class="rubric">Esta procesión y bendición de velas se celebra el 2 de febrero (Presentación del Señor).</p>

                <h3>Bendición de las Velas</h3>
                <p>La luz y la paz de Jesucristo sean con ustedes.</p>
                <p><strong>Y con tu espíritu.</strong></p>
                <p>Oremos.</p>
                <p>Oh Dios eterno, que creaste todas las cosas de la nada, y por tu mandato hiciste que por el trabajo de las abejas esta cera se produjera a la perfección; y que en este día cumpliste la petición del justo Simeón: Te rogamos humildemente que por la invocación de tu santo Nombre, y por la intercesión de la bienaventurada siempre Virgen María, te dignes bendecir y santificar estas velas para el uso de los hombres y la salud de sus cuerpos y almas. Escucha, Señor misericordioso, desde tu santo cielo, las voces de este tu pueblo que desea llevarlas en sus manos alabándote y cantando himnos; y muéstrate propicio a todos los que te invocan, a los que has redimido con la preciosa sangre de tu Hijo.<br>
                <strong>Amén.</strong></p>

                <h3>Lumen Ad Revelationem</h3>
                <p class="rubric">Antífona durante la procesión:</p>
                <p><strong>Luz para revelación a los gentiles, y gloria de tu pueblo Israel.</strong></p>
                <p>Señor, ahora despedirás a tu siervo en paz, conforme a tu palabra. Porque han visto mis ojos tu salvación.</p>
                <p><strong>Luz para revelación a los gentiles, y gloria de tu pueblo Israel.</strong></p>
                <p>La cual has preparado en presencia de todos los pueblos.</p>
                <p><strong>Luz para revelación a los gentiles, y gloria de tu pueblo Israel.</strong></p>
                <p>Gloria al Padre, y al Hijo, y al Espíritu Santo. Como era en el principio, es ahora y siempre, por los siglos de los siglos. Amén.</p>
                <p><strong>Luz para revelación a los gentiles, y gloria de tu pueblo Israel.</strong></p>

                <h3>Colecta</h3>
                <p>Dios todopoderoso y eterno, humildemente te rogamos que, así como tu Hijo unigénito fue presentado este día en el templo en la sustancia de nuestra carne, así seamos nosotros presentados ante ti con corazones puros y limpios; por Jesucristo nuestro Señor.<br>
                <strong>Amén.</strong></p>
            </div>
        `,
        "El Vía Crucis": `
            <div class="liturgy-content">
                <h1>El Vía Crucis</h1>
                <p class="rubric">Meditación sobre la Pasión de Nuestro Señor.</p>

                <h3>Oración Preparatoria</h3>
                <p>Ayúdanos, Señor, a acompañarte en este camino de la cruz, para que, meditando tu pasión y muerte, aprendamos a cargar nuestra cruz cada día y a seguirte con amor.</p>

                <h3>I. Jesús es condenado a muerte</h3>
                <p>Te adoramos, oh Cristo, y te bendecimos.</p>
                <p><strong>Que por tu santa cruz redimiste al mundo.</strong></p>
                <p>Pilato les soltó a Barrabás; y a Jesús, después de azotarle, le entregó para ser crucificado.</p>
                <p>Señor Jesús, aunque eras inocente, aceptaste la condena por nosotros. concédenos la gracia de aceptar las injusticias de la vida con paciencia y amor.</p>

                <h3>II. Jesús carga con la cruz</h3>
                <p>Te adoramos, oh Cristo, y te bendecimos.</p>
                <p><strong>Que por tu santa cruz redimiste al mundo.</strong></p>
                <p>Y él, cargando su cruz, salió al lugar llamado de la Calavera, y en hebreo, Gólgota.</p>
                <p>Señor, ayúdanos a llevar nuestra cruz diaria y a seguir tus pasos con fidelidad.</p>

                <h3>III. Jesús cae por primera vez</h3>
                <p>Te adoramos, oh Cristo, y te bendecimos.</p>
                <p><strong>Que por tu santa cruz redimiste al mundo.</strong></p>
                <p>Ciertamente llevó él nuestras enfermedades, y sufrió nuestros dolores.</p>
                <p>Señor, levántanos cuando caemos y danos fuerza para continuar el camino.</p>

                <h3>IV. Jesús encuentra a su Madre</h3>
                <p>Te adoramos, oh Cristo, y te bendecimos.</p>
                <p><strong>Que por tu santa cruz redimiste al mundo.</strong></p>
                <p>Una espada traspasará tu misma alma (dijo Simeón a María), para que sean revelados los pensamientos de muchos corazones.</p>
                <p>Señor, por intercesión de tu Madre, consuela a los que sufren y a los afligidos.</p>

                <h3>V. El Cirineo ayuda a Jesús</h3>
                <p>Te adoramos, oh Cristo, y te bendecimos.</p>
                <p><strong>Que por tu santa cruz redimiste al mundo.</strong></p>
                <p>Y obligaron a uno que pasaba, Simón de Cirene, a que llevase la cruz.</p>
                <p>Señor, haz que seamos solidarios con los que sufren y les ayudemos a llevar sus cargas.</p>

                <h3>VI. La Verónica enjuga el rostro de Jesús</h3>
                <p>Te adoramos, oh Cristo, y te bendecimos.</p>
                <p><strong>Que por tu santa cruz redimiste al mundo.</strong></p>
                <p>Como raíces en tierra seca, no hay parecer en él, ni hermosura; le veremos, mas sin atractivo para que le deseemos.</p>
                <p>Señor, imprime tu rostro en nuestros corazones, para que te reconozcamos en nuestros hermanos.</p>

                <h3>VII. Jesús cae por segunda vez</h3>
                <p>Te adoramos, oh Cristo, y te bendecimos.</p>
                <p><strong>Que por tu santa cruz redimiste al mundo.</strong></p>
                <p>Yo soy gusano, y no hombre; oprobio de los hombres, y despreciado del pueblo.</p>
                <p>Señor, perdónanos por nuestras reincidencias en el pecado y fortalécenos en la lucha.</p>

                <h3>VIII. Jesús consuela a las mujeres de Jerusalén</h3>
                <p>Te adoramos, oh Cristo, y te bendecimos.</p>
                <p><strong>Que por tu santa cruz redimiste al mundo.</strong></p>
                <p>Hijas de Jerusalén, no lloréis por mí, sino llorad por vosotras mismas y por vuestros hijos.</p>
                <p>Señor, danos un verdadero arrepentimiento y lágrimas de contrición por nuestros pecados.</p>

                <h3>IX. Jesús cae por tercera vez</h3>
                <p>Te adoramos, oh Cristo, y te bendecimos.</p>
                <p><strong>Que por tu santa cruz redimiste al mundo.</strong></p>
                <p>Angustiado él, y afligido, no abrió su boca; como cordero fue llevado al matadero.</p>
                <p>Señor, líbranos del desánimo y la desesperación, y mantennos firmes en la esperanza.</p>

                <h3>X. Jesús es despojado de sus vestiduras</h3>
                <p>Te adoramos, oh Cristo, y te bendecimos.</p>
                <p><strong>Que por tu santa cruz redimiste al mundo.</strong></p>
                <p>Repartieron entre sí mis vestidos, y sobre mi ropa echaron suertes.</p>
                <p>Señor, despójanos del hombre viejo y revístenos de tu gracia y santidad.</p>

                <h3>XI. Jesús es clavado en la cruz</h3>
                <p>Te adoramos, oh Cristo, y te bendecimos.</p>
                <p><strong>Que por tu santa cruz redimiste al mundo.</strong></p>
                <p>Y cuando llegaron al lugar llamado de la Calavera, le crucificaron allí.</p>
                <p>Señor, que tu amor clavado en la cruz atraiga nuestros corazones hacia ti.</p>

                <h3>XII. Jesús muere en la cruz</h3>
                <p>Te adoramos, oh Cristo, y te bendecimos.</p>
                <p><strong>Que por tu santa cruz redimiste al mundo.</strong></p>
                <p>Jesús, clamando a gran voz, dijo: Padre, en tus manos encomiendo mi espíritu. Y habiendo dicho esto, expiró.</p>
                <p class="rubric">(Se guarda un momento de silencio)</p>
                <p>Señor, por tu muerte, danos la vida eterna y la gracia de una buena muerte.</p>

                <h3>XIII. Jesús es bajado de la cruz</h3>
                <p>Te adoramos, oh Cristo, y te bendecimos.</p>
                <p><strong>Que por tu santa cruz redimiste al mundo.</strong></p>
                <p>José de Arimatea pidió el cuerpo de Jesús, y lo quitó.</p>
                <p>Señor, recibe nuestras vidas como ofrenda agradable a ti en la hora de nuestra muerte.</p>

                <h3>XIV. Jesús es sepultado</h3>
                <p>Te adoramos, oh Cristo, y te bendecimos.</p>
                <p><strong>Que por tu santa cruz redimiste al mundo.</strong></p>
                <p>Y lo puso en un sepulcro abierto en una peña, en el cual aún no se había puesto a nadie.</p>
                <p>Señor, concédenos descansar en ti, esperando la gloria de la resurrección.</p>

                <h3>Oración Final</h3>
                <p>Señor Jesucristo, que estiraste tus brazos en la cruz para que todos los hombres pudieran ser salvos: Recibe nuestra humilde acción de gracias por tu pasión y muerte, y concédenos que, habiendo compartido tus sufrimientos, podamos también participar de tu gloria; tú que vives y reinas con el Padre y el Espíritu Santo, un solo Dios, por los siglos de los siglos.<br>
                <strong>Amén.</strong></p>
            </div>
        `,
        "Oficio de Tinieblas (Tenebrae)": `
            <div class="liturgy-content">
                <h1>Oficio de Tinieblas (Tenebrae)</h1>
                <p class="rubric">Este oficio se canta en las noches de la Semana Santa. Aquí se provee una forma abreviada para el uso congregacional, enfocada en el Primer Nocturno y las Laudes.</p>

                <h3>Lucernario</h3>
                <p class="rubric">Se apagan todas las luces de la iglesia excepto las velas del tenebrario y el altar. Se canta el Salmo 69.</p>

                <h3>Salmo 69 (Selección)</h3>
                <p>Sálvame, oh Dios, *<br>
                <strong>porque las aguas han entrado hasta el alma.</strong></p>
                <p>Estoy hundido en cieno profundo, donde no hay pie; *<br>
                <strong>he venido a abismos de aguas, y la corriente me ha anegado.</strong></p>
                <p>Cansado estoy de llamar; mi garganta se ha enronquecido; *<br>
                <strong>han desfallecido mis ojos esperando a mi Dios.</strong></p>
                <p>No sean avergonzados por mi causa los que en ti confían, oh Señor Dios de los ejércitos; *<br>
                <strong>no sean confundidos por mí los que te buscan, oh Dios de Israel.</strong></p>
                <p>Porque por amor de ti he sufrido afrenta; *<br>
                <strong>confusión ha cubierto mi rostro.</strong></p>
                <p>La afrenta ha quebrantado mi corazón, y estoy congojado; *<br>
                <strong>esperé quien se compadeciese de mí, y no lo hubo; y consoladores, y ninguno hallé.</strong></p>
                <p>Me pusieron además hiel por comida, *<br>
                <strong>y en mi sed me dieron a beber vinagre.</strong></p>

                <h3>Primera Lección: Lamentaciones de Jeremías</h3>
                <p class="rubric">Lamentaciones 1:1-5</p>
                <p><em>Alef.</em> ¡Cómo ha quedado sola la ciudad populosa! La grande entre las naciones se ha vuelto como viuda, La señora de provincias ha sido hecha tributaria.</p>
                <p><em>Bet.</em> Amargamente llora en la noche, y sus lágrimas están en sus mejillas. No tiene quien la consuele de todos sus amantes; Todos sus amigos le faltaron, se le volvieron enemigos.</p>
                <p><em>Guímel.</em> Judá ha ido en cautiverio por causa de la aflicción y de la dura servidumbre; Ella habitó entre las naciones, y no halló descanso; Todos sus perseguidores la alcanzaron entre las estrechuras.</p>
                <p><em>Dálet.</em> Las calzadas de Sion tienen luto, porque no hay quien venga a las fiestas solemnes; Todas sus puertas están asoladas, sus sacerdotes gimen, Sus vírgenes están afligidas, y ella tiene amargura.</p>
                <p><em>He.</em> Sus enemigos han sido hechos príncipes, sus aborrecedores fueron prosperados, Porque el Señor la afligió por la multitud de sus rebeliones; Sus hijos fueron llevados en cautiverio delante del enemigo.</p>
                <p><strong>Jerusalén, Jerusalén, vuélvete al Señor tu Dios.</strong></p>

                <h3>Salmo 51 (Miserere)</h3>
                <p>Ten piedad de mí, oh Dios, conforme a tu misericordia; *<br>
                <strong>conforme a la multitud de tus piedades borra mis rebeliones.</strong></p>
                <p>Lávame más y más de mi maldad, *<br>
                <strong>y límpiame de mi pecado.</strong></p>
                <p>Porque yo reconozco mis rebeliones, *<br>
                <strong>y mi pecado está siempre delante de mí.</strong></p>
                <p>Contra ti, contra ti solo he pecado, *<br>
                <strong>y he hecho lo malo delante de tus ojos;</strong></p>
                <p>Para que seas reconocido justo en tu palabra, *<br>
                <strong>y tenido por puro en tu juicio.</strong></p>
                <p>Purifícame con hisopo, y seré limpio; *<br>
                <strong>lávame, y seré más blanco que la nieve.</strong></p>
                <p>Esconde tu rostro de mis pecados, *<br>
                <strong>y borra todas mis maldades.</strong></p>
                <p>Crea en mí, oh Dios, un corazón limpio, *<br>
                <strong>y renueva un espíritu recto dentro de mí.</strong></p>

                <h3>Laudes</h3>
                <p class="rubric">Solo queda encendida la vela central (vela de Cristo). Se canta el Benedictus.</p>
                <h3>Cántico de Zacarías (Benedictus)</h3>
                <p>Bendito el Señor Dios de Israel, *<br>
                <strong>que ha visitado y redimido a su pueblo,</strong></p>
                <p>Y nos levantó un poderoso Salvador *<br>
                <strong>en la casa de David su siervo,</strong></p>
                <p>Como habló por boca de sus santos profetas *<br>
                <strong>que fueron desde el principio;</strong></p>
                <p>Salvación de nuestros enemigos, *<br>
                <strong>y de la mano de todos los que nos aborrecieron.</strong></p>

                <h3>Christus Factus Est</h3>
                <p>Cristo se hizo por nosotros obediente hasta la muerte, y muerte de cruz. Por lo cual Dios también le exaltó hasta lo sumo, y le dio un nombre que es sobre todo nombre.</p>

                <h3>Oración Final</h3>
                <p class="rubric">(Se dice en voz baja o en silencio total)</p>
                <p>Mira, Señor todopoderoso, a esta tu familia, por la cual nuestro Señor Jesucristo se dignó ser entregado a los traidores y padecer el tormento de la cruz; quien contigo vive y reina en la unidad del Espíritu Santo, un solo Dios, por los siglos de los siglos.<br>
                <strong>Amén.</strong></p>

                <h3>Strepitus</h3>
                <p class="rubric">Se hace un gran ruido (strepitus) simbolizando el terremoto a la muerte de Cristo. La vela de Cristo se oculta y luego se muestra de nuevo, simbolizando la resurrección.</p>
            </div>
        `,
        "Ágape de Jueves Santo": `
            <div class="liturgy-content">
                <h1>Ágape de Jueves Santo</h1>
                <p class="rubric">Esta comida sigue a la Eucaristía del Jueves Santo. No es una celebración eucarística, sino una cena fraterna recordando la Última Cena. Se sugiere una comida sencilla (sopa, queso, aceitunas, frutas, pan y vino).</p>

                <h3>Bendición del Vino</h3>
                <p class="rubric">El Oficiante toma la copa y dice:</p>
                <p>Bendito seas, oh Señor nuestro Dios, Rey del universo. Tú creas el fruto de la vid; y en esta noche nos has refrescado con la copa de salvación en la Sangre de tu Hijo Jesucristo. Gloria a ti por los siglos de los siglos.<br>
                <strong>Amén.</strong></p>

                <h3>Bendición del Pan</h3>
                <p class="rubric">El Oficiante toma el pan y dice:</p>
                <p>Bendito seas, oh Señor nuestro Dios, Rey del universo. Tú haces brotar el pan de la tierra; y nos has alimentado en nuestro camino con el pan de vida en el Cuerpo de tu Hijo Jesucristo.</p>
                <p>Como el grano esparcido sobre la tierra es reunido en un solo pan, así reúne a tu Iglesia en todo lugar en el reino de tu Hijo. A ti sea la gloria y el poder por los siglos de los siglos.<br>
                <strong>Amén.</strong></p>
                
                <p class="rubric">Los alimentos se comparten en silencio o con conversación tranquila sobre el significado de la noche.</p>

                <h3>Lectura</h3>
                <p class="rubric">Juan 13:34-35</p>
                <p>Un mandamiento nuevo os doy: Que os améis unos a otros; como yo os he amado, que también os améis unos a otros. En esto conocerán todos que sois mis discípulos, si tuviereis amor los unos con los otros.</p>

                <h3>Oración Final</h3>
                <p>Te damos gracias, Padre celestial, porque nos has invitado a compartir este ágape en memoria de tu Hijo. Concédenos que, alimentados por tu gracia, vivamos siempre en el amor fraterno que él nos mandó. Por Jesucristo nuestro Señor.<br>
                <strong>Amén.</strong></p>
            </div>
        `,
        "Jueves Santo: Lavatorio": `
            <div class="liturgy-content">
                <h1>Jueves Santo: Lavatorio</h1>
                <p class="rubric">Este rito del lavatorio de los pies sigue a la homilía de la Eucaristía del Jueves Santo (Maundy Thursday).</p>

                <h3>Antífonas durante el Lavatorio</h3>

                <p>Celebrante: El Señor Jesús, sabiendo que su hora había llegado, amó a los suyos que estaban en el mundo y los amó hasta el fin.</p>
                <p><strong>Ubi caritas et amor, Deus ibi est. / Donde hay caridad y amor, allí está Dios.</strong></p>

                <p>Celebrante: Señor, ¿tú me lavas los pies a mí? Respondió Jesús y le dijo: Si no te lavare, no tendrás parte conmigo.</p>
                <p><strong>Ubi caritas et amor, Deus ibi est.</strong></p>

                <p>Celebrante: Entonces llegó a Simón Pedro; y Pedro le dijo: Señor, ¿tú me lavas los pies a mí? Respondió Jesús y le dijo: Lo que yo hago, tú no lo comprendes ahora; mas lo entenderás después.</p>
                <p><strong>Ubi caritas et amor, Deus ibi est.</strong></p>

                <p>Celebrante: Si yo, el Señor y el Maestro, he lavado vuestros pies, vosotros también debéis lavaros los pies los unos a los otros.</p>
                <p><strong>Ubi caritas et amor, Deus ibi est.</strong></p>

                <p>Celebrante: En esto conocerán todos que sois mis discípulos, si tuviereis amor los unos con los otros.</p>
                <p><strong>Ubi caritas et amor, Deus ibi est.</strong></p>

                <p>Celebrante: Un mandamiento nuevo os doy: Que os améis unos a otros; como yo os he amado, que también os améis unos a otros.</p>
                <p><strong>Ubi caritas et amor, Deus ibi est.</strong></p>

                <p>Celebrante: Que permanezcan en vosotros la fe, la esperanza y el amor; pero el mayor de ellos es el amor.</p>
                <p><strong>Ubi caritas et amor, Deus ibi est.</strong></p>

                <h3>Oración Final del Lavatorio</h3>
                <p>Oremos.</p>
                <p>Señor Jesucristo, que nos has enseñado que lo que hagamos al más pequeño de tus hermanos te lo hacemos a ti: Concédenos la gracia de servirnos unos a otros con humildad y amor, siguiendo tu santo ejemplo, para que un día podamos sentarnos contigo en tu banquete celestial; donde vives y reinas con el Padre y el Espíritu Santo, un solo Dios, por los siglos de los siglos.<br>
                <strong>Amén.</strong></p>
            </div>
        `,
        "Jueves Santo: Reserva": `
            <div class="liturgy-content">
                <h1>Jueves Santo: Reserva</h1>
                <p class="rubric">Traslado del Santísimo Sacramento al Altar de la Reserva (Monumento) al final de la Eucaristía del Jueves Santo.</p>

                <h3>Pange Lingua</h3>
                <p class="rubric">Mientras se procesiona con el Sacramento hacia el lugar de la reserva, se canta:</p>

                <p>Canta, oh lengua, el glorioso<br>
                Misterio del Cuerpo y Sangre preciosa,<br>
                Que el Rey de las naciones<br>
                Fruto de un vientre generoso,<br>
                Derramó para el rescate del mundo.</p>

                <p>Se nos dio, naciendo para nosotros<br>
                De una Virgen purísima,<br>
                Y habitando en el mundo,<br>
                Sembrada la semilla de la Palabra,<br>
                Terminó su morada con admirable orden.</p>

                <p>En la noche de la última Cena,<br>
                Recostado con sus hermanos,<br>
                Observada plenamente la Ley<br>
                En las comidas legales,<br>
                Se dio a sí mismo con sus propias manos<br>
                A los doce como alimento.</p>

                <p>El Verbo encarnado, con su palabra,<br>
                Convierte el pan verdadero en carne,<br>
                Y el vino se vuelve sangre de Cristo;<br>
                Y si el sentido falla para captarlo,<br>
                La fe sola basta<br>
                Para confirmar el corazón sincero.</p>

                <h3>Tantum Ergo</h3>
                <p class="rubric">Al llegar al lugar de la reserva:</p>

                <p>Veneremos, pues, inclinados,<br>
                Tan grande Sacramento;<br>
                Y cedan los antiguos ritos<br>
                Al nuevo rito;<br>
                Supla la fe<br>
                Lo que fallan los sentidos.</p>

                <p>Al Padre y al Hijo<br>
                Sean alabanza y júbilo,<br>
                Salud, honor, virtud y bendición;<br>
                Y al que procede de ambos<br>
                Sea igual alabanza.</p>
                <p><strong>Amén.</strong></p>

                <p class="rubric">Después de un tiempo de adoración en silencio, se despoja el altar principal (Denudación del Altar) mientras se lee el Salmo 22 sin gloria patri.</p>
            </div>
        `,
        "Jueves Santo: Despojo": `
            <div class="liturgy-content">
                <h1>Jueves Santo: Despojo</h1>
                <p class="rubric">Este rito se realiza tras la Eucaristía del Jueves Santo y la Reserva del Santísimo.</p>
                <p class="rubric">El altar es despojado totalmente. Se retiran los manteles, las velas y cualquier ornamento, dejando el altar desnudo como símbolo del despojo de Cristo antes de su crucifixión.</p>
                
                <h3>Salmo 22</h3>
                <p class="rubric">Se recita o canta el Salmo 22, sin Gloria Patri.</p>
                
                <p>Dios mío, Dios mío, ¿por qué me has desamparado? *<br>
                <strong>¿Por qué estás tan lejos de mi salvación, y de las palabras de mi clamor?</strong></p>
                
                <p>Dios mío, clamo de día, y no respondes; *<br>
                <strong>Y de noche, y no hay para mí reposo.</strong></p>
                
                <p>Pero tú eres santo, *<br>
                <strong>Tú que habitas entre las alabanzas de Israel.</strong></p>
                
                <p>En ti esperaron nuestros padres; *<br>
                <strong>Esperaron, y tú los libraste.</strong></p>
                
                <p>Clamaron a ti, y fueron librados; *<br>
                <strong>Confiaron en ti, y no fueron avergonzados.</strong></p>
                
                <p>Mas yo soy gusano, y no hombre; *<br>
                <strong>Oprobio de los hombres, y despreciado del pueblo.</strong></p>
                
                <p>Todos los que me ven me escarnecen; *<br>
                <strong>Estiran la boca, menean la cabeza, diciendo:</strong></p>
                
                <p>Se encomendó al Señor; líbrele él; *<br>
                <strong>Sálvele, puesto que en él se complacía.</strong></p>
                
                <p>Pero tú eres el que me sacó del vientre; *<br>
                <strong>El que me hizo estar confiado desde que estaba a los pechos de mi madre.</strong></p>
                
                <p>Sobre ti fui echado desde antes de nacer; *<br>
                <strong>Desde el vientre de mi madre, tú eres mi Dios.</strong></p>
                
                <p>No te alejes de mí, porque la angustia está cerca; *<br>
                <strong>Porque no hay quien ayude.</strong></p>
                
                <p class="rubric">Se concluye en silencio, sin bendición ni despedida, y se sale de la iglesia en silencio.</p>
            </div>
        `,
        "Bienvenida a Nuevos": `
            <div class="liturgy-content">
                <h1>Bienvenida a Nuevos Miembros</h1>
                <p class="rubric">Este rito se celebra durante la Eucaristía, después del Credo y antes de la Paz.</p>

                <h3>Presentación</h3>
                <p class="rubric">El Oficiante invita a pasar al frente a los nuevos miembros. Ellos pueden ser presentados por padrinos o miembros del consejo.</p>
                <p>Presentador: Recibimos hoy en nuestra comunión a [Nombres], quienes desean unirse a esta parroquia/misión.</p>

                <h3>Examen</h3>
                <p class="rubric">El Oficiante se dirige a los nuevos miembros:</p>
                <p>Oficiante: ¿Renuevan ustedes el compromiso con Jesucristo como su Señor y Salvador, que hicieron (o que fue hecho por ustedes) en su bautismo?</p>
                <p><strong>Candidatos: Lo renuevo.</strong></p>

                <p>Oficiante: ¿Prometen participar fielmente en la vida de esta comunidad, en su adoración, enseñanza, servicio y ofrendas?</p>
                <p><strong>Candidatos: Lo prometo, con la ayuda de Dios.</strong></p>

                <p>Oficiante: ¿Prometen orar por sus hermanos y hermanas en Cristo, y buscar siempre la unidad y la paz dentro de la Iglesia?</p>
                <p><strong>Candidatos: Lo prometo, con la ayuda de Dios.</strong></p>

                <h3>Bienvenida de la Congregación</h3>
                <p class="rubric">El Oficiante se dirige a la congregación:</p>
                <p>Oficiante: ¿Harán ustedes todo lo que esté a su alcance para apoyar a estas personas en su vida en Cristo?</p>
                <p><strong>Pueblo: Así lo haremos.</strong></p>

                <p class="rubric">Toda la congregación dice al unísono:</p>
                <p><strong>Los recibimos en la casa de Dios. Confiesen la fe de Cristo crucificado, proclamen su resurrección, y compartan con nosotros su sacerdocio real.</strong></p>

                <h3>Oración y Paz</h3>
                <p>Oremos.<br>
                Oh Dios, autor de toda comunión, te damos gracias por haber traído a estos hermanos y hermanas a nuestra familia de fe. Fortalécelos con tu Espíritu, para que crezcan en gracia y en el conocimiento de tu amor; y haz que nosotros seamos para ellos ejemplo de justicia y santidad. Por Jesucristo nuestro Señor.<br>
                <strong>Amén.</strong></p>

                <p>La paz del Señor sea siempre con ustedes.</p>
                <p><strong>Y con tu espíritu.</strong></p>
                <p class="rubric">Los nuevos miembros son saludados por la congregación.</p>
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
                { title: "Antífonas para el Lucernario", description: "Oraciones al encender las velas.", icon: "light_mode" },
                { title: "Antífonas para la Fracción", description: "Cantos para la fracción del pan (Confractoria).", icon: "bakery_dining" },
                { title: "Bendiciones Estacionales", description: "Bendiciones especiales para cada tiempo litúrgico.", icon: "calendar_month" },
                { title: "Sobre la Corona de Adviento", description: "Rito para bendecir y encender la corona.", icon: "candle" },
                { title: "Festival de Lecciones y Música de Adviento", description: "Servicio de lecturas y cánticos de espera.", icon: "library_music" },
                { title: "Vigilia de Nochebuena", description: "Celebración en la víspera de la Natividad.", icon: "bedtime" },
                { title: "Estación ante el Pesebre", description: "Devoción especial ante el nacimiento.", icon: "child_care" },
                { title: "Festival de Lecciones y Música de Navidad", description: "Celebración festiva de la Encarnación.", icon: "music_note" },
                { title: "Víspera de Año Nuevo", description: "Oración para recibir el año civil.", icon: "hourglass_empty" },
                { title: "Bendición de Hogares (Epifanía)", description: "Tradicional bendición de casas con tiza.", icon: "home_work" },
                { title: "Vigilia Bautismo del Señor", description: "Preparación para la renovación bautismal.", icon: "water_drop" },
                { title: "Procesión de la Candelaria", description: "Bendición de las velas y procesión.", icon: "candle" },
                { title: "El Vía Crucis", description: "Meditación sobre la Pasión del Señor.", icon: "conversion_path" },
                { title: "Oficio de Tinieblas (Tenebrae)", description: "Liturgia solemne de sombras y luz.", icon: "dark_mode" },
                { title: "Jueves Santo: Lavatorio", description: "Rito del mandato del amor fraterno.", icon: "wash" },
                { title: "Jueves Santo: Reserva", description: "Traslado y reserva del Santísimo.", icon: "inventory_2" },
                { title: "Jueves Santo: Despojo", description: "Despojo del altar tras la misa.", icon: "layers_clear" },
                { title: "Ágape de Jueves Santo", description: "Cena fraterna recordando la Última Cena.", icon: "restaurant" },
                { title: "Bendición de Alimentos (Pascua)", description: "Bendición de la mesa de Pascua.", icon: "restaurant_menu" },
                { title: "Bendición de Hogares (Pascua)", description: "Bendición de casas en tiempo pascual.", icon: "holiday_village" },
                { title: "Procesión de las Rogativas", description: "Súplicas por los frutos de la tierra.", icon: "agriculture" },
                { title: "Vigilia de Todos los Santos", description: "Preparación para la solemnidad.", icon: "groups" },
                { title: "Víspera de Todos los Santos", description: "Servicio de oración (Halloween).", icon: "face" }
            ]
        },
        {
            category: "Servicios Pastorales",
            items: [
                { title: "Bienvenida a Nuevos", description: "Acogida de nuevos miembros a la comunidad.", icon: "handshake" },
                { title: "Despedida de Miembros", description: "Oración al dejar una congregación.", icon: "waving_hand" },
                { title: "Catecumenado", description: "Preparación de adultos para el Bautismo.", icon: "school" },
                { title: "Admisión de Catecúmenos", description: "Rito de entrada al catecumenado.", icon: "how_to_reg" },
                { title: "Inscripción de Candidatos", description: "Elección para el Bautismo.", icon: "edit_document" },
                { title: "Entrga del Credo / Padre Nuestro", description: "Ritos de transmisión de la fe.", icon: "book" },
                { title: "Vigilia Bautismal", description: "Oración previa al Bautismo.", icon: "water" },
                { title: "Reafirmación Votos", description: "Renovación de promesas bautismales.", icon: "published_with_changes" },
                { title: "Recepción de Miembros", description: "Acogida de otras tradiciones cristianas.", icon: "door_front" },
                { title: "Inscripción Cuaresmal", description: "Inicio de la preparación final.", icon: "edit_calendar" },
                { title: "Rito Jueves Santo", description: "Preparación inmediata a los sacramentos.", icon: "event" },
                { title: "Bendición de Casa", description: "Celebración y bendición para un hogar.", icon: "doorbell" },
                { title: "Bendición Embarazada", description: "Oración por la madre y el hijo.", icon: "pregnant_woman" },
                { title: "Padres y Padrinos", description: "Preparación para el rol bautismal.", icon: "family_restroom" },
                { title: "Aniversario Matrimonio", description: "Renovación de votos matrimoniales.", icon: "favorite" },
                { title: "Servicio de Sanación", description: "Oración pública por la salud.", icon: "healing" },
                { title: "Sobre el Exorcismo", description: "Notas pastorales sobre liberación.", icon: "shield" },
                { title: "Entierro no cristiano", description: "Servicio fúnebre pastoral.", icon: "church" },
                { title: "Comisionamiento Laicos", description: "Envío a ministerios específicos.", icon: "badge" },
                { title: "Dedicación Mobiliario", description: "Bendición de ornamentos y objetos.", icon: "chair" }
            ]
        },
        {
            category: "Misión Episcopal",
            items: [
                { title: "Discernimiento Misión", description: "Liturgia para buscar la voluntad de Dios.", icon: "explore" },
                { title: "Comisionamiento Plantador", description: "Envío para fundar nuevas iglesias.", icon: "nature" },
                { title: "Apertura Congregación", description: "Inicio oficial de una nueva misión.", icon: "storefront" },
                { title: "Puesta aparte espacio", description: "Bendición de lugares de culto temporal.", icon: "architecture" },
                { title: "Letanía por la Misión", description: "Súplicas por la expansión del Evangelio.", icon: "campaign" }
            ]
        }
    ];

    return (
        <main className="flex-1 flex flex-col w-full h-full bg-gray-50 dark:bg-background-dark animate-fade-in pb-24 overflow-hidden" >
            {/* Header */}
            < div className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-white/5 shrink-0 z-10 shadow-sm" >
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
            </div >

            {/* Content grid */}
            < div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8" >
                {
                    services.map((section, idx) => (
                        <div key={idx} className="animate-slide-up" style={{ animationDelay: `${idx * 100} ms` }}>
                            <h3 className="text-sm font-bold text-[var(--color-primary)] dark:text-red-400 uppercase tracking-widest mb-4 px-1 sticky top-0 bg-[var(--color-background-light)] dark:bg-background-dark z-10 py-2 border-b border-primary/10">
                                {section.category}
                            </h3>

                            {/* Responsive Grid: 1 col mobile, 2 col tablet, 4 col desktop */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                                {section.items.map((item, i) => (
                                    <StyledCard
                                        key={i}
                                        title={item.title}
                                        description={item.description}
                                        icon={item.icon || "church"}
                                        onClick={() => handleServiceClick(item)}
                                        actionText="Ver Detalles"
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                }

                < div className="px-4 py-8 text-center bg-[var(--color-primary)]/5 dark:bg-white/5 rounded-xl mx-auto max-w-2xl mt-8 border border-[var(--color-primary)]/10" >
                    <p className="text-xs text-gray-500 italic">
                        Basado en "The Book of Occasional Services 2003".<br />
                        Los textos completos estarán disponibles próximamente.
                    </p>
                </div >
            </div >
        </main >
    );
}
