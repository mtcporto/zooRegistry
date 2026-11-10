const assert = require("node:assert/strict");
const { test } = require("node:test");
const { registerHooks } = require("node:module");
const { pathToFileURL } = require("node:url");
const path = require("node:path");
const { zodResolver } = require("@hookform/resolvers/zod");

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "@/types") {
      return nextResolve(pathToFileURL(path.join(__dirname, "../src/types/index.ts")).href, context);
    }
    return nextResolve(specifier, context);
  },
});
const { animalFormSchema, cadastroFormSchema } = require("../src/lib/animal-form-schemas.ts");
const options = { fields: {}, shouldUseNativeValidation: false, criteriaMode: "all" };
const animal = { f_nomecientifico: "Panthera leo", f_nome: "Leão" };

for (const mode of ["async", "sync"]) {
  const resolveAnimal = zodResolver(animalFormSchema, undefined, { mode });
  const resolveCadastro = zodResolver(cadastroFormSchema, undefined, { mode });

  test(`${mode}: valid species preserves nullable fields and empty image`, async () => {
    const values = { ...animal, f_nomes_alternativos: null, f_imagem: "" };
    const result = await resolveAnimal(values, {}, options);
    assert.deepEqual(result.errors, {});
    assert.deepEqual(result.values, values);
  });

  test(`${mode}: invalid species returns messages instead of throwing`, async () => {
    const result = await resolveAnimal({ ...animal, f_nome: "", f_imagem: "not-a-url" }, {}, options);
    assert.deepEqual(result.values, {});
    assert.equal(result.errors.f_nome.message, "Nome vulgar deve ter pelo menos 2 caracteres.");
    assert.equal(result.errors.f_imagem.message, "Por favor, insira uma URL válida para a imagem.");
  });

  test(`${mode}: registration output applies false default and keeps dates/enums`, async () => {
    const date = new Date("2026-01-01T12:00:00Z");
    const values = { f_animalId: "fixture-species", f_entrada: date, f_sexo: "Macho", f_apelido: null };
    const result = await resolveCadastro(values, {}, options);
    assert.deepEqual(result.errors, {});
    assert.deepEqual(result.values, { ...values, f_origem_trafico: false });
    const flagged = await resolveCadastro({ ...values, f_origem_trafico: true }, {}, options);
    assert.equal(flagged.values.f_origem_trafico, true);
  });

  test(`${mode}: missing species keeps the existing required message`, async () => {
    const result = await resolveCadastro({}, {}, options);
    assert.deepEqual(result.values, {});
    assert.equal(result.errors.f_animalId.message, "Selecione a espécie do animal.");
  });

  test(`${mode}: invalid registration date/enum/boolean returns field errors`, async () => {
    const result = await resolveCadastro({
      f_animalId: "fixture-species",
      f_entrada: new Date("invalid"),
      f_sexo: "invalid",
      f_origem_trafico: null,
    }, {}, options);
    assert.deepEqual(result.values, {});
    for (const field of ["f_entrada", "f_sexo", "f_origem_trafico"]) {
      assert.ok(result.errors[field], field);
    }
  });
}
