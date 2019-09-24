import React from "react";
import PropTypes from "prop-types";
// @material-ui/core components
import withStyles from "@material-ui/core/styles/withStyles";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
// @material-ui/icons
import PermIdentity from "@material-ui/icons/PermIdentity";
import PassIcon from "@material-ui/icons/VpnKey";
// core components
import GridContainer from "../../components/material-dashboard-pro-react/Grid/GridContainer.jsx";
import GridItem from "../../components/material-dashboard-pro-react/Grid/GridItem.jsx";
import Button from "../../components/material-dashboard-pro-react/CustomButtons/Button.jsx";
import CustomInput from "../../components/material-dashboard-pro-react/CustomInput/CustomInput.jsx";
import Card from "../../components/material-dashboard-pro-react/Card/Card.jsx";
import CardBody from "../../components/material-dashboard-pro-react/Card/CardBody.jsx";
import CardHeader from "../../components/material-dashboard-pro-react/Card/CardHeader.jsx";
import CardIcon from "../../components/material-dashboard-pro-react/Card/CardIcon.jsx";
import Clearfix from "../../components/material-dashboard-pro-react/Clearfix/Clearfix.jsx";
import CardAvatar from "../../components/material-dashboard-pro-react/Card/CardAvatar.jsx";

import { message } from "antd";
import axios from "axios";
import localizeLang from "../../components/Localization/lang";
import localize from "../../components/Localization/index";

import userProfileStyles from "../../components/material-dashboard-pro-react/Style/userProfileStyles.jsx";
const Option = Select.Option;
//функция для выбора языка
const localLang = name => {
  let result = name;
  let lang = sessionStorage.getItem("lang");
  {
    localizeLang.map(comp =>
      name === comp.name && lang === comp.lang ? (result = comp.val) : comp.name
    );
  }
  return result;
};

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
class UserProfile extends React.Component {
  state = {
    loading: false,
    data_detail: [
      {
        id: "",
        login: "",
        email: "",
        first_name: "",
        last_name: "",
        pos_name: "",
        group_val: ""
      }
    ],
    newpassword: "",
    renewpassword: ""
  };
  handleChange = event => {
    let headersConfig = {
      Authorization: "Bearer " + sessionStorage.getItem("credentials")
    };
    const requestBody = {
      id: this.state.data_detail[0].id,
      lang: event.target.value
    };
    axios({
      method: "post",
      url: sessionStorage.getItem("b_url") + "users",
      data: requestBody,
      headers: headersConfig
    })
      .then(res => {
        this.refresh();
        if (res.data.detailed_message !== "") {
          sessionStorage.setItem("lang", event.target.value);
          res.data.error_code == 0
            ? message.success(res.data.detailed_message)
            : message.error(res.data.detailed_message);
        }
      })
      .catch(res => {
        if (res.response.data.error_code === 401) {
          message.error(res.response.data.message);
        }
      });
  };
  onPassChange = (event, type) => {
    type === "new"
      ? this.setState({ newpassword: event.target.value })
      : this.setState({ renewpassword: event.target.value });
  };
  onSave = () => {
    if (this.state.newpassword === this.state.renewpassword) {
      this.setState({ loading: true });
      let headersConfig = {
        Authorization: "Bearer " + sessionStorage.getItem("credentials")
      };
      const requestBody = {
        password: this.state.newpassword
      };
      axios({
        method: "post",
        url: sessionStorage.getItem("b_url") + "change_password",
        data: requestBody,
        headers: headersConfig
      })
        .then(res => {
          this.refresh();
          this.setState({ loading: false, chModal: false });
          if (res.data.detailed_message !== "") {
            res.data.error_code == 0
              ? message.success(res.data.detailed_message)
              : message.error(res.data.detailed_message);
          }
        })
        .catch(res => {
          this.setState({ loading: false });
          if (res.response.data.error_code === 401) {
            message.error(res.response.data.message);
          }
        });
    } else {
      message.error(localName("Пароли не совпадают, введите заново!"));
    }
  };

