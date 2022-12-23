const AWS = require('aws-sdk');
var crypto = require('crypto');

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

//Initialize AWS setup
AWS.config.update(config.awsSettings);
const docClient = new AWS.DynamoDB.DocumentClient();

//TODO: This will become part of the interface file as we move to the next database. 

const writeToLog = async (user, event, level) => {
    dbConnection.collection('lbym-log').insertOne({
        date: Date.now(),
        user: user,
        event: event,
        level: level
    });
}

module.exports = {

    //projectId comes from app.js

    newProjectEntry: async (projectData) => {
        projectData['active'] = true;

        var params = {
            TableName: 'lbym-projects',
            Item: projectData,
            ReturnValues: 'ALL_OLD',
        };

        try {
            const response = await docClient.put(params).promise();
            return true;
        }

        catch (err) {
            writeToLog(projectData?.projectOwner, `save new project failed with ${err}`, 'error');
            return false;
        }
    },

    getUserProjects: async (uid) => {

        writeToLog(uid, 'requested user projects', 'info');


        const params = {
            TableName: 'lbym-projects',
            KeyConditionExpression: 'projectOwner = :projectOwner',
            FilterExpression: 'active = :true',
            ExpressionAttributeValues: {
              ':projectOwner': uid,
              ':true': true
            },
            IndexName: 'projectOwner-index'
          };

        try {
            const data = await docClient.query(params).promise();
            console.log(data);
            return data.Items;
        }

        catch (err) {
            console.log(err)
        }
    },

    getProject: async (projectId) => {

        let params = {
            Key: {
                "projectId": projectId
            },
            TableName: "lbym-projects"
        }


        try {
            const data = await docClient.get(params).promise();
            return data?.Item;
        }

        catch (err) {
            console.log(err)
        }
    },



    doesUserHavePermission: async (uid, projectId, action) => {
        //for now we're just going to make this 'is the user owner'; TODO in the future is to have permissions attached to projects


        //temp TODO: always true for current dev work; obviously it shouldn't in the future
        return true;
    },


    saveDataRun: async (projectId, data) => {
        console.log(projectId)
        var params = {
            TableName: 'lbym-saved-data',
            Item: {
                projectId: projectId,
                date: Date.now(),
                data: data,
                dataId: crypto.randomUUID()
            },
            ReturnValues: 'ALL_OLD',
        };

        try {
            const response = await docClient.put(params).promise();
            return true;
        }

        catch (err) {
            console.log(err)
            return false;
        }

    },

    getDataRuns: async (projectId) => {
        let params = {
            KeyConditionExpression: 'projectId = :projectId',
            ExpressionAttributeValues: {
                ':projectId': projectId
            },
            TableName: "lbym-saved-data",
            IndexName: 'projectId-index'
        }

        try {
            const data = await docClient.query(params).promise();
            console.log(data.Items)
            return data.Items;
        }

        catch (err) {
            console.log(err)
        }

    },

    getSingleData: async (dataId) => {
        console.log(dataId)
        let params = {
            Key: {
                "dataId": dataId
            },
            TableName: "lbym-saved-data"
        }


        try {
            const data = await docClient.get(params).promise();
            return data?.Item;
        }

        catch (err) {
            console.log(err);
            return false;
        }
    },

    updateTitle: async (projectId, newTitle) => {
        let params = {
            Key: {
                "projectId": projectId
            },
            UpdateExpression: "set title = :title",
            ExpressionAttributeValues: { ':title': newTitle },
            TableName: "lbym-projects"
        }

        try {
            const data = await docClient.update(params).promise();
            return true;
        }

        catch (err) {
            console.log(err)
            return false;
        }

    },


    updateProjectEntry: async (projectObject, projectId) => {

        //we have to specify fields in DynamoDB; to avoid that, generate a list from the object provided

        let updateExpression = 'set';
        let expressionAttributeNames = {};
        let expressionValues = {};

        for (const prop in projectObject) {
            updateExpression += ` #${prop} = :${prop} ,`;
            expressionAttributeNames['#' + prop] = prop;
            expressionValues[':' + prop] = projectObject[prop];
        }

        //remove trailing comma
        updateExpression = updateExpression.slice(0, -1);


        let params = {
            Key: {
                "projectId": projectId
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionValues,
            TableName: "lbym-projects"
        }

        try {
            const data = await docClient.update(params).promise();
            return true;
        }

        catch (err) {
            console.log(err)
            return false;
        }
    },

    deleteProject: async (projectId, uid) => {
        let params = {
            TableName: 'lbym-projects',
            Key: {
                projectId: projectId
            }
        }

        try {
            await docClient.delete(params).promise();
            return true;
        }

        catch {
            console.log(err)
            return false;
        }

    },

}
