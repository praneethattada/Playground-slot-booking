import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

import { useNavigate } from 'react-router-dom';
import Checkbox from '@mui/material/Checkbox';
import FormLabel from '@mui/material/FormLabel';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import './adminedit.css'

const AdminEdit = () => {
  const navigate = useNavigate();
  var params = useParams();
  const id = params.id;
  const [addSlot, setAddSlot] = useState([]);
  const[selectedCheckboxes,setSelectedCheckboxes]=useState([])
  const [edit, setEdit] = useState();
  const [newslots, setnewSlots] = useState([])
  const [slots, setSlots] = useState({
    username: "",
    date: "",
    name:"",
    slot: [],
  });

  const { username, name,date, slot } = slots;

  function slotEdit(e){
    // e.preventDefault()
    axios({
      method: "get",
      url: `http://localhost:3003/slots`,
    }).then(
      (res) => {
        setnewSlots(res.data)
        deleteSlot()
        // console.log(res.data);
      },
      (error) => {
        alert("Database not connected");
      }
    );

  }
  var difference=[]
  function deleteSlot(){
    newslots?.map((sl)=>{
      if (sl.name == slots?.name && sl.date == slots?.date) {
        var arr1=sl.slot
        var arr2=slots?.slot
        difference = arr1.filter(item => !arr2.includes(item));
        console.log(difference)
    }})
    
    // newslots?.map((new)=>{

    // })
  }
  const onSubmit = async (e) => {
    slots.slot=slots.slot.concat(selectedCheckboxes)
    e.preventDefault();
    await axios.put(`http://localhost:3003/postslots/${id}`, slots);
    alert("Updated Record")
    
    slotEdit()
    // navigate(`/adminview`)

  };

  function getvalue(e){
    const currentIndex = selectedCheckboxes.indexOf(e.target.value);
    const newCheckboxes = [...selectedCheckboxes];
   

    if (currentIndex === -1) {
        newCheckboxes.push(e.target.value);
    } else {
        newCheckboxes.splice(currentIndex, 1);
    }

    setSelectedCheckboxes(newCheckboxes);
    
    // e.preventDefault()
  }
  const onInputChange = (e) => {
    //console.log(e.target.value);
    setSlots({ ...slots, [e.target.name]: e.target.value });
  };
  useEffect(() => {
    axios({
      method: "get",
      url: `http://localhost:3003/postslots/${id}`,
    }).then(
      (res) => {
        setSlots(res.data);
        console.log(res.data);
      },
      (error) => {
        alert("Database not connected");
      }
    );
  }, []);

  useEffect(() => {
    axios({
      method: "get",
      url: `http://localhost:3003/slots`,
    }).then(
      (res) => {
        setEdit(res.data);
        console.log(res.data);
      },
      (error) => {
        alert("Database not connected");
      }
    );
  }, []);
  function editSlot(e) {
    e.preventDefault()
    // console.log(name);
    edit.map((d, i) => {
        
        if(d.date==date && d.name==name){
          console.log(d.slot)
            setAddSlot(d.slot)
        }
    //   d.date==date && d.name==name ? setAddSlot(d.slot) : setAddSlot("SLOT");
    });
  }
  console.log(addSlot);
  return (
    <div className="container" style={{paddingTop:"10%",marginBottom:"10%"}}>
      <div className="w-75 mx-auto shadow p-5">
        <h2 className="text-center mb-4">Edit A User</h2>
        <form>
          <div className="form-group">
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Enter your Ground"
              name="name"
              value={name}
              maxLength={30}
              onChange={(e) => onInputChange(e)}
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Enter your User Name"
              name="username"
              value={username}
              maxLength={30}
              onChange={(e) => onInputChange(e)}
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Enter your Date"
              name="date"
              value={date}
              onChange={(e) => onInputChange(e)}
            />
          </div>
          <div className="form-group">
            {/* <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Enter your E-mail Address"
              name="slot"
              value={slot}
              onChange={(e) => onInputChange(e)}
            /> */}
            <table>
              <tr>
                <th style={{color:"white"}}>slots</th>
              </tr><br></br>
              {slot?.map((s) => {
                return <tr>{s}</tr>;
              })}
              <tr></tr>
              <br></br>
              <tr>
                <th>
                  <button className="btn5" onClick={editSlot}>
                    Add
                  </button>
                </th>
              </tr>
              {/* {addSlot?.map((a) => {
                return (
              
                  <tr style={{backgroundColor:"red"}}>
                     <input type="checkbox" value={a} name="slot" 
                                    onChange={getvalue}
                                    checked={selectedCheckboxes.includes(a)}  />
                    <label>{a}</label>


                  </tr>
                );
              })} */}
            </table>
          </div><br></br>

          
          {addSlot?.map((a) => {
                return (
              
                  <div>
                     {/* <input type="checkbox" value={a} name="slot" 
                                    onChange={getvalue}
                                    checked={selectedCheckboxes.includes(a)}  />
                    <label>{a}</label> */}
                    <FormGroup>
  <FormControlLabel control={<Checkbox type="checkbox" color="warning" value={a} name="slot" onChange={ getvalue } checked={selectedCheckboxes.includes(a)} />} label={a} />
  {/* <FormControlLabel required control={<Checkbox />} label="Required" />
  <FormControlLabel disabled control={<Checkbox />} label="Disabled" /> */}
</FormGroup>


                  </div>
                );
              })}

          <button className="btn6" onClick={onSubmit}>
            Update User
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminEdit;