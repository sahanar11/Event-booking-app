const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');
const isAuth = require('./middleware/is-auth');
const graphQLSchema = require('./graphql/schema/index');
const graphQLResolvers = require('./graphql/resolvers/index');


app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // allow access for all clients
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS'); // options will be there along with the post also so we need to allow access to options also
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

app.use(isAuth);

app.use('/graphql', graphqlHttp({
   schema: graphQLSchema,
   rootValue: graphQLResolvers, // is a bundle of resolvers
    graphiql: true
}));

mongoose.connect('mongodb://localhost/event-booking')
    .then(() => {
        app.listen(3300);
    })
    .catch(err => {
        console.log(err);
    });
// app.get('/', (req, res, next) => {
//     res.send("hello world!");
// })
