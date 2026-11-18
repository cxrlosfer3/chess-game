
# Modelo de dominio

## 1. Objetivo

Definir los elementos principales que representan una partida de ajedrez, sus responsabilidades, estados e invariantes.

Las decisiones de arquitectura e integración se consultan en las [referencias](#9-referencias).

Este documento precisa los [requisitos funcionales de la versión local](requirements/functional-requirements.md). El dominio está implementado en [src/domain/game.js](../src/domain/game.js), con pruebas en [tests/domain/game.test.js](../tests/domain/game.test.js). Los nombres de los datos son conceptuales y no obligan a crear una clase por concepto.

## 2. Elementos del dominio

### 2.1. Game

Representa una partida de ajedrez y gestiona su estado actual.

**Responsabilidades:**

- Iniciar y reiniciar una partida.
- Consultar el estado actual.
- Obtener el turno del jugador actual.
- Gestionar las solicitudes de movimiento.
- Determinar si la partida ha terminado.
- Mantener una solicitud de promoción pendiente y resolverla con la pieza elegida.
- Proporcionar el resultado y los motivos de rechazo de las operaciones.

La validación de los movimientos y las reglas específicas del ajedrez se delegan a `chess.js`.

### 2.2. Player

Representa a uno de los dos jugadores de la partida.

**Atributos principales:**

- `color`: identifica al jugador como blanco o negro.

No necesita gestionar cuentas ni información personal, ya que la primera versión está orientada a dos jugadores en una misma computadora.

### 2.3. Move

Representa un movimiento realizado durante la partida.

La información puede incluir:

- Casilla de origen.
- Casilla de destino.
- Pieza involucrada.
- Notación del movimiento.
- Pieza elegida para promoción, cuando corresponda.

Una solicitud de movimiento expresa una intención; solo un movimiento legal completado se incorpora al historial. Una promoción pendiente todavía no es un movimiento realizado.

## 3. Relaciones entre los elementos

- Una partida contempla dos jugadores: uno con las blancas y otro con las negras.
- Una partida mantiene el estado y la secuencia de movimientos.
- El estado determina el turno actual y si todavía es posible realizar movimientos.
- Los movimientos deben cumplir las reglas del ajedrez gestionadas por `chess.js`.

## 4. Límites del dominio

La estructura de capas y sus dependencias se definen en [architecture.md](architecture.md). Aquí se precisa la asignación de los comportamientos exigidos por los requisitos funcionales.

| Responsabilidad | Capa responsable |
| --- | --- |
| Posición, turno, historial, legalidad y condiciones de finalización | Dominio, con las reglas proporcionadas por `chess.js`. |
| Promoción pendiente, opciones legales y aplicación de la elección | Dominio. |
| Selección visual de una pieza, resaltados, clics y toques | Presentación. |
| Diálogo de promoción, textos de avisos y representación del resultado | Presentación. |
| Coordinar inicio, movimiento, elección de promoción, consulta y reinicio | Aplicación. |
| Tras un reinicio correcto, limpiar selección y avisos y cerrar el diálogo de promoción | Presentación, a partir del resultado comunicado por aplicación. |

La presentación limita la selección al color del turno, pero el dominio también rechaza solicitudes con piezas de otro color. La validez nunca depende únicamente de los controles visuales.

El dominio devuelve datos y motivos de rechazo identificables, como movimiento inválido, partida finalizada, promoción pendiente o elección de promoción inválida. La presentación convierte esos motivos en mensajes; el dominio no contiene textos de interfaz ni depende del DOM.

Las consultas exponen una representación del estado que no permite modificar directamente la partida ni la instancia de `chess.js`. Los turnos, el jaque y los resultados se obtienen de una misma posición validada, evitando mantener versiones independientes de esos datos en cada capa.

## 5. Estado de la partida

**Relacionados:** RF-01, RF-02, RF-04, RF-05, RF-06 y RF-07.

Antes de iniciar no existe una partida activa: esta ausencia la gestiona la aplicación. Una instancia de `Game` representa una partida ya iniciada. Solicitar movimientos sin partida se rechaza desde aplicación.

| Dato conceptual | Significado |
| --- | --- |
| Estado | `en_curso` o `finalizada`. |
| Posición | Distribución de piezas y datos de reglas necesarios: derechos de enroque, captura al paso y contadores. |
| Turno | Color al que corresponde mover en la posición actual. Tras finalizar se conserva como dato de esa posición, sin habilitar movimientos. |
| Jaque | Indica si el rey del color del turno está en jaque. No constituye por sí solo un estado de finalización. |
| Historial | Secuencia ordenada de movimientos legales completados. |
| Promoción pendiente | Ausente o solicitud legal pendiente de elegir pieza. Solo puede existir durante una partida en curso. |
| Resultado | Ausente durante la partida y obligatorio cuando está finalizada. |

### 5.1. Transiciones

La implementación expone `status` como `in_progress` o `finished`, `turn` como `white` o `black`, y `position` en formato FEN para conservar los datos de reglas. `board` contiene las ocho filas del tablero, desde la fila 8 hasta la 1, con casillas vacías como `null` y piezas con `square`, `type` y `color`. Las piezas usan los códigos del motor (`p`, `n`, `b`, `r`, `q`, `k`; colores `w` y `b`). `history` contiene movimientos confirmados con origen, destino, color, pieza y notación SAN, además de captura o promoción cuando corresponde. `pendingPromotion` y `result` son `null` cuando están ausentes.

`Game` admite una posición FEN inicial para preparar casos de prueba; la capa de aplicación siempre crea la posición estándar y no ofrece importación de partidas.

| Situación y operación | Estado posterior |
| --- | --- |
| Iniciar sin partida | Partida en curso, posición inicial estándar con 32 piezas, turno de blancas, historial vacío, sin jaque, promoción ni resultado. |
| Iniciar cuando ya existe partida o reiniciar | Se restaura completamente el mismo estado inicial, incluyendo los datos de reglas. |
| Completar un movimiento legal sin condición terminal | Se actualizan posición e historial, cambia el turno y se consulta si hay jaque; continúa en curso. |
| Solicitar un movimiento legal que requiere elegir promoción | Se registra la solicitud pendiente sin confirmar el movimiento ni cambiar posición, turno o historial. |
| Resolver una promoción con una opción legal | Se completa el movimiento y se evalúa el estado resultante igual que en cualquier movimiento aceptado. |
| Completar un movimiento que produce mate o tablas | Se actualizan posición e historial y la partida pasa a finalizada con su resultado. |
| Rechazar una operación | Se conserva el estado anterior, incluida cualquier promoción pendiente. |

## 6. Resultado de la partida

**Relacionado:** RF-06.

El resultado contiene un tipo, un motivo y, únicamente en caso de victoria, un color ganador.

| Tipo | Motivo | Ganador |
| --- | --- | --- |
| Victoria | Jaque mate | Color contrario al que queda en jaque mate. |
| Tablas | Ahogado | Ninguno. |
| Tablas | Material insuficiente | Ninguno. |
| Tablas | Triple repetición | Ninguno. |
| Tablas | Regla de los cincuenta movimientos | Ninguno. |

Tras cada movimiento completado, el dominio consulta las condiciones del motor. Para comunicar un motivo único, se evalúa primero jaque mate y después ahogado, material insuficiente, triple repetición y cincuenta movimientos, en ese orden. Si coinciden condiciones de tablas, se informa la primera de esa lista. Esta prioridad de presentación del motivo es una decisión del producto.

Las tablas se aplican automáticamente, según RF-06, sin reclamación del jugador. No se contemplan abandono, acuerdos de tablas ni resultados por reloj. La posición final y el resultado se conservan hasta iniciar o reiniciar.

## 7. Promoción

**Relacionado:** RF-04.

1. El dominio comprueba con el motor que existe una promoción legal para el origen y destino solicitados. Alcanzar la última fila por sí solo no basta si el movimiento es ilegal.
2. Registra una promoción pendiente con origen, destino, color y opciones legales entre dama, torre, alfil y caballo. Conserva la posición anterior hasta recibir la elección; no aplica una dama automáticamente ni registra un movimiento provisional.
3. Mientras la elección está pendiente, rechaza nuevas solicitudes de movimiento. Se permiten la consulta, la resolución de la promoción y el reinicio, incluido iniciar otra partida.
4. Una elección inválida, o una elección sin promoción pendiente, se rechaza sin modificar el estado. La selección válida debe corresponder a la solicitud pendiente.
5. Con una elección válida, aplica el movimiento completo en una sola operación: desplaza el peón, resuelve una captura si corresponde y coloca la pieza elegida. Registra un único movimiento, cambia el turno una sola vez, elimina la solicitud pendiente y evalúa jaque y finalización.

La presentación puede indicar el destino solicitado, pero debe distinguir esa indicación de la posición confirmada. El reinicio descarta la solicitud pendiente; no se añade un caso de uso de cancelación de promoción en esta versión.

## 8. Invariantes

Estas condiciones deben mantenerse después de cada operación pública del dominio.

| Regla | Requisitos relacionados |
| --- | --- |
| Hay dos colores participantes, blancas y negras; solo el color del turno puede realizar un movimiento. | RF-01, RF-02 |
| Un movimiento confirmado es legal según el motor y no deja al propio rey en jaque. | RF-03 |
| Un rechazo conserva posición, turno, historial, derechos de enroque, captura al paso, contadores, resultado y promoción pendiente. | RF-03, RF-04 |
| Cada movimiento completado añade una sola entrada al historial y consume un solo turno, incluidos enroque, captura al paso y promoción. | RF-02, RF-04 |
| Enroque y captura al paso actualizan todas las piezas afectadas antes de exponer el nuevo estado. | RF-04 |
| Una promoción pendiente pertenece al color del turno, no altera la posición confirmada y bloquea otros movimientos. | RF-04 |
| Una partida en curso no tiene resultado; una finalizada tiene resultado y no tiene promoción pendiente. | RF-04, RF-06 |
| El jaque permite continuar si hay respuestas legales; el mate finaliza la partida. | RF-05, RF-06 |
| Una partida finalizada no acepta movimientos ni elecciones de promoción y conserva su posición y resultado hasta el reinicio. | RF-06 |
| Reiniciar restaura posición inicial, turno de blancas, historial vacío y datos iniciales de reglas; elimina resultado y promoción pendiente. | RF-01, RF-07 |

## 9. Referencias

- [Requisitos funcionales y alcance de la versión local](requirements/functional-requirements.md).
- [Arquitectura: responsabilidades generales y reglas de dependencia](architecture.md).
- [ADR-001: elección de arquitectura en capas y criterio para incorporar abstracciones](adr/001-layered-architecture.md).
- [ADR-002: elección de chess.js y reutilización de sus estructuras](adr/002-chess-rules-library.md).
