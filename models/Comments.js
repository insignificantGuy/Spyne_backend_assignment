const Schema = require("mongoose").Schema;

const commentSchema = new Schema({
    userID:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    text:{
        type:String,
        default:"",
    },
    postID:{
        type:Schema.Types.ObjectId,
        ref:"Post",
        required: true
    },
    likes: {
        type: Number,
        default: 0
    },
    isLikedBy: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    replies: [{
        userID: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        text: String,
        createdOn: {
            type: Date,
            default: Date.now
        }
    }],
    createdOn: {
        type: Date,
        default: Date.now
    }
});

module.exports = Comment = require("mongoose").model("Comments", commentSchema);