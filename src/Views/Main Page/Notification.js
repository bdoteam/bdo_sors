import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Tag, message } from "antd";
import NoticeIcon from "ant-design-pro/lib/NoticeIcon";
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
class Notification extends Component {
  constructor(props) {
    super(props);
  }
  state = {
    mod_notice_list: [],
    intervalId: ""
  };
  componentDidMount() {
    this.getNoticeList();
    var intervalId = setInterval(this.getNoticeList, 30000);
    this.setState({ intervalId: intervalId });
  }
  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }
  onItemClick(item) {
    console.log(item.id);
  }
  //Получение списка назначенных уведомлений
  getNoticeList = () => {
    axios
      .get(sessionStorage.getItem("b_url") + "notice?status=new", {
        headers: {
          Authorization: "Bearer " + sessionStorage.getItem("credentials")
        }
      })
      .then(res => {
        if (res.data.length != this.state.mod_notice_list.length) {
          let tempList = [];
          res.data.map(list =>
            tempList.push({
              id: list.id,
              avatar: list.avatar,
              title: list.title,
              status: list.status,
              type: list.type,
              description: (
                <span>
                  <h3>
                    {localName("Задача")}:{" "}
                    <Link to={"/TodoDetail/" + list.action_id}>
                      {list.description}
                    </Link>
                  </h3>
                </span>
              ),
              extra: (
                <span>
                  <h2>
                    {localName("От")}:{" "}
                    <Tag color="#08979c">{list.notice_from}</Tag>
                  </h2>
                </span>
              ),
              datetime: list.datetime,
              type: list.type
            })
          );
          this.setState({ mod_notice_list: tempList });
          tempList = null;
        }
      })
      .catch(res => {
        if (res.response.data.error_code === 401) {
          message.error(res.response.data.message);
        }
      });
  };

  render() {
    return (
      <NoticeIcon
        className="notice-icon"
        count={this.state.mod_notice_list.length}
        onItemClick={this.onItemClick}
      >
        <NoticeIcon.Tab
          list={this.state.mod_notice_list}
          title={localName("Уведомления")}
          emptyText={localName("Нет уведомлений")}
          emptyImage="https://gw.alipayobjects.com/zos/rmsportal/wAhyIChODzsoKIOBHcBk.svg"
        />
      </NoticeIcon>
    );
  }
}

export default Notification;
