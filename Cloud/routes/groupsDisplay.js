const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();
const pool = require("../pool");

router.get("/groups", auth, async (req, res) => {
  try {
    const userId = req.user.user_id;

    const result = await pool.query(
      "SELECT group_id, group_name FROM groups WHERE user_id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Keine Gruppen gefunden!" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Serverfehler" });
  }
});

module.exports = router;
