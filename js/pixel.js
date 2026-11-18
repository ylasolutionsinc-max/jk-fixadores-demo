/* Pixel do Meta da JK (conjunto de dados WEB). PageView na carga; Lead no envio do orçamento.
   Só roda no domínio real: em file:// e no link de demonstração (github.io) vira no-op, para não sujar os dados da JK. */
(function(){
  var real=location.protocol.indexOf('http')===0&&!/github\.io$/.test(location.hostname);
  if(!real){window.fbq=function(){};return;}
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init','1539308843364296');fbq('track','PageView');
})();
