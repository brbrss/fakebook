
let { MongoClient } = require('mongodb');
let { MongoMemoryReplSet } = require('mongodb-memory-server');
const { InvalidIdError } = require('./modelError');

const Post = require('./post');
const User = require('./user');

const UID = ['13', '1', '5', '56', '33'];


async function createUser() {
    for (let k of UID) {
        await User.create(String(k), 'haha', 'bwbw', new Date());
    }
}


describe('post', () => {
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
        Post.inject(con);
        User.inject(con);
        await createUser();
    });

    afterEach(async () => {
        await con.db('book').dropDatabase();
    });

    it('test setup is correct', async () => {

    });


    it('insert', async () => {
        const id1 = await Post.createPost(UID[0], "aa");
        await Post.createPost(UID[1], "bb");
        const id3 = await Post.createPost(UID[2], "ccc");

        const p1 = await Post.get(id1);
        expect(p1.author).toBe(UID[0]);
        expect(p1.content).toBe('aa');

        const p3 = await Post.get(id3);
        expect(p3.author).toBe(UID[2]);
        expect(p3.content).toBe('ccc');
    });

});



describe('post error', () => {
    let con;
    let mongoServer;

    beforeAll(async () => {


    });

    afterAll(async () => {

    });

    beforeEach(async () => {
        mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
        con = await MongoClient.connect(mongoServer.getUri(), { serverSelectionTimeoutMS: 500 });

        Post.inject(con);
        User.inject(con);
        await createUser();
    });

    afterEach(async () => {
        //await con.db('book').dropDatabase();
        if (con) {
            await con.close();
        }
        if (mongoServer) {
            await mongoServer.stop();
        }
    });

    it('test setup is correct', async () => {

    });



    it('get wrong pid', async () => {
        await expect(Post.getComment('123456789012', 0, 10)).rejects.toThrow();
    });

    it('getComment wrong pid', async () => {
        await expect(Post.getComment('123456789012', 0, 10)).rejects.toThrow();
    });

    it('get db error', async () => {
        await mongoServer.stop();
        try {
            await Post.get('123456789012');
        } catch (err) {
            err.name;
        }

        // await expect(Post.get('123456789012')).rejects.toThrow();
    });

    it('db error', async () => {
        const id1 = await Post.createPost(UID[0], "aa");
        await Post.createComment(UID[0], id1, 'haha comment');
        //expect(await Post.getComment(id1, 0, 10)).toHaveLength(1);
        await mongoServer.stop();
        await expect(Post.getComment(id1, 0, 10)).rejects.toThrow();
    });


});



describe('query timeline', () => {
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
        Post.inject(con);
        User.inject(con);
        await createUser();
    });

    afterEach(async () => {
        await con.db('book').dropDatabase();
    });


    it('get self', async () => {
        for (let i = 0; i < 100; i++) {
            const uid = i % 2 ? UID[3] : UID[1];
            const content = "This is post no. " + i;
            await Post.createPost(uid, content);
        }

        const ar1 = await Post.getSelfRecent(UID[3], null, 10);
        //const ar2 = await Post.getSelfRecent(UID[3], 10, 10);
        expect(ar1).toHaveLength(10);
        // expect(ar2).toHaveLength(10);
        expect(ar1[0].content).toBe('This is post no. 99');
        expect(ar1[9].content).toBe('This is post no. ' + (99 - 2 * 9));
        //expect(ar2[9].content).toBe('This is post no. ' + (99 - 2 * 19));
    });

    it('get self skip', async () => {
        for (let i = 0; i < 100; i++) {
            const uid = UID[3];
            const content = "This is post no. " + i;
            await Post.createPost(uid, content);
        }

        const ar1 = await Post.getSelfRecent(UID[3], null, 10);
        const ar2 = await Post.getSelfRecent(UID[3], ar1[9]._id, 10);
        expect(ar1).toHaveLength(10);
        expect(ar2).toHaveLength(10);
        expect(ar1[0].content).toBe('This is post no. 99');
        expect(ar1[9].content).toBe('This is post no. ' + 90);
        expect(ar2[0].content).toBe('This is post no. ' + 89);
        expect(ar2[9].content).toBe('This is post no. ' + 80);
    });

    it('get self -- over', async () => {
        for (let i = 0; i < 10; i++) {
            const uid = UID[3];
            const content = "This is post no. " + i;
            await Post.createPost(uid, content);
        }

        const ar1 = await Post.getSelfRecent(UID[3], null, 10);
        const ar2 = await Post.getSelfRecent(UID[3], ar1[9]._id, 10);
        const ar3 = await Post.getSelfRecent(UID[3], ar1[4]._id, 10);

        expect(ar1).toHaveLength(10);
        expect(ar2).toHaveLength(0);
        expect(ar3).toHaveLength(5);
        expect(ar1[0].content).toBe('This is post no. 9');

        const ar4 = await Post.getSelfRecent(UID[3], ar1[4]._id, 10, true);
        expect(ar4).toHaveLength(4);
        expect(ar4[0].content).toBe(ar1[3].content);

    });

    it('get self error', async () => {
        for (let i = 0; i < 50; i++) {
            const uid = UID[3];
            const content = "This is post no. " + i;
            await Post.createPost(uid, content);
        }

        await Post.getSelfRecent(UID[3], null, '???', true);
        await expect(Post.getSelfRecent(UID[3], '???', '???', true)).rejects.toThrow(InvalidIdError);

    });


    it('friend', async () => {
        await User.create(1, 'Alice', 'Alison');
        await User.create(2, 'Bob', 'Beard');
        await User.create(3, 'Carol', 'Carloman');
        await User.create(4, 'David', 'Ding');
        await User.addFriend(1, 2);
        await User.addFriend(1, 4);

        await Post.createPost(1, 'haha 1'); // y
        await Post.createPost(3, 'haha 2'); // n
        await Post.createPost(1, 'haha 3'); // y
        await Post.createPost(2, 'haha 4'); // y
        await Post.createPost(3, 'haha 5'); // n
        await Post.createPost(4, 'haha 6'); // y

        const arr = await Post.getSelfAndFriendRecent(1, null, 10);

        expect(arr).toHaveLength(4);

        expect(arr[0].author).toBe(4);
        expect(arr[1].author).toBe(2);
        expect(arr[2].author).toBe(1);
        expect(arr[3].author).toBe(1);
        const arr2 = await Post.getSelfAndFriendRecent(1, arr[1]._id, 10, true);
        expect(arr2).toHaveLength(1);
        expect(arr2[0].author).toBe(arr[0].author);
        //expect(arr2[1]._id).toBe(arr[1]._id);
        //expect(arr2[2]._id).toBe(arr[0]._id);

    });

    it('comment', async () => {
        const id = await Post.createPost(UID[3], "sss");
        for (let i = 0; i <= 230; i++) {
            const content = "This is comment no. " + i;
            await Post.createComment(UID[2], id, content)
        }
        const ar1 = await Post.getComment(id, null, 5);
        const ar2 = await Post.getComment(id, ar1[4]._id, 10);
        const ar3 = await Post.getComment(id, ar2[5]._id, 2, true);

        expect(ar1).toHaveLength(5);
        expect(ar1[0].content).toBe('This is comment no. 230');
        expect(ar2).toHaveLength(10);
        expect(ar2[0].content).toBe('This is comment no. 225');
        expect(ar2[9].content).toBe('This is comment no. 216');
        expect(ar3[0].content).toBe(ar2[4].content);
        expect(ar3[1].content).toBe(ar2[3].content);

    });

});

