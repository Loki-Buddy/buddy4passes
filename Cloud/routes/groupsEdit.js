const express = require("express");
const router = express.Router();
const pool = require("../pool");
const auth = require("../middleware/auth");

router.put("/groups/edit", auth, async (req, res) => {
    const { group_id, new_group_name } = req.body;
    const { user_id } = req.user;

    try {
        const updateGroup = await pool.query(
            "UPDATE groups SET group_name = $1 WHERE group_id = $2 AND user_id = $3",
            [new_group_name, group_id, user_id]
        );
        res.status(200).json({ message: "Gruppe erfolgreich aktualisiert!" });
    } catch (err) {
        console.error(err.message);
        res
            .status(500)
            .json({ message: "Serverfehler, verusche es später nochmal!" });
    }
});

module.exports = router;