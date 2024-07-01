const url_base = "https://web-5gnex1an3lly.up-us-nyc1-k8s-1.apps.run-on-seenode.com/";

let accessToken = localStorage.getItem('token') ? decodeToken(localStorage.getItem('token')) : ""

// acessando botão do formulário
document.getElementById("login").addEventListener("click", function() {
    // acessando valores dos inputs
    const cpf = document.getElementById("cpf").value;
    const password = document.getElementById("senha").value;
    
    try {
        if (cpf !== "" && password !== "") {
            // gerar token
            getToken(cpf, password)
        } else {
            console.log("Preencha os campos do formulário")
        }
    } catch (error) {
        console.log("Erro")
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
                return redirecionarParaProximaTela(data.access);
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
            window.alert("CPF ou Senha inválidos! \nTente realizar o login novamente!")
        })
        .finally(() => {
            // window.location.reload()
            loginButton.innerHTML = 'processando...';
        })
}

// função que já passa o usuário para a próxima tela se ele estiver logado
// function veficarUsuarioLogado() {
//     const token = localStorage.getItem('token');
//     const refreshToken = localStorage.getItem('refreshToken')

//     // verificar se ambos os tokens estão presentes
//     if (token && refreshToken) {
//         if (!verificarTokenExpirado(token)) {
//             // redireciona para a próxima tela
//             redirecionarParaProximaTela()

//         } else {
//             window.location.href = "./index.html";
//         }
//     }
// }
// // chamando função
// veficarUsuarioLogado();

// função para redirecionar o user para a proxima tela
async function redirecionarParaProximaTela(accessToken) {
    try {
        // const userId = parseJwt(accessToken).user_id
        const userId = decodeToken(accessToken).user_id
        console.log("Recebendo id: ", userId)
    
        // verificando o tipo de usuário
        const resp = await verificarTipoUsuario(userId)
        let url;
    
        switch (resp.nome_tipo) {
            case "admin":
                url = './pages/AdminOptions.html';
                break;
            case "aluno":
                url = './pages/reserva_ticket.html';
                break;
            case "motorista":
                url = './pages/motorista.html';
                break;
            case "ti":
                url = './pages/cadastrarRotas.html';
                break;
            case "serv.terceirizado":
                url = './pages/guarita.html';
                break;
            case "professor":
            case "tec.administrativo":
                // Não tem tela para o professor no Soticon ainda
                url = "./index.html";
                break;
            default:
                window.alert("Usuário inexistente no sistema!");
                url = "./index.html";
        }
        
            window.location.href = url;

    } catch (error) {
        console.log("Erro ao redirecionar para a próxima tela: ", error.message);
        // window.alert("Erro ao redirecionar para a próxima tela!");
        window.location.href = "./index.html";
    }
}

// decodificando o token
function decodeToken(token) {
    const payload = token.split('.')[1]
    const decodeToken = atob(payload);
    return JSON.parse(decodeToken);
}
console.log("Token decodificado: ", accessToken.user_id)

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
        console.log("Aqui está o usuário: ", data);
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

async function redirecionarSeNecessario() {
    const token = localStorage.getItem('token');
    const refresh = localStorage.getItem('refreshToken')

    console.log("Tokens: ", {token, refresh})

    if (token && refresh) {
        if (verifyTokenPattern(token)) {
            // Remover token do localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken')
            // Redirecionar para a página de índice
            window.location.href = "./index.html";
        } else {
            // Token válido, continuar com a operação normal
            redirecionarParaProximaTela(token);
        }
    }
}
// Chamada para verificar e redirecionar
redirecionarSeNecessario();