# ADR-002: Utilizar chess.js para las reglas del ajedrez

## Estado

Aceptada.

## Contexto

Una partida requiere validar movimientos, gestionar turnos y reconocer situaciones como jaque, jaque mate y tablas. Implementar estas reglas desde cero ampliaría el alcance de la primera versión y exigiría verificar numerosos casos especiales.

El objetivo del proyecto es aprender desarrollo web y diseño de software mediante una aplicación de ajedrez. El modelo de dominio ya contempla delegar las reglas en chess.js.

## Decisión

Utilizar chess.js para validar movimientos y consultar el estado reglamentario de la partida, centralizando su uso en la capa de dominio.

El dominio ofrecerá las operaciones que necesita la aplicación y evitará duplicar las reglas proporcionadas por la biblioteca. La presentación no accederá directamente a chess.js.

Se podrán reutilizar estructuras de movimientos de la biblioteca cuando sean suficientes. No se crearán clases o interfaces adicionales sin una necesidad concreta.

## Consecuencias

- Se reduce la cantidad de reglas que el proyecto debe implementar por su cuenta.
- Las pruebas del proyecto deberán verificar la integración y el comportamiento de la partida, incluyendo los casos especiales relevantes.
- El dominio dependerá de la API y del comportamiento de chess.js; sus actualizaciones requerirán comprobar compatibilidad.
- Centralizar esta dependencia limita la cantidad de componentes afectados por cambios en su integración.
- Esta decisión cubre las reglas del juego; la selección de un motor para jugar contra la computadora corresponde a una etapa posterior.

## Referencias

- [Modelo de dominio](../domain-model.md).
- [ADR-001: Adoptar una arquitectura en capas](001-layered-architecture.md).
