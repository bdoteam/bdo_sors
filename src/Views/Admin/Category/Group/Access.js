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
  Col
} from "antd";
import { Link } from "react-router-dom";
import React, { Component } from "react";
import axios from "axios";
import NewAccess from "./NewAccess";
import view_comp from "../../../../components/Access/ViewComp";
import view_mode from "../../../../components/Access/ViewMode";
import "antd/dist/antd.css";
import moment from "moment";

const Option = Select.Option;
const ButtonGroup = Button.Group;

class GroupAccess extends Component {
  constructor(props) {
    super(props);
    //функция для работы со справочниками вытаскиваем название по id
    const digestName = (digest, id) => {
      let result = id;
      {
        digest.map(comp => (id === comp.id ? (result = comp.name) : comp.id));
      }
      return result;
    };
    this.state = {
      data_res: [],
      editingKey: "",
      chModal: false,
      mode_val: "",
      comp_val: "",
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
        title: "Компонент",
        dataIndex: "component",
        key: "component",
        render: (text, record) => (
          <span>
            <Tag color={"#bf360c"}>
              {digestName(view_comp, record.component)}
            </Tag>
          </span>
        )
      },
      {
        title: "Режим",
        dataIndex: "mode",
        key: "mode",
        render: (text, record) => (
          <span>
            <Tag color={"#607d8b"}>{digestName(view_mode, record.mode)}</Tag>
          </span>
        )
      },
      {
        title: "Дата создания",
        dataIndex: "created",
        key: "created",
        render: text => (
          <span>
            {" "}
            {text === null ? "" : moment(text).format("DD.MM.YYYY HH:mm:ss")}
          </span>
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
          <span>
            {" "}
            {text === null ? "" : moment(text).format("DD.MM.YYYY HH:mm:ss")}
          </span>
        )
      },
      {
        title: "Кем обновлен",
        dataIndex: "updated_by",
        key: "updated_by"
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
                  title="Изменить Доступ"
                  visible={this.state.chModal}
                  onOk={() => this.handleUpdate()}
                  onCancel={this.changeHide}
                  okText="Изменить"
                  cancelText="Отменить"
                >
                  <Form layout="vertical" hideRequiredMark>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Компонент">
                          <Select
                            defaultValue={this.state.comp_val}
                            value={this.state.comp_val}
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
                            defaultValue={this.state.mode_val}
                            value={this.state.mode_val}
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
                </Modal>
                <Popconfirm
                  placement="topLeft"
                  title="Удалить доступ?"
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
    //message.info("Clicked on Yes.");
    this.setState({ loading: true });
    axios
      .delete(
        sessionStorage.getItem("b_url") + "group_access?id=" + record.id,
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("credentials")
          }
        }
      )
      .then(res => {
        this.refresh(this.props.ParentId);
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
  handleUpdate = () => {
    this.setState({ loading: true });

    let headersConfig = {
      Authorization: "Bearer " + sessionStorage.getItem("credentials")
    };
    const requestBody = {
      id: this.state.record_id,
      component: this.state.comp_val,
      mode: this.state.mode_val
    };
    axios({
      method: "post",
      url: sessionStorage.getItem("b_url") + "group_access",
      data: requestBody,
      headers: headersConfig
    })
      .then(res => {
        this.refresh(this.props.ParentId);
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
      mode_val: record.mode,
      comp_val: record.component,
      record_id: record.id
    });
  };
  changeHide = () => {
    this.setState({
      chModal: false
    });
  };
  componentWillReceiveProps(nextProps) {
    this.refresh(nextProps.ParentId);
  }
  refresh = ParentId => {
    if (ParentId == "") {
      this.setState({ data_res: [] });
    } else {
      this.setState({ loading: true });
      axios
        .get(
          sessionStorage.getItem("b_url") + "group_access?group_id=" + ParentId,
          {
            headers: {
              Authorization: "Bearer " + sessionStorage.getItem("credentials")
            }
          }
        )
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
    }
  };

  componentDidMount() {
    this.refresh(this.props.ParentId);
  }

  render() {
    return (
      <div>
        <div>
          <NewAccess
            refreshClientComponent={val => this.refresh(val)}
            ParentId={this.props.ParentId}
          />
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
              onChange={() => this.refresh(this.props.ParentId)}
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
          </Col>
        </Row>
      </div>
    );
  }
}

export default GroupAccess;
