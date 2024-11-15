const url_base = window.env.URL_BASE

// acessando os tokens no localstorage
const token = localStorage.getItem('token') ? localStorage.getItem('token') : window.location.href = "../index.html";
const refresh = localStorage.getItem('refreshToken') ? localStorage.getItem('refreshToken') : window.location.href = "../index.html";

// decodificando o token
function decodeToken(token) {
    const payload = token.split('.')[1]
    const decodeToken = atob(payload);
    return JSON.parse(decodeToken);
}
const token_decodificado = decodeToken(token)

// usuários permitidos para essa tela
const setores_permission = [
    {
        setor : "admin"
    },
    {
        setor : "ti"
    },
    {
        setor : "direcao de ensino"
    },
    {
        setor : "direcao geral"
    },
    {
        setor : "direcao de administracao e planejamento"
    }
]

// verificando id do usuário
async function VerifyUserPermission(token_decodificado) {
    const id_user_tela = token_decodificado.user_id

    if (id_user_tela) {
        // significa que o tipo do usuário não permite ele acessar essa tela
        const resp = await verificarTipoUsuario(token_decodificado.user_id);
//  //          console.log("O tipo do usuário: ", resp.nome_tipo);

        if (resp.nome_tipo !== setores_permission[0].setor & 
            resp.nome_setores[0] !== setores_permission[1].setor & 
            resp.nome_setores[0] !== setores_permission[2].setor
        ) {
            window.location.href = "../index.html";
            
        } else {
//              console.log("Usuário certo")
        }
    }

//      console.log("Usuário da tela: ", id_user_tela)
}
VerifyUserPermission(token_decodificado)


//  console.log("O token decodificado: ", token_decodificado)

