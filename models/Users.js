/** User for jobly */

const db = require("../db");
const ExpressError = require("../helpers/ExpressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");


/** User. */

class User {
    constructor({ username, password, first_name, last_name, email, photo_url, is_admin }) {
        this.username = username;
        this.password = password;
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.photo_url = photo_url;
        this.is_admin = is_admin;
    }

    /** find all User. */

    static async all() {
        const results = await db.query(
            `SELECT username, 
         first_name, 
         last_name, 
         email
       FROM users`
        );
        return results.rows.map(c => new User(c));
    }

    //finds single user
    static async singleUser(username) {
        const results = await db.query(
            `SELECT username,
      first_name,
      last_name,
      email,
      photo_url
    FROM users WHERE username = $1`,
            [username]
        );

        const users = results.rows[0];

        if (users === undefined) {
            const err = new Error(`No such User: ${username}`);
            err.status = 404;
            throw err;
        }

        return new User(users);
    }

    //finds single user and Authenticates, adds is_admin
    static async AuthSingleUser(username) {
        const results = await db.query(
            `SELECT username,
      first_name,
      last_name,
      email,
      photo_url,
      is_admin
    FROM users WHERE username = $1`,
            [username]
        );

        const users = results.rows[0];

        if (users === undefined) {
            const err = new Error(`No such User: ${username}`);
            err.status = 404;
            throw err;
        }

        return new User(users);
    }


    /** save created users. */

    async save() {
        const result = await db.query(
            `INSERT INTO users (username, password, first_name, last_name, email, photo_url)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING username, password, first_name, last_name, email, photo_url`,
            [this.username, this.password, this.first_name, this.last_name, this.email, this.photo_url]
        );
        this.username = result.rows[0].username;
    }

    //Update information on a user

    static async update(username, data) {
        let { query, values } = sqlForPartialUpdate(
            "users",
            data,
            "username",
            username
        );
        const result = await db.query(query, values);
        const user = result.rows[0];
        if (!user) {
            throw new ExpressError(`There exists no User '${username}`, 404);
        }
        return user;
    }

    //Delete an User

    static async remove(username) {
        const result = await db.query(
            `DELETE FROM users 
          WHERE username = $1 
          RETURNING username`,
            [username]
        );
        if (result.rows.length === 0) {
            throw new ExpressError(`There exists no company '${username}`, 404);
        }
    }
}

module.exports = User;
