const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();

router.post("/user/login", async (req, res) => {
  const { userEmail, masterPW } = req.body;

  try {
    const user = await pool.query(
      "SELECT * FROM b4puser WHERE userEmail = $1",
      [userEmail]
    );
    if (user.rows.length === 0) {
      return res
        .status(401)
        .json({
          message: "Loginversuch fehlgeschlagen, bitte überprüfe deine Eingae!",
        });
    }
    if (user.rows[0].masterPW !== masterPW) {
      return res
        .status(401)
        .json({
          message: "Loginversuch fehlgeschlagen, bitte überprüfe deine Eingae!",
        });
    }
    const token = jwt.sign(
      { userID: user.rows[0].userID },
      process.env.JWT_SECRET,
      { expiresIn: "300000" }
    );
    res.json({ message: "Login erfolgreich!", token: token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Serverfehler, verusche es später nochmal!");
  }
});

module.exports = router;
