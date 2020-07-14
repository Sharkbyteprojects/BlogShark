const path = require("path");
const dbFile = path.resolve("./.data/sqlite.db");
const fs = require("fs");
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(dbFile);
db.serialize(() => {
    if (!exists) {
        db.run(
            "CREATE TABLE entry (id INTEGER PRIMARY KEY AUTOINCREMENT, head TEXT,content LONGTEXT, date TEXT)"
        );
        console.log("New table created!");
        db.serialize(() => {});
    } else {
        console.log('Database ready to go!');
        db.each("SELECT * from entry", (err, row) => {
            if (row) {
                console.log(`record: ${JSON.stringify(row)}`);
            }
        });
    }
});
function da() {
    return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').split(" ")[0];
}
function setV(thi) {
    return new Promise((ok, errs) => {
        db.run(`INSERT INTO entry (head, content, date) VALUES (?, ?, ?)`, thi.head, thi.data, da(), error => {
            if (error) {
                errs(error);
            } else {
                ok();
            }
        });
    });
}
function getAll(id) {
    return new Promise((ok, errs) => {
        let add = "";
        if (id && !isNaN(id)) {
            add += " WHERE id="+id
        }
        db.all("SELECT * from entry"+add, (err, rows) => {
            if (err) {
                errs(err);
            }
            ok(rows.reverse());
        });
    });
}
function deleteas (id){
    return new Promise((ok, errs) => {
        if (id && !isNaN(id)) {
            db.run("DELETE FROM entry WHERE id="+id, (err) => {
                if (err) {
                    errs(err);
                }
                ok();
            });
        }
    });
}
module.exports = { get: getAll, set: setV, del: deleteas };