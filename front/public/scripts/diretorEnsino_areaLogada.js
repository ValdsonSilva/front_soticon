const url_base = window.env.URL_BASE 
var button_disable_state = false

// obter o token do localstorage senão retorna o usuário para tela de login
const token = localStorage.getItem('token') ? localStorage.getItem('token') : window.location.href = "../index.html";
const refresh = localStorage.getItem('refreshToken') ? localStorage.getItem('refreshToken') : window.location.href = "../index.html";

// decodificando o token
function decodeToken(token) {
    const payload = token.split('.')[1]
    const decodeToken = atob(payload);
    return JSON.parse(decodeToken);
}
const token_decodificado = decodeToken(token)


const setores_permission = [
    {
        setor : "admin"
    },
    {
        setor : "ti"
    },
    {
        setor : "direcao de ensino"
    },
    {
        setor : "direcao geral"
    },
    {
        setor : "direcao de administracao e planejamento"
    }
]

// verificando id do usuário
async function VerifyUserPermission(token_decodificado) {
    const id_user_tela = token_decodificado.user_id

    if (id_user_tela) {
        // significa que o tipo do usuário não permite ele acessar essa tela
        const resp = await verificarTipoUsuario(token_decodificado.user_id);
//  //          console.log("O tipo do usuário: ", resp.nome_tipo);

        if (resp.nome_tipo !== setores_permission[0].setor & 
            resp.nome_setores[0] !== setores_permission[1].setor & 
            resp.nome_setores[0] !== setores_permission[2].setor
        ) {
            window.location.href = "../index.html";
            
        } else {
//              console.log("Usuário certo")
        }
    }

//      console.log("Usuário da tela: ", id_user_tela)
}
VerifyUserPermission(token_decodificado)

//  console.log("O token decodificado: ", token_decodificado)

// verificando o token que chegou
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
            //console.error("Ocorreu um erro ao verificar o token: ", error.message);
            
            // Verificar se o erro é de token inválido (401)
            if (error.message.includes('401')) {
                // Consumir o endpoint do refresh token
                ConsumirRefreshToken(refresh);
            }
            
            window.location.href = "../index.html"
        })
}
// chamando a função
VerificarToken(token, refresh)

// veriável global
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
            //console.error("Ocorreu um erro ao consumir o refresh token: ", error);

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



//  console.log(data_rota.toUpperCase())
let rotasDoDia;

