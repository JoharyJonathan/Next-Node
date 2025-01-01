"use client"

import Cart from "./Cart";
import NavBar from "../NavBar";
import Footer from "../Footer";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export default function Home() {
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            try {
                const decodedToken = jwtDecode(storedToken);
                console.log(decodedToken);

                setUserId(decodedToken.userId);
            } catch (error) {
                console.error("Erreur de decodage du token", error);
            }
        }
    }, []);

    return (
        <>
        <NavBar />
        <div className="flex flex-col min-h-screen"> 
            <Cart userId={userId}/>
        </div>
        <Footer />
        </>
    );
}