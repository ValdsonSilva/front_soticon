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

        if (resp.nome_tipo !== "admin" & resp.nome_tipo !== "aluno") {
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

// endpoint user_soticon
async function GetUserSoticon(user_id) {
    const url = url_base + `cortex/api/soticon/v1/users/?usuario=${user_id}`

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
            throw new Error("Erro ao pegar user_soticon" + response.status);
        }
        const data = await response.json();
         //console.log("Aqui está o user_soticon: ", data);
        return data

    } catch (error) {
        //console.error("Erro durante a requisição do user_soticon: ", error.message);
    }
}

// função responsável por manter o estilo do botão de reserva
async function atualizarBotoesReservaVerify(id_rota, botao) {
//      console.log("Entro na função!")
    try {
        // Verificar se há tickets reservados associados à rota do botão
        const resp = await GetUserSoticon(token_decodificado.user_id);
//          console.log("A droga do resp: ", resp)
        // id rota e user_soticon
        if (resp && resp.tickets_reservados && resp.tickets_reservados.length > 0) {
            const ticketReservado = resp.tickets_reservados.find(ticket => {
                // return ticket.rota && ticket.rota[0].id === id_rota;
                return ticket.rota && ticket.rota.some(rota => rota.id === id_rota && rota.status === 'espera');

            });
            // Definir o conteúdo do botão com base na presença de tickets reservados
            botao.textContent = ticketReservado ? "-" : "+";
//              console.log("Rota estado botão: ", ticketReservado)
        } else {
            botao.textContent = "+"
        }
    } catch (error) {
        //console.error('Erro na atualização dos botões de reserva:', error);
    }
}
/*-------------------------------------------------------------------------------- */

async function atualizarPosicaoFIla(id_rota, posicao) {
    try {
        // Verificar se há tickets reservados associados à rota do botão
        const resp = await GetUserSoticon(token_decodificado.user_id);
//          console.log("A droga do resp: ", resp)
        if (resp && resp.tickets_reservados && resp.tickets_reservados.length > 0) {
            const ticketReservado = resp.tickets_reservados.find(ticket => {
                // return ticket.rota && ticket.rota[0].id === id_rota;
                return ticket.rota && ticket.rota.some(rota => rota.id === id_rota && rota.status === 'espera');
            });
            // Definir o conteúdo do botão com base na presença de tickets reservados
            posicao.textContent = ticketReservado ? `Posição ${resp.tickets_reservados[0].num_ticket}/58` : "";
//              console.log("Passou na condição: ", ticketReservado)
        } else {
            posicao.textContent = ""
        }
    } catch (error) {
        //console.error('Erro na atualização dos botões de reserva:', error);
    }
}

let data_rota = DayData();
//  console.log(data_rota.toUpperCase())
let rotasDoDia;

async function ListarRotasDoDIa() {
    // url da requisição
    const url = url_base + `cortex/api/soticon/v1/rotas/?data_valida=${data_rota}`;

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
//  //          console.log("Rotas do dia: ", data.results);
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
frase.innerHTML = "Carregando tickets..."

loadingIcon.classList.add('fas', 'fa-spinner', 'fa-spin', 'loading-icon');
iconContainer.appendChild(loadingIcon)
iconContainer.appendChild(frase)

var container = document.querySelector(".container");
// container.innerHTML = '';


// listando rotas na tela
async function montarElementosDaTela() {
    // armazenando rotas do dia
    const rotas = await ListarRotasDoDIa()
    
    container.innerHTML = '';


    // Mapeando e adicionando os itens ao container
    for (const item of rotas) {

        var caixa = document.createElement('div');
        caixa.classList.add('caixa');

        // Nome do dia da semana
        var paragrafoDia = document.createElement('p');
        paragrafoDia.classList.add('dia');
        paragrafoDia.textContent = Dayweek(item.data);

        // Data no formato "dd/mm/yyyy"
        var spanData = document.createElement('span');
        spanData.classList.add('data');
        spanData.textContent = formatDate(item.data)

        // Hora da rota
        var paragrafoHora = document.createElement('p');
        paragrafoHora.classList.add('hora');
        paragrafoHora.textContent = formatHorario(item.horario)

        var divBotaoContainer = document.createElement('div');
        divBotaoContainer.classList.add('botao_container');

        var botao = document.createElement('button');
        botao.setAttribute('type', 'submit');
        botao.setAttribute('id', 'bo' + item.id); // Adicionando um ID único para cada botão
        // Chamando a função para atualizar o texto do botão
        await atualizarBotoesReservaVerify(item.id, botao);

        let user_soticon;

        // adicionando ouvinte do evento de clique no botão
        botao.addEventListener("click", function() {
            // passando o user_soticon
            GetUserSoticon(token_decodificado.user_id).then(resp => {
                user_soticon = resp.id
                // Aqui você pode usar o valor de user_soticon
//  //                  console.log("O id user_soticon: ", user_soticon);
                // chamando função de reservar ticket(id_rota, id_user_soticon)
                reservarTicket(item.id, user_soticon)
            });
        })

        var paragrafoPosicao = document.createElement('p');
        paragrafoPosicao.textContent = item.posicao;
        paragrafoPosicao.classList.add('Posicao');
        // paragrafoPosicao.textContent = "Posição 11/58"
        await atualizarPosicaoFIla(item.id, paragrafoPosicao)

        
        // Adicionando elementos filhos à div .caixa
        caixa.appendChild(paragrafoDia);
        caixa.appendChild(spanData);
        caixa.appendChild(paragrafoHora);
        caixa.appendChild(divBotaoContainer);
        divBotaoContainer.appendChild(botao);
        divBotaoContainer.appendChild(paragrafoPosicao);
        
        // Adicionando a div .caixa ao container principal
        container.appendChild(caixa);
    }

    iconContainer.removeChild(loadingIcon);
    iconContainer.removeChild(frase)

    // OBS: lembrar de se basear por o estado do tícket
    function reservarTicket(id_rota, id_user_soticon) {
//  //          console.log("Ticket reservado para a rota de id: ", id_rota);

        const Botao = document.getElementById("bo" + id_rota);
        const bo_conteudo = Botao.textContent
        if (!Botao) {
            //console.error("Botão não encontrado para o índice:", id_rota);
            return;
        }
        
        const Posicao = Botao.nextElementSibling;
        if (!Posicao) {
            //console.error("Próximo elemento irmão não encontrado para o botão:", Botao);
            return;
        }

        // Criar o elemento do ícone de carregamento
        const loadingIcon = document.createElement('i');
        loadingIcon.setAttribute('id', 'loading-icon');
        loadingIcon.classList.add('fas', 'fa-sync-alt', 'fa-spin');
        loadingIcon.style.display = 'none';

        // Adicionar o ícone de carregamento ao botão
        Botao.innerHTML = '';
        Botao.appendChild(loadingIcon);

        // Mostrar o ícone de carregamento
        loadingIcon.style.display = 'inline-block';

        async function reservarOuCancelarTicket(rota, user_soticon){
            try {
                const url = url_base + 'cortex/api/soticon/v1/reservar_ticket/';

                const datas = {
                    rota : rota,
                    user_soticon : user_soticon
                }

                const options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(datas)
                }
                
                const response = await fetch(url, options);
    
                if (!response.ok) {
                    throw new Error('Erro ao processar a solicitação do ticket');
                }
    
                const data = await response.json();

//  //                  console.log('Reserva de ticket processada com sucesso:', data);

                // Ocultar ícone de carregamento após a requisição
                loadingIcon.style.display = "none";

                if (data) {
                    if (bo_conteudo === "+") {
                        Botao.textContent = "-";
                    } else if (bo_conteudo === "-") {
                        Botao.textContent = "+";
                    }
                    const posicao_fila_objeto = data.posicao_fila
                    Posicao.textContent =  (posicao_fila_objeto !== undefined) ? `Posição ${posicao_fila_objeto}/58` : ""
                }

    
            } catch (error) {
                //.error('Erro ao reservar/cancelar ticket:', error.message);
                Botao.textContent = "+"
            } finally {
                // ocultar o ícone de carregamento
                loadingIcon.style.display = 'none';
            }
        };

        // Chamando a função interna com os parâmetros corretos
        reservarOuCancelarTicket(id_rota, id_user_soticon);
    }

    if (rotas.length === 0) {
        //console.log("Não há rotas")

        const mensagem = document.createElement("div");

        mensagem.textContent = "Não há rotas disponíveis no sistema!";

        mensagem.style.fontSize = "4vw"

        // Adicionando o elemento ao container
        iconContainer.appendChild(mensagem)
    }
}

