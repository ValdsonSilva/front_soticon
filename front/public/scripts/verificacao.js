/*<div class="cont_container3">
        <div class="container3">
            <!--Foto do aluno-->
            <figure class="fotocaixa">
                <!--<img src="" alt="foto do aluno">-->
            </figure>

            <!--Nome do aluno e posição no sistema-->
            <div class="cont1">
                <h3>Jõao Ninguém Souza</h3><br>
                <p>Posição 21/58</p>
            </div>
            
            <!--Componente de status(pendente/usado) do ticket 
                durante verificação-->
            <div class="cont2">
                <div class="status">Pendente</div>
            </div>

        </div>
</div>*/

// obter o token do localstorage senão retorna o usuário para tela de login
const token = localStorage.getItem('token') ? localStorage.getItem('token') : window.location.href = "../index.html";
const refresh = localStorage.getItem('refreshToken') ? localStorage.getItem('refreshToken') : window.location.href = "../index.html";

// decodificando o token
function decodeToken(token) {
    const payload = token.split('.')[1]
    const decodeToken = atob(payload);
    return JSON.parse(decodeToken);
}
const token_decodificado = decodeToken(token)


// verificando id do usuário
async function VerifyUserPermission(token_decodificado) {
    const id_user_tela = token_decodificado.user_id

    if (id_user_tela) {
        // significa que o tipo do usuário não permite ele acessar essa tela
        const resp = await verificarTipoUsuario(token_decodificado.user_id);
        console.log("O tipo do usuário: ", resp.nome_tipo);

        if (resp.nome_tipo !== "admin") {
            window.location.href = "../index.html";
            
        } else {
            console.log("Usuário certo")
        }
    }

    console.log("Usuário da tela: ", id_user_tela)
}
VerifyUserPermission(token_decodificado)


/*Retorno da api*/
const respostas = 'retorno da api'


//os comandos serão executados no carregar da tela!
document.addEventListener("DOMContentLoaded", () => {
    //input da tela
    const Input = document.querySelector('input');

    //botão confirmar
    const Botao = document.querySelector('.botao1');

    Botao.addEventListener("click", () => {
        Input.value = '';
    })
})



/*função que irá criar novo componente 
específico com dados de cada aluno que reservou*/
function Dados_ticket_aluno(imagem, nome_aluno, posicao_fila, status_ticket){}


// retorna varias infos do user, inclusive o tipo
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