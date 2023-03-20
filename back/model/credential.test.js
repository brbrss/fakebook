/* eslint-disable @typescript-eslint/no-non-null-assertion */
let { MongoClient } = require('mongodb');
let { MongoMemoryServer } = require('mongodb-memory-server');
const { db } = require('./credential');

let Model = require('./credential');

describe('Single MongoMemoryServer', () => {
    let con;
    let mongoServer;
    const dbname = Model.dbname;
    const colname = Model.colname;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();
        con = await MongoClient.connect(mongoServer.getUri(), {});

        const db = con.db(dbname);

        Model.client = con;
        Model.db = db;
        Model.col = db.collection(Model.colname);
    });

    afterEach(async () => {
        if (con) {
            await con.close();
        }
        if (mongoServer) {
            await mongoServer.stop();
        }
    });

    it('test setup is correct', async () => {

    });


    it('insert find', async () => {
        expect(await Model.has('nooo')).toBe(0);


        let user = { username: 'woo', salt: 'aabbcc', hashedPw: 'qwerasdf' };
        await con.db(dbname).collection(colname).insertOne(user);
        let get = await con.db(dbname).collection(colname).findOne({ username: 'woo' });
        expect(get.salt).toBe('aabbcc');

        const res = await Model.has('woo');
        expect(res).toBe(1);

        expect(await con.db(dbname).collection(colname).countDocuments({})).toBe(1);
    });


    it('second test cleanly resets', async () => {
        expect(await con.db(dbname).collection(colname).countDocuments({})).toBe(0);
    });


    it('get item', async () => {
        const name = 'aabbww44';
        const pw = ';8249u89';
        const uid = await Model.create(name, pw);
        const user = await Model.getById(uid);
        expect(user.username).toBe(name);

        const p2 = await Model.hashFunPromise(pw, user.salt);
        expect(p2).toBe(user.hashedPw);

    });

    it('count', async () => {
        expect(await Model.count()).toBe(0);
        await Model.create('ww', 'aaa');
        await Model.create('w4w', 'a5aa');
        await Model.create('w2w', 'aa5a');
        expect(await Model.count()).toBe(3);
    });

    it('dup', async () => {
        expect(await Model.count()).toBe(0);
        await Model.create('ww', 'aaa');
        await expect(Model.create('ww', 'a5aa')).rejects.toThrow();

    });

});
