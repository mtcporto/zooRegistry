const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
function loadAction(file) {
    const filename = path.resolve(__dirname, '../src/ai/flows', file);
    const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
    const loaded = new Module(filename, module);
    loaded.filename = filename;
    loaded.paths = Module._nodeModulePaths(path.dirname(filename));
    loaded._compile(compiled.outputText, filename);
    return loaded.exports;
}
const { getAnimalImage } = loadAction('get-animal-image-flow.ts');
const { getConservationStatusAndTaxonomy } = loadAction('get-conservation-status-flow.ts');
const originalFetch = global.fetch;
const oldPexels = process.env.PEXELS_API_KEY;
const oldIucn = process.env.IUCN_REDLIST_API_TOKEN;
afterEach(() => {
    global.fetch = originalFetch;
    for (const [key, value] of [['PEXELS_API_KEY',oldPexels],['IUCN_REDLIST_API_TOKEN',oldIucn]]) {
        if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
});
test('validates input and preserves missing-key responses without network calls', async () => {
    delete process.env.PEXELS_API_KEY; delete process.env.IUCN_REDLIST_API_TOKEN;
    global.fetch = () => { throw new Error('unexpected network call'); };
    await assert.rejects(getAnimalImage({ animalName: 123 }));
    await assert.rejects(getConservationStatusAndTaxonomy({ scientificName: null }));
    assert.equal((await getAnimalImage({ animalName: 'Lion' })).imageUrl, null);
    assert.equal((await getConservationStatusAndTaxonomy({ scientificName: 'Panthera leo' })).status, null);
});
test('keeps Pexels image and IUCN taxonomy results', async () => {
    process.env.PEXELS_API_KEY = 'test-only'; process.env.IUCN_REDLIST_API_TOKEN = 'test-only';
    global.fetch = async url => {
        if (new URL(url).hostname === 'api.pexels.com') return Response.json({ photos: [{ src: { large: 'https://images.pexels.com/test.jpg' } }] });
        assert.equal(new URL(url).hostname, 'api.iucnredlist.org');
        return Response.json({ taxon: { kingdom_name: 'Animalia', class_name: 'Mammalia' }, assessments: [{ latest: true, scopes: [{ code: '1' }], red_list_category_code: 'VU' }] });
    };
    assert.equal((await getAnimalImage({ animalName: 'Lion' })).imageUrl, 'https://images.pexels.com/test.jpg');
    const taxonomy = await getConservationStatusAndTaxonomy({ scientificName: 'Panthera leo' });
    assert.equal(taxonomy.status, 'VU');
    assert.equal(taxonomy.className, 'Mammalia');
});
