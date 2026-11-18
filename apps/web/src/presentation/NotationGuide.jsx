import { useRef } from 'react';

export function NotationGuide() {
  const dialog = useRef(null);
  const trigger = useRef(null);

  function closeOnBackdrop(event) {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) {
      dialog.current.close();
    }
  }

  return (
    <>
      <button className="notation-trigger" ref={trigger} type="button"
        aria-haspopup="dialog" aria-controls="notation-dialog"
        onClick={() => dialog.current.showModal()}>
        <span aria-hidden="true">?</span> Cómo leer las jugadas
      </button>
      <dialog className="notation-dialog" id="notation-dialog" ref={dialog}
        aria-labelledby="notation-title" onClick={closeOnBackdrop}
        onCancel={(event) => { event.preventDefault(); dialog.current.close(); }}
        onClose={() => trigger.current?.focus()}>
        <header className="notation-header">
          <h2 id="notation-title">Cómo leer las jugadas</h2>
          <button type="button" className="notation-close" aria-label="Cerrar guía"
            onClick={() => dialog.current.close()}>×</button>
        </header>
        <div className="notation-guide">
    <p><strong>Nf3</strong> significa «caballo a f3»: <strong>N</strong> es la pieza y <strong>f3</strong>, la casilla de destino (columna f, fila 3).</p>
    <p>Las letras de las piezas están en inglés:</p>
    <dl>
      <dt>N</dt><dd>Caballo</dd>
      <dt>B</dt><dd>Alfil</dd>
      <dt>R</dt><dd>Torre</dd>
      <dt>Q</dt><dd>Dama</dd>
      <dt>K</dt><dd>Rey</dd>
    </dl>
    <p>El peón no lleva letra: <strong>e4</strong> significa «peón a e4».</p>
    <dl>
      <dt>x</dt><dd>Captura. <strong>Nxe5</strong>: caballo captura en e5.</dd>
      <dt>exd5</dt><dd>Un peón de la columna e captura en d5.</dd>
      <dt>+</dt><dd>Jaque. <strong>Bb5+</strong>: alfil a b5 con jaque.</dd>
      <dt>#</dt><dd>Jaque mate. <strong>Qh4#</strong>: dama a h4 con mate.</dd>
      <dt>O-O</dt><dd>Enroque corto.</dd>
      <dt>O-O-O</dt><dd>Enroque largo.</dd>
      <dt>=Q</dt><dd>Promoción a dama. <strong>e8=Q</strong>: peón a e8 y se convierte en dama.</dd>
    </dl>
    <p>Si dos piezas iguales pueden llegar al mismo destino, se añade el origen necesario: <strong>Nbd2</strong> es «caballo de la columna b a d2».</p>
        </div>
      </dialog>
    </>
  );
}
