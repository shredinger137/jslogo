//TODO: Auth needs to be made more robust, as proper middleware. It also needs to be passed to the database functions, since we have to verify the user actually has permissions.


var express = require("express");
var app = express();
var config = require("./config.js");
var MongoClient = require('mongodb').MongoClient, Server = require('mongodb').Server;
app.use(express.json());
var admin = require('firebase-admin');
var userAccountFunctions = require('./userAccountFunctions');
var projectFunctions = require('./projects');
var serviceAccount = require("./credentials.json");
var fs = require('fs');
var crypto = require('crypto');


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

})


//starting version of some basic logging; this will be moved to a cloud database and given a better way to access later on maybe
//not sure if cloudwatch is correct, but probably worth looking into

const writeToLog = async (user, event, level) => {
    dbConnection.collection('lbym-log').insertOne({
        date: Date.now(),
        user: user,
        event: event,
        level: level
    });
}


//We get a login post, saying a login happened. Check if the authorization token matches the expected UID. Check if user is already in the database. If it is, cool. If not, create an entry.

app.get("/ping", function (req, res) {
    res.send(true);
});

app.post("/login/:id", function (req, res) {
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
                            writeToLog(req.params.id, 'log in success', 'info');
                        } else {
                            var userObject = {
                                uid: uid,
                                displayName: req.body.displayName,
                                email: req.body.email
                            }

                            userAccountFunctions.createUserEntry(userObject).then(() => {
                                res.sendStatus(200);
                                writeToLog(req.params.id, 'log in success, new account', 'info');
                            }
                            );
                        }
                    })
                }
                else {
                    console.log("token mismatch")
                    writeToLog(req.params.id, 'login failed with token mismatch', 'warning');
                }
            })
            .catch((error) => {
                writeToLog(req.params.id, `login failed with error ${error}`, 'error');
            });
    }
})

//TODO: We should make sure the required parameters exist
//Also there's no error handling; should send status
//Also TODO: Make sure there's a unique ID

app.post("/project", function (req, res) {
    admin
        .auth()
        .verifyIdToken(req.body.authorization)
        .then((decodedToken) => {
            const uid = decodedToken.uid;
            if (req.body.userId == uid) {
                let newProjectId = crypto.randomUUID().replace(/-/g, '').slice(0, 16);

                projectFunctions.newProjectEntry({
                    projectId: newProjectId,
                    projectOwner: uid,
                    title: req.body.title,
                    code: req.body.code,
                    saved: Date.now(),
                    created: Date.now()
                }).then(response => {
                    res.send(newProjectId)
                    writeToLog(uid, `created new project ${newProjectId}`, 'info');

                })
            }
            else {
                console.log("token mismatch")
            }
        })
        .catch((error) => {
            writeToLog(req.params.id, `new project save failed with error ${error}`, 'error');
        });
})

app.patch("/project/:pid", function (req, res) {


    admin
        .auth()
        .verifyIdToken(req.body.authorization)
        .then((decodedToken) => {
            const uid = decodedToken.uid;
            projectFunctions.doesUserHavePermission(uid, req.params.pid, 'write').then((permissions) => {
                if (permissions == true) {

                    projectFunctions.updateProjectEntry(
                        {
                            title: req.body.title,
                            code: req.body.code,
                            saved: Date.now()
                        },
                        req.params.pid
                    ).then(response => {
                        res.sendStatus(200);
                        writeToLog(uid, `saved project ${req.params.pid}`, 'info');
                    })
                }
                else {
                    res.sendStatus(210)
                }
            })
        })
        .catch((error) => {
            res.sendStatus(500);
            writeToLog(uid, `saving project ${req.params.pid} failed with ${error}`, 'error')
        });

})


app.patch("/project/:pid/title", function (req, res) {


    admin
        .auth()
        .verifyIdToken(req.body.authorization)
        .then((decodedToken) => {
            const uid = decodedToken.uid;
            projectFunctions.doesUserHavePermission(uid, req.params.pid, 'write').then((permissions) => {
                if (permissions == true) {

                    projectFunctions.updateTitle(req.params.pid, req.body.title).then(response => {
                        res.sendStatus(200);
                    })
                }
                else {
                    res.sendStatus(210)
                }
            })
        })
        .catch((error) => {
            res.sendStatus(500);
            writeToLog(req.params.id, `title update failed on ${req.params.pid} with ${error}`, 'error');
        });

})



app.delete("/project/:pid", function (req, res) {
    admin
        .auth()
        .verifyIdToken(req.headers.authorization)
        .then((decodedToken) => {
            const uid = decodedToken.uid;
            //TODO: Check auth

            projectFunctions.deleteProject(req.params.pid, uid).then(response => {
                res.sendStatus(200);
                writeToLog(uid, `delete project ${req.params.pid}`, 'info');
            })

        })
        .catch((error) => {
            writeToLog(req.params.id, `delete pid ${req.params.pid} failed with ${error}`, 'error');
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


                } else {
                    writeToLog(req.params.uid, `project list requested for ${req.params.uid}. failed with wrong uid (${uid})`, 'error');
                }


            })
            .catch((error) => {
                writeToLog(req.params.uid, `project list requested for ${req.params.uid}. failed with ${error}`, 'error');
            });

    }

})


app.post("/data/:pid", function (req, res) {

    if (req.body && req.body.data && req.params && req.params.pid && req.body.authorization) {

        admin
            .auth()
            .verifyIdToken(req.body.authorization)
            .then((decodedToken) => {
                const uid = decodedToken.uid;
                projectFunctions.doesUserHavePermission(decodedToken.uid, req.params.pid, 'write').then((permissions) => {
                    if (permissions == true) {
                        projectFunctions.saveDataRun(req.params.pid, req.body.data)
                    }
                    res.send('saved');
                })
            }
            )
    } else {

        res.send('error');
    }

})


app.get("/data/single/:index", async function (req, res) {
    projectFunctions.getSingleData(req.params.index).then(response => {
        res.send(response);
    })
})

app.get("/data/:pid", async function (req, res) {

    projectFunctions.getDataRuns(req.params.pid).then(response => {
        res.send(response);
    })
})



app.get("/projects/:pid", function (req, res) {


    if (req.params.pid) {
        projectFunctions.getProject(req.params.pid).then(response => {
            res.send(response);
            writeToLog(req.params.id, `opened project ${req.params.pid}`, 'info');
        })
    }
})





app.listen(config.port);