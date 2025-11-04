const bcrypt = require("bcrypt");

async function hashString(password) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

// gehashtes Passwort vergleichen

async function verifyString(inputPassword, storedHash) {
  const match = await bcrypt.compare(inputPassword, storedHash);
  return match;
}

module.exports = { hashString, verifyString };
