export const createStudentEmail = (name: string) => `
  <!DOCTYPE html>
 <html>
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
        width: 100%;
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
        flex-wrap: wrap; /* Permitir que as imagens se ajustem em dispositivos móveis */
      }
      .logo {
        max-width: 120px; /* Defina um tamanho máximo menor para dispositivos móveis */
        margin: 10px; /* Espaço ao redor das logos */
      }
      .divider {
        width: 1px;
        background-color: #ccc;
        height: 50px;
        margin: 0 20px;
      }
      .footer {
        margin-top: 20px;
        text-align: center;
        font-size: 0.8em;
        color: #666;
      }

      /* Estilos responsivos para dispositivos móveis */
      @media (max-width: 480px) {
        .container {
          padding: 15px;
        }
        .header h1 {
          font-size: 1.5em;
        }
        .logos {
          flex-direction: column; /* Alterar para coluna em dispositivos móveis */
        }
        .divider {
          display: none; /* Ocultar o divisor em dispositivos móveis */
        }
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
        <img src="http://cdn.mcauto-images-production.sendgrid.net/3c7ce3637722532c/cb322cfe-0d17-4441-80c2-3dbe8e390072/406x68.png" alt="Logo Bolsa Click" class="logo" />
        <div class="divider"></div>
        <img src="http://cdn.mcauto-images-production.sendgrid.net/3c7ce3637722532c/5506aac3-b8c8-4458-af0d-844853a9aa30/170x60.png" alt="Logo Anhanguera" class="logo" />
      </div>
      
      <p>Atenciosamente,<br>A equipe Bolsa Click</p>
      <div class="footer">
        <p>&copy; 2024 Bolsa Click</p>
      </div>
    </div>
  </body>
</html>

`;
