# Documentação da API REST v1 — Meu Controle Financeiro

Todas as rotas da API são versionadas sob o prefixo `/api/v1`, exigem validação estrita de entrada no backend, aplicam *Rate Limiting* progressivo por IP/usuário e verificam obrigatoriamente a propriedade do recurso (`userId` ownership check) em todas as consultas.

## Cabeçalhos Obrigatórios para Mutações (`POST`, `PUT`, `PATCH`, `DELETE`)
- `Cookie: __Host-mcf-session=<sessionId>` (HttpOnly, Secure em produção, SameSite=Strict)
- `X-CSRF-Token: <nonce>.<hmac>` (Token anti-CSRF vinculado criptograficamente à sessão ativa)
- `Content-Type: application/json`

---

## 1. Saúde e Observabilidade

### `GET /api/v1/health`
Retorna o status operacional da aplicação e parâmetros de segurança ativos (sem expor segredos ou versões internas de infraestrutura).

**Resposta `200 OK`:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "security": {
    "tlsRequiredInProd": true,
    "encryptionAtRest": "AES-256-GCM",
    "passwordKdf": "Argon2id/Scrypt",
    "mfa": "TOTP-RFC6238",
    "lgpdCompliant": true
  }
}
```

---

## 2. Estado Consolidado e Dashboard

### `GET /api/v1/state`
Retorna os dados consolidados apenas do usuário autenticado: perfil, resumo do dashboard mensal, contas, cartões, transações, orçamentos, metas, simulações de dívidas, sessões ativas, consentimentos LGPD e logs de auditoria sanitizados.

---

## 3. Classificação Inteligente de Movimentações

### `GET /api/v1/classify?description=<texto>`
Sugere automaticamente a categoria mais adequada para uma descrição, priorizando regras aprendidas localmente das correções anteriores do próprio usuário.

**Resposta `200 OK`:**
```json
{
  "categorySlug": "alimentacao",
  "confidence": "MEDIUM",
  "reason": "KEYWORD_MATCH"
}
```

---

## 4. Transações Financeiras

### `POST /api/v1/transactions`
Cria uma nova movimentação financeira (receita, despesa, transferência, investimento ou pagamento de dívida), gerando parcelas automaticamente quando `installmentTotal > 1` e verificando lançamentos duplicados potenciais.

**Corpo da Requisição:**
```json
{
  "description": "Supermercado Família",
  "type": "EXPENSE",
  "amountCents": 45900,
  "occurrenceDate": "2026-10-26T12:00:00.000Z",
  "paymentMethod": "CREDIT",
  "installmentTotal": 1,
  "status": "PAID"
}
```

### `POST /api/v1/transactions/:id/duplicate`
Duplica uma transação pertencente ao usuário autenticado com status inicial `PENDING`.

### `DELETE /api/v1/transactions/:id`
Realiza a exclusão lógica temporária (*soft delete*) de uma transação do usuário autenticado, permitindo desfazer a ação.

### `POST /api/v1/transactions/:id/undo`
Restaura imediatamente uma transação recém-excluída pelo usuário.

### `GET /api/v1/transactions/export-csv`
Exporta as transações do usuário autenticado em formato CSV compatível com Excel/LibreOffice (UTF-8 com BOM e separador `;`).

---

## 5. Segurança de Conta e MFA (2FA)

### `POST /api/v1/security/mfa-setup`
Inicia a configuração de Autenticação em Duas Etapas (TOTP RFC 6238), retornando o segredo `Base32` (armazenado criptografado com `AES-256-GCM`), a URI `otpauth://` e 8 códigos de recuperação de uso único.

### `POST /api/v1/security/revoke-all-sessions`
Encerra imediatamente todas as sessões e dispositivos conectados à conta do usuário e registra o evento no `AuditLog`.

---

## 6. Privacidade e Direitos do Titular (LGPD)

### `GET /api/v1/privacy/export`
Gera e baixa o pacote estruturado de Portabilidade de Dados Pessoais em JSON conforme o Art. 18 da LGPD, registrando a solicitação em `DataExportRequest` e `AuditLog`.

---

## Códigos de Erro Padronizados
- `400 Bad Request`: Erro de validação de negócio ou formato de entrada inválido.
- `401 Unauthorized`: Credenciais inválidas, MFA pendente ou sessão expirada.
- `403 Forbidden`: Falha na verificação CSRF ou tentativa bloqueada de acessar recurso de outro usuário (gera registro imediato em `SecurityEvent`).
- `429 Too Many Requests`: Limite de requisições excedido (*Rate Limiting* / proteção contra força bruta).
