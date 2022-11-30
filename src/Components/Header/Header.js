import React, { useState, useEffect } from "react";
import "./Header.css";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import {
  Button,
  TextField,
  Paper,
  Menu,
  MenuItem,
  Avatar,
  Typography,
} from "@mui/material";

function Header({ auth, user }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // User Signout
  const signOut = () => {
    auth.signOut();
    localStorage.removeItem("token");
    window.history.replaceState(null, null, `/login`);
    window.location.reload(false);
  };

  return (
    <div className="header d-flex">
      <div className="col-md-1 col-sm-1">{""}</div>

      <div className="col-md-10 col-sm-10">
        <h1 className="todo-header">☑ TODO LIST APP</h1>
      </div>

      <div className="col-md-1 col-sm-1 d-flex justify-content-end">
        <Button
          id="demo-positioned-button"
          aria-controls={open ? "demo-positioned-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
        >
          {user?.photoURL ? (
            <Avatar
              alt="Avatar"
              referrer-policy="no-referrer"
              src={user?.photoURL}
              sx={{ width: 40, height: 40 }}
            />
          ) : (
            <AccountCircleIcon sx={{ width: 40, height: 40, color: "#ffff" }} />
          )}
        </Button>

        <Menu
          id="demo-positioned-menu"
          aria-labelledby="demo-positioned-button"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          PaperProps={{
            style: {
              transform: "translateX(10px) translateY(50px)",
            },
          }}
        >
          <MenuItem>
            <AccountCircleIcon sx={{ width: 20, height: 20, mr: 1 }} />
            <Typography sx={{ fontSize: 15 }}>
              {user?.displayName ? user.displayName : "John Doe"}
            </Typography>
          </MenuItem>
          
          <MenuItem onClick={() => signOut()}>
            <ExitToAppIcon sx={{ width: 20, height: 20, mr: 1 }} />
            <Typography sx={{ fontSize: 15 }}>Logout</Typography>
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
}

export default Header;
