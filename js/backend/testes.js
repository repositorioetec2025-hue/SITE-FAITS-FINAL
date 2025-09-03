const estudantes = require('./estudantes.json');
//ordena lista de estudantes pelo nome 
function ordena(lista, propriedade) {
    return lista.sort((a, b) => {
    if (a[propriedade] < b[propriedade]) return -1;
    if (a[propriedade] > b[propriedade]) return 1;
    return 0;
    })
} 

const listaOrdenada = ordena(estudantes, 'nome');
console.log(listaOrdenada);

//oredena de forma decrescente
function ordenar(lista, propriedade, decrescente = false) {
    return lista.sort((a, b) => {
        let valorA = a[propriedade];
        let valorB = b[propriedade];

        if (typeof valorA === 'string') {
            valorA = valorA.toUpperCase();
        }
        if (typeof valorB === 'string') {
            valorB = valorB.toUpperCase();
        }

        if (valorA < valorB) {
            return decrescente ? 1 : -1;
        }
        if (valorA > valorB) {
            return decrescente ? -1 : 1;
        }
        return 0;
    });
}

// Exemplo de uso para ordenar de forma decrescente pelo nome
const ordenadoNomeDecrescente = ordenar(estudantes, "nome", true);