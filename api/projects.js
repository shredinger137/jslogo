var MongoClient = require('mongodb').MongoClient, Server = require('mongodb').Server;
var config = require("./config.js");
var express = require("express");

var dbConnection = null;
MongoClient.connect('mongodb://localhost:27017/', { useUnifiedTopology: true, useNewUrlParser: true }, function (err, client) {
    if (err) { console.error(err) }
    dbConnection = client.db(config.globalDbName) // once connected, assign the connection to the global variable
    connectedToDatabase = true;
    console.log("Connected to database " + config.globalDbName);

})



module.exports = {

    //create a project entry and associate it with the user
    //associate it by adding a 'ownedProjects' property to the user - doesn't exist here yet

    //no error handling - this returns true regardless of truthiness

    //Also we don't check if the ID already exists.

    newProjectEntry: async (projectObject) => {

        if (dbConnection) {
            dbConnection.collection("projects").insertOne(projectObject, function (err, result) {
                if (err) throw err;
                else {

                    dbConnection.collection("users").updateOne({uid: projectObject.owner}, {$push: {ownedProjects: projectObject.projectId }}, {upsert: true})
                    if (err) throw err;
                    return true;

                }

            }
            )
        }

        return true;
    },

    updateProjectEntry: async (projectObject, projectId) => {

        console.log(projectId);
        if (dbConnection) {
            dbConnection.collection("projects").updateOne( {projectId: projectId}, {$set: projectObject }, function (err, result) {
                if (err) throw err;
                else return true;

            }
            )
        }

        return true;
    },

    deleteProject: async (projectId, uid) => {
        if(dbConnection){
            
            dbConnection.collection("projects").deleteOne({projectId: projectId}, function (err, result) {
                if (err) throw err;
                else {
                    dbConnection.collection("users").updateOne({uid: uid }, {$pull: {ownedProjects: projectId }})
                }
            })

        }
    },

    getUserProjects: async (uid) => {
        if(dbConnection){
            try {
                var userProjects = await dbConnection.collection("projects").find({owner: uid}, {projection: {_id: 0, title: 1, projectId: 1}}).toArray();
            }

            catch {
                console.log(err);
                return false;
            }

            finally {
                return userProjects;
            }

        }
    },

    getProject: async (projectId) => {
        if(dbConnection){
            try {
                var projectData = await dbConnection.collection("projects").findOne({projectId: projectId}, {projection: {_id: 0 }});
            }

            catch {
                console.log(err);
                return false;
            }

            finally {

                try {                    
                    var projectUser = await dbConnection.collection("users").findOne({uid: projectData.owner});
                }

                catch {
                    console.log(err);
                    return false;
                }
                
                finally {
                    if(projectUser){ projectData['ownerDisplayName'] = projectUser.displayName}
                }

                return projectData;
            }

        }
    },


}
