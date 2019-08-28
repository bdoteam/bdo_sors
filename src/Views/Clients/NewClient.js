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
import PhoneInput from "react-phone-number-input/basic-input";
import React from "react";
import axios from "axios";
import { connect } from "react-redux";
import client_type from "../../components/ClientType";

const ButtonGroup = Button.Group;
const { Option, OptGroup } = Select;

class NewClient extends React.Component {
  state = {
    visible: false,
    type_val: ""
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
    this.props.form.validateFields(err => {
      if (err) {
        return;
      } else {
        let headersConfig = {
          Authorization: "Bearer " + sessionStorage.getItem("credentials")
        };
        const requestBody = {
          name: this.clientName.state.value,
          bin: this.bin.state.value,
          status: "Активный",
          con_phone: this.state.con_phone,
          type: this.state.type_val
        };
        axios({
          method: "post",
          url: sessionStorage.getItem("b_url") + "customer",
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
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const config = {
      rules: [{ required: true, message: "Заполните поле!" }]
    };
    return (
      <div>
        <ButtonGroup>
          <Button
            disabled={this.props.client === "read_m" ? true : false}
            type="primary"
            onClick={this.showDrawer}
          >
            <Icon type="plus-circle" /> Создать клиента
          </Button>
          <Button onClick={() => this.props.refreshClientComponent()}>
            <Icon type="reload" />
          </Button>
        </ButtonGroup>
        <Drawer
          title="Создание нового клиента"
          width={720}
          onClose={this.onClose}
          visible={this.state.visible}
        >
          <Form>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Название клиента">
                  {getFieldDecorator("clientName", config)(
                    <Input
                      placeholder="Введите название клиента"
                      ref={Input => {
                        this.clientName = Input;
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="БИН">
                  {getFieldDecorator("bin", config)(
                    <Input
                      placeholder="Введите БИН"
                      ref={Input => {
                        this.bin = Input;
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Тип клиента">
                  {getFieldDecorator("clienttype", config)(
                    <Select onChange={val => this.setState({ type_val: val })}>
                      {client_type.map(digest => (
                        <Option key={digest.id} value={digest.id}>
                          {digest.name}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Контактный телефон">
                  <PhoneInput
                    country="KZ"
                    placeholder="Введите контактный телефон"
                    value={this.state.con_phone}
                    onChange={val => this.setState({ con_phone: val })}
                    className="ant-input"
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
            <Button onClick={() => this.onCreate()} type="primary">
              Создать
            </Button>
          </div>
        </Drawer>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    client: state.client
  };
};
export default connect(mapStateToProps)(Form.create()(NewClient));
