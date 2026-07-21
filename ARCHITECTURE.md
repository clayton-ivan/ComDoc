# ComDoc - Arquitetura do Projeto

## Objetivo

O ComDoc é um sistema para geração de documentos comerciais.

Seu propósito é permitir que empresas produzam propostas, contratos e demais documentos padronizados de forma simples, rápida e consistente.

---

# Filosofia

Todo código deve resolver um caso de uso real.

Nenhuma funcionalidade será implementada "porque pode ser útil".

Generalizações somente quando surgirem naturalmente.

Primeiro resolver o problema.

Depois abstrair.

---

# Arquitetura 

O ComDoc utiliza uma arquitetura em camadas para separar interface, regras de negócio, acesso a dados e geração de documentos.

```text
Frontend
   │
   ▼
Routes
   │
   ▼
Controllers
   │
   ▼
Services
   │
   ▼
Repositories
   │
   ▼
DatabaseRepository
   │
   ▼
SQLite

---

# Controllers

Responsáveis apenas por HTTP.

Devem:

- receber requisições;
- validar entradas básicas;
- chamar Services;
- devolver respostas.

Nunca:

- acessar banco;
- acessar arquivos;
- conter regra de negócio.

---

# Services

Responsáveis pelas regras de negócio.

Devem:

- implementar os casos de uso;
- coordenar repositories;
- preparar dados para templates.

Nunca:

- conhecer Express;
- manipular req ou res;
- conhecer HTML.

---

# Repositories

Responsáveis pela persistência.

Hoje:

- JSON.

Futuro:

- SQLite;
- PostgreSQL.

A troca da tecnologia de persistência não deve impactar Controllers nem Services.

---

# Templates

Templates são responsáveis apenas pela apresentação.

Nunca devem conter regras de negócio.

Toda informação deve chegar pronta.

---

# Frontend

O frontend deve permanecer o mais simples possível.

Toda regra compartilhada deve ser modularizada.

Arquivos pequenos.

Responsabilidades bem definidas.

---

# Estrutura

```
src/

controllers/
services/
repositories/
routes/
templates/
public/
utils/
catalogos/
```

---

# Princípios

## Separação de responsabilidades

Cada arquivo deve possuir apenas uma responsabilidade.

---

## Simplicidade

Sempre escolher a solução mais simples que resolva o problema atual.

---

## Evolução incremental

O sistema cresce sprint após sprint.

Evitar grandes reescritas.

---

## Código limpo

Funções pequenas.

Nomes claros.

Pouca duplicação.

---

## Refatoração

Refatorar sempre que a estrutura começar a dificultar a evolução.

Nunca esperar "ficar impossível".

---

## Casos de uso

Toda funcionalidade nasce de um caso de uso real.

Nunca de uma hipótese.

---

## Multiempresa

Todo desenvolvimento deve considerar que haverá:

- várias empresas;
- vários usuários;
- vários templates.

Mesmo que inicialmente exista apenas uma empresa.

---

## Templates

Os templates pertencem à empresa.

Não pertencem ao sistema.

---

## Produtos

Os produtos pertencem à empresa.

O sistema apenas os gerencia.

---

## Banco de Dados

A persistência é um detalhe de implementação.

A regra de negócio nunca deve depender dela.

---

# Convenções

- Controllers terminam com Controller.
- Services terminam com Service.
- Repositories terminam com Repository.
- Rotas terminam com Routes.

---

# Objetivo de longo prazo

Que qualquer documento comercial possa ser gerado pelo ComDoc apenas combinando:

- Empresa
- Template
- Cliente
- Produto
- Dados variáveis

sem necessidade de alterar código.