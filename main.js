const fs = require("fs");
var express = require("express");
var sleep = require("thread-sleep");

// this is really bad practice, but i"m so tired
let words = [];

let flattenArray = (arrayIn) => {
    return arrayIn.flat();
}

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
        words.push(splitWords(line));

        words = flattenArray(words);
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

    // send feedback to the incoming connection
    console.log(words);
    for (let i = 0; i < words.length; i++) {
        printWord = words[i];
        
        if (printWord == null) {
            sleep(Number(tickSpeed));
            continue;
        }

        websocketServer
            .clients
            .forEach(client => {
                //send the client the current message
                sleep(Number(tickSpeed));
                client.send(printWord);
            });
        
        // if it is the end of a sentence, double the wait time
        if (printWord[printWord.length - 2] == ".") {
            sleep(Number(Math.ceil(tickSpeed / 2)));
        }
    }
});

//start the web server
server.listen(serverPort, () => {
    console.log(`Websocket server started on port ` + serverPort);
});

main();
