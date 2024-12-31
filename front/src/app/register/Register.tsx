"use client";

import { useState } from "react";
import Link from "next/link";

export default function Register() {
    // Gestion des états pour les champs
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Gestion des champs de formulaire
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    // Soumettre les données à l'API backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(""); // Réinitialiser le message
        setError(""); // Réinitialiser l'erreur

        try {
            const response = await fetch("http://localhost:5000/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setFormData({ name: "", email: "", password: "" }); // Réinitialiser le formulaire
            } else {
                setError(data.error || "Une erreur s'est produite.");
            }
        } catch (err) {
            setError("Erreur de connexion au serveur.");
        }
    };

    return (
        <div className="flex font-poppins items-center justify-center dark:bg-gray-900 min-w-screen min-h-screen">
            <div className="grid gap-8">
                <div
                    id="back-div"
                    className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-[26px] m-4"
                >
                    <div className="border-[20px] border-transparent rounded-[20px] dark:bg-gray-900 bg-white shadow-lg xl:p-10 2xl:p-10 lg:p-10 md:p-10 sm:p-2 m-2">
                        <h1 className="pt-8 pb-6 font-bold text-5xl dark:text-gray-400 text-center cursor-default">
                            Sign Up
                        </h1>
                        <form
                            action="#"
                            method="post"
                            className="space-y-4"
                            onSubmit={handleSubmit}
                        >
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-2 dark:text-gray-400 text-lg"
                                >
                                    Name
                                </label>
                                <input
                                    id="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="border dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 p-3 shadow-md placeholder:text-base border-gray-300 rounded-lg w-full focus:scale-105 ease-in-out duration-300"
                                    type="text"
                                    placeholder="Name"
                                    required
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 dark:text-gray-400 text-lg"
                                >
                                    Email
                                </label>
                                <input
                                    id="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="border dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 p-3 shadow-md placeholder:text-base border-gray-300 rounded-lg w-full focus:scale-105 ease-in-out duration-300"
                                    type="email"
                                    placeholder="Email"
                                    required
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2 dark:text-gray-400 text-lg"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="border dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 p-3 mb-2 shadow-md placeholder:text-base border-gray-300 rounded-lg w-full focus:scale-105 ease-in-out duration-300"
                                    type="password"
                                    placeholder="Password"
                                    required
                                />
                            </div>
                            <button
                                className="bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg mt-6 p-2 text-white rounded-lg w-full hover:scale-105 hover:from-purple-500 hover:to-blue-500 transition duration-300 ease-in-out"
                                type="submit"
                            >
                                SIGN UP
                            </button>
                        </form>

                        {/* Affichage des messages */}
                        {message && (
                            <p className="mt-4 text-green-500 text-center">{message}</p>
                        )}
                        {error && (
                            <p className="mt-4 text-red-500 text-center">{error}</p>
                        )}

                        <div className="flex flex-col mt-4 items-center justify-center text-sm">
                            <h3>
                                <span className="cursor-default dark:text-gray-300">
                                    Have an account?
                                </span>
                                <Link
                                    className="group text-blue-400 transition-all duration-100 ease-in-out"
                                    href="/login"
                                >
                                    <span className="bg-left-bottom ml-1 bg-gradient-to-r from-blue-400 to-blue-400 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-500 ease-out">
                                        Log In
                                    </span>
                                </Link>
                            </h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}