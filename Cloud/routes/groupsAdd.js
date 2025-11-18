const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const pool = require("../pool");
require("dotenv").config();
const auth = require("../middleware/auth");

router.post("/groups/add", auth, async (req, res) => {
    const { group_name } = req.body;
    const { user_id } = req.user;

    if(!group_name) {
        return res.status(400).json({message: "Bitte gib einen Gruppennamen an."})
    }

    try {
        const newGroup = await pool.query(
            "INSERT INTO groups (group_name, user_id) VALUES ($1, $2)",
            [group_name, user_id]
        );

        res.status(201).json({
            message: "Gruppe erfolgreich hinzugefügt!",
            // group: newGroup.rows[0],
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Serverfehler!"});
    }
});

module.exports = router;