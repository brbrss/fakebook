const express = require('express');
const router = express.Router();

const User = require('../model/user');
const Credential = require('../model/credential');
const Upload = require('../model/upload');
const { InvalidIdError } = require('../model/modelError');



router.get('/', async function (req, res, next) {
    try {
        const uid = req?.user?.uid;
        if (uid) {
            let acc;
            let profile;
            try {
                acc = await Credential.getById(uid);
                profile = await User.shortGet(uid);
                acc = { uid: acc._id, username: acc.username };
                res.json({ profile: profile, account: acc });
            } catch (err) {
                if (err instanceof InvalidIdError) {
                    res.json({ profile: null, account: null });
                } else {
                    throw err;
                }
            }
        } else {
            res.json({ profile: null, account: null });
        }
    } catch (err) {
        next(err);
    }
});


router.get('/profile/:uid', async function (req, res, next) {
    try {
        const myid = req?.user?.uid;
        const uid = req.params.uid;
        if (myid) {
            const profile = await User.shortGet(uid);
            return res.json(profile);

        } else {
            return res.status(401).send('401 unauthorized. Not logged in.');
        }
    } catch (err) {
        next(err);
    }
});

router.get('/requestlist', async function (req, res, next) {
    try {
        const uid = req?.user?.uid;
        if (uid) {
            const profile = await User.get(uid);
            res.json(profile.pendingRequestList);
        } else {
            res.status(401).send('401 unauthorized. Not logged in.');
        }
    } catch (err) {
        next(err);
    }
});

router.get('/list', async function (req, res, next) {
    try {
        const uid = req?.user?.uid;
        if (uid) {
            const lst = await User.listPeople(uid);
            res.json(lst);
        } else {
            res.status(401).send('401 unauthorized. Not logged in.');
        }
    } catch (err) {
        next(err);
    }
});

router.get('/friendlist/:uid', async function (req, res, next) {
    try {
        const uid = req?.user?.uid;
        if (uid) {
            const targetUid = req.params.uid;
            const lst = await User.friendList(targetUid);
            res.json(lst);
        } else {
            res.status(401).send('401 unauthorized. Not logged in.');
        }
    } catch (err) {
        next(err);
    }
});


router.post('/update', async function (req, res, next) {
    try {
        const uid = req?.user?.uid;

        if (uid && uid === req?.body?.uid) {
            await User.update(req.body);
            res.redirect('back');
        } else {
            res.status(401).send('401 unauthorized. Uid and credential do not match.');
        }
    } catch (err) {
        next(err);
    }
});

router.post('/avatar', async function (req, res, next) {
    try {
        const uid = req?.user?.uid;

        const tmppath = req.files.file.tempFilePath;
        const originalName = req.files.file.name;
        if (!tmppath) {
            res.status(400).send('400 Bad Request. No file uploaded.');
        }
        if (uid && uid === req?.body?.uid) {
            const fileObj = await Upload.insert(uid, tmppath, originalName);
            //const onlinePath = (await Upload.get(fid)).path;
            const onlinePath = fileObj.path;
            const oldAvatar = (await User.get(uid)).avatar;
            await User.update({ uid: uid, avatar: onlinePath });
            await Upload.remove(oldAvatar);
            res.redirect('back');
        } else {
            res.status(401).send('401 unauthorized. Uid and credential do not match.');
        }
    } catch (err) {
        next(err);
    }
});


router.post('/request/:uid', async function (req, res, next) {
    try {
        const uid = req?.user?.uid;

        if (uid) {
            const targetUid = req.params.uid;
            const suc = await User.requestFriend(uid, targetUid);
            if (suc) {
                res.send('success');
            } else {
                res.status(403).send('failed');
            }
        } else {
            res.status(401).send('401 unauthorized. Not logged in.');
        }
    } catch (err) {
        next(err);
    }
});

router.post('/accept/:uid', async function (req, res, next) {
    try {
        const uid = req?.user?.uid;
        if (uid) {
            const targetUid = req.params.uid;
            const suc = await User.acceptRequest(uid, targetUid);
            if (suc) {
                res.send('success');
            } else {
                res.status(403).send('failed');
            }
        } else {
            res.status(401).send('401 unauthorized. Not logged in.');
        }
    } catch (err) {
        next(err);
    }
});

router.post('/decline/:uid', async function (req, res, next) {
    try {
        const uid = req?.user?.uid;
        if (uid) {
            const targetUid = req.params.uid;
            const suc = await User.declineRequest(uid, targetUid);
            if (suc) {
                res.send('success');
            } else {
                res.status(403).send('failed');
            }
        } else {
            res.status(401).send('401 unauthorized. Not logged in.');
        }
    } catch (err) {
        next(err);
    }
});

module.exports = router;
