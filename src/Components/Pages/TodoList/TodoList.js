import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./TodoList.css";
import firebase from "firebase/compat/app";
import { storage, auth } from "../../Firebase/Firebase";
import Swal from "sweetalert2";
import moment from "moment";
// Header
import Header from "../../Header/Header";
import { Button, TextField, Paper, Checkbox, IconButton } from "@mui/material";
// Mui Icons
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import UpdateIcon from "@mui/icons-material/Update";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
// Date Picker
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

function TodoList() {
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [isCompleted, setCompleted] = useState(0);
  const [isRemaining, setRemaining] = useState(0);

  var token = localStorage.getItem("token");
  var user = JSON.parse(token);
  var userEmail = user ? user.email : "com";

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      window.history.replaceState(null, null, `/login`);
    }
  }, []);

  useEffect(() => {
    getData();
    // Get Completd Task
    storage
      .collection(userEmail)
      .where("Complete", "==", true)
      .onSnapshot(function (querySnapshot) {
        setCompleted(
          querySnapshot.docs.map((doc) => ({
            Complete: doc.data().Complete,
          }))
        );
      });
    // Get Remaining Task
    storage
      .collection(userEmail)
      .where("Complete", "==", false)
      .onSnapshot(function (querySnapshot) {
        setRemaining(
          querySnapshot.docs.map((doc) => ({
            Complete: doc.data().Complete,
          }))
        );
      });
  }, []);

  // Get Todos Data
  const getData = () => {
    storage
      .collection(userEmail)
      .orderBy("ServerTimeStamp", "desc")
      .onSnapshot(function (querySnapshot) {
        setTodos(
          querySnapshot.docs.map((doc) => ({
            id: doc.id,
            Text: doc.data().Text,
            Complete: doc.data().Complete,
            StartDate: doc.data().StartDate,
            EndDate: doc.data().EndDate,
          }))
        );
      });
  };

  // Add Todo
  const Add = async (e) => {
    e.preventDefault();
    const startDateIso = moment(startDate.toISOString()).format("DD-MM-YYYY");
    const endDateIso = moment(endDate.toISOString()).format("DD-MM-YYYY");
    if (moment(endDate.toISOString()).isSameOrAfter(startDate.toISOString())) {
      await storage
        .collection(userEmail)
        .add({
          Text: text,
          Complete: false,
          StartDate: startDateIso,
          EndDate: endDateIso,
          ServerTimeStamp: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then((e) => {
          setText("");
          setStartDate(new Date());
          setEndDate(new Date());
          Swal.fire({
            icon: "success",
            title: "Todo Added Successfully!",
            showConfirmButton: false,
            timer: 3000,
          });
        })
        .catch((error) => {
          Swal.fire({
            icon: "error",
            position: "top-end",
            title: "Error",
            text: error.message,
            showConfirmButton: true,
            timer: 3000,
          });
        });
    } else {
      Swal.fire({
        icon: "warning",
        title: "Date Error!",
        html: ` <p><b>Start Date: ${startDateIso} - End Date: ${endDateIso}</b></p> <p>Start Date should not come after End Date</p>`,
        showConfirmButton: true,
      });
    }
  };

  // Update Todo
  const Update = async (data, checked, statusUpdate) => {
    const { id, Text } = data;
    if (id && statusUpdate) {
      // Update Todo status
      await storage.collection(userEmail).doc(id).update({ Complete: checked });
    } else {
      const { value: text } = await Swal.fire({
        title: "Enter Udated Todo!",
        input: "text",
        inputValue: Text,
        inputPlaceholder: "Enter updated todo",
        confirmButtonText: "Done",
        showCancelButton: true,
      });
      if (text) {
        // Update Todo Text
        await storage
          .collection(userEmail)
          .doc(id)
          .update({
            Text: text,
          })
          .then(() => {
            setText("");
            Swal.fire({
              icon: "success",
              title: "Todo Updated Successfully!",
              showConfirmButton: false,
              timer: 3000,
            });
          })
          .catch((error) => {
            Swal.fire({
              icon: "error",
              position: "top-end",
              title: "Error",
              text: error.message,
              showConfirmButton: true,
              timer: 3000,
            });
          });
      }
    } //else
  };

  // Delete Single Todo
  const Delete = async (id) => {
    await storage
      .collection(userEmail)
      .doc(id)
      .delete()
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Todo Deleted Successfully!",
          showConfirmButton: false,
          timer: 3000,
        });
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          position: "top-end",
          title: "Error",
          text: error.message,
          showConfirmButton: true,
          timer: 3000,
        });
      });
  };

  // Delete All Todos
  const DeleteAll = () => {
    Swal.fire({
      title: "Are You Sure, You Want To Delete All Todos?",
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: "Yes",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await storage
          .collection(userEmail)
          .get()
          .then((res) => {
            res.forEach((element) => {
              element.ref.delete();
            });
            Swal.fire({
              icon: "success",
              title: "All Todos Deleted Successfully",
              showConfirmButton: false,
              timer: 3000,
            });
          })
          .catch((error) => {
            Swal.fire({
              icon: "error",
              position: "top-end",
              title: "Error",
              text: error.message,
              showConfirmButton: true,
              timer: 3000,
            });
          });
      }
    });
  };

  return (
    <div>
      {/* Header */}
      <Header auth={auth} user={user} />

      {/* Todo Add Form */}
      <form>
        <Paper elevation={5} className="add-todo">
          <TextField
            className="text-field"
            label="Enter Todos"
            value={text}
            onChange={(e) => setText(e.target.value)}
            inputProps={{ maxLength: 100 }}
          />

          <div className="desktop-date-picker">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker
                className="date-picker"
                label="Start Date"
                inputFormat="DD/MM/YYYY"
                disablePast={true}
                value={startDate}
                onChange={setStartDate}
                renderInput={(params) => <TextField {...params} />}
              />
              <DesktopDatePicker
                className="date-picker"
                label="End Date"
                inputFormat="DD/MM/YYYY"
                disablePast={true}
                value={endDate}
                onChange={setEndDate}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
          </div>

          <div>
            <Button
              type="sumit"
              variant="contained"
              color="primary"
              disabled={!text}
              onClick={Add}
            >
              ADD
              <AddBoxOutlinedIcon sx={{ ml: 1 }} />
            </Button>
            <Button variant="contained" color="primary" onClick={DeleteAll}>
              DELETE ALL
              <DeleteOutlineOutlinedIcon sx={{ ml: 1 }} />
            </Button>
          </div>
        </Paper>
      </form>

      {/* Todos Task Analysis */}
      <h4 className="todo-analysis">
        Total Tasks: {todos.length}, Completed: {isCompleted.length}, Remaining:{" "}
        {isRemaining.length}
      </h4>

      {/* Todos Task List */}
      {todos?.map((data, i) => {
        return (
          <Paper elevation={5} className="todos-rendering" key={i}>
            <div>
              <Checkbox
                checked={data.Complete ? true : false}
                onChange={(e) => {
                  Update(data, e.target.checked, "statusUpdate");
                }}
              />
            </div>

            <div className="text-container">
              {data.Complete ? (
                <p>
                  <strike>{data.Text}</strike>
                </p>
              ) : (
                <p>{data.Text}</p>
              )}
              <span>
                {data.StartDate} - {data.EndDate}
              </span>
            </div>

            <div className="button-container">
              <IconButton onClick={() => Update(data)} color="primary">
                <UpdateIcon />
              </IconButton>
              <IconButton onClick={() => Delete(data.id)} color="primary">
                <DeleteOutlineOutlinedIcon />
              </IconButton>
            </div>
          </Paper>
        );
      })}
    </div>
  );
}

export default TodoList;
