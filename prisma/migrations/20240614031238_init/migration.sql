-- CreateTable
CREATE TABLE "tb_fornecedor" (
    "for_codigo" BIGSERIAL NOT NULL,
    "for_descricao" VARCHAR NOT NULL DEFAULT '45',

    CONSTRAINT "tb_Fornecedor_pkey" PRIMARY KEY ("for_codigo")
);

-- CreateTable
CREATE TABLE "tb_funcionarios" (
    "fun_codigo" BIGSERIAL NOT NULL,
    "fun_nome" VARCHAR NOT NULL DEFAULT '45',
    "fun_cpf" VARCHAR DEFAULT '45',
    "fun_senha" VARCHAR DEFAULT '50',
    "fun_funcao" VARCHAR DEFAULT '50',

    CONSTRAINT "tb_funcionarios_pkey" PRIMARY KEY ("fun_codigo")
);

-- CreateTable
CREATE TABLE "tb_itens" (
    "ite_codigo" BIGSERIAL NOT NULL,
    "ite_quantidade" BIGINT NOT NULL,
    "ite_valor_parcial" DOUBLE PRECISION,
    "tb_produto" BIGINT,
    "tb_vendas" BIGINT,

    CONSTRAINT "tb_itens_pkey" PRIMARY KEY ("ite_codigo")
);

-- CreateTable
CREATE TABLE "tb_produto" (
    "pro_codigo" BIGSERIAL NOT NULL,
    "pro_descricao" VARCHAR NOT NULL DEFAULT '50',
    "pro_valor" DOUBLE PRECISION DEFAULT 50,
    "pro_quantidade" BIGINT DEFAULT 40,
    "tb_fornecedor" BIGINT,

    CONSTRAINT "tb_produto_pkey" PRIMARY KEY ("pro_codigo")
);

-- CreateTable
CREATE TABLE "tb_vendas" (
    "ven_codigo" BIGSERIAL NOT NULL,
    "ven_horario" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ven_valor_total" DOUBLE PRECISION DEFAULT 40,
    "tb_funcionario" BIGINT,

    CONSTRAINT "tb_vendas_pkey" PRIMARY KEY ("ven_codigo")
);

-- AddForeignKey
ALTER TABLE "tb_itens" ADD CONSTRAINT "tb_itens_tb_produto_fkey" FOREIGN KEY ("tb_produto") REFERENCES "tb_produto"("pro_codigo") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_itens" ADD CONSTRAINT "tb_itens_tb_vendas_fkey" FOREIGN KEY ("tb_vendas") REFERENCES "tb_vendas"("ven_codigo") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_produto" ADD CONSTRAINT "tb_produto_tb_fornecedor_fkey" FOREIGN KEY ("tb_fornecedor") REFERENCES "tb_fornecedor"("for_codigo") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_vendas" ADD CONSTRAINT "tb_vendas_tb_funcionario_fkey" FOREIGN KEY ("tb_funcionario") REFERENCES "tb_funcionarios"("fun_codigo") ON DELETE NO ACTION ON UPDATE NO ACTION;
