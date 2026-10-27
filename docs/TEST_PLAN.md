# Plano de Testes e Garantia de Qualidade (QA) — Meu Controle Financeiro

## 1. Estratégia de Testes

A suíte automatizada (`tests/platform.test.ts`) foi construída sobre o executor nativo do Node.js 24 (`node:test` + `node:assert/strict`) para garantir execução determinística em CI/CD (`.github/workflows/ci-security.yml`) e no ambiente local.

Execute todos os testes com:
```powershell
npm test
```

---

## 2. Cobertura dos Fluxos Críticos

| Categoria de Teste | Fluxo Crítico Testado | Critério de Aceite | Status |
| :--- | :--- | :--- | :--- |
| **Testes Unitários de Criptografia** | Criptografia `AES-256-GCM`, Hash `Argon2id/Scrypt`, validação de senha forte | Ciphertext autenticado, rejeição de senhas fracas, verificação em tempo constante | ✅ Aprovado |
| **Testes de Autenticação e MFA** | Cadastro (aceite LGPD), verificação de e-mail, Login, TOTP RFC 6238, bloqueio após 5 falhas | Bloqueio automático na 5ª falha; exigência obrigatória de código TOTP de 6 dígitos quando 2FA está ativo | ✅ Aprovado |
| **Testes de Recuperação e Sessão** | Redefinição de senha com token único (15 min), rotação de *Refresh Token*, revogação global | Token invalidado após 1º uso; todas as sessões revogadas após troca de senha | ✅ Aprovado |
| **Testes de Regras de Negócio Financeiras** | Criação de transações, parcelamento automático, classificação inteligente com aprendizado local, desfazer exclusão | Soma exata de centavos nas parcelas; aprendizado local por estabelecimento após correção manual; restauração via `undoDeleteTransaction` | ✅ Aprovado |
| **Testes de Autorização entre Usuários (IDOR)** | Tentativa do Usuário B ler, editar ou excluir recursos da Usuária A | Retorno imediato `403 ForbiddenAccessError` e geração de `SecurityEvent` (`UNAUTHORIZED_ACCESS_ATTEMPT`) | ✅ Aprovado |
| **Testes de Segurança de Upload e LGPD** | Validação de *Magic Bytes* de anexos (PDF/PNG/JPEG), exportação de portabilidade JSON e exclusão total | Bloqueio de executável renomeado para `.pdf`; geração de URL assinada temporária; expurgo completo dos dados do titular | ✅ Aprovado |
| **Testes E2E HTTP, CSRF, Acessibilidade e Carga** | Cabeçalhos de segurança HTTP, proteção CSRF em `POST`, marcos WCAG 2.2 AA e rajada de 30 requisições simultâneas | Presença de CSP/HSTS/X-Frame-Options; `403` sem `X-CSRF-Token`; presença de `lang="pt-BR"` e *skip-link*; 100% de sucesso sob carga concorrente | ✅ Aprovado |

---

## 3. Verificação de Acessibilidade (WCAG 2.2 Nível AA)

1. **Perceptível**:
   - Contraste mínimo de 4.5:1 para textos normais e 3:1 para elementos gráficos tanto no modo claro quanto no modo escuro.
   - Gráficos e alertas nunca dependem exclusivamente de cor: incluem rótulos textuais (`85% utilizado`, `▲ +18% vs mês ant.`), ícones e atributos `role="progressbar"` com `aria-valuenow`, `aria-valuemin` e `aria-valuemax`.
2. **Operável**:
   - Link `Pular para o conteúdo principal` (`.skip-link`) visível ao receber foco via tecla `Tab`.
   - Indicador de foco `:focus-visible` nítido (`3px solid`) em todos os botões, campos e abas.
3. **Compreensível**:
   - Idioma declarado na raiz (`<html lang="pt-BR">`).
   - Linguagem acolhedora, sem jargões técnicos ou financeiros complexos, e avisos educacionais explícitos no simulador de dívidas.
4. **Robusto**:
   - Marcação HTML5 semântica (`<header>`, `<aside>`, `<nav>`, `<main>`, `<section>`, `<table>`) e região `aria-live="polite"` para notificações de desfazer exclusão.
