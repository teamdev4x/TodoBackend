import mongoose from "mongoose";

const subtaskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Subtask name is required.']
    },
    completed: {
        type: Boolean,
        default: false
    }
});

const taskSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Note title is required.']
    },
    desc: {
        type: String
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tbl_user",
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tbl_category"
    },
    due_date:{
        type: String
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high'],
        default: 'normal'
    },
    subtask: [subtaskSchema],
    isCompleted: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

const Task = mongoose.model('tbl_task', taskSchema)
export default Task