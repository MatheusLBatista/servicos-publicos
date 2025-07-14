// src/tests/unit/repository/filters/GrupoFilterBuild.test.js
import GrupoFilterBuild from '../../../repository/filters/GrupoFilterBuild.js';

describe('GrupoFilterBuild', () => {
  let grupoFilterBuilder;

  beforeEach(() => {
    grupoFilterBuilder = new GrupoFilterBuild();
  });

  describe('comNome', () => {
    it('deve adicionar filtro de nome se fornecido', () => {
      grupoFilterBuilder.comNome('Grupo1');
      expect(grupoFilterBuilder.build()).toEqual({
        nome: { $regex: 'Grupo1', $options: 'i' }
      });
    });

    it('não deve adicionar filtro de nome se string vazia', () => {
      grupoFilterBuilder.comNome('');
      expect(grupoFilterBuilder.build()).toEqual({});
    });

    it('não deve adicionar filtro de nome se valor nulo', () => {
      grupoFilterBuilder.comNome(null);
      expect(grupoFilterBuilder.build()).toEqual({});
    });
  });

  describe('comAtivo', () => {
    it('deve adicionar ativo como true para "true"', () => {
      grupoFilterBuilder.comAtivo("true");
      expect(grupoFilterBuilder.build()).toEqual({ ativo: true });
    });

    it('deve adicionar ativo como true para booleano true', () => {
      grupoFilterBuilder.comAtivo(true);
      expect(grupoFilterBuilder.build()).toEqual({ ativo: true });
    });

    it('deve adicionar ativo como false se valor não for interpretado como true', () => {
      grupoFilterBuilder.comAtivo("false");
      expect(grupoFilterBuilder.build()).toEqual({ ativo: false });
    });
  });

  describe('build', () => {
    it('deve retornar os filtros acumulados', () => {
      grupoFilterBuilder
        .comNome('Admin')
        .comAtivo(true);
      const filtros = grupoFilterBuilder.build();
      expect(filtros).toEqual({
        nome: { $regex: 'Admin', $options: 'i' },
        ativo: true
      });
    });
  });
});
