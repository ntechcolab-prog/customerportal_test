/* NetzschQuotes — persistência leve das cotações solicitadas (localStorage).
 * Fonte única pro protótipo: checkout-quote grava, quotes lista e quote-detail lê/atualiza.
 * Mantém a mesma filosofia do machine-lines.js (store simples, sem framework). */
(function () {
  var KEY = 'netzsch_quotes';

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch (e) { return []; }
  }
  function write(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
  }

  window.NetzschQuotes = {
    /** Todas as cotações salvas (mais recentes primeiro). */
    all: function () { return read(); },

    /** Busca uma cotação pelo número/id. */
    get: function (id) {
      id = String(id);
      var list = read();
      for (var i = 0; i < list.length; i++) {
        if (String(list[i].id) === id) return list[i];
      }
      return null;
    },

    /** Adiciona uma cotação no topo da lista. */
    add: function (quote) {
      var list = read();
      list.unshift(quote);
      write(list);
      return quote;
    },

    /** Atualiza o status de uma cotação salva ('pending' | 'progress' | 'placed' | 'expired'). */
    setStatus: function (id, status) {
      id = String(id);
      var list = read();
      for (var i = 0; i < list.length; i++) {
        if (String(list[i].id) === id) { list[i].status = status; break; }
      }
      write(list);
    }
  };
})();
