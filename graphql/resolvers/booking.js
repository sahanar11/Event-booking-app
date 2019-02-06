const Event = require('../../models/events');
const Booking = require('../../models/booking');
const {transformBooking, transformEvent } = require('./merge');

module.exports = {
bookings: async () => {
    try{
        const bookings =  await Booking.find();
        return bookings.map( booking => {
            return transformBooking(booking);
        })
    }
    catch(err) {
        throw err;
    }
},
bookEvent: async args => {
    try {
        const fetchedEvent = await Event.findOne({ _id: args.eventID});
        const booking = new Booking({
            user: '5c58149be5c5fd4ced58f762',
            event: fetchedEvent
        });
        const result = await booking.save();
        return transformBooking(result);
    }
    catch (err){
        console.log(err);
        throw err;
       }
},

cancelBooking: async args => {
    try {
      const booking = await Booking.findById(args.bookingID).populate('event');   // to get the event data
      const event = transformEvent(booking.event);
      await Booking.deleteOne({ _id: args.bookingID });
      return event;
    } catch (err) {
      throw err;
    }
  }
}