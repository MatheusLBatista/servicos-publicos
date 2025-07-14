// // src/tests/unit/utils/validators/schemas/zod/querys/GrupoQuerySchema.test.js
// import { strict as assert } from 'assert';
// import GrupoQuerySchema from '../../../../../../../utils/validators/schemas/zod/querys/GrupoQuerySchema.js';

// import mongoose from 'mongoose';

// describe('Validações de Schemas Zod', () => {

//     describe('GrupoIDSchema', () => {
//         it('deve validar um ObjectId correto', () => {
//             const validId = new mongoose.Types.ObjectId().toString();
//             assert.doesNotThrow(() => GrupoIDSchema.parse(validId));
//         });

//         it('deve invalidar um ObjectId incorreto', () => {
//             const invalidId = '12345';
//             assert.throws(
//                 () => GrupoIDSchema.parse(invalidId),
//                 /ID inválido/
//             );
//         });
//     });

//     describe('GrupoQuerySchema', () => {
//         // Definição de um objeto de query válido base para reutilização
//         const baseValidQuery = {
//             nome: 'Grupo 1',
//             descricao: 'Descrição do grupo',
//             ativo: 'true',
//             unidade: 'Unidade 1',
//             page: '2',
//             limite: '20'
//         };

//         it('deve validar um objeto de query correto', () => {
//             assert.doesNotThrow(() => GrupoQuerySchema.parse(baseValidQuery));
//         });

//         it('deve invalidar um valor incorreto para ativo', () => {
//             const invalidQuery = { ...baseValidQuery, ativo: 'yes' };
//             assert.throws(
//                 () => GrupoQuerySchema.parse(invalidQuery),
//                 /Ativo deve ser 'true' ou 'false'/
//             );
//         });

//         it('deve invalidar um page não inteiro', () => {
//             const invalidQuery = { ...baseValidQuery, page: 'abc' };
//             assert.throws(
//                 () => GrupoQuerySchema.parse(invalidQuery),
//                 /Page deve ser um número inteiro maior que 0/
//             );
//         });

//         it('deve invalidar um page menor que 1', () => {
//             const invalidQuery = { ...baseValidQuery, page: '0' };
//             assert.throws(
//                 () => GrupoQuerySchema.parse(invalidQuery),
//                 /Page deve ser um número inteiro maior que 0/
//             );
//         });

//         it('deve invalidar um limite não inteiro', () => {
//             const invalidQuery = { ...baseValidQuery, limite: 'abc' };
//             assert.throws(
//                 () => GrupoQuerySchema.parse(invalidQuery),
//                 /Limite deve ser um número inteiro entre 1 e 100/
//             );
//         });

//         it('deve invalidar um limite menor que 1', () => {
//             const invalidQuery = { ...baseValidQuery, limite: '0' };
//             assert.throws(
//                 () => GrupoQuerySchema.parse(invalidQuery),
//                 /Limite deve ser um número inteiro entre 1 e 100/
//             );
//         });

//         it('deve invalidar um limite maior que 100', () => {
//             const invalidQuery = { ...baseValidQuery, limite: '101' };
//             assert.throws(
//                 () => GrupoQuerySchema.parse(invalidQuery),
//                 /Limite deve ser um número inteiro entre 1 e 100/
//             );
//         });

//         it('deve validar um objeto de query com campos opcionais ausentes', () => {
//             const validQuery = {};
//             assert.doesNotThrow(() => GrupoQuerySchema.parse(validQuery));
//         });
//     });
// });
