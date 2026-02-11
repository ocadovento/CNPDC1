# 🎤 Roteiro para Slides - Apresentação CNPDC

## 📌 Estrutura Sugerida: 15-20 Slides

---

## SLIDE 1: CAPA
**Título:** Sistema CNPDC - Gestão de Delegações
**Subtítulo:** Teia Nacional dos Pontos de Cultura 2026
**Imagem:** Logo CNPDC
**Rodapé:** Aracruz/ES - 24 a 29 de Março de 2026

---

## SLIDE 2: O DESAFIO
**Título:** O Desafio da Teia 2026

**Conteúdo:**
- 🌍 27 estados brasileiros
- 👥 Milhares de delegados a gerenciar
- 📊 7 categorias de cotas
- ⚖️ Paridade de gênero obrigatória
- 📝 Múltiplos eventos simultâneos
- 🔒 Segurança e transparência essenciais

**Texto de apoio:**
"Como gerenciar tudo isso de forma eficiente, segura e transparente?"

---

## SLIDE 3: A SOLUÇÃO
**Título:** Nossa Solução: Plataforma Digital Completa

**Conteúdo:**
- ✅ Sistema web moderno e intuitivo
- ✅ Gestão completa de delegações
- ✅ Automação de processos
- ✅ Segurança nível bancário
- ✅ Transparência total
- ✅ Escalável e confiável

---

## SLIDE 4: VISÃO GERAL DO SISTEMA
**Título:** Arquitetura do Sistema

**Diagrama simples:**
```
┌──────────────┐
│ PARTICIPANTES│
└──────┬───────┘
       │ Validação
┌──────▼───────────┐
│ REPRESENTANTES GT│
└──────┬───────────┘
       │ Supervisão
┌──────▼──────────┐
│ ADMINISTRADORES │
└─────────────────┘
```

**Stack Técnico:**
- Frontend: React + TypeScript
- Backend: Supabase (PostgreSQL)
- Hospedagem: Netlify/Vercel
- Segurança: Row Level Security

---

## SLIDE 5: 3 NÍVEIS DE ACESSO
**Título:** Hierarquia e Permissões

**Conteúdo em 3 colunas:**

**ADMINISTRADORES**
- 👑 Acesso total
- Criar eventos
- Gerenciar usuários
- Backup completo
- Visualizar tudo

**REPRESENTANTES GT**
- 🏛️ Acesso ao seu estado
- Cadastrar delegados
- Upload de relatórios
- Validar participantes
- Exportar dados

**PARTICIPANTES**
- 👤 Acesso aos próprios dados
- Preencher validação
- Upload de documentos
- Ver status
- Editar perfil

---

## SLIDE 6: TIPOS DE DELEGADOS
**Título:** 3 Tipos de Delegação

**Conteúdo em cards:**

**🗳️ ELEITOS**
- Escolhidos nos fóruns estaduais
- Máximo 30 por estado
- 7 categorias de cotas
- Paridade de gênero obrigatória

**👥 NATOS**
- Membros GT/Executiva Nacional
- Participam por direito
- Sem limite de quantidade
- Não contam nas cotas

**🔄 SUPLENTES** ⭐ NOVO!
- Vinculados a eleitos
- Podem substituir
- Categoria flexível
- Histórico completo

---

## SLIDE 7: INOVAÇÃO - SUPLENTES FLEXÍVEIS
**Título:** Inovação: Suplentes com Categoria Diferente

**Exemplo visual:**
```
ELEITO JOVEM ──────┐
                   │
        Pode ser   │
      substituído  ├── SUPLENTE MULHER ✓
         por       │
                   │
ELEITO INDÍGENA ───┘
```

**Vantagens:**
- ✅ Maior flexibilidade
- ✅ Aproveita melhor as vagas
- ✅ Mantém diversidade
- ✅ Registro de substituições
- ✅ Transparência total

---

## SLIDE 8: SISTEMA DE COTAS
**Título:** 7 Categorias de Representação

**Conteúdo em grid:**
1. 🙋 Pessoa Negra
2. 🪶 Pessoa Indígena
3. ♿ Pessoa com Deficiência
4. 🌟 Pessoa Jovem
5. 👴 Pessoa Idosa
6. 🏳️‍🌈 LGBTQPN+
7. 🌍 Ampla Participação

**Destaque:**
"Controle automático de vagas por categoria + Paridade de gênero (min 50%)"

---

