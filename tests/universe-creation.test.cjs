// Uses the project's existing TypeScript compiler; no test dependency required.
const ts = require('typescript');
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const result = ts.transpileModule(fs.readFileSync('src/lib/universe-creation.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const context = { exports: {} };
vm.runInNewContext(result.outputText, context);
const { initialUniverse, validateUniverse, slugFromName, slugError } = context.exports;
const valid = { ...initialUniverse, name: 'Our Universe', slug: 'our-universe' };
assert.equal(validateUniverse(valid), null);
assert.equal(slugFromName('Our Universe!'), 'our-universe');
assert.equal(slugFromName('한글'), '');
for (const slug of ['', 'create', '../test', 'Two Words', 'UPPER', '-bad', 'bad-', 'a'.repeat(65)]) assert.ok(slugError(slug));
for (const patch of [{ name: '  ' }, { sections: [] }, { sections: ['A', ' a '] }, { sections: [''] }, { sections: Array(9).fill('A') }, { allow_comments: 'yes' }, { visibility: 'secret' }, { category: '__proto__' }]) assert.ok(validateUniverse({ ...valid, ...patch }));
assert.equal(validateUniverse({ ...valid, sections: [''] }, 0), null);
assert.ok(validateUniverse(null));
console.log('Universe validation checks passed');
