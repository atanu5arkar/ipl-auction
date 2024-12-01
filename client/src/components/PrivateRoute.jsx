import axios from "axios";
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Loading from "./Loading";

function PrivateRoute({ element: Component, ...rest }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function authenticateUser() {
            try {
                const token = localStorage.getItem("token");
                if (!token) return setLoading(false);

                let res = await axios.get("http://5.75.237.233:8000/auth", {
                    headers: { auth: token }
                });

                // teamid to be used for bidding
                localStorage.setItem("teamid", res.data.teamId);
                setLoading(false);
                setIsAuthenticated(true);

            } catch (err) {
                setLoading(false);
                return localStorage.removeItem("token");
            }
        }
        authenticateUser();
    }, []);

    if (loading) return <Loading />
    if (!isAuthenticated) return <Navigate to="/login" />

    return <Component {...rest} />
}

export default PrivateRoute;