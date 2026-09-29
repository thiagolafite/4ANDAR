import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create transporter: uses environment SMTP if provided, or fallback ethereal test account
let transporter = null;

export const getEmailTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Development fallback logger (does not fail when offline)
    transporter = {
      sendMail: async (mailOptions) => {
        console.log(`\n📧 [EMAIL SIMULADO ENVIADO COM SUCESSO - 100% INDEPENDENTE]`);
        console.log(`Para: ${mailOptions.to}`);
        console.log(`Assunto: ${mailOptions.subject}`);
        console.log(`Conteúdo Prévia: ${mailOptions.text || 'HTML Template'}`);
        return { messageId: `msg_${Date.now()}` };
      }
    };
  }
  return transporter;
};

/**
 * Envia e-mail de lembrete de mensalidade (Substitui completamente funções externas do Base44)
 */
export const enviarLembreteMensalidade = async ({
  alunoNome,
  email,
  valor,
  dataVencimento,
  referenciaMes,
  status
}) => {
  const mailer = await getEmailTransporter();
  const chavePix = process.env.CHAVE_PIX || 'pix@4andar.com.br';

  const isAtrasado = status === 'Atrasado';
  const subject = isAtrasado
    ? `⚠️ [4ANDAR] Mensalidade em atraso — ${referenciaMes}`
    : `📢 [4ANDAR] Lembrete de vencimento da mensalidade — ${referenciaMes}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fed7aa; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #ea580c; margin: 0; font-size: 24px;">4ANDAR — Escola de Dança</h1>
        <p style="color: #64748b; font-size: 13px; margin: 4px 0 0;">Gestão Pedagógica de Forró</p>
      </div>

      <div style="background-color: ${isAtrasado ? '#fff1f2' : '#fff7ed'}; border-left: 4px solid ${isAtrasado ? '#f43f5e' : '#f97316'}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 8px; color: ${isAtrasado ? '#9f1239' : '#9a3412'}; font-size: 16px;">
          ${isAtrasado ? 'Aviso de Mensalidade Vencida' : 'Lembrete de Vencimento'}
        </h3>
        <p style="margin: 0; font-size: 14px; color: #334155;">
          Olá, <strong>${alunoNome}</strong>! Lembramos que sua mensalidade referente a <strong>${referenciaMes}</strong> ${isAtrasado ? 'venceu em' : 'vence no dia'} <strong>${dataVencimento}</strong>.
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Valor da Mensalidade:</td>
          <td style="padding: 8px 0; font-weight: bold; color: #0f172a; text-align: right;">R$ ${Number(valor).toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Vencimento:</td>
          <td style="padding: 8px 0; font-weight: bold; color: #0f172a; text-align: right;">${dataVencimento}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Status Atual:</td>
          <td style="padding: 8px 0; font-weight: bold; color: ${isAtrasado ? '#e11d48' : '#d97706'}; text-align: right;">${status}</td>
        </tr>
      </table>

      <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 20px;">
        <p style="margin: 0 0 6px; font-size: 12px; font-weight: bold; color: #475569; text-transform: uppercase;">Chave PIX da Escola:</p>
        <code style="background-color: #ffffff; padding: 6px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; color: #0f172a; font-weight: bold; display: inline-block;">${chavePix}</code>
        <p style="margin: 8px 0 0; font-size: 11px; color: #94a3b8;">Após realizar a transferência, a baixa é confirmada pela secretaria.</p>
      </div>

      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 30px;">
        4ANDAR Escola de Dança • São Paulo, SP<br/>
        E-mail gerado automaticamente pelo sistema próprio da escola.
      </p>
    </div>
  `;

  return mailer.sendMail({
    from: `"4ANDAR Forró" <${process.env.SMTP_FROM || 'secretaria@4andar.com.br'}>`,
    to: email,
    subject,
    text: `Olá ${alunoNome}, sua mensalidade do 4ANDAR referente a ${referenciaMes} (R$ ${Number(valor).toFixed(2)}) vence em ${dataVencimento}. Chave PIX: ${chavePix}`,
    html
  });
};
