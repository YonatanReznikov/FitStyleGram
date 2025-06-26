const jwt = require('jsonwebtoken')
const httpError = require('../models/errorModel')


const authMiddleware = async (req , res, next) => {
    const authorization = req.headers.authorization || req.headers.authorization;
    if(authorization && authorization.startsWith("Bearer")) {
        const token = authorization.split(' ')[1]
        jwt.verify(token, process.env.JWT_SECRET, (err, info) => {
            if(err) {
                return next(new httpError("Unauthorized. Invalid token", 403))
            }

            req.user = info;
            next()
        })

    } else{
        return next(new httpError("Unauthorized. No token", 401))
    }
}


module.exports = authMiddleware;