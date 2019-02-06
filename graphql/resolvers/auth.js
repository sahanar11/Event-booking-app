const bcrypt = require('bcryptjs');  // npm install --save bcryptjs
const jwt = require('jsonwebtoken'); //npm install --save jsonwebtoken
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

   login: async ({email,password}) => {
    const user = await User.findOne({ email:email });
    if(! user){
        throw new Error("user does not exists");
    }
    const isEqual = await bcrypt.compare(password, user.password );
    if(!isEqual){
        throw new Error("password is incorrect");
    }
    const token = jwt.sign({ userId: user.id, email: email}, 'somesupersecretkey',{
        expiresIn: '1h'
    });
    return { userId:user.id,token:token,tokenExpiration: 1};
   }
};