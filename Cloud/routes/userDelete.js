const express = require("express");
const router = express.Router();
require("dotenv").config();
const auth = require("../middleware/auth"); // User muss für die Aktion eingeloggt sein
const pool = require("../pool");

// Löschen-Route
router.delete("/user/delete", auth, async (req, res) => {
    const { user_email } = req.body; // E-Mail und ID werden verwendet
    const {user_id} = req.user

    if(!user_email) {
        return res.status(400).json({message: "Bitte gib eine gültige E-Mail an."});
    }
    // Existiert der User?
    try {
        const existingUser = await pool.query(
            "SELECT * FROM b4puser WHERE user_email = $1 AND user_id = $2", [user_email, user_id]
        );
        if (existingUser.rows.length===0) {
            return res.status(404).json({message:"Dieser User existiert nicht."});
        }
        // User löschen mit dependencies ON DELETE CASCADE 
        await pool.query("DELETE FROM b4puser WHERE user_email = $1", [user_email]);

        res.status(200).json({message: "Nutzer und zugehörige Daten wurden erfolgreich gelöscht."});
    } catch (err) {
        console.error(err.message);
        res.status(500).json({message: "Fehler beim Löschen des Nutzers."});
    }
});

module.exports = router;