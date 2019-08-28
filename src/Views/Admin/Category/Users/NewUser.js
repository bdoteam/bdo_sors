import {
  Drawer,
  Form,
  Button,
  Col,
  Row,
  Input,
  Select,
  message,
  Icon
} from "antd";
import React from "react";
import axios from "axios";

const Option = Select.Option;
const ButtonGroup = Button.Group;
class NewUser extends React.Component {
  state = {
    visible: false,
    group_list: [],
    position_type: [],
    group_val: "",
    position: ""
  };
  compName = (state, lic) => {
    let result = lic;
    {
      state.map(comp => (lic === comp.id ? (result = comp.name) : comp.id));
    }
    return result;
  };

  showDrawer = () => {
    this.setState({
      visible: true
    });
  };

  onClose = () => {
    this.setState({
      visible: false
    });
  };
  componentDidMount() {
    //Закгрузка справочника по полю Должность
    axios
      .get(
        sessionStorage.getItem("b_url") +
          "list_of_val?mode=1&active=true&type='POSITION'",
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("credentials")
          }
        }
      )
      .then(res => {
        this.setState({ position_type: res.data });
        this.setState({ loading: false });
      })
      .catch(res => {
        this.setState({ loading: false });
        if (res.response.data.error_code === 401) {
          message.error(res.response.data.message);
        }
      });
    axios
      .get(sessionStorage.getItem("b_url") + "users_group", {
        headers: {
          Authorization: "Bearer " + sessionStorage.getItem("credentials")
        }
      })
      .then(res => {
        this.setState({ group_list: res.data });
      })
      .catch(res => {});
  }
  onCreate = () => {
    let headersConfig = {
      Authorization: "Bearer " + sessionStorage.getItem("credentials")
    };
    const requestBody = {
      login: this.login.state.value,
      password: this.password.state.value,
      email: this.email.state.value,
      group_id: this.state.group_val,
      position: this.state.position
    };
    axios({
      method: "post",
      url: sessionStorage.getItem("b_url") + "users",
      data: requestBody,
      headers: headersConfig
    })
      .then(res => {
        if (res.data.detailed_message !== "") {
          this.props.refreshClientComponent();
          res.data.error_code == 0
            ? message.success(res.data.detailed_message)
            : message.error(res.data.detailed_message);
        }
      })
      .catch(res => {
        this.setState({ loading: false });
        if (res.response.data.error_code === 401) {
          message.error(res.response.data.message);
        }
      });
    this.setState({
      visible: false
    });
  };
  render() {
    return (
      <div>
        <ButtonGroup>
          <Button type="primary" onClick={this.showDrawer}>
            <Icon type="google" /> Создать пользователя
          </Button>
          <Button onClick={() => this.props.refreshClientComponent()}>
            <Icon type="reload" />
          </Button>
        </ButtonGroup>
        <Drawer
          title="Создание нового пользователя"
          width={720}
          onClose={this.onClose}
          visible={this.state.visible}
        >
          <Form layout="vertical" hideRequiredMark>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Логин пользователя">
                  <Input
                    prefix={
                      <Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />
                    }
                    placeholder="Логин"
                    ref={Input => {
                      this.login = Input;
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Пароль">
                  <Input
                    allowClear={true}
                    prefix={
                      <Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />
                    }
                    type="password"
                    placeholder="Пароль"
                    ref={Input => {
                      this.password = Input;
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Почта">
                  <Input
                    placeholder="Введите почту"
                    ref={Input => {
                      this.email = Input;
                    }}
                  />
                </Form.Item>
                <Form.Item label="Должность">
                  <Select
                    defaultValue=""
                    onChange={val => this.setState({ position: val })}
                  >
                    {this.state.position_type.map(gr => (
                      <Option key={gr.code} value={gr.code}>
                        {gr.value}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Группа пользователя">
                  <Select
                    defaultValue=""
                    onChange={val => this.setState({ group_val: val })}
                  >
                    {this.state.group_list.map(gr => (
                      <Option key={gr.id} value={gr.id}>
                        {gr.group_val}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <div
            style={{
              position: "absolute",
              left: 0,
              bottom: 0,
              width: "100%",
              borderTop: "1px solid #e9e9e9",
              padding: "10px 16px",
              background: "#fff",
              textAlign: "right"
            }}
          >
            <Button onClick={this.onClose} style={{ marginRight: 8 }}>
              Отменить
            </Button>
            <Button onClick={() => this.onCreate()} type="primary">
              Создать
            </Button>
          </div>
        </Drawer>
      </div>
    );
  }
}

export default Form.create()(NewUser);
