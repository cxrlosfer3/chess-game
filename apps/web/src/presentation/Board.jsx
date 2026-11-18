const FILES = 'abcdefgh';
const PIECES = {
  k: { symbol: '♚', name: 'Rey' },
  q: { symbol: '♛', name: 'Dama' },
  r: { symbol: '♜', name: 'Torre' },
  b: { symbol: '♝', name: 'Alfil' },
  n: { symbol: '♞', name: 'Caballo' },
  p: { symbol: '♟', name: 'Peón' },
};

/** Renders confirmed state only; selection is presentation state. */
export function Board({ board, selected, legalMoves = [], lastMove, disabled, onSquareClick }) {
  return (
    <div className="board-frame">
      <div className="board" role="group" aria-label="Tablero de ajedrez">
        {Array.from({ length: 64 }, (_, index) => {
          const row = Math.floor(index / 8);
          const column = index % 8;
          const square = `${FILES[column]}${8 - row}`;
          const piece = board?.[row][column];
          const info = piece ? PIECES[piece.type] : null;
          const color = piece?.color === 'w' ? 'blancas' : 'negras';
          const isLastMove = lastMove?.from === square || lastMove?.to === square;
          const destination = legalMoves.find((move) => move.to === square);
          return (
            <button
              key={square}
              type="button"
              className={`square ${(row + column) % 2 ? 'dark' : 'light'}${isLastMove ? ' last-move' : ''}${destination ? destination.capture ? ' legal-capture' : ' legal-move' : ''}`}
              aria-label={`${square}: ${info ? `${info.name} (${color})` : 'vacía'}`}
              aria-description={destination ? destination.capture ? 'Captura disponible' : 'Movimiento disponible' : undefined}
              aria-pressed={selected === square}
              disabled={disabled}
              onClick={() => onSquareClick(square, piece)}
            >
              {column === 0 && <span className="coordinate rank" aria-hidden="true">{8 - row}</span>}
              {row === 7 && <span className="coordinate file" aria-hidden="true">{FILES[column]}</span>}
              {piece && <span className={`piece ${piece.color === 'w' ? 'white-piece' : 'black-piece'}`} aria-hidden="true">{info.symbol}</span>}
              {destination && <span className={`move-hint ${destination.capture ? 'capture-hint' : ''}`} aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
