"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function Homepage() {
    const [message, setMessage] = useState("");

    useEffect(() => {
        axios
            .get("http://localhost:5000/api/message")
            .then((response) => setMessage(response.data.message))
            .catch((error) => console.error("Error fetching message:", error));
    }, []);

    return (
        <div>
            <h2>Message:</h2>
            <p>{message}</p>
        </div>
    );
}
