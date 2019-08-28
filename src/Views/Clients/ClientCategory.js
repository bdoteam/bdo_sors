import { Tabs } from "antd";
import React, { Component } from "react";
import File_Loader from "../Loader";
import Todo from "../Todo";
import ClientContact from "../Contact";
import ClientUsers from "./ClientUsers";
import { connect } from "react-redux";

const TabPane = Tabs.TabPane;

class ClientSlidingTabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: "top"
    };
  }

  handleModeChange = e => {
    const mode = e.target.value;
    this.setState({ mode });
  };

  render() {
    const { mode } = this.state;
    return (
      <div>
        <Tabs tabPosition={mode} style={{ height: 700 }}>
          {this.props.attach === "ban_m" ? null : (
            <TabPane tab="Документы" key="1">
              <File_Loader ParentId={this.props.ParentId} />
            </TabPane>
          )}
          {this.props.action === "ban_m" ? null : (
            <TabPane tab="Задачи" key="2">
              <Todo ParentId={this.props.ParentId} />
            </TabPane>
          )}
          <TabPane tab="Контакты" key="3">
            <ClientContact ParentId={this.props.ParentId} />
          </TabPane>
          <TabPane tab="Связанные пользователи" key="4">
            <ClientUsers ParentId={this.props.ParentId} />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    attach: state.attach,
    action: state.action
  };
};
export default connect(mapStateToProps)(ClientSlidingTabs);
