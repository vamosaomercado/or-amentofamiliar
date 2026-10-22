# Orçamento da família

Orçamento da casa para usar em família, cada um no seu celular: o que entra, o que sai, de quem é cada
gasto, objetivos com meta e prazo, e uma agenda de pagamentos que avisa pelo Google Agenda.

Cada família é uma **casa**. Quem cria a casa recebe um **código** (ex.: `BRLA-WV86`) e manda para os
outros. Quem entra com o código vê e lança tudo — **todos têm os mesmos poderes**: lançar, editar,
apagar, convidar, trocar o código, tirar alguém e mudar o nome da casa.

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `index.html` | O aplicativo inteiro. **No começo do script fica o que você precisa preencher.** |
| `instalar.html` | Página de instalação — é o link para divulgar e o que vai no convite |
| `manifest.webmanifest` | Instalação como aplicativo (nome, cores, ícones) |
| `sw.js` | Funcionamento sem internet |
| `icones/` | Ícones do app (192, 512, maskable, iPhone e favicon) |
| `firestore.rules` | Regras de segurança do banco — cole no Firebase |
| `firebase.json` | Só para quem publica as regras pela linha de comando |
| `.nojekyll` | Evita o GitHub Pages processar os arquivos |

Sem o Firebase preenchido, o app funciona só no aparelho, sem contas nem casa.

---

## 1. Firebase

1. Entre em <https://console.firebase.google.com> → **Criar projeto** (o Google Analytics pode ficar desligado).
2. Na página do projeto, clique no ícone **`</>`** (Web), dê um apelido e **não** marque o Firebase Hosting.
3. Copie os valores do `firebaseConfig` e cole no bloco `FIREBASE_CONFIG`, no começo do `index.html`,
   no lugar dos `COLE_AQUI`.

### Login

Em **Authentication → Começar → Método de login**, ative:

- **E-mail/senha**
- **Google** (escolha um e-mail de suporte)

Em **Authentication → Configurações → Domínios autorizados**, clique em **Adicionar domínio** e coloque
`seuusuario.github.io`. Sem isso, o login com Google dá erro de domínio não autorizado.

> Quem cria conta com e-mail e senha só entra depois de abrir o link de confirmação que o Firebase manda.

### Banco de dados

1. **Firestore Database → Criar banco de dados** → modo de **produção** → região `southamerica-east1`.
2. Na aba **Regras**, apague tudo, cole o conteúdo do arquivo `firestore.rules` e clique em **Publicar**.

As chaves do `firebaseConfig` podem ficar públicas no GitHub: quem protege os dados são as regras.
Com elas, só quem está na casa lê e grava os lançamentos dela, e só entra na casa quem mostra um código
válido daquela casa.

O plano gratuito (Spark) dá e sobra para uma família.

---

## 2. GitHub Pages

1. Crie um repositório (ex.: `orcamento-familia`).
2. Envie **todos** os arquivos desta pasta, mantendo a pasta `icones` e o arquivo `.nojekyll`.
3. **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**.

Em um ou dois minutos o app estará em `https://seuusuario.github.io/orcamento-familia/`.

Para divulgar, mande a **página de instalação**: `https://seuusuario.github.io/orcamento-familia/instalar.html`.
Ela reconhece o aparelho (Android, iPhone ou computador) e mostra o passo a passo certo, tem o botão
**Instalar** quando o navegador permite, avisa quando a pessoa abriu dentro do WhatsApp ou do Instagram
(de lá não dá para instalar) e traz um QR code para passar de um celular para outro.

### Ao publicar uma atualização

Troque o número da versão na primeira linha de `sw.js` (`orcamento-v1` → `orcamento-v2`). Sem isso, os
celulares que já instalaram continuam abrindo a versão guardada.

---

## 3. Como a família entra

1. A primeira pessoa abre o app, entra na conta (Google ou e-mail) e toca em **Criar casa**.
   O que ela já tinha lançado no aparelho vai junto para a casa.
2. Em **Ajustes (engrenagem) → Casa e conta**, toca em **Enviar convite**. Vai uma mensagem com o código
   e o link da página de instalação. Quem abre o link instala o app e, ao entrar na conta, já encontra o
   código preenchido (no iPhone, se não vier preenchido, é só digitar o código que aparece na página).
3. Quem recebeu entra na própria conta e toca em **Entrar na casa**.

Em **Casa e conta** qualquer pessoa da casa pode:

- **Gerar outro código** — o antigo para de funcionar; quem já está na casa continua.
- **Tirar alguém** da casa (o × ao lado do nome).
- **Trocar o nome** da casa.
- **Sair da casa**. Se for a última pessoa, a casa é apagada da nuvem.

> "Pessoas da família" (Casa, Ana, Bruno…) e "pessoas da casa" são coisas diferentes: as primeiras são
> os donos dos lançamentos no orçamento; as segundas são as contas que podem abrir o app. Uma criança
> pode ter seus gastos acompanhados sem ter conta, por exemplo.

---

## 4. Agenda do Google (opcional — os avisos no celular)

Cada pagamento com vencimento vira um compromisso na agenda **Orçamento da família**, no Google Agenda de
quem conectar. Cada pessoa da casa conecta a **própria** conta Google e recebe os próprios avisos.

1. <https://console.cloud.google.com> → crie um projeto (pode ser o mesmo do Firebase).
2. **APIs e serviços → Biblioteca** → **Google Calendar API** → **Ativar**.
3. **Tela de consentimento OAuth** → tipo **Externo** → em **Usuários de teste**, adicione o e-mail de
   cada pessoa da casa que vai conectar.
4. **Credenciais → Criar credenciais → ID do cliente OAuth** → **Aplicativo da Web** → em
   **Origens JavaScript autorizadas**, coloque `https://seuusuario.github.io`.
5. Copie o **ID do cliente** e cole em `GOOGLE_CLIENT_ID`, no começo do `index.html`
   (ou em **Ajustes → Agenda do Google**, no próprio app).
6. No app: **Ajustes → Agenda do Google → Conectar**. Na tela "app não verificado", toque em
   **Avançado → Acessar**: é o seu próprio app.

O app pede só o acesso `calendar.app.created`: ele enxerga apenas a agenda que ele mesmo cria, nunca as
outras agendas da pessoa.

---

## Como os dados ficam no Firestore

```
casas/{casa}             nome, código, membros, configuração (pessoas, grupos, cartões, objetivos, contas fixas)
casas/{casa}/meses/{mês} os lançamentos de cada mês (entradas, saídas, reservas)
codigos/{CÓDIGO}         { casa } — liga o código de convite à casa
usuarios/{uid}           { casa, gcal } — em que casa a pessoa está e a agenda do Google dela
```

Cada mês é um documento separado: duas pessoas mexendo em meses diferentes nunca se atrapalham.
Se as duas editarem o mesmo mês ao mesmo tempo, vale a última gravação.
