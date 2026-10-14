# GUIA DE INSTALAÇÃO E HOSPEDAGEM (HOSTINGER / VPS / GITHUB)
## GL Sports - Camisetas Personalizadas

Este documento explica como subir o projeto para o GitHub e rodar com sucesso na Hostinger (VPS ou Web).

---

### 1. Imagens dos Banners (Hero) e Demais Categorias
Todas as imagens agora são **arquivos locais físicos** armazenados dentro do projeto em:
- `public/hero/`:
  - `slide-referencia.jpg`
  - `slide-futebol.jpg`
  - `slide-ciclismo.jpg` (Camiseta de Ciclismo para sua equipe de ciclismo)
  - `slide-jiujitsu.jpg`
  - `slide-volei-praia.jpg`
  - `slide-beach-tennis.jpg`
  - `slide-abadas.jpg`
- `public/` e `src/assets/images/`:
  - Imagens dos 8 grupos de categorias (Esportes, Futebol, Festas, Cultura Pop, Freestyle, Fé, Infantil, etc.)

Quando você faz o download ou clona via GitHub, todos esses arquivos acompanham o repositório e são copiados para a pasta `dist/` automaticamente no comando `npm run build`.

---

### 2. Conectar Chave de API de Outra Conta (Supabase / CRM)

Você tem duas formas fáceis de apontar para a sua outra conta:

#### Opção A (Recomendada): Via Arquivo `.env` na VPS / Hostinger
Crie ou edite o arquivo `.env` na raiz do seu projeto na Hostinger com:
```env
VITE_SUPABASE_URL="https://SEU_PROJETO.supabase.co"
VITE_SUPABASE_ANON_KEY="sua_chave_anonima_ou_publishable"
VITE_SUPABASE_PUBLISHABLE_KEY="sua_chave_anonima_ou_publishable"
PORT=3000
```
> **Atenção:** Use sempre a chave pública (**anon** ou **publishable**). Nunca utilize a `service_role` ou chaves secretas no frontend.

#### Opção B: Diretamente no código (`src/config.ts`)
No final do arquivo `src/config.ts`, você pode alterar os valores padrão:
```typescript
export const SUPABASE_URL = "https://seu-novo-projeto.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sua_nova_chave_publica";
```

Depois execute:
```bash
npm run build
```

---

### 3. Como Rodar na Hostinger VPS (Passo a Passo)

1. **Acessar sua VPS via SSH ou Terminal:**
   ```bash
   cd /caminho/do/seu/projeto
   ```

2. **Instalar as dependências:**
   ```bash
   npm install
   ```

3. **Gerar o build de produção:**
   ```bash
   npm run build
   ```

4. **Iniciar o servidor com Node.js / PM2:**
   ```bash
   # Com PM2 (recomendado para ficar sempre ligado):
   npm install -g pm2
   pm2 start "npm start" --name glsports
   pm2 save
   pm2 startup
   ```

5. **Configurar o Nginx (Proxy Reverso para a porta 3000):**
   ```nginx
   server {
       server_name seudominio.com.br www.seudominio.com.br;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

Pronto! Seu site estará 100% no ar com todas as fotos e pronto para uso.
