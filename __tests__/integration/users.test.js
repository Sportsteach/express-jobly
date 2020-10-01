// npm packages
const request = require('supertest');

// app imports
const app = require('../../app');

// model imports
const User = require('../../models/users');

const {
  TEST_DATA,
  afterEachHook,
  afterAllHook,
  beforeEachHook
} = require('./jest-config');

beforeEach(async function () {
  await beforeEachHook(TEST_DATA);
});

afterEach(async function () {
  await afterEachHook();
});

afterAll(async function () {
  await afterAllHook();
});

describe('POST /users', async function () {
  test('Creates a new user', async function () {
    let dataObj = {
      username: 'whiskey',
      first_name: 'Whiskey',
      password: 'foo123',
      last_name: 'Lane',
      email: 'whiskey@rithmschool.com'
    };
  });
});

describe('GET /users', async function () {
  test('Gets a list of 1 user', async function () {
    const response = await request(app)
      .get('/users')
      .send({ _token: `${TEST_DATA.userToken}` });
    expect(response.body.users).toHaveLength(1);
    expect(response.body.users[0]).toHaveProperty('username');
    expect(response.body.users[0]).not.toHaveProperty('password');
  });
});

describe('GET /users/:username', async function () {
  test('Gets a single a user', async function () {
    const response = await request(app)
      .get(`/users/${TEST_DATA.currentUsername}`)
      .send({ _token: `${TEST_DATA.userToken}` });
    expect(response.body.user).toHaveProperty('username');
    expect(response.body.user).not.toHaveProperty('password');
    expect(response.body.user.username).toBe('test');
  });
});

describe('PATCH /users/:username', async () => {
  test("Updates a single a user's first_name with a selective update", async function () {
    const response = await request(app)
      .patch(`/users/${TEST_DATA.currentUsername}`)
      .send({ first_name: 'xkcd', _token: `${TEST_DATA.userToken}` });
    const user = response.body.user;
    expect(user).toHaveProperty('username');
    expect(user).not.toHaveProperty('password');
    expect(user.first_name).toBe('xkcd');
    expect(user.username).not.toBe(null);
  });
});

describe('DELETE /users/:username', async function () {
  test('Deletes a single a user', async function () {
    const response = await request(app)
      .delete(`/users/${TEST_DATA.currentUsername}`)
      .send({ _token: `${TEST_DATA.userToken}` });
    expect(response.body).toEqual({ message: 'User deleted' });
  });
});
