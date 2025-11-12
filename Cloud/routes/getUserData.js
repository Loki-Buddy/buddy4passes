const express = require("express");
const router = express.Router();
const pool = require("../pool");
require("dotenv").config();

router.get("/user/data", async (req, res) => {
  const { user_name, user_email } = req.query;

  try {
    let user;
    // Suche nach user_name ODER user_email
    if (user_name) {
      user = await pool.query("SELECT * FROM b4puser WHERE user_name = $1", [
        user_name,
      ]);
    } else if (user_email) {
      user = await pool.query("SELECT * FROM b4puser WHERE user_email = $1", [
        user_email,
      ]);
    }

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
