import {
  Form,
  message,
  Select,
  Input,
  Tag,
  Row,
  Col,
  Button,
  Icon,
  Popconfirm
} from "antd";
import React from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import TodoCategory from "./TodoCategory";
import moment from "moment";
import { connect } from "react-redux";

const Option = Select.Option;
const ButtonGroup = Button.Group;

const UserEmailSend = (useremail, action_id, subject, bodymessage) => {
  //Если useremail пустой то отправит всем связанным клиентам по action_id
  let headersConfig = {
    Authorization: "Bearer " + sessionStorage.getItem("credentials")
  };
  const requestBody = {
    useremail: useremail,
    subject: subject,
    message: bodymessage,
    action_id: action_id
  };
  axios({
    method: "post",
    url: sessionStorage.getItem("b_url") + "email_send",
    data: requestBody,
    headers: headersConfig
  })
    .then(res => {
      if (res.data.detailed_message !== "") {
        res.data.error_code == 0
          ? message.success(res.data.detailed_message)
          : message.error(res.data.detailed_message);
      }
    })
    .catch(res => {
      if (res.response.data.error_code === 401) {
        message.error(res.response.data.message);
      }
    });
};
class TodoDetailForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      data_detail: [
        {
          id: "",
          shortname: "",
          type_val: "",
          priority: "",
          created: "",
          to_work_date: "",
          end_date: "",
          created_by: "",
          resp: "",
          description: "",
          subtype_val: "",
          visible: "",
          parent_id: "",
          par_type_val: ""
        }
      ]
    };
  }

  refresh = () => {
    this.setState({ loading: true });

    axios
      .get(sessionStorage.getItem("b_url") + "actions?id=" + this.props.id, {
        headers: {
          Authorization: "Bearer " + sessionStorage.getItem("credentials")
        }
      })
      .then(res => {
        this.setState({ data_detail: res.data });
        this.setState({ loading: false });
      })
      .catch(res => {
        this.setState({ loading: false });
        if (res.response.data.error_code === 401) {
          message.error(res.response.data.message);
        }
      });
  };
  onClose = () => {
    this.setState({ loading: true });

    let headersConfig = {
      Authorization: "Bearer " + sessionStorage.getItem("credentials")
    };
    const requestBody = {
      id: this.props.id,
      status: "Завершено"
    };
    axios({
      method: "post",
      url: sessionStorage.getItem("b_url") + "actions",
      data: requestBody,
      headers: headersConfig
    })
      .then(res => {
        if (res.data.detailed_message !== "") {
          this.refresh();
          if (
            res.data.error_code == 0 &&
            this.state.data_detail[0].visible !== true
          ) {
            UserEmailSend(
              "",
              this.props.id,
              "Задача завершена",
              "<b>Id:</b>" +
                this.props.id +
                "<br><b>Название задачи:</b>" +
                this.state.data_detail[0].shortname
            );
          }

          this.setState({ loading: false });
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
  confirmComplete = () => {
    let btStatus =
      this.props.action === "read_m" || this.props.user_group !== "Manager"
        ? true
        : this.state.data_detail[0].status === "В работе"
        ? false
        : true;
    let btcomplete = (
      <Button disabled={btStatus} type="primary">
        <Icon type="close-circle" />
        Завершить
      </Button>
    );

    return btStatus === false ? (
      <Popconfirm
        placement="topLeft"
        title="Подтверждаете завершение задачи?"
        onConfirm={() => this.onClose()}
        okText="Да"
        cancelText="Нет"
      >
        {btcomplete}
      </Popconfirm>
    ) : (
      btcomplete
    );
  };
  //Принять в работу
  takeWork = () => {
    this.setState({ loading: true });

    let headersConfig = {
      Authorization: "Bearer " + sessionStorage.getItem("credentials")
    };
    const requestBody = {
      id: this.props.id,
      status: "В работе",
      resp: "Y"
    };
    axios({
      method: "post",
      url: sessionStorage.getItem("b_url") + "actions",
      data: requestBody,
      headers: headersConfig
    })
      .then(res => {
        if (res.data.detailed_message !== "") {
          axios
            .delete(
              sessionStorage.getItem("b_url") +
                "notice?action_id=" +
                this.props.id,
              {
                headers: {
                  Authorization:
                    "Bearer " + sessionStorage.getItem("credentials")
                }
              }
            )
            .then(res => {
              if (res.data.detailed_message !== "") {
                res.data.error_code == 0
                  ? axios
                      .delete(
                        sessionStorage.getItem("b_url") +
                          "act_notice?action_id=" +
                          this.props.id +
                          "&mode=all",
                        {
                          headers: {
                            Authorization:
                              "Bearer " + sessionStorage.getItem("credentials")
                          }
                        }
                      )
                      .then(res => {})
                      .catch(res => {})
                  : message.error(res.data.detailed_message);
              }
            });
          this.refresh();
          this.setState({ loading: false });
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
  componentDidMount() {
    this.refresh();
  }
  render() {
    return (
      <div>
        <ButtonGroup>
          <Link to="/Todo">
            <Button type="primary">
              <Icon type="left-circle" theme="twoTone" />
              Назад
            </Button>
          </Link>
          <Button
            onClick={() => this.takeWork()}
            disabled={
              this.props.action === "read_m" ||
              this.props.user_group !== "Manager"
                ? true
                : this.state.data_detail[0].status === "Новый"
                ? false
                : true
            }
            type="primary"
          >
            <Icon type="issues-close" />
            Принять в работу
          </Button>
          {this.confirmComplete()}
          <Button onClick={() => this.refresh()}>
            <Icon type="reload" />
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <p style={{ marginLeft: 20 }}>
            <h4>
              Статус:
              <Tag
                style={{ marginLeft: 5 }}
                color={
                  this.state.data_detail[0].status === "Новый"
                    ? "#595959"
                    : this.state.data_detail[0].status === "Завершено"
                    ? "#52c41a"
                    : "#faad14"
                }
                key={this.state.data_detail[0].id}
              >
                {this.state.data_detail[0].status}
              </Tag>
            </h4>
          </p>
        </ButtonGroup>
        <br />
        <br />

        <Form layout="vertical" hideRequiredMark>
          <Row gutter={16}>
            <Col span={3}>
              <Form.Item label="ID задачи">
                {
                  <Input
                    type="text"
                    placeholder="ID задачи"
                    defaultValue={this.state.data_detail[0].id}
                    value={this.state.data_detail[0].id}
                    style={{ backgroundColor: "#1890ff33" }}
                  />
                }
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Наименование задачи">
                {
                  <Input
                    type="text"
                    placeholder="Наименование задачи"
                    defaultValue={this.state.data_detail[0].shortname}
                    value={this.state.data_detail[0].shortname}
                  />
                }
              </Form.Item>
            </Col>
            <Col span={3}>
              <Form.Item label="Приоритет">
                {
                  <Input
                    placeholder="Приоритет"
                    defaultValue={this.state.data_detail[0].priority}
                    value={this.state.data_detail[0].priority}
                  />
                }
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={3}>
              <Form.Item label="Тип задачи">
                {
                  <Input
                    readOnly
                    placeholder="Тип задачи"
                    defaultValue={this.state.data_detail[0].type_val}
                    value={this.state.data_detail[0].type_val}
                  />
                }
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Подтип задачи">
                <Input
                  readOnly
                  placeholder="Подтип задачи"
                  defaultValue={this.state.data_detail[0].subtype_val}
                  value={this.state.data_detail[0].subtype_val}
                />
              </Form.Item>
            </Col>
            <Col span={3}>
              <Form.Item label="Дата создания">
                {
                  <Input
                    placeholder="Дата создания"
                    defaultValue={moment(
                      this.state.data_detail[0].created
                    ).format("DD.MM.YYYY HH:mm:ss")}
                    value={moment(this.state.data_detail[0].created).format(
                      "DD.MM.YYYY HH:mm:ss"
                    )}
                  />
                }
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={3}>
              <Form.Item label="Исходная задача">
                <Input
                  readOnly
                  placeholder="Исходная задача"
                  defaultValue={this.state.data_detail[0].parent_id}
                  value={this.state.data_detail[0].parent_id}
                />
                <div class="ant-card-meta-description">
                  {this.state.data_detail[0].par_type_val}
                </div>
              </Form.Item>
            </Col>
            <Col span={9}>
              <Form.Item label="Описание">
                {
                  <Input.TextArea
                    rows={2}
                    placeholder="Введите описание"
                    defaultValue={this.state.data_detail[0].description}
                    value={this.state.data_detail[0].description}
                  />
                }
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <TodoCategory ParentId={this.props.id} />
      </div>
    );
  }
}

const WrappedTodoDetailForm = Form.create()(TodoDetailForm);

const mapStateToProps = state => {
  return {
    user_group: state.user_group
  };
};
export default connect(mapStateToProps)(WrappedTodoDetailForm);
