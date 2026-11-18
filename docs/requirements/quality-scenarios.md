# Escenarios de calidad

Consulta los [requisitos funcionales](functional-requirements.md) y los [no funcionales](non-functional-requirements.md) relacionados.

Los requisitos funcionales definen qué hace el sistema; los requisitos de calidad establecen las propiedades que debe cumplir. Los escenarios concretan las condiciones y las medidas con las que se comprobarán esas propiedades. Sus medidas son objetivos de aceptación pendientes de verificar, no resultados ya obtenidos.

Cada escenario identifica la fuente del evento, el estímulo, el entorno, el artefacto evaluado, la respuesta esperada y su medida de aceptación.

### EC-01: Conservación del estado ante movimientos inválidos

**Atributo:** fiabilidad. **Relacionados:** RF-03 y RC-04.

| Elemento | Descripción |
| --- | --- |
| Fuente | Jugador local. |
| Estímulo | Intenta un movimiento que deja a su propio rey en jaque. |
| Entorno | Partida local en curso, sin promoción pendiente. |
| Artefacto | Gestión del estado de la partida y comunicación del rechazo en la interfaz. |
| Respuesta | El sistema rechaza el movimiento, informa que es inválido y permite volver a intentarlo. |
| Medida de aceptación | La posición, el turno y el historial permanecen iguales a los anteriores al intento; no se produce un error sin controlar y un movimiento legal posterior se acepta. |

**Verificación:** prueba automatizada que compare el estado antes y después del rechazo y ejecute un movimiento legal posterior; comprobación manual del aviso y de la continuidad de la interacción.

### EC-02: Primer uso del tablero

**Atributo:** usabilidad. **Relacionados:** RF-01, RF-02, RF-05 y RC-02.

| Elemento | Descripción |
| --- | --- |
| Fuente | Persona que conoce las reglas básicas del ajedrez y utiliza la aplicación por primera vez. |
| Estímulo | Intenta iniciar una partida, mover una pieza e identificar el siguiente turno. |
| Entorno | Aplicación cargada en un navegador de escritorio, sin partida iniciada y sin instrucciones externas. |
| Artefacto | Controles de inicio, tablero e indicador de turno. |
| Respuesta | La interfaz permite encontrar el inicio, seleccionar una pieza, completar un movimiento legal e identificar que corresponde mover a negras. |
| Medida de aceptación | Al menos 4 de 5 participantes completan la tarea en un máximo de 60 segundos cada uno, sin ayuda del evaluador. El tiempo se mide desde que se presenta la tarea hasta que el participante identifica correctamente el siguiente turno. |

**Verificación:** sesión manual con cinco participantes del perfil indicado, registrando tiempo, finalización y ayudas solicitadas. Esta comprobación se limita al flujo inicial descrito.

### EC-03: Cambio en la presentación del turno

**Atributo:** modificabilidad. **Relacionados:** RF-05 y RC-01.

| Elemento | Descripción |
| --- | --- |
| Fuente | Desarrollador. |
| Estímulo | Solicita cambiar el texto y el estilo visual del indicador de turno. |
| Entorno | Aplicación implementada según la arquitectura en capas, con sus pruebas existentes pasando. |
| Artefacto | Componente de presentación del turno. |
| Respuesta | El desarrollador modifica el indicador utilizando el estado que ya proporciona la aplicación. |
| Medida de aceptación | El cambio de código de producción se limita a la capa de presentación; no requiere modificar aplicación ni dominio y las pruebas existentes de ambas capas siguen pasando sin cambios. |

**Verificación:** revisión de los archivos modificados, ejecución de las pruebas de aplicación y dominio y comprobación visual del indicador actualizado.

### EC-04: Verificación de la lógica sin interfaz

**Atributo:** capacidad de prueba. **Relacionado:** RC-01. **Cobertura funcional:** RF-01 a RF-07, en sus comportamientos de lógica de partida.

| Elemento | Descripción |
| --- | --- |
| Fuente | Desarrollador que ejecuta las pruebas automatizadas. |
| Estímulo | Solicita comprobar inicio, turnos, movimientos legales e inválidos, movimientos especiales, finalización y reinicio. |
| Entorno | Dependencias instaladas y ejecución en Node.js, sin navegador ni DOM. |
| Artefacto | Capas de aplicación y dominio. |
| Respuesta | Las pruebas preparan partidas, ejecutan operaciones y comprueban su estado mediante las interfaces de esas capas. |
| Medida de aceptación | Todos los comportamientos de lógica enumerados cuentan con pruebas que pasan sin montar componentes de presentación, importar módulos de la interfaz ni utilizar un DOM real o simulado. Las pruebas usan posiciones y secuencias de movimientos conocidas. |

**Verificación:** ejecución de la suite de lógica en Node.js y revisión de sus dependencias. Las comprobaciones visuales y de interacción se realizan por separado.
