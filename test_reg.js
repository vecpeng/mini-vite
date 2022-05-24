// 匹配以字母数字或者@开头
const BARE_IMPORT_RE = /^[\w@][^:]/;

console.log(BARE_IMPORT_RE.test('react'));
console.log(BARE_IMPORT_RE.test('react-dom'));
console.log(BARE_IMPORT_RE.test('react@test'));
console.log(BARE_IMPORT_RE.test('re:react@test.js'));