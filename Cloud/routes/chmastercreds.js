const express = require("express");
const router = express.Router();
const pool = require("../pool");
const auth = require("../middleware/auth");
require("dotenv").config();

router.put("/user/chmastercreds", auth, async (req, res) => {
  const { new_user_name, new_user_email, new_master_password } = req.body;

  try {
    const { user_id } = req.user;

    const user = await pool.query(
      "SELECT * FROM b4puser WHERE user_id = $1",
      [user_id]
    );

    /* if (new_master_password) {
      if (old_master_password !== user.rows[0].master_password) {
        return res.status(400).json({ message: "Altes Passwort ist falsch!" });
      }
      if (new_master_password !== confirm_new_master_password) {
        return res.status(400).json({ message: "Passwörter stimmen nicht überein!"});
      }
      if (!old_master_password) {
        return res.status(400).json({ message: "Altes Passwort erforderlich!" });
      }
    } */

    const sets = [];
    const values = [];
    let index = 1;

    if (new_user_name) {
      if(new_user_name === user.rows[0].user_name) {
        return res.status(400).json({ message: "Benutzername ist gleich!" });
      }
      sets.push(`user_name = $${index}`);
      values.push(new_user_name);
      index++;
    }

    if (new_user_email) {
      if(new_user_email === user.rows[0].user_email) {
        return res.status(400).json({ message: "E-Mail ist gleich!" });
      }
      sets.push(`user_email = $${index}`);
      values.push(new_user_email);
      index++;
    }

    if (new_master_password) {
      sets.push(`master_password = $${index}`);
      values.push(new_master_password);
      index++;
    }

    const updateQuery = `UPDATE b4puser SET ${sets.join(", ")} WHERE user_id = $${index}`;
    values.push(user_id);

    await pool.query(updateQuery, values);


    res.status(200).json({ message: "Änderungen erfolgreich gespeichert!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Interner Serverfehler" });
  }

});


module.exports = router;