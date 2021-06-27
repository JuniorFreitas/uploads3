# Upload arquivos em pasta via nodejs

## Instalação

Faça a cópia do arquivo .env-example para .env

```bash
$ cp .env-example .env
$ mkdir backup
```

Usando npm:

```bash
$ npm install
```

Usando yarn:

```bash
$ yarn install
```

## Configuração

```env
accessKeyId=
secretAccessKey=
region=
bucket=
folderBkp=
telegramApiKey=
chatId=
cliente="[Cliente]"
```

#### Observação:

Se no .env _folderBkp_ estiver vazio a aplicação pegará a pasta raiz _backup_.

#### Configurando o Telegram para receber notificação

Como usar:

```
 * 1) Crie um bot de telegram com <https://telegram.me/BotFather>
 * 2) Crie um canal de telegram onde as notificações serão enviadas.
 * 3) Adicione o bot criado da etapa 1 ao canal criado da etapa 2.
```

Consulte a documentação do telegram para mais informações
<https://core.telegram.org/bots/api>

Se _telegramApiKey_ for = "S" deve está preenchido telegramApiKey e chatId para receber mensagem diretamente no telegram.

## Executando a aplicação

Usando npm:

```bash
$ npm run start
```

Usando yarn:

```bash
$ yarn start
```

## License

[MIT](LICENSE)
