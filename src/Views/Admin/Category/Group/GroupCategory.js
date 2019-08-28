import { Tabs } from "antd";
import React, { Component } from "react";
import Access from "./Access";
const TabPane = Tabs.TabPane;

class GroupSlidingTabs extends Component {
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
          <TabPane tab="Доступ" key="1">
            <Access ParentId={this.props.ParentId} />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
export default GroupSlidingTabs;
