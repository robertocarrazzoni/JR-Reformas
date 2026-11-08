import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/redefinir-senha?token=${resetToken}`;

  if (!resend) {
    // Falha explícita: sem a chave o e-mail NÃO é enviado. A rota continua
    // respondendo de forma neutra para não revelar se a conta existe, mas o
    // operador vê o erro no log em vez de descobrir pelo usuário.
    console.error(
      "RESEND_API_KEY não configurada: o e-mail de recuperação NÃO foi enviado.",
    );
    return;
  }

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "JR Reformas <onboarding@resend.dev>",
      to: email,
      subject: "Recuperação de Senha - JR Reformas",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
          <h2>Recuperação de Senha</h2>
          <p>Você solicitou a recuperação de senha para sua conta na JR Reformas.</p>
          <p>Clique no botão abaixo para redefinir sua senha:</p>
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">Redefinir Senha</a>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">Se você não solicitou isso, ignore este e-mail.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Erro ao enviar e-mail de recuperação:", error);
    throw new Error("Falha ao enviar e-mail de recuperação de senha");
  }
}
