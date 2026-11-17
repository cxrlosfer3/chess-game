# Decisiones arquitectónicas

Los registros de decisiones arquitectónicas (ADR) explican por qué se adoptó una decisión relevante y cuáles son sus consecuencias.

## Índice

| ADR | Decisión | Estado |
| --- | --- | --- |
| [001](001-layered-architecture.md) | Adoptar una arquitectura en capas | Aceptada |
| [002](002-chess-rules-library.md) | Utilizar chess.js para las reglas del ajedrez | Aceptada |

## Convenciones

- Numerar los registros de forma consecutiva y utilizar nombres descriptivos.
- Incluir estado, contexto, decisión y consecuencias.
- Utilizar los estados Propuesta, Aceptada, Rechazada o Sustituida.
- Si una decisión aceptada cambia, crear un nuevo ADR y enlazarlo desde el anterior, conservando el contexto histórico.

Estos primeros registros formalizan las decisiones ya descritas en la [arquitectura](../architecture.md) y el [modelo de dominio](../domain-model.md); su aceptación no implica que estén implementadas.
