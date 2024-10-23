const url_base = window.env.URL_BASE 


const token = localStorage.getItem('token') ? localStorage.getItem('token') : window.location.href = "../index.html";
const refresh = localStorage.getItem('refreshToken') ? localStorage.getItem('refreshToken') : window.location.href = "../index.html";


function decodeToken(token) {
    const payload = token.split('.')[1]
    const decodeToken = atob(payload);
    return JSON.parse(decodeToken);
}
const token_decodificado = decodeToken(token)


async function VerifyUserPermission(token_decodificado) {
    const id_user_tela = token_decodificado.user_id

    if (id_user_tela) {
        
        const resp = await verificarTipoUsuario(token_decodificado.user_id);


        if (resp.nome_tipo !== "admin" & resp.nome_tipo !== "aluno") {
            window.location.href = "../index.html";
            
        } else {

        }
    }


}
VerifyUserPermission(token_decodificado)




function VerificarToken(token, refresh) {

    const url = url_base + "cortex/api/token/verify/";

    
    const data = {
        token: token
    };

    
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    
    fetch(url, options)
        .then(response => {
            
            if (!response.ok) {
                throw new Error("Erro ao verificar o token: " + response.status);
            }
            

        })
        .catch(error => {
            

            
            
            if (error.message.includes('401')) {
                
                ConsumirRefreshToken(refresh);
            }
            
            window.location.href = "../index.html"
        })
}

VerificarToken(token, refresh)


let novoTokenDeAcesso;
let novoRefresh;

function ConsumirRefreshToken(refresh) {

    
    const url = url_base + "cortex/api/token/refresh/";

    
    const data = {
        refresh: refresh
    };

    
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }

    
    fetch(url, options)
        .then(response => {
            if (!response.ok) {
                throw new Error("Erro ao consumir o refresh token: " + response.status);
            }
            
            return response.json();
        })
        .then(data => {
            
            if (data.access){
                
                novoTokenDeAcesso = data.access;
                novoRefresh = data.refresh

                
                localStorage.setItem('token', novoTokenDeAcesso)




                
                window.location.reload()
            } 
            else {
                
                throw new Error("Erro ao acessar o novo token")
            }
        })
        .catch(error => {
            


            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')

            
            if (error.message.includes('401') || error.message.includes('403')) {
                
                window.location.href = "../index.html"
            }
            else if (error.message.includes('400')) {
                window.location.href = "../index.html"
            }
        })
}


async function GetUserSoticon() {
    const url = url_base + `cortex/api/soticon/v1/users/`

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

        return data

    } catch (error) {

    }
}


async function atualizarBotoesReservaVerify(id_rota, botao) {

    try {
        
        const resp = await GetUserSoticon();

        
        if (resp && resp.tickets_reservados && resp.tickets_reservados.length > 0) {
            const ticketReservado = resp.tickets_reservados.find(ticket => {
                
                return ticket.rota && ticket.rota.some(rota => rota.id === id_rota && rota.status === 'espera');

            });
            
            botao.textContent = ticketReservado ? "-" : "+";

        } else {
            botao.textContent = "+"
        }
    } catch (error) {

    }
}
/*-------------------------------------------------------------------------------- */

async function atualizarPosicaoFIla(id_rota, posicao) {
    try {
        
        const resp = await GetUserSoticon();

        if (resp && resp.tickets_reservados && resp.tickets_reservados.length > 0) {
            const ticketReservado = resp.tickets_reservados.find(ticket => {
                
                return ticket.rota && ticket.rota.some(rota => rota.id === id_rota && rota.status === 'espera');
            });
            
            posicao.textContent = ticketReservado ? `Posição ${resp.tickets_reservados[0].num_ticket}/84` : "";

        } else {
            posicao.textContent = ""
        }
    } catch (error) {

    }
}

let data_rota = DayData();

let rotasDoDia;

async function ListarRotasDoDIa() {
    
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
        
        if (!response.ok) {
            throw new Error("Erro ao puxar as rotas do dia!");
        }
        const data = await response.json();

        rotasDoDia = data.results;
        return data.results;

    } catch (erro) {

        window.location.reload()
    }
}


