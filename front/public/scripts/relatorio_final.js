const url_base = window.env.URL_BASE 

const token = localStorage.getItem('token') ? localStorage.getItem('token') : window.location.href = "../index.html";
const refresh = localStorage.getItem('refreshToken') ? localStorage.getItem('refreshToken') : window.location.href = "../index.html";


var path = new URLSearchParams(window.location.search);
var id_rota = path.get('id')

var id_rota_localstorage = localStorage.getItem('id_rota')

var id_rota_path = id_rota ? id_rota : id_rota_localstorage;


function decodeToken(token) {
    const payload = token.split('.')[1]
    const decodeToken = atob(payload);
    return JSON.parse(decodeToken);
}

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

const token_decodificado = decodeToken(token)



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

let tickets_totais = 0;
let tickets_usados = 0;

async function getContagem(id_rota) {
    let baseUrl = url_base + `cortex/api/soticon/v1/tickets/?rota=${id_rota}&contagem=true`;
    const url = baseUrl;

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
            throw new Error("Erro ao puxar os tickets da rota" + error.status);
        }

        const data = await response.json();

        tickets_totais = data.total;
        tickets_usados = data.usados;

    } catch (error) {
        window.alert("Erro ao carregar tickets da rota!")
    }
}


async function getTicketsRota(id_rota) {

    let baseUrl = url_base + `cortex/api/soticon/v1/tickets/?rota_valida=${id_rota}&todos=true&limit=100`;
    const url = baseUrl;  

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
            throw new Error("Erro ao puxar os tickets da rota" + error.status);
        }
        const data = await response.json();

        return data.results;

    } catch (error) {
        window.alert("Erro ao carregar tickets da rota!")
    }
}


async function listarTicketsNaPagina(id_rota) {

    const containerPai = document.querySelector('.cont_container3');
    containerPai.innerHTML = '';

    
    const loadingIcon = document.createElement('i');
    loadingIcon.classList.add('fas', 'fa-spinner', 'fa-spin', 'loading-icon');
    loadingIcon.style.fontSize = "6em";
    loadingIcon.style.color = 'white';
    containerPai.appendChild(loadingIcon);

    try {

        const tickets = await getTicketsRota(id_rota);

        await getContagem(id_rota);
        
        containerPai.innerHTML = '';

        contagemTickets = document.getElementById('p-total-tickets');

        contagemTickets.textContent = `Tickets passados: ${tickets_usados}/${tickets_totais}`;

        tickets.forEach((ticket, index) => {
            
            const container = document.createElement('div');
            container.classList.add('container3');
    
            const fotoCaixa = document.createElement('figure');
            fotoCaixa.classList.add('fotocaixa');
    
            const fotoAluno = document.createElement('img');
            if (ticket.foto){
                fotoAluno.src = ticket.foto
            } else{
                fotoAluno.src = '../images/iconuser.png'
            }
            fotoAluno.classList.add('fotoAluno')             
            fotoAluno.alt = 'Foto do aluno';
    
            const cont1 = document.createElement('div');
            cont1.classList.add('cont1');
    
            const nomeAluno = document.createElement('h3');
            nomeAluno.textContent = ticket.nome;

            const deficiencia = document.createElement('img');
            if (ticket.deficiencia) {
                deficiencia.src = "../images/acessibilidade.png";
                deficiencia.alt = "Acessibilidade";
                deficiencia.width = 50;
                deficiencia.height = 50;
            }
    
            const posicao = document.createElement('p');
            posicao.textContent = `Posição ${ticket.posicao_fila}`;
    
            const cont2 = document.createElement('div');
            cont2.classList.add('cont2');
    
            const status = document.createElement('div');
            status.classList.add('status');
            status.textContent = ticket.usado & ticket.reservado ? "Usado" : "Pendente"; 
            status.style.backgroundColor = ticket.usado & ticket.reservado ? "green" : "#394538";
            
            fotoCaixa.appendChild(fotoAluno);
            cont1.appendChild(nomeAluno);
            if (ticket.deficiencia) {
                cont1.appendChild(deficiencia);
                cont1.style.gap = "15px";
            }
            cont1.appendChild(posicao);
            cont2.appendChild(status);
            
            container.appendChild(fotoCaixa);
            container.appendChild(cont1);
            container.appendChild(cont2);
            containerPai.appendChild(container);
        });

        if (tickets.length === 0) {
            const frase = document.createElement("h1")
            frase.textContent = "Não há tickets no momento!"
            frase.style.color = "#fff"
            frase.style.marginTop = "20px"
            containerPai.appendChild(frase)
        }

    } catch(error) {
        console.log(`Erro: ${error}`)
        window.alert("Erro ao carregar tickets da rota")
        const frase = document.createElement("h1")
        frase.textContent = "Não há tickets no momento!"
        frase.style.color = "#fff"
        frase.style.marginTop = "20px"
        containerPai.appendChild(frase)
        
        
    }
}
listarTicketsNaPagina(id_rota_path)


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

const logout_elemenst = document.querySelector(".retornar")
logout_elemenst.addEventListener("click", function() {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('botao_disable_state')
    window.location.href = "../index.html"
})