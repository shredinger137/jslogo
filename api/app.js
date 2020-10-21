var express = require("express");
var app = express();
var config = require("./config.js");

var tempAllProjects = [
    {
        name: "Blank Project",
        code: ``
    },
    {
        name: "Evaporation",
        code: 
`to go
   print "Evaporation
end`
    },
    {
        name: "Absorption",
        code: 
`to go
   print "Absorption
end`
    },
    {
        name: "LEDs",
        code: 
`to go
    print "LEDs
end`
    }
];

app.get("/availableProjects", function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "text/plain");
    res.send(tempAllProjects);
})

app.listen(config.port);