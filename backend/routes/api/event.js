const env = process.env
var express = require('express');
const mongoose = require("mongoose");

const User = require("../../models/User");
const Admin = require("../../models/Admin");
const Event = require("../../models/Event");


var router = express.Router();
/*
router.post("/getParticipants",async (req,res) =>{
  var {id=null,userId=null} = req.body;
  var out = {status:400};
  if(id == null){
    out.description = "Invalid id";
    res.json(out);
    return;
  }else 
});*/
router.post("/register",async (req,res) => {
  var {id = null, userId=null} = req.body;
  var out = {status:400};
  if(id == null) out.description = "ID not provided";
  else if(userId == null) out.description = "UserID not provided";
  else out.status = 200;
  if(out.status != 200) {
    res.json(out);
    return;
  }
  try {
    var user = await User.find({userId:userId});
    if(user == null) {
      out.status = 400;
      out.description = "User error";
    }else if(user.length != 1) {
      out.status = 400;
      out.description = "User error";
    }else {
      var event = await Event.find({id:id});
      if(user == null) {
        out.status = 400;
        out.description = "Event not found error";
      }else if(user.length != 1) {
        out.status = 400;
        out.description = "Event not found error";
      }else {
        user = user[0];
        event = event[0];
        if(event.participants.includes(user._id) && user.participate.includes(event._id)) {
          out.status = 400;
          out.description = "Already registered";
        }else {
          event.participants.push(mongoose.Types.ObjectId(user._id));
          await event.save();
          user.participate.push(mongoose.Types.ObjectId(event._id));
          await user.save();
          out.status = 200;
          out.description = "Successfuly registered";
          out.content = {
            userId:user.userId,
            eventId:event.id,
            participate:user.participate
          }
        }
      }
    }
    res.json(out);
  }catch(e) {
    out.status = 500;
    out.description = "Error while fetching";
    out.error = e;
    res.json(out);
    return;
  }
});
router.post("/delete",async (req,res) =>{
  var {id = null,token=null} = req.body;
  var out = {}
  var admin = false;
  if(id == null){
    out.status = 400;
    out.description = "Id not given";
    res.json(out);
    return;
  }
  if(token != null) {
    var p = await Admin.find({token:token});
    if(p == null){
      out.status = 400;
      out.description = "Invalid token"
    }else if(p.length != 1){
      out.status = 400;
      out.description = "Invalid token"
    } else {
      p = p[0];
      var date = new Date();
      if(date.getFullYear() >= p.expiry.getFullYear() && date.getMonth() >= p.expiry.getDate() && date.getDate() >= p.expiry.getDate() && date.getHours() >= p.expiry.getHours() && date.getMinutes() >= p.expiry.getMinutes()) {
        out.status = 400;
        out.description = "Expired token";
      }else admin = true;
    }
    if(!admin) {
      res.json(out);
      return;
    }
  }else {
    out.status = 400;
    out.description = "Token not given";
    res.json(out);
    return;
  }
  try {
    await Event.deleteOne({id:id}).then((err)=>{
      try {
        if(err.deletedCount< 1) {
          console.log(err)
          out.status = 400;
          out.description = "Unable to delete ";
        }else {
          out.status = 200;
          out.description = "Deleted Successfuly";
          out.content = p;
        }
      }catch(err){
        out.status = 500;
        out.description = "Error deleting -";
        out.error = err;
      }
    });
    res.json(out);
    return;
  }catch(e){
    out.status = 500;
    out.description = "Error fetching data";
    out.error = e;
    console.log("Error fetchjng data")
    console.log(e);
    res.json(out);
    return;
  }
});
router.get("/get",async (req,res)=>{
  var {id = null} = req.query;
  var out = {}
 // var admin = false;
  if(id == null){
    out.status = 400;
    out.description = "Id not given";
    res.json(out);
    return;
  }/*
  if(token != null) {
    var p = await Admin.find({token:token});
    if(p == null){
      out.status = 400;
      out.description = "Invalid token"
    }else if(p.length != 1){
      out.status = 400;
      out.description = "Invalid token"
    } else {
      p = p[0];
      var date = new Date();
      if(date.getFullYear() >= p.expiry.getFullYear() && date.getMonth() >= p.expiry.getDate() && date.getDate() >= p.expiry.getDate() && date.getHours() >= p.expiry.getHours() && date.getMinutes() >= p.expiry.getMinutes()) {
        out.status = 400;
        out.description = "Expired token";
      }else admin = true;
    }
    if(!admin) {
      res.json(out);
      return;
    }
  }*/
  try{
    var p = await Event.find({id:id}).populate("participants");
    if(p == null || p.length != 1) {
      out.status = 400;
      out.description = "Event not found";
      res.json(out)
      return;
    }
    out.status = 200;
    out.description = "Success";
    out.content = {
      ...p[0]._doc
    }
    res.json(out);
    return;
  }catch(e){
    out.status = 500;
    out.description = "Error while fetching data";
    res.json(out);
    return;
  }
})
router.get("/getAll",async (req,res) =>{
  console.log(req.query)
  var {token=null,count=-1} = req.query;
  var out = {status:200};
  try{
    var admin = false;
    if(token != null) {
      console.log("Admin Check ");
      var p = await Admin.find({token:token});
      if(p == null){
        out.status = 400;
        out.description = "Invalid token"
      }else if(p.length != 1){
        out.status = 400;
        out.description = "Invalid token"
      } else {
        p = p[0];
        var date = new Date();
        if(date.getFullYear() >= p.expiry.getFullYear() && date.getMonth() >= p.expiry.getDate() && date.getDate() >= p.expiry.getDate() && date.getHours() >= p.expiry.getHours() && date.getMinutes() >= p.expiry.getMinutes()) {
          out.status = 400;
          out.description = "Expired token";
        }else admin = true;
      }
      if(!admin) {
        console.log("❌");
        res.json(out);
        return;
      }else console.log("✔️")
    }
    if(count == -1) var p = await Event.find().populate("participants").sort({date:1});//.then(p =>{
    else var p = await Event.find().populate("participants").sort({date:1}).limit(count);//.then(p =>{
    if(p == null) {
      out.status = 400;
      out.description = "no events";
      res.json(out);
      return;
    }
    var data = [];
    for(var i = 0;i < p.length;i++){
      var cur = p[i];
      var participants = [];
      if(!admin) {
        for(var j = 0;j < cur.participants.length;j++){
          participants.push({userId:cur.participants[j].userId});
        }
      }else participants = cur.participants;
     // console.log(participants)
      data.push({
        id:cur.id,
        name:cur.name,
        description:cur.description,
        date:cur.date,
        type:cur.type,
        image:cur.image,
        docs:cur.docs,
        minPart:cur.minpart,
        maxPart:cur.maxpart,
        poster:cur.poster,
        is_team:cur.is_team,
        participants:participants,
        teams:admin ? cur.teams : null
      });
    }
    out.status = 200;
    out.description = "Successfuly fetched";
    out.content = data;
   // res.json(out);
 //  return;
//  });
    //console.log(out);
  res.json(out);
  return;
  }catch(e){
    out.status = 500;
    out.description = "Error while fetching";
    out.error = e;
  }
})
router.post("/edit",async (req,res) => {
  var {id=null,name=null, description=null,date=null,type=null,image=null,maxPart=1,minPart=1,poster=null,docs=null} = req.body;
  var out = {status:400}
  if(id == null) out.description = "ID Not given";
  else {
    out.status = 200;
  }
  if(out.status != 200){
    res.json(out);
    return;
  }
  try{
    var ev = await Event.find({id:id});
    console.log(ev);
    if(ev == null) {
      out.status = 400;
      out.description = "No event with the id";
    }else if(ev.length != 1) {
      out.status = 400;
      out.description = "No event with the id";
    }else {
      ev = ev[0];
      if(name != null) ev.name = name;
      if(description != null) ev.description = description;
      if(date != null) ev.date = date;
      if(type != null) ev.type = type;
      if(image != null) ev.image = image;
      if(maxPart != null) ev.maxpart = maxPart;
      if(minPart != null) ev.minpart = minPart;
      if(poster != null) ev.poster = poster;
      if(docs != null) ev.docs = docs;
      await ev.save();
      out.status = 200;
      out.description = "Event saved ("+name+")";
      out.content = ev;
    }
    res.json(out);
    return;
  }catch(e){
    out.status = 500;
    out.description = "Error when saving data";
    out.error = e;
    res.json(out);
    return;
  }
});
router.post("/create",async (req,res) => {
  var {name=null, description=null,date=null,type=null,image=null,maxPart=1,minPart=1,poster=null,docs=null} = req.body;
  var out = {status:400}
  if(name == null) out.description = "Name not provided";
  else if(description == null) out.description = "description not provided";
  else if(date == null) out.description = "date not provided";
  else if(type == null) out.description = "type not provided";
  else if(image == null) out.description = "image not provided";
  else {
    out.status = 200;
  }
  if(out.status != 200){
    res.json(out);
    return;
  }
  try{
    var id = (type+"-"+name.replace(" ","").toLowerCase()+"-"+new Date(date).getDate()).replace("/","").replace("&","").replace("?","").replace("+","");//btoa("Event"+type+name+new Date()).replace("=","");
    var ev = new Event({
      id:id,
      name:name,
      description:description,
      image:image,
      docs:docs,
      date:date,
      minpart:minPart,
      maxpart:maxPart,
      is_team:minPart > 1,
      type:type,
      poster:poster
    });
    await ev.save();
    out.status = 200;
    out.description = "Event created ("+name+")";
    out.content = ev;
    res.json(out);
    return;
  }catch(e){
    out.status = 500;
    out.description = "Error when saving data";
    console.log(e);
    out.error = e;
    res.json(out);
    return;
  }
});
module.exports = router;