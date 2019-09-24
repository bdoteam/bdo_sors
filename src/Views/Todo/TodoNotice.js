import React, { Component } from "react";
import axios from "axios";
import { Badge } from "antd";

class TodoNotice extends Component {
  constructor(props) {
    super(props);
  }
  state = {
    notice_count: 0,
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

  getNoticeList = () => {
    axios
      .get(
        sessionStorage.getItem("b_url") +
          "act_notice?action_id=" +
          this.props.record_id,
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("credentials")
          }
        }
      )
      .then(res => {
        if (res.data.length != this.state.notice_count) {
          this.setState({ notice_count: res.data.length });
        }
      })
      .catch(res => {});
  };

  render() {
    return (
      <div>
        <Badge
          style={{ top: -12 }}
          offset="50,0"
          count={this.state.notice_count}
        >
          <a className="ant-tooltip-inner">{this.props.record_id}</a>
        </Badge>
      </div>
    );
  }
}

export default TodoNotice;
