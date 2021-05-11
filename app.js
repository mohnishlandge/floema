const express = require("express");
const app = express();
const path = require("path");
const port = 5000;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.get("/", (req, res) => {
  res.render("pages/home");
});

app.get("/about", (req, res) => {
  res.render("pages/about");
});

app.get("/collections", (req, res) => {
  res.render("pages/collections");
});

app.get("/detail/:uid", (req, res) => {
  res.render("pages/detail");
});

app.listen(port, () => {
  console.log(`Server started at port: ${port}`);
});
