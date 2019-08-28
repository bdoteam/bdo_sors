import { Drawer, Form, Button, Col, Row, Select, message, Icon } from "antd";
import React from "react";
import axios from "axios";

const Option = Select.Option;
const ButtonGroup = Button.Group;
class NewGroup extends React.Component {
  state = {
    visible: false,
    group_val: "",
    group_type_list: [],
    parent_group_val: ""
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
    axios
      .get(
        sessionStorage.getItem("b_url") +
          "list_of_val?mode=1&Active=true&type='USER_GROUP'",
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("credentials")
          }
        }
      )
      .then(res => {
        this.setState({ group_type_list: res.data });
      })
      .catch(res => {});
  }
  onCreate = () => {
    let ParentId =
      this.state.parent_group_val === undefined
        ? 0
        : this.state.parent_group_val;
    this.setState({ loading: true });

    let headersConfig = {
      Authorization: "Bearer " + sessionStorage.getItem("credentials")
    };
    const requestBody = {
      name: this.state.group_val,
      parent_id: ParentId
    };
    axios({
      method: "post",
      url: sessionStorage.getItem("b_url") + "users_group",
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
        //message.error(err.message)
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
          <Button
            style={{ "background-color": "#00474f", "border-color": "#002329" }}
            type="primary"
            onClick={this.showDrawer}
          >
            <Icon type="usergroup-add" /> Создать группу
          </Button>
          <Button onClick={() => this.props.refreshClientComponent()}>
            <Icon type="reload" />
          </Button>
        </ButtonGroup>
        <Drawer
          title="Создание новой группы"
          width={720}
          onClose={this.onClose}
          visible={this.state.visible}
        >
          <Form layout="vertical" hideRequiredMark>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Группа">
                  <Select
                    defaultValue=""
                    onChange={val => this.setState({ group_val: val })}
                  >
                    {this.state.group_type_list.map(gr => (
                      <Option key={gr.id} value={gr.code}>
                        {gr.value}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Род. группа">
                  <Select
                    allowClear={true}
                    defaultValue=""
                    onChange={val => this.setState({ parent_group_val: val })}
                  >
                    <Option key={0} value={0}>
                      {"< Не выбрано >"}
                    </Option>
                    {this.state.group_type_list.map(gr => (
                      <Option key={gr.id} value={gr.code}>
                        {gr.value}
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

export default Form.create()(NewGroup);
