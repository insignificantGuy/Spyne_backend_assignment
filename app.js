const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv/config");
var server = require("http").createServer(app);
const port = process.env.PORT || 5000;

app.use(cors());

app.get('/', function(req, res){
    return res.status(200).json("Hello World");
});

app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log("mongoDB connected."))
  .catch((err) => console.log(err));

const loginRoutes = require("./routes/loginRoute");
const userRoutes = require("./routes/userRoute");
const postRoutes = require("./routes/postRoute");

app.use("/api/",loginRoutes);
app.use("/api/user",userRoutes);
app.use("/api/post",postRoutes);

server.listen(port, () => console.log(`Listening to port ${port}`));