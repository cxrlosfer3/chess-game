import { useEffect, useRef, useState } from 'react';
import { GameService } from '../application/game-service.js';
import { Board } from './Board.jsx';
import { NotationGuide } from './NotationGuide.jsx';

const COLORS = { white: 'blancas', black: 'negras' };
const REJECTIONS = {
  INVALID_MOVE: 'Ese movimiento no es válido. Elige otro destino.',
  GAME_NOT_STARTED: 'Inicia una partida para mover las piezas.',
  GAME_FINISHED: 'La partida ha terminado. Puedes iniciar otra.',
  PROMOTION_PENDING: 'Elige una pieza para completar la promoción.',
  NO_PENDING_PROMOTION: 'No hay una promoción pendiente.',
  INVALID_PROMOTION_CHOICE: 'Elige una de las piezas disponibles.',
};
const DRAW_REASONS = {
  stalemate: 'ahogado',
  insufficient_material: 'material insuficiente',
  threefold_repetition: 'triple repetición',
  fifty_move_rule: 'regla de los cincuenta movimientos',
};
const PROMOTIONS = { queen: ['Dama', '♛'], rook: ['Torre', '♜'], bishop: ['Alfil', '♝'], knight: ['Caballo', '♞'] };

function describeState(state) {
  if (!state) return 'Todo listo para jugar';
  if (state.result?.type === 'win') return `Jaque mate. Ganan las ${COLORS[state.result.winner]}.`;
  if (state.result?.type === 'draw') return `Tablas por ${DRAW_REASONS[state.result.reason]}.`;
  if (state.pendingPromotion) return `Promoción de ${COLORS[state.pendingPromotion.color]}`;
  return `Turno de ${COLORS[state.turn]}${state.inCheck ? ' · Jaque' : ''}`;
}

export function App({ service }) {
  const [game] = useState(() => service ?? new GameService());
  const [state, setState] = useState(() => game.getGameState());
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState('');
  const promotionChoice = useRef(null);
  const pending = state?.pendingPromotion;
  const finished = state?.status === 'finished';
  const legalMoves = selected ? game.getLegalMoves(selected) : [];

  useEffect(() => {
    if (pending) promotionChoice.current?.focus();
  }, [pending]);

  function apply(response) {
    setState(response.gameState);
    setNotice(response.status === 'REJECTED' ? REJECTIONS[response.reason] : '');
    if (response.status !== 'REJECTED') setSelected(null);
  }

  function selectSquare(square, piece) {
    if (!state || pending || finished) return;
    const ownPiece = piece && (piece.color === 'w' ? 'white' : 'black') === state.turn;
    if (ownPiece) {
      setSelected(selected === square ? null : square);
      setNotice('');
    } else if (selected) {
      apply(game.makeMove(selected, square));
    }
  }

  const history = state?.history ?? [];
  const rows = Array.from({ length: Math.ceil(history.length / 2) }, (_, index) => history.slice(index * 2, index * 2 + 2));

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="./" aria-label="Chess Game, inicio"><span aria-hidden="true">♞</span> CHESS GAME<span className="brand-dot">.</span></a>
        <span className="local-label"><span className="status-dot" /> Ajedrez local</span>
      </header>

      <main>
        <div className="intro">
          <p className="eyebrow">UN TABLERO. DOS JUGADORES.</p>
          <h1>Tu próxima jugada.</h1>
          <p>Comparte el tablero. Tómate tu tiempo. Disfruta la partida.</p>
        </div>

        <div className="game-layout">
          <section className="board-section" aria-label="Partida local">
            <div className="player-line"><span><span className="player-mark black-mark" /> Negras</span><span>{state?.turn === 'black' && !finished ? 'Su turno' : 'Jugador 2'}</span></div>
            <div className="board-container">
              <Board board={state?.board} selected={selected} legalMoves={legalMoves} lastMove={history.at(-1)}
                disabled={!state || Boolean(pending) || finished} onSquareClick={selectSquare} />
              {!state && <div className="board-welcome"><span aria-hidden="true">♞</span><h2>La partida empieza contigo.</h2><p>Dos personas, en el mismo dispositivo.</p><button className="primary-button" onClick={() => apply(game.startGame())}>Iniciar partida <span aria-hidden="true">↗</span></button></div>}
            </div>
            <div className="player-line"><span><span className="player-mark white-mark" /> Blancas</span><span>{state?.turn === 'white' && !finished ? 'Su turno' : 'Jugador 1'}</span></div>
          </section>

          <aside className="game-panel" aria-label="Información de la partida">
            <section className="state-panel">
              <div className="panel-heading"><span className="eyebrow">LA PARTIDA</span><span className="mode-badge">LOCAL</span></div>
              <div className={`turn-icon ${state?.turn === 'black' ? 'black-turn' : ''}`} aria-hidden="true">{finished ? '⚑' : '♚'}</div>
              <h2 role="status" aria-live="polite">{describeState(state)}</h2>
              <p className="state-description">{!state ? 'Las blancas hacen el primer movimiento.' : finished ? 'Buen juego. ¿Una partida más?' : pending ? 'Tu peón está a un paso de convertirse en otra pieza.' : selected ? `Pieza en ${selected} seleccionada. Elige una casilla de destino.` : 'Selecciona una pieza y después su destino.'}</p>
              {notice && <p className="notice" role="alert">{notice}</p>}
              {pending && <section className="promotion" role="dialog" aria-labelledby="promotion-title">
                <h3 id="promotion-title">Elige tu pieza</h3>
                <div className="promotion-options">{pending.options.map((piece, index) => <button key={piece} ref={index === 0 ? promotionChoice : null} onClick={() => apply(game.resolvePromotion(piece))} aria-label={`Promocionar a ${PROMOTIONS[piece][0]}`}><span aria-hidden="true">{PROMOTIONS[piece][1]}</span>{PROMOTIONS[piece][0]}</button>)}</div>
              </section>}
              {state && <button className="secondary-button" onClick={() => apply(game.resetGame())}><span aria-hidden="true">↻</span> Reiniciar partida</button>}
            </section>

            <section className="history-panel" aria-label="Historial de movimientos">
              <div className="panel-heading"><h2>Movimientos</h2><span className="move-count">{history.length}</span></div>
              {!history.length ? <div className="empty-history"><span aria-hidden="true">↗</span><p>Cada partida tiene una historia.</p><small>Tu primera jugada aparecerá aquí.</small></div> : <div className="history-scroll"><table><thead><tr><th scope="col">N.º</th><th scope="col">Blancas</th><th scope="col">Negras</th></tr></thead><tbody>{rows.map((moves, index) => <tr key={index}><th scope="row">{index + 1}.</th><td>{moves[0].san}</td><td>{moves[1]?.san ?? '—'}</td></tr>)}</tbody></table></div>}
              <NotationGuide />
            </section>
            <p className="game-note"><span aria-hidden="true">◈</span> Sin reloj. Solo el siguiente movimiento.</p>
          </aside>
        </div>
      </main>
      <footer><span>Hecho para disfrutar del ajedrez.</span><span>Dos jugadores · Un dispositivo</span></footer>
    </div>
  );
}
