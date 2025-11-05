const express = require("express");
const dotenv = require("dotenv").config();
const pool = require("./pool");
const app = express();
const port = 3000;

app.use(express.json());

async function initDB() {
  await pool.query(`
        CREATE TABLE IF NOT EXISTS b4puser (
            user_id SERIAL PRIMARY KEY,
            user_name TEXT NOT NULL UNIQUE,
            user_email TEXT NOT NULL UNIQUE,
            master_password TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS accounts (
            account_id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES b4puser(user_id) ON DELETE CASCADE,
            service TEXT NOT NULL,
            service_email TEXT NOT NULL,
            service_username TEXT,
            service_password TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES b4puser(user_id)
        );`);
}

// User Registrierung
const userRegRoute = require("./routes/userRegistration");
app.use(userRegRoute);

// User löschen
const userDelRoute=require("./routes/userDelete")
app.use(userDelRoute);

// User Login
const userLoginRoute = require("./routes/userLogin");
app.use(userLoginRoute);

// Accounts anzeigen
const displayAccountsRoute = require("./routes/displayAccounts");
app.use(displayAccountsRoute);

// Account Hinzufügen
const accountAddRoute = require("./routes/accountAdd");
app.use(accountAddRoute);

// Account Löschen
const accountDeleteRoute = require("./routes/accountDelete");
app.use(accountDeleteRoute);

initDB().then(() => {
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
});
