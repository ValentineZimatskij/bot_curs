const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS main
(id integer primary key, chatId INTEGER, msg TEXT)`);
});

class Data {
  static find(chatId, cb) {
    db.get("SELECT * FROM main WHERE chatId = ?", chatId, cb);
  }
  static create(data, cb) {
    db.run(
      "INSERT INTO main(chatId, msg) VALUES (?, ?)",
      data.chatId,
      data.msg,
      cb
    );
  }
  static delete(chatId, cb) {
    db.run("DELETE FROM main WHERE chatId = ?", chatId, cb);
  }
}

module.exports.Data = Data;