const iconContainer = document.querySelector(".icon-container");
const loadingIcon = document.createElement('i');
const frase = document.createElement('h1');
frase.innerHTML = "Carregando tickets..."

loadingIcon.classList.add('fas', 'fa-spinner', 'fa-spin', 'loading-icon');
iconContainer.appendChild(loadingIcon)
iconContainer.appendChild(frase)

var container = document.querySelector(".container");


async function montarElementosDaTela() {
    
    const rotas = await ListarRotasDoDIa()
    
    container.innerHTML = '';

    
    for (const item of rotas) {

        var caixa = document.createElement('div');
        caixa.classList.add('caixa');

        
        var paragrafoDia = document.createElement('p');
        paragrafoDia.classList.add('dia');
        paragrafoDia.textContent = Dayweek(item.data);

        
        var spanData = document.createElement('span');
        spanData.classList.add('data');
        spanData.textContent = formatDate(item.data)

        
        var paragrafoHora = document.createElement('p');
        paragrafoHora.classList.add('hora');
        paragrafoHora.textContent = formatHorario(item.horario)

        var divBotaoContainer = document.createElement('div');
        divBotaoContainer.classList.add('botao_container');

        var botao = document.createElement('button');
        botao.setAttribute('type', 'submit');
        botao.setAttribute('id', 'bo' + item.id); 
        
        await atualizarBotoesReservaVerify(item.id, botao);

        let user_soticon;
        
        botao.addEventListener("click", function() {

            GetUserSoticon().then(resp => {
                user_soticon = resp.id
                
                reservarTicket(item.id, user_soticon)
            });
        })


        var paragrafoPosicao = document.createElement('p');
        paragrafoPosicao.textContent = item.posicao;
        paragrafoPosicao.classList.add('Posicao');
        
        await atualizarPosicaoFIla(item.id, paragrafoPosicao)

        caixa.appendChild(paragrafoDia);
        caixa.appendChild(spanData);
        caixa.appendChild(paragrafoHora);
        caixa.appendChild(divBotaoContainer);
        divBotaoContainer.appendChild(botao);
        divBotaoContainer.appendChild(paragrafoPosicao);
        
        
        container.appendChild(caixa);
    }

    iconContainer.removeChild(loadingIcon);
    iconContainer.removeChild(frase)

    window.onload = function() {

        const estadoBotao = localStorage.getItem('botao_disable_state')

        if (estadoBotao === 'true') {
            // botao.disabled = true;
            disableButtonTemporarily(botao)
        } else {
            botao.disabled = false;
            // localStorage.setItem('botao_disable_state', false)
        }
    }
    
    function reservarTicket(id_rota, id_user_soticon) {
        const estadoBotao = localStorage.getItem('botao_disable_state') || 'false'

        if (estadoBotao === 'false') {

            disableButtonTemporarily(botao)

            const Botao = document.getElementById("bo" + id_rota);
            const bo_conteudo = Botao.textContent
            if (!Botao) {
                return;
            }
            
            const Posicao = Botao.nextElementSibling;
            if (!Posicao) {
                return;
            }
            
            const loadingIcon = document.createElement('i');
            loadingIcon.setAttribute('id', 'loading-icon');
            loadingIcon.classList.add('fas', 'fa-sync-alt', 'fa-spin');
            loadingIcon.style.display = 'none';
            
            Botao.innerHTML = '';
            Botao.appendChild(loadingIcon);
            
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
                    
                    loadingIcon.style.display = "none";

                    if (data) {
                        if (bo_conteudo === "+") {
                            Botao.textContent = "-";
                        } else if (bo_conteudo === "-") {
                            Botao.textContent = "+";
                        }
                        const posicao_fila_objeto = data.posicao_fila
                        Posicao.textContent =  (posicao_fila_objeto !== undefined) ? `Posição ${posicao_fila_objeto}/84` : ""
                    }

        
                } catch (error) {
                    Botao.textContent = "+"
                } finally {
                    
                    loadingIcon.style.display = 'none';
                }
            };
            reservarOuCancelarTicket(id_rota, id_user_soticon);
        }
    }

    if (rotas.length === 0) {

        const mensagem = document.createElement("div");

        mensagem.textContent = "Não há rotas disponíveis no sistema!";

        mensagem.style.fontSize = "4vw"

        iconContainer.appendChild(mensagem)
    }
}


