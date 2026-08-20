# ComDoc

Plataforma multiempresa para criação de propostas comerciais e geração de documentos em PDF.

## Requisitos

- Node.js 24 ou superior;
- Chromium fornecido pelo Puppeteer;
- Um diretório persistente e gravável em produção;
- Proxy reverso com HTTPS em produção.

## Desenvolvimento

```bash
npm install
npm start
```

O comando `npm start` carrega o arquivo `.env` quando ele existir. Copie `.env.example` para `.env` e ajuste somente o necessário. Sem configuração, os caminhos históricos do projeto continuam sendo usados:

- Banco: `database/comdoc.db`;
- Uploads: `src/uploads`;
- PDFs temporários: `output`;
- Backups: `backups`.

## Dados persistentes em produção

Defina `COMDOC_DATA_DIR` para um volume que não seja apagado em atualizações ou novos deploys:

```text
COMDOC_DATA_DIR=/dados/comdoc
```

A aplicação passa a utilizar:

```text
/dados/comdoc/
├── database/comdoc.db
├── uploads/
├── output/
└── backups/
```

Também é possível configurar cada caminho separadamente com `COMDOC_DATABASE_PATH`, `COMDOC_UPLOADS_DIR`, `COMDOC_OUTPUT_DIR` e `COMDOC_BACKUP_DIR`.

Ao migrar uma instalação existente, copie o banco com a aplicação parada e copie todo o conteúdo de `src/uploads` para o novo diretório de uploads.

## Variáveis obrigatórias em produção

```text
NODE_ENV=production
COMDOC_PUBLIC_URL=https://comdoc.exemplo.com.br
COMDOC_SESSION_SECRET=um-segredo-aleatorio-com-ao-menos-32-caracteres
COMDOC_DATA_DIR=/dados/comdoc
COMDOC_TRUST_PROXY=true
COMDOC_FORCE_HTTPS=true
```

Nunca armazene o segredo de sessão no Git. A troca desse segredo invalida todos os cookies de acesso existentes.

## Proxy e HTTPS

O servidor Node deve ficar atrás de um proxy reverso ou balanceador que encerre TLS e envie `X-Forwarded-Proto`. Com `COMDOC_TRUST_PROXY=true`, o Express reconhece a conexão HTTPS original.

Quando `COMDOC_FORCE_HTTPS=true`:

- páginas acessadas por HTTP são redirecionadas com status 308;
- operações de alteração feitas por HTTP são recusadas;
- cookies de autenticação são enviados somente por HTTPS;
- HSTS é enviado nas respostas seguras.

Não exponha diretamente a porta interna do Node à internet.

## Healthcheck

O endpoint público `GET /health` verifica se o processo e o SQLite estão disponíveis. Respostas possíveis:

- `200` com `status: "ok"`;
- `503` durante encerramento ou indisponibilidade do banco.

O endpoint não expõe caminhos, credenciais nem dados de empresas.

## Backup

Execute:

```bash
npm run backup
```

Cada backup contém uma cópia consistente do SQLite e dos uploads. Backups antigos são removidos conforme `COMDOC_BACKUP_RETENTION_DAYS`, cujo padrão é 30 dias.

Em produção, agende esse comando externamente, por exemplo uma vez ao dia. O diretório de backups também deve ser copiado para outro servidor ou armazenamento. Manter o backup somente no mesmo volume não protege contra perda do volume.

Teste periodicamente a restauração em um ambiente separado. Para restaurar, pare o ComDoc, preserve os dados atuais, recoloque o banco e os uploads do mesmo backup e então inicie a aplicação.

## Segurança operacional

A aplicação inclui:

- cookies HTTP-only, `SameSite=Lax` e `Secure` em produção;
- validação de origem em operações de alteração;
- cabeçalhos HTTP defensivos;
- limite de tamanho para JSON;
- limite de tentativas de login por IP;
- bloqueio por usuário configurável pelo SUPER;
- logs estruturados em JSON sem conteúdo de formulários;
- identificador de requisição retornado em `X-Request-Id`;
- encerramento gracioso em `SIGTERM` e `SIGINT`.

O limitador por IP fica em memória e atende à implantação inicial com uma instância. Antes de executar várias instâncias simultâneas, ele deverá ser movido para um armazenamento compartilhado, como Redis.

## Publicação inicial

Antes de liberar acesso externo, confirme:

1. domínio e certificado HTTPS;
2. volume persistente montado;
3. segredo de sessão forte;
4. rotina de backup externo;
5. healthcheck configurado na hospedagem;
6. logs coletados pela plataforma;
7. política de privacidade e termos de uso revisados;
8. testes de upload e geração de PDF no ambiente escolhido.

A página pública, o cadastro autônomo de empresas, a confirmação de e-mail e a cobrança pertencem às próximas etapas do roadmap.
