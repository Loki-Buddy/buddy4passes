const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
require("dotenv").config();

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

router.post("/user/login", async (req, res) => {
  const { user_name, master_password } = req.body;

  try {
    const user = await pool.query(
      "SELECT * FROM b4puser WHERE user_name = $1",
      [user_name]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({
        message: "Loginversuch fehlgeschlagen, bitte überprüfe deine Eingabe!",
      });
    }
    if (user.rows[0].master_password !== master_password) {
      return res.status(401).json({
        message: "Loginversuch fehlgeschlagen, bitte überprüfe deine Eingabe!",
      });
    }
    const token = jwt.sign(
      { user_id: user.rows[0].user_id },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }
    );
    res.json({ message: "Login erfolgreich!", token: token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Serverfehler, verusche es später nochmal!");
  }
});

module.exports = router;
