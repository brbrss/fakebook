/* eslint-disable @typescript-eslint/no-non-null-assertion */
let { MongoClient } = require('mongodb');
let { MongoMemoryReplSet } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');
const path = require('path');
const process = require('node:process');

const Upload = require('../model/upload');



const thingpath = "i:/html/odin/book/test/thing.txt";

 
describe('upload ', () => {
    let con;
    let mongoServer;

    let app;

    beforeAll(async () => {
        mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
        con = await MongoClient.connect(mongoServer.getUri(), {});

        //con = await MongoClient.connect('mongodb://localhost:27017');

        app = express();

        app.use(express.urlencoded({ extended: false }));
        const fileUpload = require('express-fileupload');

        app.use(fileUpload({
            useTempFiles: true,
            tempFileDir: path.join(process.cwd(), 'tmp')
        }));

        const uploadRouter = require('./upload');
        app.use('/upload', uploadRouter);

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
        Upload.inject(con);



    });

    afterEach(async () => {
        await con.db('book').dropDatabase();
    });

    it('test setup is correct', async () => {
        const fs = require('fs/promises');
        let ff = await fs.open('./test/thing.txt');
        await ff.close();
    });



    it('one', async () => {
        const fp = path.join(process.cwd(), './test/thing.txt');
        const res = await request(app)
            .post('/upload')
            .attach('f', fp);
        expect(res.text).toEqual('good');
    });



});
