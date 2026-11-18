# Requisitos funcionales

## 1. Objetivo

Permitir que dos personas jueguen una partida de ajedrez en un mismo navegador, con un tablero interactivo, movimientos válidos y un resultado identificable.

Este documento define el comportamiento esperado y los criterios para considerar terminada la primera versión. El estado de verificación se detalla en la sección 4.1; la existencia de un requisito no implica que todos sus criterios estén implementados.

## 2. Alcance

La versión contempla una sola partida local a la vez, con un jugador de blancas y otro de negras. Ambos utilizan el mismo dispositivo y alternan sus acciones sobre el tablero.

Quedan fuera de esta versión:

- Partidas contra la computadora y niveles de dificultad.
- Partidas en línea, salas y cuentas de usuario.
- Relojes, abandono y ofertas de tablas.
- Deshacer movimientos, guardar partidas e importar o exportar posiciones.
- Recuperar la partida después de recargar o cerrar la página.

## 3. Requisitos funcionales

### RF-01: Iniciar una partida

El usuario podrá iniciar una partida desde la interfaz.

**Criterios de aceptación:**

- Al iniciar, el tablero muestra las 32 piezas en su posición inicial estándar.
- Las blancas tienen el primer turno.
- La interfaz identifica el color que debe mover y muestra la partida como en curso.
- Si ya existe una partida, comenzar otra utiliza el comportamiento de reinicio definido en RF-07.

### RF-02: Seleccionar y mover piezas

El usuario podrá seleccionar una pieza y una casilla de destino mediante clic o toque.

**Criterios de aceptación:**

- Solo se pueden seleccionar piezas del color que tiene el turno.
- La selección actual se distingue visualmente y puede cambiarse por otra pieza del mismo color.
- Un movimiento legal actualiza el tablero y cede el turno al otro color.
- Una captura retira la pieza capturada del tablero.
- Seleccionar una casilla vacía sin una pieza seleccionada no cambia la partida.

### RF-03: Rechazar movimientos inválidos

El sistema validará cada intento de movimiento antes de modificar la partida.

**Criterios de aceptación:**

- Un movimiento inválido no cambia la posición, el turno ni el registro interno de movimientos.
- Se rechazan los movimientos que dejan al propio rey en jaque o no resuelven un jaque existente.
- La interfaz informa que el movimiento no es válido y permite volver a intentarlo.
- Un intento inválido no bloquea la interacción ni provoca un error sin controlar.

### RF-04: Resolver movimientos especiales

El juego admitirá enroque, captura al paso y promoción, sujetos a la validación del motor de reglas.

**Criterios de aceptación:**

- Un enroque válido mueve el rey y la torre en una sola operación y consume un turno.
- Un intento de enroque no permitido se rechaza sin modificar la partida.
- Una captura al paso válida retira el peón capturado de su casilla correspondiente; fuera de su oportunidad válida se rechaza.
- Cuando un peón alcanza la última fila, el jugador puede elegir dama, torre, alfil o caballo.
- La promoción no se completa ni cede el turno hasta que el jugador elige la pieza; mientras tanto no se aceptan otros movimientos.
- La pieza elegida aparece en el tablero y se actualiza el estado de la partida.

### RF-05: Mostrar el estado de la partida

La interfaz mostrará el turno y las situaciones relevantes después de cada movimiento aceptado.

**Criterios de aceptación:**

- Durante una partida en curso se identifica el color al que le corresponde mover.
- Si ese color está en jaque, se muestra una indicación de jaque.
- El jaque por sí solo no finaliza la partida: se permiten las respuestas legales.
- El tablero y los mensajes reflejan siempre el mismo estado de la partida.

### RF-06: Finalizar una partida

El sistema reconocerá jaque mate y tablas utilizando las reglas proporcionadas por chess.js.

Para esta versión, las tablas por ahogado, material insuficiente, triple repetición y regla de los cincuenta movimientos se aplicarán automáticamente cuando el motor las detecte. No habrá un procedimiento de reclamación; esta es una simplificación del producto para el juego local.

