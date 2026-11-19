// Syntax-check story JS files in JavaScriptCore without running them.
// Usage: osascript -l JavaScript story/dev/syntax.js <file.js> [more.js ...]
// Prints "ok <file>" or "FAIL <file>: <error>" per file; exit text "ALL OK" or "FAILED n".
ObjC.import('Foundation');
function run(argv) {
  var out = [], bad = 0;
  argv.forEach(function (p) {
    var s = $.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null);
    if (!s || s.isNil && s.isNil()) { out.push('FAIL ' + p + ': cannot read'); bad++; return; }
    try { new Function(s.js); out.push('ok ' + p); }
    catch (e) { out.push('FAIL ' + p + ': ' + e.message + (e.line ? ' line ' + e.line : '')); bad++; }
  });
  out.push(bad ? 'FAILED ' + bad : 'ALL OK');
  return out.join('\n');
}
