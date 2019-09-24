import { Drawer, Form, Input, Select, message, Icon, Col, Row } from "antd";
import React, { Component } from "react";
import axios from "axios";
import PropTypes from "prop-types";
// @material-ui/core components
import withStyles from "@material-ui/core/styles/withStyles";

// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import InputAdornment from "@material-ui/core/InputAdornment";
//import Icon from "@material-ui/core/Icon";

// @material-ui/icons
import Face from "@material-ui/icons/Face";
import Lock from "@material-ui/icons/Lock";

// core components
import GridContainer from "../../components/material-dashboard-pro-react/Grid/GridContainer.jsx";
import GridItem from "../../components/material-dashboard-pro-react/Grid/GridItem.jsx";
import CustomInput from "../../components/material-dashboard-pro-react/CustomInput/CustomInput.jsx";
import Button from "../../components/material-dashboard-pro-react/CustomButtons/Button.jsx";
import Card from "../../components/material-dashboard-pro-react/Card/Card.jsx";
import CardBody from "../../components/material-dashboard-pro-react/Card/CardBody.jsx";
import CardHeader from "../../components/material-dashboard-pro-react/Card/CardHeader.jsx";
import CardFooter from "../../components/material-dashboard-pro-react/Card/CardFooter.js";

import styles from "../../components/material-dashboard-pro-react/Style/loginPageStyle.js";
import view_comp from "../../components/Access/ViewComp";
import { connect } from "react-redux";
import GoogleSvg from "../../components/svg/GoogleSVG";
import userProfileStyles from "../../components/material-dashboard-pro-react/Style/userProfileStyles.jsx";

const useStyles = makeStyles(styles);
const GoogleIcon = props => <Icon component={GoogleSvg} {...props} />;
//const b_url = "http://bapp.kz:8889/";
//const b_url = "http://192.168.11.204:8889/"; //local
const b_url = "http://ss6.dyndns.org:8889/"; //local
sessionStorage.setItem("b_url", b_url);
const compName = (state, lic) => {
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
    default:
      break;
  }
};

class LoginPage extends Component {
  state = {
    loading: false,
    username: "",
    password: ""
  };
  onLoginChange = (event, type) => {
    type === "username"
      ? this.setState({ username: event.target.value })
      : this.setState({ password: event.target.value });
  };
  redirect = (res_data, profile, type) => {
    if (type === "google") {
      let headersConfig = {
        Authorization: "Bearer " + sessionStorage.getItem("credentials")
      };
      const requestBody = {
        id: res_data.user_id,
        avatar: profile.getImageUrl(),
        last_name: profile.getFamilyName(),
        first_name: profile.getGivenName()
      };
      axios({
        method: "post",
        url: sessionStorage.getItem("b_url") + "users",
        data: requestBody,
        headers: headersConfig
      }).then(res => {});

      sessionStorage.setItem("avatar", profile.getImageUrl());
    } else {
      sessionStorage.setItem("avatar", res_data.avatar);
    }
    //Здесь вытаскиваем список доступов

    axios
      .get(sessionStorage.getItem("b_url") + "group_access?view=my", {
        headers: {
          Authorization: "Bearer " + sessionStorage.getItem("credentials")
        }
      })
      .then(res => {
        sessionStorage.setItem("auth", true);
        view_comp.map(comp => compName(res.data, comp.id));

        this.props.dispatch({
          type: "PROTECTED",
          data: {
            user_group: res_data.group_name,
            avatar: sessionStorage.getItem("avatar"),
            client: sessionStorage.getItem("client"),
            action: sessionStorage.getItem("action"),
            attach: sessionStorage.getItem("attach"),
            comment: sessionStorage.getItem("comment"),
            admin: sessionStorage.getItem("admin"),
            users: sessionStorage.getItem("users")
          }
        });
        this.props.history.push("/Client");
      })
      .catch(res => {
        if (res.response.data.error_code === 401) {
          sessionStorage.removeItem("auth");
          //message.error(res.response.data.message);
        }
      });
  };

