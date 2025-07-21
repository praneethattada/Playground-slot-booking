import React, { useContext, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { AccountContext } from "./accountContext";
import {
  BoldLink,
  BoxContainer,
  FormContainer,
  Input,
  MutedLink,
  SubmitButton,
} from "./common";
import { Marginer } from "../marginer";

// --- Constants ---
// Moved outside the component to prevent re-creation on every render
const NAME_REGEX = /^[A-Z][a-zA-Z]{4,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_REGEX = /^[6-9][0-9]{9}$/;

export function AdminSignupForm(props) {
  const { switchToSignin } = useContext(AccountContext);

  // --- State Management ---
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    contact: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!NAME_REGEX.test(formData.name)) {
      newErrors.name = "Name must start with a capital letter and be at least 5 characters long.";
    }
    if (!EMAIL_REGEX.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!CONTACT_REGEX.test(formData.contact)) {
      newErrors.contact = "Please enter a valid 10-digit contact number.";
    }
    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // The frontend sends the plain text password.
      // The server is responsible for hashing it.
      const response = await axios.post(
        "http://localhost:3003/admin/register",
        formData // Send the form data directly
      );

      Swal.fire(
        "Success!",
        "Admin account created successfully. Please sign in.",
        "success"
      );
      switchToSignin(); // Switch back to the login form after successful registration

    } catch (error) {
      console.error("Signup failed:", error);
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      Swal.fire("Registration Failed", errorMessage, "error");

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BoxContainer>
      <FormContainer onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Full Name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
        />
        {errors.name && <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.name}</p>}

        <Input
          type="text"
          placeholder="Contact Number"
          name="contact"
          value={formData.contact}
          onChange={handleInputChange}
        />
        {errors.contact && <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.contact}</p>}

        <Input
          type="email"
          placeholder="Email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
        />
        {errors.email && <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.email}</p>}

        <Input
          type="password"
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
        />
        {errors.password && <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.password}</p>}

        <Marginer direction="vertical" margin={10} />
        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? "Signing Up..." : "Sign Up"}
        </SubmitButton>
        <Marginer direction="vertical" margin="1em" />
      </FormContainer>

      <MutedLink href="#">
        Already have an account?
        <BoldLink href="#" onClick={switchToSignin}>
          Sign In
        </BoldLink>
      </MutedLink>
    </BoxContainer>
  );
}