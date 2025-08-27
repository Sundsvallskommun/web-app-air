import { cleanEnv, port, str, url } from 'envalid';

// NOTE: Make sure we got these in ENV
const validateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    SECRET_KEY: str(),
    API_BASE_URL: str(),
    API_EXTERNAL_BASE_URL: str(),
    PORT: port(),
    BASE_URL_PREFIX: str(),
  });
};

export default validateEnv;
