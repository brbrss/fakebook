const express = require('express');
const router = express.Router();

const Upload = require('../model/upload');



router.post('/', async function (req, res, next) {
    try {
        const tmppath = req.files.f.tempFilePath;
        const originalName = req.files.f.name;
        await Upload.insert(1, tmppath, originalName);
        res.send('good');
    } catch (err) {
        next(err);
    }
});

router.get('/multi', async function (req, res, next) {

    res.render('multiin');

});


router.post('/multi', async function (req, res, next) {
    const itemList = [];
    async function loadOne(item) {
        const tmppath = item.tempFilePath;
        const originalName = item.name;
        const obj = await Upload.insert(1, tmppath, originalName);
        //const path = await Upload.get(idstr);
        itemList.push(obj);
    }
    try {
        if (Array.isArray(req.files.f)) {
            for (const item of req.files.f) {
                await loadOne(item);
            }
        } else {
            await loadOne(req.files.f);
        }

        const text = req.body.text;

        const inject = {
            text: text, itemList: itemList
        };
        res.render('multi', inject);
    } catch (err) {
        next(err);
    }
});

/**
 * For testing only, this router is not used in production.
 */
module.exports = router;
