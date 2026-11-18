import { Game } from '@chess-game/chess';

/** Coordinates a single local game. Operations are synchronous. */
export class GameService {
  #game = null;

  startGame() {
    if (this.#game) return this.resetGame();
    this.#game = new Game();
    return { status: 'COMPLETED', gameState: this.getGameState() };
  }

  getGameState() {
    return this.#game ? this.#game.getState() : null;
  }

  /** Read-only query; unavailable games or origins have no legal destinations. */
  getLegalMoves(from) {
    return this.#game ? this.#game.getLegalMoves(from) : [];
  }

  /** @param {string} from Origin square. @param {string} to Destination square. */
  makeMove(from, to) {
    return this.#game ? this.#game.makeMove(from, to) : this.#notStarted();
  }

  /** @param {'queen'|'rook'|'bishop'|'knight'} piece Promotion choice. */
  resolvePromotion(piece) {
    return this.#game ? this.#game.resolvePromotion(piece) : this.#notStarted();
  }

  resetGame() {
    return this.#game ? this.#game.reset() : this.#notStarted();
  }

  #notStarted() {
    return { status: 'REJECTED', gameState: null, reason: 'GAME_NOT_STARTED' };
  }
}
