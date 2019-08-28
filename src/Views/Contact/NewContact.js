import { Drawer, Form, Button, Col, Row, Input, message, Icon } from "antd";
import React from "react";
import axios from "axios";
import PhoneInput from "react-phone-number-input/basic-input";

const ButtonGroup = Button.Group;

class NewContact extends React.Component {
  state = {
    loading: false,
    visible: false,
    client_id: "",
    work_phone: "",
    mobile_phone: ""
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

  onCreate = () => {
    let headersConfig = {
      Authorization: "Bearer " + sessionStorage.getItem("credentials")
    };
    const requestBody = {
      first_name: this.first_name.state.value,
      last_name: this.last_name.state.value,
      middle_name: this.middle_name.state.value,
      email: this.email.state.value,
      work_phone: this.state.work_phone,
      mobile_phone: this.state.mobile_phone,
      position: this.position.state.value,
      customer_id: this.props.ParentId
    };
    axios({
      method: "post",
      url: sessionStorage.getItem("b_url") + "contacts",
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
            <Icon type="plus-circle" /> Новый контакт
          </Button>
          <Button onClick={() => this.props.refreshClientComponent()}>
            <Icon type="reload" />
          </Button>
        </ButtonGroup>
        <Drawer
          title="Создание нового контакта"
          width={700}
          height={200}
          onClose={this.onClose}
          visible={this.state.visible}
        >
          <Form layout="vertical" hideRequiredMark>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item label="Фамилия">
                  <Input
                    placeholder="Введите Фамилию"
                    ref={Input => {
                      this.last_name = Input;
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Имя">
                  <Input
                    placeholder="Введите Имя"
                    ref={Input => {
                      this.first_name = Input;
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Отчество">
                  <Input
                    placeholder="Введите Отчество"
                    ref={Input => {
                      this.middle_name = Input;
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item label="Рабочий телефон">
                  <PhoneInput
                    country="KZ"
                    placeholder="Введите рабочий телефон"
                    value={this.state.work_phone}
                    onChange={val => this.setState({ work_phone: val })}
                    class="ant-input"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Мобильный телефон">
                  <PhoneInput
                    country="KZ"
                    placeholder="Введите мобильный телефон"
                    value={this.state.mobile_phone}
                    onChange={val => this.setState({ mobile_phone: val })}
                    class="ant-input"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Email">
                  <Input
                    placeholder="Введите Email"
                    ref={Input => {
                      this.email = Input;
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Должность">
                  <Input
                    placeholder="Введите Должность"
                    ref={Input => {
                      this.position = Input;
                    }}
                  />
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
            <Button onClick={this.onCreate} type="primary">
              Создать
            </Button>
          </div>
        </Drawer>
      </div>
    );
  }
}

export default Form.create()(NewContact);
