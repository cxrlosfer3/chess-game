import { Chess } from 'chess.js';

const PROMOTIONS = { queen: 'q', rook: 'r', bishop: 'b', knight: 'n' };
const colorName = (color) => color === 'w' ? 'white' : 'black';
const isSquare = (square) => typeof square === 'string' && /^[a-h][1-8]$/.test(square);

/** A local game. Owns the rules engine and never exposes mutable engine data. */
export class Game {
  #chess;
  #pendingPromotion = null;

  /** @param {string} [fen] Internal fixture position; application always starts normally. */
  constructor(fen) {
    this.#chess = new Chess(fen);
  }

  /** Returns a detached snapshot. FEN includes castling, en passant and counters. */
  getState() {
    const result = this.#getResult();
    return {
      status: result ? 'finished' : 'in_progress',
      position: this.#chess.fen(),
      board: this.#chess.board().map((rank) => rank.map((piece) => piece ? { ...piece } : null)),
      turn: colorName(this.#chess.turn()),
      inCheck: this.#chess.isCheck(),
      history: this.#chess.history({ verbose: true }).map((move) => ({
        from: move.from,
        to: move.to,
        color: colorName(move.color),
        piece: move.piece,
        san: move.san,
        ...(move.captured ? { captured: move.captured } : {}),
        ...(move.promotion ? { promotion: move.promotion } : {}),
      })),
      pendingPromotion: this.#pendingPromotion ? {
        ...this.#pendingPromotion,
        options: [...this.#pendingPromotion.options],
      } : null,
      result,
    };
  }

  /** Legal destinations, grouped by square so promotion choices appear once. */
  getLegalMoves(from) {
    if (!isSquare(from) || this.#pendingPromotion || this.#getResult()) return [];
    const destinations = new Map();
    for (const move of this.#chess.moves({ square: from, verbose: true })) {
      destinations.set(move.to, { from: move.from, to: move.to, capture: Boolean(move.captured) });
    }
    return [...destinations.values()];
  }

  /** @param {string} from Origin square. @param {string} to Destination square. */
  makeMove(from, to) {
    if (this.#getResult()) return this.#respond('REJECTED', 'GAME_FINISHED');
    if (this.#pendingPromotion) return this.#respond('REJECTED', 'PROMOTION_PENDING');
    if (!isSquare(from) || !isSquare(to)) return this.#respond('REJECTED', 'INVALID_MOVE');

    const candidates = this.#chess.moves({ square: from, verbose: true })
      .filter((move) => move.to === to);
    if (!candidates.length) return this.#respond('REJECTED', 'INVALID_MOVE');

    if (candidates.some((move) => move.promotion)) {
      this.#pendingPromotion = {
        from,
        to,
        color: colorName(this.#chess.turn()),
        options: Object.keys(PROMOTIONS).filter((piece) =>
          candidates.some((move) => move.promotion === PROMOTIONS[piece])),
      };
      return this.#respond('PROMOTION_PENDING');
    }

    this.#chess.move({ from, to });
    return this.#respond('COMPLETED');
  }

  /** @param {'queen'|'rook'|'bishop'|'knight'} piece Promotion choice. */
  resolvePromotion(piece) {
    if (this.#getResult()) return this.#respond('REJECTED', 'GAME_FINISHED');
    if (!this.#pendingPromotion) return this.#respond('REJECTED', 'NO_PENDING_PROMOTION');
    if (!this.#pendingPromotion.options.includes(piece)) {
      return this.#respond('REJECTED', 'INVALID_PROMOTION_CHOICE');
    }
    const { from, to } = this.#pendingPromotion;
    this.#chess.move({ from, to, promotion: PROMOTIONS[piece] });
    this.#pendingPromotion = null;
    return this.#respond('COMPLETED');
  }

  reset() {
    this.#chess.reset();
    this.#pendingPromotion = null;
    return this.#respond('COMPLETED');
  }

  #respond(status, reason) {
    return { status, gameState: this.getState(), ...(reason ? { reason } : {}) };
  }

  #getResult() {
    if (this.#chess.isCheckmate()) {
      return { type: 'win', reason: 'checkmate', winner: this.#chess.turn() === 'w' ? 'black' : 'white' };
    }
    const conditions = [
      ['stalemate', () => this.#chess.isStalemate()],
      ['insufficient_material', () => this.#chess.isInsufficientMaterial()],
      ['threefold_repetition', () => this.#chess.isThreefoldRepetition()],
      ['fifty_move_rule', () => this.#chess.isDrawByFiftyMoves()],
    ];
    const condition = conditions.find(([, matches]) => matches());
    return condition ? { type: 'draw', reason: condition[0] } : null;
  }
}
