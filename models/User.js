const mongoose = require("mongoose");

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
    type: Number,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = { User };
