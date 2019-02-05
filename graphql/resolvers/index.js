const bcrypt = require('bcryptjs');
const Event = require('../../models/events');
const User = require('../../models/users');

const events = async eventIds => {
    try{
    const events = await Event.find({_id: {$in: eventIds}})
         events.map(event => { 
            return { ...event._doc, _id:event.id, 
                creator: user.bind(this,event.creator)
            };
        });
        return events;
    }
    catch(err) {
        throw err;
    }   
}

const user = async userId => {
    try{
    const user =  await User.findById(userId) ;
        return {
                 ...user._doc, 
                _id: user.id, 
                createdEvents: events.bind(this,user._doc.createdEvents)
            };
    }   
    catch(err) {
        throw err;
    }
}

module.exports =  {
    events: async () => {
        try{
        const events =  await Event.find();
            return events
            .map(event => {
                return {
                    ...event._doc, 
                    _id: event.id,
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, event._doc.creator)};
            }); 
        }
         catch (err) {
            throw err;
        }
    },

    createEvent: async args => {
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: "5c5937da28372097c5b0167d"
        });
        let createdEvent;
        try{
        const result = await event.save()
            createdEvent = { 
            ...result._doc ,
            _id: result._doc._id.toString(),
            date: new Date(event._doc.date).toISOString(),
            creator : user.bind(this, result._doc.creator)
            };
            const creator = await User.findById('5c5937da28372097c5b0167d');
            if(!creator) {
                throw new Error('User not found');
            }
            creator.createdEvents.push(event);
             await creator.save();
            return createdEvent;
        }   catch (err) {
                throw err;
            }
    },


    users: async () => {
        try{
        const users= await User.find()
            return users.map(user => {
                return { ...user._doc, 
                    _id: user.id ,
                    createdEvents: events.bind(this, user._doc.createdEvents)
                };
            });
        }
        catch(err) {
            throw err;
        }
    },


    createUser: async args => {
        try{
        const existingUser = await User.findOne({email:args.userInput.email})
        
            if(existingUser){
                throw new Error('User already exists');
            }
            const hashedPassword = await  bcrypt.hash(args.userInput.password, 12);
            const user = new User({
                email : args.userInput.email,
                password : hashedPassword
            });
            const result = await user.save();
            return { ...result._doc ,
                password: null,
                _id: result.id,
                createdEvents: events.bind(this, result._doc.createdEvents)};
            }
           catch (err){
            console.log(err);
            throw err;
           }
    }
};