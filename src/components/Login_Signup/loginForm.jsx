import React, { useContext, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AccountContext } from "./accountContext";
import { BoxContainer, FormContainer, Input, MutedLink, SubmitButton } from "./common";
import { Marginer } from "../marginer";
// At the top of your LoginForm.jsx with other imports
import { BoldLink } from "./common"; // Make sure this path is correct

export function LoginForm(props) {
  const { switchToSignup } = useContext(AccountContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State management
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:3003/users/login", {
        email: formData.email,
        password: formData.password
      });

      // Assuming your server returns { token, user } on successful login
      const { token, user } = response.data;

      // Store token in localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));
      window.dispatchEvent(new Event("authChange"));

      // Update Redux store
      dispatch({ type: "LOGIN", payload: user });
      dispatch({ type: "USERNAME", payload: user.name });

      // Show success message
      await Swal.fire({
        title: "Success!",
        text: "You have successfully logged in",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });

      // Redirect to dashboard
      navigate("/check");
    } catch (error) {
      console.error("Login error:", error);
      
      let errorMessage = "Login failed. Please try again.";
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          errorMessage = "Invalid email or password";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }

      await Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BoxContainer>
      <FormContainer onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="Email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          error={!!errors.email}
        />
        {errors.email && <span style={{ color: "red", fontSize: "0.8rem" }}>{errors.email}</span>}

        <Marginer direction="vertical" margin={10} />

        <Input
          type="password"
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          error={!!errors.password}
        />
        {errors.password && <span style={{ color: "red", fontSize: "0.8rem" }}>{errors.password}</span>}

        <Marginer direction="vertical" margin={10} />
        <MutedLink href="#">
          <Link to="/forgot-password" style={{ textDecoration: "none", color: "rgba(255,255,255,0.6)" }}>
            Forgot password?
          </Link>
        </MutedLink>

        <Marginer direction="vertical" margin="1.6em" />
        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? "Signing In..." : "Sign In"}
        </SubmitButton>
      </FormContainer>

      <MutedLink href="#">
        Don't have an account?{" "}
        <BoldLink href="#" onClick={switchToSignup}>
          Sign up
        </BoldLink>
      </MutedLink>
    </BoxContainer>
  );
}