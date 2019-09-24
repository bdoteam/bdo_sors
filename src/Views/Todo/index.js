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
  Checkbox,
  Tooltip,
  Badge
} from "antd";
import React, { Component } from "react";
import axios from "axios";
import NewTodo from "./NewTodo.js";
import { Link } from "react-router-dom";
import "antd/dist/antd.css";
import moment from "moment";
import Highlighter from "react-highlight-words";
import SearchSVG from "../../components/svg/SearchSVG";
import { connect } from "react-redux";
import TodoNotice from "./TodoNotice";
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
const Option = Select.Option;
const ButtonGroup = Button.Group;
const SearchIcon = props => <Icon component={SearchSVG} {...props} />;

class Todo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data_res: [],
      todo_type_list: [],
      todo_subtype_list: [],
      update_data: [
        {
          id: "",
          shortname: "",
          priority: "",
          created: "",
          updated: "",
          to_work_date: "",
          end_date: "",
          created_by: "",
          updated_by: "",
          resp: ""
        }
      ],
      editingKey: "",
      chModal: false,
      type: "",
      subtype: ""
    };
    this.columns = [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        ...this.getColumnSearchProps("id"),
        render: (text, record) =>
          record.status != localName("Завершено") ? (
            <TodoNotice record_id={record.id} />
          ) : (
            <Tag className="ant-tooltip-inner"> {record.id} </Tag>
          )
      },
      {
        title: "",
        dataIndex: "visible",
        key: "visible",
        render: (text, record) =>
          record.user_group === "Manager" || record.user_group === "Admin" ? (
            <Tooltip placement="top" title={localName("Внутренняя задача")}>
              <Checkbox checked={text} />
            </Tooltip>
          ) : (
            {}
          )
      },
      {
        title: localName("Наименование"),
        dataIndex: "shortname",
        key: "shortname",
        editable: true,
        render: (text, record) => (
          <Link to={"/TodoDetail/" + record.id}> {text} </Link>
        )
      },
      {
        title: localName("Тип задачи"),
        dataIndex: "type_val",
        key: "type_val",
        editable: true,
        ...this.getColumnSearchProps("type_val"),
        render: (text, record) =>
          record.type_color === null ? (
            record.type_val
          ) : (
            <Tag color={record.type_color} key={record.id}>
              {record.type_val}
            </Tag>
          )
      },
      {
        title: localName("Подтип задачи"),
        dataIndex: "subtype_val",
        key: "subtype_val",
        editable: true,
        ...this.getColumnSearchProps("subtype_val"),

        render: (text, record) =>
          record.subtype_color === null ? (
            record.subtype_val
          ) : (
            <Tag color={record.subtype_color} key={record.id}>
              {record.subtype_val}
            </Tag>
          )
      },
      {
        title: localName("Приоритет"),
        dataIndex: "priority",
        key: "priority",
        editable: true
      },
      {
        title: localName("Дата создания"),
        dataIndex: "created",
        key: "created",
        render: text => (
          <span> {moment(text).format("DD.MM.YYYY HH:mm:ss")} </span>
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
        title: localName("Дата принятия в работу"),
        dataIndex: "to_work_date",
        key: "to_work_date",
        render: text => (
          <span>
            {text === null ? "" : moment(text).format("DD.MM.YYYY HH:mm:ss")}
          </span>
        )
      },
      {
        title: localName("Дата завершения"),
        dataIndex: "end_date",
        key: "end_date",
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
        title: localName("Ответственный"),
        dataIndex: "resp",
        key: "resp",
        ...this.getColumnSearchProps("resp")
      },
      {
        title: localName("Клиент"),
        dataIndex: "customer_name",
        key: "customer_name",
        ...this.getColumnSearchProps("customer_name"),
        render: (text, record) => (
          <Link to={"/ClientDetail/" + record.customer_id}> {text} </Link>
        )
      },
      {
        title: localName("Статус"),
        dataIndex: "status",
        key: "status",
        ...this.getColumnSearchProps("status"),
        render: (text, record) => (
          <Tag
            color={
              record.status == "New"
                ? "#595959"
                : record.status == "Done"
                ? "#52c41a"
                : "#faad14"
            }
            key={record.id}
          >
            {record.status_val}
          </Tag>
        )
      },
      {
        title: localName("Действия"),
        dataIndex: "operation",
        render: (text, record) =>
          this.state.data_res.length >= 1 ? (
            <div>
              <ButtonGroup>
                <Button
                  disabled={this.props.action === "read_m" ? true : false}
                  shape="circle"
                  onClick={() => this.changeShow(record)}
                >
                  <Icon type="edit" theme="twoTone" />
                </Button>
                <Modal
                  title={localName("Изменить задачу")}
                  visible={this.state.chModal}
                  onOk={() => this.handleUpdate(this.state.update_data[0])}
                  onCancel={this.changeHide}
                  okText={localName("Сохранить")}
                  cancelText={localName("Отменить")}
                >
                  <Form layout="vertical" hideRequiredMark>
                    <Row gutter={1}>
                      <Col span={24}>
                        <Form.Item label={localName("Наименование задачи")}>
                          {
                            <Input
                              type="text"
                              allowClear={true}
                              placeholder={localName("Наименование")}
                              defaultValue={this.state.update_data[0].shortname}
                              value={this.state.update_data[0].shortname}
                              onChange={evt =>
                                this.handleChange(
                                  evt,
                                  this.state.update_data[0],
                                  "shortname"
                                )
                              }
                            />
                          }
                        </Form.Item>
                        <Form.Item label={localName("Тип задачи")}>
                          {
                            <Select
                              defaultValue={this.state.type}
                              value={this.state.type}
                              onChange={val =>
                                this.setState({
                                  type: val
                                })
                              }
                            >
                              {this.state.todo_type_list.map(gr => (
                                <Option key={gr.code} value={gr.code}>
                                  {gr.value}
                                </Option>
                              ))}
                            </Select>
                          }
                        </Form.Item>
                        <Form.Item label={localName("Подтип задачи")}>
                          {
                            <Select
                              defaultValue={this.state.subtype}
                              value={this.state.subtype}
                              onChange={val =>
                                this.setState({
                                  subtype: val
                                })
                              }
                            >
                              {this.state.todo_subtype_list.map(gr =>
                                this.state.type === gr.parent_code ? (
                                  <Option key={gr.code} value={gr.code}>
                                    {gr.value}
                                  </Option>
                                ) : null
                              )}
                            </Select>
                          }
                        </Form.Item>
                        <Form.Item label={localName("Приоритет")}>
                          {
                            <Input
                              placeholder={localName("Приоритет")}
                              allowClear={true}
                              defaultValue={this.state.update_data[0].priority}
                              value={this.state.update_data[0].priority}
                              onChange={evt =>
                                this.handleChange(
                                  evt,
                                  this.state.update_data[0],
                                  "priority"
                                )
                              }
                            />
                          }
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </Modal>
                {this.props.user_group === "Admin" ? (
                  <Popconfirm
                    placement="topLeft"
                    title={localName("Удалить задачу?")}
                    onConfirm={() => this.handleDelete(record)}
                    okText={localName("Да")}
                    cancelText={localName("Нет")}
                  >
                    <Button
                      disabled={this.props.action === "read_m" ? true : false}
                      type="danger"
                      shape="circle"
                    >
                      <Icon type="delete" />
                    </Button>
                  </Popconfirm>
                ) : null}
              </ButtonGroup>
            </div>
          ) : null
      }
    ];
  }
  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters
    }) => (
      <div
        style={{
          padding: 8
        }}
      >
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            this.handleSearch(dataIndex, selectedKeys, confirm)
          }
          style={{
            width: 188,
            marginBottom: 8,
            display: "block"
          }}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(dataIndex, selectedKeys, confirm)}
          icon="search"
          size="small"
          style={{
            width: 90,
            marginRight: 8
          }}
        >
          {localName("Поиск")}
        </Button>
        <Button
          onClick={() => this.handleReset(clearFilters)}
          size="small"
          style={{
            width: 90
          }}
        >
          {localName("Сброс")}
        </Button>
      </div>
    ),
    filterIcon: <SearchIcon />,

    //<Icon type="search" style={{ color: filtered ? "#13c2c2" : "#002766" }} />
    onFilter: (value, record) =>
      record[dataIndex] !== null
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : null,
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: (text, record) =>
      dataIndex === "name" ? (
        <nav>
          <Link to={`/TodotDetail/${record.id}`} innerRef={this.refCallback}>
            {
              <Highlighter
                highlightStyle={{
                  backgroundColor: "#ffc069",
                  padding: 0
                }}
                searchWords={[this.state.searchText]}
                autoEscape
                textToHighlight={text}
              />
            }
          </Link>
        </nav>
      ) : (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0
          }}
          searchWords={[this.state.searchText]}
          autoEscape
          textToHighlight={text}
        />
      )
  });

  handleSearch = (dataIndex, selectedKeys, confirm) => {
    confirm();
    this.setState({
      searchText: selectedKeys[0]
    });
    this.refresh(dataIndex + "=" + selectedKeys[0]);
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({
      searchText: ""
    });
    this.refresh();
  };

  handleChange = (evt, updRecord, field) => {
    var data = [];
    let shortname = updRecord.name;
    let priority = updRecord.priority;

    if (field === "shortname") {
      shortname = evt.target.value;
    }
    if (field === "priority") {
      priority = evt.target.value;
    }
    data.push({
      id: updRecord.id,
      shortname: shortname,
      priority: priority
    });
    this.setState({
      update_data: data
    });
  };
  sleep(millis) {
    var t = new Date().getTime();
    var i = 0;
    while (new Date().getTime() - t < millis) {
      i++;
    }
  }
  handleDelete = record => {
    //message.info("Clicked on Yes.");
    this.setState({
      loading: true
    });
    axios
      .delete(sessionStorage.getItem("b_url") + "actions?id=" + record.id, {
        headers: {
          Authorization: "Bearer " + sessionStorage.getItem("credentials")
        }
      })
      .then(res => {
        this.refresh();
        this.setState({
          loading: false
        });
        if (res.data.detailed_message !== "") {
          res.data.error_code == 0
            ? message.success(localName(res.data.detailed_message))
            : message.error(localName(res.data.detailed_message));
        }
      })
      .catch(res => {
        this.setState({
          loading: false
        });
        if (res.response.data.error_code === 401) {
          message.error(localName(res.response.data.message));
        }
      });
  };
  handleUpdate = updRecord => {
    this.setState({
      loading: true
    });

    let headersConfig = {
      Authorization: "Bearer " + sessionStorage.getItem("credentials")
    };
    const requestBody = {
      id: updRecord.id,
      shortname: updRecord.shortname,
      priority: updRecord.priority,
      type: this.state.type,
      subtype: this.state.subtype
    };
    axios({
      method: "post",
      url: sessionStorage.getItem("b_url") + "actions",
      data: requestBody,
      headers: headersConfig
    })
      .then(res => {
        this.componentDidMount();
        this.setState({
          loading: false,
          chModal: false
        });
        if (res.data.detailed_message !== "") {
          res.data.error_code == 0
            ? message.success(localName(res.data.detailed_message))
            : message.error(localName(res.data.detailed_message));
        }
      })
      .catch(res => {
        this.setState({
          loading: false
        });
        if (res.response.data.error_code === 401) {
          message.error(localName(res.response.data.message));
        }
      });
  };

  changeShow = record => {
    var data = [];
    data.push({
      id: record.id,
      shortname: record.shortname,
      status: record.status,
      priority: record.priority
    });
    this.setState({
      chModal: true,
      update_data: data,
      type: record.type,
      subtype: record.subtype
    });
  };
  changeHide = () => {
    this.setState({
      chModal: false
    });
  };

  refresh = filter => {
    this.setState({
      loading: true
    });
    try {
      var ParentId =
        this.props.ParentId == undefined
          ? ""
          : "?customer_id=" + this.props.ParentId;
    } catch (err) {
      ParentId = "";
    }
    try {
      filter =
        filter == undefined
          ? ""
          : ParentId === ""
          ? "?" + filter
          : "&" + filter;
    } catch (err) {
      filter = "";
    }
    let searchFilter = ParentId + filter;

    axios
      .get(sessionStorage.getItem("b_url") + "actions" + searchFilter, {
        headers: {
          Authorization: "Bearer " + sessionStorage.getItem("credentials")
        }
      })
      .then(res => {
        this.setState({
          data_res: res.data
        });
        this.setState({
          loading: false
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
            this.setState({
              todo_type_list: res.data
            });
            axios
              .get(
                sessionStorage.getItem("b_url") +
                  "list_of_val?mode=1&Active=true&type='TODO_SUB_TYPE'",
                {
                  headers: {
                    Authorization:
                      "Bearer " + sessionStorage.getItem("credentials")
                  }
                }
              )
              .then(res => {
                this.setState({
                  todo_subtype_list: res.data
                });
              })
              .catch(res => {});
          })
          .catch(res => {});
      })
      .catch(res => {
        this.setState({
          loading: false
        });
        if (res.response.data.error_code === 401) {
          message.error(localName(res.response.data.message));
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
          <NewTodo
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
        <strong
          style={{
            color: "rgba(64, 64, 64, 0.6)"
          }}
        />
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
export default connect(mapStateToProps)(Todo);
