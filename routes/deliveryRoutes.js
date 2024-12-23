const express = require('express');
const router=express.Router();
const deliveryboysModel=require("../models/deliveryboydata-model")
const {genrateTokenDelivery}=require("../utils/genrateTokenDelivery")
const { isDeliverylogin } = require('../middlewares/isDeliverylogin');
const {checkDelivery}=require("../middlewares/checkDelivery");
const ordersModel = require('../models/orders-model');

// Define the routes

router.get('/login', function(req, res) {
    
    res.render("delivery-loginpage")
});

router.post('/login', async function(req, res) {
    try {
        let { username, password } = req.body;
        const deliveryboy = await deliveryboysModel.findOne({ username: username });
    
        
        if (!deliveryboy) {
          req.flash("error", "Email or password incorrect");
          return res.redirect("/delivery/login"); 
        }
    
      
        
        if (password!==deliveryboy.password) {
          req.flash("error", "Email or password incorrect");
          return res.redirect("/delivery/login"); 
        }
    
        
        const tokken = genrateTokenDelivery(deliveryboy);
        res.cookie("tokken", tokken);
    
        
        return res.redirect("/delivery/dashboard");
      } catch (err) {
        console.error(err.message);
        // Optionally handle error response here
        res.status(500).send("Internal Server Error");
      }   

});


router.get("/dashboard",isDeliverylogin,checkDelivery ,async function(req, res) {
    const googlemapapi=process.env.API_KEY
    const user=req.user
    const neworder=await ordersModel.find({status:"Confirmed"}).populate("Products.product").populate("User")
    
    const activeOrder = await ordersModel.find({
      status:"Processing"}).populate("Products.product").populate("User");
   
    const orderhistory = await ordersModel.find({status:"Delivered"}).populate("Products.product").populate("User")
    res.render("order-detailspage",{googlemapapi,user,neworder,activeOrder,orderhistory}) 
})

router.post('/updateOrderStatus', (req, res) => {
  const { status, orderid } = req.body;
  
  // Update the order status in your database
  ordersModel.updateOne({ orderid: orderid }, { status: status })
    .then(() => res.redirect('/delivery/dashboard#new-link-content')) // Redirect or respond as needed
    .catch(err => res.status(500).send(err));
});


  router.get("/accept/:id", isDeliverylogin, checkDelivery, async function(req, res) {
    const { id } = req.params;
  
    try {
          const updatedOrder = await ordersModel.findByIdAndUpdate(
        id, 
        { status: "Processing", DeliveryBoy: req.user._id }, 
        { new: true }
      );
   
    
      await deliveryboysModel.findByIdAndUpdate(
        req.user._id,
        { $push: { orders: updatedOrder._id } },
        { new: true }
      );
    
   
      res.redirect("/delivery/dashboard");
  
    } catch (err) {
      
      res.status(500).send(err);
    }
  });

router.get("/logout",(req, res)=>{
    res.clearCookie("tokken");
    res.redirect("/delivery/login")
})


module.exports = router;