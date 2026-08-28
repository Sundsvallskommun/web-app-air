'use client';

// The only file allowed to import the real useSnackbar chain (see @utils/use-snackbar).
// Loaded with next/dynamic({ ssr: false }) so toasted-notes evaluates after hydration.
import { useSnackbar } from '@sk-web-gui/react';
import { useEffect } from 'react';
import { registerSnackbar } from '@utils/use-snackbar';

export default function SnackbarBridge() {
  const snackbar = useSnackbar();

  useEffect(() => {
    registerSnackbar(snackbar);
  }, [snackbar]);

  return null;
}
