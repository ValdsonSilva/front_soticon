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

async function getStatusRota(id_rota) {
    let baseUrl = url_base + `cortex/api/soticon/v1/rotas/${id_rota}/`;
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
            throw new Error("Erro ao dados da rota" + error.status);
        }
        const data = await response.json();

        if (data.status === "espera") {
            return true;
        } else {
            return false;
        }

    } catch (error) {

        window.alert("Erro ao carregar tickets da rota!")
    }
}

async function getTicketsRota(id_rota) {

    let rota_valida = await getStatusRota(id_rota);

    if (!rota_valida) {
        return "vazia";
    }

    let baseUrl = url_base + `cortex/api/soticon/v1/tickets/?rota_valida=${id_rota}`;
    if (window.location.href.includes("espera.html")) {
        baseUrl += `&faltantes=${true}&limit=100`;
    }
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

        if (tickets==="vazia"){
            window.alert("A rota está fechada!")
            window.location.href = "./guarita.html";
            return;
        }

        containerPai.innerHTML = '';

        if (!(window.location.href.includes("espera.html"))) {
            await getContagem(id_rota);
        
            contagemTickets = document.getElementById('p-total-tickets');

            contagemTickets.textContent = `Tickets passados: ${tickets_usados}/${tickets_totais}`;
        }

        tickets.forEach((ticket, index) => {
            
            const container = document.createElement('div');
            container.classList.add('container3');
    
            const fotoCaixa = document.createElement('figure');
            fotoCaixa.classList.add('fotocaixa');
    
            const fotoAluno = document.createElement('img');
            fotoAluno.src = '#' 
            fotoAluno.alt = 'Foto do aluno';
    
            const cont1 = document.createElement('div');
            cont1.classList.add('cont1');
    
            const nomeAluno = document.createElement('h3');
            nomeAluno.textContent = ticket.nome;
    
            const posicao = document.createElement('p');
            posicao.textContent = `Posição ${ticket.posicao_fila}`;
    
            const cont2 = document.createElement('div');
            cont2.classList.add('cont2');
    
            const status = document.createElement('div');
            status.classList.add('status');
            status.textContent = ticket.usado & ticket.reservado ? "Usado" : "Pendente"; 
            status.style.backgroundColor = ticket.usado & ticket.reservado ? "green" : "#394538";

            if (window.location.href.includes("espera.html") & (!ticket.usado)) {
                const buttonPassar = document.createElement('button');
                buttonPassar.classList.add('passar');
                buttonPassar.textContent = "Passar";
              
                buttonPassar.addEventListener("click", async function() {
                  
                  await verificaTicketPeloBotao(ticket.id, buttonPassar);
                });
              
                
                cont2.appendChild(buttonPassar); 
            }

            if (index === 0 && !window.location.href.includes("espera.html") & (!ticket.usado)) {
                const buttonPassar = document.createElement('button');
                buttonPassar.classList.add('passar');
                buttonPassar.textContent = "Passar";
              
                buttonPassar.addEventListener("click", async function() {
                  
                  await verificaTicketPeloBotao(ticket.id, buttonPassar);
                });
              
                
                cont2.appendChild(buttonPassar); 


                const buttonFaltante = document.createElement('button');
                buttonFaltante.classList.add('faltante');
                buttonFaltante.textContent = "Faltou";
              
                buttonFaltante.addEventListener("click", async function() {
                  
                  await declararFaltante(ticket.id, buttonFaltante);
                });
              
                
                cont2.appendChild(buttonFaltante); 
            }
              

            
            fotoCaixa.appendChild(fotoAluno);
            cont1.appendChild(nomeAluno);
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


document.getElementById("formulario").addEventListener("submit", function(event) {
    
    event.preventDefault();

    
    var cpf = document.getElementById("idUsuario").value;
    
    const cpf_formatado = limparCPF(cpf)

    const botao = document.querySelector(".proximo")

    
    if (!botao.hasAttribute('data-original-content')) {
        botao.setAttribute('data-original-content', botao.innerHTML);
    }

    botao.innerHTML = '';

    const loadingIcon = document.createElement('i');
    loadingIcon.classList.add('fas', 'fa-spinner', 'fa-spin', 'loading-icon');
    loadingIcon.style.fontSize = "2em";
    loadingIcon.style.color = 'white';
    botao.appendChild(loadingIcon);


    if (cpf_formatado.length < 6) {
        window.alert("Informe no mínimo 6 digitos!");
        document.getElementById("idUsuario").value = "";
        const botao = document.querySelector(".proximo");
        const originalContent = botao.getAttribute('data-original-content');
        botao.innerHTML = originalContent;
        
    } else {
        
        associarCPFaoTicket(id_rota_path, cpf_formatado)
        .then((ticket) => {
            if (ticket) {

                verificaTicket(ticket)

            } else {
                throw new Error("Nenhum ticket associado encontrado para o CPF fornecido.", error);
            }
        })
        .catch((error) => {

            window.alert("Ticket não encontrado nas pendências!")
        })
        .finally(() => {
            document.getElementById("idUsuario").value = "";
            const botao = document.querySelector(".proximo");
            const originalContent = botao.getAttribute('data-original-content');
            botao.innerHTML = originalContent;
        })
    }

})

var botao_finalizar_rota = document.querySelector(".finalizar")

botao_finalizar_rota.addEventListener("click", async function() {
    const url = url_base + `cortex/api/soticon/v1/finalizar_rota/${id_rota_path}`
    
    const data = {
        status : "executada",
        obs: "Rota finalizada"
    }

    const options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
    };

    
    if (!botao_finalizar_rota.hasAttribute('data-original-content')) {
            botao_finalizar_rota.setAttribute('data-original-content', botao_finalizar_rota.innerHTML);
    }

    botao_finalizar_rota.innerHTML = "";

    const loadingIcon = document.createElement('i');
    loadingIcon.classList.add('fas', 'fa-spinner', 'fa-spin', 'loading-icon');
    loadingIcon.style.fontSize = "2em";
    loadingIcon.style.color = 'black';
    botao_finalizar_rota.appendChild(loadingIcon)

    try {
        const response = await fetch(url, options)
        if (!response.ok) {
            throw new Error(`Erro ao finalizar rota: ${response.status}`);
        }
        const data = await response.json()
        window.alert("Rota finalizada!");
        avancarTela(id_rota_path);
        return data
    } catch (error) {

        window.alert("Erro ao finalizar rota!")
    } finally {

        const originalContent = botao_finalizar_rota.getAttribute('data-original-content');
        botao_finalizar_rota.innerHTML = originalContent;
    }
})

function avancarTela(id) {
    const url = `../pages/relatorio_final.html?id=${id}`
    localStorage.setItem('id_rota', id)
    window.location.href = url
}


async function associarCPFaoTicket(id_rota_path, cpf) {
    try {
        
        const tickets = await getTicketsRota(id_rota_path);
        
        const ticket_aluno_encontrado = tickets.find(
            (ticket) => ticket.cpf.startsWith(cpf.substring(0, 6)) && ticket.usado === false
        );
        
        
        return ticket_aluno_encontrado;
    } catch (error) {
        

        window.alert("Reserva não encontrada!")
        throw error; 
    }
}


async function verificaTicket(ticket) {


    if (window.location.href.includes("espera.html")) {
        var url = url_base + `cortex/api/soticon/v1/tickets/verificar_tickets_faltantes/${ticket.id}/`;
    } else {
        var url = url_base + `cortex/api/soticon/v1/tickets/verificar_tickets/${ticket.id}/`;
    }

    const options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${localStorage.getItem('token')}`
        },
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const data = await response.json();
            
            if (data.posicao_esperada) {
                const erro = `Aluno fora de Ordem!\n\nPosição esperada: ${data.posicao_esperada}\nPosição passada: ${data.posicao_passada}`;
                window.alert(erro);
            }
            throw new Error(`${response.status}, ${data.posicao_esperada}`);
        }
        const data = await response.json();
    
        return data;
    
    } catch (error) {

    
        
        if (error.message.includes("404") || error.message.includes("401")) {
            window.alert("Ticket não localizado!");
        }
    } finally {
        
        window.location.reload();
    }
}


async function verificaTicketPeloBotao(id_ticket, botao) {
        botao.innerHTML = "carregando..."

        if (window.location.href.includes("espera.html")) {
            var url = url_base + `cortex/api/soticon/v1/tickets/verificar_tickets_faltantes/${id_ticket}/`;
        } else {
            var url = url_base + `cortex/api/soticon/v1/tickets/verificar_tickets/${id_ticket}/`;
        }

        const options = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : `Bearer ${localStorage.getItem('token')}`
            },
            
        };
    
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const data = await response.json();

                throw new Error(`${response.status}, ${data.posicao_esperada}`);
            }
            const data = await response.json();
        
            return data;
        
        } catch (error) {
            
            if (error.message.includes("404") || error.message.includes("401")) {
                window.alert("Ticket não localizado!");
            }
        } finally {
            
            botao.innerHTML = "..."
            window.location.reload();
        }
}


function limparCPF(cpf) {
    
    return cpf.replace(/\D/g, '');
}


async function declararFaltante(id_ticket, botao) {


        botao.innerHTML = "carregando..."
    
        const url = url_base + `cortex/api/soticon/v1/tickets/aluno_faltante/${id_ticket}/`
    
        const options = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : `Bearer ${localStorage.getItem('token')}`
            },
            
        };
    
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`Erro ao declarar como faltante: ${response.status}`);
            }
            const data = await response.json();
        
            return data;
        
        } catch (error) {


            if (error.message.includes("400")) {
                window.alert("O usuário já usou o ticket.")
            }
            
            if (error.message.includes("404")) {
                window.alert("Usuário não localizado\tUsuário não possui reserva\tRota não localizada.");
            }
           
            if (error.message.includes("500")) {
                window.alert("Erro interno.")
            }

        } finally {
            botao.innerHTML = "..."
            window.location.reload();
        }
}