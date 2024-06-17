const Schema = require("mongoose").Schema;
const mongooseFuzzySearching = require("mongoose-fuzzy-searching");

const UserSchema = new Schema({
  name: {
    type: String,
    default: null,
    required:true
  },
  email: {
    type: String,
    default: null,
    required: true,
    unique: true,
  },
  phoneNo: {
    type: String,
    unique:true,
  },
  password: {
    type: String,
    required:true
  },
});

UserSchema.plugin(mongooseFuzzySearching, { fields: ["name"] });

module.exports = User = require("mongoose").model("User", UserSchema);