import bcryptjs from 'bcryptjs';
import asyncHandler from "express-async-handler";
import fs from 'fs/promises';

import User from "../models/UserModel.js";
import AuthController from '../controllers/AuthController.js';


class ProfileController extends AuthController {

    static get_profile = asyncHandler(async (req, res) => {

        try {
            if (req.user) {
                res.status(200).json(this.generateResponse({
                    message: 'Profile found.',
                    info: req.user
                }));
            } else {
                res.status(404).json(this.generateResponse({
                    message: 'User not found.'
                }, 404));
                return;
            }

        } catch (err) {
            res.status(400);
            throw new Error(err);
        }
    })

    static update_profile = asyncHandler(async (req, res) => {

        try {
            const user = await User.findOne({
                _id: req.user._id,
                isDeleted: false,
            });

            if (!user) {
                res.status(404).json(this.generateResponse({
                    message: 'User not found.'
                }, 404));
                return;
            }

            const action = req.body.action;

            if (action == 'picture') {
                const file = req.file;
                if (!file) {
                    res.status(403).json(this.generateResponse({
                        message: 'Image file is reuqired.'
                    }, 403));
                    return;
                }
                //if file exists then delete previous file and upload new in 'uploads' folder
                if (user.picture) {
                    const oldPath = './' + user.picture;
                    await fs.unlink(oldPath);
                }

                var path = 'uploads/' + file.filename;
                const uploadPic = await User.updateOne({ _id: user._id }, { picture: path });

                if (!uploadPic) {
                    res.status(500).json(this.generateResponse({
                        message: 'Picture updation failed.'
                    }, 500));
                    return;
                }

                res.status(200).json(this.generateResponse({
                    message: 'Profile picture updated successfully.'
                }));

            }
            else {
                const { first_name, last_name, meta } = req.body;

                if (!first_name || !last_name) {
                    res.status(403).json(this.generateResponse({
                        message: 'Please enter all fields.'
                    }, 403));
                    return;
                }

                const uploadProfile = await User.updateOne({
                    _id: user._id
                }, {
                    first_name: first_name,
                    last_name: last_name,
                    meta: meta
                });

                if (!uploadProfile) {
                    res.status(500).json(this.generateResponse({
                        message: 'Profile updation failed.'
                    }, 500));
                    return;
                }

                res.status(200).json(this.generateResponse({
                    message: 'Profile updated successfully.'
                }));

            }

        } catch (err) {
            res.status(400);
            throw new Error(err);
        }
    })

    static change_password = asyncHandler(async (req, res) => {
        try {

            const user = await User.findOne({
                _id: req.user._id,
                isDeleted: false,
            });

            if (!user) {
                res.status(404).json(this.generateResponse({
                    message: 'User not found.'
                }, 404));
                return;
            }

            const { new_pass, old_pass } = req.body;

            if (!new_pass || !old_pass) {
                res.status(403).json(this.generateResponse({
                    message: 'Please enter all fields.'
                }, 403));
                return;
            }

            if (new_pass.length < 6) {
                res.status(403).json(this.generateResponse({
                    message: 'Password can not be less than 6 characters.'
                }, 403));
                return;
            }

            const isMatch = await bcryptjs.compare(old_pass, user.password);
            if (!isMatch) {
                res.status(409).json(this.generateResponse({
                    message: 'Old password is incorrect.'
                },
                    409));
                return;
            }
            else if (await bcryptjs.compare(new_pass, user.password)) {
                res.status(401);
                throw new Error('You have entered your old password.');
            }

            const encryptedPass = bcryptjs.hashSync(new_pass, 8);

            const changePass = await User.updateOne({
                _id: user._id
            }, {
                password: encryptedPass
            });

            if (!changePass) {
                res.status(500).json(this.generateResponse({
                    message: 'Password updation failed.'
                }, 500));
                return;
            }

            res.status(200).json(this.generateResponse({
                message: 'Password changed successfully.'
            }));



        } catch (err) {
            res.status(400);
            throw new Error(err);

        }
    })

}



export default ProfileController;