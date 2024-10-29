export const passwordResetEmailTemplate = (name: string, token: string) => `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Redefinição de Senha</title>
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
          .btn {
              display: inline-block;
              padding: 10px 20px;
              background: #007BFF;
              color: white;
              text-decoration: none;
              border-radius: 5px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>Redefinição de Senha</h1>
          </div>
          <p>Olá, ${name}</p>
          <p>Você solicitou a redefinição de sua senha. Clique no botão abaixo para redefini-la:</p>
          <a href="http://localhost:3000/reset?token=${token}" class="btn">Redefinir Senha</a>
          <p>Se você não solicitou esta redefinição, ignore este email.</p>
          <p>Atenciosamente,<br>A equipe Bolsa Click</p>
          <div class="footer">
              <p>&copy; 2024 Bolsa Click</p>
          </div>
      </div>
  </body>
  </html>
`;
