import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
const prisma = new PrismaClient()

const courses = [


{
  name: 'Administração - Bacharelado',
  courseIds: ['1d00ec8e20cd5f39be16ab16d9a8cf4e'],
  },
{
name: 'Administração Pública - Bacharelado',
courseIds: ['f198b1200eaa3a23b67002f0ae8f35a3'],
},
{
  name: 'Agronegócios - Tecnólogo',
  courseIds: ['c8fe3994ba0e19e0e69541833e63cf57'],
  },
{
name: 'Agronomia - Bacharelado',
courseIds: ['24aa569d3d43ed366854730d6793ac75'],
},
{
  name: 'Análise e Desenvolvimento de Sistemas - Tecnólogo',
  courseIds: ['e00edaf95dd4365262712e4f4716cd72'],
  },
{
name: 'Arquitetura de Dados - Tecnólogo',
courseIds: ['0669c10b6cf5c877b854c52847af5092'],
},
{
  name: 'Arquitetura e Urbanismo - Bacharelado',
  courseIds: ['461cfb0e2e13f035ab2a6b74aba37478'],
  },
{
name: 'Artes Visuais - Bacharelado',
courseIds: ['1ef1c356fc47da4478e809c7d9834dae'],
},
{
  name: 'Artes Visuais - Licenciatura',
  courseIds: ['6ee2da82ccb3d4c92a8d3013306c7fe8'],
  },
{
name: 'Automação Industrial - Tecnólogo',
courseIds: ['a977ef9604d026c9da9a8953c31a222c'],
},
{
  name: 'Biomedicina - Bacharelado',
  courseIds: ['72a6dda876632cd78ab52eb380fabb95'],
  },
{
name: 'Blockchain, Criptomoedas e Finanças na Era Digital - Tecnólogo',
courseIds: ['dfebce70a71dfd45ba1d8874b3e1f50b'],
},
{
  name: 'Cibersegurança -Tecnólogo',
  courseIds: ['a2107244ed63e7d7edd8d096f4363e35'],
  },
{
name: 'Ciência Política - Bacharelado',
courseIds: ['26b3a7bfc21038a55e456358521b1a60'],
},
{
  name: 'Ciência da Computação - Bacharelado',
  courseIds: ['7b2fbf404938a3d6a47456d4ff674c5f'],
  },
{
name: 'Ciência de Dados - Tecnólogo',
courseIds: ['a70cfb9d7b11c95388b67a83ecd89ca9'],
},
{
  name: 'Ciências Aeronáuticas - Bacharelado',
  courseIds: ['4019511d54c9dc79039690064a7fb57d'],
  },
{
name: 'Ciências Biológicas - Bacharelado',
courseIds: ['a0e640b93383b16b5ccc214d2d5d78ab'],
},
{
  name: 'Ciências Biológicas - Licenciatura',
  courseIds: ['33e25478c39e270fdc88117fd4ed716a'],
  },
{
name: 'Ciências Contábeis - Bacharelado',
courseIds: ['7097575f5c6ed0709a313ac587e485f9'],
},
{
  name: 'Ciências Econômicas - Bacharelado',
  courseIds: ['3e65a0abd3e75621e4be864709f918ea'],
  },
{
name: 'Coaching e Desenvolvimento Humano - Tecnólogo',
courseIds: ['73d8f964415a9c3205d0cea86bf8c21c'],
},
{
  name: 'Computação em Nuvem - Tecnólogo',
  courseIds: ['6a6299ba364503756849bd1485d75132'],
  },
{
name: 'Comércio Exterior - Tecnólogo',
courseIds: ['db6c3ab20b33e753222ff65f8a4e5df4'],
},
{
  name: 'Criminologia - Bacharelado',
  courseIds: ['b1ef7dcd107d95b6bd12b00370e25d19'],
  },
{
name: 'Desenvolvimento Mobile - Tecnólogo',
courseIds: ['bdaa3585318760406d3dbe3259de06fd'],
},
{
  name: 'Desenvolvimento Web - Tecnólogo',
  courseIds: ['a75c8bed262cb2e393b14bf556b28058'],
  },
{
name: 'Design - Bacharelado',
courseIds: ['1c98ae9ee17a6545aa43468a37e5d9ea'],
},
{
  name: 'Design Gráfico - Tecnólogo',
  courseIds: ['26eae5dbf13d24956a122160093c7dae'],
  },
{
name: 'Design de Interiores - Tecnólogo',
courseIds: ['0fc6f47869e8df896e2047f8351afa38'],
},
{
  name: 'Design de Moda - Tecnólogo',
  courseIds: ['f9fbb320ee16265f5fd292a7c15ae66b'],
  },
{
name: 'DevOps - Tecnólogo',
courseIds: ['6a81d2aea0e56beb7819e4b28636bbd8'],
},
{
  name: 'Direito - Bacharelado',
  courseIds: ['e084f3647e312d58c44972484ffcc083'],
  },
{
name: 'Educação Especial - Licenciatura',
courseIds: ['aaa516a6cca59bb6ef39b0903dc106bf'],
},
{
  name: 'Educação Física - Bacharelado',
  courseIds: ['5664cf9d12bad0fda3dbb28afcee8eb2'],
  },
{
name: 'Educação Física - Licenciatura',
courseIds: ['2be54679c64d574eb141640866ea86a7'],
},
{
  name: 'Empreendedorismo - Tecnólogo',
  courseIds: ['534b97d0f0197c3bd176da89c6c31b13'],
  },
{
name: 'Empreendedorismo e Novos Negócios - Tecnólogo',
courseIds: ['a7465fc7ec7235c069a5808ec0a11e3a'],
},
{
  name: 'Enfermagem - Bacharelado',
  courseIds: ['44ce4c455a63dd5f9c028ed2a94fbc82'],
  },
{
name: 'Engenharia Ambiental - Bacharelado',
courseIds: ['9364b1e76a3bf098e04002b7ab7a6569'],
},
{
  name: 'Engenharia Ambiental e Sanitária - Bacharelado',
  courseIds: ['159ef840f4d1928c0d786ec55b34661a'],
  },
{
name: 'Engenharia Civil - Bacharelado',
courseIds: ['2a6c9298612f81dd466e79e30faafcf6'],
},
{
  name: 'Engenharia Elétrica - Bacharelado',
  courseIds: ['db19adff79358c15f7773e36aecaaee4'],
  },
{
name: 'Engenharia Mecânica - Bacharelado',
courseIds: ['369589d1c0ad49d52a765f59c48c78cf'],
},
{
  name: 'Engenharia Química - Bacharelado',
  courseIds: ['eab4f8182858c5916ec938269b4b5854'],
  },
{
name: 'Engenharia da Computação - Bacharelado',
courseIds: ['5b2e8732bc5a49bf4103dd46e2eea1fd'],
},
{
  name: 'Engenharia de Controle de Automação',
  courseIds: ['d26554a5ec411750444fd6b08dad3b07'],
  },
{
name: 'Engenharia de Controle e Automação - Bacharelado',
courseIds: ['8d9226317345ae6437c7773c58e52678'],
},
{
  name: 'Engenharia de Minas - Bacharelado',
  courseIds: ['26d58c61a7dcc01692e7d83118003489'],
  },
{
name: 'Engenharia de Produção - Bacharelado',
courseIds: ['22e790f14bb739154e74ddb86870744c'],
},
{
  name: 'Engenharia de Software - Bacharelado',
  courseIds: ['182efd137875049f6e8921ea39fd4447'],
  },
{
name: 'Engenharia de Software - Bacharelado',
courseIds: ['fd2b35469f35a92eefa81f989485bf67'],
},
{
  name: 'Estética e Cosmética - Tecnólogo',
  courseIds: ['b65ac770e2056b2629b83913a22afd69'],
  },
{
name: 'Eventos - Tecnólogo',
courseIds: ['834532c19fde8d37de383cbf7870789a'],
},
{
  name: 'Farmácia - Bacharelado',
  courseIds: ['b05de30dd01c0081d9d0088274d6e7d3'],
  },
{
name: 'Filosofia - Licenciatura',
courseIds: ['bafab564fc4bf8d0da9e0ebc493116a2'],
},
{
  name: 'Fisioterapia - Bacharelado',
  courseIds: ['bd4ffcb6f93496b906af33b6875c2a7f'],
  },
{
name: 'Fonoaudiologia - Bacharelado',
courseIds: ['32ec4dfffc59eef618c91e7bcec80ff8'],
},
{
  name: 'Formação Pedagógica em Ciências Biológicas - Licenciatura',
  courseIds: ['eb9e26261079f5b68797ead94cb151c3'],
  },
{
name: 'Formação Pedagógica em Educação Física - Licenciatura',
courseIds: ['7a0f5d7905ed0f9dd8ed4b9955bc6bfe'],
},
{
  name: 'Formação Pedagógica em História - Licenciatura',
  courseIds: ['c52dcdcafcbea1b6c0130b60c994342d'],
  },
{
name: 'Formação Pedagógica em Letras - Licenciatura',
courseIds: ['9919ec5e608c87968b11fd03d271c81e'],
},
{
  name: 'Formação Pedagógica em Matemática - Licenciatura',
  courseIds: ['f8843da16d293d1ca62648121689523a'],
  },
{
name: 'Formação Pedagógica em Sociologia - Licenciatura',
courseIds: ['55eea72a845b8a72e48067cc757d8491'],
},
{
  name: 'Fotografia - Tecnólogo',
  courseIds: ['e525c15d44bdb2587c0884ff25a2f78e'],
  },
{
name: 'Fotografia - Tecnólogo',
courseIds: ['a3e1378b4aada063d943433969079a2c'],
},
{
  name: 'Gastronomia - Tecnólogo',
  courseIds: ['df7187c60011821d6191ffcce89416b4'],
  },
{
name: 'Geografia - Licenciatura',
courseIds: ['be4b06bdeacb1c34c334b663fd6e944f'],
},
{
  name: 'Gerontologia - Tecnólogo',
  courseIds: ['2a74ac24568596f47e9418440ccc03f7'],
  },
{
name: 'Gestão Ambiental - Tecnólogo',
courseIds: ['28de94e64948ff15671afabcef726039'],
},
{
  name: 'Gestão Comercial - Tecnólogo',
  courseIds: ['2c95b09d57ea3d59aa2d19b14a0fc6d9'],
  },
{
name: 'Gestão Financeira - Tecnólogo',
courseIds: ['36ca1133b27dcea8933c69f2647a9ee7'],
},
{
  name: 'Gestão Hospitalar - Tecnólogo',
  courseIds: ['7f51e90c12c9fdc22335ffb040cc9e27'],
  },
{
name: 'Gestão Portuária - Tecnólogo',
courseIds: ['256d6813968534937594ffb6b8a4cbc5'],
},
{
  name: 'Gestão Pública - Tecnólogo',
  courseIds: ['39be409b876c1701422746cfecdbe17c'],
  },
{
name: 'Gestão da Inovação - Tecnólogo',
courseIds: ['ced354d3220aa2018bcb09f4caab2d94'],
},
{
  name: 'Gestão da Produção Industrial - Tecnólogo',
  courseIds: ['1c996aec25446f0baa167def7c9253d3'],
  },
{
name: 'Gestão da Qualidade - Tecnólogo',
courseIds: ['77c6bb37577a4a98f7b95904ae8aac3a'],
},
{
  name: 'Gestão da Tecnologia da Informação - Tecnólogo',
  courseIds: ['d73bf5669474b0c5b844f188378a2064'],
  },
{
name: 'Gestão de Cooperativas - Tecnólogo',
courseIds: ['b820d3fcbcd883573c3c7c641d610281'],
},
{
  name: 'Gestão de Produto - Tecnólogo',
  courseIds: ['f76452d63a44f87903edeced8986ae0f'],
  },
{
name: 'Gestão de Recursos Humanos - Tecnólogo',
courseIds: ['7201a6da2e2cb0915f957b2c785ad2e5'],
},
{
  name: 'Gestão de Saúde Pública - Tecnólogo',
  courseIds: ['ec0fca30615b0b62b5f9c8a2eef599c1'],
  },
{
name: 'Gestão de Segurança Privada - Tecnólogo',
courseIds: ['e2fdffe691de472e249e72216c5d72d3'],
},
{
  name: 'Gestão de Turismo - Tecnólogo',
  courseIds: ['4a491f426d30eda723bd99d37e39e571'],
  },
{
name: 'História - Licenciatura',
courseIds: ['86531f51646b93547d07f96e5222fde8'],
},
{
  name: 'Inteligência de Mercado e Análise de Dados -  Tecnólogo',
  courseIds: ['b17db1d90a99da9940796d0bcd23cc83'],
  },
{
name: 'Investigação e Perícia Criminal - Tecnólogo',
courseIds: ['fd72a46564dda83c532ec289e7fd3c21'],
},
{
  name: 'Jogos Digitais - Tecnólogo',
  courseIds: ['2d67659ba1abc024a06daf85416ec67f'],
  },
{
name: 'Jornalismo - Bacharelado',
courseIds: ['954ba2168c8c593be4f6b44de865cd4e'],
},
{
  name: 'Letras - Língua Portuguesa',
  courseIds: ['e8b5dda98da218f71dbc6db510c90466'],
  },
{
name: 'Letras - Português - Licenciatura',
courseIds: ['82c3f4618bdf73325276bb7a4d5081f9'],
},
{
  name: 'Letras - Português e Espanhol - Licenciatura',
  courseIds: ['b99b4742d07d262d2d04f11975a2fcf8'],
  },
{
name: 'Letras - Português e Inglês - Licenciatura',
courseIds: ['c2552f22cd1169f7993a28ec927d7485'],
},
{
  name: 'Letras - Português/Inglês',
  courseIds: ['2769dfd82588442a62389efadecf8c4c'],
  },
{
name: 'Logística - Tecnólogo',
courseIds: ['f9f280dd5b5bf40ba9f1362c48909991'],
},
{
  name: 'Marketing - Tecnólogo',
  courseIds: ['a6032c1fbc863563d9b16cbe7de1eafd'],
  },
{
name: 'Marketing Digital - Tecnólogo',
courseIds: ['6c95c454700a8d1e16e000a5726d6511'],
},
{
  name: 'Matemática - Licenciatura',
  courseIds: ['73b8c67774b7b77544ae43dc340aceae'],
  },
{
name: 'Mecatrônica Industrial - Tecnólogo',
courseIds: ['cf3c45bf49ef99df31b1c5e1ae00742b'],
},
{
  name: 'Mediação - Tecnólogo',
  courseIds: ['7ef850c5b016b55b196e95aa4f21c53a'],
  },
{
name: 'Medicina Veterinária - Bacharelado',
courseIds: ['5d10bfa5fa4ec2b50ec7eb792300ee45'],
},
{
  name: 'Negócios Imobiliários - Tecnólogo',
  courseIds: ['5daeffa75dc557c542e11985c900e21b'],
  },
{
name: 'Nutrição - Bacharelado',
courseIds: ['2780e98ca342b1432b4fbebe206605e6'],
},
{
  name: 'Odontologia - Bacharelado',
  courseIds: ['5079b85c97ea0cda8f6b19484cd7e25b'],
  },
{
name: 'Pedagogia - Licenciatura',
courseIds: ['451ac02e673aa6ab3762cfada1984ed8'],
},
{
  name: 'Podologia - Tecnólogo',
  courseIds: ['33da38c13499d0c3715ed7fb56b5e82c'],
  },
{
name: 'Processos Gerenciais - Tecnólogo',
courseIds: ['d5fc86f6df70b79192566c03543162c9'],
},
{
  name: 'Produção Audiovisual - Tecnólogo',
  courseIds: ['d5f9f40816dab7a3db51fee456972548'],
  },
{
name: 'Psicologia - Bacharelado',
courseIds: ['6e5f1a89e2e2213f60f19b7870e11986'],
},
{
  name: 'Psicopedagogia - Bacharelado',
  courseIds: ['aa3b72266a6f38fcd62f7a577c4997be'],
  },
{
name: 'Publicidade e Propaganda - Bacharelado',
courseIds: ['6485d2a78257f843328736e7fb33aab3'],
},
{
  name: 'Publicidade e Propaganda - Marketing - Bacharelado',
  courseIds: ['5f0a39c061b6127af110644aeea08a92'],
  },
{
name: 'Química - Bacharelado',
courseIds: ['aaad09efd699c4798aed653151f126f9'],
},
{
  name: 'Química - Licenciatura',
  courseIds: ['bcb8006e859eef723bd22dcb00bb183d'],
  },
{
name: 'Radiologia - Tecnólogo',
courseIds: ['2070d7f0f9958cb371b93b4aa73510ef'],
},
{
  name: 'Redes de Computadores - Tecnólogo',
  courseIds: ['d918d7e7a9738440b9c62e5e4dd20bbe'],
  },
{
name: 'Relações Internacionais - Bacharelado',
courseIds: ['9cc08e9d85232f386cbcdcac8bbedced'],
},
{
  name: 'Secretariado - Tecnólogo',
  courseIds: ['6520832e61473e14bd3f7812f07b9be3'],
  },
{
name: 'Segurança Pública - Tecnólogo',
courseIds: ['53b64b89455ec804a9a4773ecb93ed1b'],
},
{
  name: 'Segurança da Informação - Tecnólogo',
  courseIds: ['6f852e4b89462095e8b4080c0edfdc28'],
  },
{
name: 'Segurança no Trabalho - Tecnólogo',
courseIds: ['d6148639d9b2ab849d5233c62eca5c03'],
},
{
  name: 'Serviço Social - Bacharelado',
  courseIds: ['13e7c1c61ae79feabeebff252bcfd704'],
  },
{
name: 'Serviços Jurídicos Cartorários e Notariais - Tecnólogo',
courseIds: ['8c08bf5642e62e95bd59c6b77933d2f7'],
},
{
  name: 'Sistemas de Informação - Bacharelado',
  courseIds: ['60b668bbfd3bca22600f75203c6d4681'],
  },
{
name: 'Sistemas para Internet - Tecnólogo',
courseIds: ['03493e07778f996b4cf7d40f9d9df91e'],
},
{
  name: 'Sociologia - Licenciatura',
  courseIds: ['4e08585393f8ba473ab7b6c4e0aa1fb6'],
  },
{
name: 'Teologia - Bacharelado',
courseIds: ['29563e7dcfe6fe9f5aab7cccabeec1ec'],
},
{
  name: 'Terapia Ocupacional',
  courseIds: ['b641593fa07c62074318ae61757a99a0'],
  },
{
name: 'Terapias Integrativas e Complementares - Tecnólogo',
courseIds: ['f9d6c714ebe5c49492499e8318c9f664'],
}

]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' })
  }

  try {
    for (const course of courses) {
      await prisma.course.upsert({
        where: { name: course.name },
        update: { courseIds: course.courseIds },
        create: { name: course.name, courseIds: course.courseIds },
      })
    }

    return res.status(200).json({ message: 'Cursos cadastrados com sucesso' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erro ao cadastrar cursos' })
  } finally {
    await prisma.$disconnect()
  }
}