  g_signIn = () => {
    try {
      const _onInit = auth2 => {
        auth2 = window.gapi.auth2.getAuthInstance();
        auth2.signIn().then(googleUser => {
          // метод возвращает объект пользователя
          // где есть все необходимые нам поля
          const profile = googleUser.getBasicProfile();
          // токен
          const id_token = googleUser.getAuthResponse().id_token;
          let headersConfig = {
            Authorization: "Bearer " + id_token
          };

          axios({
            method: "post",
            url: sessionStorage.getItem("b_url") + "g_authorization",
            headers: headersConfig
          }).then(res => {
            if (res.data.token !== "") {
              sessionStorage.setItem("credentials", res.data.token);
              sessionStorage.setItem("lang", res.data.lang);
              res.data.error_code == 0
                ? this.redirect(res.data, profile, "google")
                : message.error(res.data.detailed_message);
            }
          });
        });
      };
      const _onError = err => {
        console.log("error", err);
      };

      window.gapi.load("auth2", function() {
        window.gapi.auth2
          .init({
            // не забудьте указать ваш ключ в .env
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID
          })
          .then(_onInit, _onError);
      });
    } catch (err) {
      message.error("Ошибка авторизаций: " + err.message);
    }
  };
  signIn = () => {
    this.setState({ loading: true });
    try {
      const requestBody = {
        username: this.state.username,
        password: this.state.password
      };

      axios({
        method: "post",
        url: sessionStorage.getItem("b_url") + "authorization",
        data: requestBody
      }).then(res => {
        if (res.data.token !== "") {
          this.setState({ loading: false });
          sessionStorage.setItem("credentials", res.data.token);
          sessionStorage.setItem("lang", res.data.lang);
          res.data.error_code == 0
            ? this.redirect(res.data, null, "Basic")
            : message.error(res.data.detailed_message);
        }
      });
    } catch (err) {
      this.setState({ loading: false });
      message.error("Ошибка авторизаций: " + err.message);
    }
  };
  componentWillMount() {
    sessionStorage.removeItem("credentials");
    sessionStorage.removeItem("auth");
    sessionStorage.removeItem("client");
    sessionStorage.removeItem("admin");
    sessionStorage.removeItem("avatar");
    sessionStorage.removeItem("comment");
    sessionStorage.removeItem("action");
    sessionStorage.removeItem("users");
    sessionStorage.removeItem("attach");
  }
  render() {
    const { classes } = this.props;
    const GoogleIcon = props => <Icon component={GoogleSvg} {...props} />;
    return (
      <div className={classes.container}>
        <div className="bg" />
        <GridContainer justify="center" style={{ margin: "-250px -10px" }}>
          <GridItem xs={12} sm={6} md={2}>
            <form>
              <Card login>
                <CardHeader
                  className={`${classes.cardHeader} ${classes.textCenter}`}
                  color="rose"
                >
                  <h4 className={classes.cardTitle} style={{ color: "#fff" }}>
                    Войти с
                  </h4>
                  <div className={classes.socialLine}>
                    <Button
                      title="Войти с Google аккаунтом"
                      color="transparent"
                      justIcon
                      className={classes.customButtonClass}
                      onClick={this.g_signIn}
                    >
                      <Icon type="google-plus-circle" theme="filled" />
                    </Button>
                  </div>
                </CardHeader>
                <CardBody>
                  <CustomInput
                    labelText="Пользователь"
                    id="firstname"
                    formControlProps={{
                      fullWidth: true
                    }}
                    inputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Face className={classes.inputAdornmentIcon} />
                        </InputAdornment>
                      ),
                      onChange: event => this.onLoginChange(event, "username")
                    }}
                  />

                  <CustomInput
                    labelText="Пароль"
                    id="password"
                    formControlProps={{
                      fullWidth: true
                    }}
                    inputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Lock className={classes.inputAdornmentIcon} />
                        </InputAdornment>
                      ),
                      type: "password",
                      autoComplete: "off",
                      onChange: event => this.onLoginChange(event, "password")
                    }}
                  />
                </CardBody>
                <CardFooter className={classes.justifyContentCenter}>
                  <Button
                    color="rose"
                    simple
                    size="lg"
                    onClick={this.signIn}
                    loading={this.state.loading}
                    block
                  >
                    Войти
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </GridItem>
        </GridContainer>
      </div>
    );
  }
}

LoginPage.propTypes = {
  classes: PropTypes.object
};
export default withStyles(userProfileStyles)(
  connect()(Form.create()(LoginPage))
);
