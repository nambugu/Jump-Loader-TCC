# Sistema de Análise de Aterrissagem — Dashboard

Essa é a interface web do nosso TCC. Ela mostra em tempo real os dados que o equipamento envia durante os saltos, que ficam salvos no Firebase Realtime Database.

## 1. Criando o projeto no Firebase

1. Entra em https://console.firebase.google.com e cria um projeto novo.
2. No menu lateral, vai em **Build > Realtime Database** e clica em "Criar banco de dados". A gente começou em **modo de teste** mesmo, pra não travar o desenvolvimento — dá pra ajustar as regras de segurança depois, antes da apresentação.
3. Em **Configurações do projeto > Geral**, desce até "Seus apps" e cria um app Web (ícone `</>`). Copia o objeto `firebaseConfig` que aparece, vai precisar dele no próximo passo.

## 2. Variáveis de ambiente

Copia o `.env.example` pra `.env` e preenche com os valores do `firebaseConfig`:

```bash
cp .env.example .env
```

## 3. Instalando e rodando

```bash
npm install
npm run dev
```

Vai abrir um endereço tipo `http://localhost:5173` no terminal — só abrir no navegador.

## 4. Como os dados ficam organizados no banco

O dashboard escuta o nó `saltos`, que fica assim:

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

Cada salto vira um registro novo (chave gerada automaticamente, o `push()` do Firebase) dentro do nó do jogador. O `timestamp` tem que estar em milissegundos (`Date.now()` no JS ou o equivalente com `millis()`/NTP no ESP32).

Dá pra criar esses dados manualmente no console do Firebase só pra testar a interface, mesmo antes do ESP32 estar pronto — é só colocar alguns registros de exemplo dentro de `saltos/jogador1/`.

## 5. Regras de segurança (não esquecer antes de apresentar)

O modo de teste deixa o banco aberto pra qualquer leitura/escrita por 30 dias, então isso não pode ficar assim na apresentação. Antes da banca, trocar as regras (aba **Regras** do Realtime Database) por algo mais restrito — por exemplo, leitura pública liberada mas escrita só autenticada, ou então travando por uma chave secreta que só o ESP32 conhece.

## Próximos passos

- Integrar o ESP32 (mandar os dados via Wi-Fi/HTTP pro Realtime Database).
