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
