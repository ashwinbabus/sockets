const jwt = require('jsonwebtoken');
const config = require('../config/config');

function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).send({auth: false, message: 'No authorization token provided.'});
    }
    jwt.verify(token, config.secret, function(err, decoded) {
        if (err) {
            return res.status(401).send({auth: false, message: err.message ? err.message : 'Failed to authenticate authorization token.'});
        }
        req.user_id = decoded.id;
        next();
    });
}

module.exports = verifyToken;