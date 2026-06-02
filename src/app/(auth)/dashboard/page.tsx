'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useProducts } from '@/hooks/useProducts'
import { ProductCard } from '@/components/product/ProductCard'

const PAGE_SIZE = 20

export default function DashboardPage() {
  const [page, setPage] = useState(1)
  const { products, total, isLoading, error } = useProducts(page, PAGE_SIZE)

  const totalPages = Math.ceil(total / PAGE_SIZE)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40" role="status" aria-label="Cargando productos">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Error al cargar los productos</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      {products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-1">Aún no hay productos</p>
          <p className="text-sm">Tocá + para agregar el primero</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 px-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-400">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      <Link
        href="/product/new"
        aria-label="Nuevo producto"
        className="fixed bottom-20 right-4 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center text-2xl shadow-lg hover:bg-gray-800 transition-colors z-10"
      >
        +
      </Link>
    </div>
  )
}
