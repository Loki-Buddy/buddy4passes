const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();

router.post("/user/refresh", async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token)
    return res.status(401).json({ message: "Kein Refresh Token vorhanden" });

  jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Refresh Token ungültig" });
    }

    const newAccessToken = jwt.sign(
      { user_id: decoded.user_id },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }
    );

    res.json({ token: newAccessToken });
  });
});

module.exports = router;
