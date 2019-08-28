import {
  Table,
  Popconfirm,
  message,
  Modal,
  Button,
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
import NewGroup from "./NewGroup";
import "antd/dist/antd.css";
import GroupCategory from "./GroupCategory";
import moment from "moment";

const Option = Select.Option;
const ButtonGroup = Button.Group;
const { Meta } = Card;
class UserGroup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data_res: [],
      editingKey: "",
      chModal: false,
      group_type_list: [],
      group_id: "",
      group_val: "",
      parent_group_val: "",
      record_id: ""
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
        title: "Название",
        dataIndex: "name",
        key: "name",
        render: (text, record) => (
          <span>
            <Tag color={record.group_color} key={record.id}>
              {record.group_val}
            </Tag>
          </span>
        )
      },
      {
        title: "Дата создания",
        dataIndex: "created",
        key: "created",
        render: text => (
          <span> {moment(text).format("DD.MM.YYYY HH:mm:ss")}</span>
        )
      },
      {
        title: "Кем создан",
        dataIndex: "created_by",
        key: "created_by"
      },
      {
        title: "Дата обновления",
        dataIndex: "updated",
        key: "updated",
        render: text => (
          <span> {moment(text).format("DD.MM.YYYY HH:mm:ss")}</span>
        )
      },
      {
        title: "Кем обновлен",
        dataIndex: "updated_by",
        key: "updated_by"
      },
      {
        title: "Род. группа",
        dataIndex: "pr_group_val",
        key: "pr_group_val",
        render: (text, record) => (
          <span>
            <Tag color={record.pr_group_color} key={record.id}>
              {record.pr_group_val}
            </Tag>
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
                  title="Изменить Группу"
                  visible={this.state.chModal}
                  onOk={() =>
                    this.handleUpdate(
                      this.state.record_id,
                      this.state.group_val,
                      this.state.parent_group_id
                    )
                  }
                  onCancel={this.changeHide}
                  okText="Изменить"
                  cancelText="Отменить"
                >
                  <Form layout="vertical" hideRequiredMark>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Группа">
                          <Select
                            defaultValue={this.state.group_val}
                            value={this.state.group_val}
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
                            defaultValue={this.state.parent_group_val}
                            value={this.state.parent_group_val}
                            onChange={val =>
                              this.setState({ parent_group_val: val })
                            }
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

  handleDelete = record => {
    this.setState({ loading: true });
    axios
      .delete(sessionStorage.getItem("b_url") + "users_group?id=" + record.id, {
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
  handleUpdate = (id, val) => {
    let ParentId =
      this.state.parent_group_val === undefined
        ? null
        : this.state.parent_group_val;
    this.setState({ loading: true });

    let headersConfig = {
      Authorization: "Bearer " + sessionStorage.getItem("credentials")
    };
    const requestBody = {
      id: id,
      name: val,
      parent_id: ParentId
    };
    axios({
      method: "post",
      url: sessionStorage.getItem("b_url") + "users_group",
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
    this.setState({
      chModal: true,
      record_id: record.id,
      group_val: record.group_val,
      parent_group_val: record.parent_id
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
      .get(sessionStorage.getItem("b_url") + "users_group", {
        headers: {
          Authorization: "Bearer " + sessionStorage.getItem("credentials")
        }
      })
      .then(res => {
        this.setState({ data_res: res.data });
        this.setState({ loading: false });
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
          <NewGroup refreshClientComponent={this.refresh} />
        </div>

        <Row>
          <Col>
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
                      group_id: record.id
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
        </Row>
        <GroupCategory ParentId={this.state.group_id} />
      </div>
    );
  }
}

export default UserGroup;
