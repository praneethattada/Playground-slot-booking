import React from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { DatePicker } from '@mui/x-date-pickers';
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'
import TextField from '@mui/material/TextField';

const SlotBooking = () => {
    var navigate = useNavigate()
    const[show,setShow]=useState()
    const [selectedDate, setSelectedDate] = useState(null);
    var token = localStorage.getItem(token)
    var ground = useSelector((state) => state.ground)
    // var index = useSelector((state) => state.index)
    var image = useSelector((state) => state.image)
    var username = useSelector((state) => state.username)
    const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
    var params = useParams()
    var index = params.index;
    // console.log(username)
    // console.log(image)
    // console.log(index)
    const [dates, setDate] = useState([])
    const [slots, setSlots] = useState([])
    const [bookedslots, setpostSlots] = useState([])
    const [Time, setTimeArray] = useState([])
    const [bookstatus, setStatus] = useState(true)
    const [postslot, setPost] = useState({
        username: username, name: ground[index], date: "", slot: []
    })
    var p=false
    const { date, slot } = postslot
    bookedslots?.map((slots)=>{
        if (slots.username==username){
            p=true
        }
    })
    function getvalue(e) {
        // console.log(Time)
        const currentIndex = selectedCheckboxes.indexOf(e.target.value);
        const newCheckboxes = [...selectedCheckboxes];
        // const newCheckboxes = selectedCheckboxes;

        if (currentIndex === -1) {
            newCheckboxes.push(e.target.value);
        } else {
            newCheckboxes.splice(currentIndex, 1);
        }

        setSelectedCheckboxes(newCheckboxes);
        // setPost({ ...postslot, [e.target.name]: e.target.value })
        if(!selectedCheckboxes){
           
            setShow(false)
        }
        // console.log(postslot)
        e.preventDefault()


    }
    function newSlot(d, name, difference, idr) {
        var obj = {
            name: name,
            date: d,
            slot: difference
        };
    
        axios({
            method: "put",
            url: `http://localhost:3003/slots/${name}/${d}`,
            data: obj
        }).then((res) => {
            navigate(`/bookingdetails/${idr}/${index}`);
        }, (error) => {
            alert("Database not connected");
        });
    }
    var p=1
    function bookSlot(e) {
        postslot.slot = selectedCheckboxes
        e.preventDefault()
        axios({
            method: "post",
            url: ("http://localhost:3003/postslots"),
            data: postslot,
            headers: {
                Authorization: localStorage.token
            }
        }).then((res) => {
            if (localStorage.getItem(token) != null) {
                navigate("/login")
            }
            else {
                {
                    var idr=res.data.id
                    Swal.fire("Welcome", "You booked your slot successfully", "success");
                    var difference = []
                    var id, d

                    slots?.map((slot) => {
                        if (slot.name == postslot?.name && slot.date == postslot?.date) {
                            var arr1=slot.slot
                            var arr2=postslot?.slot
                            difference = arr1.filter(item => !arr2.includes(item));
                            console.log(difference)
                            // console.log(slot.id)
                            id = slot.id
                            d = slot.date
                            // var len=slot.slot.length
                            // var len2=postslot.length
                            // for(var i=0;i<len;i++){
                            //     for(var j=0;j<len2;j++){

                            //     }
                            // }
//                             const array1 = [1, 2, 3, 4, 5];
// const array2 = [3, 4, 5, 6, 7];

// const difference = array1.filter(item => !array2.includes(item));


// slot.slot.map((s) => {
//                                 postslot?.slot.map((sl)=>{
//                                     console.log(s)
//                                     if (s != sl) {

    
//                                         slt.push(s)
//                                         console.log(slt)
    
//                                         // var sl = s.indexOf(postslot?.slot)
//                                         // console.log(slot.slot)
    
//                                     }
//                                 })
                               
//                             })

                        }


                    })
                }

            }
            newSlot(d, id, difference,idr)


        }, (error) => {
            navigate("/login")
            alert("Database not connected")
        })

    
}
function viewSlot (e) {
        e.preventDefault()
        // console.log(e.target.value)
        // setDate(e.target.value)
        setPost({ ...postslot, [e.target.name]: e.target.value })
        slots?.map((slot) => {
            if (slot.date == (e.target.value) && slot.name == postslot?.name) {

                setTimeArray(slot.slot)
            }
        })
        
    }
    useEffect(() => {
        axios({
            method: "get",
            url: "http://localhost:3003/slots"

        }).then((res) => {
            setSlots(res.data)
            console.log(res.data)
        }, (error) => {
            alert("Database not connected")
        })
    }, [])
    useEffect(() => {
        axios({
            method: "get",
            url: "http://localhost:3003/postslots"

        }).then((res) => {
            setpostSlots(res.data)
            
        }, (error) => {
            alert("Database not connected")
        })
    }, [])



    return (
        <div>
            <form>
                <h4>{ground[index]}</h4>
                <img src={image[index]} style={{ height: "30vh", width: "30vh" }}></img><br></br>
                { <><input type='date' onChange={viewSlot} name="date"></input><br></br><LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        sx={{
                            svg: { color: "#F37037" }
                        }}
                        className="myDatePicker"
                        value={selectedDate}
                        slotProps={{ textField: { fullWidth: true } }}
                        renderinput={(params) => <TextField {...params} />}
                        onChange={(e) => {
                            viewSlot(e)
                        } } />
                    <br /><br />
                </LocalizationProvider></> }
          
    
                {/* <button className="btn btn-primary" onClick={viewSlot}>See slots</button> */}


                <div>
                    {Time?.map((slot, index) => {
                        return (
                            <div>
                                <form>
                                    <input type="checkbox" value={slot} name="slot" 
                                    onChange={ getvalue }
                                    checked={selectedCheckboxes.includes(slot)} 
                                    />
                                    <label>
                                        {slot}
                                    </label>
                                </form>

                            </div>

                        )
                    })
                    }
                    






                    {/* <table class="table border shadow">

                                        <tbody>


                                            <tr>
                                                <th scope="row">{index + 1}</th>
                                             
                                                <td style={{alignContent:"flex-start"}}><h4 style={{textEmphasis:"ActiveBorder"}}>{slot}</h4></td>

                                                 <td>
                                                    <button class="btn btn-primary me-2" onClick={bookSlot.bind(null,index)} >{bookstatus}Book</button> */}
                    {/* <Link
                                                class="btn btn-primary me-2"
                                                exact to={`/slotbooking/${index}`}>
                                                See Slots
                                            </Link> */}

                    {/* </td> 
                                            </tr>

                                        </tbody>
                                    </table> */}

                </div>







                {/* <DatePicker label="Controlled picker" 
  value={value}
  onChange={getvalue} /> */}
            <div>
            <button class="btn-3 btn-primary me-2" onClick={bookSlot} disabled={show ? true : false} >Book</button>
            </div>
            </form>
        </div>
    )
}

export default SlotBooking


// import React, { useState } from 'react';

// const CheckboxList = () => {
//   const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);

//   const handleCheckboxChange = (value) => {
//     const currentIndex = selectedCheckboxes.indexOf(value);
//     const newCheckboxes = [...selectedCheckboxes];

//     if (currentIndex === -1) {
//       // Checkbox is not currently selected, so add it to the array
//       newCheckboxes.push(value);
//     } else {
//       // Checkbox is already selected, so remove it from the array
//       newCheckboxes.splice(currentIndex, 1);
//     }

//     setSelectedCheckboxes(newCheckboxes);
//   };

//   const fruits = ['apple', 'banana', 'orange'];

//   return (
//     <div>
//       {fruits.map((fruit) => (
//         <div key={fruit}>
//           <input
//             type="checkbox"
//             value={fruit}
//             checked={selectedCheckboxes.includes(fruit)}
//             onChange={() => handleCheckboxChange(fruit)}
//           />
//           {fruit}
//         </div>
//       ))}
//       <p>Selected Fruits: {selectedCheckboxes.join(', ')}</p>
//     </div>
//   );
// };

// export default CheckboxList;

