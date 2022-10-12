const express = require('express');
// const bodyParser = require('body-parser'); // On peut utiliser bodyparser pour intercepter le json plutôt qu'express
const mongoose = require('mongoose');

const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

const path = require('path');

mongoose.connect('mongodb+srv://Thanystos:Devilplop0@cluster0.asgmhcu.mongodb.net/?retryWrites=true&w=majority', 
{ useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(express.json()); // Permet d'intercepter toute réponse json envoyée
// app.use(bodyParser.json());  Voir const bodyParser

app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;