const express = require('express');
const bodyParser = require('body-parser');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const passwordHash = require('password-hash');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.static("views"));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const serviceAccount = require("./key.json");

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

app.get('/home', function (req, res) {
  res.sendFile(__dirname + "/public/" + "home.html");
});

app.get('/signup', function (req, res) {
  res.sendFile(__dirname + "/public/" + "signup.html");
});

app.get('/login', function (req, res) {
  res.sendFile(__dirname + "/public/" + "login.html");
});

app.get('/dashboard', function (req, res) {
  res.render("dashboard");
});

app.post('/signupsubmit', function (req, res) {
  const { username, email, password } = req.body;

  db.collection("naveen")
    .where("Email", "==", email)
    .get()
    .then((docs) => {
      if (!docs.empty) {
        res.send("<center><h1>Sorry, this account already exists with this email</h1></center>");
      } else {
        const hashedPassword = passwordHash.generate(password);
        
       
        db.collection('naveen').add({
          Username: username,
          Email: email,
          Password: hashedPassword,
        })
          .then(() => {
            res.redirect('/login'); 
          })
          .catch((error) => {
            console.error("Error adding document: ", error);
            res.send("Something went wrong during signup.");
          });
      }
    })
    .catch(() => {
      res.send("Something went wrong");
    });
});

app.post('/loginsubmit', function (req, res) {
  const { email, password } = req.body;

  let dataPres = false;
  db.collection('naveen').get()
    .then((docs) => {
      docs.forEach((doc) => {
        if (email == doc.data().Email && passwordHash.verify(password, doc.data().Password)) {
          dataPres = true;
        }
      });

      if (dataPres) {
        res.redirect('/dashboard'); 
      } else {
        res.send("<h2>Data not present in the firebase database. Please login</h2>");
      }
    })
    .catch(() => {
      res.send("Something went wrong");
    });
});

app.listen(port, function () {
  console.log(`Your server is running on http://localhost:${port}/home`);
});
