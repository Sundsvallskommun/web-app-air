// Facade for @sk-web-gui/react's useSnackbar.
//
// @sk-web-gui/toasted-notes <=1.2.2 calls createRoot() at module-eval time; if that
// happens before Next hydrates the document, react-dom silently skips attaching all
// delegated event listeners and the page renders but nothing is clickable.
// Components must import useSnackbar from here instead of '@sk-web-gui/react', so the
// real toast chain is only loaded after hydration via SnackbarBridge (next/dynamic,
// ssr: false). Messages sent before the bridge registers are queued and flushed.
import type { useSnackbar as realUseSnackbar } from '@sk-web-gui/react';

type SnackbarFn = ReturnType<typeof realUseSnackbar>;

let emitter: SnackbarFn | null = null;
const queue: Parameters<SnackbarFn>[] = [];

export const registerSnackbar = (fn: SnackbarFn) => {
  emitter = fn;
  while (queue.length > 0) {
    const args = queue.shift();
    if (args) fn(...args);
  }
};

const facade = ((...args: Parameters<SnackbarFn>) => {
  if (emitter) return emitter(...args);
  queue.push(args);
}) as SnackbarFn;

export const useSnackbar = (): SnackbarFn => facade;
