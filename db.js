// const mysql = require('mysql2');

// const pool = mysql.createPool({
//   host: requireEnv('DB_HOST'),
//   port: Number(process.env.DB_PORT || '3306'),
//   user: requireEnv('DB_USER'),
//   password: requireEnv('DB_PASSWORD'),
//   database: requireEnv('DB_NAME'),
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
//   enableKeepAlive: true
// });

// module.exports = { pool };


// ------------------------------------------


import mysql from "mysql2";
// const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "bnhzin.h.filess.io",
    user: "rainbowDB_guessbase",
    password: "fc94d2424731d7c9166e08f14011ccd9c880aa97",
    database: "rainbowDB_guessbase",
    port: 3307
});

export default connection;