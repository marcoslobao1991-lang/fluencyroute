import type { ReactNode } from "react";
import styles from "./reader.module.css";

export type Chapter = {
  id: string;
  part: string;
  number?: number;
  title: string;
  eyebrow: string;
  readingTime: number;
  content: ReactNode;
};

function Secret({ number, children }: { number: string; children: ReactNode }) {
  return (
    <aside className={styles.secret}>
      <span>Fluency Secret {number}</span>
      <p>{children}</p>
    </aside>
  );
}

function Note({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className={styles.note}>
      <strong>{title}</strong>
      <div>{children}</div>
    </aside>
  );
}

function LearnTrainDiagram() {
  return (
    <figure className={styles.diagram} aria-labelledby="learn-train-title">
      <figcaption><span>A PRIMEIRA DISTINÇÃO</span><strong id="learn-train-title">Aprender inglês não é treinar inglês</strong></figcaption>
      <div className={styles.comparison}>
        <div><span>APRENDER</span><strong>Entender</strong><p>Regra, explicação, tradução e tempo para pensar.</p></div>
        <div><span>TREINAR</span><strong>Executar</strong><p>Ouvido, fala, repetição e resposta na velocidade real.</p></div>
      </div>
      <p className={styles.diagramCaption}>A explicação ensina o caminho. O treino faz você percorrê-lo sem precisar pensar em cada passo.</p>
    </figure>
  );
}

function EssentialDiagram() {
  return (
    <figure className={styles.diagram} aria-labelledby="essential-title">
      <figcaption><span>A PRIMEIRA META</span><strong id="essential-title">Fluência Essencial</strong></figcaption>
      <div className={styles.essentialFilter}>
        <div><span>01</span><b>Ouvir</b><p>Reconhecer o inglês mais recorrente na fala real.</p></div>
        <div><span>02</span><b>Responder</b><p>Ter perguntas, respostas e estruturas básicas disponíveis.</p></div>
        <div><span>03</span><b>Sustentar</b><p>Conseguir manter uma conversa sem depender de tradução constante.</p></div>
      </div>
      <p className={styles.diagramCaption}>Você não começa tentando dominar o idioma inteiro. Começa ficando fluente no que mais volta.</p>
    </figure>
  );
}

function EarDiagram() {
  return (
    <figure className={styles.diagram} aria-labelledby="ear-title">
      <figcaption><span>LAPIDAÇÃO DO OUVIDO</span><strong id="ear-title">O arquivo não muda. A sua percepção muda.</strong></figcaption>
      <div className={styles.perception}>
        <div><span>PRIMEIRA ESCUTA</span><p className={styles.soundMess}>whaddayawannado</p><small>Uma massa de som</small></div>
        <div><span>COM O TEXTO</span><p>what do you want to do?</p><small>As partes aparecem</small></div>
        <div><span>DEPOIS DO TREINO</span><p><b>what do you wanna do?</b></p><small>O ouvido reconhece o bloco</small></div>
      </div>
    </figure>
  );
}

function BlocksDiagram() {
  return (
    <figure className={styles.diagram} aria-labelledby="blocks-title">
      <figcaption><span>A BASE DA CONVERSA</span><strong id="blocks-title">Palavras se repetem dentro de expressões</strong></figcaption>
      <div className={styles.depthCompare}>
        <div><small>PALAVRAS SOLTAS</small><span className={styles.shallow}>I · don&apos;t · know · if · that · makes · sense</span><b>Sete escolhas</b><p>A frase precisa ser montada peça por peça.</p></div>
        <div><small>EXPRESSÕES</small><span className={styles.deep}>I don&apos;t know if<br/>that makes sense</span><b>Dois blocos</b><p>A estrutura já vem pronta para carregar a ideia.</p></div>
      </div>
    </figure>
  );
}

function RepetitionDiagram() {
  return (
    <figure className={styles.diagram} aria-labelledby="repetition-title">
      <figcaption><span>OS DOIS TIPOS DE REPETIÇÃO</span><strong id="repetition-title">Aprofundar agora e recuperar depois</strong></figcaption>
      <div className={styles.repeatGrid}>
        <div><span className={styles.repeatIcon}>↻</span><small>CONTINUADA</small><b>Mesma sessão</b><p>O trecho se repete até ficar claro, previsível e acompanhável.</p></div>
        <div><span className={styles.repeatIcon}>▷</span><small>ESPAÇADA</small><b>Depois de um intervalo</b><p>O trecho retorna para mostrar se o aprendizado ficou disponível.</p></div>
      </div>
    </figure>
  );
}

function MinuteDiagram() {
  const steps = [
    ["01", "Ouvir", "Descubra o que você entende sem apoio."],
    ["02", "Ler", "Confira o texto e o significado."],
    ["03", "Separar", "Perceba palavras, blocos e sons emendados."],
    ["04", "Repetir", "Volte ao mesmo minuto várias vezes."],
    ["05", "Acompanhar", "Faça shadowing sem deixar de ouvir."],
  ];
  return (
    <figure className={`${styles.diagram} ${styles.experiment}`} aria-labelledby="minute-title">
      <figcaption><span>UM MINUTO DE CADA VEZ</span><strong id="minute-title">A unidade prática do treino</strong></figcaption>
      <div className={styles.experimentDays}>
        {steps.map(([number, verb, description]) => <div key={number}><span>{number}</span><b>{verb}</b><p>{description}</p></div>)}
      </div>
    </figure>
  );
}

