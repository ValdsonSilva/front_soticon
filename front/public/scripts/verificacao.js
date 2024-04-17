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