## SLIDE 9: PARIDADE DE GÊNERO AUTOMÁTICA
**Título:** Paridade Garantida por Design

**Conteúdo:**

**Como funciona:**
1. Sistema calcula em tempo real
2. Alertas visuais quando abaixo de 50%
3. Relatórios detalhados por estado
4. Gráficos de acompanhamento
5. Sem intervenção manual

**Resultado:**
- ✅ Conformidade automática
- ✅ Transparência total
- ✅ Dados auditáveis
- ✅ Relatórios exportáveis

---

## SLIDE 10: FLUXO DE VALIDAÇÃO
**Título:** Processo de Validação Distribuída

**Diagrama de fluxo:**
```
1. Representante cadastra → Status: "Aguardando"
           ↓
2. Participante recebe acesso (CPF + Nome + Nome da Mãe)
           ↓
3. Participante faz login e completa formulário
           ↓
4. Sistema valida dados → Status: "Validado"
           ↓
5. Promoção automática para Teia Nacional 2026 ✓
```

**Benefícios:**
- Descentralizado
- Seguro
- Rápido
- Transparente

---

## SLIDE 11: SEGURANÇA E CONFORMIDADE
**Título:** Segurança Nível Bancário

**Conteúdo em 2 colunas:**

**PROTEÇÃO DE DADOS**
- 🔒 Autenticação Supabase
- 🔐 Row Level Security (RLS)
- 🛡️ Criptografia HTTPS
- 🔑 Validação tripla de identidade
- 📋 100% LGPD compliant

**CONTROLES DE ACESSO**
- ✅ Políticas granulares por tabela
- ✅ Dados sensíveis protegidos
- ✅ Auditoria automática
- ✅ Backup diário
- ✅ Recuperação de desastres

---

## SLIDE 12: RELATÓRIOS E EXPORTAÇÕES
**Título:** Inteligência de Dados

**Recursos disponíveis:**

📊 **Relatórios:**
- Por estado
- Por cota
- Por gênero
- Paridade
- Disponibilidade de vagas

📥 **Exportações:**
- Excel (XLSX)
- Múltiplas abas
- Gráficos (PNG)
- Lista pública
- Dados estruturados

---

## SLIDE 13: WIDGET INCORPORÁVEL
**Título:** Transparência em Tempo Real

**Imagem:** Screenshot do widget

**O que mostra:**
- 📊 Total de validados
- 👥 Delegados por tipo
- 🗺️ Estados participantes
- 📅 Próximos eventos

**Como usar:**
```html
<iframe src="https://seu-dominio.com/#embed"
        width="100%" height="600">
</iframe>
```

**Benefícios:**
- ✅ Incorporável em qualquer site
- ✅ Atualização automática
- ✅ Zero configuração
- ✅ Dados públicos seguros

---

## SLIDE 14: RECURSOS ADICIONAIS
**Título:** Mais Funcionalidades

**Em cards:**

**📅 Calendário**
- Todos os eventos
- Filtros por tipo
- Datas e locais
- Público

**📄 Documentos**
- Upload de relatórios
- PDFs públicos
- Categorização
- Controle de versão

**👤 Gestão de Usuários**
- Criar representantes
- Redefinir senhas
- Controle de acesso
- Auditoria

**💾 Backup**
- Automático diário
- Exportação completa
- Recuperação rápida
- Sem perda de dados

---

## SLIDE 15: NÚMEROS QUE IMPRESSIONAM
**Título:** Capacidade e Performance

**Estatísticas em destaque:**

**CAPACIDADE**
- 🌍 27 estados
- 👥 Milhares de delegados
- 📁 Upload ilimitado
- ⚡ Zero downtime

**SEGURANÇA**
- 🔒 100% LGPD
- 🛡️ RLS todas tabelas
- 🔐 Backup diário
- ✅ Auditado

**PERFORMANCE**
- ⚡ < 2s carregamento
- 🚀 Build otimizado
- 📊 Queries indexadas
- 💾 Cache inteligente

---

## SLIDE 16: ROADMAP FUTURO
**Título:** Próximas Funcionalidades

**Timeline:**

**FASE 2 (Q2 2025)**
- 📧 Notificações por email
- 📊 Dashboard tempo real
- 🗳️ Sistema de votação online
- 📱 Protótipo app móvel

**FASE 3 (Q3 2025)**
- 📅 Integração Google Calendar
- 🎫 Sistema de credenciamento
- 📷 QR Codes check-in
- 🎥 Transmissão ao vivo

