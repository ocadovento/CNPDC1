# 🔒 Instruções para Garantir/Proteger este Projeto

## ✅ Estado Atual do Projeto
- **Nome**: Sistema CNPDC - Gestão de Delegação
- **Tecnologia**: React + TypeScript + Vite + Supabase
- **Data**: 23 de Janeiro de 2026
- **Última atualização**: Logo oficial CNPDC integrada

## 📁 Estrutura Completa do Projeto

### Arquivos Principais
- `src/App.tsx` - Aplicação principal com navegação
- `src/main.tsx` - Ponto de entrada
- `package.json` - Dependências do projeto
- `vite.config.ts` - Configuração Vite
- `.env` - Variáveis de ambiente Supabase

### Páginas (src/pages/)
- AdminDashboard.tsx
- AdminRegister.tsx
- CalendarioTeias.tsx
- DelegadosEleitos.tsx
- DelegadosNatos.tsx
- ForumNacional.tsx
- ForunsEstaduais.tsx
- GerenciarDelegacao.tsx
- HomePage.tsx
- InscricaoMembro.tsx
- Login.tsx
- ParticipantesTeia2026.tsx
- RelatorioCotas.tsx
- RepresentanteDashboard.tsx
- ResetPassword.tsx
- SelecaoInscricao.tsx

### Componentes (src/components/)
- DelegacaoTab.tsx
- DelegationChart.tsx
- GenderParityAlert.tsx
- QuotaAvailabilityChart.tsx
- QuotaCard.tsx
- Teia2026Modal.tsx

### Banco de Dados Supabase
- 80+ migrações aplicadas
- Tabelas principais: usuarios, delegacao, inscricoes_membros, eventos, cotas_por_estado
- Edge Functions: create-admin-user, reset-password
- Storage buckets: documents, id_mapa

## 🎯 Formas de Garantir o Projeto

### 1. **URL do Bolt (Mais Importante)**
Salve a URL atual deste projeto Bolt:
```
https://bolt.new/~/[SEU-ID-PROJETO]
```
- Copie esta URL e salve em um lugar seguro
- Adicione aos favoritos do navegador
- Sempre use esta URL específica para abrir o projeto

### 2. **Exportar para GitHub**
No Bolt, use o botão de "Push to GitHub" ou "Sync":
- Conecte sua conta GitHub
- Crie um repositório privado
- Faça push de todo o código
- Configure GitHub como backup automático

### 3. **Download Local**
Você pode baixar todo o projeto:
- No Bolt, clique em "Download" ou "Export"
- Salve o arquivo .zip em seu computador
- Mantenha backups em diferentes locais

### 4. **Supabase Dashboard**
Seu banco de dados está seguro no Supabase:
- URL: https://supabase.com/dashboard
- Projeto: [configurado no .env]
- Todos os dados estão persistidos na nuvem
- Faça backup periódico do schema SQL

### 5. **Stackblitz (Alternativa)**
Se o Bolt copiar/clonar o projeto:
- Abra via StackBlitz como você mencionou
- Use a URL do StackBlitz como backup
- Exporte para GitHub de lá também

## ⚠️ IMPORTANTE: Dados do Supabase

Suas credenciais Supabase estão em `.env`:
```
VITE_SUPABASE_URL=sua-url
VITE_SUPABASE_ANON_KEY=sua-chave
```

**COPIE ESTAS VARIÁVEIS** e guarde em local seguro! Você precisará delas em qualquer cópia do projeto.

## 🔄 Como Restaurar o Projeto

Se perder acesso ao Bolt:

1. **Via GitHub** (se configurou)
   - Clone o repositório
   - Instale dependências: `npm install`
   - Configure o `.env` com suas credenciais
   - Execute: `npm run dev`

2. **Via Download Local**
   - Extraia o arquivo .zip
   - Abra no StackBlitz ou VS Code
   - Configure o `.env`
   - Execute: `npm install && npm run dev`

3. **Via URL do Bolt**
   - Simplesmente abra a URL salva
   - Tudo estará como deixou

## 📋 Checklist de Segurança

- [ ] Salvei a URL do Bolt nos favoritos
- [ ] Copiei as credenciais do `.env`
- [ ] Configurei GitHub/backup externo
- [ ] Fiz download local do projeto
- [ ] Salvei a URL do Supabase Dashboard
- [ ] Documentei o acesso ao projeto

## 🆘 Em Caso de Perda

1. **Código perdido**: Restaure via GitHub ou backup local
2. **Dados perdidos**: O Supabase mantém tudo - basta reconectar
3. **Credenciais perdidas**: Acesse o Supabase Dashboard para regenerar keys

---

**Data de criação deste backup**: 23 de Janeiro de 2026
**Status**: ✅ Projeto totalmente funcional e atualizado
