# Sistema de Análise de Aterrissagem — Dashboard

Interface web (React + Vite) que exibe em tempo real os dados enviados pelo
equipamento de análise de aterrissagem, armazenados no Firebase Realtime
Database.

## 1. Criar o projeto no Firebase

1. Acesse https://console.firebase.google.com e crie um novo projeto.
2. No menu lateral, vá em **Build > Realtime Database** e clique em
   "Criar banco de dados". Comece em **modo de teste** (você ajusta as
   regras de segurança depois, antes de apresentar o TCC).
3. Em **Configurações do projeto > Geral**, role até "Seus apps" e crie um
   app da Web (ícone `</>`). Copie o objeto `firebaseConfig` que aparece.

## 2. Configurar as variáveis de ambiente

Copie `.env.example` para `.env` e preencha com os valores do
`firebaseConfig` do passo anterior:

```bash
cp .env.example .env
```

## 3. Instalar e rodar

```bash
npm install
npm run dev
```

O terminal vai mostrar um endereço tipo `http://localhost:5173` — abra no
navegador.

## 4. Estrutura de dados esperada no Realtime Database

O dashboard escuta o nó `saltos`, organizado assim:

```
saltos/
  jogador1/
    -Nxyz123/
      altura_cm: 38.4
      tempo_contato_ms: 142
      forca_impacto_bw: 1.8
      forca_pe_esquerdo: 1.6
      forca_pe_direito: 2.0
      timestamp: 1750000000000
  jogador2/
    ...
```

Cada salto é um novo registro (chave gerada automaticamente, tipo
`push()` do Firebase) dentro do nó do jogador. O campo `timestamp` deve
ser em milissegundos (`Date.now()` no JS, ou `millis()` equivalente no
ESP32/NTP).

Você pode criar esse formato manualmente no console do Firebase pra
testar a interface antes mesmo de o ESP32 estar pronto — é só adicionar
alguns registros de exemplo em `saltos/jogador1/`.

## 5. Regras de segurança (antes de apresentar o TCC)

O modo de teste deixa o banco aberto para qualquer leitura/escrita por
30 dias. Antes da apresentação, troque as regras (aba **Regras** do
Realtime Database) por algo mais restrito — por exemplo, liberando
apenas leitura pública e escrita autenticada, ou restringindo por uma
chave secreta que só o ESP32 conhece.

## Próximos passos

- Integrar o ESP32 (envio dos dados via Wi-Fi/HTTP para o Realtime
  Database).
- Ajustar os nomes dos campos acima caso seu equipamento meça outras
  variáveis.
- Definir os IDs dos jogadores (hoje o app lê qualquer chave dentro de
  `saltos/` automaticamente).
