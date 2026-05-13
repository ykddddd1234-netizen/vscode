//adminMiddleware
function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '관리자만 접근 가능' });
  }
  next();
}

module.exports = adminOnly;
