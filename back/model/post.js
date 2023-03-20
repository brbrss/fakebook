let { ObjectId } = require('mongodb');
const User = require('./user');
const { DbConnectionError, InvalidIdError, OperationError } = require('./modelError');

const Post = {};

Post.dbname = 'book';

Post.inject = function (con) {
    this.db = con.db(this.dbname);
    this.post = this.db.collection('post');
    this.comment = this.db.collection('comment');
}

Post.createPost = async function (uid, content, imgList) {
    const u = await User.shortGet(uid);
    const post = {};
    post.content = content;
    post.author = uid;
    post.name = u.firstName + ' ' + u.lastName;
    post.date = new Date();
    post.like = [];
    post.comment = [];
    post.imgList = imgList;
    try {
        const res = await this.post.insertOne(post);
        return res.insertedId.toString();
    } catch (err) {
        throw new DbConnectionError();
    }
}

Post.createComment = async function (uid, pid, content) {
    const u = await User.shortGet(uid);
    const c = {};
    c.content = content;
    c.author = uid;
    c.name = u.firstName + ' ' + u.lastName;
    c.date = new Date();

    const res = await this.comment.insertOne(c);
    const cid = res.insertedId;
    try {
        await this.post.updateOne({ _id: ObjectId(pid) }, { $addToSet: { comment: cid } });
    } catch (err) {
        throw new DbConnectionError();
    }
    return cid;
}

Post.like = async function (uid, pid) {
    const p = await this.get(pid);
    if (p.author === uid) {
        throw OperationError('Cannot like self.');
    }
    try {
        await this.post.updateOne({ _id: ObjectId(pid) }, { $addToSet: { like: uid } });
    } catch (err) {
        throw new DbConnectionError();
    }
}

/**
 * Get post by id
 * @param {*} id id
 * @returns post or null
 */
Post.get = async function (id) {
    try {
        id = ObjectId(id);
    }
    catch (err) {
        throw new InvalidIdError();
    }
    try {
        const res = await this.post.findOne({ _id: ObjectId(id) });
        if (res === null) {
            throw new InvalidIdError('not found');
        }
        return res;
    } catch (err) {
        throw new DbConnectionError('db connection failed', { cause: err });
    }
}

/**
 * Returns k items strictly before a
 * 
 * To get first page, use args (uid,null,k)
 * 
 * To get next page of results, next call should use args (uid,a,k),
 * where a is smallest id from prior result
 * 
 * @param {*} uid 
 * @param {*} a id bound
 * @param {*} k number of items
 * @param {*} rev true for results with id larger than bound, false for smaller
 * @returns array of results
 */
Post.getSelfRecent = async function (uid, a, k, rev) {
    try {
        a = ObjectId(a);
    }
    catch (err) {
        throw new InvalidIdError();
    }
    k = Number(k);
    const filter = { author: uid };
    if (a) {
        const idCondition = rev ? { $gt: ObjectId(a) } : { $lt: ObjectId(a) };
        filter['_id'] = idCondition;
    }
    let cursor;
    try {
        cursor = this.post.find(filter);
    } catch (err) {
        throw new DbConnectionError('db connection failed', { cause: err });
    }
    const arr = await cursor.sort({ date: rev ? 1 : -1 }).limit(k).toArray();
    return arr;
}

Post.getSelfAndFriendRecent = async function (uid, a, k, rev) {
    try {
        a = ObjectId(a);
    }
    catch (err) {
        throw new InvalidIdError();
    }
    const user = await this.db.collection('user').findOne({ uid: uid });
    const flst = user.friendList;
    flst.push(uid);

    let filter;
    if (a) {
        const idCondition = rev ? { $gt: ObjectId(a) } : { $lt: ObjectId(a) };
        filter = { author: { $in: flst }, _id: idCondition };
    } else {
        filter = { author: { $in: flst } };
    }
    let cursor;
    try {
        cursor = this.post.find(filter);
    } catch (err) {
        throw new DbConnectionError('db connection failed', { cause: err });
    }
    const arr = await cursor.sort({ date: rev ? 1 : -1 }).limit(k).toArray();
    return arr;
}

Post.getComment = async function (pid, a, k, rev) {
    try {
        a = ObjectId(a);
    }
    catch (err) {
        throw new InvalidIdError();
    }
    const p = await this.get(pid);
    let filter;
    if (a) {
        const idCondition = rev ? { $in: p.comment, $gt: ObjectId(a) } : { $in: p.comment, $lt: ObjectId(a) };
        filter = { _id: idCondition };
    } else {
        filter = { _id: { $in: p.comment } };
    }
    let cursor;
    try {
        cursor = this.comment.find(filter);
    } catch (err) {
        throw new DbConnectionError('db connection failed', { cause: err });
    }
    if (rev) {
        const arr = await cursor.sort({ date: 1 }).limit(k).toArray();
        return arr;
    } else {
        const arr = await cursor.sort({ date: -1 }).limit(k).toArray();
        return arr;
    }
}

module.exports = Post;
