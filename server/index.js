//백엔드의 시작점
const express = require("express");
const app = express();
const port = 5000;

const { User } = require("./models/User");
const { auth } = require("./middleware/auth");
const bodyParser = require("body-parser"); //바디파서 덕분에 req.body에 데이터가 들어감
const cookieParser = require("cookie-parser");

const config = require("./config/key");

app.use(express.json()); //json타입을 분석하여 가져올수 있게함
app.use(cookieParser());

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
app.get("/api/hello", (req, res) => res.send("Hellodada"));

app.post("/api/users/register", (req, res) => {
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

app.post("/api/users/login", (req, res) => {
  //요청된 이메일을 데이터베이스에서 있는지 찾는다.
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "이메일에 해당하는 유저가 없습니다.",
      });
    }
    //요청된 이메일이 있다면 비밀번호가 맞는지 확인.
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다.",
        });
      //비밀번호가 맞으면 토큰을 생성한다.
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);
        //토큰을 저장한다. 예를들면 쿠키, 로콜스토리지 등등
        res
          .cookie("x_auth", user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id });
      });
    });
  });
});
app.get("/api/users/auth", auth, (req, res) => {
  //여기 까지 미들웨어를 통과했다는 것은 authentication 이 true라는말이다.
  res.status(200).json({
    _id: req._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});
app.get("/api/users/logout", auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if (err)
      return res.json({
        success: false,
        err,
      });
    return res.status(200).send({
      success: true,
    });
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}`));
