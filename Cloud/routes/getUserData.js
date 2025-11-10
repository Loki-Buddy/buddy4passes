const express = require("express");
const router = express.Router();
const pool = require("../pool");
const auth = require("../middleware/auth");
require("dotenv").config();

router.get("/user/data", auth, async (req, res) => {
    const { user_id } = req.user;

    try {
        const user = await pool.query(
            "SELECT * FROM b4puser WHERE user_id = $1",
            [user_id]
        );

        res.json(user.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Serverfehler" });
    }
});

module.exports = router;