/** Middleware for handling req authorization for routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError");

/** Auth JWT token, add auth'd user (if any) to req. */

function authToken(req, res, next) {
    try {
        const tokenFromBody = req.body._token;
        const payload = jwt.verify(tokenFromBody, SECRET_KEY);
        req.user = payload;
        return next();
    } catch (err) {
        // error in this middleware isn't error -- continue on
        return next();
    }
}

function adminToken(req, res, next) {
    try {
        const tokenStr = req.body._token;

        let token = jwt.verify(tokenStr, SECRET_KEY);
        res.locals.username = token.username;

        if (token.is_admin) {
            return next();
        }

        // throw an error, so we catch it in our catch, below
        throw new Error();
    } catch (err) {
        return next(new ExpressError("You must be an admin to access", 401));
    }
}

function loggedUser(req, res, next) {
    try {
        const tokenStr = req.body._token;

        let token = jwt.verify(tokenStr, SECRET_KEY);
        res.locals.username = token.username;

        if (token.username === req.params.username) {
            return next();
        }

        // throw an error, so we catch it in our catch, below
        throw new Error();
    } catch (err) {
        return next(new ExpressError("Unauthorized", 401));
    }
}
module.exports = {
    authToken,
    adminToken,
    loggedUser
};