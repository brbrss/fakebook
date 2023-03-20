/* eslint-disable @typescript-eslint/no-non-null-assertion */
let { MongoClient } = require('mongodb');
let { MongoMemoryReplSet } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');
const path = require('path');
const process = require('node:process');




const thingpath = "i:/html/odin/book/test/thing.txt";


describe('authorization ', () => {
    let con;
    let mongoServer;

    let app;

    beforeAll(async () => {
        mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
        con = await MongoClient.connect(mongoServer.getUri(), {});

        //con = await MongoClient.connect('mongodb://localhost:27017');

        app = express();

        app.use(express.urlencoded({ extended: false }));
        const cookieParser = require('cookie-parser');
        app.use(cookieParser());
        const flash = require("connect-flash");
        app.use(flash());
        const session = require('express-session');
        const passport = require('passport');
        const MongoStore = require('connect-mongo');

        require('dotenv').config();
        app.use(session({
            secret: process.env.SERVER_SECRET,
            resave: false,
            saveUninitialized: false,
            store: MongoStore.create({
                client: con,
                dbName: 'book'
            })
        }));
        app.use(passport.authenticate('session'));

        const credentialRouter = require('./credential');
        app.use('/cre', credentialRouter);

        app.get('/foobar', function (req, res) {
            if (req.user) {
                res.status(200).send(req.user.username);
            } else {
                res.status(204).send('');
            }
        });
        app.get('/', function (req, res) {
            if (req.user) {
                res.status(200).send(req.user.username);
            } else {
                res.status(204).send('');
            }
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
        const Credential = require('../model/credential');
        Credential.inject(con);
    });

    afterEach(async () => {
        await con.db('book').dropDatabase();
    });

    it('test setup is correct', async () => {

    });


    it('one', async () => {
        const name = 'bibiha';
        const pw = 'eeaaww';
        await request(app)
            .post('/cre/signup')
            .type('form')
            .send({ username: name, password: pw });
        //.field('username', name)
        //.field('password', pw);

        await request(app)
            .post('/cre/login')
            .field('username', name)
            .field('password', pw);


    });

    it('two', async () => {
        const agent = request.agent(app);
        const name = 'bibiha';
        const pw = 'eeaaww';

        const User = require('../model/user');
        User.inject(con);
        const model = require('../model/credential');
        const bd = new Date(2000, 3, 4);
        {
            const res = await agent
                .post('/cre/signup')
                .type('form')
                .send({ username: name, password: pw, firstName: 'aba', lastName: 'wowo', birthday: bd });
            expect(await model.has(name)).toBe(1);
        }
        {
            const acc = await model.getByUsername(name);
            const u = await User.get(acc._id);
            expect(u.firstName).toBe('aba');
            expect(u.birthday).toEqual(bd);

            const res = await agent
                .get('/foobar');
            // expect(res.status).toEqual(204);
        }

    });



});
