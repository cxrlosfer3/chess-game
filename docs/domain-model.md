
# Modelo de dominio

## 1. Objetivo

Definir los elementos principales que representan una partida de ajedrez, sus responsabilidades y las decisiones de diseño que orientarán su implementación.

El modelo sigue la arquitectura en capas de Chess Game, priorizando la separación de responsabilidades y evitando complejidad innecesaria.

## 2. Elementos del dominio

### 2.1. Game

Representa una partida de ajedrez y gestiona su estado actual.

**Responsabilidades:**

- Iniciar y reiniciar una partida.
- Consultar el estado actual.
- Obtener el turno del jugador actual.
- Gestionar las solicitudes de movimiento.
- Determinar si la partida ha terminado.

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

Su representación concreta dependerá de la información proporcionada por `chess.js`. No será necesario crear una clase independiente si la estructura existente resulta suficiente.

## 3. Gestión de las reglas del ajedrez

`chess.js` proporcionará la lógica necesaria para validar movimientos y determinar condiciones como jaque, jaque mate y tablas.

El dominio utilizará las operaciones del motor para gestionar la partida, evitando duplicar las reglas del ajedrez.

## 4. Relaciones entre los elementos

- Una partida contempla dos jugadores: uno con las blancas y otro con las negras.
- Una partida mantiene el estado y la secuencia de movimientos.
- El estado determina el turno actual y si todavía es posible realizar movimientos.
- Los movimientos deben cumplir las reglas del ajedrez gestionadas por `chess.js`.

## 5. Uso de clases, interfaces y abstracciones

La implementación utilizará estos recursos cuando aporten una ventaja concreta al diseño.

### 5.1. Clases

Se crearán clases cuando sea útil representar un concepto que agrupe estado y comportamiento, como una partida.

No todos los elementos del dominio necesitan convertirse en clases. Se podrán utilizar funciones y estructuras de datos simples cuando sean suficientes.

### 5.2. Interfaces

Se introducirán interfaces únicamente cuando exista una necesidad real de definir un contrato entre componentes o intercambiar implementaciones.

No se crearán interfaces por cada clase ni se añadirán contratos que no aporten utilidad a la versión actual.

### 5.3. Abstracciones

Las abstracciones se utilizarán para reducir el acoplamiento y ocultar detalles de implementación cuando esto facilite el mantenimiento o permita una sustitución necesaria.

No se introducirán abstracciones para anticipar escenarios hipotéticos ni para aplicar patrones de diseño sin una justificación concreta.

## 6. Relación con la arquitectura en capas

- **Presentación:** muestra el tablero, las piezas, los turnos y el estado de la partida. Comunica las acciones del jugador a la capa de aplicación.
- **Aplicación:** coordina los casos de uso, como iniciar una partida, realizar un movimiento y reiniciar el juego.
- **Dominio:** gestiona el estado y las reglas de la partida, utilizando `chess.js` para las operaciones propias del ajedrez.

La presentación no implementará reglas del juego ni accederá directamente al motor. La aplicación coordinará las operaciones sin duplicar la lógica del dominio.

## 7. Decisiones de diseño

- Mantener un modelo de dominio sencillo, adecuado para una partida local.
- Reutilizar `chess.js` en lugar de implementar nuevamente las reglas del ajedrez.
- Separar las responsabilidades según la arquitectura en capas.
- Utilizar clases, interfaces y abstracciones solo cuando exista una necesidad justificada.
- Evitar patrones y estructuras adicionales que aumenten la complejidad sin aportar beneficios claros.

## 8. Alcance

Este modelo contempla exclusivamente las necesidades de una partida local entre dos jugadores. Los elementos y mecanismos adicionales se incorporarán cuando los requisitos de la versión actual lo justifiquen.
