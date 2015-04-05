var passport = require('passport'),
    app = require('express')(),
    LocalStrategy = require('passport-local').Strategy,
    auth = require('./auth'),
    horn = require('../models/horn'),
    user = require('../models/user'),
    router = require('router')();



/* PUBLIC ROUTES */

router.post('/login', auth.login);

/* ROUTES FOR AUTHENTICATED USERS */

//events
router.get('/horns', horn.getAll);
router.get('/horns/:id', horn.getOne);
router.get('/users/:id/horns', horn.getAllHornsByUser);
router.post('/horn', horn.createNew);
router.put('/horn', horn.update);
router.delete('/horn/:id', horn.delete);

//users
//router.get('/user', user.getAll);
//router.get('/user/:id', user.getOne);
//router.post('/user', user.createNew);
//router.put('/user/:id', user.update);
//router.delete('/user', user.delete);


module.exports = router;
 