function EpisodeDiagram() {
  return (
    <figure className={styles.diagram} aria-labelledby="episode-title">
      <figcaption><span>PROFUNDIDADE ANTES DE VOLUME</span><strong id="episode-title">Um episódio dominado ou uma temporada atravessada?</strong></figcaption>
      <div className={styles.comparison}>
        <div><span>TEMPORADA</span><strong>Muito contato</strong><p>Você acompanha a história, mas não sabe dizer o que passou a ouvir melhor.</p></div>
        <div><span>EPISÓDIO</span><strong>Domínio observável</strong><p>Você entende sem apoio e leva padrões treinados para o próximo conteúdo.</p></div>
      </div>
    </figure>
  );
}

function ImmersionDiagram() {
  return (
    <figure className={styles.diagram} aria-labelledby="immersion-title">
      <figcaption><span>IMERSÃO SIMULADA</span><strong id="immersion-title">Quando o inglês passa a ensinar mais inglês</strong></figcaption>
      <div className={styles.routeMap}>
        <div><span>01</span><b>Trecho</b><small>clareza</small></div><i>→</i>
        <div><span>02</span><b>Discurso</b><small>continuidade</small></div><i>→</i>
        <div><span>03</span><b>Episódio</b><small>conversa</small></div><i>→</i>
        <div><span>04</span><b>Imersão</b><small>expansão</small></div>
      </div>
      <p className={styles.diagramCaption}>A imersão deixa de ser esforço cego quando você já entende o bastante para aprender com o contexto.</p>
    </figure>
  );
}

