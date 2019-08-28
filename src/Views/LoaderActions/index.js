import {
  Upload,
  message,
  Row,
  Col,
  Icon,
  Table,
  Button,
  Popconfirm,
  Tag
} from "antd";
import React, { Component } from "react";
import "antd/dist/antd.css";
import axios from "axios";
import moment from "moment";
import { connect } from "react-redux";

const Dragger = Upload.Dragger;

const ButtonGroup = Button.Group;

class Actions_loader extends Component {
  constructor(props) {
    super(props);
    this.columns = [
      {
        title: "Назание файла",
        dataIndex: "name",
        key: "name"
      },
      {
        title: "Дата загрузки",
        dataIndex: "created",
        key: "created",
        render: text => (
          <span> {moment(text).format("DD.MM.YYYY HH:mm:ss")}</span>
        )
      },
      {
        title: "Кем загружен",
        dataIndex: "created_by",
        key: "created_by"
      },
      {
        title: "Размер файла(в байтах)",
        dataIndex: "size",
        key: "size"
      },

      {
        title: "Статус",
        dataIndex: "status",
        key: "status",
        render: (text, record) => (
          <span>
            <Tag
              color={record.status == "done" ? "green" : "volcano"}
              key={record.id}
            >
              {record.status == "done"
                ? "Загружен"
                : record.status == "uploading"
                ? "Загрузка.."
                : ""}
            </Tag>
          </span>
        )
      },
      {
        title: "Действия",
        dataIndex: "operation",
        render: (text, record) =>
          record.name != "" ? (
            <div>
              <ButtonGroup>
                <Button
                  onClick={() => this.FileDownload(record)}
                  shape="circle"
                >
                  <Icon type="download" />
                </Button>

                <Popconfirm
                  placement="topLeft"
                  title="Удалить файл?"
                  onConfirm={() => this.handleDelete(record)}
                  okText="Да"
                  cancelText="Нет"
                >
                  <Button
                    disabled={this.props.attach === "read_m" ? true : false}
                    type="danger"
                    shape="circle"
                  >
                    <Icon type="delete" />
                  </Button>
                </Popconfirm>
              </ButtonGroup>
            </div>
          ) : null
      }
    ];
  }
  state = {
    previewVisible: false,
    previewImage: "",
    loading: false,
    fileList: [
      {
        id: "",
        name: "",
        status: "",
        size: "",
        url: "",
        file: ""
      }
    ]
  };
  handleDelete = record => {
    axios
      .delete(sessionStorage.getItem("b_url") + "attach?id=" + record.id, {
        headers: {
          Authorization: "Bearer " + sessionStorage.getItem("credentials")
        }
      })
      .then(res => {
        this.refresh();
        if (res.data.detailed_message !== "") {
          res.data.error_code == 0
            ? message.success(res.data.detailed_message)
            : message.error(res.data.detailed_message);
        }
      })
      .catch(res => {
        try {
          if (res.response.data.error_code === 401) {
            message.error(res.response.data.message);
          }
        } catch (ex) {}
      });
  };

  onCreate = (newRecord, LZbase64Url) => {
    const headersConfig = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      Authorization: "Bearer " + sessionStorage.getItem("credentials")
    };
    const requestBody = {
      name: newRecord.name,
      size: newRecord.size,
      status: "done",
      actions_id: this.props.ParentId,
      file: LZbase64Url
    };

    axios({
      method: "post",
      url: sessionStorage.getItem("b_url") + "attach",
      data: requestBody,
      headers: headersConfig
    })
      .then(res => {
        if (res.data.detailed_message !== "") {
          this.refresh();
          res.data.error_code == 0
            ? message.success(res.data.detailed_message)
            : message.error(res.data.detailed_message);
        }
      })
      .catch(res => {
        try {
          if (res.response.data.error_code === 401) {
            message.error(res.response.data.message);
          }
        } catch (ex) {}
      });
  };

  refresh = () => {
    this.setState({ loading: true });
    axios
      .get(
        sessionStorage.getItem("b_url") +
          "attach?actions_id=" +
          this.props.ParentId,
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("credentials")
          }
        }
      )
      .then(res => {
        this.setState({ fileList: res.data, loading: false });
        axios
          .delete(
            sessionStorage.getItem("b_url") +
              "act_notice?action_id=" +
              this.props.ParentId +
              "&attach",
            {
              headers: {
                Authorization: "Bearer " + sessionStorage.getItem("credentials")
              }
            }
          )
          .then(res => {
            this.setState({ loading: false });
          })
          .catch(res => {});
      })
      .catch(res => {
        this.setState({ loading: false });
      });
  };

  componentDidMount() {
    this.refresh();
  }
  //загружаем файл из базы
  FileDownload(record) {
    this.setState({ loading: true });
    axios
      .get(sessionStorage.getItem("b_url") + "attach_file?id=" + record.id, {
        headers: {
          Authorization: "Bearer " + sessionStorage.getItem("credentials")
        }
      })
      .then(res => {
        this.base64toFile(res.data, record.name);
        this.setState({ loading: false });
      })
      .catch(res => {
        this.setState({ loading: false });
      });
  }
  //Переводим строку base64 в обьект файл и сразу открываем его
  base64toFile(dataurl, filename) {
    var arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    } //здесь мы делаем ссылку на обьект файл

    var csvURL = window.URL.createObjectURL(
      new File([u8arr], filename, { type: mime })
    );
    var tempLink = document.createElement("a");
    tempLink.href = csvURL;
    tempLink.setAttribute("download", filename);
    tempLink.click();
  }

  //Обьект файл переводим в строку base64 и сжимаем для передачи
  filetoBase64(file, callback) {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(file, reader.result));

    reader.readAsDataURL(file.originFileObj);
  }

  draggerOnChange = info => {
    this.setState({ loading: true });
    const status = info.file.status;
    if (status !== "uploading") {
      this.filetoBase64(info.file, this.onCreate);
      this.setState({ loading: false });
    }
  };
  render() {
    const props = {
      name: "file",
      multiple: true,
      showUploadList: false,
      accept: ".doc,.docx,.xls,.xlsx,.txt,image/*",

      onChange: this.draggerOnChange
    };
    return (
      <div className="clearfix">
        <ButtonGroup>
          <Button onClick={() => this.refresh()}>
            <Icon type="reload" />
          </Button>
        </ButtonGroup>
        <Row gutter={16}>
          <Col span={16}>
            <Table
              rowKey="id"
              onChange={() => this.refresh}
              loading={this.state.loading}
              columns={this.columns}
              dataSource={this.state.fileList}
              pagination={{
                defaultPageSize: 5
              }}
            />
          </Col>
          <Col span={8}>
            <Dragger
              disabled={this.props.attach === "read_m" ? true : false}
              {...props}
            >
              <p className="ant-upload-drag-icon">
                <Icon type="inbox" />
              </p>
              <p className="ant-upload-text">
                Нажмите или перетащите файл в эту область, чтобы загрузить
              </p>
              <p className="ant-upload-hint">
                Поддержка разовой или массовой загрузки
              </p>
              <p className="ant-upload-hint">
                Размер файла не должен превышать 3МБ
              </p>
            </Dragger>
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    attach: state.attach
  };
};
export default connect(mapStateToProps)(Actions_loader);
