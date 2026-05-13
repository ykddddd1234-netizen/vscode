//auth middelware
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // 1. no token
  if (!authHeader) {
	return res.status(401).json({ error: '토큰 없음' });
  }

  // 2. extract token
  const token = authHeader.split(' ')[1];

  try {
	// 3. verify token
	const decoded = jwt.verify(token, process.env.JWT_SECRET);

	req.user = decoded;

	next();

  } catch (err) {
	return res.status(401).json({ error: '유효하지 않은 토큰' });
  }
}

module.exports = authMiddleware;


