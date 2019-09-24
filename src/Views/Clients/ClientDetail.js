import {
  Form,
  message,
  Select,
  Input,
  Tag,
  Row,
  Col,
  Button,
  Icon
} from "antd";
import PhoneInput from "react-phone-number-input/basic-input";
import React from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ClientCategory from "./ClientCategory";
import { connect } from "react-redux";
import client_type from "../../components/ClientType";
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
const Option = Select.Option;
const ButtonGroup = Button.Group;
//функция для работы со справочниками вытаскиваем название по id
const digestName = (digest, id) => {
  let result = id;
  {
    digest.map(comp => (id === comp.id ? (result = comp.name) : comp.id));
  }
  return result;
};
class ClientDetailForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data_detail: [
        {
          id: "",
          name: "",
          bin: "",
          status: "",
          con_phone: "",
          type: "",
          description: ""
        }
      ]
    };
  }

  refresh = () => {
    this.setState({ loading: true });
    axios
      .get(sessionStorage.getItem("b_url") + "customer?id=" + this.props.id, {
        headers: {
          Authorization: "Bearer " + sessionStorage.getItem("credentials")
        }
      })
      .then(res => {
        this.setState({ data_detail: res.data });
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
    try {
      return (
        <div>
          <ButtonGroup>
            <Link to="/Client">
              <Button type="primary">
                <Icon type="left-circle" theme="twoTone" />
                {localName("Назад")}
              </Button>
            </Link>

            <Button onClick={() => this.refresh()}>
              <Icon type="reload" />
            </Button>
          </ButtonGroup>
          <ButtonGroup>
            <p style={{ marginLeft: 20 }}>
              <h4>
                {localName("Статус")}:
                <Tag
                  style={{ marginLeft: 5 }}
                  color={
                    this.state.data_detail[0].status == localName("Активный")
                      ? "green"
                      : "volcano"
                  }
                  key={this.state.data_detail[0].id}
                >
                  {this.state.data_detail[0].status}
                </Tag>
              </h4>
            </p>
          </ButtonGroup>
          <br />
          <br />

          <Form layout="vertical" hideRequiredMark>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item label={localName("Наименование клиента")}>
                  {
                    <Input
                      type="text"
                      placeholder={localName("Наименование клиента")}
                      defaultValue={this.state.data_detail[0].name}
                      value={this.state.data_detail[0].name}
                    />
                  }
                </Form.Item>
              </Col>
              <Col span={3}>
                <Form.Item label={localName("БИН")}>
                  {
                    <Input
                      readOnly
                      placeholder={localName("Введите БИН")}
                      defaultValue={this.state.data_detail[0].bin}
                      value={this.state.data_detail[0].bin}
                    />
                  }
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item label={localName("Тип клиента")}>
                  {
                    <Input
                      placeholder={localName("Тип клиента")}
                      defaultValue={digestName(
                        client_type,
                        this.state.data_detail[0].type
                      )}
                      value={digestName(
                        client_type,
                        this.state.data_detail[0].type
                      )}
                    />
                  }
                </Form.Item>
              </Col>
              <Col span={3}>
                <Form.Item label={localName("Контактный телефон")}>
                  {
                    <PhoneInput
                      className="ant-input"
                      country="KZ"
                      placeholder={localName("Контактный телефон")}
                      defaultValue={this.state.data_detail[0].con_phone}
                      value={this.state.data_detail[0].con_phone}
                    />
                  }
                </Form.Item>
              </Col>
            </Row>
            {this.props.user_group === "Manager" ? (
              <Row gutter={10}>
                <Col span={9}>
                  <Form.Item label={localName("Описание")}>
                    <Input.TextArea
                      rows={2}
                      allowClear={true}
                      placeholder={localName("Описание")}
                      defaultValue={this.state.data_detail[0].description}
                      value={this.state.data_detail[0].description}
                    />
                  </Form.Item>
                </Col>
              </Row>
            ) : null}
          </Form>
          <ClientCategory ParentId={this.props.id} />
        </div>
      );
    } catch (err) {
      return (
        <li>
          <span>
            <Tag color="volcano">
              <h1>Доступ запрещен</h1>
            </Tag>
          </span>
        </li>
      );
    }
  }
}

const WrappedClientDetailForm = Form.create()(ClientDetailForm);

const mapStateToProps = state => {
  return {
    user_group: state.user_group
  };
};
export default connect(mapStateToProps)(WrappedClientDetailForm);
