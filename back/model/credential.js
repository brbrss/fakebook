
let { ObjectId } = require('mongodb');
const { DbConnectionError, InvalidIdError, AuthenticationError } = require('./modelError');


let crypto = require('crypto');

const Credential = {};


Credential.dbname = 'book';
Credential.colname = 'account';



Credential.inject = function (con) {
    Credential.col = con.db(Credential.dbname).collection(Credential.colname);
}

Credential.shutdown = async function () {
    await Credential.client.close();
};

Credential.getByUsername = async function (username) {
    try {

        const res = await this.col.findOne({ username: username });
        if (res?._id) {
            return { ...res, _id: res._id.toHexString() };
        }
        return res;
    } catch (err) {
        throw new DbConnectionError();
    }
}

Credential.getById = async function (uid) {
    try {
        uid = ObjectId(uid);
    }
    catch (err) {
        throw new InvalidIdError();
    }
    try {
        const res = await this.col.findOne({ _id: ObjectId(uid) });
        return res;
    } catch (err) {
        throw new DbConnectionError();
    }
}

Credential.rawInsert = async function (user) {
    try {
        let result = await this.col.insertOne(user);
        return result.insertedId.toHexString();
    } catch (err) {
        throw new DbConnectionError();
    }
}

Credential.create = async function (username, password) {
    let exist = await this.has(username);
    if (exist) {
        throw Error("Username already exists");
    }
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPw = await this.hashFunPromise(password, salt);
    const user = { username: username, salt: salt, hashedPw: hashedPw };
    try {
        return await this.rawInsert(user);
    } catch (err) {
        throw new DbConnectionError();
    }
}

/**
 * 
 * @returns num of records
 */
Credential.count = async function () {
    try {
        const res = await this.col.count();
        return res;
    } catch (err) {
        throw new DbConnectionError();
    }
}

/**
 * detects if username is in database
 * 
 * @param {*} username to be found
 * @returns num of matches
 */
Credential.has = async function (username) {
    try {
        const res = await this.col.count({ username: username });
        return res;
    } catch (err) {
        throw new DbConnectionError();
    }
}

Credential.verify = async function (username, password) {
    const user = await Credential.getByUsername(username);
    if (user === null) {
        throw new AuthenticationError("Unknown username");
    }
    const hashedPw = await Credential.hashFunPromise(password, user.salt);
    if (hashedPw !== user.hashedPw) {
        throw new AuthenticationError("Incorrect password");
    }
    else {
        return { username: username, uid: user._id };
    }

}

Credential.hashFun = function (password, salt, cb) {
    crypto.pbkdf2(password, salt, 320000, 32, 'sha256', cb);
}

Credential.hashFunPromise = function (password, salt) {
    function pfun(res, rej) {
        let _cb = function (err, derivedKey) {
            if (err) {
                rej(err);
            } else {
                res(derivedKey.toString('hex'));
            }
        }
        Credential.hashFun(password, salt, _cb);
    }
    return new Promise(pfun);
}

module.exports = Credential;
