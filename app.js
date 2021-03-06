var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs');
var db = mongojs('customerapp', ['users']);
var ObjectId = mongojs.ObjectId;
var app = express();

// var logger = function(req, res, next){
//     console.log('Logging...');
//     next();
// }
//
// app.use(logger);

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Body Parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//set static path
app.use(express.static(path.join(__dirname, 'public')));

//Global vars
app.use(function (req, res, next) {
    res.locals.errors = null;
    next();
});

// Express validator middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;
        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

// users view function
app.get('/', function (req, res) {
    // find everything
    db.users.find(function (err, docs) {
        // docs is an array of all the documents in users
        console.log(docs);
        res.render('index', {
            title: 'Customers',
            users: docs
        });
    })
});

// new users post function
app.post('/users/add', function (req, res) {
    req.checkBody('first_name', 'First name is required').notEmpty();
    req.checkBody('last_name', 'Last name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();

    var errors = req.validationErrors();

    db.users.find(function (err, docs) {
        if (errors) {
            res.render('index', {
                title: 'Customers',
                users: docs,
                errors: errors
            });
        } else {
            var newUser = {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email
            }

            db.users.insert(newUser, function (err, result) {
                if (err) {
                    console.log(err);
                }
                res.redirect('/');
            });
        }
    })
});

// User delete function
app.delete('/users/delete/:id', function (req, res) {
    // console.log(req.params.id);
    db.users.remove({_id: ObjectId(req.params.id)}, function (err, result) {
        if (err) {
            console.log(err);
        }
        res.redirect('/');
    });
});

app.listen(3000, function () {
})