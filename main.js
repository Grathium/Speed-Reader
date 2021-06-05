const fs = require("fs");
var express = require("express");
var sleep = require("thread-sleep");

// this is really bad practice, but i"m so tired
let words = [];

let splitWords = (textIn) => {
    textIn += " ";

    return textIn.match(/(.+?) /g);
}

let main = () => {
    let fileToParse = process.argv.slice(2)[0];

    // test the file exists
    try {
        if (fileToParse == "--help") {
            console.log("node ./main.js <fileName> <tickSpeed>");
            process.exit();
        }

        if (!fs.existsSync(fileToParse)) {
            console.log("\033[31;40mError 404, File Not Found...\n\033[0m");
            process.exit();
        }
    } catch (err) {
        console.log("\033[31;40mError 404, File Not Found...\n\033[0m");
        process.exit();
    }

    let lineReader = require("readline").createInterface({
        input: require("fs").createReadStream(fileToParse)
    });

    lineReader.on("line", function (line) {
        // split each line into words
        words = splitWords(line);
    });

    var app = express();

    app.get("/", function (req, res) {
        res.sendFile("./static/index.html", { root: __dirname })
    })

    var server = app.listen(8081, function () {
        var port = server.address().port;

        console.log("\033[32;40mServer Started on http://localhost:%s\033[0m", port)
    })
}

// websocket
const serverPort = 8080,
    http = require("http"),
    app = express(),
    server = http.createServer(app),
    WebSocket = require("ws"),
    websocketServer = new WebSocket.Server({ server });

//when a websocket connection is established
websocketServer.on("connection", (webSocketClient) => {
    let tickSpeed = process.argv.slice(3)[0];

    //send feedback to the incoming connection
    for (let i = 0; i < words.length; i++) {
        websocketServer
            .clients
            .forEach(client => {
                //send the client the current message
                sleep(Number(tickSpeed));
                client.send(words[i]);
            });
    }
});

//start the web server
server.listen(serverPort, () => {
    console.log(`Websocket server started on port ` + serverPort);
});

main();
