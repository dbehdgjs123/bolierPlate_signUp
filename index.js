//백엔드의 시작점
const express = require("express");
const app = express();
const port = 5000;

const mongoose = require("mongoose");
mongoose
  .connect(
    "mongodb+srv://ctp:dngudtnr12@boilerplate-vy5i8.mongodb.net/<dbname>?retryWrites=true&w=majority",
    {
      useNewUrlParser: true, //안해주면 오류남
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }
  )
  .then(() => console.log("success Connect!"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => res.send("Hello 안녕!!"));

app.listen(port, () => console.log(`Example app listening on port ${port}`));