montarElementosDaTela().catch(error => {

})

async function criarElementoRota() {
    var caixa = document.createElement('div');
    caixa.classList.add('caixa');

    
    var paragrafoDia = document.createElement('p');
    paragrafoDia.classList.add('dia');
    paragrafoDia.textContent = Dayweek(item.data);

    
    var spanData = document.createElement('span');
    spanData.classList.add('data');
    spanData.textContent = formatDate(item.data);

    
    var paragrafoHora = document.createElement('p');
    paragrafoHora.classList.add('hora');
    paragrafoHora.textContent = formatHorario(item.horario);

    var divBotaoContainer = document.createElement('div');
    divBotaoContainer.classList.add('botao_container');

    var botao = document.createElement('button');
    botao.setAttribute('type', 'submit');
    botao.setAttribute('id', 'bo' + item.id); 
    
    await atualizarBotoesReservaVerify(item.id, botao);

    let user_soticon;

    
    botao.addEventListener("click", function() {
        
        GetUserSoticon().then(resp => {
            user_soticon = resp.id;
            

            
            reservarTicket(item.id, user_soticon);
        });
    });

    var paragrafoPosicao = document.createElement('p');
    paragrafoPosicao.textContent = item.posicao;
    paragrafoPosicao.classList.add('Posicao');
    
    await atualizarPosicaoFIla(item.id, paragrafoPosicao);

    
    caixa.appendChild(paragrafoDia);
    caixa.appendChild(spanData);
    caixa.appendChild(paragrafoHora);
    caixa.appendChild(divBotaoContainer);
    divBotaoContainer.appendChild(botao);
    divBotaoContainer.appendChild(paragrafoPosicao);

    return caixa;
}


function DayData() {
    const minhadata = new Date();
    const dia = minhadata.getDate();
   
    const mes = minhadata.getMonth() + 1;
    const ano = new Date().getUTCFullYear();

    const diaStr = dia < 10 ? `0${dia}` : `${dia}`;
    const mesStr = mes < 10 ? `0${mes}` : `${mes}`;

    return `${ano}-${mes}-${dia}`;
}


function Dayweek(data) {
    const diasSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    const dia = new Date(data).getDay();
    return diasSemana[dia + 1];
}


function formatDate(dateString) {
    const parts = dateString.split('-');
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    return `${day}/${month}/${year}`;
}


function formatHorario(horarioString) {
    
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

        return data.results;

    } catch (error) {

    }
}
getTickets()


// const logout_elemenst = document.querySelector(".retornar")
// logout_elemenst.addEventListener("click", function() {
//     localStorage.removeItem('token')
//     localStorage.removeItem('refreshToken')
//     localStorage.removeItem('botao_disable_state')
//     window.location.href = "../index.html"
// })

// logout_elemenst.forEach(function(element) {
//     element.addEventListener("click", function() {
//         for (var i = 0; i < logout_elemenst.length; i++) {
//             localStorage.removeItem('token')
//             localStorage.removeItem('refreshToken')
//             localStorage.removeItem('botao_disable_state')
//             window.location.href = "../index.html"
//         }   
//     })
// })



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

        return data;

    } catch (error) {

    }
}

function verifyTokenPattern(token) {
    
    return /^{{Token .+}}$/.test(token);
}

function redirecionarSeNecessario() {
    const token = localStorage.getItem('token');

    if (token) {
        if (verifyTokenPattern(token)) {
            
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken')
            
            window.location.href = "./index.html";
        }
    }
}
redirecionarSeNecessario();

function disableButtonTemporarily(botao) { 
    // button.classList.add('disabled-temporary');

    botao.disabled = true;
    localStorage.setItem('botao_disable_state', true)

    setTimeout(function() {
        // button.classList.remove('disabled-temporary');
        botao.disabled = false
        localStorage.setItem('botao_disable_state', false)
    }, 10000); 
}

window.addEventListener('beforeunload', function() {
    localStorage.removeItem('botao_disable_state')
})