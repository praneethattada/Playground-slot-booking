import React, { useContext } from "react";
import {
  BoldLink,
  BoxContainer,
  FormContainer,
  Input,
  MutedLink,
  SubmitButton,
} from "./common";
import { Marginer } from "../marginer";
import { AccountContext } from "./accountContext";
import axios from 'axios';
import { useState,useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import bcrypt from 'bcryptjs'
import uniqid from 'uniqid'
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export function SignupForm(props) {
  const { switchToSignin } = useContext(AccountContext);
  var nm = /^[A-Z][A-Za-z]{5,20}$/;
  // var em=/^[a-zA-Z0-9._%+-]+@+[a-zA-Z]+[.org]|[.com]|[.co.in]|[.in]$/
  var em=/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  var cn=/^[6-9][0-9]{0,9}$/
  var ps=/^[A-Za-z@#$0-9]{1,8}$/
  var token=uniqid()
  const[user,setUser]=useState({
      name:"",email:"",password:"",contact:""
  });
  var navigate=useNavigate()
  // const[chk,setError]=useState("Name should be less than 6 characters!")
  const[emailerror,setEmail]=useState()
  const[nameerror,setName]=useState()
  const[passw,setPass]=useState()
  const[contacterror,setContact]=useState()
  const[endstate,setEnd]=useState()
  // const[status,setStatus]=useState(true)
  
  const{name,email,password,contact}=user


  function gettext(e){   
    setUser( {...user,[e.target.name]:e.target.value})
    // if(email && name && contact && password){
    //   setStatus(false)
    // }
    // else{
    //   setStatus(true)
    // }
    if (endstate){
        // setEmail(e.target.value)
        if(!email){
          setEmail("Email is required")

        }
       if(!name){
          setName("Name is required")
                       }
        if(!contact){
                        setContact("Conatct number is required")
                                     }
          else{
              setName("")
                setEmail("")
                    
                    }}
}


// var dispatch=useDispatch()


useEffect(()=>{
    
})

function onsubmit(e){
    var na = user?.name;
    var ema = user?.email;
    var con=user?.contact;
    var pass = user?.password;
const salt = bcrypt.genSaltSync(10)
const hashedPassword = bcrypt.hashSync(pass, '$2a$10$CwTycUXWue0Thq9StjUM0u')
console.log(hashedPassword)


setEnd(true)
e.preventDefault();
  var chk =true


if(!nm.test(na)){
             chk=false
             setName("**Name should greater than 6 characters and first letter should be capital")
             
         }
if(!em.test(ema)){
            chk=false
            setEmail("Invalid Mail")}
if(!cn.test(con)){
                chk=false
                setContact("Invalid Number")}
if(pass.length<8){
                  chk=false
                  setPass("Password should be less than or equal to 8 characters")
                  
              }

  
    if (chk==true){
    axios({
        method: "post",
        url: ("http://localhost:3003/admin"),
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            password: hashedPassword,
          }),
        data:user
    }).then((res)=>{
        // setloading("")
        Swal.fire("Congrats", "User Registered successfully , Please Login to Proceed", "success")
        // navigate("/admin")
        switchToSignin();
    },(error)=>{
        alert("Error")
    })}
}


  return (
    <BoxContainer>
      <FormContainer onSubmit={onsubmit} name="form">
        <Input type="text" placeholder="Full Name" onChange={gettext} name='name' />
        <p style={{"color":"red","textAlign":"left"}}>{nameerror}</p>

        <Input type="text" placeholder="Contact Number" onChange={gettext} name='contact'/>
        <p style={{"color":"red","textAlign":"left"}}>{contacterror}</p>

        <Input type="email" placeholder="Email" onChange={gettext} name='email'/>
        <p style={{"color":"red","textAlign":"left"}}>{emailerror}</p>

        <Input type="password" placeholder="Password" name='password' onChange={gettext}/>
        <p style={{"color":"red","textAlign":"left"}}>{passw}</p>

        <Marginer direction="vertical" margin={10} />
      <SubmitButton type="submit">Sign up</SubmitButton>
      <Marginer direction="vertical" margin="1em" />

      </FormContainer>

      <MutedLink href="#">
        Already have an account?
        <BoldLink href="#" onClick={switchToSignin}>
          Sign in
        </BoldLink>
      </MutedLink>
    </BoxContainer>
  );
}
