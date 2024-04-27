const url_base = "https://web-5gnex1an3lly.up-us-nyc1-k8s-1.apps.run-on-seenode.com/";

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
                window.location.reload()
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


const cadastrarButton = document.getElementById("botao");
const form = document.getElementById("formulario")

cadastrarButton.addEventListener("click", function(e) {
    e.preventDefault()

    const detalhes_rota = document.getElementById("obs").value;
    const data = document.getElementById("data").value;
    const status = document.getElementById("status").value;
    const horario = document.getElementById("horario").value;


    const dataSelecionada = new Date(data);
    const ano = dataSelecionada.getFullYear();
    let mes = dataSelecionada.getMonth() + 1;
    let dia = dataSelecionada.getDate()

    // Adiciona um zero à esquerda se o mês ou o dia for menor que 10
    mes = mes < 10 ? "0" + mes : mes;
    dia = dia < 10 ? "0" + dia : dia;

    // Formata a data no formato "yyyy-mm-dd"
    const dataFormatada = `${ano}-${mes}-${dia}`;

    console.log("Dados do form: ", {detalhes_rota, dataFormatada, status, horario})

    if (detalhes_rota !== "" && dataFormatada !== "" && status !== "" && horario !== "") {
        // Crie o ícone de carregamento linear
        const loadingIcon = document.createElement('i');
        loadingIcon.classList.add('fas', 'fa-sync-alt', 'fa-spin', 'loading-icon');

        // Adicione o ícone ao botão
        cadastrarButton.innerHTML = '';
        cadastrarButton.appendChild(loadingIcon);
        
        cadastrarRotas(detalhes_rota, dataFormatada, status, horario)
            .then(() => {
                // Limpar os campos do formulário
                document.getElementById("obs").value = "";
                document.getElementById("data").value = "";
                document.getElementById("status").value = "";
                document.getElementById("horario").value = "";

                cadastrarButton.classList.add("success-animation");
                window.alert("Rota cadastrada com sucesso!")
            })
            .catch(error => {
                console.error("Erro ao enviar dados do formulário:", error);
                // Tratar erros de forma apropriada, como exibir uma mensagem de erro ao usuário
                // Adicione uma classe CSS para indicar falha
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
        console.error("Preencha os campos do formulário!");
        window.alert("Obrigatório preencher todos os campos do formulário!");
    }
})



async function cadastrarRotas(detalhes_rota, data, status, horario) {
    const url = url_base + "api/soticon/v1/rotas/";

    // Obtém os dados do formulário
    const formData = {
        obs: detalhes_rota,
        data: data,
        status: status,
        horario: horario
    };

    // Configurando a solicitação
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
    };

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


// Rota da manhã