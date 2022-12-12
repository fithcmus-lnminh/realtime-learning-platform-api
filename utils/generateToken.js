const jwt = require("jsonwebtoken");

const generateToken = (id, secretKey, type) => {
  return jwt.sign({ id, type }, secretKey, { expiresIn: 86400 });
};

module.exports = generateToken;
