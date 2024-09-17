const url_base = window.env.URL_BASE 

const token = localStorage.getItem('token') ? localStorage.getItem('token') : window.location.href = "../index.html";
const refresh = localStorage.getItem('refreshToken') ? localStorage.getItem('refreshToken') : window.location.href = "../index.html";

// Obter o objeto URLSearchParams da URL atual
var path = new URLSearchParams(window.location.search);
// Obter o valor do parâmetro 'id'
var id_rota_path = path.get('id');

//  console.log(id_rota_path)

//  // console.log(token)
//  console.log(localStorage.getItem('token'))
//  console.log(localStorage.getItem('refreshToken'))

function decodeToken(token) {
    const payload = token.split('.')[1]
    const decodeToken = atob(payload);
    return JSON.parse(decodeToken);
}

function VerificarToken(token, refresh) {

    const url = url_base + "cortex/api/token/verify/";

    // objetos com os dados que serão passados no corpo da requsição
    const data = {
        token: token
    };

    // configurando a solicitação
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    // Fazendo a solicitação POST para verificar o token
    fetch(url, options)
        .then(response => {
            // verificar resposta
            if (!response.ok) {
                throw new Error("Erro ao verificar o token: " + response.status);
            }
            // deu tudo certo e o user pode continuar nessa tela
//              console.log("O token foi aceito")
        })
        .catch(error => {
            // Lidar com erros
            console.error("Ocorreu um erro ao verificar o token: ", error.message);
            
            // Verificar se o erro é de token inválido (401)
            if (error.message.includes('401')) {
                // Consumir o endpoint do refresh token
                ConsumirRefreshToken(refresh);
            }
            
            window.location.href = "../index.html"
        })
}
VerificarToken(token, refresh)

const token_decodificado = decodeToken(token)
//  console.log("O token decodificado: ", token_decodificado)


let novoTokenDeAcesso;
let novoRefresh;

function ConsumirRefreshToken(refresh) {

    // endpoint do refresh token
    const url = url_base + "cortex/api/token/refresh/";

    // obejtos com dados para serem passados no corpo da requisição
    const data = {
        refresh: refresh
    };

    // configuração da solicitação
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }

    // fazendo a solicitação POST
    fetch(url, options)
        .then(response => {
            if (!response.ok) {
                throw new Error("Erro ao consumir o refresh token: " + response.status);
            }
            // convertendo a resposta para Json
            return response.json();
        })
        .then(data => {
            // verificar se o token de acesso foi recebido
            if (data.access){
                // Token de acesso recebido com sucesso
                novoTokenDeAcesso = data.access;
                novoRefresh = data.refresh

                // armazena o novo token criado no localstorage
                localStorage.setItem('token', novoTokenDeAcesso)

//                  console.log('Novo token de acesso: ', novoTokenDeAcesso)
//                  // console.log('Novo refresh: ', novoRefresh)

                // recarrega a tela
                window.location.reload()
            } 
            else {
                // refresh inválido
                throw new Error("Erro ao acessar o novo token")
            }
        })
        .catch(error => {
            // Lidar com erros
            console.error("Ocorreu um erro ao consumir o refresh token: ", error);

            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')

            // verificar se o erro é de token expirado
            if (error.message.includes('401') || error.message.includes('403')) {
                // redireciona o usuário para a tela de login novamente
                window.location.href = "../index.html"
            }
            else if (error.message.includes('400')) {
                window.location.href = "../index.html"
            }
        })
}

// verificando id do usuário
async function VerifyUserPermission(token_decodificado) {
    const id_user_tela = token_decodificado.user_id

    if (id_user_tela) {
        // significa que o tipo do usuário não permite ele acessar essa tela
        const resp = await verificarTipoUsuario(token_decodificado.user_id);
//  //          console.log("O tipo do usuário: ", resp.nome_tipo);

        if (resp.nome_tipo !== "admin" & resp.nome_tipo !== "serv.terceirizado") {
            window.location.href = "../index.html";
            
        } else {
//              console.log("Usuário certo")
        }
    }

//      console.log("Usuário da tela: ", id_user_tela)
}
VerifyUserPermission(token_decodificado)

