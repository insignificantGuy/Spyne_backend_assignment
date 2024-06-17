const Schema = require("mongoose").Schema;

const hashtagSchema = new Schema({
    text:{
        type:String,
        default:"",
    },
    postID:{
        type:Schema.Types.ObjectId,
        ref:"Post",
        required:true
    }
});

module.exports = Hashtag = require("mongoose").model("Hashtags", hashtagSchema);