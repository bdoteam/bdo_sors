import { Tabs } from "antd";
import React, { Component } from "react";
import File_Loader from "../Loader";
import Todo from "../Todo";
import ClientContact from "../Contact";
import ClientUsers from "./ClientUsers";
import { connect } from "react-redux";
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
            <TabPane tab={localName("Документы")} key="1">
              <File_Loader ParentId={this.props.ParentId} />
            </TabPane>
          )}
          {this.props.action === "ban_m" ? null : (
            <TabPane tab={localName("Задачи")} key="2">
              <Todo ParentId={this.props.ParentId} />
            </TabPane>
          )}
          <TabPane tab={localName("Контакты")} key="3">
            <ClientContact ParentId={this.props.ParentId} />
          </TabPane>
          <TabPane tab={localName("Связанные пользователи")} key="4">
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
