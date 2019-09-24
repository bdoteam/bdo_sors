import {
  Table,
  Popconfirm,
  message,
  Modal,
  Button,
  Input,
  Icon,
  BackTop,
  Form,
  Row,
  Col
} from "antd";
import React, { Component } from "react";
import axios from "axios";
import NewContact from "./NewContact.js";
import "antd/dist/antd.css";
import moment from "moment";
import PhoneInput from "react-phone-number-input/basic-input";
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
class Contacts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data_res: [],
      update_data: [
        {
          id: "",
          first_name: "",
          last_name: "",
          middle_name: "",
          created: "",
          updated: "",
          email: "",
          position: "",
          created_by: "",
          updated_by: "",
          mobile_phone: "",
          work_phone: ""
        }
      ],
      editingKey: "",
      chModal: false
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
        title: localName("Фамилия"),
        dataIndex: "last_name",
        key: "last_name"
      },
      {
        title: localName("Имя"),
        dataIndex: "first_name",
        key: "first_name"
      },
      {
        title: localName("Отчество"),
        dataIndex: "middle_name",
        key: "middle_name"
      },
      {
        title: localName("Дата создания"),
        dataIndex: "created",
        key: "created",
        render: text => (
          <span> {moment(text).format("DD.MM.YYYY HH:mm:ss")}</span>
        )
      },
      {
        title: localName("Дата обновления"),
        dataIndex: "updated",
        key: "updated",
        render: text => (
          <span>
            {text === null ? "" : moment(text).format("DD.MM.YYYY HH:mm:ss")}
          </span>
        )
      },
      {
        title: localName("Кем создан"),
        dataIndex: "created_by",
        key: "created_by"
      },
      {
        title: localName("Кем обновлен"),
        dataIndex: "updated_by",
        key: "updated_by"
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email"
      },
      {
        title: localName("Рабочий телефон"),
        dataIndex: "work_phone",
        key: "work_phone",
        render: (text, record) => (
          <PhoneInput
            country="KZ"
            placeholder={localName("Телефон не указан")}
            value={record.work_phone}
            disabled={true}
          />
        )
      },
      {
        title: localName("Мобильный телефон"),
        dataIndex: "mobile_phone",
        key: "mobile_phone",
        render: (text, record) => (
          <PhoneInput
            country="KZ"
            placeholder={localName("Телефон не указан")}
            value={record.mobile_phone}
            disabled={true}
          />
        )
      },
      {
        title: localName("Должность"),
        dataIndex: "position",
        key: "position"
      },
      {
        title: localName("Действия"),
        dataIndex: "operation",
        render: (text, record) =>
          this.state.data_res.length >= 1 ? (
            <div>
              <ButtonGroup>
                <Button shape="circle" onClick={() => this.changeShow(record)}>
                  <Icon type="edit" theme="twoTone" />
                </Button>
                <Modal
                  title={localName("Изменить контакт")}
                  visible={this.state.chModal}
                  onOk={() => this.handleUpdate(this.state.update_data[0])}
                  onCancel={this.changeHide}
                  okText={localName("Сохранить")}
                  cancelText={localName("Отменить")}
                >
                  <Form layout="vertical" hideRequiredMark>
                    <Row gutter={1}>
                      <Col span={24}>
                        <Form.Item label={localName("Фамилия")}>
                          {
                            <Input
                              type="text"
                              allowClear={true}
                              placeholder={localName("Фамилия")}
                              defaultValue={this.state.update_data[0].last_name}
                              value={this.state.update_data[0].last_name}
                              onChange={evt =>
                                this.handleChange(
                                  evt,
                                  this.state.update_data[0],
                                  "last_name"
                                )
                              }
                            />
                          }
                        </Form.Item>

                        <Form.Item label={localName("Имя")}>
                          {
                            <Input
                              type="text"
                              allowClear={true}
                              placeholder={localName("Имя")}
                              defaultValue={
                                this.state.update_data[0].first_name
                              }
                              value={this.state.update_data[0].first_name}
                              onChange={evt =>
                                this.handleChange(
                                  evt,
                                  this.state.update_data[0],
                                  "first_name"
                                )
                              }
                            />
                          }
                        </Form.Item>
                        <Form.Item label={localName("Отчество")}>
                          {
                            <Input
                              type="text"
                              allowClear={true}
                              placeholder={localName("Отчество")}
                              defaultValue={
                                this.state.update_data[0].middle_name
                              }
                              value={this.state.update_data[0].middle_name}
                              onChange={evt =>
                                this.handleChange(
                                  evt,
                                  this.state.update_data[0],
                                  "middle_name"
                                )
                              }
                            />
                          }
                        </Form.Item>
                        <Form.Item label="Email">
                          {
                            <Input
                              type="text"
                              allowClear={true}
                              placeholder="Email"
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

                        <Form.Item label={localName("Рабочий телефон")}>
                          {
                            <PhoneInput
                              class="ant-input"
                              country="KZ"
                              placeholder={localName("Рабочий телефон")}
                              allowClear={true}
                              defaultValue={
                                this.state.update_data[0].work_phone
                              }
                              value={this.state.update_data[0].work_phone}
                              onChange={evt =>
                                this.handleChange(
                                  evt,
                                  this.state.update_data[0],
                                  "work_phone"
                                )
                              }
                            />
                          }
                        </Form.Item>
                        <Form.Item label={localName("Мобильный телефон")}>
                          {
                            <PhoneInput
                              class="ant-input"
                              country="KZ"
                              placeholder={localName("Мобильный телефон")}
                              allowClear={true}
                              defaultValue={
                                this.state.update_data[0].mobile_phone
                              }
                              value={this.state.update_data[0].mobile_phone}
                              onChange={evt =>
                                this.handleChange(
                                  evt,
                                  this.state.update_data[0],
                                  "mobile_phone"
                                )
                              }
                            />
                          }
                        </Form.Item>
                        <Form.Item label={localName("Должность")}>
                          {
                            <Input
                              type="text"
                              allowClear={true}
                              placeholder={localName("Должность")}
                              defaultValue={this.state.update_data[0].position}
                              value={this.state.update_data[0].position}
                              onChange={evt =>
                                this.handleChange(
                                  evt,
                                  this.state.update_data[0],
                                  "position"
                                )
                              }
                            />
                          }
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </Modal>
                <Popconfirm
                  placement="topLeft"
                  title={localName("Удалить контакт?")}
                  onConfirm={() => this.handleDelete(record)}
                  okText={localName("Да")}
                  cancelText={localName("Нет")}
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
    let first_name = updRecord.first_name;
    let last_name = updRecord.last_name;
    let middle_name = updRecord.middle_name;
    let email = updRecord.email;
    let work_phone = updRecord.work_phone;
    let mobile_phone = updRecord.mobile_phone;
    let position = updRecord.position;
    if (field === "first_name") {
      first_name = evt.target.value;
    }
    if (field === "last_name") {
      last_name = evt.target.value;
    }
    if (field === "middle_name") {
      middle_name = evt.target.value;
    }
    if (field === "email") {
      email = evt.target.value;
    }
    if (field === "work_phone") {
      work_phone = evt;
    }
    if (field === "mobile_phone") {
      mobile_phone = evt;
    }
    if (field === "position") {
      position = evt.target.value;
    }
    data.push({
      id: updRecord.id,
      first_name: first_name,
      last_name: last_name,
      middle_name: middle_name,
      email: email,
      work_phone: work_phone,
      mobile_phone: mobile_phone,
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
      .delete(sessionStorage.getItem("b_url") + "contacts?id=" + record.id, {
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
      first_name: updRecord.first_name,
      last_name: updRecord.last_name,
      middle_name: updRecord.middle_name,
      email: updRecord.email,
      work_phone: updRecord.work_phone,
      mobile_phone: updRecord.mobile_phone,
      position: updRecord.position
    };
    axios({
      method: "post",
      url: sessionStorage.getItem("b_url") + "contacts",
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
      first_name: record.first_name,
      last_name: record.last_name,
      middle_name: record.middle_name,
      email: record.email,
      work_phone: record.work_phone,
      mobile_phone: record.mobile_phone,
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
    try {
      var ParentId =
        this.props.ParentId == undefined
          ? ""
          : "customer_id=" + this.props.ParentId;
    } catch (err) {
      ParentId = "";
    }

    axios
      .get(sessionStorage.getItem("b_url") + "contacts?" + ParentId, {
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
    this.refresh();
  }

  render() {
    return (
      <div>
        <div>
          <NewContact
            refreshClientComponent={this.refresh}
            ParentId={this.props.ParentId}
          />
        </div>
        <Table
          rowKey="id"
          columns={this.columns}
          dataSource={this.state.data_res}
          pagination={{
            defaultPageSize: this.props.ParentId === undefined ? 10 : 4,
            showSizeChanger: this.props.ParentId === undefined ? false : true,
            pageSizeOptions: ["10", "20", "30"]
          }}
          onChange={() => this.refresh}
          loading={this.state.loading}
          onRow={(record, rowIndex) => {
            return {
              onClick: event => {}, // click row
              onDoubleClick: event => {}, // double click row
              onContextMenu: event => {}, // right button click row
              onMouseEnter: event => {}, // mouse enter row
              onMouseLeave: event => {} // mouse leave row
            };
          }}
        />
        <BackTop />
        <strong style={{ color: "rgba(64, 64, 64, 0.6)" }} />
      </div>
    );
  }
}
const mapStateToProps = state => {
  return {
    login: state.login
  };
};
export default connect(mapStateToProps)(Contacts);
