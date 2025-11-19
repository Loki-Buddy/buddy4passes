const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const pool = require("../pool");
require("dotenv").config();

router.post("/user/login", async (req, res) => {
  const { user_name, master_password } = req.body;

  try {
    const user = await pool.query(
      "SELECT * FROM b4puser WHERE user_name = $1",
      [user_name]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({
        message: "Loginversuch fehlgeschlagen, bitte überprüfe deine Eingabe!",
      });
    }
    if (user.rows[0].master_password !== master_password) {
      return res.status(401).json({
        message: "Loginversuch fehlgeschlagen, bitte überprüfe deine Eingabe!",
      });
    }
    const token = jwt.sign(
      { user_id: user.rows[0].user_id },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }
    );

    const refresh_token = jwt.sign(
      { user_id: user.rows[0].user_id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login erfolgreich!",
      token: token,
      refresh_token: refresh_token,
    });
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ message: "Serverfehler, verusche es später nochmal!" });
  }
});

module.exports = router;
