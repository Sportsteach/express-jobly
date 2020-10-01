// npm packages
const request = require('supertest');

// app imports
const app = require('../../app');

const {
  TEST_DATA,
  afterEachHook,
  beforeEachHook,
  afterAllHook
} = require('./jest-config');

beforeEach(async function () {
  await beforeEachHook(TEST_DATA);
});

describe('POST /companies', async function () {
  test('Creates a new company', async function () {
    const response = await request(app)
      .post('/companies')
      .send({
        handle: 'whiskey',
        name: 'Whiskey',
        _token: TEST_DATA.userToken
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.company).toHaveProperty('handle');
  });
});

describe('GET /companies', async function () {
  test('Gets a list of 1 company', async function () {
    const response = await request(app).get('/companies');
    expect(response.body.companies).toHaveLength(1);
    expect(response.body.companies[0]).toHaveProperty('handle');
  });
});

describe('GET /companies/:handle', async function () {
  test('Gets a single a company', async function () {
    const response = await request(app)
      .get(`/companies/${TEST_DATA.currentCompany.handle}`)
      .send({
        _token: TEST_DATA.userToken
      });
    expect(response.body.company).toHaveProperty('handle');
    expect(response.body.company.handle).toBe('rithm');
  });
});

describe('PATCH /companies/:handle', async function () {
  test("Updates a single a company's name", async function () {
    const response = await request(app)
      .patch(`/companies/${TEST_DATA.currentCompany.handle}`)
      .send({
        name: 'xkcd',
        _token: TEST_DATA.userToken
      });
    expect(response.body.company).toHaveProperty('handle');
    expect(response.body.company.name).toBe('xkcd');
    expect(response.body.company.handle).not.toBe(null);
  });
});

describe('DELETE /companies/:handle', async function () {
  test('Deletes a single a company', async function () {
    const response = await request(app)
      .delete(`/companies/${TEST_DATA.currentCompany.handle}`)
      .send({
        _token: TEST_DATA.userToken
      });
    expect(response.body).toEqual({ message: 'Company deleted' });
  });
});

afterEach(async function () {
  await afterEachHook();
});

afterAll(async function () {
  await afterAllHook();
});
