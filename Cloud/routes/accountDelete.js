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

router.delete("/account/delete", auth, async (req, res) => {
  const { account_id } = req.body;
  const { user_id } = req.user;

  try {
    const deleteAccount = await pool.query(
      "DELETE FROM accounts WHERE account_id = $1 AND user_id = $2",
      [account_id, user_id]
    );
    res.status(200).json({ message: "Account erfolgreich gelöscht!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Serverfehler, verusche es später nochmal!");
  }
});

module.exports = router;
