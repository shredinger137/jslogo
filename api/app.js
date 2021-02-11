var express = require("express");
var app = express();
var config = require("./config.js");
var MongoClient = require('mongodb').MongoClient, Server = require('mongodb').Server;
app.use(express.json());
var admin = require('firebase-admin');
var userAccountFunctions = require('./userAccountFunctions');

var serviceAccount = require("./credentials.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    if ('OPTIONS' === req.method) {
        res.sendStatus(200);
    }
    else {
        next();
    }
});


//Create a global holder for our database instance, then open the database and assign it here.
//Note that anywhere you use this, you need to have an if(dbConnection){} conditional so that the
//order will only attempt to run if the database connection exists. Later you might want to add a
//retry deal to it.

var dbConnection = null;
MongoClient.connect('mongodb://localhost:27017/', { useUnifiedTopology: true, useNewUrlParser: true }, function (err, client) {
    if (err) { console.error(err) }
    dbConnection = client.db(config.globalDbName) // once connected, assign the connection to the global variable
    connectedToDatabase = true;
    console.log("Connected to database " + config.globalDbName);

    //things that happen on startup should happen here, after the database connects
})


//We get a login post, saying a login happened. Check if the authorization token matches the expected UID. Check if user is already in the database. If it is, cool. If not, create an entry.

app.post("/login/:id", function (req, res) {
    console.log("login");
    if (req.params.id && req.body && req.body.authorization) {

        admin
            .auth()
            .verifyIdToken(req.body.authorization)
            .then((decodedToken) => {
                const uid = decodedToken.uid;
                if (req.params.id == uid) {
                    userAccountFunctions.doesUserExist(uid).then(result => {
                        if(result){ 
                            res.sendStatus(200);
                        } else
                        {
                            var userObject = {
                                uid: uid,
                                displayName: req.body.displayName,
                                email: req.body.email
                            }

                            userAccountFunctions.createUserEntry(userObject).then(
                                res.sendStatus(200)
                            );
                        }
                    })
                 }
                else {
                    console.log("token mismatch")
                }
            })
            .catch((error) => {
                // Handle error
            });
    }
})



app.listen(config.port);