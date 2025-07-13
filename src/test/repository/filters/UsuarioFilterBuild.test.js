import UsuarioFilterBuild from '../../../repository/filters/UsuarioFilterBuild.js';

describe('UsuarioFilterBuild', () => {
    let filterBuilder;

    beforeEach(() => {
        filterBuilder = new UsuarioFilterBuild();
    });

    describe('comNome()', () => {
        it('deve adicionar filtro de nome quando o nome for fornecido', () => {
            filterBuilder.comNome('João');
            const filtros = filterBuilder.build();
            expect(filtros).toEqual({
                nome: { $regex: 'João', $options: 'i' }
            });
        });

        it('não deve adicionar filtro de nome quando o nome for vazio', () => {
            filterBuilder.comNome('');
            const filtros = filterBuilder.build();
            expect(filtros).toEqual({});
        });
    });

    describe('comEmail()', () => {
        it('deve adicionar filtro de email quando o email for fornecido', () => {
            filterBuilder.comEmail('teste@email.com');
            const filtros = filterBuilder.build();
            expect(filtros).toEqual({
                email: { $regex: 'teste@email.com', $options: 'i' }
            });
        });

        it('não deve adicionar filtro de email quando o email for vazio', () => {
            filterBuilder.comEmail('');
            const filtros = filterBuilder.build();
            expect(filtros).toEqual({});
        });
    });

    describe('comAtivo()', () => {
        it('deve adicionar filtro ativo como true para strings e números equivalentes', () => {
            const valoresTrue = ['true', true, '1', 1];
            for (const val of valoresTrue) {
                filterBuilder = new UsuarioFilterBuild();
                filterBuilder.comAtivo(val);
                const filtros = filterBuilder.build();
                expect(filtros).toEqual({ ativo: true });
            }
        });

        it('deve adicionar filtro ativo como false para outros valores', () => {
            const valoresFalse = ['false', false, '0', 0];
            for (const val of valoresFalse) {
                filterBuilder = new UsuarioFilterBuild();
                filterBuilder.comAtivo(val);
                const filtros = filterBuilder.build();
                expect(filtros).toEqual({ ativo: false });
            }
        });

        it('não deve adicionar filtro se valor for undefined', () => {
            filterBuilder.comAtivo(undefined);
            const filtros = filterBuilder.build();
            expect(filtros).toEqual({});
        });
    });

    describe('comNivelAcesso()', () => {
        it('deve adicionar chave dinâmica com valor true', () => {
            filterBuilder.comNivelAcesso('admin');
            const filtros = filterBuilder.build();
            expect(filtros).toEqual({ 'nivel_acesso.admin': true });
        });

        it('não deve adicionar nada se nivelAcesso for vazio', () => {
            filterBuilder.comNivelAcesso('');
            const filtros = filterBuilder.build();
            expect(filtros).toEqual({});
        });
    });

    describe('comCargo()', () => {
        it('deve adicionar filtro de cargo quando fornecido', () => {
            filterBuilder.comCargo('Analista');
            const filtros = filterBuilder.build();
            expect(filtros).toEqual({
                cargo: { $regex: 'Analista', $options: 'i' }
            });
        });

        it('não deve adicionar filtro se cargo for vazio', () => {
            filterBuilder.comCargo('');
            const filtros = filterBuilder.build();
            expect(filtros).toEqual({});
        });
    });

    describe('comFormacao()', () => {
        it('deve adicionar filtro de formação quando fornecido', () => {
            filterBuilder.comFormacao('Superior');
            const filtros = filterBuilder.build();
            expect(filtros).toEqual({
                formacao: { $regex: 'Superior', $options: 'i' }
            });
        });

        it('não deve adicionar filtro se formação for vazia', () => {
            filterBuilder.comFormacao('');
            const filtros = filterBuilder.build();
            expect(filtros).toEqual({});
        });
    });

    describe('comSecretaria()', () => {
    it('deve adicionar filtro com $in se secretaria for um array', async () => {
        const builder = new UsuarioFilterBuild();
        await builder.comSecretaria(['123', '456']);
        const filtros = builder.build();
        expect(filtros).toEqual({
        secretarias: { $in: ['123', '456'] }
        });
    });

    it('deve adicionar filtro com _id único se secretariaRepository retornar 1 secretaria', async () => {
        const mockSecretaria = { _id: 'abc123' };

        const builder = new UsuarioFilterBuild();
        builder.secretariaRepository.buscarPorNome = jest.fn().mockResolvedValue(mockSecretaria);

        await builder.comSecretaria('Secretaria de Saúde');
        const filtros = builder.build();
        expect(builder.secretariaRepository.buscarPorNome).toHaveBeenCalledWith('Secretaria de Saúde');
        expect(filtros).toEqual({
        secretarias: { $in: ['abc123'] }
        });
    });

    it('deve adicionar múltiplos _id se secretariaRepository retornar array de secretarias', async () => {
        const mockSecretarias = [{ _id: 'id1' }, { _id: 'id2' }];

        const builder = new UsuarioFilterBuild();
        builder.secretariaRepository.buscarPorNome = jest.fn().mockResolvedValue(mockSecretarias);

        await builder.comSecretaria('Educação');
        const filtros = builder.build();
        expect(filtros).toEqual({
        secretarias: { $in: ['id1', 'id2'] }
        });
    });

    it('deve adicionar array vazio se nenhuma secretaria for encontrada', async () => {
        const builder = new UsuarioFilterBuild();
        builder.secretariaRepository.buscarPorNome = jest.fn().mockResolvedValue(null);

        await builder.comSecretaria('Inexistente');
        const filtros = builder.build();
        expect(filtros).toEqual({
        secretarias: { $in: [] }
        });
    });

    it('não deve adicionar nada se secretaria for falsy', async () => {
        const builder = new UsuarioFilterBuild();
        await builder.comSecretaria('');
        const filtros = builder.build();
        expect(filtros).toEqual({});
    });
    });

    describe('escapeRegex()', () => {
        it('deve escapar caracteres especiais corretamente', () => {
            const textoOriginal = 'a+b*c^d$e.f';
            const resultado = filterBuilder.escapeRegex(textoOriginal);
            expect(resultado).toBe('a\\+b\\*c\\^d\\$e\\.f');
        });
    });

    describe('build()', () => {
        it('deve retornar objeto vazio quando nenhum filtro for adicionado', () => {
            const filtros = filterBuilder.build();
            expect(filtros).toEqual({});
        });

        it('deve combinar múltiplos filtros corretamente', () => {
            filterBuilder
                .comNome('Ana')
                .comEmail('ana@email.com')
                .comCargo('Dev')
                .comFormacao('Graduação')
                .comAtivo(true)
                .comNivelAcesso('usuario');

            const filtros = filterBuilder.build();
            expect(filtros).toEqual({
                nome: { $regex: 'Ana', $options: 'i' },
                email: { $regex: 'ana@email.com', $options: 'i' },
                cargo: { $regex: 'Dev', $options: 'i' },
                formacao: { $regex: 'Graduação', $options: 'i' },
                ativo: true,
                'nivel_acesso.usuario': true
            });
        });
    });
});
