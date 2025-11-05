const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
require("dotenv").config();
const auth = require("../middleware/auth");

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

router.post("/account/add", auth, async (req, res) => {
  const { service, service_email, service_username, service_password } =
    req.body;
  const { user_id } = req.user;

  try {
    const newAccount = await pool.query(
      "INSERT INTO accounts (user_id, service, service_email, service_username, service_password) VALUES ($1, $2, $3, $4, $5)",
      [user_id, service, service_email, service_username, service_password]
    );
    res.status(201).json({ message: "Account erfolgreich hinzugefügen!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Serverfehler, verusche es später nochmal!");
  }
});

module.exports = router;
