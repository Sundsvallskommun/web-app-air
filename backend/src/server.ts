import App from '@/app';
import { IndexController } from '@controllers/index.controller';
import validateEnv from '@utils/validateEnv';
import { HealthController } from './controllers/health.controller';
import { AirController } from './controllers/air.controller';

validateEnv();

const app = new App([IndexController, HealthController, AirController]);

app.listen();
