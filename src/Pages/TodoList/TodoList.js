import React, { useState, useEffect } from "react";
import "./TodoList.css";
import firebase from "firebase/compat/app";
import { storage, auth } from "../../Firebase/Firebase";
import Swal from "sweetalert2";
import { Button, TextField, Paper, Checkbox } from "@mui/material";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import UpdateIcon from "@mui/icons-material/Update";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import moment from "moment";

function TodoList() {
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [isCompleted, setCompleted] = useState(0);
  const [isRemaining, setRemaining] = useState(0);

  useEffect(() => {
    auth.onAuthStateChanged((res) => {
      if (res) {
        setUser(res);
      }else{
        setUser(null);
      }
    });
  }, []);


  const userEmail= user?user.email:"abc@example.com"

  const selectionRange = {
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  };
  const handleSelect = (ranges) => {
    console.log(ranges);
    // {
    //   selection: {
    //     startDate: [native Date Object],
    //     endDate: [native Date Object],
    //   }
    // }
  };

  useEffect(() => {
    getData();

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

  // Get Date
  const getData = () => {
    console.log(userEmail)
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

  // Add
  const Add = async (e) => {
    e.preventDefault();
    // console.log(text)
    // console.log(moment(startDate).format("DD/MM/YYYY"));
    // console.log(moment(endDate).format("DD/MM/YYYY"));
    await storage
      .collection(userEmail)
      .add({
        Text: text,
        Complete: false,
        StartDate: moment(startDate).format("DD-MM-YYYY"),
        EndDate: moment(endDate).format("DD-MM-YYYY"),
        ServerTimeStamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then((e) => {
        console.log(e);
        setText("");
        setStartDate()
        setEndDate()
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
  };

  // Update
  const Update = async (id, checked, statusUpdate) => {
    if (id && statusUpdate) {
      await storage.collection(userEmail).doc(id).update({ Complete: checked });
    } else {
      const { value: text } = await Swal.fire({
        title: "Enter Udated Todo ",
        input: "text",
        inputPlaceholder: "Enter updated todo",
      });
      console.log(text);

      // const modifyTodo = prompt("Enter New Todo ☑️");
      if (text) {
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
  // // Update Task Status
  // const UpdateStatus = (id, checked) => {
  //     storage
  //     .collection(userEmail)
  //     .doc(id)
  //     .update({ Complete:checked })
  // }

  // Delete
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

  // DeleteAll
  const DeleteAll = () => {
    Swal.fire({
      title: "Are You Sure, You Want To Delete All Todos?",
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: "Yes",
    }).then(async(result) => {
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
      <h1 className="Todo_Header">☑ TODO LIST APP</h1>

      <form>
        <Paper elevation={5} className="Add_Todo">
          <TextField
            className="Text_Field"
            label="Enter Todos"
            value={text}
            onChange={(e) => setText(e.target.value)}
            inputProps={{ maxLength: 55 }}
          />
          <br /> <br />
          {/* <DateRangePicker
          showSelectionPreview={true}
           ranges={[selectionRange]}
          onChange={handleSelect}
        /> */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DesktopDatePicker
              label="Start Date"
              inputFormat="DD/MM/YYYY"
              disablePast={true}
              value={startDate}
              onChange={setStartDate}
              renderInput={(params) => <TextField {...params} />}
            />{" "}
            &nbsp;
            <DesktopDatePicker
              label="End Date"
              inputFormat="DD/MM/YYYY"
              disablePast={true}
              value={endDate}
              onChange={setEndDate}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
          <br /> <br />
          <Button
            type="sumit"
            variant="contained"
            color="primary"
            disabled={!text}
            onClick={Add}
          >
            ADD &nbsp;
            <AddBoxOutlinedIcon />
          </Button>
          <Button variant="contained" color="primary" onClick={DeleteAll}>
            DELETE ALL &nbsp;
            <DeleteOutlineOutlinedIcon />
          </Button>
        </Paper>
      </form>

      {/* <h2 className="Todo_SubHeading">THINGS TO DO</h2> */}
      <h3 className="Todo_Analysis">
        Total Tasks: {todos.length}, Completed: {isCompleted.length}, Remaining:{" "}
        {isRemaining.length}{" "}
      </h3>

      {todos.map((data, i) => {
        return (
          <Paper elevation={5} className="Todos_Rendering" key={i}>
            <div>
              <Checkbox
                checked={data.Complete ? true : false}
                onChange={(e) => {
                  Update(data.id, e.target.checked, "statusUpdate");
                }}
              />
            </div>

            <div className="Text_Container">
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

            <div className="Button_Container">
              <Button
                variant="contained"
                color="primary"
                onClick={() => Update(data.id)}
              >
                UPDATE &nbsp; <UpdateIcon />
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => Delete(data.id)}
              >
                DELETE &nbsp;
                <DeleteOutlineOutlinedIcon />
              </Button>
            </div>
          </Paper>
        );
      })}

    </div>
  );
}

export default TodoList;
