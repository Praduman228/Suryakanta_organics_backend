const express = require('express');
const router=express.Router();
const {registerAdmin,loginAdmin}=require("../controllers/adminAuthController");
const { render } = require('ejs');
const upload =require("../configs/multer-setup")
const productModel=require("../models/product-model");
const deliveryboyModel=require("../models/deliveryboydata-model")
const { isloggedin } = require('../middlewares/isloggedin');
const {adminLogin}=require("../middlewares/isAdminlogin")
const {isAdmin}=require("../middlewares/isAdmin")
const nodemailer = require("nodemailer")
const orderModel=require("../models/orders-model")
router.get("/login", function(req, res){
    res.render("admin-login")
})


router.get("/register",registerAdmin)

router.post("/login",loginAdmin)

router.get("/logout",(req, res)=>{
    res.clearCookie("tokken");
    res.redirect("/admin/login")
})
router.get("/dashboard",isAdmin,adminLogin,async function(req, res){
    const products=await productModel.find()
    const deliveryBoys=await deliveryboyModel.find()
    const orders=await orderModel.find().populate("Products.product").populate("User").populate("DeliveryBoy")
    res.render("product-admin",{products,deliveryBoys,orders})
})

router.get("/addproduct",isloggedin,function(req, res){
    res.render("admin_addProduct")
})

router.post("/addproduct",upload.single("file"),async function(req, res){
    let {productname, description, price ,category,expiredate,instock} = req.body;
    const newProduct = new productModel({
      name:productname,
      description,
      price,
      image:{
        file:req.file.buffer,
        imageType:req.file.mimetype,
      },
      category,
      expirydate:new Date(expiredate),
      instock,
      
    }
    )
  
    await newProduct.save();
   res.redirect("/admin/dashboard")

})
router.post("/updateproduct",upload.single("productimage"),async function(req, res){
  let { productid, productname, productdescription, productcategory, productexpiredate, productinstock } = req.body;

  if(req.file){
    const updatedProduct = await productModel.findByIdAndUpdate(productid, {
      name: productname,
      description: productdescription,
  
      image:{
        file:req.file.buffer,
        imageType:req.file.mimetype,
      },
      category:productcategory,
      expirydate: new Date(productexpiredate),
      productinstock,
    }, { new: true });
  }else{
    const updatedProduct = await productModel.findByIdAndUpdate(productid, {
      name: productname,
      description:productdescription,
      category:productcategory,
      expirydate: new Date(productexpiredate),
      instock:productinstock,
    }, { new: true });
  }
  
    res.redirect("/admin/dashboard")
})

router.delete("/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
  
      const deletedProduct = await productModel.findByIdAndDelete(id);
      if (!deletedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      res.status(200).json({ message: "Product deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.get("/getproduct/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const product = await productModel.findById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    }catch(e){
      console.error(e);
      res.status(500).json({ message: "Internal Server Error" });
    }
  })



  router.post(
    "/create-deliveryboy",
    upload.single("profile"),
    async function (req, res) {
      try {
   
        const { name, phone, email, joindate, username, password } = req.body;
  
     
        if (!name || !phone || !email || !joindate ||  !username || !password) {
          return res.status(400).send("All fields are required.");
        }
           
        if (!req.file) {
          return res.status(400).send("profile image uploads are required.");
        }
  
        
       
        const newDeliveryboy = new deliveryboyModel({
          name,
          mobile:phone,
          email,
          username,
          password,
          joiningDate: joindate,
          profileimage: {
            file:req.file.buffer,
            filetype: req.file.mimetype,
          },
        });

        // Save to database
        await newDeliveryboy.save();
  
        // Sending email
        let transporter = nodemailer.createTransport({
          host: "smtpout.secureserver.net",
          port: 587,
          secure: false,
          auth: {
            user: "support@vegiefy.com",
            pass: process.env.MAIL_PASS,
          },
        });
  
        let mailOptions = {
          from: "support@vegiefy.com",
          to: req.body.email,
          subject: "Welcome to Vegiefy Organics Farming - Your Account Details",
          text: `Dear ${req.body.name},
  
  Welcome to the Vegiefy Organics Farming team! We are thrilled to have you onboard as our new delivery boy.
  
  Below are your login credentials to access our system:
  
  Username: ${newDeliveryboy.username}
  Password: ${newDeliveryboy.password}
  
  Please log in and change your password upon first use to ensure account security. If you encounter any issues or have questions, feel free to reach out to support@vegiefy.com.
  
  We’re looking forward to a great journey together!
  
  Best regards,
  Vegiefy Organics Farming`,
        };
  
        try {
          await transporter.sendMail(mailOptions);
        } catch (mailError) {
          console.error("Error sending email:", mailError);
          return res.status(500).send("Delivery boy created, but email could not be sent.");
        }
  
        // Redirect to dashboard if everything succeeds
        res.redirect("/admin/dashboard");
      } catch (error) {
        console.error("Error creating delivery boy:", error);
  
        if (error.name === "ValidationError") {
          return res.status(400).send("Invalid data: " + error.message);
        }
  
        res.status(500).send(
          "An error occurred while creating the delivery boy. Please try again later."
        );
      }
    }
  );

  router.get('/delete-deliveryboy/:id', async function (req, res) {
    try {
      const { id } = req.params;
      const deletedDeliveryboy = await deliveryboyModel.findByIdAndDelete(id);
      if (!deletedDeliveryboy) {
        return res.status(404).json({ message: "Delivery boy not found" });
      }
      res.redirect("/admin/dashboard")
    
    }catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  })
module.exports = router