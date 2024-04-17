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

// acessando elementos do formulário de longin 
function handleFormSubmit(event) {
    event.preventDefault();

    // Obter os valores dos campos de entrada
    const userInput = document.getElementById("cpf").value;
    const passwordInput = document.getElementById("senha").value;

    // Exibir os dados no console
    console.log("Dados do formulário de login:");
    console.log("Nome de usuário:", userInput);
    console.log("Senha:", passwordInput);
}

// Função para fazer a solicitação POST para o endpoint /api/token
function getToken() {
    // endpoint para gerar o token
    const url = "http://127.0.0.1:8000/api/token/";

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
            window.location.href = "../pages/index.html";
            window.alert("Tente realizar o login novamente!")
        })
}

// função que já passa o usuário para a próxima tela se ele estiver logado
function veficarTokens() {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken')

    // verificar se ambos os tokens estão presentes
    if (token && refreshToken) {
        // redirecionar usuário
        redirecionarParaProximaTela();
    }
}
// chamando função
veficarTokens();

// função para redirecionar o user para a proxima tela
function redirecionarParaProximaTela() {

    // Ambos os tokens estão válidos, redirecionar o usuário para a tela de reserva
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const url = '../front/pages/reserva_ticket.html?token=' + encodeURIComponent(token) + '&refreshToken=' + encodeURIComponent(refreshToken);
    window.location.href = url;
}

// verificando tempo de expiração do token
function verificarTokenExpirado(tokenKey) {
    const token = localStorage.getItem(tokenKey);
    const tempoDeExpiracao = localStorage.getItem("tempo de expiração " + tokenKey);
    const agora = new Date().getTime();

    return agora > tempoDeExpiracao
}