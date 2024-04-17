const diasDaSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const diaSemanaAtual = new Date().getDay();
const diaSemana = diasDaSemana[diaSemanaAtual];
document.getElementById("diaSemana").textContent = diaSemana ;

const dataAtual = new Date();
const dia = dataAtual.getDate();
const mes = dataAtual.getMonth() + 1;
const ano = dataAtual.getFullYear();

const diaAtualElement = document.getElementById("diaAtual");
diaAtualElement.textContent = `${dia}/${mes}/${ano}`;



