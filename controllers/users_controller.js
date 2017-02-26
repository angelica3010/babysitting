var bcrypt = require('bcryptjs');
var express = require('express');
var router = express.Router();
var user = require('../models/user.js');
var connection = require('../config/connection.js');


router.get('/', function(req,res) {
    res.render('partials/users/sign_in');
});

router.get('/new', function(req,res) {
    res.render('partials/users/new');
});

router.get('/sign-in', function(req,res) {
    res.render('partials/users/sign_in');
});

router.get('/sign-out', function(req,res) {
  req.session.destroy(function(err) {
     res.redirect('/')
  })
});

//if user trys to sign in with the wrong password or email tell them that on the page
router.post('/login', function(req, res) {
    var email = req.body.email;

// res.send(JSON.stringify(req.body))

    if(req.body.signin){
        var condition = "email = '" + email + "'";
        console.log(condition);
        user.findOne(condition, function(users){
            console.log('look here' + users);

        if (users){
            bcrypt.compare(req.body.password, users.password_hash, function(err, result) {
                if (result == true){
                    console.log("here");
                    req.session.logged_in = true;
                    req.session.user_id = users.id;
                    req.session.user_email = users.email;

                    res.redirect('/cities')
                } else {
                    res.redirect('/users/new');
                }
            });

        }else{
            res.redirect('/users/new');
        }
        });
    }
});

router.post('/create', function(req,res) {
    var queryString = "select * from users where email = '" + req.body.email + "'";

    connection.query(queryString, function(err, users) {
            if (err) throw err;

            if (users.length > 0){
                console.log(users)
                res.send('we already have an email or username for this account')
            }else{

                bcrypt.genSalt(10, function(err, salt) {
                        bcrypt.hash(req.body.password, salt, function(err, hash) {
              user.create(['username', 'email', 'password_hash'], [req.body.username, req.body.email, hash], function(data){

                req.session.logged_in = true;
                req.session.user_id = user.id;
                req.session.user_email = user.email;

                res.redirect('/index')
                });

                        });
                });

            }
    });
});

module.exports = router;