// tickets reservados para essa rota
async function getTicketsRota(id_rota) {
//      console.log("Rota: ", id_rota)
    const url = url_base + `cortex/api/soticon/v1/tickets/?rota_valida=${id_rota}`;

    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${localStorage.getItem('token')}`
        }
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error("Erro ao puxar os tickets da rota" + erro.status);
        }
        const data = await response.json();
//  //          console.log(`Aqui estão os tickets da rota ${id_rota}: `, data.results);
        return data.results;

    } catch (error) {
        console.error("Erro durante a requisição dos tickets da rota: ", error.message);
        window.alert("Erro ao carregar rotas do dia!")
    }
}

// lista os tickets reservados da rota na página
async function listarTicketsNaPagina(id_rota) {

    const containerPai = document.querySelector('.cont_container3');
    containerPai.innerHTML = '';

    // Adicione o ícone de carregamento
    const loadingIcon = document.createElement('i');
    loadingIcon.classList.add('fas', 'fa-spinner', 'fa-spin', 'loading-icon');
    loadingIcon.style.fontSize = "6em";
    loadingIcon.style.color = 'white';
    containerPai.appendChild(loadingIcon);

    try {
        // o objeto dos tíckets
        const tickets = await getTicketsRota(id_rota);

        // Limpa o conteúdo existente
        containerPai.innerHTML = '';

        tickets.forEach(ticket => {
            // Cria os elementos HTML
            const container = document.createElement('div');
            container.classList.add('container3');
    
            const fotoCaixa = document.createElement('figure');
            fotoCaixa.classList.add('fotocaixa');
    
            const fotoAluno = document.createElement('img');
            fotoAluno.src = '#' // Substitua '#' pela URL da imagem do aluno
            fotoAluno.alt = 'Foto do aluno';
    
            const cont1 = document.createElement('div');
            cont1.classList.add('cont1');
    
            const nomeAluno = document.createElement('h3');
            nomeAluno.textContent = ticket.nome; // Supondo que o objeto ticket tenha uma propriedade 'aluno_nome'
    
            const posicao = document.createElement('p');
            posicao.textContent = `Posição ${ticket.posicao_fila}`; // Supondo que o objeto ticket tenha uma propriedade 'posicao'
    
            const cont2 = document.createElement('div');
            cont2.classList.add('cont2');
    
            const status = document.createElement('div');
            status.classList.add('status');
            status.textContent = ticket.usado & ticket.reservado ? "Usado" : "Pendente"; // Supondo que o objeto ticket tenha uma propriedade 'status'
            status.style.backgroundColor = ticket.usado & ticket.reservado ? "green" : "#394538";

            // Adiciona os elementos filhos aos elementos pais
            fotoCaixa.appendChild(fotoAluno);
            cont1.appendChild(nomeAluno);
            cont1.appendChild(posicao);
            cont2.appendChild(status);
            container.appendChild(fotoCaixa);
            container.appendChild(cont1);
            container.appendChild(cont2);
            containerPai.appendChild(container);
        });

    } catch {
        console.error("Erro ao listar tickets:", error);
        window.alert("Erro ao carregar tickets da rota")
    } finally {
        // Remove o ícone de carregamento, independentemente do resultado da requisição
        containerPai.removeChild(loadingIcon);
    }
}
listarTicketsNaPagina(id_rota_path)

// retorna varias infos do user, inclusive o tipo
async function verificarTipoUsuario(id) {
    const url = url_base + `cortex/api/gerusuarios/v1/users/${id}`;

    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${localStorage.getItem('token')}`
        }
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error("Erro ao puxar os usuários" + response.status);
        }
        const data = await response.json();
//  //          console.log("Aqui está o usuário: ", data);
        return data;

    } catch (error) {
        console.error("Erro durante a requisição dos usuários: ", error.message);
    }
}

// verifica a estrutura do token
function verifyTokenPattern(token) {
    // Verificar se o token está no formato correto '{{Token valor}}'
    return /^{{Token .+}}$/.test(token);
}

function redirecionarSeNecessario() {
    const token = localStorage.getItem('token');

    if (token) {
        if (verifyTokenPattern(token)) {
            // Remover token do localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken')
            // Redirecionar para a página de índice
            window.location.href = "./index.html";
        }
    }
}
// Chamada para verificar e redirecionar
redirecionarSeNecessario();

// cpf : "07925967307" 
// user_soticon : 1218

