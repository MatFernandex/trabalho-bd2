'use client'

import { useFormik } from 'formik'
import { type FC, useCallback } from 'react'
import * as Yup from 'yup'

interface FormValues {
  username: string
  password: string
}

interface FormInputProps {
  id: keyof FormValues
  label: string
  formik: ReturnType<typeof useFormik<FormValues>>
  type?: 'text' | 'password'
}

const validationSchema = Yup.object({
  username: Yup.string()
    .required('O nome de usuário é obrigatório.')
    .matches(/^[a-zA-Z0-9]*$/, 'O nome de usuário deve conter apenas caracteres alfanuméricos.')
    .transform((value) => value.toLowerCase()),
  password: Yup.string().required('A senha é obrigatória.'),
})

const FormInput: FC<FormInputProps> = ({ id, label, formik, type = 'text' }) => (
  <>
    <label htmlFor={id} className="block text-gray-700 text-sm font-bold">
      {label}
    </label>
    <input
      type={type}
      id={id}
      {...formik.getFieldProps(id)}
      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    />
    {formik.touched[id] && formik.errors[id] && (
      <div className="text-red-500 text-xs italic">
        {typeof formik.errors[id] === 'string' ? formik.errors[id] : ''}
      </div>
    )}
  </>
)

const Form = () => {
  const onSubmit = useCallback((values: FormValues) => {
    console.log(values)
  }, [])

  const formik = useFormik<FormValues>({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema,
    onSubmit,
  })

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h2 className="text-2xl font-bold mb-2">Entrar</h2>
      <p className="mb-4 text-gray-600">Acesse sua conta.</p>
      <form onSubmit={formik.handleSubmit} className="w-full max-w-xs">
        <div className="flex flex-col gap-y-2">
          <FormInput id="username" label="Nome de Usuário" formik={formik} />
          <FormInput id="password" label="Senha" formik={formik} type="password" />
        </div>
        <div className="flex items-center justify-between mt-8 mb-2">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          >
            Entrar
          </button>
        </div>
        <p className="text-center text-gray-600">
          Não tem uma conta?
          <a href="/auth/register" className="text-blue-500 hover:text-blue-700 ml-2">
            Cadastre-se
          </a>
        </p>
      </form>
    </div>
  )
}

export { Form }
