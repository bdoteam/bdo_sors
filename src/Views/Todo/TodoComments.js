import {
  Tabs,
  Comment,
  Avatar,
  Form,
  Button,
  List,
  Input,
  message
} from "antd";
import React, { Component } from "react";
import axios from "axios";
import { connect } from "react-redux";

const TextArea = Input.TextArea;

const CommentList = ({ comments }) => (
  <List
    itemLayout="vertical"
    size="large"
    pagination={{
      onChange: page => {
        console.log(page);
      },
      pageSize: 3
    }}
    dataSource={comments}
    header={`${comments.length} ${comments.length > 1 ? "replies" : "reply"}`}
    itemLayout="horizontal"
    renderItem={props => <Comment {...props} />}
  />
);

const Editor = ({ disabled, onChange, onSubmit, submitting, value }) => (
  <div>
    <Form.Item>
      <TextArea rows={4} onChange={onChange} value={value} />
    </Form.Item>
    <Form.Item>
      <Button
        disabled={disabled === "read_m" ? true : false}
        htmlType="submit"
        loading={submitting}
        onClick={onSubmit}
        type="primary"
      >
        Добавить комментарий
      </Button>
    </Form.Item>
  </div>
);

const TabPane = Tabs.TabPane;

class TodoComments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: "top",
      comments: [],
      submitting: false,
      value: "",
      data: []
    };
  }

  refresh = () => {
    this.setState({ loading: true });
    axios
      .get(
        sessionStorage.getItem("b_url") +
          "actions_comm?actions_id=" +
          this.props.ParentId,
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("credentials")
          }
        }
      )
      .then(res => {
        var dataComments = [];
        for (var i = 0; i < res.data.length; i++) {
          dataComments.push({
            content: res.data[i].comment,
            author: res.data[i].created_by,
            avatar: (
              <Avatar src={res.data[i].avatar} alt={res.data[i].created_by} />
            ),

            datetime: res.data[i].created
          });
        }
        this.setState({ comments: dataComments });
      })
      .catch(res => {
        this.setState({ loading: false });
        if (res.response.data.error_code === 401) {
          message.error(res.response.data.message);
        }
      });
    this.setState({ loading: false });
  };

  componentDidMount() {
    axios
      .delete(
        sessionStorage.getItem("b_url") +
          "act_notice?action_id=" +
          this.props.ParentId +
          "&comment",
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("credentials")
          }
        }
      )
      .then(res => {})
      .catch(res => {});
    this.refresh();
  }

  handleSubmit = () => {
    if (!this.state.value) {
      return;
    }

    this.setState({
      submitting: true
    });
    let headersConfig = {
      Authorization: "Bearer " + sessionStorage.getItem("credentials")
    };
    const requestBody = {
      comment: this.state.value,
      actions_id: this.props.ParentId
    };
    axios({
      method: "post",
      url: sessionStorage.getItem("b_url") + "actions_comm",
      data: requestBody,
      headers: headersConfig
    })
      .then(res => {
        this.componentDidMount();
        this.setState({ loading: false });
        if (res.data.detailed_message !== "") {
          this.setState({ value: "", submitting: false });
          message.success(res.data.detailed_message);
        }
      })
      .catch(res => {
        this.setState({ loading: false, submitting: false });
        if (res.response.data.error_code === 401) {
          message.error(res.response.data.message);
        }
      });
  };

  handleChange = e => {
    this.setState({
      value: e.target.value
    });
  };

  handleModeChange = e => {
    const mode = e.target.value;
    this.setState({ mode });
  };

  render() {
    const { mode } = this.state;
    const { comments, submitting, value } = this.state;
    return (
      <div>
        {comments.length > 0 && <CommentList comments={comments} />}
        <Comment
          avatar={<Avatar src={this.props.avatar} alt={this.props.login} />}
          content={
            <Editor
              disabled={this.props.comment}
              onChange={this.handleChange}
              onSubmit={this.handleSubmit}
              submitting={submitting}
              value={value}
            />
          }
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    comment: state.comment,
    avatar: state.avatar
  };
};
export default connect(mapStateToProps)(TodoComments);
