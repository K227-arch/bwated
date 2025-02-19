import {React, useState} from "react";
import { useNavigate, useLocation } from "react-router";
import kisasi from "../assets/kisasi.jpg";
import logo from '../assets/logo.png';
import "./signup.css";
import * as yup from 'yup'; 
import { supabase } from '@/lib/supabaseClient';

const signup =()=> {
  const navigate = useNavigate()
  const location = useLocation();
  const { email } = location.state || ""; 
  const [formData, setFormData] = useState({
    email: email,
    password: '',
    confirmPassword: ''
  });


  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  
const schema = yup.object().shape({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[0-9]/, 'Password requires at least one number')
    .matches(/[a-z]/, 'Password requires at least one lowercase letter')
    .matches(/[A-Z]/, 'Password requires at least one uppercase letter')
    .required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});


const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
     await schema.validate(formData, { abortEarly: false });

     const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (error) throw error;

     const { error: errorUserCreate } = await supabase
      .from('users')
      .insert({ email: formData.email,  auth_id: data.user.id });

    if (errorUserCreate) throw errorUserCreate;   
    alert('Please verify your email');
    navigate("/login");

    console.log('Success:', data);
  } catch (error) {
    // Handle validation errors
    if (error instanceof yup.ValidationError) {
      const validationErrors = {};
      error.inner.forEach(err => {
        validationErrors[err.path] = err.message;
      });
      setErrors(validationErrors);
    } else {
      // Handle other errors (authentication or database)
      setErrors({ submit: error.message });
    }
  } finally {
    setLoading(false);
  }
};


 
  return (
    <div>
      <div className="login-wrapper2">
        <div className="container">
          <div className="signuplogo">
            <img src={logo} className="signup-logo" alt="Logo"/>
          </div>
         
          
          <div className="formbutton2">
            <form className="signup-form"  onSubmit={handleSubmit}>
            
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
              
              <button type="submit" className="submitbutton2"  >
                Set password
              </button>
            </form>
          </div>
          
        </div>
        
      </div>
    </div>
  );
}

export default signup;
