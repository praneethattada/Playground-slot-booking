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
import { Link } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'
import uniqid from 'uniqid'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'

export function LoginForm(props) {
  const { switchToSignup } = useContext(AccountContext);
  var em = /^[a-zA-Z0-9._%+-]+@+[a-zA-Z]+[.org]|[.com]|[.co.in]|[.in]$/
  var ps=/^[A-Za-z@#$0-9]{1,8}$/
  var navigate = useNavigate()
  const [user, setUser] = useState({
    email: "", password: ""
  });
  const [emailerror, setEmail] = useState()
  const [passerror, setPassword] = useState()
  // const [data, setData] = useState()
  const [status, setStatus] = useState(true)
  const [endstate, setEnd] = useState()
  var dispatch = useDispatch()
  var token = uniqid()
  const { email, password } = user
  const [data, setData] = useState([])

  function gettext(e) {
    setUser({ ...user, [e.target.name]: e.target.value })
    var emai = user?.email
    var passwo = user?.password

    if ((emai) && (passwo)) {
      setStatus(false)
    }
    else {
      setStatus(true)
    }

  }


  
  function onSubmit(e) {

    e.preventDefault()
    var ema = user?.email
    var pass = user?.password

    if (!em.test(ema)) {
      setEmail("Invalid Mail")
    }
    // setEnd(true)

    axios({
      method: "get",
      url: "http://localhost:3003/admin"

    }).then((res) => {
      // setData(res.data)
      // matchData(res.data)
      const user = res.data.find(
        (user) => user.email === email && user.password === password
      )
      if (user) {
        // User logged in successfully
        Swal.fire("Welcome", "You logged in successfully", "success");
        
        // console.log(user)
        dispatch({
          type: "LOGIN"
        })
        dispatch({
    type: "USERNAME",
    payload: user?.name
  })
        localStorage.setItem("token", token);
        navigate("/adminview")
      } else {
        // Login failed
        Swal.fire(":(", "Invalid Email or password", "warning");
      }

    }, (error) => {
      alert("Database not connected")
    })
  }


  return (
    <BoxContainer>
      <FormContainer>
        <Input type="email" placeholder="Email" name="email" onChange={gettext} required/>
        <p style={{ "color": "red", "textAlign": "left" }}>{emailerror}</p>

        <Input type="password" placeholder="Password" name="password" onChange={gettext} required/>

        {/* <p className="small mb-5 pb-lg-2"><Link to='/forgotpassword' className="text-white-50">Forgot password?</Link></p> */}

        <Marginer direction="vertical" margin={10} />
      <MutedLink href=""><Link to='/forgotpassword' className="text-white-50">Forgot password?</Link></MutedLink>
      <Marginer direction="vertical" margin="1.6em" />
      <SubmitButton type="submit" onClick={onSubmit} disabled={status ? true : false}>Sign in</SubmitButton>
      <Marginer direction="vertical" margin="1em" />
      </FormContainer>
      {/* <Marginer direction="vertical" margin={10} />
      <MutedLink href="#">Forget your password?</MutedLink>
      <Marginer direction="vertical" margin="1.6em" />
      <SubmitButton type="submit" onClick={onSubmit} disabled={status ? true : false}>Signin</SubmitButton>
      <Marginer direction="vertical" margin="1em" /> */}
      <MutedLink href="#">
        Don't have an accoun?{" "}
        <BoldLink href="#" onClick={switchToSignup}>
          Sign up
        </BoldLink>
      </MutedLink>
    </BoxContainer>
  );
}
