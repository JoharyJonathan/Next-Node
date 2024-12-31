"use client";

import NavBar from "../NavBar";
import Footer from "../Footer";

import { useEffect, useState } from "react";
import axios from "axios";

export default function About() {
    const [message, setMessage] = useState("");

    useEffect(() => {
        axios
            .get("http://localhost:5000/api/about")
            .then((response) => setMessage(response.data.message))
            .catch((error) => console.error("Error fetching message:", error));
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <NavBar />
            <main className="flex-grow">
                <h1>About Us</h1>
                <p>Welcome to the About page. Learn more about us here! {message}</p>
            </main>
            <Footer />
        </div>
    );
}