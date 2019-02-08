import React,{ Component } from 'react';
import AuthContext from '../context/auth-context';
import Spinner from '../components/Spinner/Spinner';
import './Bookings.css';
import BookingList from '../components/Bookings/BookingsList';
class BookingsPage extends Component {
    state = {
        isLoading:false,
        bookings: []
    }
    static contextType = AuthContext;
    componentDidMount() {
        this.fetchBookings();
    }
    fetchBookings = () => {
        this.setState({isLoading:true});
        const requestBody = {
          query: `
              query {
                bookings {
                  _id
                  event{
                    _id
                    title
                    price
                    date
                  }
                  user{
                      _id
                    email
                  }
                  createdAt
                  updatedAt
                }
              }
            `
        };
        fetch('http://localhost:3300/graphql', {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + this.context.token
          }
        })
          .then(res => {
            if (res.status !== 200 && res.status !== 201) {
              throw new Error('Failed!');
            }
           
            return res.json();
          })
          .then(resData => {
            const bookings = resData.data.bookings;
         
            this.setState({ bookings: bookings,isLoading:false });
          })
          .catch(err => {
            console.log(err);
            this.setState({isLoading:false});
          });
    }
    deleteBookingHandler = bookingId => {
        this.setState({ isLoading: true });
        const requestBody = {
            query: `
            mutation {
                cancelBooking(bookingID: "${bookingId}") {
                _id
                title
                }
            }
            `
        }
        fetch('http://localhost:3300/graphql', {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + this.context.token
          }
        })
          .then(res => {
            if (res.status !== 200 && res.status !== 201) {
              throw new Error('Failed!');
            }
           
            return res.json();
          })
          .then(resData => {
            this.setState(prevState => {
                const updatedBookings = prevState.bookings.filter(booking =>
                {
                    return booking._id !== bookingId;
                });
            
                return { bookings: updatedBookings,isLoading:false };
          });
        })
          .catch(err => {
            console.log(err);
            this.setState({isLoading:false});
          });
};
    render(){
        return (
        <React.Fragment>   
            <h1>Bookings</h1>
            {this.isLoading ? ( <Spinner/> ) : (
            <BookingList
            bookings={this.state.bookings}
            onDelete={this.deleteBookingHandler}
          />
            )}
            </React.Fragment>) ;
    }
   
}
export default BookingsPage;