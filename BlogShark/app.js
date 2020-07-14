const express = require("express");
const app = express();
const crypto = require('crypto');
let token = crypto.createHash('sha256').update(Math.random().toString()).digest("hex");
console.log(`Authtoken: ${token}`);
const bodyParser = require("body-parser");
const html = require("http");
const port = process.env.PORT || process.env.port || 8080;
const index = [__dirname, "client", "index.html"];
const db = require("./db");
const path = require("path");
app.use(require("helmet")());
app.use(express.static("client"));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.get("/", (req, res) => {
    res.sendFile(path.resolve(...index));
});
app.get("/logout", (req, res) => {
    if (req.query.token == token) {
        token = crypto.createHash('sha256').update(Math.random().toString()).digest("hex");
        console.log(`New Authtoken: ${token}`);
        res.sendStatus(200);
    } else {
        res.sendStatus(401);
    }
});
app.post("/login", (req, res) => {
    if (req.body.password == process.env.pw || req.body.password == token) {
        res.json({ err: false, token: token });
    } else {
        res.json({err:true});
    }
});
app.get("/api", (req, res) => {
    db.get(req.query.id).then((data) => {
        res.json({ err: false, data: data });
    }, (err) => {
        res.json({ err: true });
    });
});
app.post("/api", (req, res) => {
    res.set({
        "Content-Type": "plain/text; charset=utf-8",
        "service": "Sharkbyte BlogShark"
    });
    if (req.body.token == token) {
        db.set({ head: req.body.head, data: req.body.data }).then(() => {
            res.end("Complete");
        }, (err) => {
            res.end(err);
        });
    } else {
        res.sendStatus(401);
    }
});
app.delete("/api", (req, res) => {
    res.set({
        "Content-Type": "plain/text; charset=utf-8",
        "service": "Sharkbyte BlogShark"
    });
    if (req.body.token == token) {
        db.del(req.body.id).then(() => {
            res.end("Complete");
        }, (err) => {
            res.end(err);
        });
    } else {
        res.sendStatus(401);
    }
});
html.createServer(app).listen(port, () => {
    console.log(`Listen on localhost:${port.toString()}`);
});