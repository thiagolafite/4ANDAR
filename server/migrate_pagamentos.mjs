import { createClient } from '@libsql/client';

const turso = createClient({
  url: 'https://quartoandar-thiagolafite.aws-us-east-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA3MjY5NDEsImlkIjoiMDFhMGVmYTItZTMwMS03OWJhLWJjZjctNDk1ZjRjMGQ4OGE2Iiwia2lkIjoiZE1fbVhMaUFjLWFYOWJFcXNCcmt6UjFYOWJBOUpncm9mOWNVYUZCZS11MCIsInJpZCI6ImVjYmEwNTM0LTBjMmYtNDgxOC1hY2RlLWZlZjY3ZTc3MDUxOSJ9.jaom4pcbPiz-0PdJgV1FtbyeM1coHsp5r8umRaXxKct7RtSe4obLzzO1cBGnFu3vloXvnvmFxrGe1Cmn_Q3bBA'
});

async function main() {
  try {
    await turso.execute("ALTER TABLE alunos ADD COLUMN tipo_frequencia TEXT DEFAULT 'mensalista'");
    console.log('Coluna tipo_frequencia adicionada!');
  } catch (e) {
    console.log('tipo_frequencia:', e.message);
  }

  try {
    await turso.execute('ALTER TABLE alunos ADD COLUMN data_vencimento_atual TEXT');
    console.log('Coluna data_vencimento_atual adicionada!');
  } catch (e) {
    console.log('data_vencimento_atual:', e.message);
  }

  try {
    await turso.execute('ALTER TABLE alunos ADD COLUMN data_pagamento_atual TEXT');
    console.log('Coluna data_pagamento_atual adicionada!');
  } catch (e) {
    console.log('data_pagamento_atual:', e.message);
  }

  const info = await turso.execute('PRAGMA table_info(alunos)');
  console.log('Colunas:', info.rows.map(r => r.name).join(', '));
  console.log('Migration concluída!');
}

main();
