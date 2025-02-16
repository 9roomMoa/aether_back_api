const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: 'Access Denied: No token',
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error(err.message);
    return res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};
