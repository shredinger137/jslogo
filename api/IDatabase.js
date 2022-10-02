const AWS = require('aws-sdk');
var crypto = require('crypto');


const AddEntry = function () {
    AWS.config.update({
        accessKeyId: 'AKIAQ5AROUE5TUAP4KPU',
        secretAccessKey: '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',
        region: 'us-west-1'
    });
    const docClient = new AWS.DynamoDB.DocumentClient();
    const Item = { pid: 'asdasddas' }
    var params = {
        TableName: 'lbym-projects',
        Item: {
            pid: '46342',
            title: 'this is a nem'
        },
        ReturnValues: 'ALL_OLD',
    };

    docClient.put(params, function (err, data) {
        if (err) console.log(err);
        else console.log(data);
    });
}

AddEntry();
