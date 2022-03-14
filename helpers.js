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


//looking for user by their email
const getUserByEmail = (email, database) => {
  for (let user_id in database) {
    if (database[user_id].email === email) {
      return database[user_id];
    }
  } 
};

//Creating 6 character string
const generateRandomString = () => {
  const shortURL = Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .slice(0, 6);
  return shortURL;
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

//function to check if userID is equal to the id of the currently logged-in user
const urlsForUser = (id) => {
  let usersURL = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      usersURL[key] = urlDatabase[key];
    }
  } return usersURL;
};

//checking if user is logged in or registered via cookie
const getUserFromCookie = (req) => users[req.session.user_id];

module.exports = { getUserByEmail, generateRandomString, isEmailUnique, urlsForUser, getUserFromCookie, urlDatabase, users };