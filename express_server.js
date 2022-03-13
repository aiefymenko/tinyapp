const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcryptjs'); //storing password securely

app.use(cookieParser());//middleware for cookie parser
app.use(bodyParser.urlencoded({ extended: true })); //middleware for parsing bodies from URL
app.set("view engine", "ejs"); //Telling Express app to use EJS as its templating engine

//Creating 6 character string
const generateRandomString = () => {
  const shortURL = Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .slice(0, 6);
  return shortURL;
};

//Database
const urlDatabase = {
  b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
    }
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
    password: "$2a$10$Wm.mVryfyDJsZJjH2rvZu.VAYdRmI1g8zBpg/9C8ztZvuuSmwjzQe",
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

//looking for user by their email
const getUserByEmail = (email) => {
  for (let user_id in users) {
    if (users[user_id].email === email) {
      return users[user_id];
    }
  } 
  return null;
};

//checking if user is logged in or registered via cookie
const getUserFromCookie = (req) => users[req.cookies["user_id"]];

//function to check if userID is equal to the id of the currently logged-in user
const urlsForUser = (id) => {
  let usersURL = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      usersURL[key] = urlDatabase[key];
    }
  } return usersURL;
}

//Defining a rout handler for get request from / and responding with simple output
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Requesting data from /urls and rendering urls_index page and passing templateVars as a callback
app.get("/urls", (req, res) => {
    const pullTheUserURL = urlsForUser (req.cookies["user_id"]);
    const templateVars = { urls: pullTheUserURL, user: getUserFromCookie(req) };
    res.render("urls_index", templateVars);
});

//Sending data to the server and redirecting to a new long URL
app.post("/urls", (req, res) => {
  if (getUserFromCookie(req)) { //if user registered or logged in
    const randomURL = generateRandomString();
    urlDatabase[randomURL] = {
      longURL: req.body.longURL,
      userID: getUserFromCookie(req).id
    };
    res.redirect(`/urls/${randomURL}`);
  } else {
    return res.status(403).send("Access denied");
  };
});


//Requesting data from url/new and rendering urls_new page and passing templateVars as callback
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: getUserFromCookie(req) };
  if (getUserFromCookie(req)) { //if user isn't registered or logged in
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// Register new user
app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user: getUserFromCookie(req) };
  res.render("urls_register", templateVars);
});

//Passing new user id, email, password from server
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email.trim();
  const password = req.body.password.trim();
  const hashedPassword = bcrypt.hashSync(password, 10); //security password
  if (email === "" || password === "") { //if email or password is empty
    return res.status(400).send("Email or Password can't be empty");
  } else if (isEmailUnique(email)) { //if our email is unique
    users[id] = { id, email, hashedPassword};
    res.cookie("user_id", users[id].id);
  } else {
     return res.status(400).send("User already exists");
   }
  res.redirect("/urls");
});

// Rendering information about a single URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: getUserFromCookie(req),
  };
  res.render("urls_show", templateVars);
});

//Redirect shortURL using /u rout to longURL
app.get("/u/:shortURL", (req, res) => {
  console.log(req.params.shortURL);
  if (urlDatabase[req.params.shortURL]) {
    const shortURL = req.params.shortURL;
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    return res.status(400).send("Invalid link");
  }

});

//Creating /hello rout with it's output
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Creating get request from /login
app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, user: getUserFromCookie(req) };
  res.render("urls_login", templateVars);
});

//Checking if the user is registered and then passing id over to cookie
app.post("/login", (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password.trim();
  const user = getUserByEmail(email);
  if (user) {
    if (bcrypt.compareSync(password, user.hashedPassword)) {
      res.cookie("user_id", user.id);
      res.redirect("/urls");
    } else {
      return res.status(403).send("Password is incorrect");
    }
  } else {
    return res.status(403).send("User with the following email doesn't exist");
  }
});

// Creating /logout and clear the cookies
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//Edit POST /urls/:id
app.post("/urls/:id", (req, res) => {
  if (getUserFromCookie(req)) {
    const urlId = req.params.id;
    const newURL = req.body.longURL;
    urlDatabase[urlId].longURL = newURL;
    res.redirect("/urls");
  } else {
    return res.status(403).send("Access denied");
  }    
});

//Deleting the URL from /urls/:shortURL/ rout
app.post("/urls/:shortURL/delete", (req, res) => {
  if (getUserFromCookie(req)) {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
  } else {
    return res.status(403).send("Access denied");
  }
});

//Startin up a server at port #
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
