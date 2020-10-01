/** Routes for Jobly */

const express = require("express");
const User = require("../models/Users");
const ExpressError = require('../helpers/ExpressError');
const jwt = require("jsonwebtoken");
const createToken = require("../helpers/createToken");

const router = new express.Router();

/** List of Users. */

router.post("/login", async function (req, res, next) {
    try {
        const user = await User.AuthSingleUser(req.body.username);
        const token = createToken(user);
        return res.json({ token });

    } catch (err) {
        return next(err);
    }
});
module.exports = router;