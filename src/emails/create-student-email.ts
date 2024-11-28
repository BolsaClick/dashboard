export const createStudentEmail = (name: string, courseName: string) => `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmação de Inscrição</title>
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
        margin-top: 10px;
      }
      .header {
        text-align: center;
        color: #333;
    
       
      }
      .highlight {
        font-weight: bold;
        color: #00875F;
      }
      .button {
        display: inline-block;
        padding: 10px 20px;
        margin-top: 20px;
        background-color: #00875F;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
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
      .info {
        margin-top: 20px;
        background-color: #f2f2f2;
        padding: 15px;
        border-radius: 5px;
      }
      .footer {
        margin-top: 20px;
        text-align: center;
        font-size: 0.8em;
        color: #666;
      }
      @media (max-width: 480px) {
        .container {
          padding: 15px;
        }
        .button {
          padding: 12px 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
       <div class="logos">
        <img src="http://cdn.mcauto-images-production.sendgrid.net/3c7ce3637722532c/cb322cfe-0d17-4441-80c2-3dbe8e390072/406x68.png" alt="Logo Bolsa Click" class="logo" />
        </div>
        <h1>✨ Você está a poucos passos de ser um universitário!</h1>
      </div>
      <p>Olá, ${name}</p>
      <p>Já identificamos a sua <span class="highlight">Inscrição Gratuita</span> para estudar <strong>${courseName}</strong> com bolsa na Anhanguera!</p>
      
      <h2>Próximo passo:</h2>
      <p>Acesse o site da instituição clicando no botão abaixo e digite o seu CPF para acompanhar a sua inscrição. É neste site que você vai acessar o boleto para pagamento da sua matrícula.</p>
      <a href="https://www.anhanguera.com/area-do-candidato/login" class="button">Acompanhar minha inscrição</a>
      
    <p><strong>Aproveite, nossas ofertas expiram rápido.</strong> Faça o pagamento da sua matrícula para garantir o preço que viu em nosso site!</p>

      <h2>Precisa de ajuda? Chama no Whats!</h2>
      <a href="https://wa.me/5511940063113" class="button">Iniciar conversa</a>
      <p>Estamos on-line de segunda a sexta, das 9h às 18h.</p>
      
      <p>Vai de graduação ou de pós? Vai de Bolsa!</p>
      
      <p>São Paulo - SP.<br>Atendimento de segunda a sexta, das 9h às 18h pelo WhatsApp (11) 9 4006-3113.</p>
      
      <div class="footer">
        <div class="logos">
        <img src="http://cdn.mcauto-images-production.sendgrid.net/3c7ce3637722532c/cb322cfe-0d17-4441-80c2-3dbe8e390072/406x68.png" alt="Logo Bolsa Click" class="logo" />
        <div class="divider"></div>
        <img src="http://cdn.mcauto-images-production.sendgrid.net/3c7ce3637722532c/5506aac3-b8c8-4458-af0d-844853a9aa30/170x60.png" alt="Logo Anhanguera" class="logo" />
      </div>
       
        <p>Para deixar de receber esses e-mails, <a href="https://unsubscribe.link">clique aqui</a>.</p>
      </div>
    </div>
  </body>
  </html>

`;
