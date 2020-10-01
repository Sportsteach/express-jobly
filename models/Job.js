/** Job for jobly */

const db = require("../db");
const ExpressError = require("../helpers/ExpressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");


/** Job. */

class Job {
  constructor({ id, title, salary, equity, company_handle, date_posted }) {
    this.id = id;
    this.title = title;
    this.salary = salary;
    this.equity = equity;
    this.company_handle = company_handle;
    this.date_posted = date_posted;
  }

  /** find all Job. */

  static async all() {
    const results = await db.query(
      `SELECT id, 
         title,  
         salary, 
         equity, 
         company_handle,
         date_posted
       FROM jobs`
    );
    return results.rows.map(c => new Job(c));
  }

  //finds single job
  static async singleJob(id) {
    const results = await db.query(
      `SELECT id,
      title,
      salary,
      equity,
      company_handle
    FROM jobs WHERE id = $1`,
      [id]
    );

    const jobs = results.rows[0];

    if (jobs === undefined) {
      const err = new Error(`No such Job: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Job(jobs);
  }
  //finds jobs matching by title
  static async title(title) {
    const results = await db.query(
      `SELECT id,
    title,
    salary,
    equity,
    company_handle
       FROM jobs WHERE title = $1`,
      [title]
    );
    return results.rows.map(j => new Job(j));
  }

  //finds jobs minumum salary requirments
  static async min_sal(min_sal) {
    const results = await db.query(
      `SELECT id,
    title,
    salary,
    equity,
    company_handle
       FROM jobs WHERE salary > $1`,
      [min_sal]
    );
    return results.rows.map(j => new Job(j));
  }

  //finds jobs by maximum salary requirements
  static async max_sal(max_sal) {
    const results = await db.query(
      `SELECT id,
    title,
    salary,
    equity,
    company_handle
       FROM jobs WHERE salary < $1`,
      [max_sal]
    );
    return results.rows.map(j => new Job(j));
  }

  /** save created job. */

  async save() {
    const result = await db.query(
      `INSERT INTO jobs (title, salary, equity, company_handle)
             VALUES ($1, $2, $3, $4)
             RETURNING id, title, salary, equity, company_handle`,
      [this.title, this.salary, this.equity, this.company_handle]
    );
    this.id = result.rows[0].id;
  }

  //Update information on a job

  static async update(id, data) {
    let { query, values } = sqlForPartialUpdate(
      "jobs",
      data,
      "id",
      id
    );
    const result = await db.query(query, values);
    const job = result.rows[0];
    if (!job) {
      throw new ExpressError(`There exists no Job '${id}`, 404);
    }
    return job;
  }

  //Delete an Job

  static async remove(id) {
    const result = await db.query(
      `DELETE FROM jobs 
          WHERE id = $1 
          RETURNING id`,
      [id]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`There exists no company '${id}`, 404);
    }
  }
}

module.exports = Job;
