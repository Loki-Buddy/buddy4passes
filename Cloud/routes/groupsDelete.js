const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const pool = require("../pool");
require("dotenv").config();
const auth = require("../middleware/auth");

router.delete("/groups/delete", auth, async (req, res) => {
    const { group_id } = req.body;
    const { user_id } = req.user;

    try {
        const deleteGroup = await pool.query(
            "DELETE FROM groups WHERE group_id = $1 AND user_id = $2",
            [group_id, user_id]
        );
        res.status(200).json({ message: "Gruppe erfolgreich gelöscht!" });
    } catch (err) {
        console.error(err.message);
        res
            .status(500)
            .json({ message: "Serverfehler, verusche es später nochmal!" });
    }
});

module.exports = router;