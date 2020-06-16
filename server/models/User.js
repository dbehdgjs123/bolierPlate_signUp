const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10; //암호화할 비밀번호 수
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true, //트림은 띄어쓰기를 없애주는 역할 ex) dbedhgjs 123@naver.com
    unique: 1, //똑같은 이메일은 못쓰게
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    //관리자나 일반유저 구분
    type: Number,
    default: 0, //0이면 일반 유저
  },
  image: String,
  token: {
    //유효기간
    type: String,
  },
});

userSchema.pre("save", function (next) {
  //비밀번호를 암호화 시킨다. bcyrpt save되기 직전에 실행됨
  var user = this; //위에 pssword를 가져와야함 (본인 피셜: this는 user.save의 user를 뜻한다. 즉, user를 뜻한다는 말은 user모델을 가져오는 것과 같음 화살표함수를 쓰면 this가 이 상위의 무언가를 가르키기때문에 쓰지않음)

  if (user.isModified("password")) {
    //isModified 함수는 해당값이 db에 기록된 값과 비교하여 변경된 경우 true를 반환 user생성시에는 항상 true 그외엔password를 변경하는 경우만 트루
    bcrypt.genSalt(saltRounds, function (err, salt) {
      //salt를 만듬 라운드 필요 (여기선 10자리)
      if (err) return next(err); //에러가 나면 next에 err를 넣어서 실행
      bcrypt.hash(user.password, salt, function (err, hash) {
        //hash란 암호화된 비밀번호
        if (err) return next(err);
        user.password = hash;
        next(); //save를 가르킴
      });
    });
  } else {
    next();
  }
});
userSchema.methods.comparePassword = function (plainPassword, cb) {
  //plainPassword 그냥 패스워드 ex)  12312321암호화된 패스워드 "sdsadadf124fekj144124"
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function (cb) {
  var user = this;
  //jsonwebtoken을 사용하여 토큰 생성
  var token = jwt.sign(user._id.toHexString(), "secretToken"); //아이디 + 토큰이름
  user.token = token;
  user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};

userSchema.statics.findByToken = function (token, cb) {
  var user = this;

  jwt.verify(token, "secretToken", function (err, decoded) {
    //유저 아이디를 이용해서 유저를 찾은 다음에
    //클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인

    user.findOne({ _id: decoded, token: token }, function (err, user) {
      if (err) return cb(err);
      cb(null, user);
    });
  });
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
