'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import axios from 'axios'
import { useRouter } from 'next/navigation'

export default function Cart({ userId }) {
  const [open, setOpen] = useState(true)
  const [orders, setOrders] = useState([]) // Stocke les commandes
  const [total, setTotal] = useState(0) // Stocke le total général
  const router = useRouter();

  useEffect(() => {
    // Fonction pour récupérer les commandes de l'utilisateur
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/order/orders/${userId}`)
        const ordersData = response.data
        setOrders(ordersData)

        // Calcul du total général
        const totalAmount = ordersData.reduce((sum, order) => sum + order.total, 0)
        setTotal(totalAmount)
      } catch (error) {
        console.error('Erreur lors de la récupération des commandes :', error)
      }
    }

    if (userId) {
      fetchOrders()
    }
  }, [userId])

  // Suppression d'une commande
  const removeOrder = async (orderId) => {
    try {
        await axios.delete(`http://localhost:5000/order/orders/${orderId}`)

        // Mise a jour des commandes apres suppression
        setOrders((prevOrders) => prevOrders.filter(order => order.orderId !== orderId))

        // Mise a jour du total
        const updatedTotal = orders.filter(order => order.orderId !== orderId).reduce((sum, order) => sum + order.total, 0)
        setTotal(updatedTotal)
    } catch (error) {
        console.log('Erreur lors de la suppression de la commande :', error);
    }
  }

  // Voir commande
  const toggleOrder = () => {
    setOpen(true);
  }

  // Maj Commande
  const updateOrder = () => {
    router.push('/updateCart');
  }

  return (
    <>
    <button className='bg-green-500 hover:bg-green-600 p-3 rounded-lg flex justify-center my-4 text-white text-lg' onClick={toggleOrder}>Open</button>
    <Dialog open={open} onClose={setOpen} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity duration-500 ease-in-out data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <DialogPanel
              transition
              className="pointer-events-auto w-screen max-w-lg transform transition duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700"
            >
              <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-lg rounded-tl-lg rounded-bl-lg">
                <div className="flex-1 overflow-y-auto px-6 py-8">
                  <div className="flex items-start justify-between">
                    <DialogTitle className="text-2xl font-semibold text-gray-900">Your Cart</DialogTitle>
                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                      >
                        <span className="absolute -inset-0.5" />
                        <span className="sr-only">Close panel</span>
                        <XMarkIcon aria-hidden="true" className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flow-root">
                      {orders.length > 0 ? (
                        <ul role="list" className="space-y-6">
                          {orders.map((order) => (
                            <li key={order.orderId} className="flex flex-col py-6 px-4 bg-gray-100 rounded-lg shadow-sm">
                              <h3 className="text-xl font-medium text-gray-800 mb-2">Order #{order.orderId} - {order.status}</h3>
                              <ul>
                                {order.products.map((product) => (
                                  <li key={product.productId} className="flex items-center justify-between py-4">
                                    <div className="flex items-center">
                                      {/* Affichage de l'image du produit */}
                                      {product.imageUrl && (
                                        <img 
                                          src='https://tailwindui.com/plus/img/ecommerce-images/shopping-cart-page-04-product-01.jpg'
                                          alt={product.productName} 
                                          className="w-16 h-16 object-cover mr-4 rounded" 
                                        />
                                      )}
                                      <p className="text-sm font-semibold text-gray-900">{product.productName}</p>
                                    </div>
                                    <p className="text-sm text-gray-500">x {product.quantity}</p>
                                  </li>
                                ))}
                              </ul>
                              <div className='flex flex-row justify-between items-center'>
                                <p className="mt-4 text-lg font-medium text-gray-900">Total: ${order.total.toFixed(2)}</p>
                                <div>
                                  <button className='font-medium text-gray-600 text-lg hover:text-green-500 mt-4 mr-2' onClick={() => updateOrder()}>
                                    Edit
                                  </button>
                                  <button className='font-medium text-gray-600 text-lg hover:text-red-500 mt-4' onClick={() => removeOrder(order.orderId)}>
                                      Remove
                                  </button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">No orders found.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 px-6 py-6">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <p>Subtotal</p>
                    <p>${total.toFixed(2)}</p> {/* Affichage du total général */}
                  </div>
                  <div className="mt-6">
                    <a
                      href="#"
                      className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-4 text-lg font-medium text-white shadow-md hover:bg-indigo-700 transition duration-300 ease-in-out"
                    >
                      Proceed to Checkout
                    </a>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
    </>
  )
}