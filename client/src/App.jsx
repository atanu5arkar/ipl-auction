import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./components/Login";
import Alert from "./components/Alert";


function App() {
    let [alert, setAlert] = useState({type : "", msg : ""})
    function showAlert({type , msg}){
        setAlert({type , msg})
        setTimeout(()=> {
            setAlert({type : "", msg : ""})
        }, 3000)
    }

  return (
    <BrowserRouter>
      <Routes>
      {/* <Alert alert={alert}/> */}
        <Route path="/" element={<PrivateRoute component={Home} showAlert={showAlert} />} />
        <Route path="/login" element={<Login  showAlert={showAlert}/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
