const url_base = "https://web-5gnex1an3lly.up-us-nyc1-k8s-1.apps.run-on-seenode.com/";
// acessando botão do formulário
document.getElementById("login").addEventListener("click", function() {
    // acessando valores dos inputs
    const cpf = document.getElementById("cpf").value;
    const password = document.getElementById("senha").value;

    if (cpf !== "" && password !== "") {
        // gerar token
        getToken()
    } else {
        console.log("Preencha os campos do formulário")
    }
})

// Função para fazer a solicitação POST para o endpoint /api/token
function getToken() {
    // endpoint para gerar o token
    const url = url_base + "api/token/";

    // parâmetros do usuário (cpf e senha)
    const cpf = document.getElementById("cpf").value;
    const password = document.getElementById("senha").value;

    // obejeto com os dados a serem enviados no corpo da solicitação
    const data = {
        cpf : cpf,
        password : password
    }

    // config da solicitação
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }

    // Fazendo a solicitação POST usando a API Fetch
    fetch(url, options)
        .then(response => {
            // verificar a resposta
            if (!response.ok) {
                throw new Error("Erro ao fazer solicitação: " + response.status);
            }
            // convertando resposta para Json
            return response.json();
        })
        .then(data => {
            // verificar se o token foi recebido
            if (data.access && data.refresh) {
                localStorage.setItem('token', data.access)
                localStorage.setItem('refreshToken', data.refresh)

                console.log("token ", data.access);
                console.log("refresh ", data.refresh)

                // Redirecionar o usuário para a próxima tela (tela de reserva)
                redirecionarParaProximaTela();
            }
            else {
                throw new Error("Token não recebido na resposta");
            }
        })
        .catch(error => {
            console.error("Ocorreu um erro: ", error.message)
            console.log("token ", data.access);
            console.log("refresh ", data.refresh)

            // redireciona para a tela de login em caso de erro
            window.location.href = "./index.html";
            window.alert("Tente realizar o login novamente!")
        })
}

// função para redirecionar o user para a proxima tela
function redirecionarParaProximaTela() {
    // Ambos os tokens estão válidos, redirecionar o usuário para a tela de reserva
    const url = './pages/reserva_ticket.html'
    window.location.href = url;
}

// função que já passa o usuário para a próxima tela se ele estiver logado
function veficarTokens() {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken')

    // verificar se ambos os tokens estão presentes
    if (token && refreshToken) {
        // verificar se o token de acesso foi expirado
        if (verificarTokenExpirado(token)) {
            // se tiver expirado, permanece na tela de login
            window.location.href = "./index.html";
        }
        else {
            // token de acesso válido, redirecionar usuário
            redirecionarParaProximaTela();
        }
    }
}
// chamando função
veficarTokens();

// verificando tempo de expiração do token
function verificarTokenExpirado(tokenKey) {
    const tokenData = decodeToken(tokenKey);
    const expirationTime = tokenData.exp * 1000 // Expiração em segundos, converter para milissegundos
    const currenTime = Date.now();

    // comparar a data de expiração com a data atual
    if (expirationTime < currenTime) {
        // remover o token expirado do localstorage
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return true; // indica que o token expirou
    }

    return false; //indica que o token ainda é válido
}

// função para decodificar o token
function decodeToken(token) {
    const payload = token.split('.')[1];
    const token_decodificado = atob(payload);
    return JSON.stringify(token_decodificado);
}