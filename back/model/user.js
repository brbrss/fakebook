
const { DbConnectionError, InvalidIdError, OperationError, InputError } = require('./modelError');

const User = {};

User.dbname = 'book';
User.colname = 'user';


User.inject = function (con) {
    User.client = con;
    User.col = User.client.db(User.dbname).collection(User.colname);
}

User.create = async function (uid, firstName, lastName, birthday) {
    const u = {};
    u.firstName = firstName;
    u.lastName = lastName;
    u.uid = uid;
    u.birthday = birthday;
    u.info = '';
    u.avatar = '';
    u.friendList = [];
    u.pendingRequestList = [];
    try {
        await User.col.insertOne(u);
    } catch (err) {
        throw new DbConnectionError();
    }
}

User.get = async function (uid) {
    try {
        const res = await User.col.findOne({ uid: uid });
        if (!res) {
            throw new InvalidIdError();
        }
        return res;
    } catch (err) {
        throw new DbConnectionError();
    }
}

User.update = async function (data) {
    if (!data.uid) {
        throw new InvalidIdError('No uid in input');
    }
    const validField = ['uid', 'firstName', 'lastName', 'birthday', 'info','avatar'];
    const cpy = {};
    for (const k in data) {
        if (k === 'friendList' || k === 'pendingRequestList') {
            throw new InputError('Malicious input')
        }
        if (!validField.includes(k)) {
            throw new InputError('Invalid Update Field');
        }
        if (k !== 'uid') {
            cpy[k] = data[k];
        }
        if (k === 'birthday') {
            cpy[k] = new Date(data[k]);

        }
    }
    try {
        return await User.col.updateOne({ uid: data.uid },
            { $set: cpy });
    } catch (err) {
        throw new DbConnectionError();
    }
}

/**
 * Gets basic info of user
 * @param {*} uid 
 * @returns 
 */
User.shortGet = async function (uid) {
    const options = { projection: { friendList: 0, pendingRequestList: 0 } };
    let res;
    try {
        res = await User.col.findOne({ uid: uid }, options);
    } catch (err) {
        throw new DbConnectionError();
    }
    if (!res) {
        throw new InvalidIdError();
    }
    return res;
}

User.addFriend = async function (uid1, uid2) {

    const session = this.client.startSession();

    const transactionOptions = {
        readPreference: 'primary',
        readConcern: { level: 'local' },
        writeConcern: { w: 'majority' }
    };
    const cb = async () => {
        await this.col.updateOne({ uid: uid1 }, { $addToSet: { friendList: uid2 } }, { session });
        await this.col.updateOne({ uid: uid2 }, { $addToSet: { friendList: uid1 } }, { session });
    }
    try {
        await session.withTransaction(cb, transactionOptions);
    } catch (err) {
        throw new DbConnectionError();
    } finally {
        await session.endSession();
    }
    return true;
}

User.requestFriend = async function (fromId, toId) {
    const u2 = await this.get(toId);
    if (fromId === toId) {
        return new OperationError();
    }
    if (u2.pendingRequestList.includes(fromId)) {
        return new OperationError();
    } else {
        try {
            await this.col.updateOne({ uid: toId }, { $addToSet: { pendingRequestList: fromId } });
            return true;
        } catch (err) {
            throw new DbConnectionError();
        }
    }
}

User.acceptRequest = async function (uid, fromId) {
    const u2 = await this.get(uid);
    if (!u2.pendingRequestList.includes(fromId)) {
        throw new OperationError();
    }
    const session = this.client.startSession();

    const transactionOptions = {
        readPreference: 'primary',
        readConcern: { level: 'local' },
        writeConcern: { w: 'majority' }
    };
    const cb = async () => {
        await this.col.updateOne({ uid: uid }, { $addToSet: { friendList: fromId } }, { session });
        await this.col.updateOne({ uid: fromId }, { $addToSet: { friendList: uid } }, { session });

        await this.col.updateOne({ uid: uid }, { $pull: { pendingRequestList: fromId } }, { session });
    }
    let res = {};
    try {
        res = await session.withTransaction(cb, transactionOptions);
    } catch (err) {
        throw new DbConnectionError();
    } finally {
        await session.endSession();
    }
    if (res.ok === 1) {
        return true;
    } else {
        return false;
    }
}

User.declineRequest = async function (uid, fromId) {
    try {
        await this.col.updateOne({ uid: uid }, { $pull: { pendingRequestList: fromId } });
        return true;
    } catch (err) {
        throw new DbConnectionError();
    }
}

User.listPeople = async function (uid) {
    const pipeline = [
        {
            $project: {
                _id: 0,
                firstName: 1,
                lastName: 1,
                uid: 1,
                avatar: 1,
                isRequested: { $in: [uid, "$pendingRequestList"] },
                isFriend: { $in: [uid, "$friendList"] }
            }
        },
    ];
    try {
        const res = await this.col.aggregate(pipeline);
        return res.toArray();
    } catch (err) {
        throw new DbConnectionError();
    }
}

User.friendList = async function (uid) {
    const options = { projection: { friendList: 1 } };
    const res = await User.col.findOne({ uid: uid }, options);
    return res.friendList.toArray();
}
module.exports = User;
