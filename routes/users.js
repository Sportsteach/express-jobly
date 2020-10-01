/** Routes for Jobly */

const express = require("express");
const User = require("../models/Users");
const ExpressError = require('../helpers/ExpressError');
const { validate } = require('jsonschema');
const user_schema_new = require('../schemas/user_schema_new.json');
const user_schema_update = require('../schemas/user_schema_update.json');
const createToken = require('../helpers/createToken');
const { loggedUser } = require('../middleware/auth');

const router = new express.Router();

/** List of Users. */

router.get("/", async function (req, res, next) {
    try {
        const users = await User.all();
        return res.json({ users });
    } catch (err) {
        return next(err);
    }
});

//Get single User by username
router.get('/:username', async function (req, res, next) {
    try {
        const user = await User.singleUser(req.params.username);
        return res.json({ user });
    } catch (err) {
        return next(err);
    }
});



// /** Adding a new User. */
router.post("/", async function (req, res, next) {
    try {
        const username = req.body.username;
        const password = req.body.password;
        const first_name = req.body.first_name;
        const last_name = req.body.last_name;
        const email = req.body.email;
        const photo_url = req.body.photo_url;
        const user = new User({ username, password, first_name, last_name, email, photo_url });
        const validation = validate(req.body, user_schema_new);

        if (!validation.valid) {
            throw new ExpressError(validation.errors.map(e => e.stack), 400);
        }
        await user.save();
        const token = createToken(user);
        return res.status(201).json({ token });
    } catch (err) {
        return next(err);
    }
});

//Edit a users information
router.patch('/:username', loggedUser, async function (req, res, next) {
    try {
        if ('username' in req.body) {
            throw new ExpressError('Sorry you can not update the User username.', 400);
        }
        const validation = validate(req.body, user_schema_update);
        if (!validation.valid) {
            throw new ExpressError(validation.errors.map(e => e.stack), 400);
        }
        const user = await User.update(req.params.username, req.body);
        return res.json({ user });
    } catch (err) {
        return next(err);
    }
});

//Delete a user by username
router.delete('/:username', loggedUser, async function (req, res, next) {
    try {
        await User.remove(req.params.username);
        return res.json({ message: 'User deleted' });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
