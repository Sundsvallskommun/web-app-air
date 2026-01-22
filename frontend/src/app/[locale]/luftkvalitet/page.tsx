'use client';

import AirQualityComponent from '@components/air-quality/air-quality.component';
import DefaultLayout from '@layouts/default-layout/default-layout.component';
import Main from '@layouts/main/main.component';
// import { useTranslation } from 'react-i18next';
// import { capitalize } from 'underscore.string';

const Luftkvalitetsida: React.FC = () => {
  // const { t } = useTranslation();
  return (
    <DefaultLayout>
      <Main>
        {/* <div className="text-content">
          <h1>{`${capitalize(t('example:welcome'))}!`}</h1>
          <p>{t('example:description')}</p>
        </div> */}
        <AirQualityComponent />
      </Main>
    </DefaultLayout>
  );
};

export default Luftkvalitetsida;