// verificando o token que chegou
function VerificarToken(token, refresh) {

    const url = url_base + "cortex/api/token/verify/";

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
//              console.log("O token foi aceito")
        })
        .catch(error => {
            // Lidar com erros
            //console.error("Ocorreu um erro ao verificar o token: ", error.message);
            
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
    const url = url_base + "cortex/api/token/refresh/";

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

//                  console.log('Novo token de acesso: ', novoTokenDeAcesso)
//                  // console.log('Novo refresh: ', novoRefresh)

                // recarrega a tela
                window.location.reload()
            } 
            else {
                // refresh inválido
                throw new Error("Erro ao acessar o novo token")
                window.location.reload()
            }
        })
        .catch(error => {
            // Lidar com erros
            //console.error("Ocorreu um erro ao consumir o refresh token: ", error);

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


function getQueryParameter(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
  
const id_rota = getQueryParameter('rota');

let editando = false;


async function editVerify() {
    if (id_rota !== null) {
        const iconContainer = document.querySelector(".icon-container");
        const loadingIcon = document.createElement('i');
        const frase = document.createElement('h1');
        frase.innerHTML = "Carregando rota..."

        loadingIcon.classList.add('fas', 'fa-spinner', 'fa-spin', 'loading-icon');
        iconContainer.appendChild(loadingIcon)
        iconContainer.appendChild(frase)

        const texto = document.getElementById('text-criar-rota');
        texto.textContent = "Editar rota"

        const botao = document.getElementById('botao');
        botao.textContent = "Cadastrar alterações"

        async function GetRota() {
            // url da requisição
            const url = url_base + `cortex/api/soticon/v1/rotas_automaticas/${id_rota}/`;
        
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

                return data;
        
            } catch (erro) {
                //console.error("Erro durante a requisição das rotas do dia: ", erro.message);
                window.location.reload()
            }
        }

        async function PreencherFormulário() {
            try{
                const rota = await GetRota();

                if (rota) {
                    document.getElementById('obs').value = rota.obs || '';                   
                    document.getElementById('status').value = rota.status || '';      
                    document.getElementById('horario').value = rota.horario || '';
                    
                }

                iconContainer.removeChild(loadingIcon);
                iconContainer.removeChild(frase)
            } catch (erro) {
                console.error("Erro ao carregar a rota no formulário: ", erro.message);
            }
            
        }
        PreencherFormulário()

        editando = true;
    }
}

editVerify()

function formatarHorario(horario) {
    const partes = horario.split(':');
    
    if (partes.length === 3) {
        return `${partes[0]}:${partes[1]}`;
    } else {
        return horario;
    }
}



const cadastrarButton = document.getElementById("botao");
const form = document.getElementById("formulario")

cadastrarButton.addEventListener("click", function(e) {
    e.preventDefault()

    const detalhes_rota = document.getElementById("obs").value;
    const status = document.getElementById("status").value;
    const horario = formatarHorario(document.getElementById("horario").value);


//      console.log("Dados do form: ", {detalhes_rota, dataFormatada, status, horario})

    if (detalhes_rota !== "" && status !== "" && horario !== "") {
        // Crie o ícone de carregamento linear
        const loadingIcon = document.createElement('i');
        loadingIcon.classList.add('fas', 'fa-sync-alt', 'fa-spin', 'loading-icon');
        loadingIcon.style.fontSize = "16px"

        // Adicione o ícone ao botão
        cadastrarButton.innerHTML = '';
        cadastrarButton.appendChild(loadingIcon);
        
        cadastrarRotas(detalhes_rota, status, horario)
            .then(() => {
                // Limpar os campos do formulário
                document.getElementById("obs").value = "";
                document.getElementById("status").value = "";
                document.getElementById("horario").value = "";

                cadastrarButton.classList.add("success-animation");
                if (editando) {
                    window.alert("Rota atualizada com sucesso!")
                    window.location.href = "listar_rotas.html";
                } else {
                    window.alert("Rota cadastrada com sucesso!")
                    window.location.href = "cadastrarRotas.html";
                }
                
            })
            .catch(error => {
                cadastrarButton.classList.add("error-animation");
                window.alert("Erro ao cadastrar rotas!")
            })
            .finally(() => {
                // Remover o ícone de carregamento
                cadastrarButton.removeChild(loadingIcon)
                cadastrarButton.innerHTML = 'Cadastrar rotas';

                setTimeout(() => {
                    cadastrarButton.classList.remove("success-animation", "error-animation");
                }, 3000); // Tempo em milissegundos
            })
    } else {
        //console.error("Preencha os campos do formulário!");
        window.alert("Obrigatório preencher todos os campos do formulário!");
    }
})


// cadastra as novas rotas
async function cadastrarRotas(detalhes_rota, status, horario) {
    let url = url_base + "cortex/api/soticon/v1/criar_rotas_automaticas/";

    // Obtém os dados do formulário
    const formData = {
        is_ativo : true,
        obs: detalhes_rota,
        status: status,
        horario: horario
    };
    
    let options;
    // Configurando a solicitação
    if(!editando) {
        options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        };
    }
    else {
        url = url_base + `cortex/api/soticon/v1/rotas_automaticas/${id_rota}/`;

        options = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        };
    }
    

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error("Erro ao enviar dados do formulário");
        }
        const data = await response.json();
        console.log("Resposta do servidor:", data);
        // Processa a resposta do servidor, se necessário
    } catch (error) {
        console.error("Erro durante a requisição:", error);
        throw error; // Propagar o erro para o chamador, se necessário
    }
};

// retorna varias infos do user, inclusive o tipo
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
//  //          console.log("Aqui está o usuário: ", data);
        return data;

    } catch (error) {
        //console.error("Erro durante a requisição dos usuários: ", error.message);
    }
}

// verifica a estrutura do token
function verifyTokenPattern(token) {
    // Verificar se o token está no formato correto '{{Token valor}}'
    return /^{{Token .+}}$/.test(token);
}

function redirecionarSeNecessario() {
    const token = localStorage.getItem('token');

    if (token) {
        if (verifyTokenPattern(token)) {
            // Remover token do localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken')
            // Redirecionar para a página de índice
            window.location.href = "./index.html";
        }
    }
}
// Chamada para verificar e redirecionar
redirecionarSeNecessario();

