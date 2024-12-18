const mongoose = require('mongoose')

const productSchema=mongoose.Schema({
name:String,
price:Number,
description:String,
image:{
    file:Buffer,
    imageType:String,
},
instock:Number,
category:String,
expirydate:Date,
isActive:Boolean,
})

module.exports=mongoose.model("Products",productSchema)