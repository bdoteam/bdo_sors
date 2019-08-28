import {
  Table,
  Popconfirm,
  message,
  Modal,
  Button,
  Input,
  Select,
  Icon,
  BackTop,
  Tag,
  Form,
  Row,
  Col,
  Card
} from "antd";
import React, { Component } from "react";
import axios from "axios";
import NewUser from "./NewUser";
import "antd/dist/antd.css";
import UsersCategory from "./UsersCategory";

const Option = Select.Option;
const ButtonGroup = Button.Group;
const { Meta } = Card;

class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data_res: [],
      position_type: [],
      update_data: [
        {
          id: "",
          login: "",
          password: "",
          position: "",
          email: "",
          group: ""
        }
      ],
      editingKey: "",
      chModal: false,
      avatar:
        "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
      fstName: "",
      lstName: "",
      user_id: "",
      group_list: []
    };
    this.columns = [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        sorter: (a, b) => b.id - a.id,
        sortDirections: ["descend"],
        sortOrder: true
      },
      {
        title: "Логин",
        dataIndex: "login",
        key: "login"
      },
      {
        title: "Почта",
        dataIndex: "email",
        key: "email"
      },
      {
        title: "Должность",
        dataIndex: "position",
        key: "position",
        render: (text, record) => (
          <span>
            <Tag color={record.pos_color}>{record.pos_name}</Tag>
          </span>
        )
      },

      {
        title: "Группа пользователя",
        dataIndex: "group_name",
        key: "group_name",
        render: (text, record) => (
          <span>
            <Tag color={record.group_color} key={record.id}>
              {record.group_val}
            </Tag>
            {record.login === "ilyas" ? (
              <Tag color={"#0050b3"} key={record.id}>
                {"DEV"}
              </Tag>
            ) : record.group_name === "Admin" ? (
              <Icon type="setting" />
            ) : (
              <Icon type="user" />
            )}
          </span>
        )
      },
      {
        title: "Действия",
        dataIndex: "operation",
        render: (text, record) =>
          this.state.data_res.length >= 1 ? (
            <div>
              <ButtonGroup>
                <Button shape="circle" onClick={() => this.changeShow(record)}>
                  <Icon type="edit" theme="twoTone" />
                </Button>
                <Modal
                  style={{ height: 100 }}
                  title="Изменить Пользователя"
                  visible={this.state.chModal}
                  onOk={() => this.handleUpdate(this.state.update_data[0])}
                  onCancel={this.changeHide}
                  okText="Изменить"
                  cancelText="Отменить"
                >
                  <Form layout="vertical" hideRequiredMark>
                    <Row gutter={1}>
                      <Col span={24}>
                        <Form.Item label="Логин">
                          {
                            <Input
                              disabled={true}
                              prefix={
                                <Icon
                                  type="user"
                                  style={{ color: "rgba(0,0,0,.25)" }}
                                />
                              }
                              placeholder="Логин"
                              defaultValue={this.state.update_data[0].login}
                              value={this.state.update_data[0].login}
                              onChange={evt =>
                                this.handleChange(
                                  evt,
                                  this.state.update_data[0],
                                  "login"
                                )
                              }
                            />
                          }
                        </Form.Item>
                        <Form.Item label="Пароль">
                          <Input
                            allowClear={true}
                            prefix={
                              <Icon
                                type="lock"
                                style={{ color: "rgba(0,0,0,.25)" }}
                              />
                            }
                            type="password"
                            placeholder="Пароль"
                            defaultValue={this.state.update_data[0].password}
                            value={this.state.update_data[0].password}
                            onChange={evt =>
                              this.handleChange(
                                evt,
                                this.state.update_data[0],
                                "password"
                              )
                            }
                          />
                        </Form.Item>

                        <Form.Item label="Почта">
                          {
                            <Input
                              prefix={
                                <Icon
                                  type="mail"
                                  style={{ color: "rgba(0,0,0,.25)" }}
                                />
                              }
                              placeholder="Почта"
                              allowClear={true}
                              defaultValue={this.state.update_data[0].email}
                              value={this.state.update_data[0].email}
                              onChange={evt =>
                                this.handleChange(
                                  evt,
                                  this.state.update_data[0],
                                  "email"
                                )
                              }
                            />
                          }
                        </Form.Item>
                        <Form.Item label="Должность">
                          {
                            <Select
                              defaultValue={this.state.update_data[0].position}
                              value={this.state.update_data[0].position}
                              onChange={val =>
                                this.handleChange(
                                  val,
                                  this.state.update_data[0],
                                  "position"
                                )
                              }
                            >
                              {this.state.position_type.map(gr => (
                                <Option key={gr.code} value={gr.code}>
                                  {gr.value}
                                </Option>
                              ))}
                            </Select>
                          }
                        </Form.Item>
                        <Form.Item label="Группа пользователя">
                          {
                            <Select
                              defaultValue={this.state.update_data[0].group}
                              value={this.state.update_data[0].group}
                              onChange={val =>
                                this.handleChange(
                                  val,
                                  this.state.update_data[0],
                                  "group"
                                )
                              }
                            >
                              {this.state.group_list.map(gr => (
                                <Option key={gr.id} value={gr.id}>
                                  {gr.group_val}
                                </Option>
                              ))}
                            </Select>
                          }
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </Modal>
                <Popconfirm
                  placement="topLeft"
                  title="Удалить пользователя?"
                  onConfirm={() => this.handleDelete(record)}
                  okText="Да"
                  cancelText="Нет"
                >
                  <Button type="danger" shape="circle">
                    <Icon type="delete" />
                  </Button>
                </Popconfirm>
              </ButtonGroup>
            </div>
          ) : null
      }
    ];
  }
  handleChange = (evt, updRecord, field) => {
    var data = [];
    let login = updRecord.login;
    let password = updRecord.password;
    let email = updRecord.email;
    let group = updRecord.group;
    let position = updRecord.position;

    if (field === "login") {
      login = evt.target.value;
    }
    if (field === "password") {
      password = evt.target.value;
    }
    if (field === "email") {
      email = evt.target.value;
    }
    if (field === "group") {
      group = evt;
    }
    if (field === "position") {
      position = evt;
    }
    data.push({
      id: updRecord.id,
      login: login,
      password: password,
      email: email,
      group: group,
      position: position
    });
    this.setState({
      update_data: data
    });
  };
  handleDelete = record => {
    //message.info("Clicked on Yes.");
    this.setState({ loading: true });
    axios
      .delete(sessionStorage.getItem("b_url") + "users?id=" + record.id, {
        headers: {
          Authorization: "Bearer " + sessionStorage.getItem("credentials")
        }
      })
      .then(res => {
        this.refresh();
        this.setState({ loading: false });
        if (res.data.detailed_message !== "") {
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
  };
  handleUpdate = updRecord => {
    this.setState({ loading: true });
    let headersConfig = {
      Authorization: "Bearer " + sessionStorage.getItem("credentials")
    };
    const requestBody = {
      id: updRecord.id,
      login: updRecord.login,
      password: updRecord.password,
      email: updRecord.email,
      group_id: updRecord.group,
      position: updRecord.position
    };
    axios({
      method: "post",
      url: sessionStorage.getItem("b_url") + "users",
      data: requestBody,
      headers: headersConfig
    })
      .then(res => {
        this.componentDidMount();
        this.setState({ loading: false, chModal: false });
        if (res.data.detailed_message !== "") {
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
  };

  changeShow = record => {
    var data = [];
    data.push({
      id: record.id,
      login: record.login,
      password: record.password,
      email: record.email,
      group: record.group_id,
      position: record.position
    });
    this.setState({
      chModal: true,
      update_data: data
    });
  };
  changeHide = () => {
    this.setState({
      chModal: false
    });
  };
  refresh = () => {
    this.setState({ loading: true });
    axios
      .get(sessionStorage.getItem("b_url") + "users", {
        headers: {
          Authorization: "Bearer " + sessionStorage.getItem("credentials")
        }
      })
      .then(res => {
        this.setState({ data_res: res.data });
        this.setState({ loading: false });
      })
      .catch(res => {
        this.setState({ loading: false });
        if (res.response.data.error_code === 401) {
          message.error(res.response.data.message);
        }
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
    this.refresh();
  }

  render() {
    return (
      <div>
        <div>
          <NewUser refreshClientComponent={this.refresh} />
        </div>

        <Row>
          <Col span={18}>
            <Table
              rowKey="id"
              columns={this.columns}
              dataSource={this.state.data_res}
              pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "30"]
              }}
              onChange={() => this.refresh}
              loading={this.state.loading}
              onRow={(record, rowIndex) => {
                return {
                  onClick: event => {
                    this.setState({
                      avatar: record.avatar,
                      fstName: record.first_name,
                      lstName: record.last_name,
                      user_id: record.id
                    });
                  }, // click row
                  onDoubleClick: event => {}, // double click row
                  onContextMenu: event => {}, // right button click row
                  onMouseEnter: event => {}, // mouse enter row
                  onMouseLeave: event => {} // mouse leave row
                };
              }}
            />
            <BackTop />
            <strong style={{ color: "rgba(64, 64, 64, 0.6)" }} />
          </Col>
          <Col span={6}>
            {" "}
            <Card
              hoverable
              style={{ width: 200, marginLeft: 10 }}
              cover={<img alt="example" src={this.state.avatar} />}
            >
              <Meta
                title={this.state.lstName}
                description={this.state.fstName}
              />
            </Card>
          </Col>
        </Row>
        <UsersCategory ParentId={this.state.user_id} />
      </div>
    );
  }
}

export default Admin;
