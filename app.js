const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = express();
const Event = require('./models/events');
const User = require('./models/users');
app.use(bodyParser.json());

const events = eventIds => {
    return Event.find({_id: {$in: eventIds}})
    .then(events => {
        return events.map(event => { 
            return { ...event._doc, _id:event.id, 
                creator: user.bind(this,event.creator)};
        });
    })
    .catch(err => {
        throw err;
    })
}
const user = userId => {
    return User.findById(userId).then(user => {
        return { ...user._doc,_id: user.id, 
            createdEvents: events.bind(this,user._doc.createdEvents)};
    })
    .catch(err => {
        throw err;
    })
}

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
        type Event {
            _id : ID!
            title : String!
            description: String!
            price : Float!
            date : String!
            creator: User!
        }
        type User {
            _id : ID!
            email : String!
            password: String
            createdEvents: [Event!]
        }
        input EventInput {
            title : String!
            description: String!
            price : Float!
            date : String!
        }

        input UserInput {
            email : String!
            password: String
        }

        type Query {
            events: [Event!]!   
            users: [User!]!  
        }
        type Mutation {
            createEvent(eventInput : EventInput): Event
            createUser(userInput: UserInput) : User
        }
        schema {
            query: Query
            mutation: Mutation
        }
    `),
    rootValue: {
        events: () => {
            return Event.find()
            .then(events => {
                return events.map(event => {
                    return { ...event._doc, 
                        _id: event.id,
                        creator: user.bind(this, event._doc.creator)
                        };
                });
            }).catch(err => {
                throw err;
            })
        },
        createEvent: args => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date),
                creator: '5c58149be5c5fd4ced58f762'
            });
            let createdEvent;
            return event
            .save()
            .then(result => {
                createdEvent = { ...result._doc ,
                _id: result._doc._id.toString(),
                creator : user.bind(this, result._doc.creator)
                };
                return User.findById('5c58149be5c5fd4ced58f762');
                // return { ...result._doc };
            })
            .then(user => {
                if(!user) {
                    throw new Error('User not found');
                }
                user.createdEvents.push(event);
                return user.save();
            })
            .then(result => {
                return createdEvent;
            })
            .catch(err => {
                console.log(err);
                throw err;
            });

        },
        users: () => {
            return User.find().then(users => {
                return users.map(user => {
                    return { ...user._doc, _id: user.id };
                });
            }).catch(err => {
                throw err;
            })
        },
        createUser: args => {
            return User.findOne({email:args.userInput.email}).then(user => {
                if(user){
                    throw new Error('User already exists');
                }
                return bcrypt
                .hash(args.userInput.password, 12);
            })
                .then(hashedPassword => {
                    const user = new User({
                        email : args.userInput.email,
                        password : hashedPassword
                    });
                    return user.save();
                })
                .then(result => {
                    console.log(result);
                    return { ...result._doc };
                })
                .catch(err => {
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
