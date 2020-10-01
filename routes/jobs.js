/** Routes for Jobly */

const express = require("express");
const Job = require("../models/Job");
const ExpressError = require('../helpers/ExpressError');
const { validate } = require('jsonschema');
const job_schema_new = require('../schemas/job_schema_new.json');
const job_schema_update = require('../schemas/job_schema_update.json');
const { authToken } = require('../middleware/auth');
const { adminToken } = require('../middleware/auth');

const router = new express.Router();

/** List of Jobs. */

router.get("/", authToken, async function (req, res, next) {
  try {
    const jobs = await Job.all();
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

//Get single Job by id
router.get('/:id', authToken, async function (req, res, next) {
  try {
    const job = await Job.singleJob(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

//return list of jobs by a title
router.get('/title/:title', async function (req, res, next) {
  try {
    const job = await Job.title(req.params.title);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});
//return list of jobs by a minimum salary
router.get('/min_salary/:min_sal', async function (req, res, next) {
  try {
    const job = await Job.min_sal(req.params.min_sal);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});
//return list of jobs by a maximum salary
router.get('/max_salary/:max_sal', async function (req, res, next) {
  try {
    const job = await Job.max_sal(req.params.max_sal);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

// /** id adding a new Job. */
router.post("/add/", adminToken, async function (req, res, next) {
  try {
    const title = req.body.title;
    const salary = req.body.salary;
    const equity = req.body.equity;
    const company_handle = req.body.company_handle;

    const job = new Job({ title, salary, equity, company_handle });
    const validation = validate(req.body, job_schema_new);

    if (!validation.valid) {
      throw new ExpressError(validation.errors.map(e => e.stack), 400);
    }
    await job.save();

    return res.status(201).json({ job }); // 201 CREATED
  } catch (err) {
    return next(err);
  }
});

router.patch('/:id', adminToken, async function (req, res, next) {
  try {
    if ('id' in req.body) {
      throw new ExpressError('Sorry you can not update the Job id.', 400);
    }
    const validation = validate(req.body, job_schema_update);
    if (!validation.valid) {
      throw new ExpressError(validation.errors.map(e => e.stack), 400);
    }
    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', adminToken, async function (req, res, next) {
  try {
    await Job.remove(req.params.id);
    return res.json({ message: 'Job deleted' });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
