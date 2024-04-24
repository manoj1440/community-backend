const jwt = require('jsonwebtoken');

const authentication = (req, res, next) => {

    const excludedRoutes = ['/api/login','/api/logout'];

    if (excludedRoutes.includes(req.path)) {
        return next();
    }

    const token = req.headers.authorization || req.cookies.token;

    if (!token) {
        res.clearCookie('token');
        return res.status(401).json({ staus: false, tokenFailed: true, message: 'Unauthorized token access' });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.userData = decodedToken; // Attach the decoded payload to the request object
        next();
    } catch (error) {
        res.clearCookie('token');
        return res.status(401).json({ staus: false, tokenFailed: true, message: 'Token expired or invalid' });
    }
};

module.exports = authentication;
