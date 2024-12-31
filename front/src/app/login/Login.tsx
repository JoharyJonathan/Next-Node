"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // Stocker le token JWT dans le localStorage
        localStorage.setItem("token", data.token);
        router.push("/");
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de la connexion");
      }
    } catch (error) {
      setError("Erreur de connexion au serveur");
      console.error(error);
    }
  };

  return (
    <div className="flex font-poppins items-center justify-center dark:bg-gray-900 min-w-screen min-h-screen">
      <div className="grid gap-8">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-[26px] m-4">
          <div className="border-[20px] border-transparent rounded-[20px] dark:bg-gray-900 bg-white shadow-lg xl:p-10 2xl:p-10 lg:p-10 md:p-10 sm:p-2 m-2">
            <h1 className="pt-8 pb-6 font-bold text-5xl dark:text-gray-400 text-center">
              Sign In
            </h1>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-2 dark:text-gray-400 text-lg">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 p-3 shadow-md placeholder:text-base border-gray-300 rounded-lg w-full focus:scale-105 ease-in-out duration-300"
                  placeholder="Email"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-2 dark:text-gray-400 text-lg">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 p-3 mb-2 shadow-md placeholder:text-base border-gray-300 rounded-lg w-full focus:scale-105 ease-in-out duration-300"
                  placeholder="Password"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg mt-6 p-2 text-white rounded-lg w-full hover:scale-105 hover:from-purple-500 hover:to-blue-500 transition duration-300 ease-in-out"
              >
                SIGN IN
              </button>
            </form>

            <div className="flex flex-col mt-4 items-center justify-center text-sm">
                <h3>
                    <span className="cursor-default dark:text-gray-300">
                      Don&apos;t Have account?
                    </span>
                    <Link
                        className="group text-blue-400 transition-all duration-100 ease-in-out"
                        href="/register"
                    >
                    <span className="bg-left-bottom ml-1 bg-gradient-to-r from-blue-400 to-blue-400 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-500 ease-out">
                        Sign Up
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