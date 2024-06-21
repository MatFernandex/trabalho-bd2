import { RegisterForm } from '@/components/RegisterForm'
import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cliente - Cadastro',
}

export default function Register() {
  return <RegisterForm />
}
