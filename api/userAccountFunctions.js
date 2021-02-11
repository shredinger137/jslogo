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

    doesUserExist: async (uid) => {
        if (dbConnection) {
            try {
                var account = await dbConnection.collection("users").findOne({ uid: uid });
            } catch (err) {
                console.log(err);
            }
            if (account) {
                return true;
            }
            else {
                return false;
            }
        }
    },

    createUserEntry: async (userObject) => {

        if (dbConnection) {
            dbConnection.collection("users").insertOne(userObject, function (err, result) {
                if (err) throw err;
                return true;
            }
            )
        }

        return false;
    }
}

