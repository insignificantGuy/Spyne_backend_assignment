const Schema = require("mongoose").Schema;

const followerSchema = new Schema({
    followerID:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    followed:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required: true
    }
});

module.exports = Follower = require("mongoose").model("Followers", followerSchema);