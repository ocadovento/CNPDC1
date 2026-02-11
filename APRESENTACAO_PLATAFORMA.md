# Apresentação da Plataforma CNPDC - Gestão de Delegações

## 📋 Visão Geral

Plataforma web completa para gerenciamento da **Teia Nacional dos Pontos de Cultura 2026**, desenvolvida para o Conselho Nacional de Política Cultural (CNPDC). Sistema robusto que gerencia todo o ciclo de delegações estaduais e nacionais.

---

## 🎯 Funcionalidades Principais

### 1. **Gestão de Usuários e Acesso**
- **3 Níveis de Acesso:**
  - Administradores (gestão completa)
  - Representantes GT Estaduais (gestão do seu estado)
  - Participantes/Delegados (validação de dados)

- **Sistema de Autenticação:**
  - Login seguro com email/senha
  - Reset de senha via email
  - Validação de identidade por CPF + Nome da Mãe

### 2. **Gestão de Eventos**
- Cadastro de Fóruns Estaduais
- Cadastro de Teias Estaduais
- Evento Nacional Teia 2026 (fixo)
- Controle de datas, locais e temas
- Estimativa de participantes

### 3. **Sistema de Delegações**

#### **Tipos de Delegados:**
- **Eleitos**: Escolhidos nos fóruns/teias estaduais (máximo 30 por estado)
- **Natos**: Membros do GT ou Executiva Nacional (sem limite)
- **Suplentes**: Substitutos vinculados a eleitos (podem ter categoria diferente)

#### **Sistema de Cotas:**
- Pessoa negra
- Pessoa indígena
- Pessoa com deficiência
- Pessoa jovem
- Pessoa idosa
- LGBTQPN+
- Ampla participação

#### **Controle de Paridade:**
- Mínimo 50% de mulheres por estado
- Cálculos automáticos por cota
- Alertas visuais de paridade
- Gráficos de ocupação

### 4. **Fluxo de Validação**

```
1. Representante cadastra participante → Status: "Aguardando Validação"
2. Participante recebe acesso (CPF + Nome + Nome da Mãe)
3. Participante faz login e completa formulário
4. Sistema valida dados → Status: "Validado"
5. Promoção automática para Teia Nacional 2026
```

### 5. **Sistema de Inscrições Públicas**
- Formulário público para novos membros
- Cadastro de documentos (RG/ID)
- Upload de fotos via formulário
- Seleção de comunidades tradicionais
- Escolha de múltiplos GTs temáticos

### 6. **Relatórios e Exportações**

#### **Relatórios Disponíveis:**
- Lista de delegados por estado
- Relatório de cotas por estado
- Estatísticas de paridade de gênero
- Disponibilidade de vagas por cota
- Gráficos de ocupação

#### **Formatos de Exportação:**
- Excel (XLSX) - delegados validados
- Excel com múltiplas abas (Eleitos/Natos/Suplentes)
- Gráficos (PNG) - via biblioteca charts
- Lista pública (dados não-sensíveis)

### 7. **Gestão de Documentos**
- Upload de relatórios estaduais
- Categorização por tipo de evento
- Publicação pública automática
- Suporte a PDF, DOC, DOCX
- Links externos (Google Drive, Dropbox)

### 8. **Calendário de Eventos**
- Visualização pública de todos os eventos
- Informações de datas, locais e temas
- Filtros por tipo (Fórum/Teia)
- Contagem de participantes estimados

### 9. **Dashboards Especializados**

#### **Admin Dashboard:**
- Gestão de usuários
- Criação de eventos
- Gerenciamento de delegados natos
- Backup completo do sistema
- Estatísticas gerais

#### **Representante Dashboard:**
- Gestão da delegação do seu estado
- Cadastro de eleitos/natos/suplentes
- Upload de relatórios
- Visualização de participantes validados

---

## 🔒 Sistema de Segurança

### **1. Autenticação e Autorização**
- Supabase Auth (email/password)
- Tokens JWT seguros
- Row Level Security (RLS) no banco
- Políticas específicas por tipo de usuário

### **2. Proteção de Dados**
- CPF armazenado sem formatação
- Dados sensíveis não exibidos em listas públicas
- Acesso controlado por políticas RLS
- Validação de identidade multi-fator (CPF + Nome + Nome da Mãe)

### **3. Validação de Entrada**
- Sanitização de inputs
- Validação de CPF
- Prevenção de SQL Injection (via Supabase)
- Prevenção de XSS
- CORS configurado corretamente

### **4. Controle de Acesso**

#### **Administradores:**
- Acesso total ao sistema
- Gestão de usuários
- Backup completo
- Visualização de dados sensíveis

#### **Representantes GT:**
- Acesso apenas ao seu estado
- Cadastro de participantes do estado
- Upload de relatórios
- Visualização de delegação do estado

