let express = require("express");
const _ = require("lodash");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
// mongoose.connect("mongodb://localhost:27017/todolistDB");
mongoose.connect(
  "mongodb+srv://admin:admin@cluster0.s5v2m.mongodb.net/todolistDB?retryWrites=true&w=majority"
);
const itemsSchema = { name: String };
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({ name: "Cook food" });
const item2 = new Item({ name: "Iron clothes for Kirit" });
const item3 = new Item({ name: "task 3 for Kirit" });
const defaultItems = [item1, item2, item3];

let app = express();
var items = [];
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
var day = new Date();
var fooVal = "Today";
app.get("/", (req, res) => {
  Item.find({}, function (err, foundItems) {
    console.log(foundItems);
    if (foundItems.length == 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else console.log("Successfully saved defaultitems to Database");
      });
    }
    res.render("index", { foo: fooVal, newItem: foundItems });
  });
  // .then(() => {
  //   res.render("index", { foo: fooVal, newItem: foundItems });
  // });
});

app.get("/about", function (req, res) {
  res.render("about");
});
//delete route for removing items from list
app.post("/delete", function (req, res) {
  console.log(req.body.checkbox);
  var checkedItemName = req.body.checkbox;
  var listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemName, function (err) {
      console.log(err);
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemName } } },
      function (err, foundList) {
        console.log("Successfully deleted the document");
        res.redirect("/" + listName);
      }
    );
  }
  // res.send("hello thereOh hi Mark");
});

//customtodolists or custom route
const listSchema = {
  name: String,
  items: [itemsSchema],
};
const List = mongoose.model("List", listSchema);
app.get("/:customListName", function (req, res) {
  console.log(req.params.customListName);
  var customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }, function (err, foundList) {
    // console.log("List already exists");
    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems,
      });
      list.save();
      res.redirect("/" + customListName);
    } else {
      res.render("index", { foo: foundList.name, newItem: foundList.items });
    }
  });
});

//post route after + button is clicked
app.post("/", function (req, res) {
  var itemName = req.body.newItem;
  var listName = req.body.listTitle;
  console.log(listName);
  const item = new Item({ name: itemName });
  if (listName === "Today") {
    item.save();
    // items.push(item);
    // console.log(items);
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      //save new item in that document found by findOne method
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.listen(4000, () => console.log("Example app listening on port 4000!"));
