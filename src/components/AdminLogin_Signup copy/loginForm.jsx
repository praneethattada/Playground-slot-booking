import React, { useContext, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { AccountContext } from "./accountContext";
import { Link } from 'react-router-dom';
import {
  BoldLink,
  BoxContainer,
  FormContainer,
  Input,
  MutedLink,
  SubmitButton,
} from "./common";
import { Marginer } from "../marginer";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Renamed to AdminLoginForm for clarity
export function AdminLoginForm(props) { 
  const { switchToSignup } = useContext(AccountContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3003/admin/login",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      // --- FIX: Handle the ADMIN response ---
      // The server sends back 'admin', not 'user'
      const { token, admin } = response.data; 

      if (!token || !admin) {
        throw new Error("Invalid response from server");
      }

      Swal.fire("Welcome Admin!", "You logged in successfully", "success");

      // Store ADMIN token and data in localStorage
      localStorage.setItem("adminAuthToken", token);
      localStorage.setItem("admin", JSON.stringify(admin));
      window.dispatchEvent(new Event("authChange"));

      // You might want to dispatch admin-specific actions here if needed
      // dispatch({ type: "ADMIN_LOGIN", payload: admin });

      // Navigate to the ADMIN dashboard, not the user one
      navigate("/adminview"); 

    } catch (error) {
      console.error("Admin Login failed:", error);
      const errorMessage = error.response?.data?.message || "Invalid email or password.";
      Swal.fire("Login Failed", errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BoxContainer>
      <FormContainer onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="Admin Email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
        />
        {errors.email && <p style={{ color: "red", textAlign: "left", fontSize: "0.8rem" }}>{errors.email}</p>}
        <Marginer direction="vertical" margin={10} />
        <Input
          type="password"
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
        />
        {errors.password && <p style={{ color: "red", textAlign: "left", fontSize: "0.8rem" }}>{errors.password}</p>}
        <Marginer direction="vertical" margin={10} />
        <MutedLink href="#">
          <Link to="/admin/forgot-password" style={{ textDecoration: "none", color: "rgba(255,255,255,0.6)" }}>
                    Forgot password?
                  </Link></MutedLink>
        <Marginer direction="vertical" margin="1.6em" />
        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? "Signing In..." : "Sign In"}
        </SubmitButton>
      </FormContainer>
      <Marginer direction="vertical" margin="1em" />
      <MutedLink href="#">
        Don't have an admin account?{" "}
        <BoldLink href="#" onClick={switchToSignup}>
          Sign up
        </BoldLink>
      </MutedLink>
    </BoxContainer>
  );
}