/* Copyright (C) 2017 Project-ODE
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * ODE-FeatureService class to access htpasswd file
 * Author: Erwan Keribin
 */
'use strict';

const fs = require('fs');
const bcrypt = require('bcryptjs'); // Package chosen over bcrypt because it has fewer dependencies

class AuthFromHTPasswdFile {

    // htpasswd is expected to be created by the htpasswd utility with Bcrypt hashes
    constructor(filepath) {

        this.filepath = filepath;
        this.login_to_hash = {};
        var data;
        try {
            // Use synchronous reading to enforce initialization at construction
            data = fs.readFileSync(filepath, 'utf8');
        } catch (err) {
            err.suggestion = "Have you set a correct path for htpasswd file?";
            throw err;
        }
        for (let line of data.split('\n')) {
            if (line !== '') {
                var [login, hash] = line.split(':');
                this.login_to_hash[login] = hash;

            }
        }
    }

    authorize(login, password) {
        if (login in this.login_to_hash) {
            let hash = this.login_to_hash[login];
            let res = bcrypt.compareSync(password, hash);
            return res;
        }
        return false;

    }

}

module.exports = AuthFromHTPasswdFile;
