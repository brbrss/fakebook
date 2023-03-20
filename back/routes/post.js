const express = require('express');

const router = express.Router();

const Post = require('../model/post');
const uploadFile = require('./helper/uploadFile');

router.post('/write', async function (req, res, next) {
    try {
        const uid = req?.user?.uid;
        if (!uid) {
            return res.send('Not logged in.');
        }
        const content = req?.body?.content;
        if (!content) {
            return res.send('Post content missing.');
        }

        const imgList = await uploadFile(uid, req?.files?.f)

        const pid = await Post.createPost(uid, content, imgList);
        return res.send(String(pid));
    } catch (err) {
        next(err);
    }
});

router.post('/like/:pid', async function (req, res, next) {
    try {
        const uid = req?.user?.uid;
        if (!uid) {
            res.send('Not logged in.');
        }
        const pid = req.params.pid;
        const p = await Post.like(uid, pid);
        res.send(p);
    } catch (err) {
        next(err);
    }
});

router.post('/comment/:pid', async function (req, res, next) {
    try {
        const uid = req?.user?.uid;
        if (!uid) {
            return res.status(401).send('Not logged in.');
        }
        const content = req?.body?.content;
        if (!content) {
            return res.status(400).send('No comment body.');
        }
        const pid = req.params.pid;
        const p = await Post.createComment(uid, pid, content);
        res.send(p);
    } catch (err) {
        next(err);
    }
});

router.get('/comment/:pid', async function (req, res, next) {
    try {
        const uid = req?.user?.uid;
        if (!uid) {
            res.status(401).send('Not logged in.');
        }
        const pid = req.params.pid;
        const start = req?.query?.start;
        const count = req?.query?.count;
        const rev = req?.query?.rev;
        const plist = await Post.getComment(pid, start ? start : null, count ? Number(count) : 10, rev);
        return res.json(plist);
    } catch (err) {
        next(err);
    }
});


router.get('/get/:pid', async function (req, res, next) {
    try {
        const uid = req?.user?.uid;
        if (!uid) {
            res.send('Not logged in.');
        }
        const pid = req.params.pid;
        const p = await Post.get(pid);
        res.send(p);
    } catch (err) {
        next(err);
    }
});

router.get('/timeline/:uid', async function (req, res, next) {
    try {
        const selfuid = req?.user?.uid;
        if (!selfuid) {
            res.send('Not logged in.');
        }
        const uid = req.params.uid;

        const start = req?.query?.start;
        const count = req?.query?.count;
        const rev = req?.query?.rev;
        if (selfuid === uid) {
            const plist = await Post.getSelfAndFriendRecent(uid, start ? start : null, count ? Number(count) : 10, rev);
            res.json(plist);
        } else {
            const plist = await Post.getSelfRecent(uid, start ? start : null, count ? Number(count) : 10, rev);
            res.json(plist);
        }
    } catch (err) {
        next(err);
    }
});


module.exports = router;
