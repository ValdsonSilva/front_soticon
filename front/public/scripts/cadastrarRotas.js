const url_base = window.env.URL_BASE


const token = localStorage.getItem('token') ? localStorage.getItem('token') : window.location.href = "../index.html";
const refresh = localStorage.getItem('refreshToken') ? localStorage.getItem('refreshToken') : window.location.href = "../index.html";


function decodeToken(token) {
    const payload = token.split('.')[1]
    const decodeToken = atob(payload);
    return JSON.parse(decodeToken);
}
const token_decodificado = decodeToken(token)


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


async function VerifyUserPermission(token_decodificado) {
    const id_user_tela = token_decodificado.user_id

    if (id_user_tela) {
        
        const resp = await verificarTipoUsuario(token_decodificado.user_id);


        if (resp.nome_tipo !== setores_permission[0].setor & 
            resp.nome_setores[0] !== setores_permission[1].setor & 
            resp.nome_setores[0] !== setores_permission[2].setor
        ) {
            window.location.href = "../index.html";
            
        } else {

        }
    }


}
VerifyUserPermission(token_decodificado)





function VerificarToken(token, refresh) {

    const url = url_base + "cortex/api/token/verify/";

    
    const data = {
        token: token
    };

    
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    
    fetch(url, options)
        .then(response => {
            
            if (!response.ok) {
                throw new Error("Erro ao verificar o token: " + response.status);
            }
            

        })
        .catch(error => {
            

            
            
            if (error.message.includes('401')) {
                
                ConsumirRefreshToken(refresh);
            }
            
            window.location.href = "../index.html"
        })
}

VerificarToken(token, refresh)


let novoTokenDeAcesso;
let novoRefresh;

function ConsumirRefreshToken(refresh) {

    
    const url = url_base + "cortex/api/token/refresh/";

    
    const data = {
        refresh: refresh
    };

    
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }

    
    fetch(url, options)
        .then(response => {
            if (!response.ok) {
                throw new Error("Erro ao consumir o refresh token: " + response.status);
            }
            
            return response.json();
        })
        .then(data => {
            
            if (data.access){
                
                novoTokenDeAcesso = data.access;
                novoRefresh = data.refresh

                
                localStorage.setItem('token', novoTokenDeAcesso)




                
                window.location.reload()
            } 
            else {
                
                throw new Error("Erro ao acessar o novo token")
                window.location.reload()
            }
        })
        .catch(error => {
            


            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')

            
            if (error.message.includes('401') || error.message.includes('403')) {
                
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

    const ano = dataSelecionada.getUTCFullYear();
    let mes = dataSelecionada.getUTCMonth() + 1;
    let dia = dataSelecionada.getUTCDate();

    
    mes = mes < 10 ? "0" + mes : mes;
    dia = dia < 10 ? "0" + dia : dia;

    
    const dataFormatada = `${ano}-${mes}-${dia}`;



    if (detalhes_rota !== "" && dataFormatada !== "" && status !== "" && horario !== "") {
        
        const loadingIcon = document.createElement('i');
        loadingIcon.classList.add('fas', 'fa-sync-alt', 'fa-spin', 'loading-icon');

        
        cadastrarButton.innerHTML = '';
        cadastrarButton.appendChild(loadingIcon);
        
        cadastrarRotas(detalhes_rota, dataFormatada, status, horario)
            .then(() => {
                
                document.getElementById("obs").value = "";
                document.getElementById("data").value = "";
                document.getElementById("status").value = "";
                document.getElementById("horario").value = "";

                cadastrarButton.classList.add("success-animation");
                window.alert("Rota cadastrada com sucesso!")
            })
            .catch(error => {

                
                
                cadastrarButton.classList.add("error-animation");
                window.alert("Erro ao cadastrar rotas!")
            })
            .finally(() => {
                
                cadastrarButton.removeChild(loadingIcon)
                cadastrarButton.innerHTML = 'Cadastrar rotas';

                setTimeout(() => {
                    cadastrarButton.classList.remove("success-animation", "error-animation");
                }, 3000); 
            })
    } else {

        window.alert("Obrigatório preencher todos os campos do formulário!");
    }
})



async function cadastrarRotas(detalhes_rota, data, status, horario) {
    const url = url_base + "cortex/api/soticon/v1/rotas/";

    
    const formData = {
        is_ativo : true,
        obs: detalhes_rota,
        data: data,
        status: status,
        horario: horario
    };

    
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

        
    } catch (error) {

        throw error; 
    }
};


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

        return data;

    } catch (error) {

    }
}


function verifyTokenPattern(token) {
    
    return /^{{Token .+}}$/.test(token);
}

function redirecionarSeNecessario() {
    const token = localStorage.getItem('token');

    if (token) {
        if (verifyTokenPattern(token)) {
            
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken')
            
            window.location.href = "./index.html";
        }
    }
}

redirecionarSeNecessario();

const carregar_rotas = async () => {
    const url = url_base + "cortex/api/soticon/v1/rotas/";

    
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error("Erro ao enviar dados do formulário");
        }
        const data = await response.json();

        return data.results
        
    } catch (error) {

        throw error; 
    }
}

carregar_rotas()
