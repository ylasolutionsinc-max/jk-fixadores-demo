/* Lista de peças compartilhada entre a home e o orçamento (localStorage, com fallback em memória). */
(function(){
  var KEY='jk-lista-v1', mem=[];
  function ler(){try{var v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[]}catch(e){return mem.slice()}}
  function gravar(l){mem=l.slice();try{localStorage.setItem(KEY,JSON.stringify(l))}catch(e){}document.dispatchEvent(new CustomEvent('jk:lista',{detail:l}))}
  function adicionar(pid,vi,qtd){var l=ler(),k=pid+'|'+(vi||0),it=l.find(function(i){return i.k===k});if(it)it.qtd+=qtd||1;else l.push({k:k,pid:pid,vi:vi||0,qtd:qtd||1});gravar(l);return l}
  function definir(k,qtd){var l=ler().map(function(i){if(i.k===k)i.qtd=Math.max(0,qtd|0);return i}).filter(function(i){return i.qtd>0});gravar(l);return l}
  function trocarVar(k,vi){var l=ler(),it=l.find(function(i){return i.k===k});if(!it)return l;var nk=it.pid+'|'+vi,dup=l.find(function(i){return i.k===nk});if(dup&&dup!==it){dup.qtd+=it.qtd;l=l.filter(function(i){return i!==it})}else{it.vi=vi;it.k=nk}gravar(l);return l}
  function limpar(){gravar([])}
  function total(){return ler().reduce(function(s,i){return s+i.qtd},0)}
  window.JKLista={ler:ler,adicionar:adicionar,definir:definir,trocarVar:trocarVar,limpar:limpar,total:total};
})();
