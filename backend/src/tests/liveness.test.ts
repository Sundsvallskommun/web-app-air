import request from 'supertest';
import App from '@/app';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});
describe('Testing liveness', () => {
  describe('[GET] /health', () => {
    it('responds 200 outside the API prefix', async () => {
      const app = new App([]);
      const response = await request(app.getServer()).get('/health').expect(200);
      expect(response.body).toEqual({ status: 'OK' });
    });

    it('is registered ahead of the shared middleware chain', async () => {
      const app = new App([]);
      const response = await request(app.getServer()).get('/health');
      // helmet strips this header, so it is only present if the route answered before helmet ran
      expect(response.headers['x-powered-by']).toBeDefined();
    });
  });
});
