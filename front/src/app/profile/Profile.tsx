"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Profile() {
  const [user, setUser] = useState({
    name: "Jean Dupont",
    email: "jean.dupont@example.com",
    bio: "Développeur web passionné par le design et l'architecture logicielle.",
    avatar: "https://source.unsplash.com/96x96/?portrait",
  });

  const router = useRouter();

  useEffect(() => {
    // Check if user information exists in localStorage
    const storedUser = localStorage.getItem("token");
    console.log("Contenu de localStorage:", storedUser); // Log for debugging

    try {
      if (storedUser) {
        // Check if the stored value is a JWT token (base64 encoded string)
        if (storedUser.startsWith("eyJhbGciOi")) {
          // It's likely a JWT token, decode it (using atob here or a library like jwt-decode)
          const decodedToken = atob(storedUser.split('.')[1]);  // Decode the payload part of the JWT
          const userInfo = JSON.parse(decodedToken); // Parse the decoded payload

          // Set user information from the decoded token
          setUser({
            name: userInfo.name,
            email: userInfo.email,
            bio: "Utilisateur authentifié", // You can set a default bio or any other data you have
            avatar: "https://source.unsplash.com/96x96/?portrait", // You can add dynamic avatar if you have that info
          });
        } else {
          // If it's not a JWT token, try parsing it as a regular JSON string
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      }
    } catch (error) {
      console.error("Error parsing stored user data:", error);
    }
  }, []);  

  const editProfile = () => {
    router.push("/updatebio");
  };

  const logout = () => {
    // Supprimez les données utilisateur du localStorage
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="flex items-center justify-center">
          {/* Avatar */}
        </div>
        <div className="text-center mt-4">
          {/* User Information */}
          <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
          <p className="text-gray-600 text-sm">{user.email}</p>
          <p className="text-gray-500 mt-2">{user.bio}</p>
        </div>
        <div className="mt-6">
          {/* Actions */}
          <button
            className="w-full py-2 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg shadow-md transition duration-200"
            onClick={editProfile}
          >
            Modifier le profil
          </button>
          <button
            className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md mt-4 transition duration-200"
            onClick={logout}
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}