import { useState } from "react";
import {apiFetch} from "../api/client.js";

const Landing = () => {
    const [status, setStatus] = useState(null);

    const checkApi = async () => {
        try {
            const res = await apiFetch("/isApiAlive");

            const text = await res.status;
            setStatus(text);          // "alive"
        } catch (e) {
            console.log("erreur : ", e);
            setStatus("unreachable");
        }
    };

    return (
        <div>
            <button onClick={checkApi}>IsAlive?</button>
            {status && <p>{status}</p>}
        </div>
    );
};

export default Landing;