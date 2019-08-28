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
import view_comp from "../../../../components/Access/ViewComp";
import view_mode from "../../../../components/Access/ViewMode";

const Option = Select.Option;
const ButtonGroup = Button.Group;
class NewAccess extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      mode_val: "",
      comp_val: ""
    };
  }

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
      component: this.state.comp_val,
      mode: this.state.mode_val,
      group_id: this.props.ParentId
    };
    axios({
      method: "post",
      url: sessionStorage.getItem("b_url") + "group_access",
      data: requestBody,
      headers: headersConfig
    })
      .then(res => {
        if (res.data.detailed_message !== "") {
          this.props.refreshClientComponent(this.props.ParentId);
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
          <Button
            style={{ "background-color": "#00474f", "border-color": "#002329" }}
            type="primary"
            onClick={this.showDrawer}
          >
            <Icon type="safety-certificate" /> Добавить
          </Button>
          <Button
            onClick={() =>
              this.props.refreshClientComponent(this.props.ParentId)
            }
          >
            <Icon type="reload" />
          </Button>
        </ButtonGroup>
        <Drawer
          title="Добавление доступа по компонентам"
          width={720}
          onClose={this.onClose}
          visible={this.state.visible}
        >
          <Form layout="vertical" hideRequiredMark>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Компонент">
                  <Select
                    defaultValue=""
                    onChange={val => this.setState({ comp_val: val })}
                  >
                    {view_comp.map(user => (
                      <Option key={user.id} value={user.id}>
                        {user.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Режим">
                  <Select
                    defaultValue=""
                    onChange={val => this.setState({ mode_val: val })}
                  >
                    {view_mode.map(user => (
                      <Option key={user.id} value={user.id}>
                        {user.name}
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

export default Form.create()(NewAccess);
