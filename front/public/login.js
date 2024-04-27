const url_base = "https://web-5gnex1an3lly.up-us-nyc1-k8s-1.apps.run-on-seenode.com/";

let token = localStorage.getItem('token') ? decodeToken(localStorage.getItem('token')) : ""

// acessando botão do formulário
document.getElementById("login").addEventListener("click", function() {
    // acessando valores dos inputs
    const cpf = document.getElementById("cpf").value;
    const password = document.getElementById("senha").value;

    if (cpf !== "" && password !== "") {
        // gerar token
        getToken(cpf, password)
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
function getToken(cpf, password) {
    // endpoint para gerar o token
    const url = url_base + "api/token/";

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

    const loginButton = document.getElementById("login");

    // Crie o ícone de carregamento linear
    const loadingIcon = document.createElement('i');
    loadingIcon.classList.add('fas', 'fa-sync-alt', 'fa-spin', 'loading-icon');

    // Adicione o ícone ao botão
    loginButton.innerHTML = '';
    loginButton.appendChild(loadingIcon);


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
                loginButton.innerHTML = 'Login';
                window.location.reload()
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
            loginButton.innerHTML = 'Login';
            window.location.href = "./index.html";
            window.alert("Tente realizar o login novamente!")
        })
}

// função que já passa o usuário para a próxima tela se ele estiver logado
function veficarUsuarioLogado() {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken')

    // verificar se ambos os tokens estão presentes
    if (token && refreshToken) {
        if (!verificarTokenExpirado(token)) {
            // redireciona para a próxima tela
            redirecionarParaProximaTela()

        } else {
            window.location.href = "./index.html";
        }
    }
}
// chamando função
veficarUsuarioLogado();

// função para redirecionar o user para a proxima tela
function redirecionarParaProximaTela() {
    // Ambos os tokens estão válidos, redirecionar o usuário para a tela de reserva
    // const url = './pages/reserva_ticket.html'
    // window.location.href = url;
        
    verificarTipoUsuario(token.user_id).then((resp) => {
        console.log("O tipo do usuário: ", resp.tipo)
        if (resp.tipo === 1) {
            const url = './pages/AdminOptions.html'
            window.location.href = url;
        }
    })
}

// verificando tempo de expiração do token
function verificarTokenExpirado(tokenKey) {
    const tokenData = decodeToken(tokenKey);
    const expirationTime = tokenData.exp * 1000 // Expiração em segundos, converter para milissegundos
    const currentTime = Date.now();

    // comparar a data de expiração com a data atual
    if (expirationTime < currentTime) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return true; // indica que o token expirou
    }

    return false; // indica que o token ainda é válido
}

// decodificando o token
function decodeToken(token) {
    const payload = token.split('.')[1]
    const decodeToken = atob(payload);
    return JSON.parse(decodeToken);
}
console.log("Token decodificado: ", token.user_id)

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
        console.log("Aqui estão os usuários: ", data);
        return data;

    } catch (error) {
        console.error("Erro durante a requisição dos usuários: ", error.message);
    }
}

    
// verificarTipoUsuario(token.user_id).then((resp) => {
//     console.log("O tipo do usuário: ", resp.tipo)
// })