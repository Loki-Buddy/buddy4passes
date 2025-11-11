const express = require("express");
const router = express.Router();
const pool = require("../pool");
//const auth = require("../middleware/auth");
require("dotenv").config();

router.get("/user/data", async (req, res) => {
    const { user_name } = req.body;

    try {
        const user = await pool.query(
            "SELECT * FROM b4puser WHERE user_name = $1",
            [user_name]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ message: "Nutzer nicht gefunden" });
        }

        res.json(user.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Serverfehler" });
    }
});

module.exports = router;