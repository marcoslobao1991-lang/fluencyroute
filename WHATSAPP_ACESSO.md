# Kit WhatsApp — entrega de acesso (Rota da Fluência)

> Mensagens prontas pra régua de acesso. Enquanto o número dedicado (Cloud API)
> não chega, dá pra mandar MANUALMENTE de qualquer WhatsApp — os 26 sem login
> valem o trabalho braçal. Quando a Cloud API entrar, viram templates.
>
> Princípios: benefício antes de instrução · MANU é a estrela (desejo) ·
> 1 link só por mensagem · nunca parecer robô de cobrança.

## D0 — na hora da compra (junto com o e-mail)

> Oi {nome}! Aqui é o Marcos, do Rota da Fluência 😊
>
> Sua compra foi aprovada — obrigado pela confiança!
>
> Seu curso mora aqui (salva esse link!):
> 👉 app.fluencyroute.com.br
>
> E-mail: {email}
> Senha: {senha}
>
> Lá dentro a MANU, sua teacher particular de IA, já está te esperando —
> ela conversa com você e te faz falar inglês desde hoje, sem vergonha.
> Entra lá e diz oi pra ela! Qualquer coisa me chama aqui. 💜

## D+1 — não logou ainda

> Oi {nome}! Vi que você ainda não conheceu a MANU 😊
>
> Ela é sua teacher particular de IA — conversa com você, te escuta
> falar e monta seu caminho no inglês. É 1 minuto pra sentir a diferença:
>
> 👉 fluencyroute.com.br/acesso
> (digita seu e-mail da compra e entra NA HORA, sem senha)
>
> Me conta o que achou dela!

## D+3 — segundo toque (prova + facilidade)

> {nome}, rapidinho: teu acesso continua aqui quietinho te esperando 😄
>
> ATUALIZADO 24/08/2026: o curso fica na ÁREA DE MEMBROS DA KIWIFY (comece pelo módulo COMECE AQUI). O app (Manu: Listening + Shadowing) é BÔNUS de nível intermediário.
> Tua área de aluno é essa:
>
> 👉 fluencyroute.com.br/acesso — entra só com o e-mail, sem senha.
>
> Se tiver qualquer dificuldade de entrar, me responde aqui que eu
> resolvo COM você em 2 minutos. Combinado?

## D+7 — último da régua (tom humano, porta aberta)

> Oi {nome}! Último lembrete que eu prometo 😅
>
> Seu acesso está pago e liberado — seria um desperdício não usar nem
> uma vez. Entra aqui: fluencyroute.com.br/acesso
>
> E se algo te travou (celular, senha, tempo, qualquer coisa), me fala
> sem cerimônia que eu te ajudo pessoalmente. Tô aqui pra isso.

## 🚑 Resgate de pedido de reembolso (quem NUNCA logou)

> Oi {nome}, vi seu pedido de reembolso e vou processar sem burocracia
> se você quiser, tá? Só me deixa te mostrar UMA coisa antes:
>
> Percebi que você não chegou a entrar na plataforma — e o que você
> comprou de verdade mora lá: a MANU, sua teacher de IA que conversa
> com você e te faz FALAR inglês (sem vergonha, do seu jeito).
>
> Me dá 5 minutos? Entra aqui: fluencyroute.com.br/acesso (só o e-mail,
> sem senha). Se depois disso você ainda quiser o reembolso, eu processo
> na hora, sem perguntar nada. Justo?

## ✅ CÓDIGO JÁ LIGADO (31/07) — só faltam as envs

O webhook já fala Cloud API sozinho. Quando o número novo existir:

1. Colar na Vercel (produção): `WA_CLOUD_TOKEN` (token permanente do system
   user) e `WA_CLOUD_PHONE_ID` (Phone number ID do painel do WhatsApp).
2. Registrar o template `acesso_d0` (categoria UTILIDADE, idioma pt_BR):

   > Oi {{1}}! Sua compra na Rota da Fluência foi confirmada ✅
   >
   > Seu curso mora aqui (salva esse link!):
   > app.fluencyroute.com.br
   >
   > E-mail: {{2}}
   > Senha: {{3}}
   >
   > Lá dentro a MANU, sua teacher particular de IA, já está te esperando —
   > começa por ela! Qualquer dúvida, é só responder essa mensagem. 💜

3. Depois: templates `acesso_d1/d3/d7` (textos acima) + plugar no
   `acesso-nudge` (a régua de e-mail já roda; WhatsApp entra ao lado).

## Setup do número novo (~40 min, uma vez)

1. Chip novo pré-pago (nunca usado no WhatsApp) OU número virtual que receba SMS.
2. business.facebook.com → criar **Portfólio Empresarial NOVO** (não usar o
   emprestado — decisão de 29/07, protege a conta de anúncios).
3. developers.facebook.com → Criar app (tipo Business) → adicionar produto
   **WhatsApp** → vincular o portfólio novo.
4. WhatsApp → API Setup → **Add phone number** → verificar por SMS.
5. Business Settings → Users → **System User** → criar, dar acesso ao app +
   ao WhatsApp account → **Generate token** (permanente, escopo
   whatsapp_business_messaging) → esse é o `WA_CLOUD_TOKEN`.
6. Publicar o app (modo Live: só exige URL de política de privacidade —
   fluencyroute.com.br/privacidade serve).
7. Criar o template `acesso_d0` acima → aprovação de utilidade costuma sair
   em minutos/horas.
8. Colar as 2 envs na Vercel → redeploy → primeiro teste com uma compra.
   Sem verificação de empresa: 250 conversas/dia (sobra pro volume atual).
