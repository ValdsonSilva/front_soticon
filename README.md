Front-end da aplicação Soticon do IFPI campus Floriano

O Soticon atualmente utiliza as tecnologias básicas 
de front-end como, HTML, CSS e JavaScript.

As interfaces atualmente estão baseadas no design do sistema
prototipado pela ferramenta fígma, onde nós fizemos todo o panejamento
visual das telas.

## 1. Pasta .github/workflows
- Objetivo: Contém os arquivos de configuração do deploy no Firebase.
Arquivos: 
    firebase-hosting-merge.yml: Esse arquivo configura o processo de deploy no Firebase automaticamente após um merge ser feito em uma branch específica.
    firebase-hosting-pull-request.yml: Configura o deploy no Firebase em ambientes de preview para cada pull request.
    
## 2. Pasta front/public/images
- Objetivo: Armazena os recursos visuais do sistema, como logos, ícones e imagens de fundo.
-
Imagens:
    backgroundCortex.jpg: Imagem de fundo principal do sistema.
    logo.png, logoform.png, logoifpi.png, logoOnibus.png: Logos utilizadas em diferentes partes da aplicação.
    seta.png: Ícone de seta usado em navegações ou interfaces específicas.

## 3. Pasta front/public/pages
- Objetivo: Armazena as páginas HTML do sistema. Cada página corresponde a uma interface específica do sistema.

Páginas:
    AdminOptions.html: Página de painel administrativo para gerenciar funcionalidades do sistema.
    atualizaSenha.html: Tela para os usuários atualizarem sua senha atual.
    cadastrarRotas.html: Tela administrativa para cadastro de novas rotas de ônibus.
    direcao.html: Página de dashboard administrativo com gráficos e informações principais.
    guarita.html: Tela para listar as rotas que devem ser verificadas.
    motorista.html: Tela que mostra a quantidade de alunos cadastrados para uma rota em um determinado dia.
    recSenha.html: Tela para recuperação de senha; envia um token ao usuário para verificação antes de permitir a alteração da senha.
    reserva_ticket.html: Tela onde alunos podem reservar tickets para uma rota específica de ônibus.
    token.html: Página de apoio ao sistema de tokens (possivelmente utilizada em fluxo de autenticação ou recuperação de senha).
    verificacao.html: Página usada para a guarita verificar as pessoas com tickets reservados para uma rota específica.

## 4. Pasta front/public/scripts
- Objetivo: Contém os arquivos JavaScript que controlam a lógica de cada página.
Scripts:

    AdminOptions.js: javascript com as funções da pagina do usuário de tipo administrativo em que terá diversas acoes disponíveis. 
    cadastrarRotas.js: Lógica para a tela de cadastro de novas rotas de ônibus, incluindo interações de formulário.
    guarita.js: Gerencia a lógica da tela de guarita.
    motorista.js: Controla a exibição de informações sobre a quantidade de alunos para uma determinada rota.
    reserva.js: Implementa a funcionalidade de reserva de tickets pelos alunos.
    verificacao.js: Controla a lógica da tela de verificação, incluindo a exibição da lista de pessoas com tickets para uma rota específica.
    
## 5. Outros Arquivos
- styles/: Embora não descrito aqui, documente como o CSS é organizado (se segue alguma metodologia como BEM ou SMACSS) e como os desenvolvedores devem estilizá-lo.
- env.js: Detalhe as variáveis de ambiente configuradas aqui e como elas são usadas para conectar o sistema com diferentes APIs ou serviços.
- index.html e login.js: html da pagina inicial do sistema e arquivo js do
- .firebaserc e firebase.json: Inclua uma breve explicação sobre a configuração do Firebase, como o projeto está configurado e os serviços utilizados (Hosting, Firestore, etc.).
- .gitignore: arquivo de configuração utilizado no Git para especificar quais arquivos ou diretórios devem ser ignorados pelo sistema de controle de versão
