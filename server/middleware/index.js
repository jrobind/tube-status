const jwt = require('jsonwebtoken');

const jwtVerify = (req, res, next) => {
    jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET, (err,  decoded) => {
        if (err) {
            console.log('cannot verify jwt'); 
            // send 401 back to user and return
            res.status(401).json({ err, message: 'user not authorised' });
            return;
        } else {
            res.locals.decoded = decoded;
            console.log(res, 'reaching')
            next();
        } 
    
    });
}

module.exports = { jwtVerify } 