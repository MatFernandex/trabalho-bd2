import { Role } from '@prisma/client'
import { Transform, type TransformFnParams } from 'class-transformer'
import { IsAlphanumeric, IsIn, IsNotEmpty, MaxLength, MinLength } from 'class-validator'

/** Transform field to lowercase */
const lowerCase = ({ value }: TransformFnParams) => value.toLowerCase()

/** Set default role to 'USUARIO' if not provided */
const defaultRole = ({ value }: TransformFnParams) => (value ? value.toUpperCase() : 'USUARIO')

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

  @Transform(defaultRole)
  @IsIn(['USUARIO', 'VENDEDOR'], {
    message: 'Role de usuário inválido',
  })
  readonly role: Role
}
