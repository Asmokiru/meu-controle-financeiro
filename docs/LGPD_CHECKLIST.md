# Checklist de Conformidade LGPD (Lei nº 13.709/2018) — Meu Controle Financeiro

## 1. Mapeamento de Dados e Finalidade (Princípio da Necessidade e Minimização — Art. 6º, I a III)

| Dado Coletado | Finalidade Específica e Legítima | Base Legal (Art. 7º da LGPD) | Medida de Proteção Técnica |
| :--- | :--- | :--- | :--- |
| **Nome e E-mail** | Identificação da conta, login e envio de alertas críticos de segurança | Execução de contrato (Art. 7º, V) | Mascaramento em logs (`ma***@dominio`); verificação de e-mail |
| **Senha** | Autenticação exclusiva do titular | Execução de contrato / Prevenção à fraude (Art. 11, II, g) | Hash `Argon2id/Scrypt` com salt aleatório de 16 bytes; nunca armazenada em texto puro |
| **Segredo MFA (TOTP)** | Segundo fator de autenticação | Prevenção à fraude e segurança do titular | Criptografado em repouso com `AES-256-GCM` |
| **Renda Estimada e Movimentações Financeiras** | Exibição de gráficos, orçamentos, metas e simulador pessoal para o próprio titular | Execução de contrato (Art. 7º, V) | Criptografia em repouso (`AES-256-GCM`), isolamento estrito por `userId` |
| **Preferências de Categorização** | Sugestão automática de categoria para descrições recorrentes do próprio usuário | Consentimento / Legítimo interesse com opt-out imediato | Armazenado localmente no perfil isolado do usuário (`learnedCategoryRulesJson`), sem uso externo |
| **IP Mascarado e Navegador na Sessão** | Exibição de dispositivos conectados e detecção de acessos suspeitos | Prevenção à fraude e obrigação legal (Marco Civil da Internet) | Últimos octetos do IP truncados (`177.45.xxx.xxx`) |

> **Dados que NÃO coletamos por padrão:** CPF, RG, endereço residencial físico, geolocalização GPS precisa, senhas bancárias, número completo de cartão de crédito ou código CVV.

---

## 2. Checklist de Requisitos LGPD Implementados

- [x] **Política de Privacidade clara e em linguagem acessível**: Integrada à Central de Privacidade e exigida no momento do cadastro.
- [x] **Termos de Uso transparentes**: Deixando explícito que simulações e insights têm caráter educacional e organizacional, não configurando consultoria de valores mobiliários.
- [x] **Registro de Consentimentos (`ConsentRecord`)**: Histórico auditável contendo finalidade (`purposeCode`), versão da política (`2026.1`), data de concessão/revogação e IP mascarado.
- [x] **Direito de Acesso e Confirmação de Tratamento (Art. 18, I e II)**: O usuário visualiza todos os seus dados na Central de Privacidade.
- [x] **Direito de Correção de Dados Incompletos ou Inexatos (Art. 18, III)**: Perfil financeiro, categorias e lançamentos são 100% editáveis pelo titular.
- [x] **Direito à Portabilidade de Dados (Art. 18, V)**: Exportação estruturada em `JSON` (`/api/v1/privacy/export`) e `CSV` (`/api/v1/transactions/export-csv`) com registro em `DataExportRequest`.
- [x] **Direito à Eliminação e Exclusão de Conta (Art. 18, VI e Art. 16)**: Fluxo `requestAccountDeletion` com revogação imediata de sessões, período de confirmação claro (15 dias) ou expurgo imediato (`purgeUserDataCompletely`).
- [x] **Proibição de Treinamento Externo de IA sem Consentimento**: O aprendizado de categorias ocorre exclusivamente no dicionário isolado do próprio usuário; o consentimento `EXTERNAL_AI_TRAINING` vem **desativado por padrão (`false`)**.
- [x] **Proibição de Venda ou Publicidade Comportamental**: Zero rastreadores de terceiros (`interest-cohort=()` no cabeçalho `Permissions-Policy`) e zero compartilhamento comercial de dados financeiros.
- [x] **Canal de Contato com o Encarregado de Proteção de Dados (DPO — Art. 41)**: Exibido de forma visível na interface (`privacidade-dpo@meucontrole.ficticio.local`).
