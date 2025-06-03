import mongoose from "mongoose";


const noteSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Note title is required.']
    },
    desc: {
        type: String
    },
    color: {
        type: String
    },
    text_color: {
        type: String,
        default: '#000'
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

const Note = mongoose.model('tbl_note', noteSchema)
export default Note