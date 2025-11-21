const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const pool = require("../pool");
require("dotenv").config();
const auth = require("../middleware/auth");

router.post("/account/add", auth, async (req, res) => {
  const { service, service_email, service_username, service_password, group_id } =
    req.body;
  const { user_id } = req.user;

  if (group_id) {
    try {
      const newAccount = await pool.query(
        "INSERT INTO accounts (user_id, service, service_email, service_username, service_password, group_id) VALUES ($1, $2, $3, $4, $5, $6)",
        [user_id, service, service_email, service_username, service_password, group_id]
      );
      res.status(201).json({ message: "Account erfolgreich hinzugefügt!" });
    } catch (err) {
      console.error(err.message);
      res
        .status(500)
        .json({ message: "Serverfehler, versuche es später nochmal!" });
    }
  } else {
    try {
      const newAccount = await pool.query(
        "INSERT INTO accounts (user_id, service, service_email, service_username, service_password) VALUES ($1, $2, $3, $4, $5)",
        [user_id, service, service_email, service_username, service_password]
      );
      res.status(201).json({ message: "Account erfolgreich hinzugefügt!" });
    } catch (err) {
      console.error(err.message);
      res
        .status(500)
        .json({ message: "Serverfehler, versuche es später nochmal!" });
    }
  }


});

module.exports = router;
