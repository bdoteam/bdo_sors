import {
  Drawer,
  Form,
  Button,
  Col,
  Row,
  Input,
  Select,
  message,
  Icon,
  Checkbox
} from "antd";
import React from "react";
import axios from "axios";
import { connect } from "react-redux";
import localize from "../../components/Localization/index";
//функция для локализаций
const localName = name => {
  let result = name;
  let lang = sessionStorage.getItem("lang");
  {
    localize.map(comp =>
      name === comp.name && lang === comp.lang ? (result = comp.val) : comp.name
    );
  }
  return result;
};

const ButtonGroup = Button.Group;

const Option = Select;

class NewTodo extends React.Component {
  state = {
    loading: false,
    visible: false,
    client_list: [],
    parent_val: [],
    parent_id: "",
    client_id: "",
    notice_resp_list: [],
    desc: "",
    type_val: "",
    subtype_val: "",
    client_visible: false,
    todo_type_list: [],
    todo_subtype_list: []
  };
  clientOnChange = val => {
    this.setState({ client_id: val });
  };

  //Отправляем уведомление ответственным менеджерам
  sendNoticeRespList(cust_id, action_id, group_name) {
    let err_message = "";
    let err_code = 0;
    axios
      .get(
        sessionStorage.getItem("b_url") +
          "notice_resp?" +
          "group_name=" +
          group_name +
          cust_id,
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("credentials")
          }
        }
      )
      .then(res => {
        this.setState({ notice_resp_list: res.data });
        //в notice_resp_list список менеджеров клиента
        let headersConfig = {
          Authorization: "Bearer " + sessionStorage.getItem("credentials")
        };
        this.state.notice_resp_list.map(resp =>
          axios({
            method: "post",
            url: sessionStorage.getItem("b_url") + "notice",
            data: {
              type: "notification",
              status: "new",
              description: this.shortname.state.value,
              title: "На вас назначена задача",
              action_id: action_id,
              notice_for: resp.login
            },
            headers: headersConfig
          })
            .then(res => {
              if (err_message === "") {
                err_message = res.data.detailed_message;
                err_code = res.data.error_code;
                err_code == 0
                  ? message.success(localName(err_message))
                  : message.error(localName(err_message));
              }
            })
            .catch(res => {
              if (res.response.data.error_code === 401) {
                message.error(localName(res.response.data.message));
              }
            })
        );
      })
      .catch(res => {
        if (res.response.data.error_code === 401) {
          message.error(localName(res.response.data.message));
        }
      });
  }

  componentDidMount() {
    this.setState({ loading: true });
    axios
      .get(sessionStorage.getItem("b_url") + "customer?status=Active", {
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
          message.error(localName(res.response.data.message));
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
    axios
      .get(sessionStorage.getItem("b_url") + "parent_actions?status=Done", {
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
          message.error(localName(res.response.data.message));
        }
      });
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
        var ParentId =
          this.props.ParentId == undefined
            ? this.state.client_id
            : this.props.ParentId;

        let headersConfig = {
          Authorization: "Bearer " + sessionStorage.getItem("credentials")
        };
        const requestBody = {
          shortname: this.shortname.state.value,
          type: this.state.type_val,
          status: "New",
          priority: this.priority.state.value,
          description: this.state.desc,
          subtype: subtype,
          customer_id: ParentId,
          visible: this.state.client_visible,
          parent_id: this.state.parent_id
        };
        axios({
          method: "post",
          url: sessionStorage.getItem("b_url") + "actions",
          data: requestBody,
          headers: headersConfig
        })
          .then(res => {
            if (res.data.detailed_message !== "") {
              this.props.refreshClientComponent();
              res.data.error_code == 0
                ? message.success(localName(res.data.detailed_message))
                : message.error(localName(res.data.detailed_message));
              if (
                res.data.action_id != null &&
                (this.props.user_group === "Client" ||
                  this.props.user_group === "Manager")
              ) {
                this.sendNoticeRespList(
                  "&customer_id=" + ParentId,
                  res.data.action_id,
                  this.props.user_group === "Client" ? "Manager" : "Client"
                );
              }
            }
          })
          .catch(res => {
            this.setState({ loading: false });
            if (res.response.data.error_code === 401) {
              message.error(localName(res.response.data.message));
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
      rules: [{ required: true, message: localName("Заполните поле!") }]
    };
    return (
      <div>
        <ButtonGroup>
          <Button
            disabled={this.props.action === "read_m" ? true : false}
            type="primary"
            onClick={this.showDrawer}
          >
            <Icon type="plus-circle" /> {localName("Новая задача")}
          </Button>
          <Button onClick={() => this.props.refreshClientComponent()}>
            <Icon type="reload" />
          </Button>
        </ButtonGroup>
        <Drawer
          title={localName("Создание новой задачи")}
          width={720}
          onClose={this.onClose}
          visible={this.state.visible}
        >
          <Form>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label={localName("Наименование задачи")}>
                  {getFieldDecorator("shortname", config)(
                    <Input
                      placeholder={localName("Введите наименование задачи")}
                      ref={Input => {
                        this.shortname = Input;
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={localName("Приоритет")}>
                  {getFieldDecorator("priority", config)(
                    <Input
                      placeholder={localName("Введите Приоритет")}
                      ref={Input => {
                        this.priority = Input;
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label={localName("Тип задачи")}>
                  {getFieldDecorator("todotype", config)(
                    <Select onChange={val => this.setState({ type_val: val })}>
                      {this.state.todo_type_list.map(gr => (
                        <Option key={gr.code} value={gr.code}>
                          {gr.value}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={localName("Клиент")}>
                  <Select
                    disabled={this.props.ParentId == undefined ? false : true}
                    defaultValue={
                      this.props.ParentId == undefined
                        ? ""
                        : Number(this.props.ParentId)
                    }
                    onChange={this.clientOnChange}
                  >
                    {this.state.client_list.map(client => (
                      <Option key={client.id} value={client.id}>
                        {client.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            {this.props.user_group != "Client" ? (
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item label={localName("Подтип задачи")}>
                    {getFieldDecorator("subtype", config)(
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
                    )}
                  </Form.Item>
                </Col>
              </Row>
            ) : null}
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label={localName("Исходная задача")}>
                  <Select
                    allowClear={true}
                    defaultValue=""
                    onChange={val => this.setState({ parent_id: val })}
                  >
                    {this.state.parent_val.map(gr =>
                      gr.customer_id ===
                      (this.props.ParentId === undefined
                        ? this.state.client_id
                        : Number(this.props.ParentId)) ? (
                        <Option key={gr.id} value={gr.id}>
                          {gr.id}
                          <div class="ant-card-meta-description">
                            {gr.type_val}
                          </div>
                        </Option>
                      ) : null
                    )}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label={localName("Описание")}>
                  <Input.TextArea
                    rows={4}
                    placeholder={localName("Введите описание")}
                    onChange={e => this.setState({ desc: e.target.value })}
                  />
                </Form.Item>
              </Col>
            </Row>
            {this.props.user_group === "Manager" ||
            this.props.user_group === "Admin" ? (
              <Row gutter={16}>
                <Col span={12}>
                  <Checkbox
                    onChange={e =>
                      this.setState({ client_visible: e.target.checked })
                    }
                  >
                    {localName("Не показывать клиенту")}
                  </Checkbox>
                </Col>
              </Row>
            ) : null}
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
                {localName("Отменить")}
              </Button>
              <Button onClick={this.onCreate} type="primary" htmlType="submit">
                {localName("Создать")}
              </Button>
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
export default connect(mapStateToProps)(Form.create()(NewTodo));
