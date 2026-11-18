import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotationGuide } from '../../src/presentation/NotationGuide.jsx';

afterEach(cleanup);

function renderGuide() {
  render(<NotationGuide />);
  const dialog = screen.getByRole('dialog', { hidden: true });
  // jsdom does not implement the browser's native dialog lifecycle.
  dialog.showModal = function () { this.setAttribute('open', ''); };
  dialog.close = function () {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
  return dialog;
}

describe('Notation guide modal', () => {
  it('keeps the guide hidden until requested and restores focus when closed', async () => {
    const user = userEvent.setup();
    renderGuide();
    expect(screen.queryByRole('dialog')).toBeNull();
    const trigger = screen.getByRole('button', { name: 'Cómo leer las jugadas' });
    await user.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Cómo leer las jugadas' })).toBeTruthy();
    expect(screen.getByText('Nf3')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Cerrar guía' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    await user.click(trigger);
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('handles the native cancel event triggered by Escape', async () => {
    const user = userEvent.setup();
    const dialog = renderGuide();
    const trigger = screen.getByRole('button', { name: 'Cómo leer las jugadas' });
    await user.click(trigger);
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('closes on the backdrop but keeps the guide open when its content is clicked', async () => {
    const user = userEvent.setup();
    const dialog = renderGuide();
    await user.click(screen.getByRole('button', { name: 'Cómo leer las jugadas' }));
    await user.click(screen.getByText('Nf3'));
    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.click(dialog, { clientX: -1, clientY: -1 });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
