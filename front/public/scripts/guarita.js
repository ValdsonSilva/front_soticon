const url_base = window.env.URL_BASE



const token = localStorage.getItem('token') ? localStorage.getItem('token') : window.location.href = "../index.html";
const refresh = localStorage.getItem('refreshToken') ? localStorage.getItem('refreshToken') : window.location.href = "../index.html";


function decodeToken(token) {
    const payload = token.split('.')[1]
    const decodeToken = atob(payload);
    return JSON.parse(decodeToken);
}
const token_decodificado = decodeToken(token)


async function VerifyUserPermission(token_decodificado) {
    const id_user_tela = token_decodificado.user_id

    if (id_user_tela) {
        
        const resp = await verificarTipoUsuario(token_decodificado.user_id);


        if (resp.nome_tipo !== "admin" & resp.nome_setores[0] !== "Guarita") {
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


const logout_elemenst = document.querySelectorAll(".retornar")
logout_elemenst.forEach(function(element) {
    element.addEventListener("click", function(){
        for (var i = 0; i < logout_elemenst.length; i++){
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem("id_rota")
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


function DayData() {
    const minhadata = new Date();
    const dia = minhadata.getDate() + 1;
    const mes = minhadata.getMonth() + 1;
    const ano = minhadata.getFullYear();

    const diaStr = dia < 10 ? `0${dia}` : `${dia}`;
    const mesStr = mes < 10 ? `0${mes}` : `${mes}`;

    
    return `${diaStr}-${mesStr}-${ano}`;
}

function listarRotasDoDia() {
    const url = url_base + `cortex/api/soticon/v1/rotas/?data=${DayData()}&status=${'espera'}`;


    const loader = document.getElementById('loader');
    loader.style.display = 'block'; 

    const options = {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${localStorage.getItem('token')}`
        }
    }

    fetch(url, options)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Erro ao carregar rotas do dia: " + response.status);
            }
            return response.json()
        })
        .then((data) => {

            const rotas = data.results
            
            exibirRotas(rotas)
            return data.results

        })
        .catch ((error) => {

        })
        .finally(() => {
            loader.style.display = "none"
        })
}


async function exibirRotas(rotas) {
    const container = document.querySelector('.container');

    
    container.innerHTML = '';

    await rotas.forEach(rota => {
        const caixa = document.createElement('div');
        caixa.classList.add('caixa');

        const dia = document.createElement('p');
        dia.classList.add('dia');
        dia.textContent = Dayweek(rota.data);

        const data = document.createElement('p');
        data.classList.add('data');
        data.textContent = formatDate(rota.data);

        const horario = document.createElement('p');
        horario.classList.add('horario');
        horario.textContent = `Ônibus das ${rota.horario}h`;

        const containerButton = document.createElement('div');
        containerButton.classList.add('botao');

        const btnMonitorar = document.createElement('button');
        
        btnMonitorar.classList.add('bo' + rota.id)
        
        btnMonitorar.textContent = 'Monitorar';

        
        btnMonitorar.addEventListener("click", function(event) {

            

            if (rota.id !== '_disable') {
                avancarTela(rota.id);
            }
        })

        containerButton.appendChild(btnMonitorar); 

        caixa.appendChild(dia);
        caixa.appendChild(data);
        caixa.appendChild(horario);
        caixa.appendChild(containerButton); 

        container.appendChild(caixa);
    });

    if (rotas.length === 0) {


        const mensagem = document.createElement("div")
        mensagem.textContent = "Não há rotas disponiveis no sistema!";
        mensagem.style.fontSize = "4vw";
        mensagem.style.color = "#fff";

        container.appendChild(mensagem)
    }
}
listarRotasDoDia();


function formatDate(dateString) {
    const parts = dateString.split('-');
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    return `${day}/${month}/${year}`;
}


function Dayweek(data) {
    const diasSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    const dia = new Date(data).getDay();
    return diasSemana[dia + 1];
}


function avancarTela(id) {
    const url = `../pages/verificacao.html?id=${id}`
    localStorage.setItem('id_rota', id)
    window.location.href = url
}