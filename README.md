# Chess Game

Aplicación de ajedrez desarrollada como proyecto personal de aprendizaje, se orienta a la aplicación progresiva de tecnologías web, arquitectura de software y patrones de diseño.

## Sobre el proyecto

Chess Game es un proyecto personal que busca desarrollar una aplicación de ajedrez mediante tres etapas evolutivas:

- *Etapa 1*: Partidas locales entre dos jugadores
- *Etapa 2*: Partidas contra la computadora
- *Etapa 3*: Partidas multijugador en línea

Este repositorio representa el inicio de una etapa de formación y crecimiento profesional en ingeniería de software. Lo que se busca es comprender las tecnologías utilizadas, justificar las decisiones arquitectónicas y aplicar buenas prácticas de desarrollo a través de la experiencia práctica.

## Objetivos

- Aprender y aplicar tecnologías modernas de desarrollo web.
- Comprender los fundamentos de arquitectura de software y separación de responsabilidades
- Estudiar e implementar patrones de diseño GoF según las necesidades del sistema
- Desarrollar hábitos de documentación, pruebas y control de versiones
- Construir una aplicación que progresivamente será más compleja, sin comprometer su mantenibilidad
- Crear un protafolio que evidencie el aprendizaje, el razonamiento técnico y la evolución de las competencias adquiridas

## Plan de desarrollo

### 1. Versión 1 — Ajedrez local

* Partidas entre dos jugadores en una misma computadora
* Tablero interactivo y gestión de turnos
* Validación de movimientos y estados de la partida
* Controles para iniciar y reiniciar partidas

### 2. Versión 2 — Ajedrez contra la computadora

- Integración de un motor de ajedrez.
- Selección del color de las piezas (elección propia del jugador)
- Diferentes niveles de dificultad
- Reutilización de la lógica y los componentes desarrollados en la versión 1

### 3. Versión 3 — Ajedrez online

- Partidas entre usuarios desde diferentes computadoras.
- Creación y unión a salas
- Sincronización de movimientos en tiempo real
- Validación de movimientos y administración de partidas desde el servidor
- Despliegue de la apilcación para su acceso público

## Arquitectura y diseño

El proyecto seguirá una evolución arquitectónica incremental, se priorizará la separación de responsabilidades y la mantenibilidad (PRINCIPIOS SOLID).

**Enfoques arquitectónicos**

- Arquitectura en capas
- Principios de arquitectura hexagonal

**Patrones de diseño**

- Facade
- Command
- Observer
- Strategy
- Adapter
- State

Los patrones de incorporarán cuando exista una necesidad concreta que justifique su uso.

Su implementación y las decisiones arquitectónicas relevantes de documentarán durante el desarrollo

Toda la documentación técnica se realizará en docs/

## Tecnologías previstas

| Tecnología  | Propósito                                              |
| ------------ | ------------------------------------------------------- |
| React        | Para la construcción de la interfaz de usuario         |
| Vite         | Entorno de desarrollo para la compilación del frontend |
| Tailwind CSS | Estilizado de la interfaz                               |
| chess.js     | Validación de movimientos y reglas del ajedrez         |
| Stockfish    | Motor de ajedrez para jugar contra la computadora       |
| Node.js      | Entorno de ejecución del backend                       |
| Express      | Desarrollo de la API y servicios del servidor           |
| Git y Github | Control de versiones y publicación del proyecto        |

## Documentación

La documentación del proyecto incluirá:

- **docs/architecture.md**: estructura arquitectónica y resposabilidades de los componentes
- **docs/design-patterns.md**: justificación y aplicación de los patrones de diseño
- **docs/adr/**: registros de las decisiones arquitectónicas relevantes

## Filosofía de desarrollo

El proyecto se guiará por tres principios:

- Comprender antes de acumular, priorizar el entendimiento de las tecnologías sobre su uso superficial
- Justificación antes de implementar, elegir arquitecturas y patrones por sus beneficios concretos, no por la cantidad de conceptos aplicados
- Evolucionar sin sobrediseñar, construir una base sencilla y ampliarla a medida que aparezcan nuevos requisitos

## Estado del proyecto

```Markdown
Etapa actual: definición y documentación del diseño arquitectónico.
```
