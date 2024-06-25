import { AuthEffect } from '@/components/Home/AuthEffect'
import { Header } from '@/components/Home/Header'
import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cliente - Home',
}

export default function Home() {
  return (
    <>
      <Header />
      <AuthEffect />
    </>
  )
}
