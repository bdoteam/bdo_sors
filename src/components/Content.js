import React, { Component } from "react";
import { Layout } from "antd";

import Clients from "../Views/Clients";
import Loader from "../Views/Loader";
import Todo from "../Views/Todo";
import Timesheet from "../Views/Timesheet/index";
import TodoDetail from "../Views/Todo/TodoDetail";
import ClientDetail from "../Views/Clients/ClientDetail";
import Admin from "../Views/Admin/Category/AdminCategory";
import UserProfile from "../Views/UserProfile/Profile.js";

const { Content } = Layout;

export default class ContentComponent extends Component {
  content = (page, id) => {
    switch (page) {
      case "Client":
        return <Clients />;
      case "Todo":
        return <Todo />;
      case "Timesheet":
        return <Timesheet />;
      case "ClientDetail":
        return <ClientDetail id={id} />;
      case "TodoDetail":
        return <TodoDetail id={id} />;
      case "Admin":
        return <Admin />;
      case "UserProfile":
        return <UserProfile />;
    }
  };
  render() {
    const { page } = this.props;
    return (
      <Content
        style={{
          color: "#e8e8e8",
          borderRadius: "10px",
          marginLeft: "10px",
          padding: 20
        }}
      >
        {this.content(this.props.page, this.props.id)}
      </Content>
    );
  }
}
