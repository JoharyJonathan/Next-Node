"use client"

import { useState, useEffect } from "react"
import Link from "next/link";
  
export default function List() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch("http://localhost:5000/product/all");
                if (!response.ok) {
                    throw new Error("Erreur lors de la recuperation des produits");
                }
                const data = await response.json();
                setProducts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };      

        fetchProducts();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault(); // Empêche le rechargement de la page
        try {
            const response = await fetch(`http://localhost:5000/product/search?name=${encodeURIComponent(searchTerm)}`);
            if (!response.ok) {
                throw new Error("Erreur lors de la recherche des produits");
            }
            const data = await response.json();
            setFilteredProducts(data); // Met à jour les produits filtrés
        } catch (err) {
            setError(err.message);
        }
    };      

    if (loading) {
        return <p>Chargement des produits...</p>
    }

    if (error) {
        return <p>Erreur : {error}</p>
    }

    return (
        <div className="bg-white">
            
            <form className="max-w-md mx-auto my-3" onSubmit={handleSearch}>   
                <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                        </svg>
                    </div>
                    <input
                        type="search"
                        id="default-search"
                        className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Search for Products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        required
                    />
                    <button type="submit" className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
                </div>
            </form>

            <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Product List</h2>

                <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                    {(filteredProducts.length > 0 ? filteredProducts : products).map((product) => (
                        <div key={product.id} className="group relative">
                            <Link href={`/productFeature/${product.id}`}>
                                <img
                                    alt={product.imageAlt || "Product image"}
                                    src={product.imageSrc || "https://tailwindui.com/plus/img/ecommerce-images/product-page-01-related-product-01.jpg"}
                                    className="aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:opacity-75 lg:aspect-auto lg:h-80"
                                />
                            </Link>
                            <div className="mt-4 flex justify-between">
                                <div>
                                    <h3 className="text-sm text-gray-700">
                                        <Link href={`/productFeature/${product.id}`}>
                                            <span aria-hidden="true" className="absolute inset-0" />
                                            {product.name}
                                        </Link>
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">{product.stock || "N/A"} Available</p>
                                </div>
                                <p className="text-sm font-medium text-gray-900">${product.price || "N/A"}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}