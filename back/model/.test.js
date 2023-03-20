/* eslint-disable @typescript-eslint/no-non-null-assertion */
let { MongoClient } = require('mongodb');
let { MongoMemoryReplSet } = require('mongodb-memory-server');


describe('trial ', () => {
    let con;
    let mongoServer;
    let col;

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
        col = con.db('book').collection('haha');
    });

    afterEach(async () => {
        await con.db('book').dropDatabase();
    });

    it('test setup is correct', async () => {

    });


    it('insert', async () => {
        let data = [
            {
                x: 571,
                lst: [1, 2, 3, 4, 5, 6]
            },
            {
                x: 863,
                lst: [1, 2, 3]
            },
            {
                x: 228,
                lst: []
            }
        ];
        await col.insertMany(data);

        const res = await col.aggregate([
            {
                $match: {
                    x: { $gt: 300 }
                }
            },
            {
                $addFields: {
                    sz:
                        { $size: "$lst" }
                }
            },
            {
                $sort: { sz: 1 }
            }
        ]);
        expect(await col.find().count()).toBe(3);
        const arr = await res.toArray();
        expect(arr).toHaveLength(2);

        expect(arr[1].sz).toBe(6);
        expect(arr[1].x).toBe(571);

        expect(arr[0].sz).toBe(3);
        expect(arr[0].x).toBe(863);
        //expect(arr[2].sz).toBe(0);


    });


    it('cursor count', async () => {
        let data = [];
        for (let i = 0; i < 210; i++) {
            let d = { x: i % 7, y: i * i };
            data.push(d);
        }
        await col.insertMany(data);
        let cursor = await col.find({ x: 0 })
        expect(await cursor.count()).toBe(30);
        cursor = cursor.limit(13);
        expect(await cursor.count()).toBe(13);

    });

});
