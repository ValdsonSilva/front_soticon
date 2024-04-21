const url_base = "https://web-5gnex1an3lly.up-us-nyc1-k8s-1.apps.run-on-seenode.com/";


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


console.log("O token decodificado: ", token_decodificado)

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
            console.log("O token foi aceito")
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

                console.log('Novo token de acesso: ', novoTokenDeAcesso)
                // console.log('Novo refresh: ', novoRefresh)

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

let data_rota = DayData();
console.log(data_rota.toUpperCase())
let rotasDoDia;

async function ListarRotasDoDIa() {
    // url da requisição
    const url = url_base + `api/soticon/v1/rotas/?data=${data_rota}`;

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
        console.log("Rotas do dia: ", data.results);
        rotasDoDia = data.results;
        return data.results;

    } catch (erro) {
        console.error("Erro durante a requisição das rotas do dia: ", erro.message);
        window.location.reload()
    }
}

ListarRotasDoDIa().then(() => {
    console.log("Rotas: ", rotasDoDia)
})

// listando rotas na tela
document.addEventListener("DOMContentLoaded", function() {

    // Exibir ícone de carregamento
    const iconContainer = document.querySelector(".icon-container");
    const loadingIcon = document.createElement('i');
    const frase = document.createElement('h1');
    frase.innerHTML = "Carregando tickets..."

    loadingIcon.classList.add('fas', 'fa-spinner', 'fa-spin', 'loading-icon');
    iconContainer.appendChild(loadingIcon)
    iconContainer.appendChild(frase)

    ListarRotasDoDIa().then(rotas => {

        // Remover ícone de carregamento após o conteúdo ser carregado
        iconContainer.removeChild(loadingIcon);
        iconContainer.removeChild(frase)

        // pegando container da tela
        var container = document.querySelector(".container");
        container.innerHTML = '';

        // mapeando e adicionando os itens ao container
        rotas.forEach(function(item) {
            var caixa = document.createElement('div');
            caixa.classList.add('caixa');

            // nomo do dia da semana
            var paragrafoDIa = document.createElement('p');
            paragrafoDIa.classList.add('dia');
            paragrafoDIa.textContent = Dayweek(item.data);

            // data no formato "dd/mm/yyyy"
            var spanData = document.createElement('span');
            spanData.classList.add('data');
            spanData.textContent = formatDate(item.data)

            // hora da rota
            var paragrafoHora = document.createElement('p');
            paragrafoHora.classList.add('hora');
            paragrafoHora.textContent = formatHorario(item.horario)

            var divBotaoContainer = document.createElement('div');
            divBotaoContainer.classList.add('botao_container');

            var botao = document.createElement('button');
            botao.setAttribute('type', 'submit');
            botao.setAttribute('id', 'bo' + item.id); // Adicionando um ID único para cada botão
            botao.textContent = '+';

            let user_soticon;

            // adicionando ouvinte do evento de clique no botão
            botao.addEventListener("click", function() {
                // passando o user_soticon
                GetUserSoticon().then(resp => {
                    user_soticon = resp
                    // Aqui você pode usar o valor de user_soticon
                    console.log("O id user_soticon: ", user_soticon);
                    // chamando função de reservar ticket
                    reservarTicket(item.id, user_soticon)
                });
            })

            var paragrafoPosicao = document.createElement('p');
            paragrafoPosicao.textContent = item.posicao;
            paragrafoPosicao.classList.add('Posicao');
            
            // Adicionando elementos filhos à div .caixa
            caixa.appendChild(paragrafoDIa);
            caixa.appendChild(spanData);
            caixa.appendChild(paragrafoHora);
            caixa.appendChild(divBotaoContainer);
            divBotaoContainer.appendChild(botao);
            divBotaoContainer.appendChild(paragrafoPosicao);
            
            // Adicionando a div .caixa ao container principal
            container.appendChild(caixa);
        })
    })

    // array para armazenar o estado de cada botão
    var estadoBotoes = []

    // Desabilita todos os botões de reserva
    function desabilitarBotoesReserva() {
        const botoes = document.querySelectorAll('[id^="bo"]');
        botoes.forEach(botao => {
            const id_rota = botao.id.substring(2); // Extrai o ID da rota do ID do botão
            estadoBotoes[id_rota] = false; // Inicializa o estado do botão no array
            botao.disabled = true;
        });
    }

    // Habilita todos os botões de reserva
    function habilitarBotoesReserva() {
        const botoes = document.querySelectorAll('[id^="bo"]');
        botoes.forEach(botao => {
            botao.disabled = false;
        });
    }

    // atribuindo estados com base na quantidade de rotas do dia
    desabilitarBotoesReserva(); // Desabilita os botões antes de iniciar o processo
   // Função para listar as rotas do dia e habilitar os botões após a conclusão da atribuição de estados
    ListarRotasDoDIa()
        .then(rotas => {
            rotas.forEach(rota => {
                estadoBotoes[rota.id] = false; // Inicializa o estado do botão no array
            });
            console.log("Rota processada!");
            habilitarBotoesReserva(); // Habilita os botões após a conclusão da atribuição de estados
        })
        .catch(error => {
            console.error('Erro na atribuição de estado dos botões!');
        });

    // url reservar_ticket = url_base + '/api/soticon/v1/reservarticket/'

    // OBS: lembrar de se basear por o estado do tícket
    function reservarTicket(id_rota, id_user_soticon) {
        console.log("Ticket reservado para o ônibus: ", id_rota);

        const Botao = document.getElementById("bo" + id_rota);
        if (!Botao) {
            console.error("Botão não encontrado para o índice:", id_rota);
            return;
        }
        
        const Posicao = Botao.nextElementSibling;
        if (!Posicao) {
            console.error("Próximo elemento irmão não encontrado para o botão:", Botao);
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
                // const url = url_base + '/api/soticon/v1/reservarticket/';
                // const metodoHTTP = estadoBotoes[id_rota] ? 'POST' : 'POST';
                
                // const response = await fetch(url, {
                //     method: metodoHTTP,
                //     headers: {
                //         'Content-Type': 'application/json',
                //         'Authorization': `Bearer ${localStorage.getItem('token')}`
                //     },
                //     body: JSON.stringify({
                //         rota: id_rota,
                //         user_soticon: id_user_soticon
                //     })
                // });
    
                // if (!response.ok) {
                //     throw new Error('Erro ao processar a solicitação');
                // }
    
                // const data = await response.json();

                // Simulação de uma pausa de 1 segundo (você pode substituir isso pelo código real da requisição)
                await new Promise(resolve => setTimeout(resolve, 3000)); 

                console.log('Reserva de ticket processada com sucesso:', {rota, user_soticon});
    
                // Alterar o estado do botão e atualizar o texto e estilo
                estadoBotoes[id_rota] = !estadoBotoes[id_rota];
                Botao.innerText = estadoBotoes[id_rota] ? '-' : '+';
                Posicao.innerText = estadoBotoes[id_rota] ? 'Posição 23/58' : '';
                console.log(`Estado botão ${id_rota}: ${estadoBotoes[id_rota]}`)

                // Ocultar ícone de carregamento após a requisição
                loadingIcon.style.display = "none";
    
            } catch (error) {
                console.error('Erro ao reservar/cancelar ticket:', error.message);
            } finally {
                // ocultar o ícone de carregamento
                loadingIcon.style.display = 'none';
            }
        };

        // Chamando a função interna com os parâmetros corretos
        reservarOuCancelarTicket(id_rota, id_user_soticon);
    }
})

