const url_base = "https://web-5gnex1an3lly.up-us-nyc1-k8s-1.apps.run-on-seenode.com/";

//Função para mostrar a data da rota do ônibus no formato dd/mm/aaaa
const data = document.querySelectorAll(".data");
window.onload = function() {
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
const Botao = document.querySelector("#bo");
const Posicao = document.querySelector(".Posicao")
let estadoBotao = false;
Botao.addEventListener("click", () => {
       
       if (estadoBotao) {
           Botao.innerText = "+"
           Botao.setAttribute("style", "");

       } else {
            Botao.innerText = `-`
        
            Botao.setAttribute("style", "none; display: grid; place-content: center;")

            // Posicao.innerText = "Posição 23/58"
       }
       
       //Aqui invertemos o estado do botão
       estadoBotao = !estadoBotao;

       console.log("Tá dando certo aqui cara, o problema é ai fora!")
});


// Obter o token da URL
const urlParams = new URLSearchParams(window.location.search);
const token = localStorage.getItem('token');
const refresh = localStorage.getItem('refreshToken');

console.log("O token chegou: ", token)
console.log("O refresh chegou: ", refresh)

// verificando o token que chegou
function verificarToken(token, refresh) {

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
            console.error("Ocorreu um erro ao verificar o token: ", error);
            
            // Verificar se o erro é de token inválido (401)
            if (error.message.includes('401')) {
                // Consumir o endpoint do refresh token
                consumirRefreshToken(refresh);
            }
        })
}
// chamando a função
verificarToken(token, refresh)

// veriável global
let novoTokenDeAcesso;

function consumirRefreshToken(refresh) {

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
                console.log('Novo token de acesso: ', novoTokenDeAcesso)
            } 
            else {
                // refresh inválido
                throw new Error("Erro ao receber o refresh token")
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
