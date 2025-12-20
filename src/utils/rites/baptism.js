
export const baptismRite = {
    id: 'baptism',
    title: 'Santo Bautismo',
    description: 'Rito para el bautismo de niños o adultos, con promesas y administración del sacramento.',
    inputs: [
        { id: 'candidateName', label: 'Nombre del Candidato (Bautizando)', type: 'text', placeholder: 'ej. Juan Pablo' },
        { id: 'parents', label: 'Padres', type: 'text', placeholder: 'ej. María y José' },
        { id: 'godparents', label: 'Padrinos', type: 'text', placeholder: 'ej. Pedro y Ana' },
        { id: 'celebrant', label: 'Celebrante', type: 'text', placeholder: 'ej. Rev. Padre Carlos' },
        { id: 'date', label: 'Fecha', type: 'date' }
    ],
    generate: (data) => {
        const { candidateName, parents, godparents, celebrant, date } = data;

        return `
        <div class="liturgy-content">
            <h1>El Santo Bautismo</h1>
            <p class="rubric">Administrado a <strong>${candidateName || '[Nombre]'}</strong></p>
            ${date ? `<p class="date text-center mb-4">${new Date(date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>` : ''}
            
            <h3>Presentación</h3>
            <p class="rubric">El Celebrante sale al encuentro de la familia en la puerta de la iglesia o ante la pila bautismal.</p>
            <p class="rubric-solemn">El celebrante debe vestir alba y estola blanca. Si es Pascua, vestimenta festiva.</p>
            
            <p><strong>Celebrante:</strong> ¿Qué piden a la Iglesia de Dios para <strong>${candidateName || 'este niño'}</strong>?</p>
            <p><strong>Padres y Padrinos:</strong> El Bautismo.</p>
            
            <p><strong>Celebrante:</strong> Al pedir el Bautismo para sus hijos, ¿saben que contraen la responsabilidad de educarlos en la fe?</p>
            <p><strong>Padres (${parents || 'Padres'}):</strong> Sí, lo sabemos.</p>
            
            <p><strong>Celebrante:</strong> Y ustedes, padrinos (${godparents || 'Padrinos'}), ¿están dispuestos a ayudar a los padres en esa tarea?</p>
            <p><strong>Padrinos:</strong> Sí, estamos dispuestos.</p>
            
            <h3>Liturgia de la Palabra</h3>
            <p class="rubric">Se pueden leer una o más lecturas bíblicas (ej. Mateo 28:18-20, Marcos 1:9-11).</p>
            
            <h3>Renuncia y Profesión de Fe</h3>
            <p><strong>Celebrante:</strong> ¿Renuncian a Satanás, a todas sus obras y a todas sus seducciones?</p>
            <p><strong>Todos:</strong> Renuncio.</p>
            <p><strong>Celebrante:</strong> ¿Creen en Dios, Padre todopoderoso, Creador del cielo y de la tierra?</p>
            <p><strong>Todos:</strong> Creo.</p>
            <p><strong>Celebrante:</strong> ¿Creen en Jesucristo, su único Hijo, nuestro Señor, que nació de Santa María Virgen, murió, fue sepultado, resucitó de entre los muertos y está sentado a la derecha del Padre?</p>
            <p><strong>Todos:</strong> Creo.</p>
            <p><strong>Celebrante:</strong> ¿Creen en el Espíritu Santo, en la Santa Iglesia Católica, en la comunión de los santos, en el perdón de los pecados, en la resurrección de los muertos y en la vida eterna?</p>
            <p><strong>Todos:</strong> Creo.</p>
            
            <h3>Bautismo</h3>
            <p class="rubric">El Celebrante vierte agua tres veces sobre la cabeza del candidato, diciendo:</p>
            <p class="rubric-solemn">La inmersión es preferible, simbolizando la muerte y resurrección con Cristo. Si es por infusión, el agua debe correr libremente.</p>
            <p class="text-center font-bold text-lg my-4">
                ${candidateName || 'N.'}, YO TE BAUTIZO EN EL NOMBRE DEL <span class="mystagogy" data-note="La fórmula trinitaria es esencial para la validez del sacramento, tal como fue ordenada por Cristo en Mateo 28:19.">PADRE</span>,<br>
                Y DEL HIJO,<br>
                Y DEL ESPÍRITU SANTO.
            </p>
            <p><strong>Todos:</strong> Amén.</p>
            
            <h3>Unción con el Santo Crisma</h3>
            <p class="rubric">El Celebrante unge la coronilla del bautizado con el Santo Crisma.</p>
            <p>Dios todopoderoso, Padre de nuestro Señor Jesucristo, que te ha librado del pecado y dado nueva vida por el agua y el Espíritu Santo, te consagre con el <span class="mystagogy" data-note="El Crisma (aceite consagrado con bálsamo) significa la unción del Espíritu Santo, configurando al bautizado como 'otro Cristo' (ungido).">Crisma</span> de la salvación para que entres a formar parte de su pueblo y seas para siempre miembro de Cristo, Sacerdote, Profeta y Rey.</p>
            <p><strong>Todos:</strong> Amén.</p>
            
            <h3>Vestidura Blanca</h3>
            <p class="rubric">Se impone la vestidura blanca.</p>
            <p><strong>Celebrante:</strong> ${candidateName || 'N.'}, eres ya nueva criatura y has sido revestido de Cristo. Esta vestidura blanca sea signo de tu dignidad de cristiano.</p>
            
            <h3>Entrega de la Luz</h3>
            <p class="rubric">Se enciende una vela del Cirio Pascual.</p>
            <p><strong>Celebrante:</strong> Reciban la luz de Cristo. A ustedes, padres y padrinos, se les confía el cuidado de esta luz para que este niño, iluminado por Cristo, camine siempre como hijo de la luz.</p>
            
            <h3>Despedida</h3>
            <p><strong>Celebrante:</strong> Vayan en paz.</p>
            <p><strong>Todos:</strong> Demos gracias a Dios.</p>
        </div>
        `;
    }
};
