import '@styles/tailwind.scss';
import { ReactNode } from 'react';
import AppLayoutWrapper from '@components/app-layout-wrapper/app-layout-wrapper';
import i18nConfig from './i18nConfig';

interface RootLayoutProps {
  children: ReactNode;
}

export const generateStaticParams = () => i18nConfig.locales.map((locale) => ({ locale }));

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang={i18nConfig.defaultLocale}>
      <body>
        <AppLayoutWrapper>{children}</AppLayoutWrapper>
      </body>
    </html>
  );
};

export default RootLayout;
