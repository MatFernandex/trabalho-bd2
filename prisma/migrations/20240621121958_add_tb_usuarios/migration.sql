-- CreateTable
CREATE TABLE "tb_usuarios" (
    "usu_codigo" BIGSERIAL NOT NULL,
    "usu_nome" VARCHAR NOT NULL DEFAULT '45',
    "usu_senha" VARCHAR NOT NULL DEFAULT '50',

    CONSTRAINT "tb_usuarios_pkey" PRIMARY KEY ("usu_codigo")
);
