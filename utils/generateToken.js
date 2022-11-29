const jwt = require("jsonwebtoken");

const generateToken = (id, secretKey) => {
  return jwt.sign({ id }, secretKey, { expiresIn: 86400 });
};

module.exports = generateToken;
