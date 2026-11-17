# ADR-001: Adoptar una arquitectura en capas

## Estado

Aceptada.

## Contexto

La primera versión permite partidas locales entre dos jugadores. El proyecto busca aprender a separar responsabilidades y facilitar las pruebas, con una base que pueda evolucionar hacia partidas contra la computadora y multijugador.

Concentrar la interfaz y la lógica de la partida en los mismos componentes dificultaría probar y reutilizar el comportamiento del juego. Una arquitectura con más abstracciones desde el inicio añadiría complejidad antes de tener necesidades concretas.

## Decisión

Organizar la aplicación en tres capas:

- **Presentación:** muestra el tablero y captura las acciones de los jugadores.
- **Aplicación:** coordina los casos de uso de iniciar, mover, consultar y reiniciar una partida.
- **Dominio:** mantiene el estado de la partida y gestiona sus reglas y turnos.

La presentación utiliza la aplicación y la aplicación utiliza el dominio. El dominio no depende de las otras capas. La presentación no accede directamente al motor de reglas.

Se incorporarán interfaces, patrones y otras abstracciones cuando exista una necesidad que justifique su uso.

## Consecuencias

- La lógica de la partida puede probarse sin depender de la interfaz.
- Los componentes visuales pueden cambiar sin trasladar las reglas del ajedrez a la presentación.
- Es necesario mantener claros los límites entre las capas y evitar duplicar responsabilidades.
- Las futuras modalidades de juego podrán requerir revisar esta organización; esta decisión no define todavía su implementación.

## Referencias

- [Arquitectura del proyecto](../architecture.md).
- [Modelo de dominio](../domain-model.md).
