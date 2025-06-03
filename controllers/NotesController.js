import asyncHandler from 'express-async-handler';

import Note from '../models/NotesModel.js';
import AuthController from '../controllers/AuthController.js';

class NotesController extends AuthController {

    static setNotes = asyncHandler(async (req, res) => {

        try {
            const { title, desc, color, text_color } = req.body;

            if (!title || !color) {
                res.status(403).json(this.generateResponse({
                    message: 'Please enter all required fields.'
                }, 403));
                return;
            }

            const notes = await Note.create({
                user_id: req.user._id,
                title: title,
                desc: desc,
                color: color,
                text_color: text_color
            });

            if (!notes) {
                res.status(500).json(this.generateResponse({
                    message: 'Sticky note creation failed.'
                }, 500));
                return;
            }

            res.status(200).json(this.generateResponse({
                message: 'Sticky note created successfully.'
            })
            );


        } catch (err) {
            res.status(400);
            throw new Error(err);
        }
    })

    static getNotes = asyncHandler(async (req, res) => {

        try {

            const id = req.params.id;
            const notes = await Note.findOne({
                _id: id,
                user_id: req.user._id,
                isDeleted: false
            });

            if (!notes) {
                res.status(404).json(this.generateResponse({
                    message: 'Notes not found.'
                }, 404));
                return;
            }

            res.status(200).json(this.generateResponse({
                message: 'Notes Found.',
                info: notes
            }));

        } catch (err) {
            res.status(400);
            throw new Error(err);
        }
    })

    static updateNotes = asyncHandler(async (req, res) => {

        try {

            const id = req.params.id;
            const notes = await Note.findOne({
                _id: id,
                user_id: req.user._id,
                isDeleted: false
            });

            if (!notes) {
                res.status(404).json(this.generateResponse({
                    message: 'Notes not found.'
                }, 404));
                return;
            }

            const { title, desc, color, text_color } = req.body;
            if (!title || !color) {
                res.status(403).json(this.generateResponse({
                    message: 'Please enter all required fields.'
                }, 403));
                return;
            }

            const updateNotes = await Note.updateOne(
                {
                    _id: id,
                    user_id: req.user._id
                },
                {
                    title: title,
                    desc: desc,
                    color: color,
                    text_color: text_color
                }
            );
            if (!updateNotes) {
                res.status(500).json(this.generateResponse({
                    message: 'Sticky note updation failed.'
                }, 500));
                return;
            }

            res.status(200).json(this.generateResponse({
                message: 'Sticky notes updated successfully.'
            }))

        } catch (err) {
            res.status(400);
            throw new Error(err);
        }
    })

    static unsetNotes = asyncHandler(async (req, res) => {

        try {

            const id = req.params.id;
            const notes = await Note.findOne({
                _id: id,
                user_id: req.user._id,
                isDeleted: false
            });

            if (!notes) {
                res.status(404).json(this.generateResponse({
                    message: 'Notes not found.'
                }, 404));
                return;
            }

            const deleteNote = await Note.updateOne(
                {
                    _id: id,
                    user_id: req.user._id
                },
                {
                    isDeleted: true
                }
            );
            if (!deleteNote) {
                res.status(500).json(this.generateResponse({
                    message: 'Sticky note deletion failed.'
                }, 500));
                return;
            }

            res.status(200).json(this.generateResponse({
                message: 'Sticky notes deleted successfully.'
            }))


        } catch (err) {
            res.status(400);
            throw new Error(err);
        }
    })

    static getNotesList = asyncHandler(async (req, res) => {

        try {

            req.query.limit = Number(req.query.limit);
            req.query.page = Number(req.query.page);

            let search = req.query.search ? req.query.search : '';
            let sort = req.query.sort ? req.query.sort : 'new';
            let limit = req.query.limit && req.query.limit <= 50 ? req.query.limit : 20;
            let page = req.query.page && req.query.page > 0 ? req.query.page : 1;
            let skip = page && page > 0 ? limit * (page - 1) : 0;


            const notes = await Note.aggregate([
                {
                    $match: {
                        $expr: {
                            $and: [{
                                $or: [
                                    {
                                        "$regexMatch": {
                                            "input": "$title",
                                            "regex": new RegExp(search),
                                            "options": "i",
                                        }
                                    },
                                    {
                                        "$regexMatch": {
                                            "input": "$desc",
                                            "regex": new RegExp(search),
                                            "options": "i",
                                        }
                                    },
                                    {
                                        "$regexMatch": {
                                            "input": "$color",
                                            "regex": new RegExp(search),
                                            "options": "i",
                                        }
                                    }
                                ]
                            },
                            { $eq: ["$user_id", req.user._id] },
                            { $eq: ["$isDeleted", false] },
                            ]
                        }
                    }
                },
                { $sort: { createdAt: sort == 'old'? 1: -1 } },
                { $skip: skip }
            ]).limit(limit);

            if (notes && notes.length > 0) {

                const count = await Note.aggregate([
                    {
                        $match: {
                            $expr: {
                                $and: [{
                                    $or: [
                                        {
                                            "$regexMatch": {
                                                "input": "$title",
                                                "regex": new RegExp(search),
                                                "options": "i",
                                            }
                                        },
                                        {
                                            "$regexMatch": {
                                                "input": "$desc",
                                                "regex": new RegExp(search),
                                                "options": "i",
                                            }
                                        },
                                        {
                                            "$regexMatch": {
                                                "input": "$color",
                                                "regex": new RegExp(search),
                                                "options": "i",
                                            }
                                        }
                                    ]
                                },
                                { $eq: ["$user_id", req.user._id] },
                                { $eq: ["$isDeleted", false] },
                                ]
                            }
                        }
                    },
                    { $count: 'total' }
                ]);

                res.status(200).json(
                    this.generateResponse(
                        {
                            message: 'Data found.',
                            total: count[0].total,
                            note_list: notes,
                            page_no: page
                        }
                    )
                );
            } else {
                res.status(404).json(this.generateResponse({
                    message: 'Data not found.'
                }, 404));
                return;
            }

        } catch (err) {
            res.status(400);
            throw new Error(err);
        }
    })

}

export default NotesController;