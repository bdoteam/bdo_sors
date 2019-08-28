import React, { Component } from "react";
import { Layout, Avatar, Menu, Icon, Row, Col, Tag, Button } from "antd";
import Content from "../../components/Content";
import MenuItem from "../../components/Menu";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import Notification from "./Notification";
import view_name from "../../components/ViewDigest";
import axios from "axios";
import view_comp from "../../components/Access/ViewComp";
import UserProfile from "../UserProfile";

import Card from "../../components/material-dashboard-pro-react/Card/Card.jsx";

const { Header, Sider } = Layout;

class MainPage extends Component {
  state = {
    collapsed: true
  };

  //функция для работы со справочниками вытаскиваем название по id
  digestName = (digest, id) => {
    let result = id;
    {
      digest.map(comp => (id === comp.id ? (result = comp.name) : comp.id));
    }
    return result;
  };

  onCollapse = collapsed => {
    this.setState({
      collapsed
    });
  };

  compName = (state, lic) => {
    let result = lic;

    state.map(comp => (lic === comp.component ? (result = comp.mode) : ""));

    switch (lic) {
      case "client": {
        sessionStorage.setItem("client", result);
        break;
      }
      case "action": {
        sessionStorage.setItem("action", result);
        break;
      }
      case "attach": {
        sessionStorage.setItem("attach", result);
        break;
      }
      case "comment": {
        sessionStorage.setItem("comment", result);
        break;
      }
      case "admin": {
        sessionStorage.setItem("admin", result);
        break;
      }
      case "users": {
        sessionStorage.setItem("users", result);
        break;
      }
      case "timesheet": {
        sessionStorage.setItem("timesheet", result);
        break;
      }
      default:
        break;
    }
  };
  componentWillMount() {
    axios
      .get(sessionStorage.getItem("b_url") + "group_access?view=my", {
        headers: {
          Authorization: "Bearer " + sessionStorage.getItem("credentials")
        }
      })
      .then(res => {
        sessionStorage.setItem("auth", true);
        view_comp.map(comp => this.compName(res.data, comp.id));
        //sessionStorage.setItem("group_name", res.data[0].group_name);
        this.props.dispatch({
          type: "PROTECTED",
          data: {
            user_group: res.data[0].group_name,
            avatar: sessionStorage.getItem("avatar"),
            client: sessionStorage.getItem("client"),
            action: sessionStorage.getItem("action"),
            attach: sessionStorage.getItem("attach"),
            comment: sessionStorage.getItem("comment"),
            admin: sessionStorage.getItem("admin"),
            users: sessionStorage.getItem("users"),
            timesheet: sessionStorage.getItem("timesheet")
          }
        });
      })
      .catch(res => {
        if (res.response.data.error_code === 401) {
          sessionStorage.removeItem("auth");
        }
      });
  }

  render() {
    var page = this.props.page;
    var id = this.props.id;

    return (
      <Layout>
        <Sider
          trigger={null}
          collapsible
          collapsed={this.state.collapsed}
          style={{
            overflow: "auto",
            height: "200vh",
            position: "fixed",
            left: 0
          }}
        >
          <div className="jss15">
            <div className="jss18">
              <img src="http://ss6.dyndns.org:8480/bdo_sors/favicon.ico" />
            </div>
          </div>

          <Menu theme="dark" mode="inline" defaultSelectedKeys={page}>
            {MenuItem.map((item, index) => {
              {
                Object.keys(this.props).map(propKey =>
                  propKey.toUpperCase() === item.key.toUpperCase()
                    ? (item.access = this.props[propKey])
                    : ""
                );
              }
              return item.access != "ban_m" ? (
                <Menu.Item key={item.key} style={{ marginTop: "20px" }}>
                  <Icon style={{ fontSize: "25px" }} type={item.icon} />
                  <Link to={`/${item.key}`}>{item.name}</Link>
                </Menu.Item>
              ) : (
                ""
              );
            })}
          </Menu>
        </Sider>

        <Layout
          style={{
            marginLeft: 60,
            backgroundColor: "white"
          }}
        >
          <Header
            style={{
              background: "#fff",
              padding: 0
            }}
          >
            <Row>
              <Col span={1} />
              <Col span={5}>
                <h1>{this.digestName(view_name, page)}</h1>
              </Col>
              <Col span={14} />
              <Col
                span={2}
                style={{
                  textAlign: "right"
                }}
              >
                <Row>
                  <Col span={12}>
                    <Notification />
                  </Col>
                  <Col span={12}>
                    <UserProfile avatar={this.props.avatar} />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Header>

          {this.props.client !== "ban_m" &&
          page === "Client" &&
          this.props.client !== undefined ? (
            <Content page={page} id={id} />
          ) : this.props.action !== "ban_m" &&
            page === "Todo" &&
            this.props.action !== undefined ? (
            <Content page={page} id={id} />
          ) : this.props.timesheet !== "ban_m" &&
            page === "Timesheet" &&
            this.props.timesheet !== undefined ? (
            <Content page={page} id={id} />
          ) : page === "UserProfile" ? (
            <Content page={page} id={id} />
          ) : this.props.admin !== "ban_m" &&
            page === "Admin" &&
            this.props.admin !== undefined ? (
            <Content page={page} id={id} />
          ) : (page === "ClientDetail" && this.props.client !== undefined) ||
            (page === "TodoDetail" && this.props.action !== undefined) ? (
            <Content page={page} id={id} />
          ) : (
            <li>
              <span>
                <Tag color="volcano">
                  <h1> Доступ запрещен, обратитесь к Администратору! </h1>
                </Tag>
              </span>
            </li>
          )}
        </Layout>
      </Layout>
    );
  }
}

const mapStateToProps = state => {
  return {
    avatar: state.avatar,
    action: state.action,
    client: state.client,
    admin: state.admin,
    timesheet: state.timesheet
  };
};
export default connect(mapStateToProps)(MainPage);