export const chapters: Chapter[] = [
  {
    id: "o-pendrive-quase-vazio",
    part: "Prólogo",
    title: "Como meu inglês começou a mudar",
    eyebrow: "Uma descoberta feita sem método e sem querer",
    readingTime: 6,
    content: (
      <>
        <p className={styles.lead}>Quando comecei a levar o inglês a sério, eu trabalhava como vendedor e passava boa parte do dia na estrada.</p>
        <p>Na época, a gente ouvia música no carro usando pendrive. O meu tinha pouca coisa, e entre os arquivos estavam alguns conteúdos de vendas em inglês, principalmente áudios do Jordan Belfort e do Grant Cardone. Eu já pensava em trabalhar vendendo em dólar, então escutava aquilo mesmo sem entender tudo.</p>
        <p>Como não havia muito para escolher, os mesmos áudios tocavam de novo e de novo. Às vezes eu passava horas ouvindo as mesmas falas. Não era uma estratégia. Eu não anotava palavras, não seguia um cronograma e nem fazia ideia de que aquela repetição acabaria mudando meu inglês.</p>
        <p>A mudança apareceu aos poucos. Um trecho que antes parecia rápido demais começava a se abrir. Primeiro eu reconhecia uma palavra, depois uma expressão inteira. Em algumas partes, chegava a saber o que seria dito antes de a frase terminar.</p>
        <p>Claro que o áudio continuava na mesma velocidade. O que estava mudando era a forma como eu o escutava.</p>
        <p>Quando percebi isso, resolvi experimentar a mesma coisa com a pronúncia. Comecei a falar junto com os discursos, imitando o ritmo, as pausas e a maneira como as palavras se ligavam. Repeti alguns trechos tantas vezes que terminei decorando falas inteiras.</p>
        <p>O mais interessante veio depois. A melhora não ficou presa àqueles arquivos. Muitas palavras e expressões dos discursos faziam parte do inglês comum e voltavam em entrevistas, vídeos e conversas. Conforme elas se tornavam familiares, eu também entendia melhor outros conteúdos e falava com menos esforço.</p>
        <p>Naquele momento, eu só percebia que estava funcionando. Foi mais tarde, ensinando e acompanhando outras pessoas, que consegui entender por que funcionava.</p>
        <Secret number="#01">Meu inglês começou a mudar quando parei de abandonar um conteúdo logo depois de entendê-lo e permaneci nele tempo suficiente para conseguir acompanhá-lo.</Secret>
        <p>É essa passagem — de entender uma frase para conseguir ouvi-la e usá-la com naturalidade — que vamos acompanhar ao longo deste livro.</p>
      </>
    ),
  },
  {
    id: "o-que-fluencia-exige",
    part: "Parte I — A mudança de ponto de vista",
    number: 1,
    title: "O que fluência realmente exige",
    eyebrow: "Por que traduzir mentalmente quebra a fluidez",
    readingTime: 5,
    content: (
      <>
        <p className={styles.lead}>Quem traduz tudo mentalmente costuma viver a mesma situação: entende a pergunta, mas demora alguns segundos para chegar ao sentido.</p>
        <p>Enquanto organiza em português o que acabou de ouvir, a outra pessoa continua falando. E, quando finalmente entende, ainda precisa pensar na resposta e encontrar uma forma de dizê-la em inglês. Muitas vezes as palavras aparecem, só que tarde demais para a conversa fluir com naturalidade.</p>
        <p>Isso não quer dizer que traduzir seja errado. A tradução é uma habilidade útil e até quem fala muito bem recorre a ela em alguns momentos. A dificuldade está em depender do português para entender qualquer coisa.</p>
        <p>Provavelmente isso já não acontece com expressões como <em>thank you</em>, <em>good morning</em> ou <em>I love you</em>. Você não precisa ouvir, procurar a tradução e só então compreender. O som já traz o sentido.</p>
        <p>Com o treino, esse entendimento direto deixa de ficar restrito a meia dúzia de expressões e começa a alcançar perguntas, respostas e estruturas maiores. É assim que a tradução mental perde espaço: não porque você se obriga a evitá-la, mas porque passa a precisar menos dela.</p>
        <Secret number="#02">Parar de traduzir mentalmente não é aprender a fazer a tradução mais depressa. É criar uma ligação mais direta entre o inglês e o sentido.</Secret>
        <p>Para construir essa ligação, porém, não basta compreender explicações. É preciso separar duas coisas que costumamos chamar pelo mesmo nome: aprender inglês e treinar inglês.</p>
      </>
    ),
  },
  {
    id: "aprender-nao-e-treinar",
    part: "Parte I — A mudança de ponto de vista",
    number: 2,
    title: "Aprender inglês não é treinar inglês",
    eyebrow: "A distinção que reorganiza todo o processo",
    readingTime: 6,
    content: (
      <>
        <p className={styles.lead}>É perfeitamente possível entender uma regra hoje, acertar todos os exercícios amanhã e continuar sem conseguir usá-la numa conversa.</p>
        <p>Não há contradição nisso. Entender uma informação e executar uma habilidade são etapas diferentes.</p>
        <LearnTrainDiagram />
        <p>Ao aprender, você entra em contato com algo novo e passa a compreendê-lo. Uma explicação bem feita economiza tempo, organiza o assunto e evita confusão. Só que, ao terminar a aula, aquela informação ainda pode depender do exemplo na tela, da tradução ao lado e de alguns segundos para pensar.</p>
        <p>O treino começa quando esses apoios são retirados. Você escuta a frase na voz de outra pessoa, tenta recuperá-la sem consultar o caderno e precisa responder no ritmo normal de uma conversa. Nesse momento, o inglês deixa de ser apenas um assunto que você entendeu e passa a ser uma habilidade que precisa executar.</p>
        <p>Aprender a dirigir funciona de maneira parecida. Você pode entender para que servem a embreagem e a marcha antes de entrar no carro, mas isso não impede o motor de morrer nas primeiras tentativas. Depois de algum tempo, troca de marcha sem interromper a conversa com quem está no banco ao lado.</p>
        <p>Com um instrumento acontece o mesmo. No início, cada dedo pede atenção. Mais tarde, o músico toca enquanto canta porque repetiu os movimentos até não precisar comandar conscientemente cada detalhe.</p>
        <p>Quando alguém diz “eu entendo, mas não consigo falar” ou “eu sei a palavra, mas na hora ela não vem”, muitas vezes o problema está justamente aí. A pessoa aprendeu o conteúdo, mas ainda não o treinou nas condições em que pretende usá-lo.</p>
        <Secret number="#03">Aprender ajuda você a entender o que fazer. Treinar faz com que consiga fazer quando precisa.</Secret>
        <p>Se conversar é uma habilidade, esse treino inevitavelmente envolve repetição. Não há como ganhar velocidade executando cada coisa uma única vez.</p>
      </>
    ),
  },
  {
    id: "tudo-volta-a-repeticao",
    part: "Parte I — A mudança de ponto de vista",
    number: 3,
    title: "Tudo volta à repetição",
    eyebrow: "A parte menos sedutora e mais importante",
    readingTime: 5,
    content: (
      <>
        <p className={styles.lead}>Toda habilidade que precisa funcionar com rapidez é construída por repetição.</p>
        <p>Uma criança ouve as mesmas palavras muitas vezes antes de começar a usá-las. Um músico volta ao mesmo trecho até os dedos encontrarem o movimento. Um atleta repete um fundamento para conseguir executá-lo quando está cansado ou sob pressão. Com o inglês não seria diferente.</p>
        <p>O problema é que repetição ganhou uma fama ruim. Ela costuma ser associada a decorar listas ou ouvir a mesma gravação sem prestar atenção. Esse tipo de repetição realmente pode render pouco. Se a mente está em outro lugar, o áudio apenas se torna um ruído conhecido.</p>
        <p>No treino, cada volta tem uma função. Você repete para entender um trecho que escapou, perceber onde os sons se juntaram, antecipar uma expressão ou acompanhar a pronúncia. O material continua o mesmo, mas a maneira de ouvi-lo vai mudando.</p>
        <p>A vontade de avançar aparece cedo porque o conteúdo novo dá uma sensação imediata de progresso. Assim que entendemos uma explicação, parece natural procurar a próxima. Só que entender é justamente o ponto a partir do qual o treino pode começar. As repetições seguintes dão velocidade ao que acabou de fazer sentido.</p>
        <Secret number="#04">A primeira vez mostra o que uma frase significa. As repetições seguintes fazem com que você consiga reconhecê-la e usá-la sem começar do zero.</Secret>
        <p>Se repetir é indispensável, não faz sentido distribuir o mesmo esforço pelo idioma inteiro. Antes de decidir como treinar, precisamos escolher o que merece ser treinado primeiro.</p>
      </>
    ),
  },
  {
    id: "fluencia-essencial",
    part: "Parte II — Reduzir antes de acelerar",
    number: 4,
    title: "A primeira meta: Fluência Essencial",
    eyebrow: "Ser fluente no que mais importa antes de tentar saber tudo",
    readingTime: 6,
    content: (
      <>
        <p className={styles.lead}>Tentar aprender o idioma inteiro antes de conversar é uma meta tão grande que não ajuda a decidir o que fazer hoje.</p>
        <p>Uma primeira meta mais útil é desenvolver fluência no essencial: reconhecer e usar com naturalidade a parte do inglês que sustenta a maior parte das conversas comuns.</p>
        <EssentialDiagram />
        <p>O inglês tem milhares de palavras, mas algumas aparecem muito mais do que outras. Pronomes, verbos comuns, perguntas, conectores e estruturas de conversa voltam independentemente do assunto. O tema pode mudar de trabalho para viagem ou família; grande parte da linguagem usada para perguntar, explicar, concordar e discordar continua ali.</p>
        <p>Às vezes essa ideia é resumida na promessa de que “500 palavras resolvem 90% do inglês”. O número é atraente, mas simplifica demais. Há diferentes formas de contar uma palavra, e reconhecer boa parte do vocabulário de um conteúdo não significa compreender tudo nem conseguir falar. Estudos sobre a língua falada trabalham com milhares de famílias de palavras para chegar a níveis altos de cobertura.</p>
        <p>Ainda assim, o princípio que importa permanece válido: o inglês mais recorrente merece uma quantidade desproporcional de treino. Quanto melhor você conhece essa base, mais fácil fica lidar com as palavras específicas de cada assunto.</p>
        <p>Fluência Essencial, portanto, não é inglês infantil nem um punhado de frases para sobreviver numa viagem. É uma base conversacional rápida o bastante para você entender, responder e manter a interação. A partir dela, o vocabulário cresce na direção da sua vida: tecnologia para quem trabalha com tecnologia, reuniões para quem atua em empresas internacionais, vendas e negociação para quem deseja vender em dólar.</p>
        <Secret number="#05">Antes de ampliar o idioma em todas as direções, vale tornar realmente disponível a parte que continuará aparecendo em quase todas elas.</Secret>
        <p>Essa base depende de duas capacidades: ouvir e falar. E o ouvido merece atenção especial porque, no início, ele ainda não sabe separar com precisão os sons de outro idioma.</p>
      </>
    ),
  },
  {
    id: "lapidar-o-ouvido",
    part: "Parte II — Reduzir antes de acelerar",
    number: 5,
    title: "O ouvido precisa ser lapidado",
    eyebrow: "Por que escutar muito não é sempre o mesmo que treinar",
    readingTime: 6,
    content: (
      <>
        <p className={styles.lead}>Aprender a ouvir inglês se parece, em vários aspectos, com desenvolver o ouvido para música.</p>
        <EarDiagram />
        <p>Um músico experiente percebe uma nota levemente errada que passaria despercebida para a maioria das pessoas. Não é porque o som chega diferente aos ouvidos dele, mas porque anos de comparação o ensinaram a notar detalhes.</p>
        <p>Com a fala acontece algo parecido. No começo, uma frase inteira pode soar como um bloco comprido e confuso. Quando você escuta o trecho, confere a transcrição e volta ao áudio, começa a identificar palavras, reduções e sons que estavam emendados.</p>
        <p>Por isso uma frase simples no papel pode desaparecer quando é dita por um nativo. Você conhece todas as palavras, mas esperava ouvi-las separadas e com a pronúncia do dicionário. Na fala normal, elas se encurtam, se ligam e mudam de forma.</p>
        <p>Ter bastante contato com o idioma ajuda, mas nem todo contato produz esse nível de atenção. Assim como alguém pode ouvir música a vida inteira sem aprender a identificar uma nota, também pode passar horas com áudio em inglês sem descobrir exatamente o que o ouvido está perdendo.</p>
        <p>Um trecho curto torna essa comparação possível. Você escuta sem texto, localiza o ponto em que se perdeu, confere a frase e volta ao mesmo lugar. Depois de algumas repetições, o que parecia uma massa começa a se dividir. Quando reconhece sem legenda, a transcrição já cumpriu sua função.</p>
        <Secret number="#06">Treinar o ouvido é voltar ao mesmo som com informação suficiente para perceber, na escuta seguinte, algo que antes não aparecia.</Secret>
        <p>Conforme a fala fica mais nítida, outra coisa chama atenção: as unidades que reconhecemos não são apenas palavras isoladas. Boa parte da conversa chega em grupos de palavras que já ouvimos juntas.</p>
      </>
    ),
  },
  {
    id: "expressoes",
    part: "Parte II — Reduzir antes de acelerar",
    number: 6,
    title: "A conversa acontece em expressões",
    eyebrow: "Por que palavras isoladas deixam a fala lenta",
    readingTime: 5,
    content: (
      <>
        <p className={styles.lead}>Numa conversa real, ninguém monta todas as frases escolhendo uma palavra de cada vez.</p>
        <p>Ao dizer <em>How are you?</em>, a pessoa não inventa a pergunta naquele momento. O grupo inteiro já existe e sai como uma unidade. O mesmo acontece com <em>What do you think about it?</em>, <em>I don&apos;t know if</em> ou <em>The thing is</em>.</p>
        <BlocksDiagram />
        <p>Em português fazemos o mesmo com “deixa eu ver”, “por outro lado”, “o problema é que” e “não sei se faz sentido”. Essas expressões já carregam uma função. Quando precisamos criar contraste, por exemplo, “por outro lado” aparece sem que seja necessário escolher as três palavras separadamente.</p>
        <p>Essa disponibilidade economiza atenção. Se cada parte da frase precisa ser decidida no momento, a fala se torna lenta e frágil. Quando a estrutura já está familiar, você pode se concentrar na ideia que deseja comunicar.</p>
        <p>Foi isso que aconteceu com os discursos que eu repetia. Embora o assunto fosse vendas, boa parte da linguagem era comum a muitos contextos: fazer uma pergunta, apresentar uma razão, criar contraste, explicar um problema e chegar a uma conclusão. Ao decorar alguns trechos, eu também estava ganhando velocidade em estruturas que voltariam em outros lugares.</p>
        <p>Não se trata de colecionar listas de expressões fora de contexto. Um bloco se torna útil quando você o escuta dentro de uma intenção, entende para que serve e o repete como parte de uma fala real.</p>
        <Secret number="#07">Quanto mais estruturas familiares você tem à disposição, menos precisa interromper uma ideia para montar a frase palavra por palavra.</Secret>
        <p>É essa redução do esforço consciente que começa a dar ao inglês a sensação de automático.</p>
      </>
    ),
  },
  {
    id: "do-consciente-ao-automatico",
    part: "Parte III — O treino",
    number: 7,
    title: "Do consciente ao automático",
    eyebrow: "O que realmente muda quando a fala começa a fluir",
    readingTime: 5,
    content: (
      <>
        <p className={styles.lead}>No início de qualquer habilidade, os movimentos básicos ocupam quase toda a atenção.</p>
        <p>Essa passagem costuma ser explicada com números sobre a diferença entre o que chega ao sistema nervoso e o que cabe na atenção consciente. Uma estimativa muito citada compara cerca de 11 milhões de bits por segundo de processamento sensorial não consciente com aproximadamente 50 bits por segundo de processamento consciente.</p>
        <p>Isso representa uma diferença de cerca de <strong>220 mil vezes</strong>, mas é importante não dar ao dado um significado que ele não tem. A comparação não afirma que o subconsciente aprende inglês 220 mil vezes mais rápido. Ela mostra o contraste entre o volume de informação tratado fora da consciência e a pequena quantidade em que conseguimos prestar atenção de propósito.</p>
        <p>Na prática, esse limite é fácil de observar. Ao aprender uma frase, você talvez precise lembrar a regra, procurar a palavra e conferir a ordem. Depois de muitos encontros, reconhece a mesma estrutura mais depressa e consegue recuperá-la com menos esforço.</p>
        <p>Nas primeiras aulas de direção, espelho, seta, embreagem e marcha disputam espaço na cabeça. Algum tempo depois, fazemos tudo isso enquanto acompanhamos o trânsito e conversamos. Os movimentos não foram entregues a uma parte misteriosa do cérebro; apenas foram praticados até exigir menos controle consciente.</p>
        <p>É essa folga que procuramos no inglês. Se toda palavra e toda regra precisarem passar pelo centro da atenção, sobra pouco espaço para compreender a intenção da outra pessoa e organizar uma resposta. Conforme os padrões básicos se tornam automáticos, a tradução mental diminui porque som e sentido começam a se encontrar por um caminho mais curto.</p>
        <p>Pesquisas sobre automaticidade em um segundo idioma também observam que a prática pode tornar o reconhecimento mais rápido e estável. O dado sobre processamento ajuda a visualizar o gargalo; o treino é o que permite deixar de empurrar cada operação básica por ele.</p>
        <Secret number="#08">Automatizar não é falar sem consciência. É deixar de gastar toda a consciência nas peças básicas e poder usá-la na conversa.</Secret>
        <p>Esse processo combina dois tipos de repetição. O primeiro acontece enquanto você permanece no mesmo material.</p>
      </>
    ),
  },
  {
    id: "repeticao-continuada",
    part: "Parte III — O treino",
    number: 8,
    title: "Repetição continuada",
    eyebrow: "Ficar no mesmo trecho até alguma coisa mudar",
    readingTime: 5,
    content: (
      <>
        <p className={styles.lead}>Na repetição continuada, você trabalha o mesmo trecho várias vezes durante uma sessão.</p>
        <p>Não é apenas deixar o áudio voltar ao começo. Em cada escuta, você procura alguma coisa: tenta entender sem apoio, confere a transcrição, volta sem o texto e, quando a frase está clara, começa a acompanhá-la em voz alta.</p>
        <RepetitionDiagram />
        <p>Como o material permanece, o ouvido deixa de enfrentar uma surpresa nova a cada instante. Os sons se separam, algumas expressões se tornam previsíveis e a boca começa a encontrar o ritmo.</p>
        <p>A primeira escuta serve como ponto de partida. Nas seguintes, você consegue voltar exatamente ao lugar em que falhou. Num fluxo de conteúdo novo isso é mais difícil, porque o problema desaparece junto com a cena.</p>
        <p>Também fica mais fácil perceber a distância entre entender e dominar. Ler a transcrição pode resolver o significado em poucos segundos, mas ainda não garante que você reconheça a frase sem texto ou consiga repeti-la no ritmo do áudio.</p>
        <p>Um músico vive algo parecido ao tirar um solo. Descobrir as notas é apenas o começo; o treino de verdade vem quando ele repete até tocar no tempo certo. No inglês, costumamos descobrir o significado da frase e parar justamente antes dessa etapa.</p>
        <Secret number="#09">A repetição continuada começa depois que a frase foi entendida e termina quando ouvido e fala conseguem acompanhá-la com muito menos esforço.</Secret>
        <p>Para começar, discursos curtos costumam funcionar bem porque oferecem fala real com uma estrutura mais fácil de acompanhar.</p>
      </>
    ),
  },
  {
    id: "por-que-discursos",
    part: "Parte III — O treino",
    number: 9,
    title: "Por que começar com discursos",
    eyebrow: "Um inglês mais claro para treinar falas mais longas",
    readingTime: 5,
    content: (
      <>
        <p className={styles.lead}>Um bom discurso fica no meio do caminho entre o inglês didático das aulas e a confusão natural de uma conversa espontânea.</p>
        <p>Normalmente a pessoa articula melhor, organiza o raciocínio e permanece no mesmo assunto por alguns minutos. O áudio continua sendo feito para falantes do idioma, mas há menos interrupções e mudanças inesperadas do que numa conversa.</p>
        <p>Além de facilitar a escuta, o discurso treina continuidade. Você acompanha uma ideia desde o início, observa como ela recebe razões e contrastes e percebe de que maneira o falante chega à conclusão.</p>
        <p>Os áudios de vendas foram valiosos para mim por esse motivo. Eles estavam ligados ao futuro que eu desejava e continham argumentos completos. Eu não repetia apenas frases de cumprimento; aprendia a permanecer em inglês enquanto uma ideia era desenvolvida.</p>
        <p>Mais tarde, o mesmo tipo de treino pode ser levado para entrevistas, podcasts, filmes e séries. O material muda, mas a lógica continua: escolher algo que você consiga compreender com apoio, dividir em partes pequenas e repetir com atenção.</p>
        <Note title="Escolha um discurso útil"><p>Prefira alguém que fale com clareza, sobre um assunto que você realmente queira compreender. Interesse não substitui repetição, mas ajuda você a permanecer nela.</p></Note>
        <Secret number="#10">O discurso ajuda a sustentar uma ideia; a conversa ensina a reagir a outra pessoa. As duas capacidades importam, mas podem ser treinadas em momentos diferentes.</Secret>
        <p>Depois de escolher o material, ainda é preciso reduzi-lo a uma unidade que permita observar a própria melhora. Um minuto costuma ser um bom tamanho.</p>
      </>
    ),
  },
  {
    id: "um-minuto-de-cada-vez",
    part: "Parte III — O treino",
    number: 10,
    title: "Um minuto de cada vez",
    eyebrow: "Como transformar um discurso em material treinável",
    readingTime: 7,
    content: (
      <>
        <p className={styles.lead}>Em vez de tentar dominar o discurso inteiro de uma vez, divida-o em trechos de aproximadamente um minuto.</p>
        <p>Não é necessário cortar exatamente no segundo sessenta. Vale acompanhar o fim de uma frase ou de uma ideia. O trecho só precisa ser curto o bastante para que você consiga voltar ao ponto exato sem se perder.</p>
        <MinuteDiagram />
        <p>Comece ouvindo sem legenda para descobrir o que já entende. Em seguida, leia a transcrição, confirme o significado e volte ao áudio. Quando conseguir reconhecer a fala sem depender do texto, passe a acompanhá-la em voz alta.</p>
        <p>É justamente nesse ponto que muita gente avançaria para o minuto seguinte. Aqui, você permanece. Pode trabalhar o mesmo trecho por vinte minutos ou mais, desde que continue atento e mude a tarefa conforme progride.</p>
        <p>No shadowing, tente escutar enquanto fala. Não se trata de correr atrás do áudio, mas de aproximar o ritmo, as pausas e as ligações do modelo sem abandonar a compreensão.</p>
        <p>Quando o trecho já estiver claro, aumentar para 1,25× ou 1,5× pode oferecer um desafio extra e tornar a velocidade normal mais confortável. Isso não transforma 2× numa definição de fluência. Alguns falantes já são rápidos em velocidade normal, e acelerar um áudio incompreensível só acelera o ruído. A velocidade maior só é útil quando revela uma dificuldade que você consegue localizar e trabalhar.</p>
        <p>Depois de dominar o primeiro minuto, siga para o segundo. Ao final, ouvir o discurso inteiro será uma experiência diferente: em vez de tentar sobreviver a um fluxo longo, você estará reunindo partes que conhece com profundidade.</p>
        <Secret number="#11">Dividir o material não torna o treino menor. Torna a melhora visível.</Secret>
        <p>Nas séries, essa mesma ideia leva a uma escolha importante: atravessar muitos episódios ou permanecer em um até realmente compreendê-lo.</p>
      </>
    ),
  },
  {
    id: "um-episodio-dominado",
    part: "Parte IV — Da prática à vida real",
    number: 11,
    title: "Um episódio dominado",
    eyebrow: "Por que profundidade pode ensinar mais que volume",
    readingTime: 6,
    content: (
      <>
        <p className={styles.lead}>Há uma diferença grande entre assistir a uma temporada e trabalhar um episódio até conseguir entendê-lo.</p>
        <p>Ver a temporada oferece história, diversão e contato com o idioma, e nada disso precisa ser tratado como perda de tempo. A confusão começa quando usamos o número de horas assistidas como prova de que o ouvido melhorou.</p>
        <EpisodeDiagram />
        <p>Dentro de um episódio, as palavras e expressões essenciais voltam muitas vezes. O assunto muda algumas peças, mas perguntas, respostas, pronomes, verbos comuns e estruturas de conversa continuam reaparecendo.</p>
        <p>Ao retornar ao mesmo episódio, você se acostuma com as vozes, com o ritmo e com blocos que também estarão nos capítulos seguintes. Não é apenas a história que se torna conhecida; o ouvido aprende o que procurar.</p>
        <p>Um músico que aprendeu uma música com cuidado não volta ao ponto zero ao começar outra. Parte da postura, do ritmo e dos movimentos continua com ele. Da mesma maneira, o episódio seguinte traz novidades, mas encontra um ouvinte mais preparado.</p>
        <p>O objetivo não é assistir ao mesmo episódio para sempre. É avançar depois de construir alguma coisa que possa seguir adiante com você. Em séries de fala rápida, entender bem na velocidade normal já é um resultado forte. Mais importante que perseguir 2× é notar que o próximo episódio já não parece inteiramente novo.</p>
        <Secret number="#12">O valor de dominar um episódio aparece quando parte do que você treinou ajuda a compreender o episódio seguinte.</Secret>
        <p>Esse domínio ainda precisa sobreviver ao tempo. Para descobrir o que realmente ficou, entramos no segundo tipo de repetição.</p>
      </>
    ),
  },
  {
    id: "repeticao-espacada",
    part: "Parte IV — Da prática à vida real",
    number: 12,
    title: "Repetição espaçada",
    eyebrow: "Rever no momento em que você começaria a esquecer",
    readingTime: 6,
    content: (
      <>
        <p className={styles.lead}>No fim de uma sessão intensa, uma frase pode parecer tão fácil que temos a impressão de nunca mais esquecê-la.</p>
        <p>Naquele momento, o som está fresco, a transcrição acabou de ser vista e a boca já conhece o movimento. Essa familiaridade ajuda, mas não garante que a expressão estará disponível no dia seguinte.</p>
        <p>É o intervalo que torna o teste mais honesto. Quando a frase volta depois de algumas horas ou dias, você tenta compreendê-la e repeti-la antes de consultar qualquer apoio. Se foi fácil, pode esperar mais para revê-la; se foi difícil, precisa retornar mais cedo. Sistemas como o Anki organizam as revisões a partir desse princípio.</p>
        <p>Com filmes e séries, o processo pode ser feito frase por frase. Você escuta, tenta compreender, confere a resposta e informa o grau de dificuldade. A utilidade do aplicativo não está em possuir uma tecnologia mágica, mas em evitar que a revisão dependa apenas da memória e da vontade.</p>
        <p>Agora fica clara a função de cada repetição. A continuada permite aprofundar o material enquanto você está trabalhando nele. A espaçada mostra se esse aprendizado continua acessível depois que a facilidade do momento passou. Sem a primeira, cada revisão pode continuar difícil demais; sem a segunda, familiaridade pode ser confundida com permanência.</p>
        <p>Quando as revisões usam frases de conteúdos reais, as mesmas estruturas aparecem em novas situações. Aos poucos, revisar deixa de ser apenas memorizar vocabulário e passa a treinar ouvido, pronúncia e resposta.</p>
        <Secret number="#13">Primeiro você permanece até a frase ficar clara. Depois deixa passar um tempo e descobre se ainda consegue encontrá-la.</Secret>
        <p>Com uma base cada vez mais disponível, consumir conteúdo em inglês também muda. Em vez de apenas suportar o idioma, você começa a usá-lo para chegar aos assuntos que lhe interessam.</p>
      </>
    ),
  },
  {
    id: "imersao-simulada",
    part: "Parte IV — Da prática à vida real",
    number: 13,
    title: "Imersão simulada",
    eyebrow: "Quando conteúdo em inglês deixa de ser exercício",
    readingTime: 6,
    content: (
      <>
        <p className={styles.lead}>Chega um momento em que assistir, ler e ouvir em inglês deixa de parecer apenas estudo.</p>
        <p>Você pode criar esse ambiente mesmo sem morar fora. Vídeos, livros, podcasts, aulas e entretenimento entram na rotina em inglês. É o que chamo de imersão simulada.</p>
        <ImmersionDiagram />
        <p>A ordem faz diferença. Quando quase tudo ainda soa como ruído, cercar-se de inglês costuma produzir mais cansaço que aprendizado. Você não entende o suficiente para seguir o assunto e precisa fazer força o tempo todo.</p>
        <p>Com uma base essencial mais automática, a experiência é outra. Você acompanha a linha principal, reconhece blocos conhecidos e usa o contexto para descobrir palavras novas. O assunto volta a ocupar o centro da atenção.</p>
        <p>Foi assim que conteúdos de vendas e desenvolvimento pessoal passaram a acelerar meu inglês. Eu queria aprender o que aquelas pessoas estavam ensinando; o idioma era o meio para chegar lá. Como o tema me interessava, continuava ouvindo sem precisar tratar cada minuto como uma aula.</p>
        <p>Nesse estágio, a curiosidade começa a dividir o trabalho com a disciplina. Você assiste porque quer saber o que acontece, lê porque deseja compreender uma ideia e escuta porque o conteúdo tem valor.</p>
        <p>A imersão não elimina o treino concentrado. Quando surge uma dificuldade específica, ainda faz sentido isolar um trecho, conferir o texto e repetir. A diferença é que agora há um ambiente inteiro oferecendo novos exemplos do que você já treinou.</p>
        <p>A partir daí, cada pessoa segue uma direção. Quem quer viajar busca situações de viagem. Quem trabalha em inglês acompanha reuniões, entrevistas e conteúdos da própria área. Quem pretende vender em dólar se aproxima de vendedores, negociações e apresentações.</p>
        <Secret number="#14">A imersão funciona melhor quando você já entende o suficiente para que o próprio conteúdo continue ensinando.</Secret>
        <p>Repetição e expansão, portanto, não competem. Você aprofunda para ganhar capacidade e usa essa capacidade para entrar em conteúdos maiores, onde encontrará os próximos pontos que merecem atenção.</p>
      </>
    ),
  },
  {
    id: "o-ingles-que-fica",
    part: "Epílogo",
    title: "O inglês que fica",
    eyebrow: "A mesma estrada vista de outro jeito",
    readingTime: 4,
    content: (
      <>
        <p className={styles.lead}>Hoje eu vejo aquele pendrive quase vazio de uma forma bem diferente.</p>
        <p>Na época, ele parecia uma limitação. Agora sei que a falta de opções me fez permanecer nos mesmos áudios durante muito mais tempo do que eu provavelmente permaneceria se tivesse uma biblioteca infinita à disposição.</p>
        <p>Eu não conhecia os nomes repetição continuada ou Fluência Essencial. Apenas ouvia os discursos, entendia um pouco mais a cada volta e tentava acompanhar a fala. Sem perceber, estava treinando justamente as partes do inglês que depois apareceriam em outros lugares.</p>
        <p>Foi assim que a tradução mental começou a diminuir. Não aconteceu porque aprendi uma regra capaz de desligar o português, mas porque sons, sentidos e expressões foram se tornando familiares o bastante para se encontrar diretamente.</p>
        <p>O processo descrito neste livro segue a mesma lógica. Você começa pelo inglês que mais volta, aprende a escutá-lo na fala real, repete blocos, acompanha trechos e retorna a eles depois de algum tempo. Um minuto fica claro, depois um discurso, depois um episódio. Cada conteúdo novo encontra um ouvido um pouco mais preparado.</p>
        <p>Não é necessário transformar isso numa promessa mágica. O resultado que importa é bastante concreto: algo que antes exigia pausa passa a ser compreendido enquanto o inglês ainda está sendo falado.</p>
        <Secret number="#15">A fluência cresce na parte do inglês que você treinou até conseguir reconhecer e usar a tempo de continuar a conversa.</Secret>
        <p>Por isso, quando sentir que precisa imediatamente de mais conteúdo, vale fazer uma última pergunta: este trecho realmente já entregou tudo o que poderia ensinar ao meu ouvido e à minha fala?</p>
        <p>Muitas vezes, o próximo avanço ainda está ali.</p>
      </>
    ),
  },
  {
    id: "notas-e-fontes",
    part: "Notas",
    title: "Notas e fontes",
    eyebrow: "Onde terminam a experiência e começam as evidências",
    readingTime: 3,
    content: (
      <>
        <p className={styles.lead}>Este livro nasceu de uma experiência pessoal, mas evita transformar experiência em prova universal.</p>
        <p><strong>Consciência e processamento sensorial.</strong> Wiliam (2006), apoiado em estimativas reunidas por Tor Nørretranders a partir do trabalho de Manfred Zimmermann, compara aproximadamente 11 milhões de bits por segundo de processamento sensorial não consciente com cerca de 50 bits por segundo de capacidade consciente. A divisão produz a ordem de grandeza de 220 mil vezes. O dado compara canais de processamento; não mede uma velocidade de “aprendizado subconsciente”. Referência: <em>The Half-Second Delay: What Follows?</em>, DOI: 10.1080/14681360500487470.</p>
        <p><strong>Automaticidade.</strong> Segalowitz e Segalowitz (1993) estudaram velocidade e estabilidade no reconhecimento de palavras em uma segunda língua. DOI: 10.1017/S0142716400010845.</p>
        <p><strong>Expressões.</strong> Conklin e Schmitt (2008) encontraram processamento mais rápido para sequências formulaicas do que para sequências comparáveis menos familiares. DOI: 10.1093/applin/amm022.</p>
        <p><strong>Vocabulário recorrente.</strong> Nation reúne pesquisas sobre cobertura lexical na fala. Webb e Rodgers (2009) analisaram a quantidade de famílias de palavras necessária para acompanhar programas de televisão. Cobertura não significa fluência nem compreensão completa. DOI: 10.1111/j.1467-9922.2009.00509.x.</p>
        <p><strong>Repetição espaçada.</strong> Cepeda e colegas (2006) reuniram resultados de diversos estudos sobre o efeito do espaçamento na memória. DOI: 10.1037/0033-2909.132.3.354.</p>
        <p><strong>Escuta com apoio.</strong> Chang, Millett e Renandya (2019) estudaram formas de apoio ao desenvolvimento da escuta. Hartshorn e Stephens (2023) analisaram o uso de transcrição em exercícios repetidos. DOI: 10.1177/0033688217751468; 10.58304/ijts.20230404.</p>
        <Note title="Limite importante"><p>Esses estudos sustentam partes do processo descrito. Eles não provam um único método universal, um prazo fixo ou a promessa de que toda pessoa terá o mesmo resultado.</p></Note>
      </>
    ),
  },
];
