import { Tabs } from "antd";
import React, { Component } from "react";
import Users from "./Users";
import Groups from "./Group";
import List_of_val from "./List_of_val";
const TabPane = Tabs.TabPane;

class AdminSlidingTabs extends Component {
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
        <Tabs defaultActiveKey="1" tabPosition={mode}>
          <TabPane tab="Пользователи" key="1">
            <Users />
          </TabPane>
          <TabPane tab="Группы пользователей" key="2">
            <Groups />
          </TabPane>
          <TabPane tab="Справочник значений" key="3">
            <List_of_val />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
export default AdminSlidingTabs;
