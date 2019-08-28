import { Table, message, Icon, BackTop, Tag } from "antd";
import React, { Component } from "react";
import axios from "axios";
import "antd/dist/antd.css";
import moment from "moment";
import { connect } from "react-redux";

class ClientUsers extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data_res: [],
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
            <Tag color={record.pos_color}>{record.pos_val}</Tag>
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
      }
    ];
  }

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
      .get(sessionStorage.getItem("b_url") + "customer_users?" + ParentId, {
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
export default connect(mapStateToProps)(ClientUsers);
