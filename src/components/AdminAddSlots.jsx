
import React from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import axios from "axios";
// import { LocalizationProvider } from "@mui/x-date-pickers";
// import { DatePicker } from "@mui/x-date-pickers";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers";
import TextField from "@mui/material/TextField";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import './adminaddslot.css';
import Checkbox from '@mui/material/Checkbox';
import FormLabel from '@mui/material/FormLabel';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useNavigate } from "react-router-dom";
import { id } from "date-fns/locale";

const AdminSlots = () => {
  const maxDate = new Date();
  const currentDate = new Date();
maxDate.setDate(currentDate.getDate() + 30);
  var ground = useSelector((state) => state.ground);
  var image = useSelector((state) => state.image);
  var params = useParams();
  var navigate=useNavigate()
  var index = params.index;
  const [dates, setDate] = useState([]);
  const[selectedCheckboxes,setSelectedCheckboxes] = useState([]);
  const [aslot, setSlots] = useState([]);
  const [postslot, setPost] = useState({
    id : "",
    name: ground[index],
    date: "",
    slot: "",
    
  });
  function getvalue(e){
    e.preventDefault()
    setPost({ ...postslot, [e.target.name]: e.target.value })
  }
 
  function viewSlot(e) {
    e.preventDefault()
    const currentIndex = selectedCheckboxes.indexOf(e.target.value);
        const newCheckboxes = [...selectedCheckboxes];
        // const newCheckboxes = selectedCheckboxes;

        if (currentIndex === -1) {
            newCheckboxes.push(e.target.value);
        } else {
            newCheckboxes.splice(currentIndex, 1);
        }

        setSelectedCheckboxes(newCheckboxes);
    // setPost({...postslot,[e.target.name]:e.target.value});
  }
  useEffect(()=>{
    axios({
        method: "get",
        url: "http://localhost:3003/admintime",
      }).then(
        (res) => {
          setSlots(res.data);
        },
        (error) => {
          alert("Database not connected");
        }
      )
  },[])
  function addSlot(e) {
    e.preventDefault();

    // Retrieve the last object's id from the database
    axios.get("http://localhost:3003/slots").then((res) => {
      const lastSlotId = res.data[res.data.length - 1].id; // Assuming _id is the id field in your MongoDB document

      // Add 1 to the last object's id to get the new id for the new slot
      const newId = lastSlotId + 1;

      // Add the new id to the postslot data
      postslot.id = newId;
      
      // Post the slot with the updated data
      var len = selectedCheckboxes.length;
      postslot.slot = selectedCheckboxes;

        // Post the slot with the updated data
        axios({
            method: "post",
            url: "http://localhost:3003/slots",
            data: {  // Include id in the request body
              name: postslot.name,
              date: postslot.date,
              slot: postslot.slot,
              id: newId  // Use the newId variable here
            },
            headers: {
                Authorization: localStorage.token,
            },
        }).then(
            (res) => {
                Swal.fire("Done", `${selectedCheckboxes.length} slots added successfully`, "success");
                navigate("/adminview");
            },
            (error) => {
                alert("Database not connected");
            }
        );
    });
}


  return (
    <div>
      {/* <h1> hi</h1> */}
      <form className="main1">
        <div className="main">
        <h4 className="gro">{ground[index]}</h4>
        <img src={image[index]} style={{ height: "50vh", width: "60vh" }} className="image5"></img>
        </div>
        <br></br>
        {/* <input type='date' onChange={getvalue} disablePast name="date"></input><br></br> */}

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
                }
              }}
              className="myDatePicker"
            //   value ={selectedDate}
            //   slotProps={{ textField: { fullWidth: true } }}
              renderinput={(params) => <TextField {...params} />} 
              onChange={(newValue) => {
                const d=format(newValue, 'yyyy-MM-dd')
                setPost({ ...postslot, 'date': d })
              }}
            />
            </div>
            <br /><br />
          </LocalizationProvider>


        <div>
        {
        aslot[0]?.slots?.map((slot, index) => {
          return (
          <div>
            <form>
                {((postslot?.date)?
                
                    <div className="checkb">

              {/* <input type="checkbox" value={slot} name="slot" onChange={viewSlot}
              checked={selectedCheckboxes.includes(slot)} />
              <label>{slot}</label> */}

<FormGroup>
  <FormControlLabel sx={{
    '& .MuiSvgIcon-root': {
        color:" #a3712a",
        fontSize: 30, // Increase the font size of the checkbox icon
      }
  }} control={<Checkbox type="checkbox" color="secondary" value={slot} name="slot" onChange={ viewSlot } checked={selectedCheckboxes.includes(slot)} />} label={<h4
    sx={{
      color:"black",
      fontSize: "100px", // Increase the font size of the label
    }}
  >
    {slot}
  </h4>} />
  {/* <FormControlLabel required control={<Checkbox />} label="Required" />
  <FormControlLabel disabled control={<Checkbox />} label="Disabled" /> */}
</FormGroup>

              
              </div>
              :"")}
            </form>
          </div>)
        })}
                    <button class="btn-8 me-2 addslot" onClick={addSlot}>
            Add Slot
          </button>
        </div>
      </form>
    </div>
  );
};
export default AdminSlots;