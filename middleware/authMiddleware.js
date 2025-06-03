import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler'
import User from '../models/UserModel.js';

const protect = asyncHandler(async (req, res, next) => {
    let token
    if ( req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findOne({ _id : decoded.id, isDeleted : false }).select('-password');
            next();

        } catch (error) {
            res.status(401)
            throw new Error('Token Verification Failed.')
        }
    } else {
        res.status(401)
        throw new Error('Unauthorized Access.')
    }
    if (!token) {
        res.status(401)
        throw new Error('Invalid Token')
    }
})

export default protect