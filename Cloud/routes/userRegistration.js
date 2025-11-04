const express = require("express");
const router = express.Router();
// const pool = require ("../pool") // Verbindung zur DB?
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

router.post("/user/register", async(req, res)=> {
    const {userName, userEmail, masterPW}= req.body;

    // Prüfen, ob der User schon existiert
    try {
        const existingUserEmail=await pool.query(
            "SELECT * FROM b4puser WHERE userEmail=$1",
            [userEmail]
        );

        const existingUserName=await pool.query(
            "SELECT * FROM b4puser WHERE userName=$1",
            [userName]
        );

        if (existingUserEmail.rows.length > 0) {
            return res
                .status(400) //Clientfehler? Status 400 korrekt?
                .json({message: "Diese E-Mail wird bereits von einem anderen User verwendet."});
        }else if (existingUserName.rows.length > 0) {
            return res
                .status(400) //Clientfehler? Status 400 korrekt?
                .json({message: "Dieser Benutzername wird bereits von einem anderen User verwendet."});
        }

        // neuen User speichern
        const newUser = await pool.query("INSERT INTO b4puser (userName, userEmail, masterPW) VALUES ($1, $2, $3)", [userName,userEmail, masterPW]);

        // Registrierung erfolgreich
        res.status(201).json({message: "Nutzer erfolgreich registriert", user: newUser.rows[0],});
    } catch (err) {
        console.error(err.message);
        res.status(500).json({message: "Fehler, bitte später erneut versuchen."}); //internal Server Error
    }
});

module.exports = router;