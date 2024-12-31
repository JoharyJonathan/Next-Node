"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Form() {
    const [user, setUser] = useState({
        name: "",
        email: "",
        bio: "",
        avatar: "",
    });
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [message, setMessage] = useState(""); // Message pour feedback utilisateur
    const [isLoading, setIsLoading] = useState(false); // Indicateur de chargement
    const router = useRouter();

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
            router.push("/login"); // Redirection si l'utilisateur n'est pas connecté
            return;
        }

        try {
            const decodedToken = JSON.parse(atob(storedToken.split(".")[1]));
            setUser({
                name: decodedToken.name,
                email: decodedToken.email,
                bio: "Utilisateur authentifié",
                avatar: "https://source.unsplash.com/96x96/?portrait",
            });
        } catch (error) {
            console.error("Erreur lors du décodage du token :", error);
            router.push("/login");
        }
    }, [router]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const token = localStorage.getItem("token");
        if (!token) {
            setMessage("Vous devez être connecté pour modifier votre profil.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/auth/edit", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("Profil mis à jour avec succès !");
                logout();
                setUser((prevUser) => ({
                    ...prevUser,
                    ...formData,
                }));
                setFormData({
                    name: "",
                    email: "",
                    password: "",
                }); // Réinitialise les champs du formulaire
            } else {
                setMessage(data.error || "Une erreur est survenue.");
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour :", error);
            setMessage("Erreur de connexion avec le serveur.");
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        // Supprimez les données utilisateur du localStorage
        localStorage.removeItem("token");
        router.push("/");
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
                            Profile Update
                        </h1>
                        {message && (
                            <p
                                className={`text-center mb-4 ${
                                    message.includes("succès") ? "text-green-500" : "text-red-500"
                                }`}
                            >
                                {message}
                            </p>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                    onChange={handleInputChange}
                                    className="border dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 p-3 shadow-md placeholder:text-base border-gray-300 rounded-lg w-full focus:scale-105 ease-in-out duration-300"
                                    type="text"
                                    placeholder={user.name || "Votre nom"}
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
                                    onChange={handleInputChange}
                                    className="border dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 p-3 shadow-md placeholder:text-base border-gray-300 rounded-lg w-full focus:scale-105 ease-in-out duration-300"
                                    type="email"
                                    placeholder={user.email || "Votre email"}
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
                                    onChange={handleInputChange}
                                    className="border dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 p-3 mb-2 shadow-md placeholder:text-base border-gray-300 rounded-lg w-full focus:scale-105 ease-in-out duration-300"
                                    type="password"
                                    placeholder="Nouveau mot de passe"
                                />
                            </div>
                            <button
                                className={`bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg mt-6 p-2 text-white rounded-lg w-full hover:scale-105 hover:from-purple-500 hover:to-blue-500 transition duration-300 ease-in-out ${
                                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? "Updating..." : "Update"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}