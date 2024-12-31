"use client";

import NavBar from '@/app/NavBar';
import Footer from '@/app/Footer';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Product from '../Product';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      if (typeof params.then === "function") {
        return await params;
      }
      return params;
    };

    const fetchProduct = async () => {
      try {
        const resolvedParams = await resolveParams();
        const response = await axios.get(`http://localhost:5000/product/${resolvedParams.id}`);
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        setError('Impossible de récupérer les données');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params]);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <NavBar />
      <div className="flex flex-col min-h-screen">
        <Product product={product} />
      </div>
      <Footer />
    </>
  );
}