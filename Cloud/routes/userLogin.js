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
  const { userName, masterPW } = req.body;

  try {
    const user = await pool.query("SELECT * FROM b4puser WHERE userName = $1", [
      userName,
    ]);

    if (user.rows.length === 0) {
      return res.status(401).json({
        message: "Loginversuch fehlgeschlagen, bitte überprüfe deine Eingabe!",
      });
    }
    if (user.rows[0].masterpw !== masterPW) {
      return res.status(401).json({
        message: "Loginversuch fehlgeschlagen, bitte überprüfe deine Eingabe!",
      });
    }
    const token = jwt.sign(
      { userID: user.rows[0].userID },
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
