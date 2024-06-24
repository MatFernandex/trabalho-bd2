import { Role } from '@prisma/client'
import { Transform, type TransformFnParams } from 'class-transformer'
import { IsAlphanumeric, IsIn, IsNotEmpty, IsOptional, ValidateIf } from 'class-validator'

/** Transform field to lowercase */
const lowerCase = ({ value }: TransformFnParams) => value.toLowerCase()

/** Transform field to uppercase */
const upperCase = ({ value }: TransformFnParams) => value.toUpperCase()

export class LoginPayload {
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
  readonly password: string

  @IsOptional()
  @ValidateIf((object, value) => value !== undefined)
  @Transform(upperCase)
  @IsIn(['USUARIO', 'VENDEDOR'], {
    message: 'Role de usuário inválido',
  })
  readonly role?: Role
}
