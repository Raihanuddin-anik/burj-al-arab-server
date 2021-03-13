const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");

const MongoClient = require('mongodb').MongoClient;

require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ostva.mongodb.net/burjAlArab?retryWrites=true&w=majority`;

const port = 5000;

const app = express()
app.use(cors());
app.use(bodyParser.json());


var admin = require("firebase-admin");

var serviceAccount = require("./burj-al-arab-e6f91-firebase-adminsdk-qhc4k-b036037e66.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});



const password = "raihan431760";



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const booking = client.db("burjAlArab").collection("booking-server");

  app.post("/addBooking", (req, res) => {
    const newBooking = req.body;
    booking.insertOne(newBooking)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
    console.log(newBooking)

  })


  app.get('/booking', (req, res) => {

    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer ')) {
      const idToken = bearer.split(' ')[1];
      console.log({ idToken });
      admin.auth().verifyIdToken(idToken)
        .then(function (decodedToken) {
          const tokenEmail = decodedToken.email;
          const quearyEmail = req.query.email;
          if (tokenEmail == quearyEmail) {
            booking.find({ email: req.query.email })
              .toArray((err, document) => {
                res.status(200).send(document)
              })
          }
          
          else{
            res.status(401).send('un-authoraised access')
          }
        })
        .catch(function (error) {
          res.status(401).send('un-authoraised access')
        })
    }
  else{
    res.status(401).send('un-authoraised access')
  }


  })
  console.log("success")
});



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT || port)