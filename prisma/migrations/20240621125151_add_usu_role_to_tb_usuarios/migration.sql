-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USUARIO', 'ADMIN');

-- AlterTable
ALTER TABLE "tb_usuarios" ADD COLUMN     "usu_role" "Role" NOT NULL DEFAULT 'USUARIO';
