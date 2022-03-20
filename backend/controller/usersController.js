import user from "../model/users.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
dotenv.config();

export const registerUser = async (req, res) => {
  try {

    //get value from frontend 
    const { firstName, lastName, email, password } = req.body;

    //create an unique id
    const id = crypto.randomBytes(16).toString("hex");

    //want to check if user exist
    const [checkExistingEmail] = await user.checkEmail(email);

    //if user already thrown an error
    if (checkExistingEmail.length > 0) {
      //console.log('email already exist');
      return res.status(400).json({
        message: "email already exist",
      });
    }

    //hash user password
    const hashPassword = bcrypt.hashSync(password);

    //create user
    await user.register(id, firstName, email, hashPassword);

    //response successful create user 🎉
    res.status(200).json({
      message: "successful create!",
    });


  } catch (error) {
    console.log(error)
  }

};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [checkExistingEmail] = await user.checkEmail(email);


    if (!checkExistingEmail) {
      return res.status(400).json({
        message: "Incorrect Email or Password"
      })
    }

    //User info
    const userInfo = checkExistingEmail[0]
    const isValid = bcrypt.compareSync(password, userInfo.password)

    console.log(isValid)
    if(!isValid){
      return res.status(400).json({
        message: "Incorrect Email or Password"
      })
    }

    const accessToken = jwt.sign(
      { id: userInfo.id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "20s",
      }
    );
    console.log(accessToken);
    
    const refreshToken = jwt.sign(
      { id: userInfo.id },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );

    await user.updateRefreshToken(userInfo.id, refreshToken)
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
      })
    res.status(200).json({ accessToken });

  } catch (error) {
    console.log(error)
    res.status(404).json({ msg: "Email Not Found" });
  }
};


export const Logout = async(req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken) return res.sendStatus(204);
    const user = await user.findRefreshToken(refreshToken)


    if (!user[0]) return res.sendStatus(204); 
      const userId = user[0].id;
      await user.updateRefreshToken(userId);
        
    }
