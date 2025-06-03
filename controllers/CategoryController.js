import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

import Category from '../models/CategoryModel.js';
import Task from '../models/TaskModel.js';
import AuthController from '../controllers/AuthController.js';

const ObjectId = mongoose.Types.ObjectId;

class CategoryController extends AuthController {

    static setCategory = asyncHandler(async (req, res) => {

        try {
            const { name, color, text_color } = req.body;

            if (!name || !color ) {
                res.status(403).json(this.generateResponse({
                    message: 'Please enter all required fields.'
                }, 403));
                return;
            }

            const category = await Category.create({
                user_id: req.user._id,
                name: name,
                color: color,
                text_color: text_color
            });

            if (!category) {
                res.status(500).json(this.generateResponse({
                    message: 'Category creation failed.'
                }, 500));
                return;
            }

            res.status(200).json(this.generateResponse({
                message: 'Category created successfully.'
            })
            );


        } catch (err) {
            res.status(400);
            throw new Error(err);
        }
    })

    static getCategory = asyncHandler(async (req, res) => {

        try {

            const id = req.params.id;
            const category = await Category.findOne({
                _id: id,
                user_id: req.user._id,
                isDeleted: false
            });

            if (!category) {
                res.status(404).json(this.generateResponse({
                    message: 'Category not found.'
                }, 404));
                return;
            }

            res.status(200).json(this.generateResponse({
                message: 'Category Found.',
                info: category
            }));

        } catch (err) {
            res.status(400);
            throw new Error(err);
        }
    })

    static updateCategory = asyncHandler(async (req, res) => {

        try {

            const id = req.params.id;
            const category = await Category.findOne({
                _id: id,
                user_id: req.user._id,
                isDeleted: false
            });

            if (!category) {
                res.status(404).json(this.generateResponse({
                    message: 'Category not found.'
                }, 404));
                return;
            }

            const { name, color, text_color } = req.body;
            if (!name || !color) {
                res.status(403).json(this.generateResponse({
                    message: 'Please enter all required fields.'
                }, 403));
                return;
            }

            const updateCategory = await Category.updateOne(
                {
                    _id: id,
                    user_id: req.user._id
                },
                {
                    name: name,
                    color: color,
                    text_color: text_color
                }
            );
            if (!updateCategory) {
                res.status(500).json(this.generateResponse({
                    message: 'Category updation failed.'
                }, 500));
                return;
            }

            res.status(200).json(this.generateResponse({
                message: 'Category updated successfully.'
            }))

        } catch (err) {
            res.status(400);
            throw new Error(err);
        }
    })

    static unsetCategory = asyncHandler(async (req, res) => {

        try {

            const id = req.params.id;
            const category = await Category.findOne({
                _id: id,
                user_id: req.user._id,
                isDeleted: false
            });

            if (!category) {
                res.status(404).json(this.generateResponse({
                    message: 'Category not found.'
                }, 404));
                return;
            }

            const deleteCategory = await Category.updateOne(
                {
                    _id: id,
                    user_id: req.user._id
                },
                {
                    isDeleted: true
                }
            );
            if (!deleteCategory) {
                res.status(500).json(this.generateResponse({
                    message: 'Category deletion failed.'
                }, 500));
                return;
            }

            res.status(200).json(this.generateResponse({
                message: 'Category deleted successfully.'
            }))


        } catch (err) {
            res.status(400);
            throw new Error(err);
        }
    })

    static getCategoryList = asyncHandler(async (req, res) => {

        try {

            req.query.limit = Number(req.query.limit);
            req.query.page = Number(req.query.page);

            let search = req.query.search ? req.query.search : '';
            let limit = req.query.limit && req.query.limit <= 50 ? req.query.limit : 20;
            let page = req.query.page && req.query.page > 0 ? req.query.page : 1;
            let skip = page && page > 0 ? limit * (page - 1) : 0;


            const categories = await Category.aggregate([
                {
                    $match: {
                        $expr: {
                            $and: [{
                                $or: [
                                    {
                                        "$regexMatch": {
                                            "input": "$name",
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
                { $sort: { createdAt: 1 } },
                { $skip: skip }
            ]).limit(limit);

            if (categories && categories.length > 0) {

                const count = await Category.aggregate([
                    {
                        $match: {
                            $expr: {
                                $and: [{
                                    $or: [
                                        {
                                            "$regexMatch": {
                                                "input": "$name",
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
                            category_list: categories,
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

    static getTasks = asyncHandler(async (req, res) => {

        try {

            const id = req.params.id;
            const category = await Category.findOne({
                _id: id,
                user_id: req.user._id,
                isDeleted: false
            });

            if (!category) {
                res.status(404).json(this.generateResponse({
                    message: 'Category not found.'
                }, 404));
                return;
            }

            req.query.limit = Number(req.query.limit);
            req.query.page = Number(req.query.page);

            let search = req.query.search ? req.query.search : '';
            let limit = req.query.limit && req.query.limit <= 50 ? req.query.limit : 20;
            let page = req.query.page && req.query.page > 0 ? req.query.page : 1;
            let skip = page && page > 0 ? limit * (page - 1) : 0;


            const tasks = await Task.aggregate([
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
                                    }
                                ]
                            },
                            { $eq: ["$user_id", req.user._id] },
                            { $eq: ["$category_id", new ObjectId(id)] },
                            { $eq: ["$isDeleted", false] },
                            ]
                        }
                    }
                },
                { $sort: { createdAt: 1 } },
                { $skip: skip }
            ]).limit(limit);

            if (tasks && tasks.length > 0) {

                const count = await Task.aggregate([
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
                                        }
                                    ]
                                },
                                { $eq: ["$user_id", req.user._id] },
                                { $eq: ["$category_id", new ObjectId(id)] },
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
                            task_list: tasks,
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

export default CategoryController;