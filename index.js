const express = require("express");
const fs = require("fs");
const bcrypt = require("bcrypt");
const path = require("path");
const app = express();
const port = 8080;

let ews = require("express-ws")(app);
let wss = ews.getWss();

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/index.html"));
});

app.ws("/ws", (ws, req) => {
  ws.send("Welcome to Vega Web!");
  ws.on("message", (msg) => {
    let arguments = msg.split(" ");
    let command = arguments[0];
    let hashed;
    if (command == "createUser") {
      if (arguments[1] != "help") {
        try {
          let username = arguments[1];
          let password = arguments[2];
          ws.send("Creating user: " + username);
          if (!fs.existsSync("users/" + username)) {
            fs.mkdirSync("users/" + username);
            bcrypt.hash(password, 10, function (err, hash) {
              hashed = hash;
              fs.writeFileSync("users/" + username + "/password", hashed);
            });
            ws.send("Created user: " + arguments[1]);
          } else {
            ws.send("User already exists");
          }
        } catch (e) {
          ws.send("An error occurred creating user:" + e);
        }
      } else {
        ws.send("createUser [username] [password]");
      }
    } else if (command == "echo") {
      if (arguments[1] != "help") {
        echoTo = arguments[1];
        echoMessage = arguments[2];

        if (echoTo == "all") {
          wss.clients.forEach(function (client) {
            client.send(echoMessage);
          });
        } else if (echoTo == "self") {
          ws.send(echoMessage);
        }
      } else {
        ws.send("echo [all, self] [message]");
      }
    } else if (command == "help") {
      ws.send("Vega commands");
      ws.send("To learn more about using a specific command, type in:");
      ws.send("[command] help");
      ws.send("");
      ws.send("");
      ws.send("");
      ws.send("List of commands:");
      ws.send("createUser");
      ws.send("echo");
    } else {
      ws.send("That command doesn't exist.");
    }
  });
});

app.listen(port, () => {
  console.log("Vega Web started");
});