**Criterios de aceptación:**

- Ante jaque mate se informa la finalización y el color ganador.
- Ante tablas se informa la finalización y su motivo.
- Después de finalizar no se aceptan nuevos movimientos y se conserva la posición final.
- El resultado permanece visible hasta iniciar o reiniciar una partida.

### RF-07: Reiniciar una partida

El usuario podrá reiniciar tanto una partida en curso como una finalizada.

**Criterios de aceptación:**

- El reinicio restaura la posición inicial y el turno de blancas.
- Se eliminan los movimientos previos, el resultado, los avisos, la selección y cualquier promoción pendiente.
- Los derechos de enroque, la posibilidad de captura al paso y los contadores de tablas vuelven a su estado inicial.
- La nueva partida permite realizar movimientos sin conservar condiciones de la anterior.
## 4. Criterios de finalización de la versión

La versión local se considerará terminada cuando:

- Todos los criterios del documento de requisitos funcionales estén implementados.
- Las pruebas automatizadas comprueben inicio, turnos, movimientos legales e inválidos, movimientos especiales, finalización y reinicio, incluyendo que los rechazos no alteran el estado.
- Se verifique manualmente el flujo completo de la interfaz: iniciar, seleccionar, mover, recibir avisos, promocionar, finalizar y reiniciar.
- Se revise la presentación en escritorio y móvil.
- Se verifiquen los [escenarios EC-01 a EC-04](quality-scenarios.md) y se registren sus resultados, incluyendo la evaluación con participantes de EC-02.
- Las pruebas y la compilación terminen correctamente siguiendo las instrucciones del repositorio.
- La documentación de uso y el estado del proyecto estén actualizados.

### 4.1. Verificación sin interfaz

La suite se ejecuta con `npm test` desde la raíz, en Node.js, sin navegador ni DOM. Las pruebas comprueban la integración del dominio con `chess.js` real y los contratos de aplicación; no sustituyen la validación de la interfaz.

| Requisito | Comprobación automatizada actual | Pendiente de presentación |
| --- | --- | --- |
| RF-01 | Posición inicial, turno, estado e inicio de otra partida. | Control de inicio y visualización del estado inicial. |
| RF-02 | Movimientos, turnos, capturas y rechazo de piezas del otro color. | Clic y toque, selección visual, cambio de selección y clic en casilla vacía. |
| RF-03 | Rechazo sin mutación, protección del rey y continuación con una respuesta legal. | Aviso legible y continuidad de la interacción visual. |
| RF-04 | Enroques de ambos colores y restricciones; captura al paso, caducidad y protección del rey; cuatro elecciones de promoción, bloqueo y finalización tras promover. | Elección mediante diálogo y actualización visual de todas las piezas afectadas. |
| RF-05 | Turno y jaque consultables, respuesta legal al jaque y estado coherente en las respuestas. | Correspondencia del tablero, indicador de turno y mensajes. |
| RF-06 | Mate con ganador, cuatro motivos de tablas, bloqueo tras finalizar y conservación del resultado. | Visualización y permanencia del resultado. |
| RF-07 | Reinicio en curso, tras finalizar y con promoción pendiente; restauración de posición, historial, derechos y contadores. | Limpieza de avisos, selección y diálogo de promoción. |

Casos ejecutables: [pruebas del dominio](../../packages/chess/tests/domain/game.test.js) y [pruebas de aplicación](../../apps/web/tests/application/game-service.test.js). Esta revisión no declara terminada la versión local: siguen pendientes la interfaz, su validación manual y los escenarios de calidad que requieren participantes o cambios de presentación.

## 5. Referencias

- [Modelo de dominio](../domain-model.md).
- [ADR-001: Arquitectura en capas](../adr/001-layered-architecture.md).
- [ADR-002: Uso de chess.js](../adr/002-chess-rules-library.md).

- [Requisitos no funcionales](non-functional-requirements.md).