document.getElementById("formulario").addEventListener("submit", function(event) {
    // Impedir o comportamento padrão de envio do formulário
    event.preventDefault();

    // Obter o valor do campo idUsuario
    var cpf = document.getElementById("idUsuario").value;
    // Isso irá retornar o CPF sem pontos e barras
    const cpf_formatado = limparCPF(cpf)

    const botao = document.querySelector(".proximo")

    // Armazenar o conteúdo original do botão no atributo data-original-content
    if (!botao.hasAttribute('data-original-content')) {
        botao.setAttribute('data-original-content', botao.innerHTML);
    }

    botao.innerHTML = '';

    const loadingIcon = document.createElement('i');
    loadingIcon.classList.add('fas', 'fa-spinner', 'fa-spin', 'loading-icon');
    loadingIcon.style.fontSize = "2em";
    loadingIcon.style.color = 'white';
    botao.appendChild(loadingIcon);


    // Exemplo de uso da função associarCPFaoTicket
    associarCPFaoTicket(id_rota_path, cpf_formatado)
        .then((ticket) => {
            if (ticket) {
//  //                  console.log("Ticket associado encontrado:", ticket);

                // Se um ticket associado for encontrado, reservar o ticket
                verificaTicket(ticket.user_soticon, id_rota_path)

            } else {
                throw new Error("Nenhum ticket associado encontrado para o CPF fornecido.");
            }
        })
        .catch((error) => {
            console.error("Erro ao associar CPF ao ticket:", error);
            window.alert("Ticket não encontrado nas pendências!")
        })
        .finally(() => {
            document.getElementById("idUsuario").value = "";
            const botao = document.querySelector(".proximo");
            const originalContent = botao.getAttribute('data-original-content');
            botao.innerHTML = originalContent;
        })
})

var botao_finalizar_rota = document.querySelector(".finalizar")

botao_finalizar_rota.addEventListener("click", async function() {
    const url = url_base + `cortex/api/soticon/v1/finalizar_rota/${id_rota_path}`
    // const conteudo_botao = botao_finalizar_rota.textContent

    const data = {
        status : "executada",
        obs: "Rota finalizada"
    }

    const options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
    };

    // Armazenar o conteúdo original do botão no atributo data-original-content
    if (!botao_finalizar_rota.hasAttribute('data-original-content')) {
            botao_finalizar_rota.setAttribute('data-original-content', botao_finalizar_rota.innerHTML);
    }

    botao_finalizar_rota.innerHTML = "";

    const loadingIcon = document.createElement('i');
    loadingIcon.classList.add('fas', 'fa-spinner', 'fa-spin', 'loading-icon');
    loadingIcon.style.fontSize = "2em";
    loadingIcon.style.color = 'black';
    botao_finalizar_rota.appendChild(loadingIcon)

    try {
        const response = await fetch(url, options)
        if (!response.ok) {
            throw new Error(`Erro ao finalizar rota: ${response.status}`);
        }
        const data = await response.json()
        window.alert("Rota finalizada!");
        return data
    } catch (error) {
        console.error("Erro ao finalizar rota: ", error)
        window.alert("Erro ao finalizar rota!")
    } finally {
//          console.log("foi")
        const originalContent = botao_finalizar_rota.getAttribute('data-original-content');
        botao_finalizar_rota.innerHTML = originalContent;
    }
})

// Função para associar o CPF informado com o CPF de algum aluno que reservou o ticket
async function associarCPFaoTicket(id_rota_path, cpf) {
    try {
        // Obter os tickets associados à rota especificada
        const tickets = await getTicketsRota(id_rota_path);
        
        // Encontrar o primeiro ticket cujo CPF corresponda ao CPF fornecido
        const ticket_aluno_encontrado = tickets.find((ticket) => ticket.cpf === cpf);
        
        // Retornar o ticket encontrado
        return ticket_aluno_encontrado;
    } catch (error) {
        // Lidar com qualquer erro que ocorra durante o processo
        console.error("Erro ao associar CPF ao ticket:", error);
        throw error; // Rejeitar a Promise com o erro
        window.alert("Reserva não encontrada!")
    }
}

// função que verifica os tickets
async function verificaTicket(user_soticon, id_rota) {
//      console.log("Rota: ", id_rota, "user_soticon", user_soticon)

    const url = url_base + `cortex/api/soticon/v1/verificar_tickets/`;

    const dados = {
        user_soticon : user_soticon,
        rota : id_rota 
    }

    const options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${localStorage.getItem('token')}`
        },
        body : JSON.stringify(dados)
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`Erro ao verificar o ticket: ${response.status}`);
        }
        const data = await response.json();
//  //          console.log(`ticket da rota ${id_rota} e user_soticon ${user_soticon} verificado `, data);
        
        // Alerta exibido apenas se a solicitação for bem-sucedida
        window.alert("Ticket verificado com sucesso!");
    
        return data;
    
    } catch (error) {
        console.error("Erro: ", error);
    
        // Verifica a mensagem de erro para determinar o código de status
        if (error.message.includes("404") || error.message.includes("401")) {
            window.alert("O ticket já foi utilizado!");
        }
    } finally {
        // Recarrega a página (descomente se desejar)
        window.location.reload();
    }
}

// "xxxxxxxxxxx"
function limparCPF(cpf) {
    // Remove todos os caracteres que não são dígitos
    return cpf.replace(/\D/g, '');
}