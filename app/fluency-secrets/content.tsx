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
        <p className={styles.lead}>Durante um período da minha vida, meu escritório tinha quatro rodas.</p>
        <p>Eu trabalhava como vendedor e rodava muito de carro. Naquela época, a gente usava pendrive no som. O meu tinha pouca coisa baixada. Entre os poucos arquivos, havia conteúdos de vendas em inglês, principalmente áudios de Jordan Belfort e Grant Cardone.</p>
        <p>Eu já tinha vontade de trabalhar vendendo em dólar. Por isso, escutava aquele material mesmo sem entender tudo. E, como não havia quase nada além daquilo no pendrive, os mesmos áudios tocavam em loop durante horas de estrada.</p>
        <p>Não havia plano. Eu não tinha criado um método. Não separava vocabulário, não preenchia exercícios e nem imaginava que aquela repetição poderia se tornar a parte mais importante da minha história com o inglês.</p>
        <p>Depois de algum tempo, comecei a perceber uma mudança estranha. Os mesmos trechos, antes rápidos e embolados, começaram a ficar claros. Eu reconhecia uma palavra aqui, uma expressão ali e, em certos momentos, sabia o que a pessoa diria antes de a frase terminar.</p>
        <p>O áudio não tinha ficado mais lento. Eu é que já não o escutava da mesma maneira.</p>
        <p>Foi então que pensei: se a repetição estava mudando meu ouvido, talvez pudesse fazer o mesmo com a minha fala. Passei a repetir discursos curtos junto com a pessoa. Fazia shadowing, imitava o ritmo e voltava aos mesmos trechos tantas vezes que acabei decorando alguns deles.</p>
        <p>O resultado mais importante apareceu fora daqueles discursos. As palavras e expressões usadas ali faziam parte do inglês essencial. Eram as mesmas estruturas que voltavam em entrevistas, vídeos e conversas. Quando fiquei bom naquelas peças, minha pronúncia e minha compreensão melhoraram de forma muito mais ampla.</p>
        <p>Na época, eu apenas sentia a mudança. Mais tarde, ao ensinar outras pessoas e observar o que realmente produzia fluidez, consegui entender o princípio por trás dela.</p>
        <Secret number="#01">O inglês começou a ficar automático quando deixei de apenas encontrar conteúdo e comecei, mesmo sem querer, a permanecer tempo suficiente no mesmo conteúdo.</Secret>
        <p>Este livro organiza essa descoberta. Não como uma promessa de fluência instantânea, mas como uma explicação direta sobre o que precisa acontecer para você parar de depender da tradução mental e começar a responder em inglês com mais naturalidade.</p>
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
        <p className={styles.lead}>Uma pessoa que precisa traduzir cada frase pode conhecer muito inglês. O que ela ainda não tem é fluidez.</p>
        <p>Fluência vem de fluir. A palavra aponta para movimento, continuidade e espontaneidade. Numa conversa, você não recebe uma frase, pausa o mundo, monta o significado em português e depois pede que a outra pessoa espere enquanto constrói a resposta em inglês.</p>
        <p>A conversa continua enquanto tudo isso acontece.</p>
        <p>É por isso que traduzir mentalmente produz uma sensação tão conhecida. Você entende, mas entende atrasado. Sabe o que gostaria de responder, mas a frase não chega inteira. Quando finalmente encontra as palavras, o momento já passou ou a conversa tomou outra direção.</p>
        <p>Isso não significa que traduzir seja errado. A tradução é uma habilidade útil. O problema aparece quando ela é o único caminho entre o som e o sentido. Para falar com fluidez, uma parte crescente do inglês precisa ser compreendida diretamente.</p>
        <p>Você já vive essa experiência com algumas expressões. Quando alguém diz <em>thank you</em>, é provável que você não repita “obrigado” dentro da cabeça antes de entender. O som e a intenção chegam juntos. O mesmo acontece com <em>hello</em>, <em>good morning</em> ou <em>I love you</em>.</p>
        <p>A questão central é que esse caminho direto não precisa ficar limitado a meia dúzia de frases. Ele pode se expandir para perguntas, respostas e estruturas inteiras. Mas isso não acontece apenas porque você recebeu uma explicação.</p>
        <Secret number="#02">Parar de traduzir não significa traduzir cada vez mais rápido. Significa treinar o inglês até que o sentido comece a chegar sem precisar passar pelo português.</Secret>
        <p>Para entender como esse caminho é construído, precisamos separar duas atividades que costumam receber o mesmo nome: aprender inglês e treinar inglês.</p>
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
        <p className={styles.lead}>Você pode aprender uma regra hoje, acertar uma prova amanhã e continuar sem conseguir usar aquilo numa conversa.</p>
        <p>Isso não é contradição. É a diferença entre conhecer uma informação e executar uma habilidade.</p>
        <LearnTrainDiagram />
        <p>Quando você aprende, alguma coisa que antes parecia confusa passa a fazer sentido. O professor explica, você vê exemplos, anota uma regra e entende o significado. Esse primeiro contato é importante. Ele mostra o que fazer.</p>
        <p>Treinar começa depois. No treino, você precisa reconhecer a frase quando outra pessoa fala, lembrar sem consultar o caderno e responder dentro do tempo da conversa. A informação deixa de estar apenas diante dos seus olhos e passa a ser exigida do seu ouvido e da sua fala.</p>
        <p>Pense em dirigir. Alguém pode explicar a função da embreagem e mostrar exatamente quando trocar de marcha. Ainda assim, no primeiro dia ao volante, você precisa olhar para tudo, pensar em cada movimento e provavelmente deixa o carro morrer. Depois de repetir, troca de marcha enquanto conversa.</p>
        <p>O conhecimento não desapareceu. Ele foi treinado até deixar de ocupar toda a atenção.</p>
        <p>O mesmo acontece com um instrumento. Quem está começando no violão pensa no dedo, na corda e no movimento da mão. Quem treinou consegue tocar enquanto canta. Não ficou mais inteligente durante a música. Apenas levou movimentos repetidos para um nível em que já não precisa comandar cada detalhe.</p>
        <p>Falar inglês exige essa mesma passagem. Se você apenas entende a explicação, o conteúdo ainda depende de pensamento lento. Quando treina, começa a reconhecer e produzir sem reconstruir tudo desde o início.</p>
        <p>Isso explica frases como “eu até entendo, mas não consigo falar”, “na hora me dá branco” ou “eu sei a palavra, mas ela não vem”. Muitas vezes, a pessoa aprendeu. O que faltou foi exigir daquela informação a velocidade de uma habilidade.</p>
        <Secret number="#03">Aprender coloca a informação na sua frente. Treinar faz essa informação aparecer quando a situação pede.</Secret>
        <p>E se conversar é uma habilidade, o treino precisa ter uma característica que muita gente tenta evitar: repetição.</p>
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
        <p className={styles.lead}>Não existe treino sem repetição.</p>
        <p>Podemos trocar o nome, deixar a experiência mais bonita ou usar uma tecnologia nova. Mas, sempre que uma habilidade começa a ficar rápida, existe alguma forma de repetição por trás.</p>
        <p>Uma criança escuta as mesmas palavras inúmeras vezes antes de usá-las. Um músico repete o mesmo trecho até que os dedos encontrem o caminho. Um atleta volta ao mesmo movimento até conseguir executá-lo sob pressão.</p>
        <p>O inglês não recebe uma exceção só porque gostaríamos de aprender de um jeito mais divertido.</p>
        <p>Isso não significa repetir sem atenção. Ouvir um áudio cinquenta vezes enquanto a mente está em outro lugar pode apenas transformar aquele som em ruído familiar. A repetição que treina tem um alvo: entender melhor, separar os sons, antecipar uma expressão, acompanhar a fala ou recuperar depois de um intervalo.</p>
        <p>A cada volta, algo precisa ficar um pouco menos difícil.</p>
        <p>O desconforto aparece porque nosso cérebro gosta da sensação de novidade. Uma aula nova produz a impressão imediata de avanço. Voltar à mesma frase depois que já entendemos o significado parece menos produtivo. Só que é justamente nessa volta que a compreensão começa a ganhar velocidade.</p>
        <p>Na primeira vez, você descobre. Nas seguintes, começa a conseguir.</p>
        <p>Isso também muda a pergunta “como ficar fluente sem repetir várias vezes?”. Se a fluência depende de respostas cada vez mais automáticas, retirar a repetição significa retirar o próprio treino.</p>
        <Secret number="#04">Aquilo que hoje exige esforço consciente só começa a fluir depois de ser encontrado, entendido e executado muitas vezes.</Secret>
        <p>Mas surge um problema: o idioma é enorme. Se é preciso repetir, o que merece ser repetido primeiro?</p>
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
        <p className={styles.lead}>Você não precisa dominar o idioma inteiro para começar a funcionar em inglês.</p>
        <p>Existe uma primeira meta mais clara: tornar-se fluente no essencial. Isso significa reconhecer e usar com naturalidade a parte do inglês que sustenta as conversas mais comuns.</p>
        <EssentialDiagram />
        <p>O idioma possui milhares de palavras, mas elas não aparecem com a mesma frequência. Um grupo muito menor retorna o tempo todo. São pronomes, verbos comuns, perguntas, conectores e estruturas que organizam quase qualquer assunto.</p>
        <p>Isso não autoriza a promessa de que “500 palavras resolvem 90% do inglês”. A forma de contar palavras varia, e cobertura não é o mesmo que compreensão. Pesquisas sobre fala cotidiana trabalham com milhares de famílias de palavras para níveis altos de cobertura.</p>
        <p>Mas a conclusão prática continua forte: uma parte relativamente pequena do idioma aparece muito mais do que o restante. Essa parte merece ser treinada com muito mais profundidade.</p>
        <p>Pense numa conversa. As pessoas cumprimentam, perguntam, concordam, discordam, explicam causa, criam contraste e pedem esclarecimento. O tema muda, mas essas funções continuam. Você pode falar sobre trabalho, viagem ou família usando muitas das mesmas estruturas.</p>
        <p>A Fluência Essencial não é inglês infantil. Também não é decorar frases de sobrevivência. É ter uma base conversacional rápida o bastante para que você consiga compreender, responder e continuar.</p>
        <p>Depois, o vocabulário cresce de acordo com a sua vida. Quem trabalha com tecnologia aprende termos de tecnologia. Quem deseja vender em dólar aprofunda o inglês de vendas, negociação e negócios. A base é comum; o destino dá a direção.</p>
        <Secret number="#05">Sua primeira meta não é saber todo o inglês. É fazer o inglês mais recorrente deixar de desaparecer na hora em que você precisa dele.</Secret>
        <p>Para essa base ficar disponível, duas capacidades precisam ser treinadas desde o começo: ouvir e falar. E o ouvido merece atenção especial, porque ele não nasce pronto para separar os sons de outro idioma.</p>
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
        <p className={styles.lead}>O ouvido de quem aprende inglês passa por um processo parecido com o ouvido de um músico.</p>
        <EarDiagram />
        <p>Um músico experiente percebe quando uma nota está levemente errada. O som não chega de outra forma para ele. A diferença é que seu ouvido comparou aquele padrão tantas vezes que aprendeu a notar detalhes.</p>
        <p>Na fala acontece algo semelhante. No começo, uma frase pode parecer um único som comprido. Depois de escutar o mesmo trecho, conferir o texto e voltar ao áudio, o ouvido começa a localizar palavras, reduções e emendas.</p>
        <p>É por isso que uma frase pode ser fácil no papel e impossível no vídeo. Você conhece as palavras escritas, mas ainda não reconhece a forma que elas assumem quando um falante as conecta em velocidade normal.</p>
        <p>Escutar ajuda. Mas apenas deixar o inglês tocando não garante que o ouvido descubra o que está perdendo. Uma pessoa pode ouvir música durante a vida inteira sem se tornar musicista. A exposição oferece matéria-prima; o treino chama atenção para o detalhe.</p>
        <p>Um trecho curto permite esse trabalho. Você escuta sem texto, descobre onde se perdeu, confere a frase e retorna ao mesmo ponto. O som que parecia uma massa começa a ganhar divisões.</p>
        <p>Depois que você entende, ainda pode repetir até reconhecer sem legenda. Esse é o momento em que o texto deixa de ser resposta e passa a ter cumprido sua função de mapa.</p>
        <p>Quanto mais palavras e expressões essenciais o ouvido aprende a encontrar, menos energia você gasta tentando adivinhar onde cada palavra começa. A compreensão fica mais rápida porque o som deixa de ser inteiramente novo.</p>
        <Secret number="#06">Escutar inglês não é apenas receber som. É ensinar o ouvido a encontrar, dentro do som, padrões que antes passavam despercebidos.</Secret>
        <p>E, quando esses padrões começam a aparecer, você percebe que uma conversa não é construída palavra por palavra. Ela acontece em blocos.</p>
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
        <p className={styles.lead}>Expressões são a base de uma conversa.</p>
        <p>Quando alguém chega e diz <em>How are you?</em>, não está inventando uma pergunta palavra por palavra. O bloco inteiro já existe. O mesmo vale para <em>What do you think about it?</em>, <em>I don&apos;t know if</em> ou <em>The thing is</em>.</p>
        <BlocksDiagram />
        <p>Em português, fazemos isso o tempo todo. “Deixa eu ver”, “por outro lado”, “o problema é que” e “não sei se faz sentido” saem como unidades. Você não escolhe cada palavra. O bloco já carrega uma função.</p>
        <p>É isso que dá velocidade. Quanto mais decisões precisam ser tomadas no meio da frase, maior a chance de travar. Quando uma expressão inteira está disponível, sua atenção pode se concentrar na ideia que deseja colocar dentro dela.</p>
        <p>As palavras mais comuns também reaparecem dentro dessas estruturas. Você começa a notar que não está aprendendo apenas uma frase. Está treinando peças que voltam em perguntas, respostas e argumentos diferentes.</p>
        <p>Foi o que aconteceu com os discursos que eu repetia. O assunto era vendas, mas grande parte da linguagem era formada por estruturas comuns: fazer uma pergunta, apresentar uma razão, criar contraste, explicar um problema e conduzir uma conclusão.</p>
        <p>Ao decorar alguns trechos, eu não estava aprendendo somente aquele discurso. Estava dando velocidade a blocos que apareceriam em muitos outros lugares.</p>
        <p>Isso não significa colecionar listas de expressões fora de contexto. O bloco fica mais forte quando você o escuta dentro de uma intenção, entende o papel que cumpre e o repete como parte de uma fala real.</p>
        <Secret number="#07">Palavras ampliam o que você conhece. Expressões reduzem o número de decisões necessárias para transformar uma ideia em fala.</Secret>
        <p>Agora podemos entender o que significa levar o inglês do conhecimento consciente para a execução automática.</p>
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
        <p className={styles.lead}>No começo, você precisa pensar. Depois do treino, precisa pensar cada vez menos nos movimentos básicos.</p>
        <p>Essa passagem costuma ser explicada com números sobre a diferença entre o que chega ao sistema nervoso e o que cabe na atenção consciente. Uma estimativa muito citada compara cerca de 11 milhões de bits por segundo de processamento sensorial não consciente com aproximadamente 50 bits por segundo de processamento consciente.</p>
        <p>A diferença é de cerca de <strong>220 mil vezes</strong>.</p>
        <p>O número é poderoso, mas precisa ser entendido corretamente. Ele não diz que o “subconsciente aprende inglês 220 mil vezes mais rápido”. Compara o enorme volume de informação tratado fora da consciência com o canal estreito daquilo em que conseguimos prestar atenção deliberadamente.</p>
        <p>O fenômeno pode ser observado de forma simples. No início, você aprende uma frase e precisa lembrar a regra, procurar a palavra e conferir a ordem. Depois de muitos encontros, reconhece a mesma estrutura mais rápido. Com treino de fala, consegue recuperá-la com menos esforço.</p>
        <p>Dirigir oferece uma imagem clara. Nas primeiras aulas, espelho, seta, embreagem e marcha competem pela atenção. Mais tarde, você realiza essas ações enquanto acompanha o trânsito e mantém uma conversa. As ações não foram entregues a uma parte mágica do cérebro. Elas foram praticadas até exigir menos controle consciente.</p>
        <p>No inglês, o objetivo é criar essa folga. Você não quer gastar toda a atenção procurando uma expressão básica. Quer que ela esteja disponível para que possa observar a pessoa, organizar o raciocínio e decidir o que realmente deseja dizer.</p>
        <p>A tradução mental diminui como consequência. Não porque você se proíbe de traduzir, mas porque o som, o sentido e a resposta passam a se encontrar por caminhos mais curtos.</p>
        <p>Esse limite ajuda a entender por que o treino é tão importante. Se cada som, palavra e regra precisar disputar espaço dentro da atenção consciente, a conversa fica congestionada. Quando padrões básicos são automatizados, a atenção fica livre para compreender a intenção, organizar a resposta e decidir o que dizer.</p>
        <p>Pesquisas sobre automaticidade em um segundo idioma também mostram que a prática pode tornar o reconhecimento mais rápido e estável. O número explica o tamanho do gargalo. O treino mostra como deixar de colocar cada operação básica dentro dele.</p>
        <Secret number="#08">O automático não é ausência de consciência. É o resultado de ter treinado as partes básicas até que elas deixem de consumir toda a consciência.</Secret>
        <p>Para construir isso, você precisa de dois tipos de repetição. O primeiro acontece quando permanece no mesmo material.</p>
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
        <p className={styles.lead}>Repetição continuada é repetir o mesmo material várias vezes dentro do mesmo período de treino.</p>
        <p>Não se trata de apertar play distraidamente. Você volta com tarefas diferentes. Primeiro tenta entender. Depois confere o texto. Em seguida escuta sem apoio. Quando o trecho fica claro, acompanha a pessoa em voz alta.</p>
        <RepetitionDiagram />
        <p>Esse tipo de repetição faz o ouvido parar de tratar cada escuta como um encontro novo. A surpresa diminui. Os sons se separam. As expressões ficam previsíveis e a fala começa a caber na sua boca.</p>
        <p>A primeira escuta mostra o ponto de partida. As seguintes permitem trabalhar exatamente onde você falhou. Isso seria impossível num fluxo infinito de conteúdo novo, porque o problema desapareceria junto com o trecho.</p>
        <p>A repetição continuada também revela uma diferença importante entre entender e dominar. Você pode entender assim que lê a transcrição. Ainda assim, talvez não reconheça sem texto ou não consiga acompanhar em voz alta. Cada volta retira uma camada de dificuldade.</p>
        <p>É parecido com aprender um solo. Descobrir quais notas estão sendo tocadas não encerra o treino. É justamente depois de descobrir que o músico começa a repetir até tocar no ritmo.</p>
        <p>No inglês, muita gente para no equivalente a descobrir as notas. Entende a frase e já passa para a próxima. A compreensão chegou, mas não teve tempo de ganhar velocidade.</p>
        <Secret number="#09">A primeira vez pode ensinar o que a frase significa. As repetições seguintes ensinam o ouvido e a boca a lidar com ela na velocidade em que existe.</Secret>
        <p>O formato mais fácil para começar esse processo costuma ser um discurso curto.</p>
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
        <p className={styles.lead}>Discursos oferecem uma boa ponte entre o inglês estudado e o inglês falado.</p>
        <p>Em geral, a pessoa articula melhor, organiza o raciocínio e mantém o mesmo assunto por mais tempo. Isso torna o áudio mais acessível que uma conversa cheia de interrupções, sem transformar o material numa aula criada para alunos.</p>
        <p>Um discurso também treina algo que respostas curtas não treinam: continuidade. Você acompanha como uma ideia começa, ganha razões, apresenta contraste e chega a uma conclusão.</p>
        <p>Foi por isso que os áudios de vendas tiveram tanto valor para mim. Além de estarem ligados ao futuro que eu desejava, eles me colocavam diante de argumentos completos. Eu não repetia apenas frases de cumprimento. Repetia maneiras de sustentar uma ideia.</p>
        <p>Isso não significa que discursos sejam suficientes. Conversas exigem reação, troca de voz, humor e respostas inesperadas. Mas, no início, um discurso permite reduzir parte dessa confusão e concentrar o treino no som, nos blocos e no ritmo.</p>
        <p>Depois, o mesmo princípio pode ser aplicado a entrevistas, podcasts, filmes e séries. O material muda. A lógica permanece: escolher algo compreensível, dividir em partes pequenas e repetir com atenção.</p>
        <Note title="Escolha um discurso útil"><p>Prefira alguém que fale com clareza, sobre um assunto que você realmente queira compreender. Interesse não substitui repetição, mas ajuda você a permanecer nela.</p></Note>
        <Secret number="#10">Discursos treinam o inglês de sustentar uma ideia. Conversas treinam o inglês de reagir a outra pessoa. Você precisa dos dois, mas não precisa começar pelos dois ao mesmo tempo.</Secret>
        <p>Escolhido o material, a unidade de treino precisa ser pequena o bastante para que você consiga observar a própria melhora.</p>
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
        <p className={styles.lead}>Pegue o discurso e divida em trechos de aproximadamente um minuto.</p>
        <p>O minuto não precisa terminar exatamente no segundo sessenta. Pode acompanhar o fim de uma frase ou de uma ideia. O importante é que seja curto o bastante para você voltar ao ponto exato sem se perder.</p>
        <MinuteDiagram />
        <p>Na primeira escuta, tente entender sem legenda. Depois leia a transcrição e confirme o significado. Volte ao áudio até conseguir acompanhar sem depender do texto.</p>
        <p>É aqui que muita gente passaria para o segundo minuto. O treino faz o contrário: permanece no primeiro. Você pode repetir durante vinte minutos ou mais, desde que continue prestando atenção ao som e à tarefa.</p>
        <p>Quando o trecho estiver claro, comece a acompanhar em voz alta. Não tente falar mais alto que o áudio. Escute enquanto repete. O objetivo do shadowing não é vencer uma corrida, mas aproximar seu ritmo, suas pausas e suas ligações do modelo.</p>
        <p>A velocidade pode ser aumentada como desafio depois que o material já está compreendido. Ouvir a 1,25× ou 1,5× pode criar uma margem extra para que a velocidade normal pareça confortável.</p>
        <p>Mas 2× não é uma definição de fluência. Alguns áudios já são rápidos em velocidade normal. Outros são lentos. Aumentar um material que você ainda não entende apenas torna o ruído mais veloz. A regra útil é aumentar somente quando a nova velocidade ajuda a revelar uma fragilidade que você consegue trabalhar.</p>
        <p>Depois de dominar o primeiro minuto, avance para o segundo. Ao final, escute o discurso inteiro. Você não estará ouvindo apenas um arquivo conhecido. Estará juntando partes que foram treinadas com profundidade.</p>
        <Secret number="#11">Dividir o material não diminui o desafio. Torna o desafio pequeno o bastante para ser repetido, observado e vencido.</Secret>
        <p>O mesmo princípio ganha ainda mais força quando chega às séries: em vez de atravessar uma temporada sem entender, você pode dominar um episódio.</p>
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
        <p className={styles.lead}>Treinar um episódio até entendê-lo pode produzir mais mudança que assistir a uma temporada inteira entendendo quase nada.</p>
        <p>A temporada oferece história, diversão e contato com o idioma. Isso tem valor. O problema é confundir tempo de tela com capacidade construída.</p>
        <EpisodeDiagram />
        <p>Num episódio, as palavras e expressões essenciais se repetem. O tema muda algumas peças, mas perguntas, respostas, pronomes, verbos comuns e estruturas de conversa continuam voltando.</p>
        <p>Ao trabalhar o mesmo episódio várias vezes, você não memoriza apenas a história. Ensina o ouvido a lidar com aquelas vozes, com o ritmo da conversa e com blocos que também aparecerão em outros capítulos.</p>
        <p>É como um músico que aprende uma música com cuidado. Ao começar a próxima, não volta ao ponto zero. A postura, o ritmo e muitos movimentos permanecem. No inglês, o segundo episódio traz novidades, mas encontra um ouvido que já aprendeu a procurar padrões.</p>
        <p>O objetivo não é ficar preso ao mesmo episódio para sempre. É avançar depois de ter criado alguma coisa que possa avançar com você.</p>
        <p>Você pode usar a velocidade como teste, mas não como troféu. Em séries com fala rápida, entender bem em velocidade normal já é um resultado forte. O sinal mais importante é perceber que, ao entrar no próximo episódio, parte do idioma já não parece completamente nova.</p>
        <Secret number="#12">Volume mostra quanto conteúdo passou diante de você. Domínio mostra quanto daquele conteúdo mudou a forma como você ouve o próximo.</Secret>
        <p>Até aqui, falamos de permanecer no material durante o treino. Falta o segundo tipo de repetição: voltar depois que o tempo levou embora a facilidade do momento.</p>
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
        <p className={styles.lead}>A repetição continuada aprofunda. A repetição espaçada verifica se aquilo ficou.</p>
        <p>Depois de repetir uma frase muitas vezes, tudo parece fácil. O som está fresco, o texto acabou de ser visto e a boca já sabe o movimento. Essa facilidade é útil, mas ainda não prova que a expressão estará disponível amanhã.</p>
        <p>O intervalo cria um teste mais honesto.</p>
        <p>Quando a frase retorna depois de algumas horas ou dias, você tenta entendê-la e repeti-la antes de consultar. Se foi fácil, ela pode demorar mais para voltar. Se foi difícil, retorna mais cedo. Esse é o princípio de sistemas de repetição espaçada, como o Anki.</p>
        <p>Dentro de filmes e séries, o trabalho pode ser feito frase por frase. Você escuta, tenta compreender, confere a resposta e informa o nível de dificuldade. O sistema organiza as próximas revisões.</p>
        <p>O valor não está no aplicativo em si. Está em não depender apenas da vontade de revisar. O intervalo separa aquilo que você realmente recupera daquilo que parecia dominado porque ainda estava na memória imediata.</p>
        <p>As duas repetições cumprem papéis diferentes. Se você apenas repete na mesma hora, pode criar familiaridade sem permanência. Se apenas revisa frases que nunca aprofundou, cada encontro continua difícil demais. Primeiro você torna o padrão claro; depois precisa reencontrá-lo.</p>
        <p>Ao fazer isso com frases de conteúdos conversacionais, as mesmas estruturas reaparecem em contextos diferentes. A revisão deixa de ser uma lista de vocabulário e passa a ser treino de ouvido, pronúncia e resposta.</p>
        <Secret number="#13">Repetição continuada transforma ruído em padrão. Repetição espaçada transforma um padrão fácil agora em algo que você consegue recuperar depois.</Secret>
        <p>Com o essencial mais claro, os blocos mais disponíveis e o ouvido treinado, acontece a mudança que torna todo o esforço inicial mais leve: você começa a aprender inglês enquanto usa o inglês.</p>
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
        <p className={styles.lead}>O inglês rápido e leve existe. Ele começa quando você entende o bastante para entrar em imersão.</p>
        <p>Imersão simulada significa organizar o seu dia para que boa parte do conteúdo que consome esteja em inglês, mesmo sem morar fora. Vídeos, livros, podcasts, aulas e entretenimento passam a fazer parte do ambiente.</p>
        <ImmersionDiagram />
        <p>Mas existe uma ordem. Se quase tudo ainda parece ruído, cercar-se de inglês pode apenas cercar você de frustração. Você ouve, não entende e precisa fazer força para permanecer.</p>
        <p>Depois que a base essencial está mais automática, o cenário muda. Você entende a linha principal, reconhece blocos e usa o contexto para descobrir palavras novas. O assunto passa a ser mais importante que o idioma.</p>
        <p>Foi assim que conteúdos de vendas e desenvolvimento pessoal ajudaram meu inglês. Eu queria aprender o que aquelas pessoas ensinavam. O idioma era o meio. Ao buscar um assunto que me interessava, continuava encontrando inglês sem precisar transformar cada minuto numa aula.</p>
        <p>Esse é o ponto em que a curiosidade começa a dividir o trabalho com a disciplina. Você assiste porque quer saber o que acontece, lê porque deseja a ideia e escuta porque o conteúdo tem valor.</p>
        <p>A imersão não encerra o treino concentrado. Quando surge uma dificuldade específica, você ainda pode voltar a um trecho, conferir o texto e repetir. A diferença é que agora existe um ambiente inteiro oferecendo novos exemplos para aquilo que já foi treinado.</p>
        <p>A rota também se torna pessoal. Quem quer viajar consome situações de viagem. Quem quer trabalhar em inglês busca reuniões, entrevistas e conteúdos da própria área. Quem quer vender em dólar escuta vendedores, negociações e apresentações.</p>
        <Secret number="#14">Imersão não é o lugar onde você joga um inglês que ainda não funciona. É o lugar onde um inglês já treinado começa a crescer por meio da própria vida.</Secret>
        <p>É assim que repetição e expansão deixam de ser opostas. Você aprofunda para ganhar capacidade. Depois usa essa capacidade para entrar em mais conteúdo, onde encontra os próximos padrões que merecem profundidade.</p>
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
        <p className={styles.lead}>O pendrive quase vazio me obrigou a fazer algo que uma biblioteca infinita torna difícil: permanecer.</p>
        <p>Eu não sabia que estava praticando repetição continuada. Não conhecia a expressão Fluência Essencial. Apenas escutava os mesmos discursos, percebia cada vez mais detalhes e tentava acompanhar a fala.</p>
        <p>O que parecia uma limitação acabou revelando uma forma diferente de enxergar a fluência.</p>
        <p>Você não para de traduzir porque aprendeu mais uma regra. Para de depender da tradução quando sons, sentidos e expressões começam a se encontrar sem a ponte constante do português.</p>
        <p>Esse caminho passa por treino. Primeiro, você reduz o território ao inglês que mais volta. Depois, lapida o ouvido, repete blocos, acompanha falas e retorna ao material depois de um intervalo.</p>
        <p>Um minuto fica claro. Um discurso começa a fluir. Um episódio deixa de parecer uma massa de som. Então o próximo conteúdo encontra você um pouco mais preparado.</p>
        <p>Não há necessidade de transformar isso numa promessa mágica. A mudança é mais concreta: aquilo que antes exigia pausa começa a acontecer enquanto o inglês ainda está sendo falado.</p>
        <Secret number="#15">Fluência não nasce do volume de inglês que você já encontrou. Nasce da parte desse inglês que foi treinada até conseguir chegar a tempo.</Secret>
        <p>Quando sentir que precisa de mais conteúdo, faça antes uma pergunta: eu realmente esgotei o que este trecho ainda pode ensinar ao meu ouvido e à minha fala?</p>
        <p>Talvez o próximo salto não esteja no próximo vídeo. Talvez esteja na próxima repetição.</p>
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
