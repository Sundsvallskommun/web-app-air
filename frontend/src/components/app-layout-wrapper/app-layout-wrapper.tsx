'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';

const AppLayout = dynamic(() => import('@layouts/app/app-layout.component'), {
  ssr: false,
});

const SnackbarBridge = dynamic(() => import('@components/snackbar-bridge/snackbar-bridge'), {
  ssr: false,
});

interface AppLayoutWrapperProps {
  children: ReactNode;
}

export default function AppLayoutWrapper({ children }: AppLayoutWrapperProps) {
  return (
    <>
      <SnackbarBridge />
      <AppLayout>{children}</AppLayout>
    </>
  );
}
