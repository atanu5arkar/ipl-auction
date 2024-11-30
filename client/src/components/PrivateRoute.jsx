import axios from "axios";
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Loading from "./Loading";

function PrivateRoute({ component: Component , showAlert}) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("token");
        if(!token){
            setLoading(false)
            return setIsAuthenticated(false);
        }
        let res = await axios.get("http://5.75.237.233:8000/auth", {
          headers: { auth: token },
        });

        console.log(res.data);
        
        setIsAuthenticated(true);
        localStorage.setItem("teamid", res.data.teamId)
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
        const token = localStorage.removeItem("token");
      }
    }
    load();
  }, []);

  if (loading) return <Loading/>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <Component showAlert={showAlert} />;
}

export default PrivateRoute;
