import '@styles/tailwind.scss';
import { ReactNode } from 'react';
import AppLayoutWrapper from '@components/app-layout-wrapper/app-layout-wrapper';
import i18nConfig from './i18nConfig';

interface RootLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export const generateStaticParams = () => i18nConfig.locales.map((locale) => ({ locale }));

const RootLayout = async ({ children, params }: RootLayoutProps) => {
  const { locale } = await params;
  return (
    <html lang={locale}>
      <body>
        <AppLayoutWrapper>{children}</AppLayoutWrapper>
      </body>
    </html>
  );
};

export default RootLayout;
