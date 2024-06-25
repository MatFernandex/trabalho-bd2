'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser } from '@/hooks/useUser'
import api from '@/services/api-client'
import { useAuthStore } from '@/stores/useAuthStore'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'

interface Product {
  pro_codigo: number
  pro_descricao: string
  pro_valor: number
  pro_quantidade: number
  tb_fornecedor: number
}

const Products = () => {
  const { user } = useUser()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<unknown | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<any>(null)

  const { access_token: token } = useAuthStore.getState()

  const getProducts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await api.get<Product[]>('/products', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log(data)
      setProducts(data)

      setIsLoading(false)
      return data
    } catch (error) {
      setError(error)
      setIsLoading(false)

      throw error
    }
  }, [token])

  const handleEdit = useCallback(
    (product: Product) => {
      if (user?.fun_nome) {
        setEditingProduct(product)
      } else {
        toast('Somente funcionarios podem editar os produtos.', { type: 'error' })
      }
    },
    [user?.fun_nome],
  )

  const handleSave = useCallback(
    async (id: number, updatedProduct: Product) => {
      try {
        await api.put(`/products/${id}`, updatedProduct, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setEditingProduct(null)
        await getProducts()
      } catch (error) {
        console.error(error)
      }
    },
    [token, getProducts],
  )

  useEffect(() => {
    void getProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-12">
      {products.map((product) => (
        <Card key={product.pro_codigo} className="overflow-hidden shadow-lg">
          {editingProduct && editingProduct.pro_codigo === product.pro_codigo ? (
            <>
              <CardHeader>
                <CardTitle>Código do Produto: {product.pro_codigo}</CardTitle>
                <input
                  defaultValue={product.pro_descricao}
                  onChange={(e) => (product.pro_descricao = e.target.value)}
                />
              </CardHeader>
              <CardContent>
                <input
                  defaultValue={product.pro_valor}
                  onChange={(e) => (product.pro_valor = parseFloat(e.target.value))}
                />
                <input
                  defaultValue={product.pro_quantidade}
                  onChange={(e) => (product.pro_quantidade = parseInt(e.target.value))}
                />
                <p className="text-gray-700 dark:text-gray-400 text-base">Fornecedor: {product.tb_fornecedor}</p>
              </CardContent>
              <CardFooter className="flex flex-row gap-x-2">
                <Button onClick={async () => await handleSave(product.pro_codigo, product)}>Salvar</Button>
                <Button variant="destructive" onClick={() => setEditingProduct(null)}>
                  Cancelar
                </Button>
              </CardFooter>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle>Código do Produto: {product.pro_codigo}</CardTitle>
                <CardDescription>Descrição: {product.pro_descricao}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-400 text-base">Valor: {product.pro_valor}</p>
                <p className="text-gray-700 dark:text-gray-400 text-base">Quantidade: {product.pro_quantidade}</p>
                <p className="text-gray-700 dark:text-gray-400 text-base">Fornecedor: {product.tb_fornecedor}</p>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" onClick={() => handleEdit(product)}>
                  Editar
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      ))}
    </div>
  )
}

export { Products }
