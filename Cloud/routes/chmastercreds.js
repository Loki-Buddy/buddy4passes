const express = require("express");
const router = express.Router();
//const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const auth = require("../middleware/auth");
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

router.put("/user/chmastercreds", auth, async (req, res) => {
  const { old_master_password, new_master_password, confirm_new_master_password } = req.body;

  try {
    const { user_id } = req.user;

    // Prüfen, ob das alte Passwort korrekt ist
    const user = await pool.query(
      "SELECT * FROM b4puser WHERE user_id = $1",
      [user_id]
    );

    /* if (user.rows.length === 0) {
      return res.status(404).json({ message: "User nicht gefunden" });
    } */

    if (user.rows[0].master_password !== old_master_password) {
      return res.status(401).json({ message: "Altes Passwort ist falsch" });
    }

    // Passwortwiederholung korrekt?
    if (new_master_password !== confirm_new_master_password) {
      return res.status(400).json({ message: "Passwörter stimmen nicht ueberein" });
    }

    // Passwort aktualisieren
    await pool.query(
      "UPDATE b4puser SET master_password = $1 WHERE master_password = $2",
      [new_master_password, old_master_password]
    );

    res.status(200).json({ message: "Passwort erfolgreich geändert" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Interner Serverfehler" });
  }
    
});


module.exports = router;