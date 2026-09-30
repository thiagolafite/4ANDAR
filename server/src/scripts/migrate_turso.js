import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega .env do servidor
dotenv.config({ path: path.join(__dirname, '../../.env') });

const dbUrl = process.env.TURSO_DATABASE_URL || `file:${path.join(__dirname, '../../data/turso_local.db')}`;
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

console.log('======================================================');
console.log('🚀 4ANDAR — MIGRAÇÃO & IMPORTAÇÃO DO BANCO NO TURSO');
console.log('======================================================');
console.log(`📡 Destino: ${dbUrl.startsWith('file:') ? 'Arquivo Local libSQL (' + dbUrl + ')' : dbUrl}`);
if (authToken) {
  console.log('🔑 Token de Autenticação: Configurado ✅');
} else if (!dbUrl.startsWith('file:')) {
  console.warn('⚠️ AVISO: TURSO_AUTH_TOKEN não foi definido no server/.env!');
}

const client = createClient({
  url: dbUrl,
  authToken: authToken
});

async function runMigration() {
  try {
    const sqlPath = path.join(__dirname, '../../../schema_turso_4andar.sql');
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Arquivo SQL não encontrado em: ${sqlPath}. Execute 'npm run db:export' primeiro.`);
    }

    const fullSql = fs.readFileSync(sqlPath, 'utf8');

    const statements = fullSql
      .split(/;[\r\n]+/)
      .map((s) => s.replace(/^--[^\n]*\n/gm, '').trim())
      .filter((s) => s.length > 0);

    console.log(`\n📦 Executando ${statements.length} blocos SQL no Turso...`);

    let countTables = 0;
    let countInserts = 0;

    for (const stmt of statements) {
      if (!stmt) continue;

      if (stmt.toUpperCase().includes('CREATE TABLE')) {
        countTables++;
      } else if (stmt.toUpperCase().includes('INSERT')) {
        countInserts++;
      }

      await client.execute(stmt);
    }

    console.log('\n📊 Resumo da Importação no Turso:');
    console.log(`  ✅ Tabelas criadas/verificadas: ${countTables}`);
    console.log(`  ✅ Blocos de dados inseridos: ${countInserts}`);

    // Validação das contagens finais no banco
    const [alunosRes, aulasRes, cronoRes, pagRes] = await Promise.all([
      client.execute('SELECT COUNT(*) as t FROM alunos'),
      client.execute('SELECT COUNT(*) as t FROM aulas'),
      client.execute('SELECT COUNT(*) as t FROM cronogramas'),
      client.execute('SELECT COUNT(*) as t FROM pagamentos')
    ]);

    console.log('\n🔍 Conferência no Banco de Dados:');
    console.log(`  • Alunos cadastrados: ${alunosRes.rows[0].t}`);
    console.log(`  • Turmas cadastradas: ${aulasRes.rows[0].t}`);
    console.log(`  • Aulas no Cronograma: ${cronoRes.rows[0].t} (Ano letivo completo)`);
    console.log(`  • Pagamentos registrados: ${pagRes.rows[0].t}`);

    console.log('\n🎉 SUCESSO! O banco de dados do 4ANDAR foi importado com perfeição para o Turso!');
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Erro durante a importação para o Turso:', err.message);
    process.exit(1);
  }
}

runMigration();
