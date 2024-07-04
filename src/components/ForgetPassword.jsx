import React from 'react'
import { useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'

const ForgetPassword = () => {
    const[user,setUser]=useState({
        email:""
    })
    var navigate=useNavigate()
    const[data,setData]=useState()
    const[pass,setPassword]=useState("")
    var chk=false
    var p=true
    function onSubmit(e){

        e.preventDefault()
        var em=user?.email
        axios({
            method: "get",
            url:"http://localhost:3003/users"
            
        }).then((res)=>{
            setData(res.data)
 
        },(error)=>{
            alert("Database not connected")
        }) 
        data?.map((dat)=>{
            if(dat.email.match(em)==dat.email){
                setPassword(dat.password)
                chk=true
                p=true
                Swal.fire("", `Your Password is ${dat.password}`, "")
                navigate("/login")
                
            }
            else if(chk==true){
                p=true
            }
            else if(chk==false){
                p=false
            }
            // else{
            //     chk=false
                
            // }
            
        })
        if (p ==false){
            Swal.fire("", `Your Email is incorrect`, "warning")
        }
        
        // else if(chk||p==(false)){
        //     Swal.fire("", `Your Email is incorrect`, "warning")
        // }
    }
    
    function gettext(e){
        // e.preventDefault()
        setUser( {...user,[e.target.name]:e.target.value})
    }
  return (
    <div>
        <section class="h-100 gradient-custom-3">
  <div class="container py-5 h-80">
    <div class="row d-flex justify-content-center align-items-center h-100">
      <div class="col-lg-8 col-xl-6">
        <div class="card rounded-3">
          <img src="https://media.istockphoto.com/id/1355687112/photo/various-sport-equipment-gear.jpg?b=1&s=170667a&w=0&k=20&c=hEADFXL4HG9mF94yC5g3JA8lMHn8OZg7hRLoiel_L48="
            class="w-80" style={{borderTopLeftRadius: ".3rem", border:".3rem"}}
            alt="Sample photo"/>
          <div class="card-body p-4 p-md-5">
            <h3 class="mb-4 pb-2 pb-md-0 mb-md-5 px-md-2">Forgot Password</h3>

            <form class="px-md-2">

              <div class="form-outline mb-4">
                <input type="text" id="form3Example1q" class="form-control" name='email' placeholder='Email' onChange={gettext} />
              </div>
               <button type="submit" class="btn btn-success btn-lg mb-1" onClick={onSubmit}>Submit</button>

            </form>

          </div>
        </div>
      </div>
    </div>
  </div>
</section>
    </div>
  )
}

export default ForgetPassword

//https://media.istockphoto.com/id/1355687112/photo/various-sport-equipment-gear.jpg?b=1&s=170667a&w=0&k=20&c=hEADFXL4HG9mF94yC5g3JA8lMHn8OZg7hRLoiel_L48=