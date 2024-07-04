import React, { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers";
import TextField from "@mui/material/TextField";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import "./adminviewslot.css";

const AdminViewSlots = () => {
  var ground = useSelector((state) => state.ground);
  const [slots, setSlots] = useState([]);
  var ground = useSelector((state) => state.ground)
    var image = useSelector((state) => state.image)
  const [date, setDate] = useState();
  const [status, setStatus] = useState(true);
  var params = useParams();
  var index = params.index;
  const maxDate = new Date();
  const currentDate = new Date();
maxDate.setDate(currentDate.getDate() + 30);
  //   useEffect(() => {
  //     axios({
  //       method: "get",
  //       url: "http://localhost:3003/postslots",
  //     }).then(
  //       (res) => {
  //         setSlots(res.data);
  //           console.log(res.data)
  //       },
  //       (error) => {
  //         alert("Database not connected");
  //       }
  //     );
  //   }, []);
  useEffect(() => {
    loadUsers();
  }, []);

  function loadUsers() {
    axios({
      method: "get",
      url: "http://localhost:3003/postslots",
    }).then(
      (res) => {
        setSlots(res.data);
        
        console.log(res.data);
        
      },
      (error) => {
        alert("Database not connected");
      }
    );
  }
  function deleteRecord(ind) {
    axios({
      method: "delete",
      url: `http://localhost:3003/postslots/${ind}`,
    }).then(
      (res) => {
        alert("Deleted Record");
        loadUsers();
      },
      (error) => {
        alert("Database not connected");
      }
    );
  }
  

  function deleteSlot(id, ind) {
    console.log(id);
    var slt = [];
    var slt2 = [];
    id = id - 1;

    var name = slots[id]?.name;
    var username = slots[id]?.username;
    var date = slots[id]?.date;
    var time = slots[id]?.slot[ind];
    console.log(name, username, date, time);
    slots[id].slot.map((s) => {
      if (time != s) {
        slt.push(s);
      } else if (time == s) {
      }
    });
    console.log(slt);
    id = id + 1;
    putSlot(id, name, username, date, slt);
  }

  
  function putSlot(id, name, username, date, slt) {
    var obj = {
      username: username,
      name: name,
      date: date,
      slot: slt,
      id: id,
    };
    console.log(obj);

    axios({
      method: "put",
      url: `http://localhost:3003/postslots/${id}`,
      data: obj,
    }).then(
      (res) => {
        alert("Deleted slot");
        loadUsers();
      },
      (error) => {
        alert("Database not connected");
      }
    );
  }
  function checkSlots(d){
    slots?.map((slot, ind) => {
      if (slot.name == ground[index] && slot.date == d){
        setStatus(true)
      }
  })}
  
  return (
    <>
      <div>
        <br></br>
      </div>
      <div className="main">
                <h4 className="gro">{ground[index]}</h4>
                <img src={image[index]} style={{ height: "50vh", width: "60vh" }} className="image4"></img>
                </div>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <div className="date">
          <DatePicker disablePast
          defaultValue={currentDate}
          maxDate={maxDate}
            label="Please Select the Date"
            sx={{
              '& .MuiSvgIcon-root': {
                  color:" #a3712a",
                  fontSize: 40, // Increase the font size of the checkbox icon
                }}}
            className="myDatePicker"
            //   value ={selectedDate}
            //   slotProps={{ textField: { fullWidth: true } }}
            renderinput={(params) => <TextField {...params} />}
            onChange={(newValue) => {
              
              setStatus(true);
              const d = format(newValue, "yyyy-MM-dd");
              console.log(d)
              setDate(d);
              // checkSlots(d);
              var p=0
              slots?.map((slot, ind) => {
                if (slot.name == ground[index] && slot.date == d){
                  p=1
                  setStatus(true)
                  
                }})
              if (p==0){
                setStatus(false)
              }
            }}
          />
          <br />
          <br />
        </div>
      </LocalizationProvider>

      {(status)? (
        <table
          class="table table-hover"
          style={{ borderBlockColor: "white"}}
        >
          <thead>
            <tr>
              <th style={{ color: "black" }}>Action</th>
              <th style={{ color: "black" }}>Username</th>
              <th style={{ color: "black" }}>Date</th>
              <th colSpan={12} style={{ color: "black" }}>
                Slots Booked
              </th>
            </tr>
          </thead>

          <tbody>
            {slots?.map((slot, ind) => {
              var id = slot.id;
              var id1 = slot.id;
              if (slot.name == ground[index] && slot.date == date) {
                return (
                  //   (slot.name==ground[index] && (slot.date==date))?
                  // <div class="overflow-auto">
                  
                  <>
                    
                    <tr>
                    
                      <td>
                        <button
                          class="btn3 btn-danger"
                          onClick={deleteRecord.bind(null, ind)}
                        >
                          Delete Record
                        </button>
                        &nbsp;&nbsp;
                        {/* <br></br> */}
                        <Link to={`/adminedit/${ind + 1}`}>
                          <button class="btn4 btn-warning">Edit Record</button>
                        </Link>{" "}
                      </td>
                      <td>
                        <b>{slot.username}</b>
                      </td>
                      <td>{slot.date}</td>
                      {/* <td>{slot.slot}</td>  */}

                      {slot?.slot?.map((time, ind) => {
                        console.log(id1);
                        return (
                          // <div class="overflow-auto" >
                          
                            <>
                              <td >{time}</td>
                              <td>
                                <button
                                  class="btn btn-outline-danger"
                                  onClick={deleteSlot.bind(null, id, ind)}
                                >
                                  Delete
                                </button>
                              </td>
                              <br></br>
                              {/* <td>Delete</td> */}
                            </>
                           
                        )
                      })}
                    </tr>
                   </>
                );
              }
            })}
          </tbody>
        </table>
      ) : (
        <div style={{marginLeft:"585px",marginBottom:"50px"}}>
        <h4>  No Slots Booked</h4></div>
      )}
    </>
  );
};

export default AdminViewSlots;
