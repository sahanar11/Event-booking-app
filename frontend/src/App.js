import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';

import AuthPage from './pages/Auth';
import BookingsPage from './pages/Bookings';
import EventsPage from './pages/Events';
import MainNavigation from './components/Navigation/MainNavigation';
import AuthContext from './context/auth-context';
import './App.css';

class App extends Component {
  render() {
    return (
      <Router>
        <React.Fragment>
        <AuthContext.Provider>
        <MainNavigation />
        <main className = "main-content">
        <Switch>
          <Redirect from="/" to="/auth" exact />
          <Route path="/auth" component={AuthPage} />
          <Route path="/events" component={EventsPage} />
          <Route path="/bookings" component={BookingsPage} />
        </Switch>
        </main>
        </AuthContext.Provider>
        </React.Fragment>
      </Router>
    );
  }
}

export default App;