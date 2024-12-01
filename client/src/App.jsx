import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./components/Home";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./components/Login";

function App() {
    let [alert, setAlert] = useState(null);

    function showAlert(type, msg, period = 3) {
        setAlert({ type, msg });
        setTimeout(() => setAlert(null), period * 1000);
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        <PrivateRoute
                            element={Home}
                            alert={alert}
                            showAlert={showAlert}
                        />
                    }
                />
                <Route
                    path="/login"
                    element={
                        <Login
                            alert={alert}
                            showAlert={showAlert}
                        />
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
