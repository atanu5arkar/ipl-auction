import { useEffect, useState } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login({showAlert}) {
  let navigate = useNavigate();
  const [formData, setFormData] = useState({ teamId: "", password: "" });

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  useEffect(()=> {
    let token = localStorage.getItem("token")
    if(token){
        navigate("/")
    }
  }, [])

  async function handleSubmit(e) {
    try {
      e.preventDefault();
      let {teamId, password} = formData

      if (!teamId || !password) {
        showAlert({type : "error", msg :"add something"})
        return;
      }

      let res = await axios.post("http://5.75.237.233:8000/login", {teamId, password});
      localStorage.setItem("token" , res.data.token);
      showAlert({type : "success", msg : "login success"})
      navigate("/")

    //   setTimeout(()=> {
    //   navigate("/")

    //   }, 3000)
      setFormData({teamId: "", password: ""})

    } catch (err) {
      if(err.status == 400){
        return console.log(err.response.data.msg);
        
      }
      console.log(err);
    }
  }

  return (
    <div className="login-container">
      <form className="bidding-form login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {/* {error && <p className="error-message">{error}</p>} */}
        <div className="form-group">
          <label htmlFor="teamId">Team ID:</label>
          <input
            type="text"
            id="teamId"
            name="teamId"
            value={formData.teamId}
            onChange={handleInputChange}
            placeholder="Enter Team ID"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter Password"
            required
          />
        </div>
        <button type="submit" className="submit-btn">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
