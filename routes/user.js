var express = require('express');
var router=  express.Router();
var USER = require('../model/user');
var bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");
var jwt = require('jsonwebtoken');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: process.env.UserId,
    pass: process.env.UserPassword,
  },
});

async function main(user) {
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: process.env.UserId, // sender address
      to: user, // list of receivers
      subject: "Hello ✔", // Subject line
    //   text: "Hello world?", // plain text body
      html: "<b>Welcome To Site</b>", // html body
    });
  
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  
    //
    // NOTE: You can go to https://forwardemail.net/my-account/emails to see your email delivery status and preview
    //       Or you can use the "preview-email" npm package to preview emails locally in browsers and iOS Simulator
    //       <https://github.com/forwardemail/preview-email>
    //
  }

const CheckToken = async function(req, res, next) {
    try {
        // console.log(req.body);
        const token = req.headers.authorization
        if(!token){
            throw new Error ("token is invalid")
        }
        const decode = jwt.verify(token,process.env.JwtSign );
        const checkUser = await USER.findById(decode.id)
    if(!checkUser){
      throw new Error("user not found")
    }
    next()
    } catch (error) {
        res.status(404).json({
            status : "fail",
            message : error.message
        })
        
    }
};



//signup
router.post('/signup', async function(req, res, next) {
    try {
        // console.log(req.body);
        if(!req.body.username || !req.body.email ||!req.body.password){
            throw new Error("Please add valid field")
        }
        req.body.password = await bcrypt.hash(req.body.password,10)
        const data = await USER.create(req.body)
        await main(req.body.email)
        var token = jwt.sign({ id: data._id }, process.env.JwtSign);
        res.status(201).json({
            status : "Success",
            message : "New User Created",
            data : data,
            token
        })
    } catch (error) {
        res.status(404).json({
            status : "fail",
            message : error.message
        })
        
    }
});

//Logim
router.post('/login',CheckToken, async function(req, res, next) {
    try {
        const checkUser = await USER.findOne({email : req.body.email})
        if(!checkUser){
            throw new Error("Invalid Email")
        }
        const checkPass = await bcrypt.compare(req.body.password,checkUser.password)
        if(!checkPass){
            throw new Error("Invalid Passsword")
        }
        res.status(200).json({
            status : "Success",
            message : "Login Successful",
        })
    } catch (error) {
        res.status(404).json({
            status : "fail",
            message : error.message
        })
        
    }
});


//Alluser
router.get('/all', async function(req, res, next) {
    try {
        const data = await USER.find()
        res.status(201).json({
            status : "Success",
            message : "New User Created",
            data : data
        })
    } catch (error) {
        res.status(404).json({
            status : "fail",
            message : error.message
        })
        
    }
});

router.delete('/delete', async function(req, res, next) {
    try {
      await USER.findByIdAndDelete(req.query.id)
      res.status(200).json({
        status: "Suceess",
        message: "user deleted",
      })
    } catch (error) {
      res.status(404).json({
        status: "Fail",
        message: error.message
      })
    }
  });

  router.patch('/update', async function(req, res, next) {
    try {
        await USER.findByIdAndUpdate(req.query.id, req.body)
        res.status(200).json({
          status: "Suceess",
          message: "user updated",
        })
      } catch (error) {
        res.status(404).json({
          status: "Fail",
          message: error.message
        })
      }
    });




module.exports = router;