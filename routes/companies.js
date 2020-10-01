/** Routes for Jobly */

const express = require("express");
const Company = require("../models/Company");
const ExpressError = require('../helpers/ExpressError');
const router = new express.Router();
const { validate } = require('jsonschema');
const company_schema_new = require('../schemas/company_schema_new.json');
const company_schema_update = require('../schemas/company_schema_update.json');
const { authToken } = require('../middleware/auth');
const { adminToken } = require('../middleware/auth');

/** List of companies. */

router.get("/", authToken, async function (req, res, next) {
  try {
    const companies = await Company.all();
    return res.json({ companies });
  } catch (err) {
    return next(err);
  }
});

//Get single company by handle
router.get('/:handle', authToken, async function (req, res, next) {
  try {
    const company = await Company.singleComp(req.params.handle);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

//return list of company by a minimum amount of employees
router.get('/min_employees/:min_emp', async function (req, res, next) {
  try {
    const company = await Company.min_emp(req.params.min_emp);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

//return list of company by a maximum amount of employees
router.get('/max_employees/:max_emp', async function (req, res, next) {
  try {
    const company = await Company.max_emp(req.params.max_emp);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

//return list of company by a minimum amount of employees and maximum amount employees
router.get('/min_max/:min/:max', async function (req, res, next) {
  try {
    const company = await Company.min_max(req.params.min, req.params.max);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

// /** Handle adding a new Company. */
router.post("/add/", adminToken, async function (req, res, next) {
  try {
    const handle = req.body.handle;
    const name = req.body.name;
    const num_employees = req.body.num_employees;
    const description = req.body.description;
    const logo_url = req.body.logo_url;

    const company = new Company({ handle, name, num_employees, description, logo_url });
    const validation = validate(req.body, company_schema_new);

    if (!validation.valid) {
      throw new ExpressError(validation.errors.map(e => e.stack), 400);
    }
    await company.save();

    return res.status(201).json({ company }); // 201 CREATED
  } catch (err) {
    return next(err);
  }
});

router.patch('/:handle', adminToken, async function (req, res, next) {
  try {
    if ('handle' in req.body) {
      throw new ExpressError('Sorry you can not update the company handle.', 400);
    }
    const validation = validate(req.body, company_schema_update);
    if (!validation.valid) {
      throw new ExpressError(validation.errors.map(e => e.stack), 400);
    }
    const company = await Company.update(req.params.handle, req.body);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

router.delete('/:handle', adminToken, async function (req, res, next) {
  try {
    await Company.remove(req.params.handle);
    return res.json({ message: 'Company deleted' });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
