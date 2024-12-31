"use client"

import { useState, useEffect } from "react"
import Link from "next/link";
  
export default function List() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    if (loading) {
        return <p>Chargement des produits...</p>
    }

    if (error) {
        return <p>Erreur : {error}</p>
    }

    return (
        <div className="bg-white">
            <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Product List</h2>

                <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                    {products.map((product) => (
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