import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Alert from "./Alert.jsx";
import "../App.css";

function Login({ alert, showAlert }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ teamId: "", password: "" });

    // If a token exists, redirect to the homepage
    useEffect(() => {
        let token = localStorage.getItem("token")
        if (token) return navigate("/");
    }, []);

    function handleInputChange(e) {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

    async function handleSubmit(e) {
        try {
            e.preventDefault();

            const { teamId, password } = formData;
            const res = await axios.post("http://5.75.237.233:8000/login", { teamId, password });

            localStorage.setItem("token", res.data.token);
            showAlert('success', 'Logged In Successfully');

            setTimeout(() => navigate("/"), 3000);
            setFormData({ teamId: "", password: "" });

        } catch (error) {
            if (error.status == 400)
                return showAlert('error', 'Invalid Credentials!');
            return showAlert('error', 'Internal Server Error!');
        }
    }

    return (
        <div className="login-container">
            <form className="bidding-form login-form" onSubmit={handleSubmit}>
                <h2>Login</h2>

                <Alert alert={alert} />

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

                <button className="submit-btn"> Login </button>
            </form>
        </div>
    );
}

export default Login;