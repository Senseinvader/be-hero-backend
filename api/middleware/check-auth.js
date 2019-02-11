const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    console.log('entered password checking')
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, "secret");  // Secret should be replaced with process.env.JWT_KEY, somewhy doesn't work
    req.userData = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      message: 'Auth failed 4'
    });
  }
};