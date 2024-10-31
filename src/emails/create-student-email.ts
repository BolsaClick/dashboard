export const createStudentEmail = (name: string) => `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmação de Cadastro</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 0;
              background-color: #f9f9f9;
          }
          .container {
              max-width: 600px;
              margin: auto;
              padding: 20px;
              background: white;
              border: 1px solid #ccc;
              border-radius: 5px;
          }
          .header {
              background: #00875F;
              color: white;
              padding: 10px 0;
              text-align: center;
              border-radius: 5px 5px 0 0;
          }
          .logos {
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 20px 0;
          }
          .logo {
              max-width: 150px; /* Defina um tamanho máximo para os logos */
              margin: 0 10px; /* Margem entre os logos */
          }
          .divider {
              width: 1px; /* Largura do divisor */
              background-color: #ccc; /* Cor do divisor */
              height: 50px; /* Altura do divisor */
              margin: 0 20px; /* Margem em torno do divisor */
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
              <h1>Parabéns!</h1>
          </div>
          <p>Olá, ${name}</p>
          <p>Seu cadastro foi realizado com sucesso!</p>
          <p><strong>Parabéns! Você ganhou 80% de desconto na universidade parceira.</strong></p>
          <p>Em breve, alguém da faculdade entrará em contato com você para fornecer mais informações e ajudá-lo em sua jornada acadêmica.</p>
          <p>Se você tiver alguma dúvida, não hesite em entrar em contato conosco.</p>
          
          <!-- Logos -->
          <div class="logos">
              <img src="https://bolsaclick.com.br/images/logo-green.svg" alt="Logo Bolsa Click" class="logo" />
              <div class="divider"></div>
              <img src="https://bolsaclick.com.br/images/logo-anhanguera.svg" alt="Logo Anhanguera" class="logo" />
          </div>
          
          <p>Atenciosamente,<br>A equipe Bolsa Click</p>
          <div class="footer">
              <p>&copy; 2024 Bolsa Click</p>
          </div>
      </div>
  </body>
  </html>
`;
