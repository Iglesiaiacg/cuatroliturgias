
export const marriageRite = {
    id: 'marriage',
    title: 'Santo Matrimonio',
    description: 'Rito para la celebración del matrimonio, con consentimiento y votos.',
    inputs: [
        { id: 'groom', label: 'Nombre del Esposo', type: 'text', placeholder: 'ej. Ricardo' },
        { id: 'bride', label: 'Nombre de la Esposa', type: 'text', placeholder: 'ej. Isabel' },
        { id: 'witnesses', label: 'Testigos', type: 'text', placeholder: 'ej. Juan y Ana' },
        { id: 'celebrant', label: 'Celebrante', type: 'text', placeholder: 'ej. Rev. Padre Carlos' },
        { id: 'date', label: 'Fecha', type: 'date' }
    ],
    generate: (data) => {
        const { groom, bride, witnesses, date } = data;
        const groomName = groom || 'El Esposo';
        const brideName = bride || 'La Esposa';

        return `
        <div class="liturgy-content">
            <h1>Celebración del Santo Matrimonio</h1>
            <p class="rubric">Uniendo a <strong>${groomName}</strong> y <strong>${brideName}</strong></p>
            ${date ? `<p class="date text-center mb-4">${new Date(date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>` : ''}
            
            <h3>Monición de Entrada</h3>
            <p><strong>Celebrante:</strong> Queridos hermanos, nos hemos reunido aquí en la casa del Señor para celebrar con alegría la unión de ${groomName} y ${brideName}. Dios, que es Amor, los ha llamado a fundar un hogar cristiano.</p>
            
            <h3>Escrutinio</h3>
            <p class="rubric">El celebrante interroga a los novios.</p>
            <p><strong>Celebrante:</strong> ${groomName} y ${brideName}, ¿han venido aquí a contraer matrimonio libre y voluntariamente?</p>
            <p><strong>Novios:</strong> Sí, venimos libremente.</p>
            <p><strong>Celebrante:</strong> ¿Están decididos a amarse y respetarse mutuamente durante toda la vida?</p>
            <p><strong>Novios:</strong> Sí, estamos decididos.</p>
            
            <h3>Consentimiento</h3>
            <p class="rubric">Los novios se dan la mano derecha.</p>
            
            <p><strong>El Esposo:</strong> Yo, <strong>${groomName}</strong>, te quiero a ti, <strong>${brideName}</strong>, como esposa. Y me entrego a ti, y prometo serte fiel en las alegrías y en las penas, en la salud y en la enfermedad, todos los días de mi vida.</p>
            
            <p><strong>La Esposa:</strong> Yo, <strong>${brideName}</strong>, te quiero a ti, <strong>${groomName}</strong>, como esposo. Y me entrego a ti, y prometo serte fiel en las alegrías y en las penas, en la salud y en la enfermedad, todos los días de mi vida.</p>
            
            <p><strong>Celebrante:</strong> El Señor confirme este consentimiento que han manifestado ante la Iglesia y cumpla en ustedes su bendición. Lo que Dios ha unido, que no lo separe el hombre.</p>
            <p><strong>Todos:</strong> Amén.</p>
            
            <h3>Bendición y Entrega de Anillos</h3>
            <p class="rubric">El esposo coloca el anillo a la esposa, y viceversa.</p>
            <p><strong>${groomName}:</strong> ${brideName}, recibe este anillo como signo de mi amor y fidelidad. En el nombre del Padre, y del Hijo, y del Espíritu Santo.</p>
            <p><strong>${brideName}:</strong> ${groomName}, recibe este anillo como signo de mi amor y fidelidad. En el nombre del Padre, y del Hijo, y del Espíritu Santo.</p>
            
            <h3>Bendición de las Arras (Opcional)</h3>
            <p><strong>${groomName}:</strong> ${brideName}, recibe estas arras como prenda de la bendición de Dios y del cuidado que tendré de que no falte lo necesario en nuestro hogar.</p>
            <p><strong>${brideName}:</strong> ${groomName}, yo las recibo en señal del cuidado que tendré de que todo se aproveche honradamente.</p>
            
            <h3>Bendición Nupcial</h3>
            <p class="rubric">Los esposos se arrodillan.</p>
            <p><strong>Celebrante:</strong> Padre Santo, tú que has hecho del matrimonio símbolo del amor de Cristo a su Iglesia: Mira con bondad a estos hijos tuyos. Que permanezcan unidos en el amor y la paz, para que sean testigos fieles de tu alianza ante el mundo.</p>
            <p><strong>Todos:</strong> Amén.</p>
            
            <h3>Despedida</h3>
            <p><strong>Celebrante:</strong> Puede besar a la novia.</p>
        </div>
        `;
    }
};
