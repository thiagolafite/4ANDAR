import { turso } from '../db/turso.js';

async function executeWithRetry(sql, args = [], maxRetries = 3) {
  for (let i = 1; i <= maxRetries; i++) {
    try {
      if (args.length > 0) {
        return await turso.execute({ sql, args });
      }
      return await turso.execute(sql);
    } catch (err) {
      console.warn(`Tentativa ${i} falhou para "${sql.substring(0, 30)}...": ${err.message}`);
      if (i === maxRetries) throw err;
      await new Promise(r => setTimeout(r, 1500));
    }
  }
}

async function resetCleanDb() {
  console.log('🧹 Limpando todos os dados do banco de dados Turso...');

  const cleanStatements = [
    'DELETE FROM alunos',
    'DELETE FROM equipe',
    'DELETE FROM aulas',
    'DELETE FROM cronogramas',
    'DELETE FROM presencas',
    'DELETE FROM pagamentos',
    'DELETE FROM nivelamento_sessoes',
    'DELETE FROM eventos',
    'DELETE FROM avisos'
  ];

  for (const stmt of cleanStatements) {
    await executeWithRetry(stmt);
    console.log(`✓ ${stmt} executado.`);
  }

  // Deleta todos os usuários EXCETO o Master Thiago Lafite
  await executeWithRetry(
    'DELETE FROM usuarios WHERE is_master != 1 AND id != ? AND email != ?',
    ['usr_master_thiago', 'thiago.lafite@4andar.com.br']
  );
  console.log('✓ Usuários secundários removidos.');

  // Confirmação das contagens
  const tables = ['alunos', 'equipe', 'aulas', 'cronogramas', 'presencas', 'pagamentos', 'nivelamento_sessoes', 'eventos', 'avisos'];
  console.log('\n📊 Verificação pós-limpeza:');
  for (const t of tables) {
    const res = await executeWithRetry(`SELECT COUNT(*) as count FROM ${t}`);
    console.log(`- ${t}: ${res.rows[0].count} registros`);
  }

  const uRes = await executeWithRetry('SELECT id, nome, email, role, is_master, status FROM usuarios');
  console.log('\n👑 Usuários preservados no sistema:');
  console.log(uRes.rows);

  console.log('\n🎉 Concluído com sucesso: Banco de dados 100% limpo e pronto para iniciar do zero!');
}

resetCleanDb().catch(err => {
  console.error('Erro ao resetar banco:', err);
  process.exit(1);
});