  refresh = () => {
    this.setState({ loading: true });

    axios
      .get(sessionStorage.getItem("b_url") + "users?view=my", {
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

  componentWillMount() {
    this.refresh();
  }
  render() {
    const { classes } = this.props;
    return (
      <div>
        <GridContainer>
          <GridItem xs={12} sm={12} md={4}>
            <Card>
              <CardHeader color="rose" icon>
                <CardIcon color="rose">
                  <PassIcon />
                </CardIcon>

                <h4 className={classes.cardIconTitle}>
                  {localName("Изменить пароль")}
                </h4>
              </CardHeader>
              <CardBody>
                <GridItem xs={12} sm={12} md={5}>
                  <CustomInput
                    labelText={localName("Новый пароль")}
                    id="newpassword"
                    formControlProps={{
                      fullWidth: true
                    }}
                    inputProps={{
                      type: "password",
                      autoComplete: "off",
                      onChange: event => this.onPassChange(event, "new")
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={5}>
                  <CustomInput
                    labelText={localName("Повторить Новый пароль")}
                    id="renewpassword"
                    formControlProps={{
                      fullWidth: true
                    }}
                    inputProps={{
                      type: "password",
                      autoComplete: "off",
                      onChange: event => this.onPassChange(event, "renew")
                    }}
                  />
                </GridItem>

                <Button
                  color="rose"
                  className={classes.updateProfileButton}
                  onClick={this.onSave}
                >
                  {localName("Сохранить")}
                </Button>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem xs={12} sm={12} md={4}>
            <Card profile>
              <CardAvatar profile>
                <a href="#pablo" onClick={e => e.preventDefault()}>
                  <img src={sessionStorage.getItem("avatar")} alt="..." />
                </a>
              </CardAvatar>

              <CardBody profile>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={4}>
                    <CustomInput
                      labelText={localName("Пользователь")}
                      id="username-disabled"
                      formControlProps={{
                        fullWidth: true
                      }}
                      inputProps={{
                        disabled: true,
                        defaultValue: this.state.data_detail[0].login,
                        value: this.state.data_detail[0].login
                      }}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={4}>
                    <CustomInput
                      labelText="Email"
                      id="email-address"
                      formControlProps={{
                        fullWidth: true
                      }}
                      inputProps={{
                        disabled: true,
                        defaultValue: this.state.data_detail[0].email,
                        value: this.state.data_detail[0].email
                      }}
                    />
                  </GridItem>
                </GridContainer>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={4}>
                    <CustomInput
                      labelText={localName("Имя")}
                      id="first-name"
                      formControlProps={{
                        fullWidth: true
                      }}
                      inputProps={{
                        disabled: true,
                        defaultValue: this.state.data_detail[0].first_name,
                        value: this.state.data_detail[0].first_name
                      }}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={4}>
                    <CustomInput
                      labelText={localName("Фамилия")}
                      id="last-name"
                      formControlProps={{
                        fullWidth: true
                      }}
                      inputProps={{
                        disabled: true,
                        defaultValue: this.state.data_detail[0].last_name,
                        value: this.state.data_detail[0].last_name
                      }}
                    />
                  </GridItem>
                </GridContainer>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={4}>
                    <CustomInput
                      labelText={localName("Должность")}
                      id="position"
                      formControlProps={{
                        fullWidth: true
                      }}
                      inputProps={{
                        disabled: true,
                        defaultValue: this.state.data_detail[0].pos_name,
                        value: this.state.data_detail[0].pos_name
                      }}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={4}>
                    <CustomInput
                      labelText={localName("Группа")}
                      id="group"
                      formControlProps={{
                        fullWidth: true
                      }}
                      inputProps={{
                        disabled: true,
                        defaultValue: this.state.data_detail[0].group_val,
                        value: this.state.data_detail[0].group_val
                      }}
                    />
                  </GridItem>
                </GridContainer>
                <GridItem xs={12} sm={12} md={3}>
                  <InputLabel
                    style={{
                      class:
                        "MuiFormLabel-root MuiInputLabel-root CustomInput-labelRoot-175  MuiInputLabel-formControl MuiInputLabel-animated MuiInputLabel-shrink MuiFormLabel-filled"
                    }}
                  >
                    {localName("Язык")}
                  </InputLabel>
                  <Select
                    value={this.state.data_detail[0].lang}
                    onChange={this.handleChange}
                  >
                    {localizeLang.map(digest =>
                      digest.lang === sessionStorage.getItem("lang") ? (
                        <MenuItem value={digest.val}>{digest.name}</MenuItem>
                      ) : null
                    )}
                  </Select>
                </GridItem>

                <Clearfix />
              </CardBody>
            </Card>
          </GridItem>
        </GridContainer>
      </div>
    );
  }
}
UserProfile.propTypes = {
  classes: PropTypes.object
};

export default withStyles(userProfileStyles)(UserProfile);
