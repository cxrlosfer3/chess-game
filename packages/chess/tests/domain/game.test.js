import { describe, expect, it } from 'vitest';
import { Game } from '../../src/domain/game.js';

const initialPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const play = (game, moves) => {
  for (const [from, to] of moves) expect(game.makeMove(from, to).status).toBe('COMPLETED');
};
const pieceAt = (game, square) => game.getState().board.flat().find((piece) => piece?.square === square);
const promotionPosition = '7k/P7/8/8/8/8/8/7K w - - 0 1';

describe('Game', () => {
  it.each([['g8', 'f8', 'h8'], ['c8', 'd8', 'a8']])(
    'castles black to %s and clears both origin squares', (to, rookTo, rookFrom) => {
      const game = new Game('r3k2r/8/8/8/8/8/8/R3K2R b KQkq - 0 1');
      const response = game.makeMove('e8', to);
      expect(response.status).toBe('COMPLETED');
      expect(pieceAt(game, 'e8')).toBeUndefined();
      expect(pieceAt(game, rookFrom)).toBeUndefined();
      expect(pieceAt(game, to)).toMatchObject({ type: 'k', color: 'b' });
      expect(pieceAt(game, rookTo)).toMatchObject({ type: 'r', color: 'b' });
      expect(response.gameState.turn).toBe('white');
      expect(response.gameState.history).toHaveLength(1);
    });

  it.each([
    ['castling while in check', 'k3r3/8/8/8/8/8/8/4K2R w K - 0 1', 'e1', 'g1'],
    ['castling onto an attacked square', 'k5r1/8/8/8/8/8/8/4K2R w K - 0 1', 'e1', 'g1'],
    ['castling through an occupied square', 'k7/8/8/8/8/8/8/4KB1R w K - 0 1', 'e1', 'g1'],
    ['en passant exposing the king', 'k3r3/8/8/3pP3/8/8/8/4K3 w - d6 0 1', 'e5', 'd6'],
  ])('rejects %s without changing any state', (_, fen, from, to) => {
    const game = new Game(fen);
    const before = game.getState();
    expect(game.makeMove(from, to)).toEqual({ status: 'REJECTED', reason: 'INVALID_MOVE', gameState: before });
    expect(game.getState()).toEqual(before);
  });

  it.each([
    [['e1', 'f1'], ['e8', 'f8'], ['f1', 'e1'], ['f8', 'e8']],
    [['h1', 'h2'], ['h8', 'h7'], ['h2', 'h1'], ['h7', 'h8']],
  ])('does not restore castling rights when a king or rook returns', (first, second, third, fourth) => {
    const game = new Game('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
    play(game, [first, second, third, fourth]);
    const before = game.getState();
    expect(game.makeMove('e1', 'g1').reason).toBe('INVALID_MOVE');
    expect(game.getState()).toEqual(before);
    expect(game.reset().gameState).toEqual(new Game().getState());
  });

  it('preserves the en passant opportunity across a rejected attempt', () => {
    const game = new Game();
    play(game, [['e2', 'e4'], ['a7', 'a6'], ['e4', 'e5'], ['d7', 'd5']]);
    const before = game.getState();
    expect(game.makeMove('e5', 'e7').reason).toBe('INVALID_MOVE');
    expect(game.getState()).toEqual(before);
    expect(game.makeMove('e5', 'd6').status).toBe('COMPLETED');
    expect(pieceAt(game, 'd5')).toBeUndefined();
  });

  it('captures en passant with black in one turn', () => {
    const game = new Game('7k/8/8/8/3Pp3/8/8/K7 b - d3 0 2');
    const response = game.makeMove('e4', 'd3');
    expect(response.status).toBe('COMPLETED');
    expect(pieceAt(game, 'd4')).toBeUndefined();
    expect(pieceAt(game, 'e4')).toBeUndefined();
    expect(pieceAt(game, 'd3')).toMatchObject({ type: 'p', color: 'b' });
    expect(response.gameState.turn).toBe('white');
    expect(response.gameState.history).toHaveLength(1);
  });

  it('keeps the fifty-move counter intact on rejection and resets all counters on restart', () => {
    const game = new Game('7k/8/8/8/8/8/8/R6K w - - 99 50');
    const before = game.getState();
    expect(game.makeMove('a1', 'b2').reason).toBe('INVALID_MOVE');
    expect(game.getState()).toEqual(before);
    expect(game.makeMove('a1', 'a2').gameState.result?.reason).toBe('fifty_move_rule');
    expect(game.reset().gameState).toEqual(new Game().getState());
  });

  it.each([
    ['7k/8/8/8/8/8/P7/R6K w - - 99 1', 'a2', 'a3'],
    ['7k/8/8/8/8/8/r7/R6K w - - 99 1', 'a1', 'a2'],
  ])('resets the fifty-move counter after pawn movement or capture', (fen, from, to) => {
    const game = new Game(fen);
    expect(game.makeMove(from, to).gameState).toMatchObject({ status: 'in_progress', result: null });
    expect(game.getState().position.split(' ')[4]).toBe('0');
  });

  it('prioritizes checkmate over the fifty-move threshold', () => {
    const game = new Game('7k/8/5KQ1/8/8/8/8/8 w - - 99 1');
    expect(game.makeMove('g6', 'g7').gameState.result).toEqual({ type: 'win', reason: 'checkmate', winner: 'white' });
  });

  it('starts with 32 pieces, white to move and no result', () => {
    const state = new Game().getState();
    expect(state.position).toBe(initialPosition);
    expect(state.board.flat().filter(Boolean)).toHaveLength(32);
    expect(state).toMatchObject({ status: 'in_progress', turn: 'white', inCheck: false,
      history: [], pendingPromotion: null, result: null });
  });

  it('moves, alternates turns and records captures', () => {
    const game = new Game();
    play(game, [['e2', 'e4'], ['d7', 'd5'], ['e4', 'd5']]);
    expect(game.getState().turn).toBe('black');
    expect(game.getState().history).toHaveLength(3);
    expect(game.getState().history[2]).toMatchObject({ from: 'e4', to: 'd5', captured: 'p', san: 'exd5' });
    expect(pieceAt(game, 'd5')).toMatchObject({ type: 'p', color: 'w' });
    expect(game.getState().board.flat().filter(Boolean)).toHaveLength(31);
  });

  it.each([[undefined, undefined], [null, 'e4'], [42, 'e4'], ['z2', 'e4'],
    ['e2', 'e5'], ['e7', 'e5'], ['e3', 'e4'], ['e2', 'e2']])(
    'rejects invalid input or movement %s -> %s without mutation', (from, to) => {
      const game = new Game();
      const before = game.getState();
      expect(game.makeMove(from, to)).toEqual({ status: 'REJECTED', reason: 'INVALID_MOVE', gameState: before });
      expect(game.getState()).toEqual(before);
      expect(game.makeMove('e2', 'e4').status).toBe('COMPLETED');
    });

  it('rejects exposing the king and allows a legal response', () => {
    const game = new Game('4r1k1/8/8/8/8/8/4R3/4K3 w - - 0 1');
    const before = game.getState();
    expect(game.makeMove('e2', 'd2').reason).toBe('INVALID_MOVE');
    expect(game.getState()).toEqual(before);
    expect(game.makeMove('e2', 'e8').status).toBe('COMPLETED');
  });

  it('reports check without finishing and requires it to be resolved', () => {
    const game = new Game('4k3/8/8/8/8/8/8/R3K3 w - - 0 1');
    expect(game.makeMove('a1', 'a8').gameState).toMatchObject({ inCheck: true, status: 'in_progress', result: null });
    expect(game.makeMove('e8', 'd8').reason).toBe('INVALID_MOVE');
    expect(game.makeMove('e8', 'e7').gameState.inCheck).toBe(false);
  });

  it.each([['g1', 'f1'], ['c1', 'd1']])('castles to %s in one turn', (to, rookTo) => {
    const game = new Game('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
    expect(game.makeMove('e1', to).status).toBe('COMPLETED');
    expect(pieceAt(game, to)?.type).toBe('k');
    expect(pieceAt(game, rookTo)?.type).toBe('r');
    expect(game.getState()).toMatchObject({ turn: 'black' });
    expect(game.getState().history).toHaveLength(1);
  });

  it.each(['r3k2r/8/8/8/8/8/8/R3K2R w - - 0 1',
    'r3kr1r/8/8/8/8/8/8/R3K2R w KQ - 0 1'])('rejects forbidden castling', (fen) => {
    const game = new Game(fen);
    const before = game.getState();
    expect(game.makeMove('e1', 'g1').reason).toBe('INVALID_MOVE');
    expect(game.getState()).toEqual(before);
  });

  it('captures en passant and removes the captured pawn', () => {
    const game = new Game();
    play(game, [['e2', 'e4'], ['a7', 'a6'], ['e4', 'e5'], ['d7', 'd5'], ['e5', 'd6']]);
    expect(pieceAt(game, 'd5')).toBeUndefined();
    expect(pieceAt(game, 'd6')).toMatchObject({ type: 'p', color: 'w' });
    expect(game.getState().history).toHaveLength(5);
  });

  it('rejects en passant after its opportunity has expired', () => {
    const game = new Game();
    play(game, [['e2', 'e4'], ['a7', 'a6'], ['e4', 'e5'], ['d7', 'd5'], ['h2', 'h3'], ['a6', 'a5']]);
    const before = game.getState();
    expect(game.makeMove('e5', 'd6').reason).toBe('INVALID_MOVE');
    expect(game.getState()).toEqual(before);
  });

  it.each([['queen', 'q'], ['rook', 'r'], ['bishop', 'b'], ['knight', 'n']])(
    'promotes to %s only after selection', (choice, symbol) => {
      const game = new Game(promotionPosition);
      const before = game.getState();
      expect(game.makeMove('a7', 'a8').status).toBe('PROMOTION_PENDING');
      const pending = game.getState();
      expect(pending).toMatchObject({ position: before.position, turn: 'white', history: [],
        pendingPromotion: { from: 'a7', to: 'a8', color: 'white', options: ['queen', 'rook', 'bishop', 'knight'] } });
      expect(game.makeMove('h1', 'g1').reason).toBe('PROMOTION_PENDING');
      expect(game.resolvePromotion('king').reason).toBe('INVALID_PROMOTION_CHOICE');
      expect(game.resolvePromotion().reason).toBe('INVALID_PROMOTION_CHOICE');
      expect(game.getState()).toEqual(pending);
      expect(game.resolvePromotion(choice).status).toBe('COMPLETED');
      expect(pieceAt(game, 'a8')).toMatchObject({ type: symbol, color: 'w' });
      expect(game.getState()).toMatchObject({ turn: 'black', pendingPromotion: null });
      expect(game.getState().history).toHaveLength(1);
    });

  it('handles black capture promotion atomically', () => {
    const game = new Game('7k/8/8/8/8/8/p7/1R5K b - - 0 1');
    expect(game.makeMove('a2', 'b1').status).toBe('PROMOTION_PENDING');
    expect(pieceAt(game, 'b1')?.color).toBe('w');
    game.resolvePromotion('queen');
    expect(pieceAt(game, 'a2')).toBeUndefined();
    expect(pieceAt(game, 'b1')).toMatchObject({ type: 'q', color: 'b' });
    expect(game.getState().history[0]).toMatchObject({ captured: 'r', promotion: 'q' });
    expect(game.getState().turn).toBe('white');
  });

  it('does not create a pending promotion for an illegal move', () => {
    const game = new Game('r6k/1P6/8/8/8/8/8/K7 w - - 0 1');
    const before = game.getState();
    expect(game.makeMove('b7', 'b8').reason).toBe('INVALID_MOVE');
    expect(game.getState()).toEqual(before);
  });

  it('rejects promotion selection when none is pending', () => {
    expect(new Game().resolvePromotion('queen').reason).toBe('NO_PENDING_PROMOTION');
  });

  it('detects mate, preserves the final state and permits restart', () => {
    const game = new Game();
    play(game, [['f2', 'f3'], ['e7', 'e5'], ['g2', 'g4'], ['d8', 'h4']]);
    const final = game.getState();
    expect(final).toMatchObject({ status: 'finished', result: { type: 'win', reason: 'checkmate', winner: 'black' } });
    expect(game.makeMove('e2', 'e4').reason).toBe('GAME_FINISHED');
    expect(game.resolvePromotion('queen').reason).toBe('GAME_FINISHED');
    expect(game.getState()).toEqual(final);
    expect(game.reset().gameState).toEqual(new Game().getState());
  });

  it.each([
    ['7k/5K2/8/6Q1/8/8/8/8 w - - 0 1', 'g5', 'g6', 'stalemate'],
    ['7k/8/8/8/8/8/1r6/K7 w - - 0 1', 'a1', 'b2', 'insufficient_material'],
    ['7k/8/8/8/8/8/8/R6K w - - 99 1', 'a1', 'a2', 'fifty_move_rule'],
  ])('detects a draw after a move: %s', (fen, from, to, reason) => {
    const game = new Game(fen);
    expect(game.makeMove(from, to).gameState).toMatchObject({
      status: 'finished', result: { type: 'draw', reason },
    });
    const final = game.getState();
    expect(final.result).not.toHaveProperty('winner');
    expect(game.makeMove('h8', 'h7').reason).toBe('GAME_FINISHED');
    expect(game.getState()).toEqual(final);
  });

  it('applies threefold repetition automatically and clears repetition on reset', () => {
    const game = new Game();
    const cycle = [['g1', 'f3'], ['g8', 'f6'], ['f3', 'g1'], ['f6', 'g8']];
    play(game, [...cycle, ...cycle]);
    expect(game.getState().result).toEqual({ type: 'draw', reason: 'threefold_repetition' });
    game.reset();
    play(game, cycle);
    expect(game.getState().result).toBeNull();
  });

  it('evaluates mate after completing promotion', () => {
    const game = new Game('7k/5KP1/8/8/8/8/8/8 w - - 0 1');
    game.makeMove('g7', 'g8');
    expect(game.resolvePromotion('queen').gameState.result).toEqual({ type: 'win', reason: 'checkmate', winner: 'white' });
  });

  it('resets pending promotion and all rule data', () => {
    const game = new Game(promotionPosition);
    game.makeMove('a7', 'a8');
    expect(game.reset().gameState).toEqual(new Game().getState());
    expect(game.makeMove('e2', 'e4').status).toBe('COMPLETED');
    expect(game.reset().gameState.position).toBe(initialPosition);
  });

  it('returns detached snapshots, including promotion options and history', () => {
    const game = new Game();
    game.makeMove('e2', 'e4');
    const expected = game.getState();
    const snapshot = game.getState();
    snapshot.board.flat().find(Boolean).type = 'q';
    snapshot.history[0].from = 'a1';
    snapshot.history.push({});
    expect(game.getState()).toEqual(expected);
    const promotion = new Game(promotionPosition);
    promotion.makeMove('a7', 'a8');
    promotion.getState().pendingPromotion.options.length = 0;
    expect(promotion.resolvePromotion('queen').status).toBe('COMPLETED');
  });
});
