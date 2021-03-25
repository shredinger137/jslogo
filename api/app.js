var express = require("express");
var app = express();
var config = require("./config.js");
var MongoClient = require('mongodb').MongoClient, Server = require('mongodb').Server;
app.use(express.json());
var admin = require('firebase-admin');
var userAccountFunctions = require('./userAccountFunctions');
var projectFunctions = require('./projects');

var serviceAccount = require("./credentials.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS, PATCH');
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
                        if (result) {
                            res.sendStatus(200);
                        } else {
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

//TODO: We should make sure the required parameters exist
//Also there's no error handling; should send status

app.post("/project", function (req, res) {
    admin
        .auth()
        .verifyIdToken(req.body.authorization)
        .then((decodedToken) => {
            const uid = decodedToken.uid;
            if (req.body.userId == uid) {
                var newProjectId = Math.random().toString(36).slice(2);

                projectFunctions.newProjectEntry({
                    projectId: newProjectId,
                    owner: uid,
                    title: req.body.title,
                    code: req.body.code
                }).then(response => {
                    console.log(response)
                    res.send(newProjectId)

                })
            }
            else {
                console.log("token mismatch")
            }
        })
        .catch((error) => {
            // Handle error
        });
})

app.patch("/project/:pid", function (req, res) {
    admin
        .auth()
        .verifyIdToken(req.body.authorization)
        .then((decodedToken) => {
            const uid = decodedToken.uid;
            if (req.body.userId == uid && req.params.pid) {
                projectFunctions.updateProjectEntry(
                    {
                        title: req.body.title,
                        code: req.body.code
                    },
                    req.params.pid
                ).then(response => {
                    res.sendStatus(200);

                })
            }
            else {
                console.log("token mismatch")
            }
        })
        .catch((error) => {
            // Handle error
        });

})

app.delete("/project/:pid", function (req, res) {
    admin
        .auth()
        .verifyIdToken(req.headers.authorization)
        .then((decodedToken) => {
            const uid = decodedToken.uid;
            //we need to verify owner on the other side

            projectFunctions.deleteProject(req.params.pid, uid).then(response => {
                res.sendStatus(200);
            })

        })
        .catch((error) => {
            // Handle error
        });

})

//Okay. So this has an obvious problem with our data structure.

//If the user has the projectIds listed under their account, then we have to check each one to get a title. That's obviously a lot of requests for very little payoff. So we should be 
//writing the title as well. That might be done by the next time you read this.
//And at a certain point we might as well be writing the code there, but having global access is going to be valuable in the future.

//Plus using simple arrays and discreet documents makes for easier, less intensive operations when updating and deleting individual entries.

//Still thinking about how best to structure that. I feel like the idea of projects having owners is more sensible that accounts having projects. But I can't really think of why.

app.get("/user-projects/:uid", function (req, res) {


    if (req.headers.authorization) {
        admin
            .auth()
            .verifyIdToken(req.headers.authorization)
            .then((decodedToken) => {
                const uid = decodedToken.uid;
                if (req.params.uid && req.params.uid == uid) {
                    projectFunctions.getUserProjects(uid).then(response => {
                        res.send(response)
                    })


                }


            })
            .catch((error) => {
                // Handle error
            });

    }

})



app.get("/projects/:pid", function (req, res) {


    if (req.params.pid) {
        projectFunctions.getProject(req.params.pid).then(response => {
            res.send(response)
        })
    }


    /*
    
    **Disabling auth on get requests - this enables link sharing without credential checking, but also makes all projects viewable by default
    Probably good to have this be temporary; we don't want users having write access from links, so we'll need to display that properly**

    if (req.headers.authorization) {
        admin
            .auth()
            .verifyIdToken(req.headers.authorization)
            .then((decodedToken) => {
                const uid = decodedToken.uid;
                if (req.params.pid) {
                    projectFunctions.getProject(req.params.pid, uid).then(response => {
                        res.send(response)
                    })


                }


            })
            .catch((error) => {
                // Handle error
            });

    }

*/

})





app.listen(config.port);