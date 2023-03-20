const path = require('path');
const fs = require('fs/promises');
const process = require('node:process');
let { ObjectId } = require('mongodb');
const { DbConnectionError, InvalidIdError } = require('./modelError');


const Upload = {};

const dbname = 'book';

function getPath(fname) {
    const fp = path.join(process.cwd(), 'upload', fname);
    return fp;
}

Upload.inject = function (con) {
    this.client = con;
    this.upload = con.db(dbname).collection('upload');
}

Upload.insert = async function (uid, tmppath, originalName) {
    const d = { owner: uid, title: originalName, path: '' };
    const res = await this.upload.insertOne(d);
    const idStr = res.insertedId.toString();
    const ext = path.extname(originalName);
    const fname = idStr + ext;
    const fp = getPath(fname);
    const cpyres = await fs.copyFile(tmppath, fp);
    await fs.rm(tmppath);
    if (cpyres) {
        throw Error("Copy failed: " + cpyres);
    }
    try {
        await this.upload.updateOne({ _id: res.insertedId }, { $set: { path: fname } });
        d._id = res.insertedId;
        d.path = fname;
        return d;
    } catch (err) {
        throw new DbConnectionError();
    }
}

Upload.remove = async function (fpath) {
    if (!fpath) {
        return;
    }
    let res;
    try {
        res = await this.upload.findOne({ path: fpath });
        if (!res) {
            return;
        }
    } catch (err) {
        throw new DbConnectionError();
    }
    const fp = getPath(res.path);
    await fs.rm(fp)
    try {
        await this.upload.deleteOne({ path: fpath });
    }
    catch (err) {
        throw new DbConnectionError();
    }
}

Upload.get = async function (fid) {
    try {
        fid = ObjectId(fid);
    } catch (err) {
        throw new InvalidIdError();
    }
    try {
        const res = await this.upload.findOne({ _id: ObjectId(fid) });
        return res;
    }
    catch (err) {
        throw new DbConnectionError();
    }
}

module.exports = Upload;