// Chamando a função para montar os elementos da tela
montarElementosDaTela().catch(error => {
    //console.error("Erro ao carregar os elementos da tela: ", error)
})

async function criarElementoRota() {
    var caixa = document.createElement('div');
    caixa.classList.add('caixa');

    // Nome do dia da semana
    var paragrafoDia = document.createElement('p');
    paragrafoDia.classList.add('dia');
    paragrafoDia.textContent = Dayweek(item.data);

    // Data no formato "dd/mm/yyyy"
    var spanData = document.createElement('span');
    spanData.classList.add('data');
    spanData.textContent = formatDate(item.data);

    // Hora da rota
    var paragrafoHora = document.createElement('p');
    paragrafoHora.classList.add('hora');
    paragrafoHora.textContent = formatHorario(item.horario);

    var divBotaoContainer = document.createElement('div');
    divBotaoContainer.classList.add('botao_container');

    var botao = document.createElement('button');
    botao.setAttribute('type', 'submit');
    botao.setAttribute('id', 'bo' + item.id); // Adicionando um ID único para cada botão
    // Chamando a função para atualizar o texto do botão
    await atualizarBotoesReservaVerify(item.id, botao);

    let user_soticon;

    // Adicionando ouvinte do evento de clique no botão
    botao.addEventListener("click", function() {
        // Passando o user_soticon
        GetUserSoticon(token_decodificado.user_id).then(resp => {
            user_soticon = resp.id;
            // Aqui você pode usar o valor de user_soticon
//  //              console.log("O id user_soticon: ", user_soticon);
            // Chamando função de reservar ticket
            reservarTicket(item.id, user_soticon);
        });
    });

    var paragrafoPosicao = document.createElement('p');
    paragrafoPosicao.textContent = item.posicao;
    paragrafoPosicao.classList.add('Posicao');
    // paragrafoPosicao.textContent = "Posição 11/58"
    await atualizarPosicaoFIla(item.id, paragrafoPosicao);

    // Adicionando elementos filhos à div .caixa
    caixa.appendChild(paragrafoDia);
    caixa.appendChild(spanData);
    caixa.appendChild(paragrafoHora);
    caixa.appendChild(divBotaoContainer);
    divBotaoContainer.appendChild(botao);
    divBotaoContainer.appendChild(paragrafoPosicao);

    return caixa;
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

async function getTickets() {
    const url = url_base + "cortex/api/soticon/v1/tickets/";

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
            throw new Error("Erro ao puxar os tickets" + erro);
        }
        const data = await response.json();
//  //          console.log("Aqui estão os tickets: ", data.results);
        return data.results;

    } catch (error) {
        //console.error("Erro durante a requisição dos tickets: ", error.message);
    }
}
getTickets()

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
        //console.log("Aqui está o usuário: ", data);
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

