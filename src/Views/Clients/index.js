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
  Tooltip
} from "antd";
import PhoneInput from "react-phone-number-input/basic-input";
import { Link } from "react-router-dom";
import React, { Component } from "react";
import axios from "axios";
import NewClient from "./NewClient";
import "antd/dist/antd.css";
import moment from "moment";
import Highlighter from "react-highlight-words";
import { connect } from "react-redux";
import client_type from "../../components/ClientType";
import SearchSVG from "../../components/svg/SearchSVG";
import NumberFormat from "react-number-format";
import localize from "../../components/Localization/index";
import localizeLang from "../../components/Localization/lang";

const SearchIcon = props => <Icon component={SearchSVG} {...props} />;
const Option = Select.Option;
const ButtonGroup = Button.Group;
//функция для работы со справочниками вытаскиваем название по id
const digestName = (digest, id) => {
  let result = id;
  {
    digest.map(comp => (id === comp.id ? (result = comp.name) : comp.id));
  }
  return result;
};
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
class ClientView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data_res: [],
      update_data: [
        {
          id: "",
          name: "",
          bin: "",
          status: "",
          con_phone: "",
          type: "",
          description: ""
        }
      ],
      editingKey: "",
      chModal: false,
      searchText: ""
    };

    this.columns = [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        render: (text, record) => (
          <Tag className="ant-tooltip-inner">{record.id}</Tag>
        )
      },
      {
        title: localName("Наименование"),
        dataIndex: "name",
        key: "name",
        ...this.getColumnSearchProps("name")
      },
      {
        title: localName("Тип клиента"),
        dataIndex: "type",
        key: "type",
        editable: true,
        render: (text, record) => digestName(client_type, text)
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
        title: localName("Кем создан"),
        dataIndex: "created_by",
        key: "created_by",
        ...this.getColumnSearchProps("created_by")
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
        title: localName("Кем обновлен"),
        dataIndex: "updated_by",
        key: "updated_by"
      },
      {
        title: localName("БИН"),
        dataIndex: "bin",
        key: "bin",
        ...this.getColumnSearchProps("bin")
      },
      {
        title: localName("Контактный телефон"),
        dataIndex: "con_phone",
        key: "con_phone",
        editable: false,
        render: (text, record) => (
          <NumberFormat
            format="# (###) ###-####"
            mask=""
            name="phoneNumberInput"
            placeholder="Телефон не указан"
            value={record.con_phone}
            displayType={"text"}
          />
        )
      },
      {
        title: localName("Статус"),
        dataIndex: "status",
        key: "status",
        render: (text, record) => (
          <span>
            <Tag
              color={record.status == "Active" ? "green" : "volcano"}
              key={record.id}
            >
              {record.status_val}
            </Tag>
          </span>
        )
      },
      {
        title: localName("Действия"),
        dataIndex: "operation",
        render: (text, record) =>
          this.state.data_res.length >= 1 ? (
            <div>
              <ButtonGroup>
                <Tooltip placement="bottomLeft" title={localName("Изменить")}>
                  <Button
                    disabled={this.props.client === "read_m" ? true : false}
                    shape="circle"
                    onClick={() => this.changeShow(record)}
                  >
                    <Icon type="edit" theme="twoTone" />
                  </Button>
                </Tooltip>
                <Modal
                  style={{ height: 100 }}
                  title={localName("Изменить Клиента")}
                  visible={this.state.chModal}
                  onOk={() => this.handleUpdate(this.state.update_data[0])}
                  onCancel={this.changeHide}
                  okText={localName("Сохранить")}
                  cancelText={localName("Отменить")}
                >
                  <Form layout="vertical" hideRequiredMark>
                    <Row gutter={1}>
                      <Col span={12}>
                        <Form.Item label={localName("Наименование клиента")}>
                          {
                            <Input
                              type="text"
                              allowClear={true}
                              placeholder={localName("Наименование клиента")}
                              defaultValue={this.state.update_data[0].name}
                              value={this.state.update_data[0].name}
                              onChange={evt =>
                                this.handleChange(
                                  evt,
                                  this.state.update_data[0],
                                  "name"
                                )
                              }
                            />
                          }
                        </Form.Item>
                        <Form.Item label={localName("БИН")}>
                          {
                            <Input
                              placeholder={localName("БИН")}
                              allowClear={true}
                              defaultValue={this.state.update_data[0].bin}
                              value={this.state.update_data[0].bin}
                              onChange={evt =>
                                this.handleChange(
                                  evt,
                                  this.state.update_data[0],
                                  "bin"
                                )
                              }
                            />
                          }
                        </Form.Item>
                        <Form.Item label={localName("Статус")}>
                          {
                            <Select
                              defaultValue={localName(
                                this.state.update_data[0].status
                              )}
                              value={localName(
                                this.state.update_data[0].status
                              )}
                              onChange={value =>
                                this.handleChange(
                                  value,
                                  this.state.update_data[0],
                                  "status"
                                )
                              }
                            >
                              <Option value="Active">
                                {localName("Активный")}
                              </Option>
                              <Option value="Disabled">
                                {localName("Отключен")}
                              </Option>
                            </Select>
                          }
                        </Form.Item>
                        {this.props.user_group === "Manager" ? (
                          <Form.Item label={localName("Описание")}>
                            {
                              <Input.TextArea
                                rows={2}
                                allowClear={true}
                                placeholder={localName("Описание")}
                                defaultValue={
                                  this.state.update_data[0].description
                                }
                                value={this.state.update_data[0].description}
                                onChange={evt =>
                                  this.handleChange(
                                    evt,
                                    this.state.update_data[0],
                                    "description"
                                  )
                                }
                              />
                            }
                          </Form.Item>
                        ) : null}
                      </Col>

                      <Col
                        span={12}
                        style={{
                          paddingLeft: "10px"
                        }}
                      >
                        <Form.Item label={localName("Тип клиента")}>
                          {
                            <Select
                              defaultValue={this.state.update_data[0].type}
                              value={this.state.update_data[0].type}
                              onChange={evt =>
                                this.handleChange(
                                  evt,
                                  this.state.update_data[0],
                                  "type"
                                )
                              }
                            >
                              {client_type.map(digest => (
                                <Option key={digest.id} value={digest.id}>
                                  {digest.name}
                                </Option>
                              ))}
                            </Select>
                          }
                        </Form.Item>
                        <Form.Item label={localName("Контактный телефон")}>
                          {
                            <PhoneInput
                              class="ant-input"
                              country="KZ"
                              placeholder={localName("Контактный телефон")}
                              allowClear={true}
                              defaultValue={this.state.update_data[0].con_phone}
                              value={this.state.update_data[0].con_phone}
                              onChange={evt =>
                                this.handleChange(
                                  evt,
                                  this.state.update_data[0],
                                  "con_phone"
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
                    title={localName("Удалить клиента?")}
                    onConfirm={() => this.handleDelete(record)}
                    okText={localName("Да")}
                    cancelText={localName("Нет")}
                  >
                    <Tooltip
                      placement="bottomLeft"
                      title={localName("Удалить")}
                    >
                      <Button type="danger" shape="circle">
                        <Icon type="delete" />
                      </Button>
                    </Tooltip>
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
      <div style={{ padding: 8 }}>
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
          <Link to={`/ClientDetail/${record.id}`} innerRef={this.refCallback}>
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
    this.refresh(dataIndex + "=" + selectedKeys[0]);
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: "" });
    this.refresh();
  };
  handleChange = (evt, updRecord, field) => {
    var data = [];
    let name = updRecord.name;
    let bin = updRecord.bin;
    let status = updRecord.status;
    let con_phone = updRecord.con_phone;
    let type = updRecord.type;
    let description = updRecord.description;
    if (field === "name") {
      name = evt.target.value;
    }
    if (field === "bin") {
      bin = evt.target.value;
    }
    if (field === "status") {
      status = evt;
    }
    if (field === "con_phone") {
      con_phone = evt;
    }
    if (field === "type") {
      type = evt;
    }
    if (field === "description") {
      description = evt.target.value;
    }
    data.push({
      id: updRecord.id,
      name: name,
      bin: bin,
      status: status,
      con_phone: con_phone,
      type: type,
      description: description
    });

    this.setState({
      update_data: data
    });
  };
  handleDelete = record => {
    this.setState({ loading: true });
    axios
      .delete(sessionStorage.getItem("b_url") + "customer?id=" + record.id, {
        headers: {
          Authorization: "Bearer " + sessionStorage.getItem("credentials")
        }
      })
      .then(res => {
        this.refresh();
        this.setState({ loading: false });
        if (res.data.detailed_message !== "") {
          res.data.error_code == 0
            ? message.success(localName(res.data.detailed_message))
            : message.error(localName(res.data.detailed_message));
        }
      })
      .catch(res => {
        this.setState({ loading: false });
        if (res.response.data.error_code === 401) {
          message.error(localName(res.response.data.message));
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
      name: updRecord.name,
      bin: updRecord.bin,
      status: updRecord.status,
      con_phone: updRecord.con_phone,
      type: updRecord.type,
      description: updRecord.description
    };
    axios({
      method: "post",
      url: sessionStorage.getItem("b_url") + "customer",
      data: requestBody,
      headers: headersConfig
    })
      .then(res => {
        this.componentDidMount();
        this.setState({ loading: false, chModal: false });
        if (res.data.detailed_message !== "") {
          res.data.error_code == 0
            ? message.success(localName(res.data.detailed_message))
            : message.error(localName(res.data.detailed_message));
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
  };

  changeShow = record => {
    var data = [];
    data.push({
      id: record.id,
      name: record.name,
      bin: record.bin,
      status: record.status,
      con_phone: record.con_phone,
      type: record.type,
      description: record.description
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
  refresh = filter => {
    let searchFilter = filter === undefined ? "" : "?" + filter;
    this.setState({ loading: true });
    axios
      .get(sessionStorage.getItem("b_url") + "customer" + searchFilter, {
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
          <NewClient refreshClientComponent={this.refresh} />
        </div>

        <Table
          style={{ width: "100%" }}
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
    client: state.client,
    user_group: state.user_group
  };
};
export default connect(mapStateToProps)(ClientView);
