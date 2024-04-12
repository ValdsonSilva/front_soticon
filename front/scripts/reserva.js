//Função para mostrar a data da rota do ônibus no formato dd/mm/aaaa
const data = document.querySelectorAll(".data");
window.onload = function() {
    const minhadata = new Date();
    const dia = minhadata.getDate();
   
    const mes = minhadata.getMonth() + 1;
    const ano = new Date().getUTCFullYear();

    for (var i = 0; i < data.length; i++) {
        data[i].innerText = `Data:${dia}/${mes}/${ano}`

        if (dia < 10){
            data[i].innerText = `Data:0${dia}/${mes}/${ano}`
    
            if (mes < 10){
                data[i].innerText = `Data:0${dia}/0${mes}/${ano}`
            }
        }
    
        if (mes < 10){
            data[i].innerText = `Data:${dia}/0${mes}/${ano}`
    
            if (dia < 10){
                data[i].innerText = `Data:0${dia}/0${mes}/${ano}`
            }
        }
    }
}

//Função para mostrar o dia da semana
const dia = document.querySelectorAll(".dia");
function Dayweek() {
    const Dia = new Date().getDay();

    for (var i = 0; i < dia.length; i++){
        dia[i].innerText = `${Dia}`

        switch (Dia) {
            case 1:
                dia[i].innerText = `Segunda-feira`
                break
            case 2:
                dia[i].innerText = `Terça-feira`
                break
            case 3:
                dia[i].innerText =  `Quarta-feira`
                break
            case 4:
                dia[i].innerText = `Quinta-feira`
                break
            case 5:
                dia[i].innerText = `Sexta-feira`
                break
            case 6:
                dia[i].innerText = `Sábado`
                break
            default:
                dia[i].innerText = `Dia inválido`
        }
    }
}
//Chamando a função do dia da semana
Dayweek();

// document.getElementB("bo").addEventListener("click", function(event) {
//     event.preventDefault(); //impede o envio do form
// });


//Setando o conteúdo do botão ao clicar
const Botao = document.querySelector("#bo");
const Posicao = document.querySelector(".Posicao")
let estadoBotao = false;
Botao.addEventListener("click", () => {
       
       if (estadoBotao) {
           Botao.innerText = "+"
           Botao.setAttribute("style", "");
        //    Posicao.innerText = "";

       } else {
            Botao.innerText = `-`
        
            Botao.setAttribute("style", "none; display: grid; place-content: center;")

            // Posicao.innerText = "Posição 23/58"
       }
       
       //Aqui invertemos o estado do botão
       estadoBotao = !estadoBotao;

       console.log("Tá dando certo aqui cara, o problema é ai fora!")
});


// lógica de reserva de ticket

// todos os botões de class bo
const botoes = document.querySelectorAll(".bo")

botoes.forEach((botoes) => {
    botoes.addEventListener("click", () => {
        if (botoes.classList.contains("c1")){
            alert("botão 12")
        }
        else if (botoes.classList.contains("c2")){
            alert("botão 18")
        }
        else if (botoes.classList.contains("c3")){
            alert("botão 22")
        }
    })
})

