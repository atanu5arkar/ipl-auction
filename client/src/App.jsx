import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

import "./App.css";
import Alert from "./components/Alert";
import Loading from "./components/Loading";

const socket = io("http://5.75.237.233:8000/");


function Row({ player, teams }) {
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        let timerId;
        // Just to start the timer from 90. Idk why it is starting from 110.
        const ms = player.endbid - Date.now();
        clearInterval(timerId);

        if (ms > 0) {
            console.log("seconds", parseInt(ms / 1000) - 20);
            setTimer(parseInt(ms / 1000) - 20);

            timerId = setInterval(() => {
                setTimer(prevTimer => {
                    if (prevTimer <= 1) {
                        clearInterval(timerId); // Stop the interval when timer reaches zero.
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);
        }
        // Cleanup on dependency change or component unmount.
        return () => clearInterval(timerId);
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

function App() {
    const [teams, setTeams] = useState([]);
    const [bidData, setBidData] = useState({
        teamid: "",
        playerid: "",
        amount: "",
    });
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(false);

    const [bids, setBids] = useState({});

    async function getTeamData() {
        try {
            const res = await axios.get("http://5.75.237.233:8000/");
            setTeams(res.data);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        socket.on("error", (msg) => {
            handleAlert('error', msg);
        });
        socket.on("update", (msg) => {
            getTeamData();
            handleAlert('bid', msg);
        });

        async function firstRender() {
            try {
                setLoading(true);
                await getTeamData();
                setLoading(false);
            } catch (error) {
                handleAlert('error', 'Internal Server Error!');
            }
        }
        firstRender();
    }, []);

    function handleAlert(type, msg) {
        setAlert({ type, msg });
        setTimeout(() => setAlert(null), 8000);
    }

    function handleInputChange(e) {
        setBidData({ ...bidData, [e.target.name]: e.target.value });
    }

    function handleSubmit(e) {
        e.preventDefault();

        const { teamid, playerid, amount } = bidData;
        if (!teamid || !playerid || !amount) return;

        socket.emit("bid", {
            teamid: +teamid,
            playerid: +playerid,
            amount: +amount,
        });
        setBidData({ teamid: "", playerid: "", amount: "" });
    }

    return (
        <div className="container">
            <Alert alert={alert} />

            <form className="bidding-form" onSubmit={handleSubmit}>
                <h2>Place Your Bid</h2>
                <div className="form-group">
                    <label htmlFor="teamid">Team ID:</label>
                    <input
                        type="text"
                        id="teamid"
                        name="teamid"
                        value={bidData.teamid}
                        onChange={handleInputChange}
                        placeholder="Enter Team ID"
                        required
                    />
                </div>
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
                <button type="submit" className="submit-btn">
                    Place Bid
                </button>
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

export default App;
