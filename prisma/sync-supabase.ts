import { defaultStore } from '../src/lib/store/database.ts';
import { seedDemoData } from '../src/lib/seed-data.ts';
import { syncStoreToSupabase } from '../src/lib/store/supabase-sync.ts';

const { demoUserId } = seedDemoData(defaultStore);
console.log('Iniciando sincronização com o Supabase Cloud...');
const result = await syncStoreToSupabase(defaultStore, demoUserId);
console.log(JSON.stringify(result, null, 2));
if (!result.synced) {
  process.exitCode = 1;
}
