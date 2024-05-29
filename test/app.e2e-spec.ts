import { Test } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

const graphql = '/graphql';

describe('AppController (e2e)', () => {
  let app: NestFastifyApplication;
  let accessToken: string;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    const result = await app.inject({
      method: 'POST',
      url: '/auth/login',
      body: { username: 'test', password: 'test' },
    });

    // storing access token
    accessToken = JSON.parse(result.body).accessToken;
  });

  describe(graphql, () => {
    it('companies', async () => {
      const result = await app.inject({
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'content-type': 'application/json',
        },
        method: 'POST',
        path: graphql,
        body: { query: 'query Companies { companies { id } }' },
      });

      console.log(result.body);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
