# Documento de Segurança da Informação e Privacidade — Meu Controle Financeiro

## 1. Princípios Fundamentais

A plataforma **Meu Controle Financeiro** adota **Security by Design** e **Privacy by Design** desde a concepção. Dados financeiros pessoais são tratados como **altamente sensíveis sob a ótica de risco**, mesmo quando não enquadrados literalmente no rol do Art. 5º, II da LGPD.

**Compromissos Inegociáveis:**
- Nunca armazenar senhas em texto puro.
- Nunca vender, compartilhar ou utilizar dados financeiros pessoais para publicidade comportamental.
- Nunca utilizar dados pessoais para treinar modelos externos de IA sem consentimento explícito, granular e revogável.
- Nunca armazenar credenciais ou senhas bancárias do usuário.

---

## 2. Modelagem de Ameaças (STRIDE) e Controles Implementados

| Ameaça (STRIDE) | Vetor de Ataque | Controle Implementado no Projeto |
| :--- | :--- | :--- |
| **Spoofing (Falsificação de Identidade)** | Força bruta, credential stuffing, roubo de senha | Senhas fortes (mín. 10 caracteres + complexidade), hash `Argon2id/Scrypt` (`src/lib/security/crypto.ts`), bloqueio progressivo após 5 falhas, MFA TOTP RFC 6238 (`src/lib/security/totp.ts`) e notificação de novo login. |
| **Tampering (Adulteração de Dados)** | Manipulação de requisições ou payloads criptografados | Criptografia autenticada `AES-256-GCM` com tag de integridade de 128 bits, validação estrita no backend e proteção CSRF via HMAC-SHA256 (`src/lib/security/headers-and-guards.ts`). |
| **Repudiation (Não-Repúdio)** | Ações críticas sem rastreabilidade | Tabela `AuditLog` e `SecurityEvent` registrando ações críticas com timestamp UTC e metadados sanitizados. |
| **Information Disclosure (Vazamento de Dados)** | IDOR (acesso a recursos de outro usuário), vazamento em logs/erros | Verificação obrigatória `assertOwnership` em todas as operações de banco (`src/lib/store/database.ts`), mascaramento de IP/e-mail e supressão total de *stack traces* na API. |
| **Denial of Service (Negação de Serviço)** | Flood de requisições ou upload de arquivos gigantes | *Rate limiting* progressivo por IP/usuário, limite de body JSON em 1 MB e limite de anexos em 5 MB com validação de *Magic Bytes*. |
| **Elevation of Privilege (Elevação de Privilégio)** | Sequestro de sessão ou reuso de Refresh Token | Cookies `HttpOnly`, `SameSite=Strict`, `Secure`, rotação automática de *Refresh Token* e revogação de toda a família de sessões caso um token antigo seja reutilizado. |

---

## 3. Criptografia em Trânsito e em Repouso

1. **Em Trânsito**:
   - Exigência de **TLS 1.2 ou TLS 1.3** em homologação e produção, reforçada pelo cabeçalho `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`.
2. **Em Repouso**:
   - Segredos TOTP (`encryptedTotpSecret`) e dados financeiros sensíveis do perfil (`encryptedIncomeData`) são criptografados na camada de aplicação com **AES-256-GCM** usando IV aleatório de 96 bits por operação e prefixo de versão de chave (`v1:iv:authTag:ciphertext`) para permitir rotação periódica sem indisponibilidade.
3. **Anexos e Comprovantes**:
   - Armazenados em bucket privado (`private/{userId}/{transactionId}/{attachmentId}`).
   - O acesso ocorre exclusivamente por URLs temporárias assinadas com HMAC-SHA256 (`createSignedAttachmentUrl`) com expiração padrão de 5 minutos (300 segundos) e validação do proprietário.

---

## 4. Política de Backups Criptografados e Retenção de Dados

- **Backups**:
  - Snapshots diários automatizados do PostgreSQL criptografados com `AES-256` em repouso em região secundária isolada.
  - Teste mensal automatizado de restauração (*Restore Drill*) em ambiente efêmero para validar integridade (RPO: 1 hora | RTO: 2 horas).
- **Retenção e Exclusão Segura**:
  - Quando o usuário solicita a exclusão da conta, todas as sessões ativas são revogadas imediatamente.
  - O titular pode optar por um período de arrependimento de 15 dias ou expurgo imediato dos dados operacionais (`purgeUserDataCompletely`).
  - Registros estritamente necessários para cumprimento de obrigação legal ou defesa em processos (Art. 16, I da LGPD, e Marco Civil da Internet — 6 meses para registros de aplicação) são mantidos de forma isolada e minimizada até o término do prazo legal, sendo definitivamente eliminados após esse período.

---

## 5. Plano de Resposta a Incidentes de Segurança (PRIS)

1. **Fase 1 — Detecção e Triagem (0 a 30 min)**:
   - Monitoramento contínuo de `SecurityEvent` (picos de `UNAUTHORIZED_ACCESS_ATTEMPT`, `REFRESH_TOKEN_REUSE_DETECTED`, `ACCOUNT_LOCKED_BRUTE_FORCE`).
2. **Fase 2 — Contenção Imediata (30 min a 2h)**:
   - Revogação imediata de sessões afetadas (`revokeAllUserSessions`), rotação de chaves criptográficas de aplicação e bloqueio de origens maliciosas no WAF.
3. **Fase 3 — Erradicação e Recuperação (2h a 12h)**:
   - Correção da causa-raiz, aplicação de patches e verificação de integridade dos dados.
4. **Fase 4 — Comunicação à ANPD e aos Titulares (Art. 48 da LGPD)**:
   - Em caso de incidente de segurança que possa acarretar risco ou dano relevante aos titulares, o Encarregado (DPO) acionará a Autoridade Nacional de Proteção de Dados (ANPD) e notificará os titulares afetados dentro do prazo regulamentar (até 3 dias úteis conforme Resolução CD/ANPD nº 15/2024), informando de forma simples a natureza dos dados afetados, as medidas técnicas de proteção adotadas e as recomendações ao usuário.
