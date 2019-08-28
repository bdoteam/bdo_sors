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
  DatePicker
} from "antd";
import React, { Component } from "react";
import axios from "axios";
import NewTimesheet from "./NewTimesheet.js";
import { Link } from "react-router-dom";
import "antd/dist/antd.css";
import moment from "moment";
import Highlighter from "react-highlight-words";
import SearchSVG from "../../components/svg/SearchSVG";
import { connect } from "react-redux";

const Option = Select.Option;
const ButtonGroup = Button.Group;
const SearchIcon = props => <Icon component={SearchSVG} {...props} />;
const { RangePicker } = DatePicker;

class Timesheet extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data_res: [],
      todo_type_list: [],
      todo_subtype_list: [],
      update_data: [
        {
          id: "",
          lead_time: "",
          created: "",
          updated: "",
          created_by: "",
          updated_by: ""
        }
      ],
      editingKey: "",
      chModal: false,
      type: "",
      subtype: "",
      desc: "",
      startdate: "",
      enddate: "",
      lead_summ: 0
    };
    this.columns = [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        ...this.getColumnSearchProps("id"),
        render: (text, record) => (
          <Tag className="ant-tooltip-inner">{record.id}</Tag>
        )
      },
      {
        title: "Дата создания",
        dataIndex: "created",
        key: "created",
        ...this.getColumnSearchProps("created"),
        render: text => (
          <span> {moment(text).format("DD.MM.YYYY HH:mm:ss")}</span>
        )
      },
      {
        title: "Логин",
        dataIndex: "created_by",
        key: "created_by",
        ...this.getColumnSearchProps("created_by")
      },
      {
        title: "Клиент",
        dataIndex: "customer_name",
        key: "customer_name",
        ...this.getColumnSearchProps("customer_name"),
        render: (text, record) => (
          <Link to={"/ClientDetail/" + record.customer_id}>{text}</Link>
        )
      },
      {
        title: "Тип задачи",
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
        title: "Подтип задачи",
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
        title: "Кол-во времени, мин",
        dataIndex: "lead_time",
        key: "lead_time",
        editable: true
      },
      {
        title: "Комментарий",
        dataIndex: "comment",
        key: "comment",
        editable: true
      },
      {
        title: "Дата обновления",
        dataIndex: "updated",
        key: "updated",
        render: text => (
          <span>
            {text === null ? "" : moment(text).format("DD.MM.YYYY HH:mm:ss")}
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
                <Button
                  disabled={this.props.action === "read_m" ? true : false}
                  shape="circle"
                  onClick={() => this.changeShow(record)}
                >
                  <Icon type="edit" theme="twoTone" />
                </Button>
                <Modal
                  title="Изменить табель"
                  visible={this.state.chModal}
                  onOk={() => this.handleUpdate(this.state.update_data[0])}
                  onCancel={this.changeHide}
                  okText="Изменить"
                  cancelText="Отменить"
                >
                  <Form layout="vertical" hideRequiredMark>
                    <Row gutter={1}>
                      <Col span={24}>
                        <Form.Item label="Тип задачи">
                          {
                            <Select
                              defaultValue={this.state.type}
                              value={this.state.type}
                              onChange={val => this.setState({ type: val })}
                            >
                              {this.state.todo_type_list.map(gr => (
                                <Option key={gr.code} value={gr.code}>
                                  {gr.value}
                                </Option>
                              ))}
                            </Select>
                          }
                        </Form.Item>
                        <Form.Item label="Подтип задачи">
                          {
                            <Select
                              defaultValue={this.state.subtype}
                              value={this.state.subtype}
                              onChange={val => this.setState({ subtype: val })}
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

                        <Form.Item label="Кол-во времени, мин">
                          {
                            <Input
                              placeholder="Кол-во времени, мин"
                              allowClear={true}
                              defaultValue={this.state.update_data[0].lead_time}
                              value={this.state.update_data[0].lead_time}
                              onChange={evt =>
                                this.handleChange(
                                  evt,
                                  this.state.update_data[0],
                                  "lead_time"
                                )
                              }
                            />
                          }
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item label="Комментарий">
                          <Input.TextArea
                            rows={4}
                            placeholder="Введите комментарий"
                            defaultValue={this.state.desc}
                            value={this.state.desc}
                            onChange={e =>
                              this.setState({ desc: e.target.value })
                            }
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </Modal>
                {this.props.user_group !== "Admin" ? (
                  <Popconfirm
                    placement="topLeft"
                    title="Удалить табель?"
                    onConfirm={() => this.handleDelete(record)}
                    okText="Да"
                    cancelText="Нет"
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
  onChangeDataRange = (dates, dateStrings) => {
    this.setState({ startdate: dateStrings[0], enddate: dateStrings[1] });
  };
  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters
    }) => (
      <div style={{ padding: 8 }}>
        {dataIndex === "created" ? (
          <RangePicker
            ranges={{
              Today: [moment(), moment()],
              "This Month": [moment().startOf("month"), moment().endOf("month")]
            }}
            onChange={this.onChangeDataRange}
            onPressEnter={() =>
              this.handleSearch(dataIndex, selectedKeys, confirm)
            }
            style={{ width: 250, marginBottom: 8, display: "block" }}
          />
        ) : (
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
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
        )}

        <Button
          type="primary"
          onClick={() => this.handleSearch(dataIndex, selectedKeys, confirm)}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Поиск
        </Button>
        <Button
          onClick={() => this.handleReset(clearFilters)}
          size="small"
          style={{ width: 90 }}
        >
          Сброс
        </Button>
      </div>
    ),
    filterIcon: filtered =>
      filtered ? (
        <SearchIcon />
      ) : (
        <SearchIcon style={{ color: filtered ? "#13c2c2" : "#002766" }} />
      ),

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
                highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
                searchWords={[this.state.searchText]}
                autoEscape
                textToHighlight={text}
              />
            }
          </Link>
        </nav>
      ) : (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[this.state.searchText]}
          autoEscape
          textToHighlight={text}
        />
      )
  });

  handleSearch = (dataIndex, selectedKeys, confirm) => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
    dataIndex === "created"
      ? this.refresh(
          "startdate=" + this.state.startdate + "&enddate=" + this.state.enddate
        )
      : this.refresh(dataIndex + "=" + selectedKeys[0]);
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: "" });
    this.refresh();
  };

  handleChange = (evt, updRecord, field) => {
    var data = [];
    let lead_time = updRecord.lead_time;

    if (field === "lead_time") {
      lead_time = evt.target.value;
    }
    data.push({
      id: updRecord.id,
      lead_time: lead_time
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
    this.setState({ loading: true });
    axios
      .delete(sessionStorage.getItem("b_url") + "actions?id=" + record.id, {
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
      comment: this.state.desc,
      lead_time: updRecord.lead_time,
      type: this.state.type,
      subtype: this.state.subtype
    };
    axios({
      method: "post",
      url: sessionStorage.getItem("b_url") + "timesheet",
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
      lead_time: record.lead_time
    });
    this.setState({
      chModal: true,
      update_data: data,
      type: record.type,
      subtype: record.subtype,
      desc: record.comment
    });
  };
  changeHide = () => {
    this.setState({
      chModal: false
    });
  };

  refresh = filter => {
    this.setState({ loading: true });
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
      .get(sessionStorage.getItem("b_url") + "timesheet" + searchFilter, {
        headers: {
          Authorization: "Bearer " + sessionStorage.getItem("credentials")
        }
      })
      .then(res => {
        this.setState({
          data_res: res.data.data_rows,
          lead_summ: res.data.lead_summ
        });
        this.setState({ loading: false });
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
                this.setState({ todo_subtype_list: res.data });
              })
              .catch(res => {});
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
          <NewTimesheet
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
          footer={() => (
            <Row>
              <h2>
                Количество записей:
                <a style={{ color: "rgba(76, 175, 80, 0.82)" }}>
                  {" "}
                  {this.state.data_res.length}
                </a>
              </h2>

              <h2>
                Суммарное время:
                <a style={{ color: "rgba(76, 175, 80, 0.82)" }}>
                  {" "}
                  {this.state.lead_summ}
                </a>
              </h2>
            </Row>
          )}
        />
        <BackTop />
        <strong style={{ color: "rgba(64, 64, 64, 0.6)" }} />
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
export default connect(mapStateToProps)(Timesheet);
