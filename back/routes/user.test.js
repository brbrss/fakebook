
let { MongoClient } = require('mongodb');
let { MongoMemoryReplSet } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');
const path = require('path');
const process = require('node:process');


const User = require('../model/user');
const Upload = require('../model/upload');


let USERNAME = 'awesome';
let UID = '551234567890';


function fakeuser(req, res, next) {
    req.user = { username: USERNAME, uid: UID };
    next();
}

async function insertUser(con) {
    {

        const u = {};
        u.firstName = "dada";
        u.lastName = "bebe";
        u.uid = '551234567890';
        u.birthday = new Date(1900, 1, 4);
        u.info = 'bilibili';
        u.avatar = '';
        u.friendList = [];
        u.pendingRequestList = [];
        await con.db('book').collection('user').insertOne(u);
    }

}


describe('user ', () => {
    let con;
    let mongoServer;

    let app;

    beforeAll(async () => {
        mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
        con = await MongoClient.connect(mongoServer.getUri(), {});


        app = express();

        app.use(express.urlencoded({ extended: false }));
        const fileUpload = require('express-fileupload');

        app.use(fileUpload({
            useTempFiles: true,
            tempFileDir: path.join(process.cwd(), 'tmp')
        }));


        app.use(fakeuser);

        const userRouter = require('./user');
        app.use('/user', userRouter);


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
        Upload.inject(con);
        User.inject(con);
        await insertUser(con);
    });

    afterEach(async () => {
        await con.db('book').dropDatabase();
    });

    it('test setup is correct', async () => {
        await con.db('book').collection('user').find({});
        await con.db('book').collection('upload').find({});
    });



    it('upload avatar', async () => {
        const fp = path.join(process.cwd(), './test/sss.bmp');
        await request(app)
            .post('/user/avatar')
            .attach('file', fp)
            .field('uid', UID);
        const res = await request(app)
            .get('/user/profile/' + UID);
        expect(res.body.avatar.length).toBeGreaterThan(0);
    });



});
