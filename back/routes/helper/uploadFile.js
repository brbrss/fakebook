const Upload = require('../../model/upload');


/**
 * Handles upload
 * 
 * Throws error if items in f is over maximum number .
 * 
 * @param {*} f entry in req.files
 * @param {*} num maximum number of files allowed, 0 for infinite
 * @return list of paths of uploaded files
*/
async function uploadFile(uid, f, num) {
    const itemList = [];
    async function loadOne(item) {
        const tmppath = item.tempFilePath;
        const originalName = item.name;
        const obj = await Upload.insert(uid, tmppath, originalName);
        //const path = await Upload.get(idstr);
        itemList.push(obj);
    }
    if (!f) {
        return [];
    }
    if (Array.isArray(f)) {
        if (num && f.length > Number(num)) {
            throw Error('Over limit: ' + num);
        }
        for (const item of f) {
            await loadOne(item);
        }
    } else {
        await loadOne(f);
    }
    return itemList;
}

module.exports = uploadFile;

