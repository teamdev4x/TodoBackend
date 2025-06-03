import mongoose from "mongoose";


const userSchema = mongoose.Schema({
    first_name: {
        type: String,
        required: [true, 'First name is required.']
    },
    last_name: {
        type: String,
        required: [true, 'Last name is required.']
    },
    email: {
        type: String,
        required: [true, 'Email is required.']
    },
    password: {
        type: String,
        required: [true, 'Password is required.']
    },
    meta: {
        
    },
    picture: {
        type: String,
        default: ""
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

const User = mongoose.model('tbl_user', userSchema)
export default User