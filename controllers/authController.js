const userModel=require('../models/user-model')
const bcrypt = require('bcrypt');
const {genrateToken }=require("../utils/generateToken")

module.exports.registerUser =  async function(req,res){
   try{ let { name , email, password} = req.body;
    const user = await userModel.findOne({email:email})
    if(!user){
        bcrypt.genSalt(password, async function (err, salt) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new userModel({
              name,
              email,
              password: hashedPassword,
            }
        )
        console.log(newUser);
        await newUser.save();
        const tokken = genrateToken(user);
        res.cookie("tokken", tokken);
        res.redirect("/")
    })
    }
    else{
        res.status(400).send('User already exists')
        res.redirect("/login")
    }
}
catch(e){ 
    console.log(e)}

}
module.exports.loginUser = async function (req, res) {
  try{  
    let { email, password } = req.body;
    const user = await userModel.findOne({ email: email });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const tokken = genrateToken(user);
    res.cookie("tokken", tokken);
    // console.log(tokken);
    res.redirect("/")
}
catch(e){ 
    console.log(e.message)}
  };
