import mysql from "mysql2";

let dbPort = 3307;
if (process.env.DB_PORT) {
  dbPort = parseInt(process.env.DB_PORT, 10);
}

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: dbPort
});

export default connection;

// ONLINE UP
// ------------------------------------------
// LOCAL DOWN

// import mysql from "mysql2";
// // const mysql = require("mysql2");

// const connection = mysql.createConnection({
//     host: "bnhzin.h.filess.io",
//     user: "rainbowDB_guessbase",
//     password: "fc94d2424731d7c9166e08f14011ccd9c880aa97",
//     database: "rainbowDB_guessbase",
//     port: 3307
// });

// export default connection;
