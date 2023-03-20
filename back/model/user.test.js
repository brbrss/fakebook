/* eslint-disable @typescript-eslint/no-non-null-assertion */
let { MongoClient } = require('mongodb');
let { MongoMemoryReplSet } = require('mongodb-memory-server');

const Model = require('./user');

describe('user', () => {
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
        await Model.create(123, 'Alice', 'Alison');
        await Model.create(456, 'Bob', 'Barber');
    });

    afterEach(async () => {
        await con.db('book').dropDatabase();
    });

    it('test setup is correct', async () => {

    });


    it('find', async () => {
        const u1 = await Model.get(123);
        expect(u1.firstName).toBe('Alice');
        await expect(Model.get(111)).rejects.toThrow();
    });

    it('date', async () => {
        const bd = new Date(1999, 9, 24);
        await Model.create(5555, 'We', 'Wa', bd);

        const u1 = await Model.get(5555);
        expect(u1.birthday).toEqual(bd);

    });

    it('update', async () => {
        const bd = new Date(1999, 9, 24);
        await Model.create(555, 'We', 'Wapp', bd);
        const data = { uid: 555, info: 'honeybee', lastName: 'Lorem' };
        await Model.update(data)
        const u1 = await Model.get(555);
        expect(u1.info).toEqual('honeybee');
        expect(u1.lastName).toEqual('Lorem');
    });

    it('update error', async () => {
        const bd = new Date(1999, 9, 24);
        await Model.create(555, 'We', 'Wapp', bd);
        const data = { uid: 555, info: 'honeybee', friendList: 'wolf' };

        await expect(Model.update(data)).rejects
            .toThrow();
        const data2 = { info: 'honeybee' };
        await expect(Model.update(data2)).rejects
            .toThrow();
    });

    it('friend', async () => {
        await Model.addFriend(123, 456);

        const u1 = await Model.get(123);
        expect(u1.friendList).toContain(456);
        expect(u1.friendList).toHaveLength(1);

        const u2 = await Model.get(456);
        expect(u2.friendList).toContain(123);
        expect(u2.friendList).toHaveLength(1);
    });

    it('friend again', async () => {
        await Model.addFriend(123, 456);
        await Model.addFriend(456, 123);

        const u1 = await Model.get(123);
        expect(u1.friendList).toContain(456);
        expect(u1.friendList).toHaveLength(1);

        const u2 = await Model.get(456);
        expect(u2.friendList).toContain(123);
        expect(u2.friendList).toHaveLength(1);
    });

    it('friend request', async () => {
        await Model.requestFriend(123, 456);
        {
            const u2 = await Model.get(456);
            expect(u2.pendingRequestList).toContain(123);
            expect(u2.pendingRequestList).toHaveLength(1);
        }
        {
            let res = await Model.acceptRequest(456, 123);
            expect(res).toBeTruthy();

            const u22 = await Model.get(456);
            expect(u22.pendingRequestList).toHaveLength(0);
            expect(u22.friendList).toContain(123);
        }

        const u1 = await Model.get(123);
        expect(u1.friendList).toContain(456);
    });

    it('friend decline', async () => {
        await Model.requestFriend(123, 456);

        {
            let res = await Model.declineRequest(456, 123);
            expect(res).toBeTruthy();

            const u22 = await Model.get(456);
            expect(u22.pendingRequestList).toHaveLength(0);
            expect(u22.friendList).not.toContain(123);
        }

        const u1 = await Model.get(123);
        expect(u1.friendList).not.toContain(456);
    });

    it('list people', async () => {
        for (let i = 0; i < 20; i++) {
            await Model.create(i, 'nono' + i, 'nono' + i);
        }

        await Model.addFriend(3, 2);
        await Model.addFriend(3, 9);
        await Model.requestFriend(3, 14);
        await Model.requestFriend(3, 19);

        const arr = await Model.listPeople(3);

        expect(arr).toHaveLength(22);
        for (const u of arr) {
            expect(u.isFriend).toBe(u.uid === 2 || u.uid === 9);
            expect(u.isRequested).toBe(u.uid === 14 || u.uid === 19);
            expect(u.friendList).toBeUndefined();
            expect(u.pendingRequestList).toBeUndefined();
        }

    });

});
