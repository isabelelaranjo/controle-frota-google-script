function doGet() {
  // O nome dentro das aspas DEVE ser exatamente o nome do arquivo HTML na lateral
  return HtmlService.createTemplateFromFile('Estrutura')
      .evaluate()
      .setTitle('Sistema de Uso de Veículos')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); [cite: 40]
}

/**
 * PROCESSA O AGENDAMENTO COM VALIDAÇÃO DE RODÍZIO
 */
function processarAgendamentoApp(dados) {
  // DADOS PROTEGIDOS: Substitua pelos valores reais no seu ambiente privado
  const idPlanilha = "SUA_ID_DE_PLANILHA_AQUI"; [cite: 41, 52]
  const seuEmail = "seu-email@exemplo.com"; [cite: 42]
  
  const partesData = dados.dataSaida.split("-"); [cite: 42]
  const dataRef = new Date(partesData[0], partesData[1] - 1, partesData[2], 12, 0, 0); [cite: 43]
  const diaSemana = dataRef.getDay(); [cite: 43]
  
  const partesHora = dados.horarioSaida.split(":"); [cite: 43]
  const horaDecimal = parseInt(partesHora[0]) + (parseInt(partesHora[1]) / 60); [cite: 44]
  const estaNoHorarioRodizio = (horaDecimal >= 7 && horaDecimal <= 10) || (horaDecimal >= 17 && horaDecimal <= 20); [cite: 44, 45]
  
  const veiculo = dados.veiculo.toUpperCase(); [cite: 45]
  let bloqueado = false; [cite: 45]

  // Lógica de Rodízio: Segunda (1) e Quarta (3)
  if (veiculo.includes("ONIX") && diaSemana === 1 && estaNoHorarioRodizio) bloqueado = true; [cite: 46]
  if (veiculo.includes("FOX") && diaSemana === 3 && estaNoHorarioRodizio) bloqueado = true; [cite: 47]

  if (bloqueado) {
    return "ERRO: Veículo em RODÍZIO (07-10h ou 17-20h). Por favor, escolha outro horário ou veículo."; [cite: 48]
  }

  try {
    const ss = SpreadsheetApp.openById(idPlanilha); [cite: 49]
    const aba = ss.getSheetByName("CONTROLE VEÍCULOS"); [cite: 49]
    aba.appendRow([new Date(), dados.nome, dados.veiculo, dados.destino, dados.dataSaida, dados.horarioSaida, dados.dataRetorno, dados.horarioRetorno]); [cite: 50]
    MailApp.sendEmail(seuEmail, "Nova Reserva - " + dados.nome, "Um novo agendamento de veículo foi registrado."); [cite: 50]
    return "Agendamento realizado com sucesso!"; [cite: 51]
  } catch (err) {
    return "ERRO técnico: " + err.toString(); [cite: 51]
  }
}

/**
 * BUSCA AGENDAMENTOS PARA O CALENDÁRIO
 */
function buscarAgendamentosMes() {
  const idPlanilha = "SUA_ID_DE_PLANILHA_AQUI"; [cite: 52]
  const ss = SpreadsheetApp.openById(idPlanilha); [cite: 52]
  const aba = ss.getSheetByName("CONTROLE VEÍCULOS"); [cite: 53]
  const dados = aba.getDataRange().getDisplayValues(); [cite: 53]
  
  if (dados.length <= 1) return []; [cite: 53]

  return dados.slice(1).map(linha => {
    const modeloCarro = String(linha[2]).includes("ONIX") ? "ONIX" : "FOX"; [cite: 54]
    const hSaida = linha[5].substring(0, 5); [cite: 54]
    const hRetorno = linha[7].substring(0, 5); [cite: 54]
    const tituloExibicao = modeloCarro + ": " + hSaida + " - " + hRetorno; [cite: 54]

    const partesData = linha[4].split("/"); [cite: 54]
    const dataIso = (partesData.length === 3) ? (partesData[2] + "-" + partesData[1] + "-" + partesData[0]) : linha[4]; [cite: 54]

    return {
      title: tituloExibicao,
      start: dataIso,
      color: modeloCarro === "ONIX" ? "#27303F" : "#FFC344", [cite: 55]
      textColor: modeloCarro === "ONIX" ? "#FFFFFF" : "#27303F", [cite: 55]
      allDay: true [cite: 55]
    };
  });
}