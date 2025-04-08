const numBarras = 8;
let valores = [];
let passoAtual = null;
let filaPassos = [];
let indicePassoAtual = 0;
let listaHistorico = [];
let indicesDestacados = [];
let indicesDivisao = [];

function criarBarras() {
  const container = document.getElementById("barras");
  container.innerHTML = "";
  valores.forEach((altura, i) => {
    const barra = document.createElement("div");
    barra.className = "barra";
    barra.style.height = altura + "px";
    if (indicesDestacados.includes(i)) {
      barra.style.backgroundColor = "#e74c3c";
    } else if (indicesDivisao.includes(i)) {
      barra.style.backgroundColor = "#f1c40f";
    }
    const rotulo = document.createElement("span");
    rotulo.textContent = altura;
    barra.appendChild(rotulo);
    container.appendChild(barra);
  });
}

function embaralharBarras() {
  valores = Array.from({ length: numBarras }, () =>
    Math.floor(Math.random() * 280 + 20)
  );
  indicesDestacados = [];
  indicesDivisao = [];
  criarBarras();
  filaPassos = [];
  indicePassoAtual = 0;
  listaHistorico = [];
  atualizarHistorico();
  document.getElementById("explicacao").innerText =
    "Vetor embaralhado:\n" + JSON.stringify(valores);
  document.getElementById("controlePasso").style.display = "none";
}

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mostrarExplicacao(texto) {
  const formatarVetorVisual = (array) => {
    const grupos = [];
    let tamanho = array.length;
    while (tamanho % 2 === 0) tamanho /= 2;
    const tamanhoGrupo = array.length / tamanho;
    for (let i = 0; i < array.length; i += tamanhoGrupo) {
      grupos.push(array.slice(i, i + tamanhoGrupo));
    }
    return grupos.map((g) => "[" + g.join(", ") + "]").join("    ");
  };

  const vetorAtual = "Estado atual do vetor:\n" + formatarVetorVisual(valores);
  document.getElementById("explicacao").innerText = texto + "\n\n" + vetorAtual;
  document.getElementById("controlePasso").style.display = "block";

  indicesDestacados = passoAtual?.indices || [];
  indicesDivisao = passoAtual?.divisoes || [];
  criarBarras();
}

function atualizarHistorico() {
  const divHistorico = document.getElementById("historico");
  divHistorico.innerHTML = "<div>Histórico de passos:</div>";

  listaHistorico.forEach((item) => {
    const linha = document.createElement("div");
    linha.className = "linhaHistorico";
    linha.textContent = item;
    if (item.includes("Comparando valores")) {
      linha.classList.add("comparacao");
    } else if (item.includes("Dividindo subarray")) {
      linha.classList.add("divisao");
    }
    divHistorico.appendChild(linha);
  });
}

function passoAnterior() {
  if (indicePassoAtual > 1) {
    listaHistorico.pop();
    indicePassoAtual -= 2;
    atualizarHistorico();
    proximoPasso();
  } else if (indicePassoAtual === 1) {
    listaHistorico.pop();
    indicePassoAtual = 0;
    atualizarHistorico();
    proximoPasso();
  }
}

async function proximoPasso() {
  if (indicePassoAtual < filaPassos.length) {
    passoAtual = filaPassos[indicePassoAtual++];
    indicesDestacados = passoAtual.indices || [];
    indicesDivisao = passoAtual.divisoes || [];
    criarBarras();

    let textoBase = passoAtual.textoBase || passoAtual.texto;
    let textoDetalhado = "";

    if (textoBase.includes("Comparando valores")) {
      const valoresVermelhos = indicesDestacados.map((idx) => valores[idx]);
      textoDetalhado = `Comparando valores ${valoresVermelhos.join(
        " e "
      )} para ${passoAtual.direcao ? "crescente" : "decrescente"}.`;
      const valoresComIndices = indicesDestacados
        .map((idx) => `${idx}:${valores[idx]}`)
        .join(", ");
      listaHistorico.push(`${textoDetalhado} [Vermelho: ${valoresComIndices}]`);
    } else if (textoBase.includes("Dividindo subarray")) {
      textoDetalhado = textoBase;
      const valoresAmarelos = indicesDivisao
        .map((idx) => `${idx}:${valores[idx]}`)
        .join(", ");
      listaHistorico.push(`${textoDetalhado} [Amarelo: ${valoresAmarelos}]`);
    }

    atualizarHistorico();
    mostrarExplicacao(textoDetalhado || textoBase);

    if (passoAtual.acao) {
      await passoAtual.acao();
      criarBarras();
    }
  } else {
    document.getElementById("controlePasso").style.display = "none";
    indicesDestacados = [];
    indicesDivisao = [];
    mostrarExplicacao("Ordenação completa!");
  }
}

