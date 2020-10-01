/** Companies for jobly */

const db = require("../db");
const ExpressError = require("../helpers/ExpressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const comp_jobs = [];
/** Companies. */

class Companies {
  constructor({ handle, name, num_employees, description, logo_url }) {
    this.handle = handle;
    this.name = name;
    this.num_employees = num_employees;
    this.description = description;
    this.logo_url = logo_url;
    if (comp_jobs.length !== 0) this.jobs = comp_jobs;
  }

  /** find all companies. */

  static async all() {
    while (comp_jobs.length > 0) {
      comp_jobs.pop();
    }
    const results = await db.query(
      `SELECT handle, 
         name,  
         num_employees, 
         description, 
         logo_url
       FROM companies`
    );
    return results.rows.map(c => new Companies(c));
  }
  static async min_emp(min_emp) {
    const results = await db.query(
      `SELECT handle, 
         name,  
         num_employees, 
         description, 
         logo_url
       FROM companies WHERE num_employees > $1`,
      [min_emp]
    );
    return results.rows.map(c => new Companies(c));
  }
  static async max_emp(max_emp) {
    const results = await db.query(
      `SELECT handle, 
         name,  
         num_employees, 
         description, 
         logo_url
       FROM companies WHERE num_employees < $1`,
      [max_emp]
    );
    return results.rows.map(c => new Companies(c));
  }
  static async min_max(min, max) {
    const results = await db.query(
      `SELECT handle, 
         name,  
         num_employees, 
         description, 
         logo_url
       FROM companies WHERE num_employees > $1 AND num_employees < $2`,
      [min, max]
    );
    if (min > max) {
      const err = new Error(`Sorry, your min value of ${min}, cannot be greater than your max value of ${max}.`);
      err.status = 404;
      throw err;
    }

    return results.rows.map(c => new Companies(c));
  }

  /** get a single company by handle with jobs if avalible. */

  static async singleComp(handle) {
    //looks for jobs in each company
    let results = await db.query(
      `SELECT companies.handle, 
      companies.name,  
      companies.num_employees, 
      companies.description, 
      companies.logo_url, jobs.title
      FROM companies
      JOIN jobs ON companies.handle = jobs.company_handle
      AND companies.handle=$1`,
      [handle]
    );
    //empty the comp_job array
    while (comp_jobs.length > 0) {
      comp_jobs.pop();
    }
    //add jobs to array
    for (let i = 0; i < results.rows.length; i++) {
      comp_jobs.push(results.rows[i].title)
    }
    let companies = results.rows[0];
    //if there are no jobs check for other company info
    if (companies === undefined) {
      let results = await db.query(
        `SELECT handle,
        name,
        num_employees,
        description,
        logo_url
      FROM companies WHERE handle = $1`,
        [handle]
      );
      let companies = results.rows[0];

      if (companies === undefined) {
        const err = new Error(`No such companies: ${handle}`);
        err.status = 404;
        throw err;
      }
      return new Companies(companies);
    } else {

      return new Companies(companies);
    }
  }


  /** save this company. */

  async save() {
    if (this.handle) {
      const result = await db.query(
        `INSERT INTO companies (handle, name, num_employees, description, logo_url)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING handle`,
        [this.handle, this.name, this.num_employees, this.description, this.logo_url]
      );
      this.handle = result.rows[0].handle;
    } else {
      await db.query(
        `UPDATE companies SET name=$1, num_employees=$2, description=$3, logo_url=$4
             WHERE handle=$5`,
        [this.name, this.num_employees, this.description, this.logo_url, this.handle]
      );
    }
  }

  //Update information on a company

  static async update(handle, data) {
    let { query, values } = sqlForPartialUpdate(
      "companies",
      data,
      "handle",
      handle
    );

    const result = await db.query(query, values);
    const company = result.rows[0];

    if (!company) {
      throw new ExpressError(`There exists no company '${handle}`, 404);
    }

    return company;
  }

  //Delete an Company

  static async remove(handle) {
    const result = await db.query(
      `DELETE FROM companies 
          WHERE handle = $1 
          RETURNING handle`,
      [handle]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`There exists no company '${handle}`, 404);
    }
  }
}

module.exports = Companies;
