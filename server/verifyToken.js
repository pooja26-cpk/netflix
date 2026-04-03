import jwt from "jsonwebtoken";

function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  console.log('Auth middleware: token present?', !!token);
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware: token decoded successfully for user', decoded.id);
    req.user = decoded; // Attach the decoded user payload to req.user
    next();
  } catch (err) {
    console.log('Auth middleware: token verification failed', err.message);
    res.status(401).json({ message: 'Invalid token' });
  }
}

export default authenticate;
