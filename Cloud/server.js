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

    CREATE TABLE IF NOT EXISTS groups (
      group_id SERIAL PRIMARY KEY,
      group_name TEXT NOT NULL,
      user_id INTEGER NOT NULL REFERENCES b4puser(user_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS accounts (
      account_id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES b4puser(user_id) ON DELETE CASCADE,
      service TEXT NOT NULL,
      service_email TEXT NOT NULL,
      service_username TEXT,
      service_password TEXT NOT NULL,
      group_id INTEGER REFERENCES groups(group_id) ON DELETE SET NULL
    );
  `);
}


// User Registrierung
const userRegRoute = require("./routes/userRegistration");
app.use(userRegRoute);

// User löschen
const userDelRoute = require("./routes/userDelete");
app.use(userDelRoute);

// User Login
const userLoginRoute = require("./routes/userLogin");
app.use(userLoginRoute);

// Accounts anzeigen
const displayAccountsRoute = require("./routes/accountDisplay");
app.use(displayAccountsRoute);

// Account Hinzufügen
const accountAddRoute = require("./routes/accountAdd");
app.use(accountAddRoute);

// Account Löschen
const accountDeleteRoute = require("./routes/accountDelete");
app.use(accountDeleteRoute);

// Account bearbeiten
const accountEditRoute = require("./routes/accountEdit");
app.use(accountEditRoute);

// Gruppe hinzufügen
const groupsAddRoute = require("./routes/groupsAdd");
app.use(groupsAddRoute);

// Gruppen anzeigen
const groupsDisplayRoute = require("./routes/groupsDisplay");
app.use(groupsDisplayRoute);

// Gruppen bearbeiten
const groupsEditRoute = require("./routes/groupsEdit");
app.use(groupsEditRoute);

// Gruppen löschen
const groupsDeleteRoute = require("./routes/groupsDelete");
app.use(groupsDeleteRoute);

// Master-Account bearbeiten
const masterAccChangesRoute = require("./routes/chmastercreds");
app.use(masterAccChangesRoute);

// Get user Data

const getUserDataRoute = require("./routes/getUserData");
app.use(getUserDataRoute);

// Get user Data with auth
const getUserDataAuthRoute = require("./routes/getUserDataAuth");
app.use(getUserDataAuthRoute);

initDB().then(() => {
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
});
