import { Tabs, Badge } from "antd";
import React, { Component } from "react";
import Actions_loader from "../LoaderActions";
import Todo_Comment from "./TodoComments";
import { connect } from "react-redux";
import axios from "axios";

const TabPane = Tabs.TabPane;

class TodoSlidingTabs extends Component {
  constructor(props) {
    super(props);
  }
  state = {
    mode: "top",
    doc_count: 0,
    comm_count: 0,
    intervalId: ""
  };
  componentWillMount() {
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
          "act_notice?&action_id=" +
          this.props.ParentId +
          "&comment",
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("credentials")
          }
        }
      )
      .then(res => {
        if (res.data.length != this.state.comm_count) {
          this.setState({ comm_count: res.data.length });
        }
        axios
          .get(
            sessionStorage.getItem("b_url") +
              "act_notice?&action_id=" +
              this.props.ParentId +
              "&attach",
            {
              headers: {
                Authorization: "Bearer " + sessionStorage.getItem("credentials")
              }
            }
          )
          .then(res => {
            if (res.data.length != this.state.doc_count) {
              this.setState({ doc_count: res.data.length });
            }
          })
          .catch(res => {});
      })
      .catch(res => {});
  };

  render() {
    const { mode } = this.state;
    return (
      <div>
        <Tabs tabPosition={mode} style={{ height: 700 }}>
          {this.props.attach === "ban_m" ? null : (
            <TabPane
              tab={
                <Badge
                  style={{ top: -5 }}
                  offset="50,0"
                  count={this.state.doc_count}
                >
                  Документы
                </Badge>
              }
              key="1"
            >
              <Actions_loader ParentId={this.props.ParentId} />
            </TabPane>
          )}
          {this.props.comment === "ban_m" ? null : (
            <TabPane
              tab={
                <Badge
                  style={{ top: -5 }}
                  offset="50,0"
                  count={this.state.comm_count}
                >
                  Комментарии
                </Badge>
              }
              key="2"
            >
              <Todo_Comment ParentId={this.props.ParentId} /> ,
            </TabPane>
          )}
        </Tabs>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    attach: state.attach,
    comment: state.comment
  };
};
export default connect(mapStateToProps)(TodoSlidingTabs);
