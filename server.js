const express = require('express')
const app = express()

app.use(express.json())

// Banco de dados simples (por enquanto na memória)
const usuarios = {}

// Rota principal — só pra testar se o servidor está vivo
app.get('/', (req, res) => {
  res.json({ status: 'GranaOK funcionando! 🚀' })
})

// Rota que recebe mensagens do WhatsApp
app.post('/mensagem', (req, res) => {
  const { usuario, mensagem } = req.body

  // Garante que o usuário existe
  if (!usuarios[usuario]) {
    usuarios[usuario] = { renda: 1000, gastos: [] }
  }

  const user = usuarios[usuario]
  const texto = mensagem.toLowerCase()

  // Calcula total gasto
  const totalGasto = user.gastos.reduce((soma, g) => soma + g.valor, 0)
  const saldo = user.renda - totalGasto

  // Entende a mensagem
  const match = texto.match(/(\d+)/)
  const valor = match ? parseFloat(match[1]) : null

  let resposta = ''

  if (texto.includes('gastei') || texto.includes('comprei') || texto.includes('paguei')) {
    if (valor) {
      user.gastos.push({ descricao: mensagem, valor })
      const novoSaldo = saldo - valor
      resposta = `✅ Registrado! Você ainda tem R$${novoSaldo} disponíveis esse mês. Tudo OK 👍`
    } else {
      resposta = 'Não entendi o valor. Tenta assim: "gastei 50 no mercado"'
    }
  } else if (texto.includes('saldo') || texto.includes('quanto tenho')) {
    resposta = `💰 Seu saldo atual é R$${saldo}. Você gastou R$${totalGasto} esse mês.`
  } else if (texto.includes('posso comprar') || texto.includes('posso gastar')) {
    if (valor) {
      const sobra = saldo - valor
      if (sobra >= 200) {
        resposta = `✅ Pode sim! Se comprar, vai ficar com R$${sobra}. Tudo OK!`
      } else if (sobra >= 0) {
        resposta = `⚠️ Dá pra comprar, mas vai ficar com só R$${sobra}. Vai com calma!`
      } else {
        resposta = `🚨 Não recomendo! Você ficaria R$${Math.abs(sobra)} no negativo.`
      }
    }
  } else {
    resposta = 'Não entendi. Tenta: "gastei 50 no mercado" ou "qual meu saldo?"'
  }

  res.json({ resposta })
})

// Liga o servidor na porta 3000
app.listen(3000, () => {
  console.log('✅ Servidor GranaOK rodando em http://localhost:3000')
})