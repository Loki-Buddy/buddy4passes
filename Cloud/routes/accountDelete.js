const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const pool = require("../pool");
require("dotenv").config();
const auth = require("../middleware/auth");


router.delete("/account/delete", auth, async (req, res) => {
  const { account_id } = req.body;
  const { user_id } = req.user;

  try {
    const deleteAccount = await pool.query(
      "DELETE FROM accounts WHERE account_id = $1 AND user_id = $2",
      [account_id, user_id]
    );
    res.status(200).json({ message: "Account erfolgreich gelöscht!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Serverfehler, verusche es später nochmal!");
  }
});

module.exports = router;
