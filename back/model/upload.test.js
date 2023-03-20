/* eslint-disable @typescript-eslint/no-non-null-assertion */
let { MongoClient } = require('mongodb');
let { MongoMemoryReplSet } = require('mongodb-memory-server');
const fs = require('fs/promises');

const Model = require('./upload');

describe('upload', () => {
    let con;
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
        con = await MongoClient.connect(mongoServer.getUri(), {});
    });

    afterAll(async () => {
        if (con) {
            await con.close();
        }
        if (mongoServer) {
            await mongoServer.stop();
        }
    });

    beforeEach(async () => {
        Model.inject(con);
    });

    afterEach(async () => {
        await con.db('book').dropDatabase();
    });

    it('test setup is correct', async () => {

    });


    it('upload', async () => {
        fs.appendFile('tmp/thing.txt', 'Hello content!', function (err) {
            if (err) throw err;
            console.log('Saved!');
        });
        const fid = await Model.insert(435, 'tmp/thing.txt', 'hello.txt');
        const res = await Model.get(fid);
        expect(res.title).toBe('hello.txt');
        expect(res.path).toBe(fid + '.txt');
        expect(res.owner).toBe(435);

    });

    it('remove bad', async () => {
        const res = await Model.remove("63655bbdb1529b41467b3abb");
    });

    it('remove', async () => {
        fs.appendFile('tmp/thing.txt', 'Hello content!', function (err) {
            if (err) throw err;
            console.log('Saved!');
        });
        const fid = await Model.insert(435, 'tmp/thing.txt', 'hello.txt');
        const res = await Model.get(fid);
        expect(res.path).toBe(fid + '.txt');
        expect(await fs.stat('upload/'+res.path)).toBeTruthy();
        await Model.remove(fid+'.txt');
        const res2 = await Model.get(fid);
        expect(res2).toBeNull();
        await expect(fs.stat('upload/'+res.path)).rejects
            .toThrow();
    
    });

});
