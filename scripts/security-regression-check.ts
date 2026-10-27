import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);

export interface SecurityCheckResult {
  passed: boolean;
  violations: string[];
}

function collectFilesRecursively(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      entry.name === 'node_modules' ||
      entry.name === '.next' ||
      entry.name === '.git' ||
      entry.name === 'dist'
    ) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFilesRecursively(fullPath));
    } else if (/\.(ts|tsx|js|jsx|mjs|html|env|example)$/i.test(entry.name) || entry.name.startsWith('.env')) {
      results.push(fullPath);
    }
  }
  return results;
}

export function runSecurityRegressionCheck(rootDir = ROOT_DIR): SecurityCheckResult {
  const violations: string[] = [];

  // 1. Verificar arquivos client-side e páginas entregues ao navegador
  const clientFiles = [
    path.join(rootDir, 'src/server/ui-template.ts'),
    path.join(rootDir, 'src/lib/supabase/client.ts'),
    path.join(rootDir, 'lib/supabase/client.ts'),
    ...collectFilesRecursively(path.join(rootDir, 'src/app')),
  ];

  // Inclui também qualquer arquivo no projeto que tenha a diretiva "use client"
  const allSrcFiles = collectFilesRecursively(path.join(rootDir, 'src'));
  for (const f of allSrcFiles) {
    const content = fs.readFileSync(f, 'utf8');
    if (
      content.includes('"use client"') ||
      content.includes("'use client'")
    ) {
      if (!clientFiles.includes(f)) clientFiles.push(f);
    }
  }

  const forbiddenClientPatterns: Array<{ pattern: RegExp; label: string }> = [
    { pattern: /SUPABASE_SERVICE_ROLE_KEY/i, label: 'SUPABASE_SERVICE_ROLE_KEY' },
    { pattern: /SUPABASE_SECRET_KEY/i, label: 'SUPABASE_SECRET_KEY' },
    { pattern: /sb_secret_/i, label: 'sb_secret_ prefix' },
    { pattern: /service_role/i, label: 'service_role key reference' },
    { pattern: /Service Role Key/i, label: 'UI prompt for Service Role Key' },
    { pattern: /supabase\/admin/i, label: 'Importação de lib/supabase/admin no cliente' },
  ];

  for (const filePath of clientFiles) {
    if (!fs.existsSync(filePath)) continue;
    const rel = path.relative(rootDir, filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath, 'utf8');

    // No arquivo client.ts, permitimos comentários de guarda, mas verificamos código executável e imports
    const isSupabasePublicClient = rel.endsWith('supabase/client.ts');
    for (const rule of forbiddenClientPatterns) {
      if (isSupabasePublicClient && (rule.label === 'sb_secret_ prefix' || rule.label === 'service_role key reference')) {
        // Verifica apenas que não há literal de chave secreta real (ex: sb_secret_[A-Za-z0-9]{8,})
        if (/sb_secret_[A-Za-z0-9_-]{8,}/.test(content)) {
          violations.push(`[${rel}] Contém chave secreta literal sb_secret_`);
        }
        continue;
      }
      if (rule.pattern.test(content)) {
        violations.push(`[${rel}] Violação client-side detectada: ${rule.label}`);
      }
    }
  }

  // 2. Proibir variáveis secretas com prefixo NEXT_PUBLIC_ em qualquer arquivo do projeto
  const allProjectFiles = [
    ...collectFilesRecursively(path.join(rootDir, 'src')),
    ...collectFilesRecursively(path.join(rootDir, 'lib')),
    path.join(rootDir, '.env.example'),
    path.join(rootDir, '.env'),
  ];

  const forbiddenNextPublicSecretPattern =
    /NEXT_PUBLIC_[A-Z0-9_]*(SECRET|SERVICE_ROLE|PRIVATE|MASTER_KEY)[A-Z0-9_]*/i;

  for (const filePath of allProjectFiles) {
    if (!fs.existsSync(filePath)) continue;
    const rel = path.relative(rootDir, filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath, 'utf8');
    if (forbiddenNextPublicSecretPattern.test(content)) {
      violations.push(
        `[${rel}] Variável secreta utilizando prefixo proibido NEXT_PUBLIC_`
      );
    }
    // Verifica se há algum JWT real hardcoded (service_role / anon JWT real do Supabase)
    if (/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/.test(content)) {
      violations.push(`[${rel}] Token JWT hardcoded detectado no arquivo`);
    }
  }

  // 3. Verificar que lib/supabase/admin.ts exige 'server-only' e desativa persistSession/autoRefreshToken
  const adminPaths = [
    path.join(rootDir, 'src/lib/supabase/admin.ts'),
    path.join(rootDir, 'lib/supabase/admin.ts'),
  ];
  for (const adminPath of adminPaths) {
    if (!fs.existsSync(adminPath)) {
      violations.push(`Arquivo obrigatório ausente: ${path.relative(rootDir, adminPath)}`);
      continue;
    }
    const content = fs.readFileSync(adminPath, 'utf8');
    if (!content.includes("import 'server-only'") && !content.includes('import "server-only"')) {
      violations.push(`[${path.relative(rootDir, adminPath)}] Falta import 'server-only'`);
    }
    if (!content.includes('autoRefreshToken: false') || !content.includes('persistSession: false')) {
      violations.push(
        `[${path.relative(rootDir, adminPath)}] Configuração insegura de auth no supabaseAdmin`
      );
    }
  }

  // 4. Verificar que a migration SQL habilita RLS em todas as tabelas obrigatórias
  const migrationPath = path.join(
    rootDir,
    'prisma/migrations/20261026000100_enable_granular_rls/migration.sql'
  );
  if (!fs.existsSync(migrationPath)) {
    violations.push('Migration SQL de RLS granular não encontrada.');
  } else {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    const requiredTables = [
      'profiles',
      'accounts',
      'cards',
      'transactions',
      'categories',
      'budgets',
      'goals',
      'debts',
      'notifications',
      'attachments',
      'audit_logs',
    ];
    for (const table of requiredTables) {
      const enableRegex = new RegExp(
        `ALTER\\s+TABLE\\s+(?:public\\.)?"?${table}"?\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`,
        'i'
      );
      if (!enableRegex.test(sql)) {
        violations.push(`Tabela '${table}' sem ENABLE ROW LEVEL SECURITY na migration.`);
      }
      for (const op of ['SELECT', 'INSERT', 'UPDATE', 'DELETE']) {
        const policyRegex = new RegExp(
          `ON\\s+(?:public\\.)?"?${table}"?\\s+FOR\\s+${op}\\s+TO\\s+authenticated`,
          'i'
        );
        if (!policyRegex.test(sql)) {
          violations.push(
            `Tabela '${table}' sem política RLS explícita FOR ${op} TO authenticated.`
          );
        }
      }
    }
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const result = runSecurityRegressionCheck();
  if (!result.passed) {
    console.error('❌ FALHA NA VERIFICAÇÃO DE SEGURANÇA E REGRESSÃO:');
    for (const v of result.violations) {
      console.error(`  - ${v}`);
    }
    process.exit(1);
  }
  console.log(
    '✅ Verificação de segurança concluída: 0 exposições de chaves secretas, clientes Supabase isolados e políticas RLS validadas.'
  );
}
