'use client';

import DefaultLayout from '@layouts/default-layout/default-layout.component';
import Main from '@layouts/main/main.component';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'underscore.string';

const Exempelsida: React.FC = () => {
  const { t } = useTranslation();
  return (
    <DefaultLayout>
      <Main>
        <div className="text-content">
          <h1>{`${capitalize(t('example:welcome'))}!`}</h1>
          <p>{t('example:description')}</p>
        </div>
      </Main>
    </DefaultLayout>
  );
};

export default Exempelsida;
