const bcrypt = require('bcryptjs');
const { events } = require('./merge');
const User = require('../../models/users');

module.exports =  {

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
    },

   
};