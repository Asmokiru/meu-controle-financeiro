import { seedDemoData, DEMO_USER_CREDENTIALS } from '../src/lib/seed-data.ts';
import { defaultStore } from '../src/lib/store/database.ts';

const { demoUserId } = seedDemoData(defaultStore);
console.log('==============================================================');
console.log('Meu Controle Financeiro - Seed de Demonstração Concluído');
console.log('Aviso: Todos os dados criados são 100% FICTÍCIOS ([EXEMPLO]).');
console.log(`ID do Usuário Demo: ${demoUserId}`);
console.log(`E-mail Demo: ${DEMO_USER_CREDENTIALS.email}`);
console.log('==============================================================');
