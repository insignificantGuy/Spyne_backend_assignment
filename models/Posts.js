const Schema = require("mongoose").Schema;
const mongooseFuzzySearching = require("mongoose-fuzzy-searching");

const postSchema = new Schema({
    userID:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    textField:{
        type:String,
        default:"",
    },
    imageSrc:{
        type:String,
        default:"",
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    viewCount:{
        type:Number,
        default:0,
    },
    createdOn:{
        type:Date,
        default:Date.now,
    },
});

postSchema.plugin(mongooseFuzzySearching, { fields: ["textField"] });

module.exports = Post = require("mongoose").model("Posts", postSchema);