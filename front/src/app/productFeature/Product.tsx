"use client";

export default function Product({ product }: { product: any }) {
  const features = [
    { name: 'Nom', description: product.name },
    { name: 'Description', description: product.description },
    { name: 'Prix', description: `$ ${product.price}` },
    ...(product.extraFeatures || []), // Si des caractéristiques supplémentaires sont disponibles
  ];

  return (
    <div className="bg-white">
      <div className="mx-auto grid max-w-2xl grid-cols-1 items-center gap-x-8 gap-y-16 px-4 py-24 sm:px-6 sm:py-32 lg:max-w-7xl lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Détails du Produit</h2>
          <p className="mt-4 text-gray-500">
            Découvrez les spécifications techniques et les détails uniques de ce produit. Chaque élément est conçu avec soin et précision pour répondre à vos besoins.
          </p>

          <dl className="mt-16 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-y-16 lg:gap-x-8">
            {features.map((feature) => (
              <div key={feature.name} className="border-t border-gray-200 pt-4">
                <dt className="font-medium text-gray-900">{feature.name}</dt>
                <dd className="mt-2 text-sm text-gray-500">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="grid grid-cols-2 grid-rows-2 gap-4 sm:gap-6 lg:gap-8">
          {product.images?.map((image: { src: string; alt: string }, index: number) => (
            <img
              key={index}
              src={image.src}
              alt={image.alt || `Image ${index + 1}`}
              className="rounded-lg bg-gray-100"
            />
          )) || (
            <img
              src={"https://tailwindui.com/plus/img/ecommerce-images/product-page-01-related-product-01.jpg"}
              alt={product.imageAlt || 'Image du produit'}
              className="rounded-lg bg-gray-100"
            />
          )}
        </div>
      </div>
    </div>
  );
}