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
> Detalhe importante: o curso NÃO fica na Kiwify (lá é só o pagamento).
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

## Onde plugar quando a Cloud API chegar

- `app/api/kiwify-webhook/route.ts` → função `sendWhatsApp()` (linha ~190):
  trocar o fetch da Z-API pelo endpoint da Cloud API
  (`graph.facebook.com/v21.0/{phone_id}/messages`, template `acesso_d0`).
- `app/api/acesso-nudge/route.ts` → adicionar envio WhatsApp ao lado do
  e-mail (mesma régua D+1/D+3/D+7; templates `acesso_d1/d3/d7`).
- Templates de UTILIDADE (não marketing) na revisão da Meta: os textos acima
  já estão no tom aprovável (transacional, com opt-out implícito).
