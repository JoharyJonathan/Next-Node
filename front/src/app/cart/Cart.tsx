'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import axios from 'axios'

export default function Cart({ userId }) {
  const [open, setOpen] = useState(true)
  const [orders, setOrders] = useState([]) // Stocke les commandes

  useEffect(() => {
    // Fonction pour récupérer les commandes de l'utilisateur
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/order/orders/${userId}`)
        setOrders(response.data)
      } catch (error) {
        console.error('Erreur lors de la récupération des commandes :', error)
      }
    }

    if (userId) {
      fetchOrders()
    }
  }, [userId])

  return (
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
              className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700"
            >
              <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                  <div className="flex items-start justify-between">
                    <DialogTitle className="text-lg font-medium text-gray-900">Shopping cart</DialogTitle>
                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                      >
                        <span className="absolute -inset-0.5" />
                        <span className="sr-only">Close panel</span>
                        <XMarkIcon aria-hidden="true" className="size-6" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="flow-root">
                      {orders.length > 0 ? (
                        <ul role="list" className="-my-6 divide-y divide-gray-200">
                          {orders.map((order) => (
                            <li key={order.orderId} className="flex py-6 flex-col">
                              <h3 className="text-gray-900 font-medium">
                                Order #{order.orderId} - {order.status}
                              </h3>
                              <ul>
                                {order.products.map((product) => (
                                  <li key={product.productId} className="flex py-4">
                                    <p>Product ID: {product.productId}</p>
                                    <p>Quantity: {product.quantity}</p>
                                  </li>
                                ))}
                              </ul>
                              <p>Total: ${order.total}</p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">No orders found.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Subtotal</p>
                    <p>$0.00</p>
                  </div>
                  <div className="mt-6">
                    <a
                      href="#"
                      className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                    >
                      Checkout
                    </a>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  )
}