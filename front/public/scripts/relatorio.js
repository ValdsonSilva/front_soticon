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


async function criarTabelaRelatorio(data_inicial, data_final) {
    // Verifica se o parâmetro "dia" foi passado
    if (!data_inicial) {
        alert("Por favor, forneça uma data para buscar as rotas.");
        return;
    }

    let rotas_pesquisadas = [];
    try {

        // Obtém as rotas para o dia solicitado
        const rotas = await listarRotas(data_inicial, data_final);

        rotas_pesquisadas = rotas

        // Filtra as rotas para obter apenas aquelas que correspondem ao dia
        if (!rotas && rotas.length < 0) {
            
            alert("Não há rotas armazenadas para o periodo: " + `"${data_inicial}-${data_final}"`);
        }
    } catch (error) {
        alert("Erro interno ao obter rotas.");
        console.error(error);
    }

    // Limpa o corpo da tabela
    const tabelaBody = document.getElementById("tabela-body");
    tabelaBody.innerHTML = "";

    // Verifica se há rotas pesquisadas para exibir
    for (const rota of rotas_pesquisadas) {
        try {
            const detalhesRota = await relatorio_rotas(rota.id); // Obtém dados específicos para cada rota

            if (detalhesRota && detalhesRota.emitidos !== undefined) {
                let row = document.createElement('tr');
                row.innerHTML = `
                    <td>${formatDate(detalhesRota.data) + "/" + detalhesRota.horario}</td>
                    <td>${detalhesRota.emitidos}</td>
                    <td>${detalhesRota.confirmados}</td>
                    <td>${detalhesRota.faltantes}</td>
                    <td>${detalhesRota.sem_ticket}</td>
                    <td>${detalhesRota.total}</td>
                    <td>
                        <a href="../pages/relatorio_final.html?id=${rota.id}">
                            Ver mais
                        </a>
                    </td>
                `;
                tabelaBody.appendChild(row);
                
            }  else {
                // Exibe uma linha alternativa se detalhes da rota estiverem ausentes
                let row = document.createElement('tr');
                row.innerHTML = `
                    <td colspan="7" style="text-align:center;">Dados da rota do periodo de ${data_inicial} a ${data_final} não disponíveis</td>
                `;
                tabelaBody.appendChild(row);
            }

        } catch (error) {
            console.error("Erro ao obter detalhes da rota:", error);
            let row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="7" style="text-align:center;">Erro ao carregar detalhes para a rota de periodo de ${data_inicial} a ${data_final}!</td>
            `;
            tabelaBody.appendChild(row);
        }
    } 

    if (rotas_pesquisadas.length === 0) {
        // Se nenhuma rota for encontrada, exibe uma mensagem informativa
        let row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="7" style="text-align:center;">Nenhuma rota encontrada para o periodo ${data_inicial} a ${data_final}!</td>
        `;
        tabelaBody.appendChild(row);
    }
}



const filter_form = document.querySelector("#filter_form");

filter_form.addEventListener("submit", async function(event) {
    event.preventDefault()

    const data_inicial = document.getElementById("data_ini").value;
    const data_final = document.getElementById("data_fim").value;

    await criarTabelaRelatorio(data_inicial, data_final)
});


const gerarPDF = document.querySelector("#pdf")
gerarPDF.addEventListener("click", function() {
    const { jsPDF } = window.jspdf;
    const tabela = document.querySelector('.listagem'); // Seleciona o elemento da tabela que deseja capturar

    html2canvas(tabela,{ scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png'); // Converte a tabela para imagem
        const pdf = new jsPDF("p", "mm", "a4");

        pdf.text("Tabela de Resumo de Embarques", 10, 20)

        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width; // Mantém a proporção da imagem

        pdf.addImage(imgData, 'PNG', 10, 30, imgWidth, imgHeight); // Ajusta a imagem centralizada
        pdf.save(`Tabela_Resumo_Embarques.pdf`); // Salva o PDF com o nome especificado
    });
})

async function relatorio_rotas(id) {
    const url = url_base + `cortex/api/soticon/v1/relatorio_rotas/${id}/`;

    const options = {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${localStorage.getItem('token')}`
        }
    }


    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error('Erro ao buscar relatório da rota');
        }
        const rotas = await response.json();
        return rotas; // Certifique-se de que está retornando os dados aqui
    } catch (error) {
        console.error("Erro ao listar relatório da rota:", error);
        return []; // Retorne um array vazio ou trate o erro de outra forma
    }
}

async function listarRotas(data_inicial, data_final) {

    const url = url_base + `cortex/api/soticon/v1/rotas/?data_inicial=${data_inicial}&data_final=${data_final}&status=executada`;

    const options = {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${localStorage.getItem('token')}`
        }
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error('Erro ao buscar rotas');
        }
        const rotas = await response.json();
        return rotas.results; // Certifique-se de que está retornando os dados aqui
    } catch (error) {
        console.error("Erro ao listar rotas:", error);
        return []; // Retorne um array vazio ou trate o erro de outra forma
    }
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
            throw new Error("Erro ao puxar os usuários" + response.status);
        }
        const data = await response.json();
        console.log(data)
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

function formatDate(dateString) {
    const parts = dateString.split('-');
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    return `${day}-${month}-${year}`;
}