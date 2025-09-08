const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_TTL = '1h';

function signAccessToken(user) {
  return jwt.sign({ sub: user.id, v: user.tokenVersion }, JWT_SECRET, { expiresIn: JWT_TTL });
}

function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { signAccessToken, verifyAccessToken };
