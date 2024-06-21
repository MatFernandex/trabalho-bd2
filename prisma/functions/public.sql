CREATE OR REPLACE FUNCTION public.atualizar_produto(IN p_produto_id bigint,IN p_quantidade bigint)
    RETURNS void
    LANGUAGE 'plpgsql'
    VOLATILE
    PARALLEL UNSAFE
    COST 100

AS $BODY$
BEGIN
    -- Atualizar a quantidade do produto na tabela tb_produto
    UPDATE tb_produto
    SET pro_quantidade = pro_quantidade + p_quantidade
    WHERE pro_codigo = p_produto_id;
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.realizar_venda(IN p_funcionario_id bigint,IN p_produtos bigint[],IN p_quantidades bigint[])
    RETURNS bigint
    LANGUAGE 'plpgsql'
    VOLATILE
    PARALLEL UNSAFE
    COST 100

AS $BODY$
DECLARE
    v_venda_id BIGINT;
    v_valor_total DOUBLE PRECISION := 0;
    v_produto_id BIGINT;
    v_quantidade BIGINT;
    v_parcial DOUBLE PRECISION;
BEGIN
    -- Inserir venda na tabela tb_vendas
    INSERT INTO tb_vendas (tb_funcionario)
    VALUES (p_funcionario_id)
    RETURNING ven_codigo INTO v_venda_id;

    -- Loop através dos produtos e suas quantidades
    FOR i IN 1..array_length(p_produtos, 1) LOOP
        v_produto_id := p_produtos[i];
        v_quantidade := p_quantidades[i];

        -- Calcular valor parcial do item
        SELECT pro_valor * v_quantidade
        INTO v_parcial
        FROM tb_produto
        WHERE pro_codigo = v_produto_id;

        -- Inserir item na tabela tb_itens
        INSERT INTO tb_itens (ite_quantidade, ite_valor_parcial, tb_produto, tb_vendas)
        VALUES (v_quantidade, v_parcial, v_produto_id, v_venda_id);

        -- Atualizar quantidade do produto na tabela tb_produto
        UPDATE tb_produto
        SET pro_quantidade = pro_quantidade - v_quantidade
        WHERE pro_codigo = v_produto_id;

        -- Atualizar valor total da venda
        v_valor_total := v_valor_total + v_parcial;
    END LOOP;

    -- Atualizar valor total da venda na tabela tb_vendas
    UPDATE tb_vendas
    SET ven_valor_total = v_valor_total
    WHERE ven_codigo = v_venda_id;

    -- Retornar o código da venda
    RETURN v_venda_id;

EXCEPTION
    WHEN OTHERS THEN
        -- Lançar uma exceção para indicar que houve um erro
        RAISE;
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.realizar_venda_com_verificacao(IN p_funcionario_id bigint,IN p_produtos bigint[],IN p_quantidades bigint[])
    RETURNS bigint
    LANGUAGE 'plpgsql'
    VOLATILE
    PARALLEL UNSAFE
    COST 100

AS $BODY$
DECLARE
    v_venda_id BIGINT;
    v_valor_total DOUBLE PRECISION := 0;
    v_produto_id BIGINT;
    v_quantidade BIGINT;
    v_parcial DOUBLE PRECISION;
BEGIN
    -- Iniciar a transação
    BEGIN

        -- Verificar se todos os produtos têm quantidade suficiente
        FOR i IN 1..array_length(p_produtos, 1) LOOP
            v_produto_id := p_produtos[i];
            v_quantidade := p_quantidades[i];

            -- Verificar a quantidade disponível
            IF (SELECT pro_quantidade FROM tb_produto WHERE pro_codigo = v_produto_id) < v_quantidade THEN
                RAISE EXCEPTION 'Quantidade insuficiente para o produto ID %', v_produto_id;
            END IF;
        END LOOP;

        -- Inserir venda na tabela tb_vendas
        INSERT INTO tb_vendas (tb_funcionario)
        VALUES (p_funcionario_id)
        RETURNING ven_codigo INTO v_venda_id;

        -- Loop através dos produtos e suas quantidades
        FOR i IN 1..array_length(p_produtos, 1) LOOP
            v_produto_id := p_produtos[i];
            v_quantidade := p_quantidades[i];

            -- Calcular valor parcial do item
            SELECT pro_valor * v_quantidade
            INTO v_parcial
            FROM tb_produto
            WHERE pro_codigo = v_produto_id;

            -- Inserir item na tabela tb_itens
            INSERT INTO tb_itens (ite_quantidade, ite_valor_parcial, tb_produto, tb_vendas)
            VALUES (v_quantidade, v_parcial, v_produto_id, v_venda_id);

            -- Atualizar quantidade do produto na tabela tb_produto
            UPDATE tb_produto
            SET pro_quantidade = pro_quantidade - v_quantidade
            WHERE pro_codigo = v_produto_id;

            -- Atualizar valor total da venda
            v_valor_total := v_valor_total + v_parcial;
        END LOOP;

        -- Atualizar valor total da venda na tabela tb_vendas
        UPDATE tb_vendas
        SET ven_valor_total = v_valor_total
        WHERE ven_codigo = v_venda_id;

        -- Commit implícito ao término do bloco BEGIN...END;

    EXCEPTION
        WHEN OTHERS THEN
            -- Mensagem de erro para indicar rollback
            RAISE NOTICE 'Erro detectado, efetuando rollback: %', SQLERRM;
            -- O rollback é implícito em funções PL/pgSQL quando ocorre uma exceção
            RAISE;
    END;

    -- Retornar o código da venda
    RETURN v_venda_id;
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.testar_rollback()
    RETURNS void
    LANGUAGE 'plpgsql'
    VOLATILE
    PARALLEL UNSAFE
    COST 100

