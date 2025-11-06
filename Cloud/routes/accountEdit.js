const express = require("express");
const router = express.Router();
const pool = require("../pool");
const auth = require("../middleware/auth");

// PUT /account/edit
// Body: {  service_email, service_username, service_password }
router.put("/account/edit", auth, async (req, res) => {
    const { account_id, service_email, service_username, service_password } = req.body;

    try {
        const { user_id } = req.user;


        const existing = await pool.query("SELECT * FROM accounts WHERE account_id = $1", [account_id]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ message: "Account nicht gefunden" });
        }
        if (existing.rows[0].user_id !== user_id) {
            return res.status(403).json({ message: "Keine Berechtigung, diesen Account zu ändern" });
        }

        const sets = [];
        const values = [];
        let index = 1;


        if (service_email !== undefined) {
            sets.push(`service_email = $${index}`);
            values.push(service_email);
            index++;
        }

        if (service_username !== undefined) {
            sets.push(`service_username = $${index}`);
            values.push(service_username);
            index++;
        }

        if (service_password !== undefined) {
            sets.push(`service_password = $${index}`);
            values.push(service_password);
            index++;
        }

        if (sets.length === 0) {
            return res.status(400).json({ message: "Keine zu speichernden Änderungen angegeben" });
        }

        const updateQuery = `UPDATE accounts SET ${sets.join(", ")} WHERE account_id = $${index}`;
        values.push(account_id);

        await pool.query(updateQuery, values);

        return res.status(200).json({ message: "Änderungen erfolgreich gespeichert!" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Interner Serverfehler" });
    }
});

module.exports = router;
