// npm packages
const request = require("supertest");

// app imports
const app = require("../../app");

const {
  TEST_DATA,
  afterEachHook,
  beforeEachHook,
  afterAllHook
} = require('./jest-config');

beforeEach(async () => {
  await beforeEachHook(TEST_DATA);
});


describe("POST /jobs", async function () {
  test("Creates a new job", async function () {
    const job = await Job.create(req.body);
  });
  expect(job.statusCode).toBe(201);
});


describe("GET /jobs", async function () {
  test("Gets a list of 1 job", async function () {
    const response = await request(app).get(`/jobs`);
    const jobs = response.body;
    expect(jobs).toHaveLength(1);
  });
});


describe("GET /jobs/:id", async function () {
  test("Gets a single a job", async function () {
    const response = await request(app).get(`/jobs/${TEST_DATA.jobId}`);
    expect(response.body.job);
  });
});


describe("PATCH /jobs/:id", async function () {
  test("Updates a single a job's title", async function () {
    const response = await request(app)
      .patch(`/jobs/${TEST_DATA.jobId}`)
      .send({ title: "xkcd", _token: TEST_DATA.userToken });

    expect(response.body.job.title).toBe("xkcd");
    expect(response.body.job.id).not.toBe(null);
  });

});


describe("DELETE /jobs/:id", async function () {
  test("Deletes a single a job", async function () {
    const response = await request(app)
      .delete(`/jobs/${TEST_DATA.jobId}`).send({ _token: TEST_DATA.userToken })
    expect(response.body).toEqual({ message: "Job deleted" });
  });
});


afterEach(async function () {
  await afterEachHook();
});


afterAll(async function () {
  await afterAllHook();
});