async function ListarRotas() {
    // url da requisição
    const url = url_base + `cortex/api/soticon/v1/rotas_automaticas/`;

    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${localStorage.getItem('token')}`
        }
    };

    try {
        const response = await fetch(url, options);
        // deu erro na busca das rotas do dia
        if (!response.ok) {
            throw new Error("Erro ao puxar as rotas do dia!");
        }
        const data = await response.json();

        rotasDoDia = data.results;
        return data.results;

    } catch (erro) {
        //console.error("Erro durante a requisição das rotas do dia: ", erro.message);
        window.location.reload()
    }
}

// Exibir ícone de carregamento
const iconContainer = document.querySelector(".icon-container");
const loadingIcon = document.createElement('i');
const frase = document.createElement('h1');
frase.innerHTML = "Carregando rotas..."

loadingIcon.classList.add('fas', 'fa-spinner', 'fa-spin', 'loading-icon');
iconContainer.appendChild(loadingIcon)
iconContainer.appendChild(frase)

var container = document.querySelector(".container");
// container.innerHTML = '';


// listando rotas na tela
async function montarElementosDaTela() {
    // armazenando rotas do dia
    const rotas = await ListarRotas()
    
    container.innerHTML = '';

    if (rotas.length === 0) {
        //console.log("Não há rotas")

        const mensagem = document.createElement("div");

        mensagem.textContent = "Não há rotas disponíveis no sistema!";

        mensagem.style.fontSize = "4vw"

        // Adicionando o elemento ao container
        iconContainer.appendChild(mensagem)
    } else {
            // Mapeando e adicionando os itens ao container
        for (const item of rotas) {

            var caixa = document.createElement('div');
            caixa.classList.add('caixa');
    
            // Nome do dia da semana
            var paragrafoDia = document.createElement('p');
            paragrafoDia.classList.add('dia');
            paragrafoDia.textContent = Dayweek(item.data);
    
            // Hora da rota
            var paragrafoHora = document.createElement('p');
            paragrafoHora.classList.add('hora');
            paragrafoHora.textContent = formatHorario(item.horario)
    
            var divBotaoContainer = document.createElement('div');
            divBotaoContainer.classList.add('botao_container');
    
            var botao = document.createElement('button');
            botao.setAttribute('type', 'submit');
            botao.setAttribute('id', 'bo' + item.id); // Adicionando um ID único para cada botão
            botao.style.marginBottom = "8px"
            botao.textContent = "Editar";
            botao.style.fontSize = "20px"
            botao.classList.add('botao');
            // adicionando ouvinte do evento de clique no botão
            botao.addEventListener("click", function() {
                window.location.href = `direcaoEnsino_cadastrarRotas.html?rota=${item.id}`;
            })

            var botao_delete = document.createElement('button');
            botao_delete.setAttribute('type', 'button');
            botao_delete.setAttribute('id', 'bo' + item.id); // Define o id
            botao_delete.classList.add('botao-sem-hover');
            
            // Adiciona o ícone de lixeira e o texto lado a lado
            botao_delete.innerHTML = `
                <span>Deletar</span>
                <i class="fas fa-trash"></i>
            `;
            
            // Estilo inline (opcional, para ajuste fino)
            botao_delete.style.backgroundColor = "red";
            botao_delete.style.display = "flex";
            botao_delete.style.alignItems = "center";
            botao_delete.style.justifyContent = "center";
            botao_delete.style.gap = "10px"; // Espaço entre texto e ícone
            botao_delete.style.padding = "10px";
            botao_delete.style.fontSize = "20px"
            
            // Adiciona evento de clique
            botao_delete.addEventListener('click', async function () {
                await deletar_rota(item.id);
            });
            
    
            
            // Adicionando elementos filhos à div .caixa
            caixa.appendChild(paragrafoDia);
            // caixa.appendChild(spanData);
            caixa.appendChild(paragrafoHora);
            caixa.appendChild(divBotaoContainer);
            divBotaoContainer.appendChild(botao);
            divBotaoContainer.appendChild(botao_delete)
            
            // Adicionando a div .caixa ao container principal
            container.appendChild(caixa);
        }
    }


    iconContainer.removeChild(loadingIcon);
    iconContainer.removeChild(frase)

    var mensagem = document.createElement("h1");
    mensagem.innerText = `Bem vindo, Diretor ${localStorage.getItem('nome')} :)`
    mensagem.style.color = "#fff"
    mensagem.style.textAlign = "center"
    mensagem.style.fontSize = "2em"


    var botao = document.createElement('button');
    botao.setAttribute('type', 'button');
    botao.textContent = "Criar Rota";
    botao.style.fontSize = "20px"
    botao.classList.add('botao', 'botao_criar_rota');

    var linkCriarRota = document.createElement('a');
    linkCriarRota.href = "../pages/direcaoEnsino_cadastrarRotas.html";
    linkCriarRota.appendChild(botao);

    // botao de rotas automáticas
    var botao_ativar_rota = document.createElement('button');
    botao_ativar_rota.setAttribute('type', 'button');
    botao_ativar_rota.style.fontSize = "20px"
    botao_ativar_rota.textContent = "Ativar rotas";
    botao_ativar_rota.style.backgroundColor = "#3894ef"
    botao_ativar_rota.classList.add('botao', 'botao-sem-hover');
    botao_ativar_rota.addEventListener("click", async function() {
        await ativar_rotas()
    })


    iconContainer.appendChild(mensagem)
    iconContainer.appendChild(linkCriarRota)
    iconContainer.appendChild(botao_ativar_rota)
}

// Chamando a função para montar os elementos da tela
montarElementosDaTela().catch(error => {
    //console.error("Erro ao carregar os elementos da tela: ", error)
})


async function deletar_rota(id) {
    const url = url_base + `cortex/api/soticon/v1/rotas_automaticas/${id}/`;

    const options = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${localStorage.getItem('token')}`
        }
    };

    if (confirm('Tem certeza que quer deletar a rota?')) {
        try {
            const response = await fetch(url, options);
            // deu erro na busca das rotas do dia
            if (!response.ok) {
                throw new Error("Erro ao apagar a rota");
            }
            const data = await response.json();
    
            return data.results;
    
        } catch (erro) {
            //console.error("Erro durante a requisição das rotas do dia: ", erro.message);
            // alert("Erro ao apagar a rota")
        } finally {
            window.location.reload()
        }
    }
}

async function ativar_rotas() {
    const url = url_base + "cortex/api/soticon/v1/criar_rotas_automaticas/";

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${localStorage.getItem('token')}`
        }
    };

    try {
        const response = await fetch(url, options)

        if (!response.ok) {
            throw new Error(response.status)
        }

        const data = await response.json()
        window.alert("Rotas ativadas com sucesso!")
        return data.message
        
    } catch (error) {
        window.alert("Erro ao ativar as rotas")
    }
}


// função para pegar a data do dia no formato 'yyyy-mm-dd'
function DayData() {
    const minhadata = new Date();
    const dia = minhadata.getDate();
   
    const mes = minhadata.getMonth() + 1;
    const ano = new Date().getUTCFullYear();

    const diaStr = dia < 10 ? `0${dia}` : `${dia}`;
    const mesStr = mes < 10 ? `0${mes}` : `${mes}`;

    return `${ano}-${mes}-${dia}`;
}

// Função para mostrar o dia da semana
function Dayweek(data) {
    const diasSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    const dia = new Date(data).getDay();
    return diasSemana[dia + 1];
}

// data formatado "dd/mm/yyyy"
function formatDate(dateString) {
    const parts = dateString.split('-');
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    return `${day}/${month}/${year}`;
}

// horário da rota formatado
function formatHorario(horarioString) {
    // Divida a string do horário usando ':' como delimitador
    const parts = horarioString.split(":");

    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    return `Ônibus das ${formattedHours}:${formattedMinutes}h`;
}


// logout no front
const logout_elemenst = document.querySelectorAll(".retornar")
logout_elemenst.forEach(function(element) {
    element.addEventListener("click", function(){
        for (var i = 0; i < logout_elemenst.length; i++){
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            window.location.href = "../index.html"
        }   
    })
})


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

        localStorage.setItem('nome', data.nome)
        return data;

    } catch (error) {
        //console.error("Erro durante a requisição dos usuários: ", error.message);
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
