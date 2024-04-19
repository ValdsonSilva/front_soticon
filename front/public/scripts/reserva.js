const url_base = "https://web-5gnex1an3lly.up-us-nyc1-k8s-1.apps.run-on-seenode.com/";

//Função para mostrar a data da rota do ônibus no formato dd/mm/aaaa
const data = document.querySelectorAll(".data");
function DataDiária() {
    const minhadata = new Date();
    const dia = minhadata.getDate();
   
    const mes = minhadata.getMonth() + 1;
    const ano = new Date().getUTCFullYear();

    for (var i = 0; i < data.length; i++) {
        data[i].innerText = `Data:${dia}/${mes}/${ano}`

        if (dia < 10){
            data[i].innerText = `Data:0${dia}/${mes}/${ano}`
    
            if (mes < 10){
                data[i].innerText = `Data:0${dia}/0${mes}/${ano}`
            }
        }
    
        if (mes < 10){
            data[i].innerText = `Data:${dia}/0${mes}/${ano}`
        
            if (dia < 10){
                data[i].innerText = `Data:0${dia}/0${mes}/${ano}`
            
            }
        }
    }
}
// chamando a função
DataDiária();


//Função para mostrar o dia da semana
const dia = document.querySelectorAll(".dia");
function Dayweek() {
    const Dia = new Date().getDay();

    for (var i = 0; i < dia.length; i++){
        dia[i].innerText = `${Dia}`

        switch (Dia) {
            case 1:
                dia[i].innerText = `Segunda-feira`
                break
            case 2:
                dia[i].innerText = `Terça-feira`
                break
            case 3:
                dia[i].innerText =  `Quarta-feira`
                break
            case 4:
                dia[i].innerText = `Quinta-feira`
                break
            case 5:
                dia[i].innerText = `Sexta-feira`
                break
            case 6:
                dia[i].innerText = `Sábado`
                break
            default:
                dia[i].innerText = `Dia inválido`
        }
    }
}
//Chamando a função do dia da semana
Dayweek();

//Setando o conteúdo do botão ao clicar
// const Botao = document.querySelector("#bo");
// const Posicao = document.querySelector(".Posicao")
// let estadoBotao = false;
// Botao.addEventListener("click", () => {
       
//        if (estadoBotao) {
//            Botao.innerText = "+"
//            Botao.setAttribute("style", "");

//        } else {
//             Botao.innerText = `-`
        
//             Botao.setAttribute("style", "none; display: grid; place-content: center;")

//             // Posicao.innerText = "Posição 23/58"
//        }
       
//        //Aqui invertemos o estado do botão
//        estadoBotao = !estadoBotao;

//        console.log("Tá dando certo aqui cara, o problema é ai fora!")
// });


// Obter o token da URL
const urlParams = new URLSearchParams(window.location.search);
const token = localStorage.getItem('token');
const refresh = localStorage.getItem('refreshToken');

console.log("O token chegou: ", token)
console.log("O refresh chegou: ", refresh)

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
            if (error.message.includes('400')) {
                window.location.href = "../index.html"
            }
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
                console.log('Novo refresh: ', novoRefresh)
            } 
            else {
                // refresh inválido
                throw new Error("Erro ao acessar o novo token")
            }
        })
        .catch(error => {
            // Lidar com erros
            console.error("Ocorreu um erro ao consumir o refresh token: ", error);

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

// listar todas as rotas do dia
window.onload = function ListarRotasDoDIa() {
    // url da requisição
    const url = url_base + `/rotas/?data=${data_rota}`;
    
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    fetch(url, options)
        .then(response => {
            // deu erro na busca das rotas do dia
            if (!response.ok) {
                throw new Error("Erro ao puxar as rotas do dia!");
            }
            // Deu certo a busca das rotas do dia
            response.json()
        })
        .then(data => {
            console.log(data)
        })
        .catch(erro => {
            console.error("Erro durante a requisição das rotas do dia: ", erro.message)

            // window.alert("Não foi possível carregar as rotas do dia! \nTente novamente mais tarde.")
        })
}

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

document.addEventListener("DOMContentLoaded", function() {
    // listar os dados das rotas na tela
    var listaDeRotas = [
        { dia: "Segunda-feira", data: "2024-04-19", hora: "Ônibus das 12:00h"},
        { dia: "Segunda-feira", data: "2024-04-19", hora: "Ônibus das 17:00h"},
        { dia: "Segunda-feira", data: "2024-04-19", hora: "Ônibus das 22:00h"},
    ]

    // pegando container da tela
    var container = document.querySelector(".container");

    // mapeando e adicionando os itens ao container
    listaDeRotas.forEach(function(item, index) {
        var caixa = document.createElement('div');
        caixa.classList.add('caixa');

        var paragrafoDIa = document.createElement('p');
        paragrafoDIa.classList.add('dia');
        paragrafoDIa.textContent = item.dia;

        var spanData = document.createElement('span');
        spanData.classList.add('data');
        spanData.textContent = item.data

        var paragrafoHora = document.createElement('p');
        paragrafoHora.classList.add('hora');
        paragrafoHora.textContent = item.hora

        var divBotaoContainer = document.createElement('div');
        divBotaoContainer.classList.add('botao_container');

        var botao = document.createElement('button');
        botao.setAttribute('type', 'submit');
        botao.setAttribute('id', 'bo' + index); // Adicionando um ID único para cada botão
        botao.textContent = '+';

        // adicionando ouvinte do evento de clique no botão
        botao.addEventListener("click", function() {
            // chama a função de reservar ticket
            reservarTicket(index);
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

    // array para armazenar o estado de cada botão
    var estadoBotoes = new Array(listaDeRotas.length).fill(false);

    // função para reservar um tícket específico
    function reservarTicket(index) {
        console.log("Ticket reservado para o ônibus " + listaDeRotas[index].hora)

        const Botao = document.getElementById("#bo" + index);
        const Posicao = Botao.nextElementSibling.querySelector('.Posicao');

        Botao.addEventListener("click", () => {
            
               if (estadoBotoes[index]) {
                    Botao.innerText = "+"
                    Botao.removeAttribute("style");
                    Posicao.innerText = "";

               } else {
                    Botao.innerText = `-`
                    Botao.setAttribute("style", "none; display: grid; place-content: center;")
                    Posicao.innerText = "Posição 23/58"
               }
            
               //Aqui invertemos o estado do botão
               estadoBotoes[index] = !estadoBotoes[index];

               console.log("Tá dando certo aqui cara, o problema é ai fora!")
        });
    }
})