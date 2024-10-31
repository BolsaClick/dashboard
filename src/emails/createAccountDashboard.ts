export const createAccountDashboard = (password: string, name: string, token: string) => `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recuperação de Senha</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 0;
          }
          .container {
              max-width: 600px;
              margin: auto;
              padding: 20px;
              border: 1px solid #ccc;
              border-radius: 5px;
          }
          .header {
              background: #f4f4f4;
              padding: 10px 0;
              text-align: center;
          }
          .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 0.8em;
              color: #666;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>Cadastro realizado com sucesso!</h1>
          </div>
          <p>Olá, ${name}</p>
          <p>Seu cadastro foi realizado com sucesso.</strong></p>
          <p>Sua senha é: <strong>${password}</strong></p>
          <p>Por favor, altere a senha assim que possível.</p>
          <p>Você pode usar o seguinte token para redefinir sua senha:   <a href="${process.env.NEXT_PUBLIC_API_URL}/reset?token=${token}" class="btn">Redefinir Senha</a>
          <p>Atenciosamente,<br>A equipe Bolsa Click</p>
          <div class="footer">
              <p>&copy; 2024 Bolsa Click</p>
          </div>
      </div>
  </body>
  </html>
`;
