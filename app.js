const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } =  require('graphql');
const mongoose = require('mongoose');
const app = express();
const Event = require('./models/events');

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
        type Event {
            _id : ID!
            title : String!
            description: String!
            price : Float!
            date : String!
        }

        input EventInput {
            title : String!
            description: String!
            price : Float!
            date : String!
        }

        type RootQuery {
            events: [Event!]!     
        }
        type RootMutation {
            createEvent(eventInput : EventInput): Event
        }
        schema {
            query: RootQuery
            mutation:RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return Event.find().then(events => {
                return events.map(event => {
                    return { ...event._doc, _id: event.id };
                });
            }).catch(err => {
                throw err;
            })
        },
        createEvent: args => {
            const event = new Event({
                title : args.eventInput.title,
                description : args.eventInput.description,
                price : +args.eventInput.price,
                date : new Date(args.eventInput.date)
            });
           return event.save().then(result => {
                console.log(result);
                return {...result._doc};
           }).catch(err => {
                console.log(err);
                throw err;
           });
           
        }
    },              // is a bundle of resolvers
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
