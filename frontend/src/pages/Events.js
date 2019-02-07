import React, { Component } from 'react';

import Modal from '../components/Modal/Modal';
import Backdrop from '../components/Backdrop/Backdrop';
import AuthContext from '../context/auth-context';
import './Events.css';


class EventsPage extends Component {
    state = {
        creating: false,
        events: []
    };

    static contextType = AuthContext;

    constructor(props){
        super(props);
        this.titleElRef = React.createRef();
        this.priceElRef = React.createRef();
        this.dateElRef = React.createRef();
        this.descriptionElRef = React.createRef();
    }
    componentDidMount() {
        this.fetchEvents();
    }
    startCreateEventHandler = () => {
        this.setState({ creating:true });
    }

    modalCancelHandler = () => {
        this.setState({ creating:false });
    }

    modalConfirmHandler = () => {
        this.setState({ creating:false });
        const title = this.titleElRef.current.value;
        const price = this.priceElRef.current.value;
        const date = this.dateElRef.current.value;
        const description = this.descriptionElRef.current.value;

        if(
         title.trim().length === 0 ||
         price <= 0 || 
         date.trim().length === 0|| 
         description.trim().length === 0 )
         {
            return;
         }
        const event = {title,price,date,description};
        console.log(event);

        const requestBody = {
            query: `
            mutation {
              createEvent(eventInput: { 
              title: "${title}", 
              description:"${description}",
              price: ${price},
              date:"${date}"
              
            }){
                  _id
                  title
                  description
                  price
                  date
                  creator {
                      _id
                      email
                  }
              }
            }
        `
    };
    const token = this.context.token;
    console.log("token is :" ,token);
    fetch('http://localhost:3300/graphql',{
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
        }
    })
    
    .then( res => {
        console.log('res',res);
        if(res.status !== 200 && res.status !== 201){
            throw new Error('Failed');
        }
        return res.json();
    })
    .then(resData => {
        this.fetchEvents();
    })
    .catch(err => {
        console.log(err);
    });
};
fetchEvents() {
    const requestBody = {
      query: `
          query {
            events {
              _id
              title
              description
              date
              price
              creator {
                _id
                email
              }
            }
          }
        `
    };
    fetch('http://localhost:3300/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }
        return res.json();
      })
      .then(resData => {
        const events = resData.data.events;
        this.setState({ events: events });
      })
      .catch(err => {
        console.log(err);
      });
  }

    render() {
        const eventList = this.state.events.map(event => {
            return (
              <li key={event._id} className="events__list-item">
                {event.title}
              </li>
            );
          });      

        return (
            <React.Fragment>
                {this.state.creating && <Backdrop/> }
                { this.state.creating && (
                <Modal title ="Add Event" 
                canCancel 
                canConfirm 
                onCancel={this.modalCancelHandler} 
                onConfirm={this.modalConfirmHandler} >

                    <form>
                        <div className="form-control">
                            <label htmlFor="title">Title</label>
                            <input type="text" id="title" ref={this.titleElRef}></input>
                        </div>
                        <div className="form-control">
                            <label htmlFor="price">Price</label>
                            <input type="number" id="price" ref={this.priceElRef}></input>
                        </div>
                        <div className="form-control">
                            <label htmlFor="date">Date</label>
                            <input type="date" id="date" ref = {this.dateElRef}></input>
                        </div>
                        <div className="form-control">
                            <label htmlFor="description">Description</label>
                            <textarea id="description" 
                            rows="4" 
                            ref={this.descriptionElRef}></textarea>
                        </div>
                    </form>
                </Modal>
                )}
                  {this.context.token && (
                <div className= "events-control">
                <p>Share your own events</p>
                <button className="btn" 
                onClick = {this.startCreateEventHandler}> 
                Create Events</button>
                  </div> )}
                <ul className="events__list">{eventList}</ul>
            </React.Fragment>
        ) ;
    }
   
}
export default EventsPage;