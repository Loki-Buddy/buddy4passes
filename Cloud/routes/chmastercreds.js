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

/* if (user.rows.length === 0) {
        return res.status(404).json({ message: "User nicht gefunden" });
      } */
router.put("/user/chmastercreds", auth, async (req, res) => {
  const { new_user_name, new_user_email, old_master_password, new_master_password, confirm_new_master_password } = req.body;

  try {
    const { user_id } = req.user;

    const user = await pool.query(
      "SELECT * FROM b4puser WHERE user_id = $1",
      [user_id]
    );

    const existingUserName = await pool.query(
      "SELECT user_name FROM b4puser WHERE user_name=$1",
      [new_user_name]
    );

    if (existingUserName.rows.length > 0) {
      return res
        .status(400) //Clientfehler? Status 400 korrekt?
        .json({
          message:
            "Dieser Benutzername wird bereits von einem anderen User verwendet.",
        });
    }

    if (user.rows[0].user_name === new_user_name || new_user_name === "") {
      return res
        .status(401)
        .json({
          message:
            "Keine Änderung notwendig!"
        });
    } else {
      await pool.query(
        "UPDATE b4puser SET user_name = $1 WHERE user_id = $2",
        [new_user_name, user_id]
      );
    }

    const existingUserEmail = await pool.query(
      "SELECT user_email FROM b4puser WHERE user_email=$1",
      [new_user_email]
    );

    if (existingUserEmail.rows.length > 0) {
      return res
        .status(400) //Clientfehler? Status 400 korrekt?
        .json({
          message:
            "Diese E-Mail wird bereits von einem anderen User verwendet.",
        });
    }

    if (user.rows[0].user_email === new_user_email || new_user_email === "") {
      return res
        .status(401)
        .json({
          message:
            "Keine Änderung notwendig!"
        });
    } else {
      await pool.query(
        "UPDATE b4puser SET user_name = $1 WHERE user_id = $2",
        [user_name, user_id]
      );
    }

    if (user.rows[0].master_password !== old_master_password) {
      return res.status(401).json({ message: "Altes Passwort ist falsch!" });
    }
    else if (user.rows[0].master_password === new_master_password) {
      return res.status(400).json({ message: "Wähle ein neues Passwort!" });
    }
    else if (new_master_password !== confirm_new_master_password) {
      return res.status(400).json({ message: "Passwörter stimmen nicht ueberein" });
    }

    // Passwort aktualisieren
    await pool.query(
      "UPDATE b4puser SET master_password = $1 WHERE user_id = $2",
      [new_master_password, user_id]
    );

    res.status(200).json({ message: "Passwort erfolgreich geändert" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Interner Serverfehler" });
  }

});


module.exports = router;