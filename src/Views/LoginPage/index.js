import {
  Drawer,
  Form,
  Button,
  Input,
  Select,
  message,
  Icon,
  Card,
  Col,
  Row
} from "antd";
import React, { Component } from "react";
import axios from "axios";
import view_comp from "../../components/Access/ViewComp";
import { connect } from "react-redux";
import GoogleSvg from "../../components/svg/GoogleSVG";
const Option = Select;
const b_url = "http://ss6.dyndns.org:8889/"; 
//const b_url = "http://192.168.11.204:8889/"; //local
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
    loading: false
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
    this.props.form.validateFields(err => {
      if (err) {
        return;
      } else {
        this.setState({ loading: true });
        try {
          const requestBody = {
            username: this.username.state.value,
            password: this.password.state.value
          };

          axios({
            method: "post",
            url: sessionStorage.getItem("b_url") + "authorization",
            data: requestBody
          }).then(res => {
            if (res.data.token !== "") {
              this.setState({ loading: false });
              sessionStorage.setItem("credentials", res.data.token);
              res.data.error_code == 0
                ? this.redirect(res.data, null, "Basic")
                : message.error(res.data.detailed_message);
            }
          });
        } catch (err) {
          this.setState({ loading: false });
          message.error("Ошибка авторизаций: " + err.message);
        }
      }
    });
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
    const { getFieldDecorator } = this.props.form;
    const GoogleIcon = props => <Icon component={GoogleSvg} {...props} />;
    return (
      <div className="App">
        <header className="App-header">
          <Card
            style={{
              width: 300
            }}
            cover={
              <img
                alt="example"
                src="https://cdn.discordapp.com/attachments/548461175306846228/573484219318403082/BDO-logo.jpg"
              />
            }
          >
            <Form className="login-form">
              <Form.Item>
                {getFieldDecorator("username", {
                  rules: [{ required: true, message: "Введите ваш Email!" }]
                })(
                  <Input
                    prefix={
                      <Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />
                    }
                    placeholder="Email"
                    ref={Input => {
                      this.username = Input;
                    }}
                  />
                )}
              </Form.Item>
              <Form.Item>
                {getFieldDecorator("password", {
                  rules: [{ required: true, message: "Введите ваш пароль!" }]
                })(
                  <Input
                    prefix={
                      <Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />
                    }
                    type="password"
                    placeholder="Пароль"
                    ref={Input => {
                      this.password = Input;
                    }}
                  />
                )}
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="login-form-button"
                  onClick={this.signIn}
                  loading={this.state.loading}
                >
                  Войти
                </Button>
              </Form.Item>

              <Form.Item>
                <Col span={1}>
                  <Button
                    title="Войти с Google аккаунтом"
                    type="dashed"
                    shape="circle"
                    onClick={this.g_signIn}
                  >
                    <GoogleIcon style={{ fontSize: "20px" }} />
                  </Button>
                </Col>
              </Form.Item>
            </Form>
          </Card>
        </header>
      </div>
    );
  }
}
const mapStateToProps = state => {
  return {
    avatar: state.avatar,
    action: state.action,
    client: state.client,
    admin: state.admin
  };
};
export default connect(mapStateToProps)(Form.create()(LoginPage));
