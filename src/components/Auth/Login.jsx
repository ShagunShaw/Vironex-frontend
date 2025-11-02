import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { server } from '../../constants';
import { login } from '../../redux/authSlice';
import { FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    password: '',
    userIdentifier: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if(!formData.userIdentifier) {
      setError('Email or username is required');
      return;
    }
    if (!formData.password) {
      setError('Password is required');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // Setting withCredentials: true allows cookies to be sent and received
      const response = await axios.post(`${server}/users/login`, {
        password: formData.password,
        userIdentifier: formData.userIdentifier
      }, { 
        withCredentials: true // Important for cookie authentication
      });

      const { data } = response;
      
      // Debug log to see the structure of the response
      //console.log("Login response:", data);
      
      // Store tokens from response body as backup
      if (data?.data?.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken);
      } else {
        console.warn("No access token found in response body - may be using cookie authentication only");
      }
      
      if (data?.data?.refreshToken) {
        localStorage.setItem('refreshToken', data.data.refreshToken);
      }
      
      // Pass the whole response data to the Redux store
      dispatch(login(data));
      navigate('/');
    } 
    catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } 
    finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password page or show modal
    //console.log('Forgot password clicked');
    // Implement later: navigate('/forgot-password');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121218]">
      <div className="w-full max-w-md p-8 rounded-lg bg-[#1a1a24]">
        <div className="text-center mb-8">
          <h1 className="text-[#ff3b5c] text-4xl font-bold">ViroNex</h1>
          <p className="text-gray-400 mt-2">Access your account</p>
        </div>

        <div className="flex mb-4 space-x-4">
          <button 
            type="button"
            className="w-1/2 py-2 text-white font-medium border-b-2 border-[#ff3b5c]"
          >
            Log In
          </button>
          <button 
            type="button"
            className="w-1/2 py-2 text-gray-400 border-b-2 border-transparent"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="text-gray-500" />
            </div>
            <input
              type="text"
              name="userIdentifier"
              value={formData.userIdentifier}
              onChange={handleInputChange}
              placeholder="Username or Email"
              className="w-full pl-10 pr-3 py-3 rounded-lg bg-[#212131] text-gray-300 outline-none"
            />
          </div>
          
          <div className="mb-3 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-500" />
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              className="w-full pl-10 pr-3 py-3 rounded-lg bg-[#212131] text-gray-300 outline-none"
            />
          </div>

          <div className="mb-6 text-right">
            <button 
              type="button" 
              onClick={handleForgotPassword}
              className="text-[#ff3b5c] text-sm hover:underline"
            >
              Forgot Password?
            </button>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-[#ff3b5c] text-white py-3 rounded-lg font-medium hover:bg-opacity-90 transition ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Logging In...' : 'Log In'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <div className="relative flex items-center justify-center">
            <div className="border-t border-gray-700 flex-grow"></div>
            <span className="mx-4 text-gray-500">OR</span>
            <div className="border-t border-gray-700 flex-grow"></div>
          </div>

          <div className="mt-4 space-y-3">
            <button className="w-full py-3 px-4 border border-gray-700 rounded-lg flex items-center justify-center bg-[#212131] text-white hover:bg-opacity-80">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.545 10.239v3.821h5.445c-.712 2.315-3.02 3.821-5.445 3.821-3.332 0-6.033-2.701-6.033-6.033s2.701-6.032 6.033-6.032c1.312 0 2.634.425 3.661 1.215l2.609-2.609C17.146 2.868 14.88 2 12.545 2 7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" fill="#FFF"/>
              </svg>
              Continue with Google
            </button>
            
            <button className="w-full py-3 px-4 border border-gray-700 rounded-lg flex items-center justify-center bg-[#212131] text-white hover:bg-opacity-80">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z" fill="#FFF"/>
              </svg>
              Continue with Apple
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;