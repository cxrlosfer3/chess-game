# Requisitos no funcionales

Se conservan los identificadores RC (requisito de calidad) para mantener las referencias existentes.

### RC-01: Separación de responsabilidades

La implementación respetará la [arquitectura en capas](../architecture.md): la presentación solicitará operaciones a la aplicación y el uso de chess.js se centralizará en el dominio. La lógica de la partida podrá comprobarse sin renderizar la interfaz.

### RC-02: Interacción comprensible

El tablero distinguirá piezas blancas y negras, selección y estados de la partida. Los controles tendrán etiquetas claras, los avisos se expresarán en texto y el diseño permitirá utilizar el tablero y los controles en pantallas de escritorio y móviles sin superposiciones.

### RC-03: Ejecución reproducible

El repositorio documentará los pasos para instalar dependencias, iniciar el entorno de desarrollo, ejecutar pruebas y generar la compilación. Se incluirá el archivo de bloqueo de dependencias correspondiente.

### RC-04: Integridad y continuidad de la partida

El rechazo de una acción inválida conservará el estado de la partida y permitirá continuar con una acción legal, sin errores sin controlar.
