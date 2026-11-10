/** Passo a passo de instalação no Android e no iPhone. */
export function ComoInstalar() {
  return (
    <div className="como-instalar">
      <h3>Android (Chrome)</h3>
      <ol>
        <li>Abra o app no Chrome.</li>
        <li>Toque no botão “Instalar app” que aparece no Início, ou no menu ⋮ → “Instalar app”.</li>
        <li>O ícone aparece na tela inicial e o app abre mesmo sem internet.</li>
      </ol>
      <h3>iPhone (Safari)</h3>
      <ol>
        <li>Abra o app no Safari.</li>
        <li>Toque em Compartilhar (o quadrado com a seta para cima).</li>
        <li>Escolha “Adicionar à Tela de Início” e confirme.</li>
      </ol>
      <p className="aviso aviso-alerta">
        No iPhone, os dados do app instalado ficam separados dos do Safari: instale primeiro e use sempre pelo ícone.
      </p>
    </div>
  );
}
