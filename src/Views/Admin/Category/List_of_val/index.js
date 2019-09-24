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
  Col,
  Checkbox,
  Select
} from "antd";
import React, { Component } from "react";
import axios from "axios";
import NewReference from "./NewReference";
import "antd/dist/antd.css";
import moment from "moment";
import Highlighter from "react-highlight-words";
import SearchSVG from "../../../../components/svg/SearchSVG";
import ColorPicker from "rc-color-picker";
import { SwatchesPicker } from "react-color";
import "rc-color-picker/assets/index.css";
import localizeLang from "../../../../components/Localization/lang";

const Option = Select.Option;
const SearchIcon = props => <Icon component={SearchSVG} {...props} />;
const ButtonGroup = Button.Group;

class List_of_val extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data_res: [],
      parent_val_list: [],
      parent_id: null,
      lang: "",
      color: null,
      update_data: [
        {
          id: "",
          value: "",
          code: "",
          active: "",
          type: "",
          created: "",
          updated: "",
          created_by: "",
          updated_by: ""
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
        title: "Тип",
        dataIndex: "type",
        key: "type",
        ...this.getColumnSearchProps("type")
      },
      {
        title: "Значение",
        dataIndex: "value",
        key: "value",
        ...this.getColumnSearchProps("value")
      },
      {
        title: "Код",
        dataIndex: "code",
        key: "code",
        ...this.getColumnSearchProps("code")
      },
      {
        title: "Родит. значение",
        dataIndex: "parent_val",
        key: "parent_val",
        ...this.getColumnSearchProps("parent_val")
      },
      {
        title: "Язык",
        dataIndex: "lang_val",
        key: "lang_val"
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
        title: "Кто создал",
        dataIndex: "created_by",
        key: "created_by"
      },
      {
        title: "Кем обновлен",
        dataIndex: "updated_by",
        key: "updated_by"
      },
      {
        title: "Активный",
        dataIndex: "active",
        key: "active",
        render: text => <Checkbox checked={text} />
      },
      {
        title: "Цвет",
        dataIndex: "color",
        key: "color",
        render: text => (
          <ColorPicker
            animation="slide-up"
            color={text === null ? "gray" : text}
            onClose={this.closeHandler}
          />
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
                  title="Изменить справочник"
                  visible={this.state.chModal}
                  onOk={() => this.handleUpdate(this.state.update_data[0])}
                  onCancel={this.changeHide}
                  okText="Изменить"
                  cancelText="Отменить"
                >
                  <Form layout="vertical" hideRequiredMark>
                    <Row gutter={1}>
                      <Col span={12}>
                        <Form.Item label="Тип">
                          {
                            <Input
                              type="text"
                              allowClear={true}
                              placeholder="Тип"
                              defaultValue={this.state.update_data[0].type}
                              value={this.state.update_data[0].type}
                              onChange={evt =>
                                this.handleChange(
                                  evt,
                                  this.state.update_data[0],
                                  "type"
                                )
                              }
                            />
                          }
                        </Form.Item>
                        <Form.Item label="Код">
                          {
                            <Input
                              type="text"
                              allowClear={true}
                              placeholder="Код"
                              defaultValue={this.state.update_data[0].code}
                              value={this.state.update_data[0].code}
                              onChange={evt =>
                                this.handleChange(
                                  evt,
                                  this.state.update_data[0],
                                  "code"
                                )
                              }
                            />
                          }
                        </Form.Item>
                        <Form.Item label="Язык">
                          <Select
                            allowClear={true}
                            defaultValue={this.state.lang}
                            value={this.state.lang}
                            onChange={val => this.setState({ lang: val })}
                          >
                            {localizeLang.map(gr =>
                              gr.lang === sessionStorage.getItem("lang") ? (
                                <Option key={gr.val} value={gr.val}>
                                  {gr.name}
                                </Option>
                              ) : null
                            )}
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col
                        span={12}
                        style={{
                          paddingLeft: "10px"
                        }}
                      >
                        <Form.Item label="Значение">
                          {
                            <Input
                              type="text"
                              allowClear={true}
                              placeholder="Значение"
                              defaultValue={this.state.update_data[0].value}
                              value={this.state.update_data[0].value}
                              onChange={evt =>
                                this.handleChange(
                                  evt,
                                  this.state.update_data[0],
                                  "value"
                                )
                              }
                            />
                          }
                        </Form.Item>
                        <Form.Item label="Родит. значение">
                          <Select
                            allowClear={true}
                            defaultValue={this.state.parent_id}
                            value={this.state.parent_id}
                            onChange={val => this.setState({ parent_id: val })}
                          >
                            {this.state.parent_val_list.map(gr => (
                              <Option key={gr.id} value={gr.id}>
                                {gr.value}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <Form.Item label="Активный">
                          {
                            <Checkbox
                              checked={this.state.update_data[0].active}
                              onChange={evt =>
                                this.handleChange(
                                  evt,
                                  this.state.update_data[0],
                                  "active"
                                )
                              }
                            />
                          }
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={1}>
                      <Form.Item label="Цвет">
                        {
                          <SwatchesPicker
                            color={
                              this.state.color === null
                                ? "gray"
                                : this.state.color
                            }
                            onChangeComplete={this.colorPick}
                          />
                        }
                      </Form.Item>
                    </Row>
                  </Form>
                </Modal>
                <Popconfirm
                  placement="topLeft"
                  title="Удалить справочник?"
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
    render: (text, record) => (
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
  colorPick = color => {
    this.setState({ color: color.hex === "#ffffff" ? null : color.hex });
  };
  handleChange = (evt, updRecord, field) => {
    var data = [];
    let type = updRecord.type;
    let value = updRecord.value;
    let code = updRecord.code;
    let active = updRecord.active;

    if (field === "type") {
      type = evt.target.value;
    }
    if (field === "value") {
      value = evt.target.value;
    }
    if (field === "code") {
      code = evt.target.value;
    }
    if (field === "active") {
      active = evt.target.checked;
    }

    data.push({
      id: updRecord.id,
      type: type,
      value: value,
      code: code,
      active: active
    });
    this.setState({
      update_data: data
    });
  };
  handleDelete = record => {
    //message.info("Clicked on Yes.");
    this.setState({ loading: true });
    axios
      .delete(sessionStorage.getItem("b_url") + "list_of_val?id=" + record.id, {
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
      type: updRecord.type,
      value: updRecord.value,
      code: updRecord.code,
      active: updRecord.active,
      color: this.state.color,
      parent_id:
        this.state.parent_id === undefined ? null : this.state.parent_id,
      lang: this.state.lang
    };
    axios({
      method: "post",
      url: sessionStorage.getItem("b_url") + "list_of_val",
      data: requestBody,
      headers: headersConfig
    })
      .then(res => {
        this.refresh();
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
      type: record.type,
      value: record.value,
      code: record.code,
      active: record.active
    });
    this.setState({
      chModal: true,
      parent_id: record.parent_id,
      lang: record.lang,
      update_data: data,
      color: record.color
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
      .get(sessionStorage.getItem("b_url") + "list_of_val" + searchFilter, {
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
    axios
      .get(sessionStorage.getItem("b_url") + "list_of_val?mode=1&active=true", {
        headers: {
          Authorization: "Bearer " + sessionStorage.getItem("credentials")
        }
      })
      .then(res => {
        this.setState({ parent_val_list: res.data });
      })
      .catch(res => {});
  };

  componentDidMount() {
    this.refresh();
  }

  render() {
    return (
      <div>
        <div>
          <NewReference refreshClientComponent={this.refresh} />
        </div>
        <Table
          rowKey="id"
          columns={this.columns}
          dataSource={this.state.data_res}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: false
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

export default List_of_val;
