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
            data[i].innerText = `Data: 0${dia}/${mes}/${ano}`
    
            if (mes < 10){
                data[i].innerText = `Data: 0${dia}/0${mes}/${ano}`
            }
        }
    
        if (mes < 10){
            data[i].innerText = `Data: ${dia}/0${mes}/${ano}`
    
            if (dia < 10){
                data[i].innerText = `Data: 0${dia}/0${mes}/${ano}`
            }
        }
    }
}