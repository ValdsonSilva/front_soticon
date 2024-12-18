
const url_base = window.env.URL_BASE

let accessToken = localStorage.getItem('token') ? decodeToken(localStorage.getItem('token')) : ""


document.getElementById("login").addEventListener("click", function() {
    
    var cpf = document.getElementById("cpf").value;
    const password = document.getElementById("senha").value;

    const cpf_formatado = limparCPF(cpf)
    
    try {
        if (cpf_formatado !== "" && password !== "") {
            
            getToken(cpf_formatado, password)
        } else {

        }
    } catch (error) {

    }
})


function handleFormSubmit(event) {
    event.preventDefault();
    const userInput = document.getElementById("cpf").value;
    const passwordInput = document.getElementById("senha").value;

}


function getToken(cpf, password) {
    
    const url = url_base + "cortex/api/token/";

    
    const data = {
        cpf : cpf,
        password : password
    }

    
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }

    const loginButton = document.getElementById("login");

    
    const loadingIcon = document.createElement('i');
    loadingIcon.classList.add('fas', 'fa-sync-alt', 'fa-spin', 'loading-icon');

    
    loginButton.innerHTML = '';
    loginButton.appendChild(loadingIcon);


    
    fetch(url, options)
        .then(response => {
            
            if (!response.ok) {
                throw new Error("Erro ao fazer solicitação: " + response.status);
            }
            
            return response.json();
        })
        .then(data => {
            
            if (data.access && data.refresh) {

                localStorage.setItem('token', data.access)
                localStorage.setItem('refreshToken', data.refresh)

                return redirecionarParaProximaTela(data.access);
            }
            else {
                throw new Error("Token não recebido na resposta");
            }
        })
        .catch(error => {
                    
            loginButton.innerHTML = 'Login';
            let errorMessage = '';
            
            if (error.message.includes(401)) {
                errorMessage = "CPF ou Senha inválidos! \nTente realizar o login novamente!";

            } else if (error.message.includes(400)) {
                errorMessage = "Senha ou usuário em branco!";

            } else if (error.message.includes(500)) {
                errorMessage = "Erro de servidor. \nTente novamente mais tarde.";
            }

            if (errorMessage) {
                window.alert(errorMessage)
                window.location.href = "./index.html";
            }
        })
        .finally(() => {
            
            loginButton.innerHTML = 'processando...';
        })
}

const tipo_users = [
    {
        user : "admin",
        url : './pages/admin_areaLogada.html',
    },
    {
        user : "aluno",
        url : './pages/bem_vindo_aluno.html',
    },
    {
        user : "motorista",
        url : './pages/motorista.html',
    },
    {
        user : "cadastro de rotas",
        url : './pages/listar_rotas.html',
    },
    {
        user : "guarita",
        url : './pages/guarita.html',
    },
    {
        user : "professor",
        url : "./index.html",
    },
    {
        user : "tec.administrativo",
        url : "./pages/tecAdm_areaLogada.html",
    },
]


async function redirecionarParaProximaTela(accessToken) {
    try {
        
        const userId = decodeToken(accessToken).user_id
        
        const resp = await verificarTipoUsuario(userId)
        console.log("resp:", resp)
        const setores = resp.nome_setores.map(element => element);


        if (resp.nome_tipo === "admin") {
            window.location.href = tipo_users[0].url

        } else if (resp.nome_tipo === "aluno") {
            window.location.href = tipo_users[1].url

        } else if (resp.nome_tipo === "motorista") {
            window.location.href = tipo_users[2].url
        
        } else {
            setores.forEach((setor) => {
                if (setor === "tec.administrativo") {
                    window.location.href = tipo_users[6].url
                }
            })

            setores_autorizados = ["direcao geral", "direcao de ensino", "direcao de administracao e planejamento", "ti"]

            const setor_autorizado = setores_autorizados.some(item => setores.includes(item))

            if (setor_autorizado) {
                window.location.href = tipo_users[3].url
            } else {
                window.alert("Usuário não autorizado no sistema!")
            }
        }
    } catch (error) {
    }
}


function decodeToken(token) {
    const payload = token.split('.')[1]
    const decodeToken = atob(payload);
    return JSON.parse(decodeToken);
}


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
            throw new Error("Erro ao puxar o usuário " + response.status);
        }
        const data = await response.json();

        return data;

    } catch (error) {
        return `${error.message}`
    }
}

async function redirecionarSeNecessario() {
    const token = localStorage.getItem('token');
    const refresh = localStorage.getItem('refreshToken')

    if (token && refresh) {
        if (verifyTokenPattern(token)) {
            
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken')
            
            window.location.href = "./index.html";
        } else {
            window.alert("Sessão mantida!")
            
            redirecionarParaProximaTela(token);
        }
    }
}

redirecionarSeNecessario();


function verifyTokenPattern(token) {
    
    return /^{{Token .+}}$/.test(token);
}



function limparCPF(cpf) {
    
    return cpf.replace(/\D/g, '');
}