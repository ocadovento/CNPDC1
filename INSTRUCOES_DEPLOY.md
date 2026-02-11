# 🚀 INSTRUÇÕES PARA PUBLICAR NO BOLT

## O campo ESTÁ NO CÓDIGO!
✅ O campo "Motivo da Substituição" está implementado corretamente
✅ O build foi feito com sucesso
❌ Mas não foi publicado no seu domínio

## Como Publicar no Bolt

### Opção 1: Botão de Deploy
1. Procure o botão **"Deploy"** ou **"Publish"** no Bolt
2. Clique nele
3. Aguarde a confirmação de deploy
4. Acesse seu site em **modo anônimo** (Ctrl+Shift+N)

### Opção 2: Forçar Rebuild
Se não encontrar o botão de deploy:

1. Faça uma mudança pequena no código (ex: adicione um espaço em qualquer arquivo)
2. O Bolt deve detectar e fazer deploy automático
3. Aguarde alguns segundos
4. Teste em modo anônimo

### Opção 3: Verificar Configuração
Verifique se:
- O Bolt está conectado ao seu domínio personalizado
- O deploy automático está habilitado
- Não há erros no console do Bolt

## Como Testar Depois do Deploy

1. **Limpe TODO o cache do navegador:**
   - Chrome: `Ctrl + Shift + Delete`
   - Marque "Imagens e arquivos em cache"
   - Período: "Todos os dados"

2. **Abra em modo anônimo:**
   - `Ctrl + Shift + N` (Chrome/Edge)

3. **Acesse seu domínio**

4. **Faça login como Representante Estadual**

5. **Clique no botão "Adicionar Suplente"**

6. **DEVE APARECER um campo VERMELHO GRANDE no topo:**
   - Título: "Motivo da Substituição *"
   - Fundo vermelho claro
   - Borda vermelha grossa
   - Campo de texto grande (3 linhas)

## Se ainda não aparecer:

Me envie:
1. A URL do seu domínio
2. Um print do formulário que abre
3. Abra o Console do navegador (F12) e me envie qualquer erro que aparecer

---

**O problema NÃO é no código. O problema é que o Bolt não publicou as mudanças no seu servidor.**
