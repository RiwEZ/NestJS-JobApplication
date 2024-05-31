import { Test } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

async function post(
  app: NestFastifyApplication,
  path: string,
  body: Record<string, any>,
) {
  return app.inject({
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
    path,
    body,
  });
}

async function graphql(
  app: NestFastifyApplication,
  accessToken: string,
  query: string,
) {
  return app.inject({
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    method: 'POST',
    path: '/graphql',
    body: { query },
  });
}

// This is a simple e2e testing that is mostly covered the happy path only.
// And this need to be run in sequential, so it will be slow.
describe('E2E Testing', () => {
  let app: NestFastifyApplication;
  const companies = ['company1', 'company2'];
  const candidates = ['candidate1', 'candidate2'];

  const companyAccessTokens: string[] = [];
  const candidateAccessTokens: string[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  describe('register an account', () => {
    it('should success when register #1 company', async () => {
      const result = await post(app, '/auth/register', {
        username: companies[0],
        password: companies[0],
        kind: 'company',
      });

      expect(result.statusCode).toBe(200);
    });

    it('should success when register #2 company', async () => {
      const result = await post(app, '/auth/register', {
        username: companies[1],
        password: companies[1],
        kind: 'company',
      });

      expect(result.statusCode).toBe(200);
    });

    it('should success when register #1 candidate', async () => {
      const result = await post(app, '/auth/register', {
        username: candidates[0],
        password: candidates[0],
        kind: 'candidate',
      });

      expect(result.statusCode).toBe(200);
    });

    it('should success when register #2 candidate', async () => {
      const result = await post(app, '/auth/register', {
        username: candidates[1],
        password: candidates[1],
        kind: 'candidate',
      });

      expect(result.statusCode).toBe(200);
    });
  });

  describe('login to an account', () => {
    it('should be able to login to a company account from a valid credential', async () => {
      const result = await post(app, '/auth/login', {
        username: companies[0],
        password: companies[0],
      });
      const resultBody = JSON.parse(result.body);
      expect(result.statusCode).toBe(200);
      expect(resultBody.accessToken).toBeDefined();

      companyAccessTokens.push(resultBody.accessToken);
    });

    it('should be able to login to a candidate account from a valid credential', async () => {
      const result = await post(app, '/auth/login', {
        username: candidates[0],
        password: candidates[0],
      });

      const resultBody = JSON.parse(result.body);
      expect(result.statusCode).toBe(200);
      expect(resultBody.accessToken).toBeDefined();

      candidateAccessTokens.push(resultBody.accessToken);
    });

    it('should not be able to login from an invalid credential', async () => {
      const result = await post(app, '/auth/login', {
        username: candidates[0],
        password: 'asdsadsadadadsad',
      });

      expect(result.statusCode).toBe(401);
      expect(JSON.parse(result.body).accessToken).toBeUndefined();
    });
  });

  const jobIds: string[] = [];

  describe('posting jobs', () => {
    it('should be able to register as a company on company account', async () => {
      const result = await graphql(
        app,
        companyAccessTokens[0],
        `
          mutation RegisterCompany {
            registerCompany(
              data: {
                name: "good company"
                description: "lalala"
                contactInfo: "lalala"
              }
            ) {
              id
              name
              description
              contactInfo
            }
          }
        `,
      );

      const resultBody = JSON.parse(result.body);
      console.log(resultBody);

      expect(result.statusCode).toBe(200);
      expect(resultBody.data.registerCompany).toBeDefined();
      expect(resultBody.data.registerCompany.id).toBeDefined();
    });

    it('company should be able to post a job', async () => {
      const result = await graphql(
        app,
        companyAccessTokens[0],
        `
          mutation CreateJob {
            createJob(
              jobData: {
                title: "software dev"
                description: "25k"
                isOpen: true
              }
            ) {
              id
              title
              description
              isOpen
            }
          }
        `,
      );

      const resultBody = JSON.parse(result.body);
      console.log(resultBody);

      expect(result.statusCode).toBe(200);
      expect(resultBody.data.createJob).toBeDefined();
      expect(resultBody.data.createJob.id).toBeDefined();
    });
  });

  describe('querying jobs', () => {
    beforeAll(async () => {
      for (let i = 0; i < 5; i++) {
        await graphql(
          app,
          companyAccessTokens[0],
          `
            mutation CreateJob {
              createJob(
                jobData: {
                  title: "software dev ${i}"
                  description: "25k"
                  isOpen: true
                }
              ) {
                id
                title
                description
                isOpen
              }
            }
          `,
        );
      }
    });

    it('candidate should be able to query jobs', async () => {
      const result = await graphql(
        app,
        candidateAccessTokens[0],
        `
          query Jobs {
            jobs {
              id
              title
              description
              isOpen
            }
          }
        `,
      );

      const resultBody = JSON.parse(result.body);

      expect(result.statusCode).toBe(200);
      expect(resultBody.data.jobs).toBeDefined();
      expect(resultBody.data.jobs[0].id).toBeDefined();
      expect(resultBody.data.jobs.length).toBe(6);

      resultBody.data.jobs.forEach((job: any) => jobIds.push(job.id));
    });
  });

  describe('applying to a job', () => {
    it('should be able to register as a candidate on candidate account', async () => {
      const result = await graphql(
        app,
        candidateAccessTokens[0],
        `
          mutation RegisterCandidate {
            registerCandidate(
              data: {
                fullname: "super devdev"
                nickname: "10x dev"
                contactInfo: "moon"
                information: "NVIM BTW"
              }
            ) {
              id
            }
          }
        `,
      );

      const resultBody = JSON.parse(result.body);
      console.log(resultBody);

      expect(result.statusCode).toBe(200);
      expect(resultBody.data.registerCandidate).toBeDefined();
      expect(resultBody.data.registerCandidate.id).toBeDefined();
    });

    it('candidate should be able to apply to #1 job', async () => {
      const result = await graphql(
        app,
        candidateAccessTokens[0],
        `
          mutation ApplyTo {
            applyTo(jobId: "${jobIds[0]}") {
              id
              status
            }
          }
        `,
      );

      const resultBody = JSON.parse(result.body);
      console.log(resultBody);

      expect(result.statusCode).toBe(200);
      expect(resultBody.data.applyTo).toBeDefined();
      expect(resultBody.data.applyTo.id).toBeDefined();
      expect(resultBody.data.applyTo.status).toBe('PENDING');
    });

    it('candidate should be able to apply to #2 job', async () => {
      const result = await graphql(
        app,
        candidateAccessTokens[0],
        `
          mutation ApplyTo {
            applyTo(jobId: "${jobIds[1]}") {
              id
              status
            }
          }
        `,
      );

      const resultBody = JSON.parse(result.body);
      console.log(resultBody);

      expect(result.statusCode).toBe(200);
      expect(resultBody.data.applyTo).toBeDefined();
      expect(resultBody.data.applyTo.id).toBeDefined();
      expect(resultBody.data.applyTo.status).toBe('PENDING');
    });
  });

  describe('company actions with applicants', () => {
    const applicantId: string[] = [];

    it('company should be able to view applicants list', async () => {
      const result = await graphql(
        app,
        companyAccessTokens[0],
        `
          query Applicants {
            applicants(jobId: "${jobIds[0]}") {
              id
            }
          }
        `,
      );

      const resultBody = JSON.parse(result.body);
      console.log(resultBody);

      expect(result.statusCode).toBe(200);
      expect(resultBody.data.applicants).toBeDefined();
      expect(resultBody.data.applicants.length).toBe(1);
      expect(resultBody.data.applicants[0].id).toBeDefined();

      resultBody.data.applicants.forEach((applicant: any) =>
        applicantId.push(applicant.id),
      );
    });

    it('company should be able to close a job & candidate should not be able to apply to it', async () => {
      const toggleResult = await graphql(
        app,
        companyAccessTokens[0],
        `
          mutation ToggleJobStatus {
            toggleJobStatus(jobId: "${jobIds[1]}") {
              id
              isOpen
            }
          }
        `,
      );
      const toggleResultBody = JSON.parse(toggleResult.body);
      console.log(toggleResultBody);

      expect(toggleResult.statusCode).toBe(200);
      expect(toggleResultBody.data.toggleJobStatus).toBeDefined();
      expect(toggleResultBody.data.toggleJobStatus.isOpen).toBe(false);

      const applyResult = await graphql(
        app,
        candidateAccessTokens[0],
        `
          mutation ApplyTo {
            applyTo(jobId: "${jobIds[1]}") {
              id
              job
              status
            }
          }
        `,
      );

      const applyResultBody = JSON.parse(applyResult.body);
      console.log(applyResultBody);

      expect(applyResult.statusCode).toBe(200);
      expect(applyResultBody.data).toBeNull();
      expect(applyResultBody.errors).toBeDefined();
    });

    it('company should be able to reject an applicant', async () => {
      const result = await graphql(
        app,
        companyAccessTokens[0],
        `
          mutation Reject {
            reject(id: "${applicantId[0]}") {
              id
              job
            }
          }
        `,
      );

      const resultBody = JSON.parse(result.body);
      console.log(resultBody);

      expect(result.statusCode).toBe(200);
      expect(resultBody.data.reject).toBeDefined();
      expect(resultBody.data.reject.id).toBeDefined();
    });

    it('company should be able to hire an applicant', async () => {
      const tempResp = await graphql(
        app,
        companyAccessTokens[0],
        `
          query Applicants {
            applicants(jobId: "${jobIds[1]}") {
              id
            }
          }
        `,
      );
      const applicants = JSON.parse(tempResp.body).data.applicants;
      const result = await graphql(
        app,
        companyAccessTokens[0],
        `
          mutation Hire {
            hire(id: "${applicants[0].id}") {
              id
              job
            }
          }
        `,
      );

      const resultBody = JSON.parse(result.body);
      console.log(resultBody);

      expect(result.statusCode).toBe(200);
      expect(resultBody.data.hire).toBeDefined();
      expect(resultBody.data.hire.id).toBeDefined();
    });

    it('candidate should be able to view status of their applications', async () => {
      const result = await graphql(
        app,
        candidateAccessTokens[0],
        `
          query ApplicationStatuses {
            applicationStatuses {
              id
              status
            }
          }
        `,
      );
      const resultBody = JSON.parse(result.body);
      console.log(resultBody);

      expect(result.statusCode).toBe(200);
      expect(resultBody.data.applicationStatuses).toBeDefined();
      expect(resultBody.data.applicationStatuses[0].id).toBeDefined();
      expect(resultBody.data.applicationStatuses[0].status).toBe('REJECTED');
      expect(resultBody.data.applicationStatuses[1].id).toBeDefined();
      expect(resultBody.data.applicationStatuses[1].status).toBe('HIRED');
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
