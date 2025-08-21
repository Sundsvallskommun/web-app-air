'use client';

import { ReactNode, useEffect, useState } from 'react';
import 'dayjs/locale/sv';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import updateLocale from 'dayjs/plugin/updateLocale';
import { GuiProvider } from '@sk-web-gui/react';
import { useLocalStorage } from '@utils/use-localstorage.hook';
import { useShallow } from 'zustand/react/shallow';
import LoaderFullScreen from '@components/loader/loader-fullscreen';
import { useAirStore } from '@services/air-service/air-service';
import { useSnackbar } from '@sk-web-gui/react';

dayjs.extend(utc);
dayjs.locale('sv');
dayjs.extend(updateLocale);
dayjs.updateLocale('sv', {
  months: [
    'Januari',
    'Februari',
    'Mars',
    'April',
    'Maj',
    'Juni',
    'Juli',
    'Augusti',
    'September',
    'Oktober',
    'November',
    'December',
  ],
  monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],
});

interface ClientApplicationProps {
  children: ReactNode;
}

const AppLayout = ({ children }: ClientApplicationProps) => {
  const colorScheme = useLocalStorage(useShallow((state) => state.colorScheme));
  const getAirQuality = useAirStore((state) => state.getAirQuality);
  const [mounted, setMounted] = useState(false);
  const toastMessage = useSnackbar();

  useEffect(() => {
    getAirQuality().then((res) => {
      if (res.error) {
        toastMessage({
          status: 'error',
          message: 'Det gick inte att hämta luftkvalitet',
        });
      }
    });
    setMounted(true);
  }, [getAirQuality, setMounted]);

  if (!mounted) {
    return <LoaderFullScreen />;
  }

  return <GuiProvider colorScheme={colorScheme}>{children}</GuiProvider>;
};

export default AppLayout;