AS $BODY$
BEGIN

        -- Tenta inserir um registro que violará a restrição de chave primária (exemplo de erro)
        INSERT INTO tb_produto (pro_codigo, pro_descricao, pro_valor, pro_quantidade, tb_fornecedor)VALUES (1, 'Produto X', 30.00, 50, 1);

        RAISE EXCEPTION 'Erro simulado';
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.teste_rollback()
    RETURNS void
    LANGUAGE 'plpgsql'
    VOLATILE
    PARALLEL UNSAFE
    COST 100

AS $BODY$
BEGIN
    -- Insere um registro na tabela tb_fornecedor
    INSERT INTO "tb_produto" ("pro_descricao", "pro_valor", "pro_quantidade", "tb_fornecedor") VALUES ('Lapizera', 10.50, 100, 1);
    -- Gera um erro para forçar o rollback
    RAISE EXCEPTION 'Erro forçado para teste de rollback';

    -- Faz um commit (nunca será alcançado devido ao erro acima)
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        -- Faz um rollback quando ocorre um erro
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.teste_rollback_venda(IN p_funcionario_id bigint,IN p_produtos bigint[],IN p_quantidades bigint[])
    RETURNS void
    LANGUAGE 'plpgsql'
    VOLATILE
    PARALLEL UNSAFE
    COST 100

AS $BODY$
DECLARE
    v_venda_id BIGINT;
    v_valor_total DOUBLE PRECISION := 0;
    v_produto_id BIGINT;
    v_quantidade BIGINT;
    v_parcial DOUBLE PRECISION;
BEGIN
    -- Inserir venda na tabela tb_vendas
    INSERT INTO tb_vendas (tb_funcionario)
    VALUES (p_funcionario_id)
    RETURNING ven_codigo INTO v_venda_id;

    -- Loop através dos produtos e suas quantidades
    FOR i IN 1..array_length(p_produtos, 1) LOOP
        v_produto_id := p_produtos[i];
        v_quantidade := p_quantidades[i];

        -- Calcular valor parcial do item
        SELECT pro_valor * v_quantidade
        INTO v_parcial
        FROM tb_produto
        WHERE pro_codigo = v_produto_id;

        -- Forçar um erro proposital para testar o rollback
        IF v_quantidade < 0 THEN
            RAISE EXCEPTION 'Quantidade negativa detectada: %', v_quantidade;
        END IF;

        -- Inserir item na tabela tb_itens
        INSERT INTO tb_itens (ite_quantidade, ite_valor_parcial, tb_produto, tb_vendas)
        VALUES (v_quantidade, v_parcial, v_produto_id, v_venda_id);

        -- Atualizar quantidade do produto na tabela tb_produto
        UPDATE tb_produto
        SET pro_quantidade = pro_quantidade - v_quantidade
        WHERE pro_codigo = v_produto_id;

        -- Atualizar valor total da venda
        v_valor_total := v_valor_total + v_parcial;
    END LOOP;

    -- Atualizar valor total da venda na tabela tb_vendas
    UPDATE tb_vendas
    SET ven_valor_total = v_valor_total
    WHERE ven_codigo = v_venda_id;

EXCEPTION
    WHEN OTHERS THEN
        -- Mensagem de erro para indicar rollback
        RAISE NOTICE 'Erro detectado, efetuando rollback: %', SQLERRM;
        -- O rollback é implícito em funções PL/pgSQL quando ocorre uma exceção
        RAISE;
END;
$BODY$;
