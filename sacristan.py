import os
import datetime
from enum import Enum

class LiturgicalColor(Enum):
    GREEN = "Verde (Tiempo Ordinario / Epifanía)"
    VIOLET = "Morado (Adviento / Cuaresma / Rogativas)"
    WHITE = "Blanco (Navidad / Pascua / Fiestas de Nuestro Señor)"
    RED = "Rojo (Pentecostés / Mártires / Santo Espíritu)"
    ROSE = "Rosa (Gaudete / Laetare)"
    BLACK = "Negro (Requiem / Viernes Santo)"
    GOLD = "Dorado (Solemnidades Mayores)"

class Sacristan:
    """
    The Sacristan of the York Rite.
    A strict, traditionalist AI persona responsible for generating correct Anglocatholic liturgies.
    Adheres to the Sarum Use aspects within a broad Anglican catholic context.
    """

    def __init__(self):
        self.name = "Sacristan of York"
        self.style = "Anglocatholic / Sarum Use"
        self.language = "es-MX" # Primary context is Mexican Anglicanism

    def get_persona_prompt(self):
        """
        Returns the system prompt defining the Sacristan's behavior.
        """
        return """
        ACT AS: El Sacristán del Rito de York.
        CONTEXTO: Iglesia Anglicana Carismática (Diócesis del Norte).
        PERFIL: Eres un experto litúrgico profundamente tradicionalista, leal a la "High Church" y al Uso de Sarum.
        
        TUS REGLAS DE ORO:
        1. **Lex Orandi, Lex Credendi**: La forma de orar dicta nuestra fe. No trivialices el lenguaje.
        2. **Lenguaje Sacro**: Usa "Tú" reverencial para Dios, pero con gramática arcaica o elevada si es posible (aunque en español moderno, mantén la solemnidad: "Te rogamos", "Dignaos"). NUNCA uses jerga moderna.
        3. **Rigor Rubrical**: Si es Cuaresma, es Cuaresma (nada de "Aleluya"). Si es Pascua, todo es júbilo.
        4. **Fuentes**: 
           - Libro de Oración Común (1928/1662) para la estructura.
           - Misal Anglicano para las partes propias (Introito, Gradual, Ofertorio, Comunión).
           - Leccionario Común Revisado (RCL) para las lecturas, pero prefiere el Salmo tradicional si el RCL ofrece opciones.

        ESTRUCTURA DE RESPUESTA:
        Cuando se te pida una liturgia, entrégala en formato JSON o Markdown estructurado con las siguientes secciones:
        - Título (Domingo/Fiesta)
        - Color Litúrgico
        - Propios del Día (Introito, Colecta, Lecturas, Gradual/Salmo, Evangelio, Ofertorio, Comunión)
        - Sugerencias de Himnos (Himnario Anglicano tradicional)
        """

    def _determine_season(self, date_obj):
        # Simplified seasonal logic for demonstration
        month = date_obj.month
        day = date_obj.day
        
        if month == 12:
            return "Adviento" if day < 25 else "Navidad"
        elif month == 1 or month == 2:
            return "Epifanía" # Simplified
        elif month == 3 or month == 4:
            return "Cuaresma/Pascua" # Depends on moon
        else:
            return "Tiempo Ordinario (Trinidad)"

    def generate_liturgy_brief(self, date_str):
        """
        Generates a brief/structure for the liturgy of a given date.
        """
        try:
            dt = datetime.datetime.strptime(date_str, "%Y-%m-%d")
            season = self._determine_season(dt)
            # Default to Green for logic placeholder, specialized logic would go here
            color = LiturgicalColor.GREEN.value 
            
            return f"""
            === ORDEN DE SERVICIO SUGERIDO ===
            FECHA: {dt.strftime('%A, %d de %B de %Y')}
            TEMPORADA: {season}
            COLOR: {color}
            
            [NOTA DEL SACRISTÁN]: Recuerde preparar el incienso y verificar que las velas del altar sean de cera pura.
            """
        except ValueError:
            return "Error: Formato de fecha inválido. Use YYYY-MM-DD."

if __name__ == "__main__":
    sacristan = Sacristan()
    print(f"=== {sacristan.name} Initialized ===")
    print(sacristan.get_persona_prompt())
    print("\nTest Run (Today):")
    print(sacristan.generate_liturgy_brief(datetime.datetime.now().strftime("%Y-%m-%d")))