#### **Participantes:**
- Acesso apenas aos próprios dados
- Preenchimento do formulário de validação
- Upload de documentos pessoais
- Visualização de status de inscrição

### **5. Banco de Dados**
- PostgreSQL via Supabase
- Row Level Security (RLS) em todas as tabelas
- Políticas restritivas por padrão
- Auditoria via timestamps (created_at, updated_at)
- Integridade referencial (Foreign Keys)

### **6. Armazenamento de Arquivos**
- Supabase Storage
- Buckets isolados por tipo
- Políticas de acesso por bucket
- URLs públicas para documentos aprovados
- Limite de tamanho de arquivo

---

## 💾 Recursos Técnicos

### **Frontend**
- **React 18** + TypeScript
- **Vite** (build rápido)
- **Tailwind CSS** (design responsivo)
- **Lucide React** (ícones)
- **XLSX** (exportação Excel)

### **Backend**
- **Supabase** (Backend as a Service)
- **PostgreSQL** (banco de dados)
- **Supabase Auth** (autenticação)
- **Supabase Storage** (arquivos)
- **Row Level Security** (segurança)

### **Infraestrutura**
- **Hospedagem:** Netlify/Vercel
- **Banco de Dados:** Supabase Cloud
- **CDN:** Cloudflare (via hosting)
- **SSL:** Automático (HTTPS)

### **Performance**
- Build otimizado (Vite)
- Lazy loading de componentes
- Índices no banco de dados
- Queries otimizadas
- Cache de dados

---

## 📊 Estatísticas do Sistema

### **Capacidade**
- Gerencia 27 estados brasileiros
- Suporta milhares de delegados
- Múltiplos eventos simultâneos
- Upload ilimitado de documentos

### **Escalabilidade**
- Supabase escala automaticamente
- Sem limite de usuários
- Sem limite de storage
- Performance consistente

---

## 🎨 Interface e Experiência

### **Design Responsivo**
- Mobile-first
- Tablets otimizados
- Desktop completo
- Acessível (WCAG)

### **Cores e Identidade**
- **Eleitos:** Azul
- **Natos:** Laranja
- **Suplentes:** Amarelo
- **Validados:** Verde
- **Aguardando:** Amarelo

### **Navegação**
- Menu intuitivo
- Breadcrumbs
- Tabs organizadas
- Filtros avançados
- Busca integrada

---

## 📈 Diferenciais

1. **Sistema de Suplentes Único**
   - Suplentes podem ter categoria diferente do eleito
   - Registro de substituições
   - Histórico de mudanças

2. **Paridade de Gênero Automática**
   - Cálculos em tempo real
   - Alertas visuais
   - Relatórios detalhados

3. **Multi-Evento**
   - Gerencia eventos estaduais e nacionais
   - Promoção automática entre eventos
   - Histórico completo

4. **Validação Distribuída**
   - Representantes cadastram
   - Participantes validam
   - Admins supervisionam

5. **Transparência**
   - Listas públicas (dados não-sensíveis)
   - Calendário aberto
   - Documentos públicos
   - Estatísticas abertas

---

## 🚀 Roadmap Futuro

### **Fase 1 (Atual)**
- ✅ Sistema de delegações completo
- ✅ Autenticação e segurança
- ✅ Gestão de eventos
- ✅ Sistema de suplentes

### **Fase 2 (Próxima)**
- 🔄 Notificações por email
- 🔄 Dashboard de acompanhamento em tempo real
- 🔄 Sistema de votação online
- 🔄 App móvel nativo

### **Fase 3 (Futura)**
- 📅 Integração com Google Calendar
- 📅 Sistema de credenciamento
- 📅 QR Codes para check-in
- 📅 Transmissão ao vivo integrada

---

## 📞 Suporte e Manutenção

- **Documentação:** Completa e atualizada
- **Backup:** Automático diário
- **Monitoramento:** 24/7 via Supabase
- **Updates:** Sem downtime
- **Suporte:** Via sistema de tickets

---

## 🎓 Treinamento

### **Materiais Disponíveis:**
- Manual do Administrador
- Manual do Representante
- Manual do Participante
- Vídeos tutoriais
- FAQ completo

---

## 📄 Conformidade

- **LGPD:** Totalmente conforme
- **Dados Pessoais:** Protegidos
- **Consentimento:** Explícito
- **Direito ao Esquecimento:** Implementado
- **Portabilidade:** Exportação disponível

---

## 🏆 Conclusão

Plataforma completa, segura e escalável para gerenciamento de delegações do CNPDC, com foco em:
- **Transparência** nos processos
- **Segurança** dos dados
- **Facilidade** de uso
- **Conformidade** com legislação
- **Escalabilidade** para crescimento futuro
