import SecretariaFilterBuilder from '../../../repository/filters/SecretariaFilterBuild.js';

describe('SecretariaFilterBuilder', () => {
    let filterBuilder;

    beforeEach(() => {
        filterBuilder = new SecretariaFilterBuilder();
    });

    describe('comNome()', () => {
        it('deve adicionar filtro de nome quando o nome for fornecido', () => {
            const nome = "Educação";
            filterBuilder.comNome(nome);
            
            const filtros = filterBuilder.build();
            
            expect(filtros).toEqual({
                nome: { $regex: nome, $options: 'i' }
            });
        });

        it('não deve adicionar filtro de nome quando o nome for vazio', () => {
            filterBuilder.comNome('');
            
            const filtros = filterBuilder.build();
            
            expect(filtros).toEqual({});
        });
    });

    describe('comSigla()', () => {
        it('deve adicionar filtro de sigla quando a sigla for fornecida', () => {
            const sigla = "SEC";
            filterBuilder.comSigla(sigla);
            
            const filtros = filterBuilder.build();
            
            expect(filtros).toEqual({
                sigla: { $regex: sigla, $options: 'i' }
            });
        });

        it('não deve adicionar filtro de sigla quando a sigla for vazia', () => {
            filterBuilder.comSigla('');
            
            const filtros = filterBuilder.build();
            
            expect(filtros).toEqual({});
        });
    });

    describe('build()', () => {
        it('deve retornar um objeto vazio quando nenhum filtro for adicionado', () => {
            const filtros = filterBuilder.build();
            expect(filtros).toEqual({});
        });

        it('deve combinar múltiplos filtros corretamente', () => {
            filterBuilder
                .comNome("Saúde")
                .comSigla("SMS");
            
            const filtros = filterBuilder.build();
            
            expect(filtros).toEqual({
                nome: { $regex: "Saúde", $options: 'i' },
                sigla: { $regex: "SMS", $options: 'i' }
            });
        });
    });
});