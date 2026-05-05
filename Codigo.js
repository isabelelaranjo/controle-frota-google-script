function doGet() {
  // O nome dentro das aspas DEVE ser exatamente o nome do arquivo HTML na lateral
  return HtmlService.createTemplateFromFile('Estrutura')
      .evaluate()
      .setTitle('Sistema de Uso de Veículos')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); 
}

/**
 * PROCESSA O AGENDAMENTO COM VALIDAÇÃO DE RODÍZIO
 */
function processarAgendamentoApp(dados) {
  // DADOS PROTEGIDOS: Substitua pelos valores reais no seu ambiente privado
  const idPlanilha = "SUA_ID_DE_PLANILHA_AQUI"; 
  const seuEmail = "seu-email@exemplo.com"; 
  
  const partesData = dados.dataSaida.split("-"); 
  const dataRef = new Date(partesData[0], partesData[1] - 1, partesData[2], 12, 0, 0); 
  const diaSemana = dataRef.getDay(); 
  
  const partesHora = dados.horarioSaida.split(":"); 
  const horaDecimal = parseInt(partesHora[0]) + (parseInt(partesHora[1]) / 60); 
  const estaNoHorarioRodizio = (horaDecimal >= 7 && horaDecimal <= 10) || (horaDecimal >= 17 && horaDecimal <= 20);
  
  const veiculo = dados.veiculo.toUpperCase(); 
  let bloqueado = false; 

  // Lógica de Rodízio: Segunda (1) e Quarta (3)
  if (veiculo.includes("ONIX") && diaSemana === 1 && estaNoHorarioRodizio) bloqueado = true; 
  if (veiculo.includes("FOX") && diaSemana === 3 && estaNoHorarioRodizio) bloqueado = true; 

  if (bloqueado) {
    return "ERRO: Veículo em RODÍZIO (07-10h ou 17-20h). Por favor, escolha outro horário ou veículo."; 
  }

  try {
    const ss = SpreadsheetApp.openById(idPlanilha);
    const aba = ss.getSheetByName("CONTROLE VEÍCULOS"); 
    aba.appendRow([new Date(), dados.nome, dados.veiculo, dados.destino, dados.dataSaida, dados.horarioSaida, dados.dataRetorno, dados.horarioRetorno]); 
    MailApp.sendEmail(seuEmail, "Nova Reserva - " + dados.nome, "Um novo agendamento de veículo foi registrado."); 
    return "Agendamento realizado com sucesso!";
  } catch (err) {
    return "ERRO técnico: " + err.toString(); 
  }
}

/**
 * BUSCA AGENDAMENTOS PARA O CALENDÁRIO
 */
function buscarAgendamentosMes() {
  const idPlanilha = "SUA_ID_DE_PLANILHA_AQUI"; 
  const ss = SpreadsheetApp.openById(idPlanilha); 
  const aba = ss.getSheetByName("CONTROLE VEÍCULOS"); 
  const dados = aba.getDataRange().getDisplayValues(); 
  
  if (dados.length <= 1) return []; 

  return dados.slice(1).map(linha => {
    const modeloCarro = String(linha[2]).includes("ONIX") ? "ONIX" : "FOX"; 
    const hSaida = linha[5].substring(0, 5); 
    const hRetorno = linha[7].substring(0, 5); 
    const tituloExibicao = modeloCarro + ": " + hSaida + " - " + hRetorno; 

    const partesData = linha[4].split("/");
    const dataIso = (partesData.length === 3) ? (partesData[2] + "-" + partesData[1] + "-" + partesData[0]) : linha[4]; 

    return {
      title: tituloExibicao,
      start: dataIso,
      color: modeloCarro === "ONIX" ? "#27303F" : "#FFC344",
      textColor: modeloCarro === "ONIX" ? "#FFFFFF" : "#27303F", 
      allDay: true
    };
  });
}
