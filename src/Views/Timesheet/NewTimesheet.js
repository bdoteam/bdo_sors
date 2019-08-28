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
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/styles";
import ButtonM from "@material-ui/core/Button";
import PropTypes from "prop-types";
const ButtonGroup = Button.Group;

const Option = Select;
const useStyles = makeStyles({
  root: {
    background: props =>
      props.color === "red"
        ? "linear-gradient(45deg, #FE6B8B 40%, #FF8E53 90%)"
        : props.color === "white"
        ? "linear-gradient(45deg, #2196F3 0%, #21CBF3 20%)"
        : "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
    border: 0,
    borderRadius: 3,
    boxShadow: props =>
      props.color === "red"
        ? "0 3px 5px 2px rgba(255, 105, 135, .3)"
        : "0 3px 5px 2px rgba(33, 203, 243, .3)",
    color: "white",
    height: 32,
    padding: "0 30px",
    margin: 1
  }
});
function MButton(props) {
  const { color, ...other } = props;
  const classes = useStyles(props);
  return <ButtonM className={classes.root} {...other} />;
}

MButton.propTypes = {
  color: PropTypes.oneOf(["blue", "red"]).isRequired
};
class NewTimesheet extends React.Component {
  state = {
    loading: false,
    visible: false,
    client_list: [],
    client_id: "",
    desc: "",
    type_val: "",
    subtype_val: "",
    todo_type_list: [],
    todo_subtype_list: []
  };
  clientOnChange = val => {
    this.setState({ client_id: val });
  };

  componentDidMount() {
    this.setState({ loading: true });
    axios
      .get(sessionStorage.getItem("b_url") + "customer?status=Активный", {
        headers: {
          Authorization: "Bearer " + sessionStorage.getItem("credentials")
        }
      })
      .then(res => {
        this.setState({ client_list: res.data });
        this.setState({ loading: false });
      })
      .catch(res => {
        this.setState({ loading: false });
        if (res.response.data.error_code === 401) {
          message.error(res.response.data.message);
        }
      });
    //Загрузка справочников
    axios
      .get(
        sessionStorage.getItem("b_url") +
          "list_of_val?mode=1&Active=true&type='TODO_TYPE'",
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("credentials")
          }
        }
      )
      .then(res => {
        this.setState({ todo_type_list: res.data });
      })
      .catch(res => {});
    axios
      .get(
        sessionStorage.getItem("b_url") +
          "list_of_val?mode=1&Active=true&type='TODO_SUB_TYPE'",
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("credentials")
          }
        }
      )
      .then(res => {
        this.setState({ todo_subtype_list: res.data });
      })
      .catch(res => {});
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
    this.props.form.validateFields(err => {
      if (err) {
        return;
      } else {
        var subtype =
          this.state.subtype_val === "" ? "" : this.state.subtype_val;

        let headersConfig = {
          Authorization: "Bearer " + sessionStorage.getItem("credentials")
        };
        const requestBody = {
          type: this.state.type_val,
          lead_time: this.lead_time.state.value,
          comment: this.state.desc,
          subtype: subtype,
          customer_id: this.state.client_id
        };
        axios({
          method: "post",
          url: sessionStorage.getItem("b_url") + "timesheet",
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
          <MButton
            color="blue"
            disabled={this.props.action === "read_m" ? true : false}
            onClick={this.showDrawer}
          >
            Создать
          </MButton>
          <MButton
            color="white"
            onClick={() => this.props.refreshClientComponent()}
          >
            <Icon type="reload" />
          </MButton>
        </ButtonGroup>
        <Drawer
          title="Создание табеля"
          width={720}
          onClose={this.onClose}
          visible={this.state.visible}
        >
          <Form>
            <Row gutter={16} />
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Тип задачи">
                  <Select onChange={val => this.setState({ type_val: val })}>
                    {this.state.todo_type_list.map(gr => (
                      <Option key={gr.code} value={gr.code}>
                        {gr.value}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Клиент">
                  {getFieldDecorator("client", config)(
                    <Select onChange={this.clientOnChange}>
                      {this.state.client_list.map(client => (
                        <Option key={client.id} value={client.id}>
                          {client.name}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            {this.props.user_group != "Client" ? (
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item label="Подтип задачи">
                    <Select
                      onChange={val => this.setState({ subtype_val: val })}
                    >
                      {this.state.todo_subtype_list.map(gr =>
                        this.state.type_val === gr.parent_code ? (
                          <Option key={gr.code} value={gr.code}>
                            {gr.value}
                          </Option>
                        ) : null
                      )}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            ) : null}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Кол-во времени, мин">
                  {getFieldDecorator("lead_time", config)(
                    <Input
                      placeholder="Введите Кол-во времени в минутах"
                      ref={Input => {
                        this.lead_time = Input;
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label="Комментарий">
                  <Input.TextArea
                    rows={4}
                    placeholder="Введите комментарий"
                    onChange={e => this.setState({ desc: e.target.value })}
                  />
                </Form.Item>
              </Col>
            </Row>
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
              <MButton
                onClick={this.onClose}
                style={{ marginRight: 8 }}
                color="red"
              >
                Отменить
              </MButton>

              <MButton onClick={this.onCreate} htmlType="submit" color="blue">
                Создать
              </MButton>
            </div>
          </Form>
        </Drawer>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    action: state.action,
    user_group: state.user_group
  };
};
export default connect(mapStateToProps)(Form.create()(NewTimesheet));
