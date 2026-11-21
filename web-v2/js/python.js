/* LabClub — interprete Python "lite" in JavaScript.
 * Sottoinsieme didattico: variabili, numeri, stringhe, liste, slice,
 * if/elif/else, for, while, def/return, print, f-string, metodi comuni
 * e poche funzioni built-in. Limite: 2000 passi per evitare cicli infiniti.
 */
(function (App) {
  "use strict";

  const MAX_STEPS = 2000;
  const MAX_RANGE = 5000;
  const MAX_REPEAT = 5000;
  const MAX_CALL_DEPTH = 50;

  let callDepth = 0;

  /* I numeri float sono incapsulati per distinguere 7 da 7.0,
   * come fa Python quando stampa il risultato di una divisione. */
  function PyFloat(value) {
    this.value = value;
  }

  function isFloat(value) {
    return value instanceof PyFloat;
  }

  function isNumberLike(value) {
    return typeof value === "number" || isFloat(value);
  }

  function numValue(value) {
    return isFloat(value) ? value.value : value;
  }

  function wrapNumber(value, float) {
    return float ? new PyFloat(value) : value;
  }

  function ReturnSignal(value) {
    this.value = value;
  }
  function BreakSignal() {}
  function ContinueSignal() {}

  function fail(message) {
    throw new Error(message);
  }

  function stripInlineComment(raw) {
    let inSingle = false;
    let inDouble = false;
    for (let i = 0; i < raw.length; i++) {
      const c = raw[i];
      if (c === "\\" && (inSingle || inDouble)) {
        i++;
        continue;
      }
      if (c === "'" && !inDouble) inSingle = !inSingle;
      else if (c === '"' && !inSingle) inDouble = !inDouble;
      else if (c === "#" && !inSingle && !inDouble) return raw.slice(0, i);
    }
    return raw;
  }

  function parseSource(source) {
    const rawLines = String(source == null ? "" : source).replace(/\r\n?/g, "\n").split("\n");
    const parsed = [];
    rawLines.forEach(function (raw, idx) {
      const stripped = stripInlineComment(raw);
      if (stripped.trim() === "") return;
      let indent = 0;
      for (let i = 0; i < raw.length; i++) {
        const ch = raw[i];
        if (ch === " ") indent += 1;
        else if (ch === "\t") indent += 4;
        else break;
      }
      parsed.push({ lineNumber: idx + 1, indent: indent, content: stripped.trim() });
    });
    return parsed;
  }

  function run(source) {
    const lines = parseSource(source);
    const env = Object.create(null);
    let output = "";
    let steps = 0;

    callDepth = 0;

    function tick() {
      steps++;
      if (steps > MAX_STEPS) fail("Limite esecuzione superato (possibile ciclo infinito)");
    }

    function print(text) {
      output += text + "\n";
    }

    try {
      executeBlock(lines, 0, lines.length, env, print, tick);
      const text = output.replace(/\s+$/, "");
      return {
        output: text === "" ? "(Nessun output stampato)" : text,
        hasError: false
      };
    } catch (err) {
      const prefix = output.trim() ? output.replace(/\s+$/, "") + "\n\n" : "";
      let message = err && err.message ? err.message : "Sintassi non valida";
      if (err instanceof ReturnSignal) message = "return usato fuori da una funzione";
      else if (err instanceof BreakSignal) message = "break usato fuori da un ciclo";
      else if (err instanceof ContinueSignal) message = "continue usato fuori da un ciclo";
      return {
        output: prefix + "Errore Python: " + message,
        hasError: true
      };
    }
  }

  function executeBlock(lines, start, end, env, print, tick) {
    let i = start;
    while (i < end) {
      tick();
      const line = lines[i];
      const text = line.content;

      /* ---------- def ---------- */
      if (text.startsWith("def ") && text.endsWith(":")) {
        const header = text.slice(4, -1).trim();
        const match = /^([A-Za-z_]\w*)\s*\(([^)]*)\)$/.exec(header);
        if (!match) fail("Sintassi def non valida nella riga " + line.lineNumber);
        const fnName = match[1];
        const rawParams = match[2].trim();
        const params = rawParams
          ? splitTopLevelArgs(rawParams).map(function (part) {
              const name = part.trim();
              if (!/^[A-Za-z_]\w*$/.test(name)) {
                fail("Parametro non valido in " + fnName + "(): " + name);
              }
              return name;
            })
          : [];
        const bodyStart = i + 1;
        const bodyEnd = findBlockEnd(lines, bodyStart, end, line.indent);
        env[fnName] = {
          __fn: true,
          name: fnName,
          params: params,
          lines: lines,
          bodyStart: bodyStart,
          bodyEnd: bodyEnd,
          closure: env,
          print: print,
          tick: tick
        };
        i = bodyEnd;
        continue;
      }

      /* ---------- pass / break / continue / return ---------- */
      if (text === "pass") {
        i++;
        continue;
      }
      if (text === "break") throw new BreakSignal();
      if (text === "continue") throw new ContinueSignal();
      if (text === "return" || text.startsWith("return ")) {
        throw new ReturnSignal(text === "return" ? null : evalExpr(text.slice(7).trim(), env));
      }

      /* ---------- if / elif / else ---------- */
      if (text.startsWith("if ") && text.endsWith(":")) {
        const branches = [];
        let curIdx = i;
        while (curIdx < end) {
          const cur = lines[curIdx];
          const bodyStart = curIdx + 1;
          const bodyEnd = findBlockEnd(lines, bodyStart, end, cur.indent);
          if (curIdx === i) {
            branches.push({ cond: cur.content.slice(3, -1).trim(), start: bodyStart, end: bodyEnd });
          } else if (
            cur.indent === line.indent &&
            cur.content.startsWith("elif ") &&
            cur.content.endsWith(":")
          ) {
            branches.push({ cond: cur.content.slice(5, -1).trim(), start: bodyStart, end: bodyEnd });
          } else if (cur.indent === line.indent && cur.content === "else:") {
            branches.push({ cond: null, start: bodyStart, end: bodyEnd });
          } else {
            break;
          }
          curIdx = bodyEnd;
          if (
            curIdx >= end ||
            lines[curIdx].indent !== line.indent ||
            (!lines[curIdx].content.startsWith("elif ") && lines[curIdx].content !== "else:")
          ) {
            break;
          }
        }
        for (let b = 0; b < branches.length; b++) {
          const branch = branches[b];
          if (branch.cond === null || toBoolean(evalExpr(branch.cond, env))) {
            executeBlock(lines, branch.start, branch.end, env, print, tick);
            break;
          }
        }
        i = curIdx;
        continue;
      }

      /* ---------- for ... in ... ---------- */
      if (text.startsWith("for ") && text.includes(" in ") && text.endsWith(":")) {
        const header = text.slice(4, -1).trim();
        const splitIdx = header.indexOf(" in ");
        const varName = header.slice(0, splitIdx).trim();
        const iterableExpr = header.slice(splitIdx + 4).trim();
        const bodyStart = i + 1;
        const bodyEnd = findBlockEnd(lines, bodyStart, end, line.indent);
        const iterable = evalExpr(iterableExpr, env);
        let items;
        if (Array.isArray(iterable)) items = iterable;
        else if (typeof iterable === "string") items = iterable.split("");
        else fail("Oggetto non iterabile nella riga " + line.lineNumber);
        for (let n = 0; n < items.length; n++) {
          tick();
          env[varName] = items[n];
          try {
            executeBlock(lines, bodyStart, bodyEnd, env, print, tick);
          } catch (err) {
            if (err instanceof BreakSignal) break;
            if (err instanceof ContinueSignal) continue;
            throw err;
          }
        }
        i = bodyEnd;
        continue;
      }

      /* ---------- while ---------- */
      if (text.startsWith("while ") && text.endsWith(":")) {
        const cond = text.slice(6, -1).trim();
        const bodyStart = i + 1;
        const bodyEnd = findBlockEnd(lines, bodyStart, end, line.indent);
        while (toBoolean(evalExpr(cond, env))) {
          tick();
          try {
            executeBlock(lines, bodyStart, bodyEnd, env, print, tick);
          } catch (err) {
            if (err instanceof BreakSignal) break;
            if (err instanceof ContinueSignal) continue;
            throw err;
          }
        }
        i = bodyEnd;
        continue;
      }

      /* ---------- print ---------- */
      if (text.startsWith("print(") && text.endsWith(")")) {
        const inner = text.slice(6, -1);
        const args = splitTopLevelArgs(inner);
        print(args.map(function (arg) {
          return formatValue(evalExpr(arg, env));
        }).join(" "));
        i++;
        continue;
      }

      /* ---------- += / -= ---------- */
      if (hasTopLevel(text, "+=") || hasTopLevel(text, "-=")) {
        const isPlus = hasTopLevel(text, "+=");
        const op = isPlus ? "+=" : "-=";
        const at = topLevelIndexOf(text, op);
        const varName = text.slice(0, at).trim();
        const rhs = evalExpr(text.slice(at + 2), env);
        const cur = varName in env ? env[varName] : 0;
        env[varName] = isPlus ? applyPlus(cur, rhs) : applyMinus(cur, rhs);
        i++;
        continue;
      }

      /* ---------- assegnazione ---------- */
      const eqIdx = findAssignmentIndex(text);
      if (eqIdx > 0) {
        const varName = text.slice(0, eqIdx).trim();
        const expr = text.slice(eqIdx + 1).trim();
        const target = /^([A-Za-z_]\w*)\s*\[(.+)\]$/.exec(varName);
        if (target) {
          const list = env[target[1]];
          if (!Array.isArray(list)) {
            fail("Non posso assegnare a '" + varName + "': '" + target[1] + "' non è una lista");
          }
          const rawIndex = evalExpr(target[2], env);
          const index = asNumber(rawIndex);
          const real = index < 0 ? list.length + index : index;
          if (!Number.isInteger(real) || real < 0 || real >= list.length) {
            fail("Indice fuori dalla lista: " + rawIndex);
          }
          const value = evalExpr(expr, env);
          list[real] = value;
          i++;
          continue;
        }
        env[varName] = evalExpr(expr, env);
        i++;
        continue;
      }

      if (/^(if|elif|while|for|else)\b/.test(text)) {
        fail("Sintassi non valida nella riga " + line.lineNumber + ": controlla i due punti finali");
      }

      /* ---------- espressione ---------- */
      evalExpr(text, env);
      i++;
    }
  }

  function findBlockEnd(lines, start, end, parentIndent) {
    let idx = start;
    while (idx < end && lines[idx].indent > parentIndent) idx++;
    return idx;
  }

  /* ---------- assegnazione ---------- */

  function findAssignmentIndex(text) {
    let inSingle = false;
    let inDouble = false;
    let depth = 0;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === "'" && !inDouble) inSingle = !inSingle;
      else if (c === '"' && !inSingle) inDouble = !inDouble;
      else if ((c === "(" || c === "[") && !inSingle && !inDouble) depth++;
      else if ((c === ")" || c === "]") && !inSingle && !inDouble) depth--;
      else if (c === "=" && !inSingle && !inDouble && depth === 0) {
        const prev = text[i - 1];
        const next = text[i + 1];
        if (prev !== "=" && prev !== "!" && prev !== "<" && prev !== ">" && next !== "=") return i;
      }
    }
    return -1;
  }

  /* ---------- valutazione espressioni ---------- */

  function evalExpr(rawExpr, env) {
    const expr = String(rawExpr == null ? "" : rawExpr).trim();
    if (!expr) return null;

    if (expr.startsWith("(") && expr.endsWith(")") && matchingClose(expr, 0) === expr.length - 1) {
      return evalExpr(expr.slice(1, -1), env);
    }

    let idx = findTopLevelKeyword(expr, " or ");
    if (idx !== null) {
      return toBoolean(evalExpr(expr.slice(0, idx), env)) || toBoolean(evalExpr(expr.slice(idx + 4), env));
    }
    idx = findTopLevelKeyword(expr, " and ");
    if (idx !== null) {
      return toBoolean(evalExpr(expr.slice(0, idx), env)) && toBoolean(evalExpr(expr.slice(idx + 5), env));
    }
    if (expr.startsWith("not ")) {
      return !toBoolean(evalExpr(expr.slice(4), env));
    }

    const comparisons = findTopLevelComparators(expr);
    if (comparisons.length) {
      let left = evalExpr(expr.slice(0, comparisons[0].index), env);
      for (let c = 0; c < comparisons.length; c++) {
        const start = comparisons[c].index + comparisons[c].op.length;
        const stop = c + 1 < comparisons.length ? comparisons[c + 1].index : expr.length;
        const right = evalExpr(expr.slice(start, stop), env);
        if (!compareValues(left, right, comparisons[c].op)) return false;
        left = right;
      }
      return true;
    }

    const plus = findLastTopLevelPlusMinus(expr);
    if (plus) {
      const left = evalExpr(expr.slice(0, plus.index), env);
      const right = evalExpr(expr.slice(plus.index + 1), env);
      return plus.op === "+" ? applyPlus(left, right) : applyMinus(left, right);
    }

    const mul = findLastTopLevelMulDiv(expr);
    if (mul) {
      const left = evalExpr(expr.slice(0, mul.index), env);
      const right = evalExpr(expr.slice(mul.index + mul.op.length), env);
      return applyMulDiv(left, right, mul.op);
    }

    const pow = findTopLevelPow(expr);
    if (pow !== null) {
      return applyPow(evalExpr(expr.slice(0, pow), env), evalExpr(expr.slice(pow + 2), env));
    }

    if (
      (expr.startsWith('f"') && expr.endsWith('"')) ||
      (expr.startsWith("f'") && expr.endsWith("'"))
    ) {
      const inner = expr.slice(2, -1);
      return inner.replace(/\{([^}]+)\}/g, function (match, code) {
        return formatValue(evalExpr(code, env));
      });
    }

    if (
      (expr.startsWith('"') && expr.endsWith('"')) ||
      (expr.startsWith("'") && expr.endsWith("'"))
    ) {
      return unescapeString(expr.slice(1, -1));
    }

    if (expr === "True") return true;
    if (expr === "False") return false;
    if (expr === "None") return null;

    if (/^-?\d+$/.test(expr)) return Number(expr);
    if (/^-?\d*\.\d+$/.test(expr)) return new PyFloat(Number(expr));

    if (expr.startsWith("[") && expr.endsWith("]")) {
      const inner = expr.slice(1, -1).trim();
      if (!inner) return [];
      return splitTopLevelArgs(inner).map(function (part) {
        return evalExpr(part, env);
      });
    }

    const method = /^(.+)\.([A-Za-z_]\w*)\s*\(([\s\S]*)\)$/.exec(expr);
    if (method) {
      const target = evalExpr(method[1], env);
      const args = splitTopLevelArgs(method[3]).map(function (part) {
        return evalExpr(part, env);
      });
      return callMethod(target, method[2], args);
    }

    if (expr.endsWith(")") && expr.includes("(")) {
      const openIdx = expr.indexOf("(");
      const fnName = expr.slice(0, openIdx).trim();
      const args = splitTopLevelArgs(expr.slice(openIdx + 1, -1)).map(function (part) {
        return evalExpr(part, env);
      });
      if (isUserFunction(env[fnName])) return callUserFunction(env[fnName], args);
      return callBuiltin(fnName, args);
    }

    if (expr.endsWith("]") && expr.includes("[")) {
      const openIdx = expr.lastIndexOf("[");
      const targetExpr = expr.slice(0, openIdx);
      const inner = expr.slice(openIdx + 1, -1);
      if (inner.indexOf(":") !== -1) {
        return sliceValue(evalExpr(targetExpr, env), inner, env);
      }
      const target = evalExpr(targetExpr, env);
      const rawIndex = evalExpr(inner, env);
      if (!isNumberLike(rawIndex)) fail("Indice non valido");
      const index = Math.trunc(numValue(rawIndex));
      if (Array.isArray(target)) {
        const real = index < 0 ? target.length + index : index;
        if (real < 0 || real >= target.length) fail("Indice fuori dalla lista: " + index);
        return target[real];
      }
      if (typeof target === "string") {
        const real = index < 0 ? target.length + index : index;
        if (real < 0 || real >= target.length) fail("Indice fuori dalla stringa: " + index);
        return target[real];
      }
      fail("Indicizzazione non supportata");
    }

    if (expr in env) return env[expr];
    fail("Nome non definito: '" + expr + "'");
  }

  /* ---------- built-in ---------- */

  function callBuiltin(name, args) {
    switch (name) {
      case "range": {
        if (args.length < 1 || args.length > 3) fail("range() richiede 1..3 argomenti");
        let start = 0;
        let stop = 0;
        let step = 1;
        if (args.length === 1) {
          stop = asNumber(args[0]);
        } else {
          start = asNumber(args[0]);
          stop = asNumber(args[1]);
          if (args.length === 3) step = asNumber(args[2]);
        }
        start = Math.trunc(start);
        stop = Math.trunc(stop);
        step = Math.trunc(step);
        if (step === 0) fail("range() con passo 0 non è valido");
        const count = Math.max(0, Math.ceil((stop - start) / step));
        if (count > MAX_RANGE) fail("range() troppo grande (max " + MAX_RANGE + " elementi)");
        const out = [];
        for (let n = 0, value = start; n < count; n++, value += step) out.push(value);
        return out;
      }
      case "len": {
        const x = args[0];
        if (Array.isArray(x)) return x.length;
        if (typeof x === "string") return x.length;
        fail("len() non valido per questo tipo");
        break;
      }
      case "str":
        return formatValue(args[0]);
      case "int": {
        const x = args[0];
        if (isNumberLike(x)) return Math.trunc(numValue(x));
        if (typeof x === "string") {
          const n = Number(x.trim());
          if (!isFinite(n)) fail("Impossibile convertire in int: " + x);
          return Math.trunc(n);
        }
        if (typeof x === "boolean") return x ? 1 : 0;
        fail("Impossibile convertire in int");
        break;
      }
      case "float": {
        const x = args[0];
        if (isNumberLike(x)) return new PyFloat(numValue(x));
        if (typeof x === "string") {
          const n = Number(x.trim());
          if (!isFinite(n)) fail("Impossibile convertire in float: " + x);
          return new PyFloat(n);
        }
        fail("Impossibile convertire in float");
        break;
      }
      case "sum": {
        const list = args[0];
        if (!Array.isArray(list)) fail("sum() richiede una lista");
        let total = 0;
        list.forEach(function (item) {
          const value = asNumber(item);
          total = wrapNumber(numValue(total) + value, isFloat(total) || isFloat(item));
        });
        return total;
      }
      case "max":
      case "min": {
        let list = Array.isArray(args[0]) ? args[0] : args;
        list = list
          .filter(function (x) {
            return isNumberLike(x);
          })
          .map(numValue);
        if (!list.length) return 0;
        return name === "max" ? Math.max.apply(null, list) : Math.min.apply(null, list);
      }
      case "abs": {
        const value = args[0];
        return wrapNumber(Math.abs(asNumber(value)), isFloat(value));
      }
      case "round": {
        const n = asNumber(args[0]);
        if (args.length < 2) return Math.round(n);
        const digits = Math.trunc(asNumber(args[1]));
        const factor = Math.pow(10, digits);
        return new PyFloat(Math.round(n * factor) / factor);
      }
      case "ord": {
        const text = args[0];
        if (typeof text !== "string" || text.length !== 1) {
          fail("ord() richiede un singolo carattere");
        }
        return text.charCodeAt(0);
      }
      case "chr": {
        const code = asNumber(args[0]);
        if (!Number.isInteger(code) || code < 0 || code > 0x10ffff) {
          fail("chr() richiede un codice Unicode valido");
        }
        return String.fromCodePoint(code);
      }
      case "input":
        fail("input() non è disponibile nel Lab: assegna un valore a una variabile e usa quello");
        break;
      default:
        fail("Funzione sconosciuta: '" + name + "'");
    }
  }

  /* ---------- funzioni definite dall'utente e metodi ---------- */

  function isUserFunction(value) {
    return !!value && typeof value === "object" && value.__fn === true;
  }

  function callUserFunction(fn, args) {
    if (args.length !== fn.params.length) {
      fail(
        fn.name + "() richiede " + fn.params.length + " argomenti, ne hai passati " + args.length
      );
    }
    if (callDepth >= MAX_CALL_DEPTH) {
      fail("Troppe chiamate annidate: controlla la ricorsione");
    }
    const scope = Object.create(fn.closure);
    fn.params.forEach(function (name, i) {
      scope[name] = args[i];
    });
    callDepth++;
    fn.tick();
    try {
      executeBlock(fn.lines, fn.bodyStart, fn.bodyEnd, scope, fn.print, fn.tick);
      return null;
    } catch (err) {
      if (err instanceof ReturnSignal) return err.value;
      throw err;
    } finally {
      callDepth--;
    }
  }

  function callMethod(target, name, args) {
    if (name === "append") {
      if (!Array.isArray(target)) fail("append() è disponibile solo sulle liste");
      if (args.length !== 1) fail("append() richiede un argomento");
      target.push(args[0]);
      return null;
    }
    if (typeof target === "string") {
      switch (name) {
        case "upper":
          return target.toUpperCase();
        case "lower":
          return target.toLowerCase();
        case "strip":
          return target.trim();
        case "isdigit":
          return target.length > 0 && /^[0-9]+$/.test(target);
        case "replace":
          if (args.length !== 2) fail("replace() richiede due argomenti");
          return target.split(formatValue(args[0])).join(formatValue(args[1]));
      }
    }
    fail("Metodo non supportato: '" + name + "()'");
  }

  function sliceValue(target, inner, env) {
    if (!Array.isArray(target) && typeof target !== "string") {
      fail("Lo slicing è supportato solo su stringhe e liste");
    }
    const parts = inner.split(":");
    if (parts.length > 3) fail("Slice non valido: " + inner);

    function read(raw) {
      const text = raw.trim();
      if (text === "") return null;
      const value = evalExpr(text, env);
      if (!isNumberLike(value)) fail("Indice di slice non valido: " + text);
      return Math.trunc(numValue(value));
    }

    const start = read(parts[0]);
    const stop = parts.length > 1 ? read(parts[1]) : null;
    const rawStep = parts.length > 2 ? read(parts[2]) : 1;
    const step = rawStep === null ? 1 : rawStep;
    if (step === 0) fail("Passo di slice non valido");

    const length = target.length;
    const lower = step > 0 ? 0 : -1;
    const upper = step > 0 ? length : length - 1;

    let from = start === null ? (step > 0 ? lower : upper) : start;
    if (from < 0) from += length;
    if (from < lower) from = lower;
    if (from > upper) from = upper;

    let to;
    if (stop === null) {
      to = step > 0 ? upper : lower;
    } else {
      to = stop;
      if (to < 0) to += length;
      if (to < lower) to = lower;
      if (to > upper) to = upper;
    }

    const out = [];
    if (step > 0) {
      for (let i = from; i < to; i += step) out.push(target[i]);
    } else {
      for (let i = from; i > to; i += step) out.push(target[i]);
    }
    return typeof target === "string" ? out.join("") : out;
  }

  function findTopLevelComparators(s) {
    const found = [];
    let depth = 0;
    let inSingle = false;
    let inDouble = false;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (c === "\\" && (inSingle || inDouble)) {
        i++;
        continue;
      }
      if (c === "'" && !inDouble) {
        inSingle = !inSingle;
        continue;
      }
      if (c === '"' && !inSingle) {
        inDouble = !inDouble;
        continue;
      }
      if (inSingle || inDouble) continue;
      if (c === "(" || c === "[") {
        depth++;
        continue;
      }
      if (c === ")" || c === "]") {
        depth--;
        continue;
      }
      if (depth !== 0) continue;
      if (c === "=" && s[i + 1] === "=") {
        found.push({ index: i, op: "==" });
        i++;
      } else if (c === "!" && s[i + 1] === "=") {
        found.push({ index: i, op: "!=" });
        i++;
      } else if (c === "<") {
        if (s[i + 1] === "=") {
          found.push({ index: i, op: "<=" });
          i++;
        } else {
          found.push({ index: i, op: "<" });
        }
      } else if (c === ">") {
        if (s[i + 1] === "=") {
          found.push({ index: i, op: ">=" });
          i++;
        } else {
          found.push({ index: i, op: ">" });
        }
      }
    }
    return found;
  }

  /* ---------- operatori ---------- */

  function asNumber(value) {
    if (isFloat(value) && isFinite(value.value)) return value.value;
    if (typeof value === "number" && isFinite(value)) return value;
    if (typeof value === "boolean") return value ? 1 : 0;
    fail("Operazione numerica non valida su: " + formatValue(value));
  }

  function applyPlus(left, right) {
    if (typeof left === "string" || typeof right === "string") {
      return formatValue(left) + formatValue(right);
    }
    if (Array.isArray(left) && Array.isArray(right)) return left.concat(right);
    return wrapNumber(asNumber(left) + asNumber(right), isFloat(left) || isFloat(right));
  }

  function applyMinus(left, right) {
    return wrapNumber(asNumber(left) - asNumber(right), isFloat(left) || isFloat(right));
  }

  function applyMulDiv(left, right, op) {
    if (op === "*") {
      if (typeof left === "string" && isNumberLike(right)) {
        const count = Math.trunc(asNumber(right));
        if (count > MAX_REPEAT) fail("Ripetizione stringa troppo grande");
        return left.repeat(Math.max(0, count));
      }
      return wrapNumber(asNumber(left) * asNumber(right), isFloat(left) || isFloat(right));
    }
    if (op === "/") {
      const divisor = asNumber(right);
      if (divisor === 0) fail("Divisione per zero");
      return new PyFloat(asNumber(left) / divisor);
    }
    if (op === "//") {
      const divisor = asNumber(right);
      if (divisor === 0) fail("Divisione per zero");
      return wrapNumber(Math.floor(asNumber(left) / divisor), isFloat(left) || isFloat(right));
    }
    if (op === "%") {
      const divisor = asNumber(right);
      if (divisor === 0) fail("Divisione per zero");
      return wrapNumber(asNumber(left) % divisor, isFloat(left) || isFloat(right));
    }
    fail("Operatore non supportato: " + op);
  }

  function applyPow(base, exponent) {
    const result = Math.pow(asNumber(base), asNumber(exponent));
    if (!isFinite(result)) fail("Risultato troppo grande");
    return wrapNumber(result, isFloat(base) || isFloat(exponent));
  }

  function compareValues(left, right, op) {
    if (isNumberLike(left) && isNumberLike(right)) {
      const a = numValue(left);
      const b = numValue(right);
      switch (op) {
        case "==": return a === b;
        case "!=": return a !== b;
        case ">": return a > b;
        case "<": return a < b;
        case ">=": return a >= b;
        case "<=": return a <= b;
      }
    }
    if (op === "==") return left === right;
    if (op === "!=") return left !== right;
    const a = formatValue(left);
    const b = formatValue(right);
    switch (op) {
      case ">": return a > b;
      case "<": return a < b;
      case ">=": return a >= b;
      case "<=": return a <= b;
    }
    return false;
  }

  function toBoolean(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === "boolean") return value;
    if (isNumberLike(value)) return numValue(value) !== 0;
    if (typeof value === "string") return value.length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }

  /* ---------- formattazione ---------- */

  function formatNumber(n) {
    if (Number.isNaN(n)) return "nan";
    if (n === Infinity) return "inf";
    if (n === -Infinity) return "-inf";
    if (Number.isInteger(n)) return String(n);
    return String(Number(n.toFixed(10)));
  }

  function formatFloat(n) {
    if (Number.isNaN(n)) return "nan";
    if (n === Infinity) return "inf";
    if (n === -Infinity) return "-inf";
    if (Number.isInteger(n)) return n.toFixed(1);
    return String(Number(n.toFixed(10)));
  }

  function formatValue(value) {
    if (value === null || value === undefined) return "None";
    if (value === true) return "True";
    if (value === false) return "False";
    if (Array.isArray(value)) {
      return "[" + value.map(formatValue).join(", ") + "]";
    }
    if (isFloat(value)) return formatFloat(value.value);
    if (typeof value === "number") return formatNumber(value);
    return String(value);
  }

  function unescapeString(value) {
    let out = "";
    for (let i = 0; i < value.length; i++) {
      const c = value[i];
      if (c !== "\\" || i === value.length - 1) {
        out += c;
        continue;
      }
      const next = value[++i];
      if (next === "n") out += "\n";
      else if (next === "t") out += "\t";
      else if (next === "r") out += "\r";
      else if (next === '"') out += '"';
      else if (next === "'") out += "'";
      else if (next === "\\") out += "\\";
      else out += "\\" + next;
    }
    return out;
  }

  /* ---------- parsing helper ---------- */

  function splitTopLevelArgs(raw) {
    if (raw.trim() === "") return [];
    const result = [];
    let start = 0;
    let depth = 0;
    let inSingle = false;
    let inDouble = false;
    for (let i = 0; i < raw.length; i++) {
      const c = raw[i];
      if (c === "\\" && (inSingle || inDouble)) {
        i++;
        continue;
      }
      if (c === "'" && !inDouble) inSingle = !inSingle;
      else if (c === '"' && !inSingle) inDouble = !inDouble;
      else if ((c === "(" || c === "[") && !inSingle && !inDouble) depth++;
      else if ((c === ")" || c === "]") && !inSingle && !inDouble) depth--;
      else if (c === "," && !inSingle && !inDouble && depth === 0) {
        result.push(raw.slice(start, i).trim());
        start = i + 1;
      }
    }
    result.push(raw.slice(start).trim());
    return result;
  }

  function matchingClose(s, openIdx) {
    let depth = 0;
    let inSingle = false;
    let inDouble = false;
    for (let i = openIdx; i < s.length; i++) {
      const c = s[i];
      if (c === "\\" && (inSingle || inDouble)) {
        i++;
        continue;
      }
      if (c === "'" && !inDouble) inSingle = !inSingle;
      else if (c === '"' && !inSingle) inDouble = !inDouble;
      else if (c === "(" && !inSingle && !inDouble) depth++;
      else if (c === ")" && !inSingle && !inDouble) {
        depth--;
        if (depth === 0) return i;
      }
    }
    return -1;
  }

  function findTopLevelKeyword(s, kw) {
    let depth = 0;
    let inSingle = false;
    let inDouble = false;
    for (let i = 0; i <= s.length - kw.length; i++) {
      const c = s[i];
      if (c === "'" && !inDouble) inSingle = !inSingle;
      else if (c === '"' && !inSingle) inDouble = !inDouble;
      else if ((c === "(" || c === "[") && !inSingle && !inDouble) depth++;
      else if ((c === ")" || c === "]") && !inSingle && !inDouble) depth--;
      if (!inSingle && !inDouble && depth === 0 && s.startsWith(kw, i)) return i;
    }
    return null;
  }

  function findTopLevelOperator(s, op) {
    let depth = 0;
    let inSingle = false;
    let inDouble = false;
    for (let i = 0; i <= s.length - op.length; i++) {
      const c = s[i];
      if (c === "'" && !inDouble) inSingle = !inSingle;
      else if (c === '"' && !inSingle) inDouble = !inDouble;
      else if ((c === "(" || c === "[") && !inSingle && !inDouble) depth++;
      else if ((c === ")" || c === "]") && !inSingle && !inDouble) depth--;
      if (!inSingle && !inDouble && depth === 0 && s.startsWith(op, i)) {
        if ((op === ">" || op === "<") && s[i + 1] === "=") continue;
        return i;
      }
    }
    return null;
  }

  function findLastTopLevelPlusMinus(s) {
    let depth = 0;
    let inSingle = false;
    let inDouble = false;
    for (let i = s.length - 1; i >= 1; i--) {
      const c = s[i];
      if (c === "'" && !inDouble) inSingle = !inSingle;
      else if (c === '"' && !inSingle) inDouble = !inDouble;
      else if ((c === ")" || c === "]") && !inSingle && !inDouble) depth++;
      else if ((c === "(" || c === "[") && !inSingle && !inDouble) depth--;
      else if ((c === "+" || c === "-") && !inSingle && !inDouble && depth === 0) {
        const prev = s.slice(0, i).trimEnd().slice(-1);
        if (prev && "+-*/%=<>[(".indexOf(prev) === -1) return { index: i, op: c };
      }
    }
    return null;
  }

  function findLastTopLevelMulDiv(s) {
    let depth = 0;
    let inSingle = false;
    let inDouble = false;
    for (let i = s.length - 1; i >= 1; i--) {
      const c = s[i];
      if (c === "'" && !inDouble) inSingle = !inSingle;
      else if (c === '"' && !inSingle) inDouble = !inDouble;
      else if ((c === ")" || c === "]") && !inSingle && !inDouble) depth++;
      else if ((c === "(" || c === "[") && !inSingle && !inDouble) depth--;
      else if (!inSingle && !inDouble && depth === 0) {
        if (c === "*") {
          if (s[i - 1] === "*" || s[i + 1] === "*") continue;
          return { index: i, op: "*" };
        }
        if (c === "/") {
          if (s[i - 1] === "/") return { index: i - 1, op: "//" };
          if (s[i + 1] === "/") continue;
          return { index: i, op: "/" };
        }
        if (c === "%") return { index: i, op: "%" };
      }
    }
    return null;
  }

  function findTopLevelPow(s) {
    let depth = 0;
    let inSingle = false;
    let inDouble = false;
    for (let i = 0; i < s.length - 1; i++) {
      const c = s[i];
      if (c === "'" && !inDouble) inSingle = !inSingle;
      else if (c === '"' && !inSingle) inDouble = !inDouble;
      else if ((c === "(" || c === "[") && !inSingle && !inDouble) depth++;
      else if ((c === ")" || c === "]") && !inSingle && !inDouble) depth--;
      if (!inSingle && !inDouble && depth === 0 && c === "*" && s[i + 1] === "*" && s[i - 1] !== "*") {
        return i;
      }
    }
    return null;
  }

  function hasTopLevel(s, token) {
    return topLevelIndexOf(s, token) >= 0;
  }

  function topLevelIndexOf(s, token) {
    let depth = 0;
    let inSingle = false;
    let inDouble = false;
    for (let i = 0; i <= s.length - token.length; i++) {
      const c = s[i];
      if (c === "'" && !inDouble) inSingle = !inSingle;
      else if (c === '"' && !inSingle) inDouble = !inDouble;
      else if ((c === "(" || c === "[") && !inSingle && !inDouble) depth++;
      else if ((c === ")" || c === "]") && !inSingle && !inDouble) depth--;
      if (!inSingle && !inDouble && depth === 0 && s.startsWith(token, i)) return i;
    }
    return -1;
  }

  App.python = { run: run, MAX_STEPS: MAX_STEPS };
})(window.App = window.App || {});
