import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

import Task from '../models/TaskModel.js';
import Category from '../models/CategoryModel.js';
import AuthController from './AuthController.js';

const ObjectId = mongoose.Types.ObjectId;

class TaskController extends AuthController {

    static setTask = asyncHandler(async (req, res) => {

        try {
            const { title, desc, category_id, due_date, subtask, priority } = req.body;

            if (!title || !desc || !category_id || !due_date) {
                res.status(403).json(this.generateResponse({
                    message: 'Please enter all required fields.'
                }, 403));
                return;
            }

            const isCategory = await Category.findOne({
                _id: category_id,
                user_id: req.user._id,
                isDeleted: false
            });

            if (!isCategory) {
                res.status(404).json(this.generateResponse({
                    message: 'Category not found.'
                }, 404));
                return;
            }

            if (subtask.length > 0) {
                for (const item of subtask) {
                    let { name } = item
                    if (!name) {
                        res.status(403).json(this.generateResponse({
                            message: 'Invalid object. Enter subtask name.'
                        }, 403));
                        return;
                    }
                }
            }

            const new_task = await Task.create({
                title: title,
                desc: desc,
                category_id: category_id,
                user_id: req.user._id,
                due_date: due_date,
                subtask: subtask,
                priority: priority
            });

            if (!new_task) {
                res.status(500).json(this.generateResponse({
                    message: 'Task creation failed.'
                }, 500));
                return;
            }

            res.status(200).json(this.generateResponse({
                message: 'Task created successfully.'
            })
            );


        } catch (err) {
            res.status(400);
            throw new Error(err);
        }
    })

    static getTask = asyncHandler(async (req, res) => {

        try {

            const id = req.params.id;
            const task = await Task.findOne({
                _id: id,
                user_id: req.user._id,
                isDeleted: false
            });

            if (!task) {
                res.status(404).json(this.generateResponse({
                    message: 'Task not found.'
                }, 404));
                return;
            }

            res.status(200).json(this.generateResponse({
                message: 'Task Found.',
                info: task
            }));

        } catch (err) {
            res.status(400);
            throw new Error(err);
        }
    })

    static updateTask = asyncHandler(async (req, res) => {

        try {

            const id = req.params.id;
            const task = await Task.findOne({
                _id: id,
                user_id: req.user._id,
                isDeleted: false
            });

            if (!task) {
                res.status(404).json(this.generateResponse({
                    message: 'Task not found.'
                }, 404));
                return;
            }

            const { title, desc, category_id, due_date, subtask, priority } = req.body;

            let action = req.body.action ? req.body.action.toLowerCase() : '';

            if (action == 'mark-task') {

                const mark_task = await Task.updateOne({ _id: id }, { isCompleted: true });
                if (!mark_task) {
                    res.status(500).json(this.generateResponse({
                        message: 'Task completion action failed. Try again later.'
                    }, 500));
                    return;
                }

                res.status(200).json(this.generateResponse({
                    message: 'Task completed.'
                }, 200));

            }
            else if (action == 'mark-subtask') {

                if (!subtask || subtask.length <= 0) {
                    res.status(403).json(this.generateResponse({
                        message: 'Please enter subtask.'
                    }, 403));
                    return;
                }

                const mark_subtask = await Task.updateOne({ _id: id }, { subtask: subtask });
                if (!mark_subtask) {
                    res.status(500).json(this.generateResponse({
                        message: 'Sub-task completion action failed. Try again later.'
                    }, 500));
                    return;
                }

                res.status(200).json(this.generateResponse({
                    message: 'Sub-Task completed.'
                }, 200));
            }
            else {

                if (!title || !desc || !category_id || !due_date) {
                    res.status(403).json(this.generateResponse({
                        message: 'Please enter all required fields.'
                    }, 403));
                    return;
                }

                const isCategory = await Category.findOne({
                    _id: category_id,
                    user_id: req.user._id,
                    isDeleted: false
                });

                if (!isCategory) {
                    res.status(404).json(this.generateResponse({
                        message: 'Category not found.'
                    }, 404));
                    return;
                }

                if (subtask.length > 0) {
                    for (const item of subtask) {
                        let { name } = item
                        if (!name) {
                            res.status(403).json(this.generateResponse({
                                message: 'Invalid object. Enter subtask name.'
                            }, 403));
                            return;
                        }
                    }
                }

                const updateTask = await Task.updateOne(
                    { _id: id },
                    {
                        title: title,
                        desc: desc,
                        category_id: category_id,
                        subtask: subtask,
                        priority: priority
                    }
                );
                if (!updateTask) {
                    res.status(500).json(this.generateResponse({
                        message: 'Task updation failed.'
                    }, 500));
                    return;
                }

                res.status(200).json(this.generateResponse({
                    message: 'Task updated successfully.'
                }))
            }

        } catch (err) {
            res.status(400);
            throw new Error(err);
        }
    })

    static unsetTask = asyncHandler(async (req, res) => {

        try {

            const id = req.params.id;
            const task = await Task.findOne({
                _id: id,
                user_id: req.user._id,
                isDeleted: false
            });

            if (!task) {
                res.status(404).json(this.generateResponse({
                    message: 'Task not found.'
                }, 404));
                return;
            }

            const deleteTask = await Task.updateOne({ _id: id }, { isDeleted: true }
            );
            if (!deleteTask) {
                res.status(500).json(this.generateResponse({
                    message: 'Task deletion failed.'
                }, 500));
                return;
            }

            res.status(200).json(this.generateResponse({
                message: 'Task deleted successfully.'
            }))


        } catch (err) {
            res.status(400);
            throw new Error(err);
        }
    })

    static getTaskList = asyncHandler(async (req, res) => {

        try {

            req.query.limit = Number(req.query.limit);
            req.query.page = Number(req.query.page);

            let category_id = req.query.cid ? req.query.cid : 0;
            let sort = req.query.sort ? req.query.sort : 'new';
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
                            { $eq: ["$isDeleted", false] },
                            ]
                        }
                    }
                },
                {
                    $match: {
                        $expr: {
                            $cond: {
                                if: { $eq: [category_id, 0] },
                                then: true,
                                else: { $eq: ['$category_id', new ObjectId(category_id)] }
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'tbl_categories',
                        localField: 'category_id',
                        foreignField: '_id',
                        as: 'category',
                    }
                },
                {
                    "$addFields": {
                        "category": {
                            "$arrayElemAt": ["$category", 0]
                        }
                    }
                },
                { $sort: { createdAt: sort == 'old' ? 1 : -1 } },
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
                                        },
                                    ]
                                },
                                { $eq: ["$user_id", req.user._id] },
                                { $eq: ["$isDeleted", false] },
                                ]
                            }
                        }
                    },
                    {
                        $match: {
                            $expr: {
                                $cond: {
                                    if: { $eq: [category_id, 0] },
                                    then: true,
                                    else: { $eq: ['$category_id', new ObjectId(category_id)] }
                                }
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

export default TaskController;