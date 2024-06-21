import { Transform, type TransformFnParams } from 'class-transformer'
import { IsAlphanumeric, IsNotEmpty } from 'class-validator'

/** Transform field to lowercase */
const lowerCase = ({ value }: TransformFnParams) => value.toLowerCase()

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
}
