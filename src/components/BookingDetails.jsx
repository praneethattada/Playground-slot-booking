import React from 'react'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useEffect } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux'
const BookingDetails = () => {
    const[slot,setSlot]=useState({})
    var image = useSelector((state) => state.image)
    var username = useSelector((state) => state.username)
    var params = useParams()
    var index=params.index
    var idr = params.idr;
    useEffect(() => {
        axios({
            method: "get",
            url: `http://localhost:3003/postslots/${idr}`

        }).then((res) => {
            setSlot(res.data)
            // console.log(res.data.name)
        }, (error) => {
            alert("Database not connected")
        })
    }, [])
    // console.log(slot.name)
  return (
    <div className="main" style={{marginBottom:"10%"}}>
        {/* <section class="vh-100 gradient-custom-2" style={{backgroundColor:"blue"}}> */}
  <div class="container h-100">
    <div class="row d-flex justify-content-center align-items-center h-100">
      <div class="col-md-10 col-lg-8 col-xl-6">
        <div class="card card-stepper" style={{borderRadius: "16px"}}>
          <div class="card-header p-4">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="text-muted mb-2"> Booking Details<span class="fw-bold text-body"></span></p>
                
              </div>
              
            </div>
          </div>
          <div class="card-body p-4">
            <div class="d-flex flex-row mb-4 pb-2">
              <div class="flex-fill">
              <img src={image[index]} style={{ height: "100vh", width: "75vh",marginBottom:"10%" }}></img><br></br>
                <h4 class="bold mb-3">Ground booked: {slot.name}</h4>
                <p class="text-muted"> </p>
                <h4 class="mb-3">Name: {slot.username} </h4><br></br>
                <h4 class="bold mb-3">Booked slots:</h4><br></br>{slot?.slot?.map((s)=>{
                  return(
                    <div>
                    <h4 class="bold mb-3">{s}</h4>
                    </div>)
                  
                })}
        {/* {slot.slot.map((slot)=>{
            return(
                <h4 class="mb-3">{slot}</h4>
            )
        })}  */}
                
              </div>
              <div>
                {/* <img class="align-self-center img-fluid"
                  src={cakedetail.image} width="250"/> */}
              </div>
            </div>
            
          </div>
          <div class="card-footer p-4">
            <div class="d-flex justify-content-between">
              <h5 class="fw-normal mb-0"><Link to={`/`} class="btn" style={{backgroundColor:"#a3712a"}}>Back to Home</Link></h5>
              
            
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/* </section>  */}
    </div>
  )
}

export default BookingDetails
