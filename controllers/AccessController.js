import asyncHandler from 'express-async-handler';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../models/UserModel.js';
import AuthController from '../controllers/AuthController.js';


class AccessController extends AuthController {

    static register = asyncHandler(async (req, res) => {
        try {
            const { first_name, last_name, email, password, meta } = req.body;

            if (!first_name || !last_name || !email || !password) {
                res.status(403).json(this.generateResponse({
                    message: 'Please enter all fields.'
                }, 403));
                return;
            }

            if (password.length < 6) {
                res.status(403).json(this.generateResponse({
                    message: 'Password length can not be less than 6 characters.'
                }, 403));
                return;
            }

            const emailExist = await User.findOne({ email: email.toLowerCase(), isDeleted: false });
            if (emailExist) {
                res.status(409).json(this.generateResponse({
                    message: 'Email already exists.'
                }, 409));
                return;
            }

            const encrpyted_pass = bcryptjs.hashSync(password, 8);

            const new_user = await User.create({
                first_name: first_name,
                last_name: last_name,
                email: email.toLowerCase(),
                password: encrpyted_pass,
                meta: meta
            });

            if (!new_user) {
                res.status(500).json(this.generateResponse({
                    message: 'User creation failed.'
                }, 500));
                return;
            }

            res.status(200).json(
                this.generateResponse({ message: 'User created successfully.' })
            );

        } catch (err) {
            res.status(400)
            throw new Error(err)
        }

    })

    static login = asyncHandler(async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(403).json(this.generateResponse({
                    message: 'Please enter both fields.'
                }, 403));
                return;
            }

            const user = await User.findOne({
                email: email.toLowerCase(),
                isDeleted: false
            });

            if (!user) {
                res.status(404).json(this.generateResponse({
                    message: 'User not found.'
                }, 404));
                return;
            }

            const isMatch = await bcryptjs.compare(password, user.password);

            if (!(user.email == email.toLowerCase() && isMatch)) {
                res.status(401).json(this.generateResponse({
                    message: 'Invalid Credentials.'
                }, 401));
                return;
            }

            res.status(200).json(
                this.generateResponse(
                    {
                        message: 'Login Successful.',
                        info: {
                            id: user.id,
                            first_name: user.first_name,
                            last_name: user.last_name,
                            email: user.email,
                            picture: user.picture,
                            meta: user.meta,
                        },
                    },
                    200,
                    this.generateToken(user._id)
                )
            );

        } catch (err) {
            res.status(400)
            throw new Error(err)
        }

    })

    static validate = asyncHandler(async (req, res) => {
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            try {
                // Get token from header
                token = req.headers.authorization.split(' ')[1]
                // Verify token
                const decoded = jwt.verify(token, process.env.JWT_SECRET)

                // Get user from the token
                let user = await User.findById(decoded.id).select("-password");

                if (user && user.isDeleted == false) {

                    let newToken = this.generateToken(user._id);
                    res.status(200).json(
                        this.generateResponse(
                            {
                                message: 'Validated',
                                info: {
                                    id: user.id,
                                    first_name: user.first_name,
                                    last_name: user.last_name,
                                    email: user.email,
                                    picture: user.picture,
                                    meta: user.meta,
                                },
                            },
                            200,
                            newToken
                        )
                    );

                } else {
                    res.status(404).json(this.generateResponse({
                        message: 'User not found.'
                    }, 404));
                    return;
                }
            } catch (err) {
                res.status(401)
                throw new Error('Authorization token not valid')
            }
        }
        if (!token) {
            res.status(401)
            throw new Error('Authorization token not present')
        }
    })
}

export default AccessController