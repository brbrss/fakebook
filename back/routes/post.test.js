
let { MongoClient, ObjectId } = require('mongodb');
let { MongoMemoryReplSet } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');
const path = require('path');
const process = require('node:process');

const Post = require('../model/post');
const User = require('../model/user');


const IDLIST = ['551234567890', '651234567890', '751234567890'];

let USERNAME = 'awesome';
let UID = IDLIST[0];


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
    {

        const u = {};
        u.firstName = "dada";
        u.lastName = "bebe";
        u.uid = '951234567890';
        u.birthday = new Date(1900, 1, 4);
        u.info = 'bilibili';
        u.avatar = '';
        u.friendList = [];
        u.pendingRequestList = [];
        await con.db('book').collection('user').insertOne(u);
    }
}

describe('post ', () => {
    let con;
    let mongoServer;

    let app;

    beforeAll(async () => {
        mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
        con = await MongoClient.connect(mongoServer.getUri(), {});

        //con = await MongoClient.connect('mongodb://localhost:27017');

        app = express();
        app.use(express.urlencoded({ extended: false }));

        app.use(fakeuser);

        const postRouter = require('./post');
        app.use('/post', postRouter);

        app.post('/foobar', function (req, res) {
            res.status(200).json({ name: 'john' });
        });


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
        await insertUser(con);
        Post.inject(con);
        User.inject(con);
    });

    afterEach(async () => {
        await con.db('book').dropDatabase();
    });

    it('test setup is correct', async () => {
    });



    it('one', async () => {

        const res = await request(app)
            .post('/post/write')
            .type('form')
            .send({ content: "hahaha" });
        expect(res.text).toBeTruthy();
    });

    it('get', async () => {

        const res = await request(app)
            .post('/post/write')
            .type('form')
            .send({ content: "hahaha" });

        const res2 = await request(app)
            .get('/post/get/' + res.text);
        expect(res2.body.content).toBe("hahaha");
    });


    it('timeline', async () => {

        await request(app)
            .post('/post/write')
            .type('form')
            .send({ content: "hahaha" });

        const res = await request(app)
            .get('/post/timeline/' + UID);
        expect(res.status).toEqual(200);

        const jdata = res.body;
        expect(jdata).toHaveLength(1);
    });

    it('like', async () => {
        UID = IDLIST[0];
        const res = await request(app)
            .post('/post/write')
            .type('form')
            .send({ content: "hahaha" });

        UID = IDLIST[1];
        const res2 = await request(app)
            .post('/post/like/' + res.text);
        const res3 = await request(app)
            .get('/post/get/' + res.text);
        expect(res3.body.like.length).toBe(1);
    });

    it('like self', async () => {
        UID = IDLIST[0];

        const res = await request(app)
            .post('/post/write')
            .type('form')
            .send({ content: "hahaha" });
        const res2 = await request(app)
            .post('/post/like/' + res.text);
        const res3 = await request(app)
            .get('/post/get/' + res.text);
        expect(res3.body.like.length).toBe(0);
    });

    it('comment', async () => {
        UID = IDLIST[0];

        const res = await request(app)
            .post('/post/write')
            .type('form')
            .send({ content: "hahaha" });
        const res2 = await request(app)
            .post('/post/comment/' + res.text)
            .type('form')
            .send({ content: "quicks" });
        const res3 = await request(app)
            .get('/post/comment/' + res.text + '?count=10');
        expect(res3.body.length).toBe(1);
    });


});
