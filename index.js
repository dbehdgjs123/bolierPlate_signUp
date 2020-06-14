//백엔드의 시작점
const express = require("express");
const app = express();
const port = 5000;

const { User } = require("./models/User");
const bodyParser = require("body-parser"); //바디파서 덕분에 req.body에 데이터가 들어감

const config = require("./config/key");

app.use(express.json()); //json타입을 분석하여 가져올수 있게함

const mongoose = require("mongoose");
mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true, //안해주면 오류남
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("success Connect!"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => res.send("Hello"));

app.post("/register", (req, res) => {
  //회원가입 할때 필요한 정보들을 클라이언트에서 가져온다.
  //그리고 그것들을 데이터베이스에 넣어준다.
  const user = new User(req.body); //id나 pssword 같은것들이 req.body에 들어있음

  user.save((err, userInfo) => {
    //save는 몽고디비의 메서드
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}`));
