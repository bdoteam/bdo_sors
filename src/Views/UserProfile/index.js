import React from "react";
import { Avatar } from "antd";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemText from "@material-ui/core/ListItemText";
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
const StyledMenu = withStyles({
  paper: {
    border: "1px solid #d3d4d5"
  }
})(props => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "center"
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "center"
    }}
    {...props}
  />
));

const StyledMenuItem = withStyles(theme => ({
  root: {
    "&:focus": {
      backgroundColor: theme.palette.primary.main,
      "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
        color: theme.palette.common.white
      }
    }
  }
}))(MenuItem);

export default function CustomizedMenus() {
  const [anchorEl, setAnchorEl] = React.useState(null);

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
    console.log(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <div>
      <Avatar
        onClick={handleClick}
        shape="square"
        size="large"
        style={{
          width: "50px",
          height: "49px",
          marginBottom: "5px"
        }}
        src={sessionStorage.getItem("avatar")}
      />

      <StyledMenu
        id="customized-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <StyledMenuItem>
          <Link to="/UserProfile" style={{ color: "#757575" }}>
            <ListItemText primary={localName("Профиль")} />
          </Link>
        </StyledMenuItem>
        <StyledMenuItem>
          <Link to="/Login" style={{ color: "#757575" }}>
            <ListItemText primary={localName("Выход")} />
          </Link>
        </StyledMenuItem>
      </StyledMenu>
    </div>
  );
}
