const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs"); //Telling Express app to use EJS as its templating engine

//Creating 6 character string
const generateRandomString = () => {
  const shortURL = Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .slice(0, 6);
  return shortURL;
};

//Create short: long URL object
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//create userID object to store id, email, password
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//check an email in users object
const isEmailUnique = (newEmail) => {
  let result = true;
  for (let user in users) {
    let oldEmail = users[user].email;
    if (oldEmail === newEmail) {
      return false;
    }
  } 
  return result;
};

const getUserFromCookie = (req) => users[req.cookies["user_id"]];

//Creating / rout output
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Creating /urls rout output
app.get("/urls", (req, res) => {
  console.log("user id cookie", req.cookies["user_id"]);
  const templateVars = { urls: urlDatabase, user: getUserFromCookie(req) };
  res.render("urls_index", templateVars);
});

//Creating /urls/new rout to create a new URL's
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: getUserFromCookie(req) };
  res.render("urls_new", templateVars);
});

// Register new user
app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user: getUserFromCookie(req) };
  res.render("urls_register", templateVars);
});

//Passing new user id, username, password from server
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email.trim();
  const password = req.body.password.trim();
  if (email === "" || password === "") {
    return res.send("Status code: 400. Email or password is missing");
  } else if (isEmailUnique(email)) {
    users[id] = { id, email, password };
    res.cookie("user_id", users[id].id);
  } else {
     return res.send('User exist');
   }
  res.redirect("/urls");
});

// Rendering information about a single URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: getUserFromCookie(req),
  };
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

//Creating cookies to /login
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

// Creating /logout and clear the cookies
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//Creating /urls rout using our randomURL and then redirecting to thatt random URL
app.post("/urls", (req, res) => {
  const randomURL = generateRandomString();
  urlDatabase[randomURL] = req.body.longURL;
  res.redirect(`/urls/${randomURL}`);
});

//Edit POST /urls/:id
app.post("/urls/:id", (req, res) => {
  const urlId = req.params.id;
  const newURL = req.body.longURL;
  urlDatabase[urlId] = newURL;
  res.redirect("/urls");
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
