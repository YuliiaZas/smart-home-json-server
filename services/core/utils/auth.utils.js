const { verifyAccessToken } = require("./auth.jwt.utils");

function requireAuth(req, res, next, server) {
  const authorizationHeader =
    req.header("Authorization") && req.header("Authorization").split(" ");
  const authorizationMethod = authorizationHeader && authorizationHeader[0];
  const token = authorizationHeader && authorizationHeader[1];

  if (!token || authorizationMethod !== "Bearer") {
    return res.status(401).send("Unauthorized");
  }

  try {
    const payload = verifyAccessToken(token);
    const user = server.db.get('users').find({ id: payload.sub }).value();

    if (!user || user.tokenVersion !== payload.v) throw new Error('Invalid token');

    req.user = { id: user.id, userName: user.userName };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { requireAuth };
