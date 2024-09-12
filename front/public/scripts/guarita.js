const url_base = window.env.URL_BASE


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

//  console.log("O token decodificado: ", token_decodificado)

// verificando o token que chegou
function VerificarToken(token, refresh) {

    const url = url_base + "api/token/verify/";

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
// chamando a função
VerificarToken(token, refresh)

// veriável global
let novoTokenDeAcesso;
let novoRefresh;

function ConsumirRefreshToken(refresh) {

    // endpoint do refresh token
    const url = url_base + "api/token/refresh/";

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
    const url = url_base + `api/gerusuarios/v1/users/${id}`;

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

// retorna a data no formato "yyyy-mm-dd"
function DayData() {
    const minhadata = new Date();
    const dia = minhadata.getDate() + 1;
    const mes = minhadata.getMonth() + 1;
    const ano = minhadata.getFullYear();

    const diaStr = dia < 10 ? `0${dia}` : `${dia}`;
    const mesStr = mes < 10 ? `0${mes}` : `${mes}`;

    // return `${ano}-${mesStr}-${diaStr}`;
    return `${diaStr}-${mesStr}-${ano}`;
}

function listarRotasDoDia() {
    const url = url_base + `api/soticon/v1/rotas/?data_valida=${DayData()}&status=${'espera'}`;


    const loader = document.getElementById('loader');
    loader.style.display = 'block'; // Exibir o loader enquanto busca as rotas

    const options = {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${localStorage.getItem('token')}`
        }
    }

    fetch(url, options)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Erro ao carregar rotas do dia: " + response.status);
            }
            return response.json()
        })
        .then((data) => {
//              console.log("Rotas do dia: ", data.results)
            const rotas = data.results
            // função que lista as rotas para verificação
            exibirRotas(rotas)
            return data.results

        })
        .catch ((error) => {
            console.error("Erro ao puxar as rotas do dia!")
        })
        .finally(() => {
            loader.style.display = "none"
        })
}

// lista as rotas na tela
async function exibirRotas(rotas) {
    const container = document.querySelector('.container');

    // Limpar qualquer conteúdo existente no container
    container.innerHTML = '';

    await rotas.forEach(rota => {
        const caixa = document.createElement('div');
        caixa.classList.add('caixa');

        const dia = document.createElement('p');
        dia.classList.add('dia');
        dia.textContent = Dayweek(rota.data);

        const data = document.createElement('p');
        data.classList.add('data');
        data.textContent = formatDate(rota.data);

        const horario = document.createElement('p');
        horario.classList.add('horario');
        horario.textContent = `Ônibus das ${rota.horario}h`;

        const containerButton = document.createElement('div');
        containerButton.classList.add('botao');

        const btnMonitorar = document.createElement('button');
        // btnMonitorar.classList.add(rota.status === "espera" ? 'bo' + rota.id : 'bo_disable')
        btnMonitorar.classList.add('bo' + rota.id)
        // btnMonitorar.classList.add('bo_disable');
        btnMonitorar.textContent = 'Monitorar';

        // Adicionando um evento de clique aos botões de "Monitorar"
        btnMonitorar.addEventListener("click", function(event) {
//              console.log("Clicou")
            const id = event.target.classList[0].split('bo')[1];

            if (id !== '_disable') {
                avancarTela(id);
            }
        })

        containerButton.appendChild(btnMonitorar); // Adicionando o botão ao elemento containerButton

        caixa.appendChild(dia);
        caixa.appendChild(data);
        caixa.appendChild(horario);
        caixa.appendChild(containerButton); // Adicionando o containerButton à caixa

        container.appendChild(caixa);
    });
}
listarRotasDoDia();

// data formatado "dd/mm/yyyy"
function formatDate(dateString) {
    const parts = dateString.split('-');
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    return `${day}/${month}/${year}`;
}

//Função para mostrar o dia da semana
function Dayweek(data) {
    const diasSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    const dia = new Date(data).getDay();
    return diasSemana[dia + 1];
}

// avança o usuário para verificar aquela rota específica
function avancarTela(id) {
    const url = `../pages/verificacao.html?id=${id}`
    window.location.href = url
}