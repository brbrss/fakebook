const express = require('express');
const router = express.Router();

const passport = require('passport');
const LocalStrategy = require('passport-local');
const process = require('node:process');

const Credential = require('../model/credential');
const User = require('../model/user');
const validator = require('validator');

async function sessionProfile(username) {
    return { username: username };
}

async function verify(username, password, cb) {
    try {
        const user = await Credential.verify(username, password);
        //const profile = await sessionProfile(user.username);
        return cb(null, user);
    } catch (e) {
        return cb(null, false, { message: e.message });
    }
}

passport.use(new LocalStrategy(verify));
passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, user);
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});


router.post('/login', passport.authenticate('local', {
    successRedirect: '/?e=login-success',
    failureRedirect: '/?e=login-failure'
}));

router.post('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});


function validSignup(body) {
    const b1 = validator.isAlphanumeric(body.username)
        && validator.isLength(body.username, { min: 2, max: 16 });
    const b2 = validator.isLength(body.password, { min: 6, max: 16 });
    const b3 = validator.isLength(body.firstName, { min: 1, max: 16 });
    const b4 = validator.isLength(body.lastName, { min: 1, max: 16 });
    const b5 = validator.toDate(body.birthday) !== null;
    return b1 && b2 && b3 && b4 && b5;
}


router.post('/signup', async function (req, res, next) {
    //console.log(req.body);
    try {
        if (!validSignup(req.body)) {
            return res.redirect('/?e=invalid-input');
        }
        const uid = await Credential.create(req.body.username, req.body.password);
        await User.create(uid, req.body.firstName, req.body.lastName, new Date(req.body.birthday));
        const user = { username: req.body.username, uid: uid };
        req.login(user, function (err) {
            if (err) return next(err);
            res.redirect('/');
        });
        //res.redirect('/?e=signup-success');
    } catch (e) {
        if (e.message === "Username already exists") {
            return res.redirect('/?e=username-exists');
        }
        return res.redirect('/?e=signup-failure');
    }
});

router.get('/', async function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    if (req.user) {
        res.end(JSON.stringify({ username: req.user.username, uid: req.user.uid }));
    } else {
        res.end(JSON.stringify({ username: null }));
    }
});

module.exports = router;
