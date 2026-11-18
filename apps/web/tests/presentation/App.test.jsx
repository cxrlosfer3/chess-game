import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../src/presentation/App.jsx';
import { GameService } from '../../src/application/game-service.js';

afterEach(cleanup);

const square = (name) => screen.getByRole('button', { name: new RegExp(`^${name}:`) });
const start = async (user) => user.click(screen.getByRole('button', { name: /Iniciar partida/ }));
const play = (service, moves) => {
  for (const [from, to] of moves) expect(service.makeMove(from, to).status).toBe('COMPLETED');
};

describe('Local game interface', () => {
  it('shows legal destinations, refreshes them on selection and clears them on move or reset', async () => {
    const user = userEvent.setup();
    render(<App />);
    await start(user);
    await user.click(square('e2'));
    expect(square('e3').getAttribute('aria-description')).toBe('Movimiento disponible');
    expect(square('e4').classList.contains('legal-move')).toBe(true);
    expect(square('e5').hasAttribute('aria-description')).toBe(false);
    await user.click(square('g1'));
    expect(square('e4').hasAttribute('aria-description')).toBe(false);
    expect(square('f3').classList.contains('legal-move')).toBe(true);
    await user.click(square('g1'));
    expect(document.querySelectorAll('.move-hint')).toHaveLength(0);
    await user.click(square('e2'));
    await user.click(square('e5'));
    expect(square('e4').classList.contains('legal-move')).toBe(true);
    await user.click(square('e4'));
    expect(document.querySelectorAll('.move-hint')).toHaveLength(0);
    await user.click(square('e7'));
    expect(square('e5').classList.contains('legal-move')).toBe(true);
    await user.click(screen.getByRole('button', { name: /Reiniciar partida/ }));
    expect(document.querySelectorAll('.move-hint')).toHaveLength(0);
  });

  it('marks available captures and clears the marker after capturing', async () => {
    const user = userEvent.setup();
    const service = new GameService();
    service.startGame();
    play(service, [['e2', 'e4'], ['d7', 'd5']]);
    render(<App service={service} />);
    await user.click(square('e4'));
    expect(square('d5').getAttribute('aria-description')).toBe('Captura disponible');
    expect(square('d5').classList.contains('legal-capture')).toBe(true);
    await user.click(square('d5'));
    expect(square('d5').hasAttribute('aria-description')).toBe(false);
    expect(document.querySelectorAll('.move-hint')).toHaveLength(0);
  });

  it('starts with an explicit action and displays the initial board', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(square('e2').disabled).toBe(true);
    await start(user);
    expect(screen.getByRole('status').textContent).toBe('Turno de blancas');
    expect(square('e2').getAttribute('aria-label')).toBe('e2: Peón (blancas)');
    expect(square('e7').getAttribute('aria-label')).toBe('e7: Peón (negras)');
    expect(screen.getByRole('group', { name: 'Tablero de ajedrez' }).querySelectorAll('.piece')).toHaveLength(32);
  });

  it('ignores empty and opposing squares without a selection and allows changing selection', async () => {
    const user = userEvent.setup();
    render(<App />);
    await start(user);
    await user.click(square('e4'));
    await user.click(square('e7'));
    expect(document.querySelectorAll('[aria-pressed="true"]')).toHaveLength(0);
    await user.click(square('e2'));
    expect(square('e2').getAttribute('aria-pressed')).toBe('true');
    await user.click(square('d2'));
    expect(square('e2').getAttribute('aria-pressed')).toBe('false');
    expect(square('d2').getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('status').textContent).toBe('Turno de blancas');
  });

  it('moves by clicking origin and destination and updates turn and history', async () => {
    const user = userEvent.setup();
    render(<App />);
    await start(user);
    await user.click(square('e2'));
    await user.click(square('e4'));
    expect(square('e2').getAttribute('aria-label')).toBe('e2: vacía');
    expect(square('e4').getAttribute('aria-label')).toBe('e4: Peón (blancas)');
    expect(square('e4').getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByRole('status').textContent).toBe('Turno de negras');
    expect(screen.getByRole('cell', { name: 'e4' })).toBeTruthy();
  });

  it('supports selecting and moving with the keyboard', async () => {
    const user = userEvent.setup();
    render(<App />);
    await start(user);
    square('e2').focus();
    await user.keyboard('{Enter}');
    square('e4').focus();
    await user.keyboard(' ');
    expect(screen.getByRole('status').textContent).toBe('Turno de negras');
  });

  it('announces a rejected move and allows a legal retry', async () => {
    const user = userEvent.setup();
    const service = new GameService();
    render(<App service={service} />);
    await start(user);
    const before = service.getGameState();
    await user.click(square('e2'));
    await user.click(square('e5'));
    expect(screen.getByRole('alert').textContent).toContain('no es válido');
    expect(service.getGameState()).toEqual(before);
    expect(square('e2').getAttribute('aria-pressed')).toBe('true');
    await user.click(square('e4'));
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('status').textContent).toBe('Turno de negras');
  });

  it('shows check and allows a legal response', async () => {
    const user = userEvent.setup();
    const service = new GameService();
    service.startGame();
    play(service, [['e2', 'e4'], ['f7', 'f6'], ['d1', 'h5']]);
    render(<App service={service} />);
    expect(screen.getByRole('status').textContent).toContain('Jaque');
    await user.click(square('g7'));
    await user.click(square('g6'));
    expect(screen.getByRole('status').textContent).toBe('Turno de blancas');
  });

  it('removes a captured piece from the board', async () => {
    const user = userEvent.setup();
    const service = new GameService();
    service.startGame();
    play(service, [['e2', 'e4'], ['d7', 'd5']]);
    render(<App service={service} />);
    await user.click(square('e4'));
    await user.click(square('d5'));
    expect(square('d5').getAttribute('aria-label')).toBe('d5: Peón (blancas)');
    expect(document.querySelectorAll('.piece')).toHaveLength(31);
  });

  it('offers all promotion choices, blocks the board and completes the chosen promotion', async () => {
    const user = userEvent.setup();
    const service = new GameService();
    service.startGame();
    play(service, [['a2', 'a4'], ['h7', 'h5'], ['a4', 'a5'], ['h5', 'h4'],
      ['a5', 'a6'], ['h4', 'h3'], ['a6', 'b7'], ['h3', 'g2']]);
    render(<App service={service} />);
    await user.click(square('b7'));
    await user.click(square('a8'));
    expect(screen.getByRole('dialog', { name: 'Elige tu pieza' })).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /^Promocionar a/ })).toHaveLength(4);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Promocionar a Dama' }));
    expect(square('b7').disabled).toBe(true);
    expect(square('a8').getAttribute('aria-label')).toBe('a8: Torre (negras)');
    await user.click(screen.getByRole('button', { name: 'Promocionar a Caballo' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(square('a8').getAttribute('aria-label')).toBe('a8: Caballo (blancas)');
    expect(screen.getByRole('status').textContent).toBe('Turno de negras');
    expect(square('e7').disabled).toBe(false);
  });

  it('resets while promotion is pending', async () => {
    const user = userEvent.setup();
    const service = new GameService();
    service.startGame();
    play(service, [['a2', 'a4'], ['h7', 'h5'], ['a4', 'a5'], ['h5', 'h4'],
      ['a5', 'a6'], ['h4', 'h3'], ['a6', 'b7'], ['h3', 'g2']]);
    service.makeMove('b7', 'a8');
    render(<App service={service} />);
    await user.click(screen.getByRole('button', { name: /Reiniciar partida/ }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('status').textContent).toBe('Turno de blancas');
    expect(square('a2').disabled).toBe(false);
    expect(service.getGameState().history).toEqual([]);
  });

  it('shows the winner, disables the final board and clears the result on reset', async () => {
    const user = userEvent.setup();
    const service = new GameService();
    service.startGame();
    play(service, [['f2', 'f3'], ['e7', 'e5'], ['g2', 'g4'], ['d8', 'h4']]);
    render(<App service={service} />);
    expect(screen.getByRole('status').textContent).toBe('Jaque mate. Ganan las negras.');
    expect(square('e2').disabled).toBe(true);
    await user.click(screen.getByRole('button', { name: /Reiniciar partida/ }));
    expect(screen.getByRole('status').textContent).toBe('Turno de blancas');
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('displays a draw reason', () => {
    const service = new GameService();
    service.startGame();
    const cycle = [['g1', 'f3'], ['g8', 'f6'], ['f3', 'g1'], ['f6', 'g8']];
    play(service, [...cycle, ...cycle]);
    render(<App service={service} />);
    expect(screen.getByRole('status').textContent).toBe('Tablas por triple repetición.');
    expect(square('e2').disabled).toBe(true);
  });

  it('clears selection and warnings on restart', async () => {
    const user = userEvent.setup();
    render(<App />);
    await start(user);
    await user.click(square('e2'));
    await user.click(square('e5'));
    await user.click(screen.getByRole('button', { name: /Reiniciar partida/ }));
    expect(screen.queryByRole('alert')).toBeNull();
    expect(document.querySelectorAll('[aria-pressed="true"]')).toHaveLength(0);
    expect(screen.getByRole('status').textContent).toBe('Turno de blancas');
  });
});
