const express = require("express");
const dotenv = require("dotenv").config();
const { Pool } = require("pg");

const app = express();
const port = 3000;

app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function initDB() {
  await pool.query(`
        CREATE TABLE IF NOT EXISTS b4puser (
            userID SERIAL PRIMARY KEY,
            userName TEXT NOT NULL,
            userEmail TEXT NOT NULL,
            masterPW TEXT NOT NULL,
            UNIQUE(userName, userEmail)
        );
        CREATE TABLE IF NOT EXISTS accounts (
            userID INTEGER NOT NULL REFERENCES b4puser(userID) ON DELETE CASCADE,
            service TEXT NOT NULL,
            serviceEmail TEXT NOT NULL,
            serviceUsername TEXT,
            servicePW TEXT NOT NULL,
            FOREIGN KEY (userID) REFERENCES b4puser(userID)
        );`);
}

// User Registrierung

const userRegRoute=require("./routes/userRegistration")
app.use(userRegRoute);


// User Login

const userLoginRoute = require("./routes/userLogin");
app.use(userLoginRoute);

initDB().then(() => {
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
});

modules.exports = pool