// função para pegar a data do dia no formato 'yyyy-mm-dd'
function DayData() {
    const minhadata = new Date();
    const dia = minhadata.getDate();
   
    const mes = minhadata.getMonth() + 1;
    const ano = new Date().getUTCFullYear();

    if (dia < 10){
        return `0${ano}-${mes}-${dia}`

        if (mes < 10){
            return `0${ano}-0${mes}-${dia}`
        }
    }

    else if (mes < 10){
        return `${ano}-0${mes}-${dia}`

        if (dia < 10){
            return `0${ano}-0${mes}-${dia}`
        }
    } else {
        return `${ano}-${mes}-${dia}`
    }
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
    const horario = new Date(horarioString);
    const hours = horario.getHours();
    const minutes = horario.getMinutes();
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    return `Ônibus das ${formattedHours}:${formattedMinutes}h`;
}

async function getTickets() {
    const url = url_base + "api/soticon/v1/tickets/";

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
        console.log("Aqui estão os tickets: ", data.results);
        return data.results;

    } catch (error) {
        console.error("Erro durante a requisição dos tickets: ", error.message);
    }
}

// endpoint user_soticon
// conts url = url_base + "api/soticon/v1/user_soticon/?user=id/"

async function GetUserSoticon(user_id) {
    const url = url_base + `api/soticon/v1/users/?user=${user_id}/`

    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error("Erro ao pegar user_soticon" + response.status);
        }
        const data = await response.json();
        console.log("Aqui está o user_soticon: ", data.results[2]);
        return data.results[2].usuario

    } catch (error) {
        console.error("Erro durante a requisição do user_soticon: ", error.message);
    }
}
GetUserSoticon(token_decodificado.user_id)
console.log("User sistema: ", token_decodificado.user_id)

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


/* 
    Eu preciso de algum dado do ticket/rota do aluno para verificar 
o estado do botão de reserva para que ao carregar a página o estado 
não seja perdido e o estilo do botão seja preservado.

*/

