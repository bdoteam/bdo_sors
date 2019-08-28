import {
  Drawer,
  Form,
  Button,
  Col,
  Row,
  Input,
  message,
  Icon,
  Select
} from "antd";
import React from "react";
import axios from "axios";
import { SwatchesPicker } from "react-color";
import "rc-color-picker/assets/index.css";

const Option = Select.Option;
const ButtonGroup = Button.Group;

class NewReference extends React.Component {
  state = {
    loading: false,
    visible: false,
    parent_val: [],
    parent_id: "",
    color: null
  };
  colorPick = color => {
    this.setState({ color: color.hex === "#ffffff" ? null : color.hex });
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
  componentWillReceiveProps(nextProps) {
    axios
      .get(sessionStorage.getItem("b_url") + "list_of_val?mode=1&active=true", {
        headers: {
          Authorization: "Bearer " + sessionStorage.getItem("credentials")
        }
      })
      .then(res => {
        this.setState({ parent_val: res.data });
        this.setState({ loading: false });
      })
      .catch(res => {
        this.setState({ loading: false });
        if (res.response.data.error_code === 401) {
          message.error(res.response.data.message);
        }
      });
  }
  onCreate = () => {
    let headersConfig = {
      Authorization: "Bearer " + sessionStorage.getItem("credentials")
    };
    const requestBody = {
      type: this.type.state.value,
      value: this.val.state.value,
      parent_id: this.state.parent_id,
      code: this.code.state.value,
      color: this.state.color,
      active: true
    };
    axios({
      method: "post",
      url: sessionStorage.getItem("b_url") + "list_of_val",
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
            <Icon type="plus-circle" /> Создать справочник
          </Button>
          <Button onClick={() => this.props.refreshClientComponent()}>
            <Icon type="reload" />
          </Button>
        </ButtonGroup>
        <Drawer
          title="Создание нового справочника"
          width={700}
          height={400}
          onClose={this.onClose}
          visible={this.state.visible}
        >
          <Form layout="vertical" hideRequiredMark>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Тип">
                  <Input
                    placeholder="Введите Тип"
                    ref={Input => {
                      this.type = Input;
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Код">
                  <Input
                    placeholder="Введите Код"
                    ref={Input => {
                      this.code = Input;
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label="Значение">
                  <Input
                    placeholder="Введите Значение"
                    ref={Input => {
                      this.val = Input;
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label="Родит. значение">
                  <Select
                    allowClear={true}
                    defaultValue=""
                    onChange={val => this.setState({ parent_id: val })}
                  >
                    {this.state.parent_val.map(gr => (
                      <Option key={gr.id} value={gr.id}>
                        {gr.value}{" "}
                        <div class="ant-card-meta-description">{gr.type}</div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label="Цвет">
                  <SwatchesPicker
                    color={
                      this.state.color === null ? "gray" : this.state.color
                    }
                    onChangeComplete={this.colorPick}
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

export default Form.create()(NewReference);
