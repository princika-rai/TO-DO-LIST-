//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose=require("mongoose");
const app = express();
const _ =require("lodash");
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-princika:sheero@cluster0.9wvek.mongodb.net/todolistDB",{useNewurlParser:true});
const itemsSchema={
  name:String
};

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"welcome to our todolist"
});
const item2=new Item({
  name:"Hit the + button to add new item"
});
const item3=new Item({
  name:"<-- Hit this to delete an item>"
});
const defaultitem=[item1,item2,item3];



 
// Item.deleteMany({  name:"<-- Hit this to delete an item>" }).then(function(){
//   console.log("Data deleted"); // Success
// }).catch(function(error){
//   console.log(error); // Failure
// });

const listSchema={
  name:String,
  items:[itemsSchema]
};
const List=mongoose.model("List",listSchema);

app.get("/", function(req, res){


 Item.find({},function(err,foundItems){
    if (foundItems.length===0){
       Item.insertMany(defaultitem,function(err){
  if(err){
    console.log("their is an error");
    }
    else{
    console.log("successfully inserted");
    }
  });
  res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
    
});
});

app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundlist){
    if(!err){
      if(!foundlist){
        const list=new List({
          name: customListName,
          items:defaultitem
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
        res.render("list", {listTitle: foundlist.name, newListItems: foundlist.items});
      }
    }
  });  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listname=req.body.list;
  const item=new Item({
    name:itemName
  });

  if(listname==="Today"){
    item.save();
    res.redirect("/")
  }else{
    List.findOne({name:listname},function(err,foundlist){
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+listname);
    });
  }
  
});

app.post("/delete",function(req,res){
  const checkid=req.body.checkbox;
  const listname=req.body.listname;

  if (listname==="Today"){
    Item.findByIdAndRemove(checkid,function(err){
      if(err){
        console.log("their is an error");
        }
        else{
        console.log("successfully removed");
       }
      res.redirect("/")});
  }else{
      List.findOneAndUpdate({name:listname},{$pull:{items:{_id:checkid}}},function(err){
        if(!err){
          res.redirect("/"+listname);
          }
  });
 };
});


// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
 
// List.deleteMany({  name:"work" }).then(function(){
//   console.log("Data deleted"); // Success
// }).catch(function(error){
//   console.log(error); // Failure
// });
