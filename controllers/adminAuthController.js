const adminModel=require("../models/admin-model")
const bcrypt = require('bcrypt');
const {genrateToken }=require("../utils/generateToken");


module.exports.registerAdmin =  async function(req,res){
    try{ let { name , email, password} = req.body;
    const admin = await adminModel.findOne({email:email})
    if(!admin){
        bcrypt.genSalt(password, async function (err, salt) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newAdmin = new adminModel({
              name,
              email,
              password: hashedPassword,
            }
        )
        await newAdmin.save();
        const tokken = genrateToken(newAdmin);
        res.cookie("tokken", tokken);
        res.redirect("/admin/login")
    })
    }
    else{
        req.flash("error", "Email already registered")
        res.redirect("/admin/register")
    }
}catch(err){ console.log(err) }
}

module.exports.loginAdmin = async function (req, res) {
    try{  
        let { email, password } = req.body;
        const admin = await adminModel.findOne({ email: email });

        if (!admin) {
          req.flash("error","Email or password incorrect")
          res.redirect("/admin/login")
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
          req.flash("error","Email or password incorrect")
          res.redirect("/admin/login")
        }

        const tokken = genrateToken(admin);
        res.cookie("tokken", tokken);
        res.send("heyy admin")
}catch(err){
    console.log(err.message)}
  };