const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');

const graphQLSchema = require('./graphql/schema/index');
const graphQLResolvers = require('./graphql/resolvers/index');
app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
   schema: graphQLSchema,
   rootValue: graphQLResolvers, // is a bundle of resolvers
    graphiql: true
}));

mongoose.connect('mongodb://localhost/event-booking')
    .then(() => {
        app.listen(3000);
    })

    .catch(err => {
        console.log(err);
    });
// app.get('/', (req, res, next) => {
//     res.send("hello world!");
// })