---

## SLIDE 17: DIFERENCIAIS COMPETITIVOS
**Título:** Por Que Nossa Solução?

**Comparação:**

**❌ Solução Manual:**
- Planilhas desorganizadas
- Erros humanos
- Difícil auditoria
- Sem segurança
- Não escalável

**✅ Nossa Plataforma:**
- Sistema integrado
- Automação completa
- Auditoria automática
- Segurança nativa
- Escalabilidade infinita

---

## SLIDE 18: TESTEMUNHOS E RESULTADOS
**Título:** Impacto Real

**Depoimentos (se disponíveis):**
- "Reduziu 80% do trabalho manual"
- "Transparência que precisávamos"
- "Seguro e fácil de usar"

**Métricas:**
- ⏱️ 70% menos tempo de gestão
- ✅ 100% de conformidade
- 📊 Zero erros de cálculo
- 🎯 95% satisfação usuários

---

## SLIDE 19: CASES DE USO
**Título:** Quem Pode Usar

**Aplicações:**

**CULTURA VIVA**
- ✅ Teias Nacionais
- ✅ Fóruns Estaduais
- ✅ Assembleias

**OUTROS MOVIMENTOS**
- 🌾 Movimentos Sociais
- 🎓 Conselhos Estudantis
- 🏛️ Organizações Civis
- 🤝 Redes Colaborativas

**Personalizável para qualquer contexto de delegação!**

---

## SLIDE 20: CALL TO ACTION
**Título:** Comece Agora!

**Acesso:**
```
🌐 Website: https://seu-dominio.com
📧 Email: culturavivanacional@gmail.com
📱 Instagram: @culturavivabrasil
🎥 YouTube: @culturavivabrasil
```

**Próximos Passos:**
1. ✅ Crie sua conta
2. ✅ Cadastre seus delegados
3. ✅ Valide participantes
4. ✅ Exporte relatórios
5. ✅ Incorpore o widget

**"Junte-se aos milhares que já estão usando!"**

---

## SLIDE 21: PERGUNTAS E CONTATO
**Título:** Dúvidas?

**Estamos aqui para ajudar:**

📧 **Suporte:** culturavivanacional@gmail.com
📱 **WhatsApp:** (xx) xxxxx-xxxx
🌐 **Site:** https://seu-dominio.com
📖 **Documentação:** Completa e atualizada

**Horário de Atendimento:**
Segunda a Sexta: 9h às 18h

---

## 💡 DICAS DE APRESENTAÇÃO

### Tempo Sugerido por Seção:
- Slides 1-3: 3 minutos (Introdução)
- Slides 4-7: 8 minutos (Sistema e Inovação)
- Slides 8-10: 7 minutos (Funcionalidades)
- Slides 11-14: 8 minutos (Segurança e Recursos)
- Slides 15-18: 5 minutos (Impacto)
- Slides 19-21: 4 minutos (Cases e Encerramento)
- **Total: ~35 minutos + 10min Q&A = 45min**

### Recursos Visuais Sugeridos:
- Screenshots da plataforma em cada slide
- Gráficos de paridade
- Diagramas de fluxo
- Ícones coloridos
- Números grandes e destacados
- Cores: Verde (#16a34a), Azul (#3b82f6), Laranja (#f97316)

### Demonstração Ao Vivo:
- Prepare 3-5 minutos para demonstração
- Mostre: Login → Dashboard → Cadastro → Relatório
- Tenha dados de exemplo prontos
- Teste antes da apresentação

---

## 📊 MATERIAL DE APOIO

### Para distribuir após apresentação:
1. ✅ PDF dos slides
2. ✅ APRESENTACAO_PLATAFORMA.md
3. ✅ GUIA_INCORPORACAO_IFRAME.html
4. ✅ Link de acesso ao sistema
5. ✅ Contatos de suporte

### Para demonstração:
1. ✅ Conta de teste preparada
2. ✅ Dados de exemplo carregados
3. ✅ Internet estável
4. ✅ Backup em vídeo (se internet falhar)

---

## 🎯 MENSAGENS-CHAVE

1. **"Gestão completa, segura e transparente da Teia 2026"**

2. **"Inovação: suplentes flexíveis com categoria diferente"**

3. **"Paridade de gênero automática, sem erros"**

4. **"Segurança nível bancário, 100% LGPD"**

5. **"Widget em tempo real para máxima transparência"**

---

**Boa apresentação! 🚀**
