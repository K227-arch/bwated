import { useState } from "react";
import { useNavigate } from "react-router-dom";
import kisasi from "../assets/kisasi.jpg";
import logo from "../assets/logo.png";
import "./signup.css";
import * as yup from "yup";
import { supabase } from "@/lib/supabaseClient";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const SignUpGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "http://localhost:5173/dashboard",
        },
      });

      if (error) throw error;
    } catch (error) {
      setErrors((prev) => ({ ...prev, submit: error.message }));
    } finally {
      setLoading(false);
    }
  };

  const schema = yup.object().shape({
    email: yup.string().email("Invalid email format").required("Email is required"),
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[0-9]/, "Password requires at least one number")
      .matches(/[a-z]/, "Password requires at least one lowercase letter")
      .matches(/[A-Z]/, "Password requires at least one uppercase letter")
      .required("Password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({}); // Reset errors before validation

    try {
      await schema.validate(formData, { abortEarly: false });

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      await supabase.from("users").insert({ email: formData.email, auth_id: data.user.id });

      alert("Please verify your email");
      navigate("/login");
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const validationErrors = error.inner.reduce((acc, err) => {
          acc[err.path] = err.message;
          return acc;
        }, {});
        setErrors(validationErrors);
      } else {
        setErrors((prev) => ({ ...prev, submit: error.message }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper2">
      <div className="container">
        <div className="signuplogo">
          <img src={logo} onClick={() => navigate("/")} className="signup-logo" alt="Logo" />
        </div>

        <div className="formbutton2">
          <div className="cl-wrapper-2">
            <form className="signup-form" onSubmit={handleSubmit}>
              <input
                name="email"
                type="email"
                placeholder="Enter your email address"
                className="email-input2"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <span className="error-message">{errors.email}</span>}

              <input
                type="password"
                name="password"
                placeholder="Enter Password"
                className="google-input-with-icon2"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && <span className="error">{errors.password}</span>}

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className="email-input2"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}

              {errors.submit && <span className="error">{errors.submit}</span>}

              <button type="submit" className="submitbutton2" disabled={loading}>
                {loading ? "Signing Up..." : "SIGN UP"}
              </button>
            </form>

            <div className="or">OR</div>

            <button className="google-input-with-icon" onClick={SignUpGoogle} disabled={loading}>
              Continue With Google
            </button>
          </div>
          <p>
            <span>Have an account? </span>
            <a href="/login" className="signup-button">
              Sign In
            </a>
          </p>
        </div>
      </div>
      </div> 
  );
};

export default Signup;
