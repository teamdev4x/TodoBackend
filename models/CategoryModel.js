import mongoose from "mongoose";


const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required.']
    },
    color: {
        type: String
    },
    text_color: {
        type: String,
        default: '#000'
    },
    tasks: {
        type: Number,
        default: 0
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tbl_user",
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

const Category = mongoose.model('tbl_category', categorySchema)
export default Category