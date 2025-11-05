const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();
const pool = require("../pool");

router.get("/accounts", auth, async (req, res) => {
    try {
        const userId = req.user.user_id;

        const result = await pool.query(
            "SELECT service, service_email, service_username, service_password FROM accounts WHERE user_id = $1",
            [userId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Serverfehler" });
    }
});

module.exports = router;


