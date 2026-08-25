/* qr.js — QR encoder mínimo, sem dependências.
   Byte mode, ECC nível M, versões 1–10 (até 213 bytes).
   Suficiente para as URLs de handoff do portal.
   Uso: QR.matrix("https://...") -> array 2D de 0/1. */
(function (global) {
  'use strict';

  /* ---- GF(256) ---- */
  var EXP = new Uint8Array(512), LOG = new Uint8Array(256);
  (function () {
    for (var i = 0, x = 1; i < 255; i++) {
      EXP[i] = x; LOG[x] = i;
      x <<= 1; if (x & 0x100) x ^= 0x11d;
    }
    for (var j = 255; j < 512; j++) EXP[j] = EXP[j - 255];
  })();

  function gmul(a, b) { return (a === 0 || b === 0) ? 0 : EXP[LOG[a] + LOG[b]]; }

  function rsGenerator(deg) {
    var poly = [1];
    for (var i = 0; i < deg; i++) {
      var next = new Array(poly.length + 1).fill(0);
      for (var j = 0; j < poly.length; j++) {
        next[j] ^= gmul(poly[j], 1);
        next[j + 1] ^= gmul(poly[j], EXP[i]);
      }
      poly = next;
    }
    return poly;
  }

  function rsEncode(data, ecLen) {
    var gen = rsGenerator(ecLen);
    var res = new Array(ecLen).fill(0);
    for (var i = 0; i < data.length; i++) {
      var factor = data[i] ^ res[0];
      res.shift(); res.push(0);
      for (var j = 0; j < ecLen; j++) res[j] ^= gmul(gen[j + 1], factor);
    }
    return res;
  }

  /* ---- tabelas por versão (ECC M) ---- */
  // [dataCodewords, ecPerBlock, [ [numBlocks, dataPerBlock], ... ]]
  var VER = {
    1:  [16,  10, [[1, 16]]],
    2:  [28,  16, [[1, 28]]],
    3:  [44,  26, [[1, 44]]],
    4:  [64,  18, [[2, 32]]],
    5:  [86,  24, [[2, 43]]],
    6:  [108, 16, [[4, 27]]],
    7:  [124, 18, [[4, 31]]],
    8:  [154, 22, [[2, 38], [2, 39]]],
    9:  [182, 22, [[3, 36], [2, 37]]],
    10: [216, 26, [[4, 43], [1, 44]]]
  };
  var CAP = { 1: 14, 2: 26, 3: 42, 4: 62, 5: 84, 6: 106, 7: 122, 8: 152, 9: 180, 10: 213 };
  var ALIGN = {
    1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30],
    6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50]
  };

  /* ---- bit buffer ---- */
  function Bits() { this.bits = []; }
  Bits.prototype.put = function (val, len) {
    for (var i = len - 1; i >= 0; i--) this.bits.push((val >>> i) & 1);
  };

  function utf8Bytes(str) {
    var out = [], enc = encodeURIComponent(str);
    for (var i = 0; i < enc.length; i++) {
      if (enc[i] === '%') { out.push(parseInt(enc.substr(i + 1, 2), 16)); i += 2; }
      else out.push(enc.charCodeAt(i));
    }
    return out;
  }

  function buildCodewords(text, ver) {
    var bytes = utf8Bytes(text);
    var info = VER[ver], totalData = info[0], ecLen = info[1], groups = info[2];
    var bb = new Bits();
    bb.put(4, 4);                                  // byte mode
    bb.put(bytes.length, ver >= 10 ? 16 : 8);      // char count
    for (var i = 0; i < bytes.length; i++) bb.put(bytes[i], 8);

    var capacity = totalData * 8;
    var term = Math.min(4, capacity - bb.bits.length);
    bb.put(0, term);
    while (bb.bits.length % 8 !== 0) bb.bits.push(0);

    var dataCw = [];
    for (var b = 0; b < bb.bits.length; b += 8) {
      var v = 0;
      for (var k = 0; k < 8; k++) v = (v << 1) | bb.bits[b + k];
      dataCw.push(v);
    }
    var pad = [0xEC, 0x11], p = 0;
    while (dataCw.length < totalData) dataCw.push(pad[p++ % 2]);

    // split em blocos
    var blocks = [], ecBlocks = [], off = 0;
    groups.forEach(function (g) {
      for (var n = 0; n < g[0]; n++) {
        var blk = dataCw.slice(off, off + g[1]);
        off += g[1];
        blocks.push(blk);
        ecBlocks.push(rsEncode(blk, ecLen));
      }
    });

    // interleave
    var out = [], maxData = Math.max.apply(null, blocks.map(function (b) { return b.length; }));
    for (var c = 0; c < maxData; c++)
      for (var bi = 0; bi < blocks.length; bi++)
        if (c < blocks[bi].length) out.push(blocks[bi][c]);
    for (var e = 0; e < ecLen; e++)
      for (var bj = 0; bj < ecBlocks.length; bj++) out.push(ecBlocks[bj][e]);

    return out;
  }

  /* ---- matriz ---- */
  function placeFunction(m, reserved, ver) {
    var size = m.length;

    function finder(r, c) {
      for (var dr = -1; dr <= 7; dr++)
        for (var dc = -1; dc <= 7; dc++) {
          var rr = r + dr, cc = c + dc;
          if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
          var inner = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
          var on = inner && (dr === 0 || dr === 6 || dc === 0 || dc === 6 ||
            (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4));
          m[rr][cc] = on ? 1 : 0;
          reserved[rr][cc] = 1;
        }
    }
    finder(0, 0); finder(0, size - 7); finder(size - 7, 0);

    // timing
    for (var i = 8; i < size - 8; i++) {
      var bit = (i % 2 === 0) ? 1 : 0;
      m[6][i] = bit; reserved[6][i] = 1;
      m[i][6] = bit; reserved[i][6] = 1;
    }

    // alignment — pula só os 3 cantos ocupados pelos finders.
    // (não dá pra testar "já reservado": da v7 em diante o alignment em (6,22)
    //  cruza o timing pattern e continua sendo obrigatório)
    var pos = ALIGN[ver], last = pos.length - 1;
    for (var a = 0; a < pos.length; a++)
      for (var b = 0; b < pos.length; b++) {
        if ((a === 0 && b === 0) || (a === 0 && b === last) || (a === last && b === 0)) continue;
        var cr = pos[a], cc2 = pos[b];
        for (var dr2 = -2; dr2 <= 2; dr2++)
          for (var dc2 = -2; dc2 <= 2; dc2++) {
            var on2 = Math.max(Math.abs(dr2), Math.abs(dc2)) !== 1;
            m[cr + dr2][cc2 + dc2] = on2 ? 1 : 0;
            reserved[cr + dr2][cc2 + dc2] = 1;
          }
      }

    // dark module
    m[size - 8][8] = 1; reserved[size - 8][8] = 1;

    // reserva format info
    for (var f = 0; f < 9; f++) {
      if (!reserved[8][f]) { reserved[8][f] = 1; m[8][f] = 0; }
      if (!reserved[f][8]) { reserved[f][8] = 1; m[f][8] = 0; }
    }
    for (var g = 0; g < 8; g++) {
      reserved[8][size - 1 - g] = 1; m[8][size - 1 - g] = 0;
      reserved[size - 1 - g][8] = 1; m[size - 1 - g][8] = 0;
    }

    // reserva version info (v >= 7)
    if (ver >= 7)
      for (var vi = 0; vi < 6; vi++)
        for (var vj = 0; vj < 3; vj++) {
          reserved[size - 11 + vj][vi] = 1; m[size - 11 + vj][vi] = 0;
          reserved[vi][size - 11 + vj] = 1; m[vi][size - 11 + vj] = 0;
        }
  }

  function placeData(m, reserved, cw) {
    var size = m.length, bitIdx = 0, total = cw.length * 8;
    var col = size - 1, upward = true;
    while (col > 0) {
      if (col === 6) col--;              // pula a coluna de timing
      for (var n = 0; n < size; n++) {
        var row = upward ? (size - 1 - n) : n;
        for (var s = 0; s < 2; s++) {
          var c = col - s;
          if (reserved[row][c]) continue;
          var bit = 0;
          if (bitIdx < total) bit = (cw[bitIdx >> 3] >>> (7 - (bitIdx & 7))) & 1;
          m[row][c] = bit;
          bitIdx++;
        }
      }
      upward = !upward;
      col -= 2;
    }
  }

  function maskFn(k, r, c) {
    switch (k) {
      case 0: return (r + c) % 2 === 0;
      case 1: return r % 2 === 0;
      case 2: return c % 3 === 0;
      case 3: return (r + c) % 3 === 0;
      case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
      case 5: return ((r * c) % 2) + ((r * c) % 3) === 0;
      case 6: return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
      case 7: return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
    }
  }

  function formatBits(mask) {
    var data = (0x00 << 3) | mask;        // 0b00 = ECC M
    var rem = data << 10;
    for (var i = 14; i >= 10; i--)
      if ((rem >>> i) & 1) rem ^= 0x537 << (i - 10);
    return ((data << 10) | rem) ^ 0x5412;
  }

  function versionBits(ver) {
    var rem = ver << 12;
    for (var i = 17; i >= 12; i--)
      if ((rem >>> i) & 1) rem ^= 0x1F25 << (i - 12);
    return (ver << 12) | rem;
  }

  function applyFormat(m, mask) {
    var size = m.length, fb = formatBits(mask);
    for (var i = 0; i < 15; i++) {
      var bit = (fb >>> i) & 1;
      // cópia 1 — coluna 8 descendo, depois linha 8 indo pra esquerda
      if (i < 6) m[i][8] = bit;
      else if (i === 6) m[7][8] = bit;
      else if (i === 7) m[8][8] = bit;
      else if (i === 8) m[8][7] = bit;
      else m[8][14 - i] = bit;
      // cópia 2 — linha 8 na borda direita, depois coluna 8 na borda inferior
      if (i < 8) m[8][size - 1 - i] = bit;
      else m[size - 15 + i][8] = bit;
    }
    m[size - 8][8] = 1;
  }

  function applyVersion(m, ver) {
    if (ver < 7) return;
    var size = m.length, vb = versionBits(ver);
    for (var i = 0; i < 18; i++) {
      var bit = (vb >>> i) & 1;
      var r = Math.floor(i / 3), c = i % 3;
      m[size - 11 + c][r] = bit;
      m[r][size - 11 + c] = bit;
    }
  }

  function penalty(m) {
    var size = m.length, score = 0, r, c, i, run, dark = 0;

    // regra 1 — runs de 5+
    for (r = 0; r < size; r++) {
      run = 1;
      for (c = 1; c < size; c++) {
        if (m[r][c] === m[r][c - 1]) { run++; }
        else { if (run >= 5) score += 3 + (run - 5); run = 1; }
      }
      if (run >= 5) score += 3 + (run - 5);
    }
    for (c = 0; c < size; c++) {
      run = 1;
      for (r = 1; r < size; r++) {
        if (m[r][c] === m[r - 1][c]) { run++; }
        else { if (run >= 5) score += 3 + (run - 5); run = 1; }
      }
      if (run >= 5) score += 3 + (run - 5);
    }

    // regra 2 — blocos 2x2
    for (r = 0; r < size - 1; r++)
      for (c = 0; c < size - 1; c++) {
        var v = m[r][c];
        if (v === m[r][c + 1] && v === m[r + 1][c] && v === m[r + 1][c + 1]) score += 3;
      }

    // regra 3 — padrão 1:1:3:1:1
    var pat1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
    var pat2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
    function match(get, len) {
      var hits = 0;
      for (var s = 0; s + 11 <= len; s++) {
        var ok1 = true, ok2 = true;
        for (var k = 0; k < 11; k++) {
          var val = get(s + k);
          if (val !== pat1[k]) ok1 = false;
          if (val !== pat2[k]) ok2 = false;
        }
        if (ok1) hits++;
        if (ok2) hits++;
      }
      return hits;
    }
    for (r = 0; r < size; r++)
      score += 40 * match(function (x) { return m[r][x]; }, size);
    for (c = 0; c < size; c++)
      score += 40 * match((function (cc) { return function (x) { return m[x][cc]; }; })(c), size);

    // regra 4 — proporção de módulos escuros
    for (r = 0; r < size; r++) for (c = 0; c < size; c++) if (m[r][c]) dark++;
    var pct = (dark * 100) / (size * size);
    score += 10 * Math.floor(Math.abs(pct - 50) / 5);

    return score;
  }

  function build(text) {
    var len = utf8Bytes(text).length, ver = 0;
    for (var v = 1; v <= 10; v++) if (CAP[v] >= len) { ver = v; break; }
    if (!ver) throw new Error('QR: conteúdo longo demais (' + len + ' bytes, máx 213)');

    var cw = buildCodewords(text, ver);
    var size = 17 + ver * 4;
    var best = null, bestScore = Infinity;

    for (var mask = 0; mask < 8; mask++) {
      var m = [], reserved = [];
      for (var i = 0; i < size; i++) {
        m.push(new Array(size).fill(0));
        reserved.push(new Array(size).fill(0));
      }
      placeFunction(m, reserved, ver);
      placeData(m, reserved, cw);
      for (var r = 0; r < size; r++)
        for (var c = 0; c < size; c++)
          if (!reserved[r][c] && maskFn(mask, r, c)) m[r][c] ^= 1;
      applyFormat(m, mask);
      applyVersion(m, ver);
      var sc = penalty(m);
      if (sc < bestScore) { bestScore = sc; best = m; }
    }
    return best;
  }

  /* ---- SVG ---- */
  function svg(text, opts) {
    opts = opts || {};
    var quiet = opts.quiet == null ? 4 : opts.quiet;
    var m = build(text), size = m.length, total = size + quiet * 2;
    var path = '';
    for (var r = 0; r < size; r++)
      for (var c = 0; c < size; c++)
        if (m[r][c]) path += 'M' + (c + quiet) + ' ' + (r + quiet) + 'h1v1h-1z';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + total + ' ' + total +
      '" shape-rendering="crispEdges" role="img" aria-label="' +
      (opts.label || 'QR code') + '">' +
      '<rect width="' + total + '" height="' + total + '" fill="' + (opts.light || '#ffffff') + '"/>' +
      '<path d="' + path + '" fill="' + (opts.dark || '#000000') + '"/></svg>';
  }

  global.QR = { matrix: build, svg: svg, _codewords: buildCodewords, _cap: CAP };
})(typeof window !== 'undefined' ? window : globalThis);
