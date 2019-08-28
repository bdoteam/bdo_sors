import React, { Component } from "react";
import "./App.css";
import MainPage from "./Views/Main Page/index";
import LoginPage from "./Views/LoginPage";
import { Route, BrowserRouter, Switch, Redirect } from "react-router-dom";

class ClientDetailComp extends React.Component {
  render() {
    const id = this.props.match.params.id;
    return <MainPage page="ClientDetail" id={id} />;
  }
}

class TodoDetailComp extends React.Component {
  render() {
    const id = this.props.match.params.id;
    return <MainPage page="TodoDetail" id={id} />;
  }
}
const NoMatch = () => <p>No Match</p>;

function ProtectedComponent(result) {
  return sessionStorage.getItem("auth") ? (
    result
  ) : (
    <Redirect
      to={{
        pathname: "/Login"
      }}
    />
  );
}
function ProtectedRoute({ component: Component, ...rest }) {
  return sessionStorage.getItem("auth") ? (
    <Route {...rest} render={props => <Component {...props} />} />
  ) : (
    <Redirect
      to={{
        pathname: "/Login"
      }}
    />
  );
}
class App extends Component {
  router = name => {
    return <MainPage page={name} />;
  };

  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/Login" component={LoginPage} />
          <Route
            path="/Client"
            component={() => ProtectedComponent(this.router("Client"))}
          />
          <Route
            path="/Todo"
            component={() => ProtectedComponent(this.router("Todo"))}
          />
          <Route
            path="/Timesheet"
            component={() => ProtectedComponent(this.router("Timesheet"))}
          />
          <Route
            path="/Admin"
            component={() => ProtectedComponent(this.router("Admin"))}
          />
          <Route
            path="/UserProfile"
            component={() => ProtectedComponent(this.router("UserProfile"))}
          />
          <ProtectedRoute
            path={`/ClientDetail/:id`}
            component={ClientDetailComp}
          />
          <ProtectedRoute path="/TodoDetail/:id" component={TodoDetailComp} />
          <Route path="*" exact component={LoginPage} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
