const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs"); //Telling Express app to use EJS as its templating engine

//Creating 6 character string
const generateRandomString = () => {
const shortURL = Math.random().toString(36).replace(/[^a-z]+/g, '').slice(0, 7);;
return shortURL;
};

//Create short: long URL object
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Creating / rout output
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Creating /urls rout output
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//Creating /urls/new rout to create a new URL's
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Rendering information about a single URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

//Redirect shortURL using /u rout to longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

//Creating /hello rout with it's output
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Creating /urls rout using our randomURL and then redirecting to thatt random URL
app.post("/urls", (req, res) => {
  const randomURL = generateRandomString ();
  urlDatabase[randomURL] = req.body.longURL;
  res.redirect(`/urls/${randomURL}`);    
});

//Deleting the URL from /urls/:shortURL/ rout
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


//Startin up a server at port #
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});