const express = require('express');
const router=express.Router();
const {registerAdmin,loginAdmin}=require("../controllers/adminAuthController");
const { render } = require('ejs');
const upload =require("../configs/multer-setup")
const productModel=require("../models/product-model");
const { isloggedin } = require('../middlewares/isloggedin');
const {adminLogin}=require("../middlewares/isAdminlogin")
const {isAdmin}=require("../middlewares/isAdmin")
router.get("/login", function(req, res){
    res.render("admin-login")
})


router.get("/register",registerAdmin)

router.post("/login",loginAdmin)


router.get("/dashboard",isAdmin,adminLogin,function(req, res){
    res.render("product-admin")
})

router.get("/addproduct",isloggedin,function(req, res){
    res.render("admin_addProduct")
})

router.post("/addproduct",upload.single("image"),async function(req, res){
    let {name, description, price} = req.body;
    const newProduct = new productModel({
      name,
      description,
      price,
      image:req.file.filename,
    }
    )
    await newProduct.save();
    res.send("Product added successfully")

})

module.exports = router