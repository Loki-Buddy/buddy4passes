const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
require("dotenv").config();
const auth = require("../middleware/auth"); // User muss für die Aktion eingeloggt sein

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
// Löschen-Route
router.delete("/user/delete", auth, async (req, res) => {
    const { userEmail }=req.body; // E-Mail oder ID sinnvoller? Einbau Token?

    if(!userEmail) {
        return res.status(400).json({message: "Bitte gib eine gültige E-Mail an."});
    }
    // Existiert der User?
    try {
        const existingUser = await pool.query(
            "SELECT * FROM b4puser WHERE userEmail = $1", [userEmail]
        );
        if (existingUser.rows.length===0) {
            return res.status(404).json({message:"Dieser User existiert nicht."});
        }
        // User löschen mit dependencies ON DELETE CASCADE 
        await pool.query("DELETE FROM b4puser WHERE userEmail = $1", [userEmail]);

        res.status(200).json({message: "Nutzer und zugehörige Daten wurden erfolgreich gelöscht."});
    } catch (err) {
        console.error(err.message);
        res.status(500).json({message: "Fehler beim Löschen des Nutzers."});
    }
});

module.exports = router;