import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

import "../App.css";
import Alert from "./Alert.jsx";
import Loading from "./Loading.jsx";

let socket;

function Row({ player }) {
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        let timerId;

        const ms = player.endbid - Date.now();
        clearInterval(timerId);

        if (ms > 0) {
            setTimer(parseInt(ms / 1000));

            timerId = setInterval(() => {
                setTimer(timer => {
                    if (timer == 0)
                        return clearInterval(timerId);
                    return timer - 1;
                });
            }, 1000);
        }
    }, [player.endbid]);

    return (
        <tr
            className={
                player.status
                    ? (player.currentbid ? "status-onbid" : "status-available")
                    : "status-placed"
            }
        >
            <td>{player.playerid}</td>
            <td>{player.fullname}</td>
            <td>{player.role}</td>
            <td>{player.currentbid || player.baseprice} lakhs</td>
            <td>
                {
                    player.status
                        ? (player.currentbid ? "On Bid" : "Available")
                        : "Placed"
                }
            </td>
            {
                timer > 0 && <td> {timer} </td>
            }
        </tr>
    )
}

function Home({ alert, showAlert }) {
    let navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [bidData, setBidData] = useState({ playerid: "", amount: "", });
    const [loading, setLoading] = useState(true);

    async function getTeamData() {
        try {
            const res = await axios.get("http://5.75.237.233:8000/", {
                headers: {
                    auth: localStorage.getItem("token")
                }
            });
            setTeams(res.data);
            setLoading(false);

        } catch (error) {
            if (error.status == 401) {
                showAlert('error', 'Access Denied!');
                return setTimeout(() => handleLogout(), 3000);
            }
            return showAlert('error', 'Internal Server Error!');
        }
    }

    useEffect(() => {
        socket = io("http://5.75.237.233:8000/", {
            auth: {
                token: localStorage.getItem("token")
            }
        });

        socket.on("connect", () => {
            showAlert('success', 'Connected to the Auction Server.');
        });

        socket.on('connect_error', (err) => {
            showAlert('error', err.message);
        });

        socket.on("error", (msg) => {
            showAlert('error', msg);
        });

        socket.on("update", (msg) => {
            getTeamData();
            showAlert('bid', msg, 8);
        });

        getTeamData();
    }, []);

    function handleInputChange(e) {
        setBidData({ ...bidData, [e.target.name]: e.target.value });
    }

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("teamid");
        socket.disconnect();
        navigate("/login");
    }

    function handleSubmit(e) {
        e.preventDefault();
        const { playerid, amount } = bidData;

        socket.emit("bid", {
            teamid: +localStorage.getItem("teamid"),
            playerid: +playerid,
            amount: +amount,
        });
        setBidData({ playerid: "", amount: "" });
    }

    return (
        <div className="container">
            <Alert alert={alert} />

            <form className="bidding-form" onSubmit={handleSubmit}>
                <h2>Place Your Bid</h2>

                <div className="form-group">
                    <label htmlFor="playerid">Player ID:</label>
                    <input
                        type="text"
                        id="playerid"
                        name="playerid"
                        value={bidData.playerid}
                        onChange={handleInputChange}
                        placeholder="Enter Player ID"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="amount">Bid Amount:</label>
                    <input
                        type="text"
                        id="amount"
                        name="amount"
                        value={bidData.amount}
                        onChange={handleInputChange}
                        placeholder="Enter Bid Amount"
                        required
                    />
                </div>

                <button className="submit-btn"> Place Bid </button>
                <button type="button" onClick={handleLogout} className="submit-btn"> Logout </button>
            </form>

            {
                loading
                    ? <Loading />
                    : <div>
                        {teams.map(team => (
                            <div className="team-table" key={team.teamid}>
                                <h2>
                                    {team.team} - {team.teamid}
                                </h2>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Player Id</th>
                                            <th>Player Name</th>
                                            <th>Role</th>
                                            <th>Price</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {team.players.map((player) => (
                                            <Row player={player} teams={teams} key={player._id} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
            }
        </div>
    );
}

export default Home;