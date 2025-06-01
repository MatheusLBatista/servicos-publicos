import TipoDemandaFilterBuild from '../../../repository/filters/TipoDemandaFilterBuild.js';

describe('TipoDemandaFilterBuild', () => {
    let filterBuilder;

    beforeEach(() => {
        filterBuilder = new TipoDemandaFilterBuild();
    });

    describe('comTitulo()', () => {
        it('deve adicionar filtro de titulo quando o titulo for fornecido', () => {
            const titulo = "Iluminação Pública";
            filterBuilder.comTitulo(titulo);

            const filtros = filterBuilder.build();

            expect(filtros).toEqual({
                titulo: { $regex: titulo, $options: 'i' }
            });
        });

        it('não deve adicionar filtro de titulo quando o titulo for vazio', () => {
            filterBuilder.comTitulo('');

            const filtros = filterBuilder.build();

            expect(filtros).toEqual({});
        });
    });

    describe('comTipo()', () => {
        it('deve adicionar filtro de tipo quando o tipo for fornecido', () => {
            const tipo = "Coleta";
            filterBuilder.comTipo(tipo);

            const filtros = filterBuilder.build();

            expect(filtros).toEqual({
                tipo: { $regex: tipo, $options: 'i' }
            });
        });

        it('não deve adicionar filtro de tipo quando o tipo for vazio', () => {
            filterBuilder.comTipo('');

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
                .comTitulo("Iluminação")
                .comTipo("Urbana");

            const filtros = filterBuilder.build();

            expect(filtros).toEqual({
                titulo: { $regex: "Iluminação", $options: 'i' },
                tipo: { $regex: "Urbana", $options: 'i' }
            });
        });
    });
});
