"use client";

import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

export default function UpdateCart() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Récupérer le userId dans le token
    const token = localStorage.getItem("token");
    const decodedToken = jwtDecode(token);
    const userId = decodedToken.userId;

    // Charger les commandes
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/order/orders/${userId}`
                );
                setOrders(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Erreur lors de la récupération des commandes:", error);
                setLoading(false);
            }
        };

        fetchOrders();
    }, [userId]);

    const handleProductChange = (orderId, productId, field, value) => {
        setOrders((prevOrders) =>
            prevOrders.map((order) =>
                order.orderId === orderId
                    ? {
                          ...order,
                          products: order.products.map((product) =>
                              product.productId === productId
                                  ? { ...product, [field]: value }
                                  : product
                          ),
                      }
                    : order
            )
        );
    };

    const handleOrderChange = (orderId, field, value) => {
        setOrders((prevOrders) =>
            prevOrders.map((order) =>
                order.orderId === orderId ? { ...order, [field]: value } : order
            )
        );
    };

    const addProduct = (orderId) => {
        const newProduct = { productId: Date.now(), productName: "", quantity: 1 };
        setOrders((prevOrders) =>
            prevOrders.map((order) =>
                order.orderId === orderId
                    ? { ...order, products: [...order.products, newProduct] }
                    : order
            )
        );
    };

    const removeProduct = (orderId, productId) => {
        setOrders((prevOrders) =>
            prevOrders.map((order) =>
                order.orderId === orderId
                    ? {
                          ...order,
                          products: order.products.filter(
                              (product) => product.productId !== productId
                          ),
                      }
                    : order
            )
        );
    };

    const handleSubmit = async (orderId) => {
        const order = orders.find((order) => order.orderId === orderId);

        try {
            await axios.put(`http://localhost:5000/order/orders/${orderId}`, {
                total: order.total,
                status: order.status,
                products: order.products,
            });
            alert("Commande mise à jour avec succès.");
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la commande:", error);
            alert("Échec de la mise à jour.");
        }
    };

    if (loading) return <p className="text-center text-gray-600">Chargement des commandes...</p>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Commandes</h2>
            {orders.map((order) => (
                <div
                    key={order.orderId}
                    className="bg-white shadow-md rounded-lg p-6 mb-6"
                >
                    <h3 className="text-xl font-semibold text-gray-700">
                        Commande #{order.orderId}
                    </h3>
                    <div className="mt-4">
                        <label className="block text-gray-600 font-medium">
                            Total :
                        </label>
                        <input
                            type="number"
                            value={order.total}
                            onChange={(e) =>
                                handleOrderChange(order.orderId, "total", e.target.value)
                            }
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="mt-4">
                        <label className="block text-gray-600 font-medium">
                            Status :
                        </label>
                        <input
                            type="text"
                            value={order.status}
                            onChange={(e) =>
                                handleOrderChange(order.orderId, "status", e.target.value)
                            }
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>

                    <h4 className="text-lg font-semibold text-gray-600 mt-6">
                        Produits
                    </h4>
                    {order.products.map((product) => (
                        <div
                            key={product.productId}
                            className="flex items-center space-x-4 mt-4"
                        >
                            <input
                                type="text"
                                placeholder="Nom du produit"
                                value={product.productName}
                                onChange={(e) =>
                                    handleProductChange(
                                        order.orderId,
                                        product.productId,
                                        "productName",
                                        e.target.value
                                    )
                                }
                                className="flex-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <input
                                type="number"
                                placeholder="Quantité"
                                value={product.quantity}
                                onChange={(e) =>
                                    handleProductChange(
                                        order.orderId,
                                        product.productId,
                                        "quantity",
                                        e.target.value
                                    )
                                }
                                className="w-24 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    removeProduct(order.orderId, product.productId)
                                }
                                className="text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md"
                            >
                                Supprimer
                            </button>
                        </div>
                    ))}
                    <div className="mt-6 flex space-x-4">
                        <button
                            type="button"
                            onClick={() => addProduct(order.orderId)}
                            className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-md"
                        >
                            Ajouter un produit
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSubmit(order.orderId)}
                            className="bg-green-500 text-white hover:bg-green-600 px-4 py-2 rounded-md"
                        >
                            Mettre à jour la commande
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}