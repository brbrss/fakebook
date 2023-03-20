
const { MongoClient } = require("mongodb");
const uri = "mongodb://localhost:27017";
let client = new MongoClient(uri);


const db = client.db('book');


async function reset(colname) {
    const res = await db.collection(colname).deleteMany({});
    const ackstr = res.acknowledged ? 'successful' : 'unsuccessful';
    console.log('Resetting', colname, ' is ', ackstr, '\n   # deleted: ', res.deletedCount);
}

async function main() {
    console.log('Starting script');
    await reset('user');
    await reset('sessions');
    await reset('account');
    await reset('upload');
    client.close();
    console.log('Script ended');
}

main();