function adicionarPasso(
  texto,
  acao = null,
  indices = [],
  divisoes = [],
  direcao = true
) {
  filaPassos.push({ textoBase: texto, acao, indices, divisoes, direcao });
}

async function BitonicSort(inicio, comprimento, direcao) {
  if (comprimento <= 1) return;
  const metade = comprimento / 2;
  const intervalo = Array.from({ length: comprimento }, (_, i) => i + inicio);
  adicionarPasso(
    `Dividindo subarray de tamanho ${comprimento} em duas partes.`,
    async () => await esperar(300),
    [],
    intervalo
  );
  await BitonicSort(inicio, metade, true);
  await BitonicSort(inicio + metade, metade, false);
  await BitonicMerge(inicio, comprimento, direcao);
}

async function BitonicMerge(inicio, comprimento, direcao) {
  if (comprimento <= 1) return;
  const metade = comprimento / 2;
  for (let i = inicio; i < inicio + metade; i++) {
    adicionarPasso(
      `Comparando valores`,
      async () => {
        await esperar(300);
        if (valores[i] > valores[i + metade] === direcao) {
          [valores[i], valores[i + metade]] = [valores[i + metade], valores[i]];
          await esperar(300);
        }
      },
      [i, i + metade],
      [],
      direcao
    );
  }
  await BitonicMerge(inicio, metade, direcao);
  await BitonicMerge(inicio + metade, metade, direcao);
}

function bitonicSortDireta(arr, inicio, comprimento, direcao) {
  if (comprimento <= 1) return;
  const metade = comprimento / 2;
  bitonicSortDireta(arr, inicio, metade, true);
  bitonicSortDireta(arr, inicio + metade, metade, false);
  bitonicMergeDireta(arr, inicio, comprimento, direcao);
}

function bitonicMergeDireta(arr, inicio, comprimento, direcao) {
  if (comprimento <= 1) return;
  const metade = comprimento / 2;
  for (let i = inicio; i < inicio + metade; i++) {
    if (arr[i] > arr[i + metade] === direcao) {
      [arr[i], arr[i + metade]] = [arr[i + metade], arr[i]];
    }
  }
  bitonicMergeDireta(arr, inicio, metade, direcao);
  bitonicMergeDireta(arr, inicio + metade, metade, direcao);
}

function arrayFinal() {
  const arrOrdenado = [...valores];
  bitonicSortDireta(arrOrdenado, 0, arrOrdenado.length, true);
  valores = arrOrdenado;
  indicesDestacados = [];
  indicesDivisao = [];
  filaPassos = [];
  indicePassoAtual = 0;
  listaHistorico = [];
  listaHistorico.push("Array ordenado diretamente.");
  atualizarHistorico();
  document.getElementById("explicacao").innerText =
    "Array ordenado diretamente sem passos intermediários:\n" +
    JSON.stringify(valores);
  document.getElementById("controlePasso").style.display = "none";
  criarBarras();
}

async function iniciarOrdenacao() {
  filaPassos = [];
  indicePassoAtual = 0;
  listaHistorico = [];
  indicesDestacados = [];
  indicesDivisao = [];
  atualizarHistorico();
  await BitonicSort(0, valores.length, true);
  proximoPasso();
}

embaralharBarras();
