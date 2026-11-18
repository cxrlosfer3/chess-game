import { describe, expect, it } from 'vitest';
import { GameService } from '../../src/application/game-service.js';

const play = (service, moves) => {
  for (const [from, to] of moves) expect(service.makeMove(from, to).status).toBe('COMPLETED');
};
const reachPromotion = (service) => {
  service.startGame();
  play(service, [['a2', 'a4'], ['h7', 'h5'], ['a4', 'a5'], ['h5', 'h4'],
    ['a5', 'a6'], ['h4', 'h3'], ['a6', 'b7'], ['h3', 'g2']]);
  return service.makeMove('b7', 'a8');
};

describe('GameService', () => {
  it('queries legal destinations through the application without modifying the game', () => {
    const service = new GameService();
    expect(service.getLegalMoves('e2')).toEqual([]);
    service.startGame();
    const before = service.getGameState();
    expect(service.getLegalMoves('e2').map((move) => move.to)).toEqual(['e3', 'e4']);
    expect(service.getGameState()).toEqual(before);
    service.makeMove('e2', 'e4');
    expect(service.getLegalMoves('e4')).toEqual([]);
    expect(service.getLegalMoves('e7').map((move) => move.to)).toEqual(['e6', 'e5']);
  });

  it('reports check, preserves state after an illegal response and allows resolving it', () => {
    const service = new GameService();
    service.startGame();
    play(service, [['e2', 'e4'], ['f7', 'f6'], ['d1', 'h5']]);
    const checked = service.getGameState();
    expect(checked).toMatchObject({ turn: 'black', inCheck: true, status: 'in_progress', result: null });
    expect(service.makeMove('a7', 'a6')).toEqual({ status: 'REJECTED', reason: 'INVALID_MOVE', gameState: checked });
    expect(service.getGameState()).toEqual(checked);
    expect(service.makeMove('g7', 'g6')).toMatchObject({ status: 'COMPLETED', gameState: { inCheck: false, turn: 'white' } });
  });

  it('preserves state and prioritizes missing promotion over an invalid choice', () => {
    const service = new GameService();
    service.startGame();
    service.makeMove('e2', 'e4');
    const before = service.getGameState();
    expect(service.resolvePromotion('king')).toEqual({
      status: 'REJECTED', reason: 'NO_PENDING_PROMOTION', gameState: before,
    });
    expect(service.getGameState()).toEqual(before);
    expect(service.makeMove('e7', 'e5').status).toBe('COMPLETED');
  });

  it('returns absence on query and rejects changes before starting', () => {
    const service = new GameService();
    expect(service.getGameState()).toBeNull();
    for (const response of [service.makeMove(), service.resolvePromotion(), service.resetGame()]) {
      expect(response).toEqual({ status: 'REJECTED', reason: 'GAME_NOT_STARTED', gameState: null });
    }
  });

  it('starts, moves, rejects and restarts with consistent responses', () => {
    const service = new GameService();
    const initial = service.startGame();
    expect(initial.status).toBe('COMPLETED');
    expect(initial).not.toHaveProperty('reason');
    expect(service.makeMove('e2', 'e4').gameState.turn).toBe('black');
    const before = service.getGameState();
    expect(service.makeMove('e2', 'e5')).toEqual({ status: 'REJECTED', reason: 'INVALID_MOVE', gameState: before });
    expect(service.makeMove('e7', 'e5').status).toBe('COMPLETED');
    expect(service.startGame()).toEqual(initial);
    service.makeMove('d2', 'd4');
    expect(service.resetGame()).toEqual(initial);
  });

  it('coordinates promotion without auto-selecting a piece', () => {
    const service = new GameService();
    const response = reachPromotion(service);
    expect(response.status).toBe('PROMOTION_PENDING');
    expect(response).not.toHaveProperty('reason');
    expect(response.gameState.history).toHaveLength(8);
    expect(response.gameState.pendingPromotion).toMatchObject({ from: 'b7', to: 'a8' });
    expect(service.makeMove().reason).toBe('PROMOTION_PENDING');
    expect(service.resolvePromotion('king').reason).toBe('INVALID_PROMOTION_CHOICE');
    expect(service.getGameState()).toEqual(response.gameState);
    const completed = service.resolvePromotion('rook');
    expect(completed.status).toBe('COMPLETED');
    expect(completed.gameState).toMatchObject({ turn: 'black', pendingPromotion: null });
    expect(completed.gameState.history).toHaveLength(9);
    expect(service.resolvePromotion('queen').reason).toBe('NO_PENDING_PROMOTION');
  });

  it.each(['startGame', 'resetGame'])('%s discards a pending promotion', (operation) => {
    const service = new GameService();
    const initial = service.startGame().gameState;
    reachPromotion(service);
    expect(service[operation]().gameState).toEqual(initial);
    expect(service.resolvePromotion('queen').reason).toBe('NO_PENDING_PROMOTION');
    expect(service.makeMove('e2', 'e4').status).toBe('COMPLETED');
  });

  it('reports the winner, prioritizes finished-game rejections and restarts', () => {
    const service = new GameService();
    const initial = service.startGame();
    play(service, [['f2', 'f3'], ['e7', 'e5'], ['g2', 'g4'], ['d8', 'h4']]);
    const final = service.getGameState();
    expect(final.result).toEqual({ type: 'win', reason: 'checkmate', winner: 'black' });
    expect(service.makeMove().reason).toBe('GAME_FINISHED');
    expect(service.resolvePromotion().reason).toBe('GAME_FINISHED');
    expect(service.getGameState()).toEqual(final);
    expect(service.startGame()).toEqual(initial);
  });

  it('reports automatic draws and clears the result on reset', () => {
    const service = new GameService();
    const initial = service.startGame();
    const cycle = [['g1', 'f3'], ['g8', 'f6'], ['f3', 'g1'], ['f6', 'g8']];
    play(service, [...cycle, ...cycle]);
    expect(service.getGameState().result).toEqual({ type: 'draw', reason: 'threefold_repetition' });
    expect(service.resetGame()).toEqual(initial);
  });

  it('isolates service instances and returned state', () => {
    const first = new GameService();
    const second = new GameService();
    const initial = first.startGame().gameState;
    first.makeMove('e2', 'e4');
    expect(second.getGameState()).toBeNull();
    expect(second.startGame().gameState).toEqual(initial);
    const state = first.getGameState();
    state.history.length = 0;
    expect(first.getGameState().history).toHaveLength(1);
  });
});
