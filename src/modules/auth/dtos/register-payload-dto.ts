import { Role } from '@prisma/client'
import { Transform, type TransformFnParams } from 'class-transformer'
import { IsAlphanumeric, IsIn, IsNotEmpty, MaxLength, MinLength } from 'class-validator'

/** Transform field to lowercase */
const lowerCase = ({ value }: TransformFnParams) => value.toLowerCase()

/** Transform field to uppercase */
const upperCase = ({ value }: TransformFnParams) => value.toUpperCase()

export class RegisterPayload {
  @IsNotEmpty({
    message: 'O nome de usuário é obrigatório.',
  })
  @IsAlphanumeric('pt-BR', {
    message: 'O nome de usuário deve conter apenas caracteres alfanuméricos.',
  })
  @Transform(lowerCase)
  readonly username: string

  @IsNotEmpty({
    message: 'A senha é obrigatória.',
  })
  @MaxLength(50, {
    message: 'A senha não pode ter mais que 50 caracteres.',
  })
  @MinLength(6, {
    message: 'A senha deve ter pelo menos 6 caracteres.',
  })
  readonly password: string

  @IsNotEmpty({
    message: 'Campo Obrigatório',
  })
  @Transform(upperCase)
  @IsIn(['USUARIO', 'VENDEDOR'], {
    message: 'Campo Inválido',
  })
  readonly role: Role
}
