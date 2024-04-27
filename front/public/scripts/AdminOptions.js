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


// verificando id do usuário
function VerifyUserPermission(token_decodificado) {
    const id_user_tela = token_decodificado.user_id

    if (id_user_tela) {
        // significa que o tipo do usuário não permite ele acessar essa tela
        if (id_user_tela !== 1) {
            window.location.href = "../index.html";
        }
    }

    console.log("Usuário da tela: ", id_user_tela)
}
VerifyUserPermission(token_decodificado)


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