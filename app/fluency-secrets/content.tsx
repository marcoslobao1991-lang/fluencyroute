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

function TranslationTax() {
  return (
    <figure className={styles.diagram} aria-labelledby="translation-tax-title">
      <figcaption><span>MECANISMO 01</span><strong id="translation-tax-title">O Imposto da Segunda Conversa</strong></figcaption>
      <div className={styles.loopGrid}>
        <div className={styles.loopNode}><small>01</small>O som chega</div><span className={styles.arrow}>→</span>
        <div className={styles.loopNode}><small>02</small>Você procura palavras</div><span className={styles.arrow}>→</span>
        <div className={styles.loopNode}><small>03</small>Monta o português</div><span className={styles.arrow}>→</span>
        <div className={styles.loopNode}><small>04</small>Cria a resposta</div><span className={styles.arrow}>→</span>
        <div className={`${styles.loopNode} ${styles.loopNodeAccent}`}><small>05</small>Reconstrói em inglês</div>
      </div>
      <p className={styles.diagramCaption}>A conversa continua. Sua cabeça ainda está terminando a frase anterior.</p>
    </figure>
  );
}

function LearnVsTrain() {
  return (
    <figure className={styles.diagram} aria-labelledby="learn-train-title">
      <figcaption><span>VIRADA DE CHAVE</span><strong id="learn-train-title">Aprender mostra. Treinar faz sair.</strong></figcaption>
      <div className={styles.comparison}>
        <div><span>APRENDER</span><strong>“Eu entendi”</strong><p>Explicação, regra, tradução, exemplo visível e tempo para pensar.</p></div>
        <div><span>TREINAR</span><strong>“Eu consigo”</strong><p>Ouvir, lembrar, repetir, variar e responder na hora.</p></div>
      </div>
      <p className={styles.diagramCaption}>A explicação pode encurtar o caminho. Só não pode caminhar no seu lugar.</p>
    </figure>
  );
}

function AvailabilityGap() {
  return (
    <figure className={styles.diagram} aria-labelledby="availability-title">
      <figcaption><span>MECANISMO 02</span><strong id="availability-title">O Inglês que Some na Hora H</strong></figcaption>
      <div className={styles.availabilityMeter}>
        <div><span>1</span><p><b>Já vi</b> Parece familiar.</p></div>
        <div><span>2</span><p><b>Reconheço</b> Entendo com apoio.</p></div>
        <div><span>3</span><p><b>Recupero</b> Encontro sem consultar.</p></div>
        <div><span>4</span><p><b>Percebo</b> Ouço na fala real.</p></div>
        <div><span>5</span><p><b>Uso</b> Surge antes que o momento passe.</p></div>
      </div>
      <p className={styles.diagramCaption}>Seu inglês real é a parte que aparece enquanto a conversa ainda está acontecendo.</p>
    </figure>
  );
}

function NoveltyTreadmill() {
  return (
    <figure className={styles.diagram} aria-labelledby="novelty-title">
      <figcaption><span>MECANISMO 03</span><strong id="novelty-title">O Vício de Sempre Recomeçar</strong></figcaption>
      <div className={styles.treadmill}>
        <div><b>1</b>Conteúdo novo</div><span>→</span>
        <div><b>2</b>Entendimento fácil</div><span>→</span>
        <div><b>3</b>Sensação de avanço</div><span>→</span>
        <div><b>4</b>Quase nada fica</div><span>↺</span>
      </div>
      <p className={styles.diagramCaption}>Você termina cansado de se mover e descobre que quase nada ficou disponível.</p>
    </figure>
  );
}

function PerceptionLayers() {
  return (
    <figure className={styles.diagram} aria-labelledby="perception-v2-title">
      <figcaption><span>MECANISMO 04</span><strong id="perception-v2-title">O áudio não desacelera. Seu ouvido aprende a separar.</strong></figcaption>
      <div className={styles.perception}>
        <div><span>ANTES</span><p className={styles.soundMess}>whaddayawannado</p><small>Uma massa sonora</small></div>
        <div><span>COM O MAPA</span><p>what do you want to do?</p><small>O texto revela as peças</small></div>
        <div><span>DEPOIS DO TREINO</span><p><b>what do you wanna do?</b></p><small>Um bloco percebido diretamente</small></div>
      </div>
    </figure>
  );
}

function EssentialFilter() {
  return (
    <figure className={styles.diagram} aria-labelledby="essential-v2-title">
      <figcaption><span>MECANISMO 05</span><strong id="essential-v2-title">O Núcleo que Destrava o Resto</strong></figcaption>
      <div className={styles.essentialFilter}>
        <div><span>01</span><b>Recorrência</b><p>Volta em muitas vozes e situações.</p></div>
        <div><span>02</span><b>Combinação</b><p>Forma muitos blocos e funções.</p></div>
        <div><span>03</span><b>Relevância</b><p>Aparece no inglês que você quer viver.</p></div>
      </div>
      <p className={styles.diagramCaption}>Essencial é o inglês que mais volta e mais serve para a vida que você quer viver.</p>
    </figure>
  );
}

function MasteryContrast() {
  return (
    <figure className={styles.diagram} aria-labelledby="mastery-title">
      <figcaption><span>VIRADA DE CHAVE</span><strong id="mastery-title">Passar por muito ou fazer algo ficar?</strong></figcaption>
      <div className={styles.depthCompare}>
        <div><small>UMA TEMPORADA ATRAVESSADA</small><span className={styles.shallow}>━━━━━━━━━━━━━━━━━━━━</span><b>Muito conteúdo</b><p>Centenas de minutos. Difícil dizer o que mudou.</p></div>
        <div><small>UM TRECHO DOMINADO</small><span className={styles.deep}>┃<br/>┃<br/>┃<br/>┃</span><b>Mudança visível</b><p>Você ouve, entende, antecipa, repete e lembra depois.</p></div>
      </div>
    </figure>
  );
}

function RepetitionDirections() {
  return (
    <figure className={styles.diagram} aria-labelledby="repetition-v2-title">
      <figcaption><span>MECANISMO 06</span><strong id="repetition-v2-title">As duas direções da repetição</strong></figcaption>
      <div className={styles.repeatGrid}>
        <div><span className={styles.repeatIcon}>↻</span><small>CONTINUADA</small><b>Profundidade agora</b><p>O trecho volta na mesma sessão; a tarefa muda a cada volta.</p></div>
        <div><span className={styles.repeatIcon}>▷</span><small>ESPAÇADA</small><b>Lembrar depois</b><p>O intervalo mostra se aquilo ficou ou se só parecia fácil na hora.</p></div>
      </div>
    </figure>
  );
}

function MasteryThreshold() {
  return (
    <figure className={styles.diagram} aria-labelledby="threshold-title">
      <figcaption><span>CRITÉRIO DE SAÍDA</span><strong id="threshold-title">A Linha do Automático</strong></figcaption>
      <div className={styles.scorecard}>
        <div><span>01</span><b>Percebo</b><p>Os blocos principais aparecem sem legenda.</p></div>
        <div><span>02</span><b>Entendo</b><p>O sentido chega sem reconstrução constante.</p></div>
        <div><span>03</span><b>Antecipio</b><p>Algumas sequências ficam previsíveis.</p></div>
        <div><span>04</span><b>Acompanho</b><p>Consigo reproduzir ritmo sem abandonar a escuta.</p></div>
        <div><span>05</span><b>Lembro</b><p>Depois de um intervalo, aquilo ainda aparece.</p></div>
      </div>
    </figure>
  );
}

function ExperimentCard() {
  const days = [
    ["DIA 1", "Medir", "Escute sem apoio e registre o que realmente chegou."],
    ["DIA 2", "Mapear", "Compare som, transcrição e significado."],
    ["DIA 3", "Separar", "Localize blocos, reduções e emendas."],
    ["DIA 4", "Antecipar", "Repita até prever partes da sequência."],
    ["DIA 5", "Acompanhar", "Faça shadowing sem transformar em corrida."],
    ["DIA 6", "Recuperar", "Volte depois do intervalo, primeiro sem apoio."],
    ["DIA 7", "Comparar", "Repita o teste inicial e veja o que mudou."],
  ];
  return (
    <figure className={`${styles.diagram} ${styles.experiment}`} aria-labelledby="experiment-v2-title">
      <figcaption><span>PROTOCOLO DE PROVA</span><strong id="experiment-v2-title">Sete dias, um trecho, duas gravações</strong></figcaption>
      <div className={styles.experimentDays}>
        {days.map(([day, verb, description]) => <div key={day}><span>{day}</span><b>{verb}</b><p>{description}</p></div>)}
      </div>
    </figure>
  );
}

function TransferLadder() {
  return (
    <figure className={styles.diagram} aria-labelledby="transfer-v2-title">
      <figcaption><span>MECANISMO 07</span><strong id="transfer-v2-title">O Inglês Puxa Mais Inglês</strong></figcaption>
      <div className={styles.routeMap}>
        <div><span>01</span><b>Trecho</b><small>nitidez</small></div><i>→</i>
        <div><span>02</span><b>Episódio</b><small>recorrência</small></div><i>→</i>
        <div><span>03</span><b>Discurso</b><small>continuidade</small></div><i>→</i>
        <div><span>04</span><b>Imersão</b><small>expansão</small></div>
      </div>
      <p className={styles.diagramCaption}>O material aumenta, mas o que você treinou vai junto.</p>
    </figure>
  );
}

export const chapters: Chapter[] = [
  {
    id: "o-pendrive-quase-vazio",
    part: "Prólogo",
    title: "O pendrive quase vazio",
    eyebrow: "A limitação que acabou virando método",
    readingTime: 6,
    content: (
      <>
        <p className={styles.lead}>Durante um período da minha vida, meu escritório tinha quatro rodas.</p>
        <p>Eu trabalhava como vendedor e passava horas dirigindo de uma cidade para outra. Naquela época, o som do carro não oferecia uma biblioteca infinita. O que eu tinha era um pendrive — e aquele pendrive tinha pouca coisa.</p>
        <p>Entre os poucos arquivos havia áudios de vendas em inglês, alguns de Jordan Belfort, outros de Grant Cardone. Eu os tinha baixado por uma razão que, naquele momento, parecia maior do que a minha realidade: queria trabalhar vendendo em dólar.</p>
        <p>Para isso, um inglês “mais ou menos” não bastaria. Eu teria de notar a dúvida na voz de alguém, responder objeções e defender uma ideia. Tudo isso diante de um americano que poderia desligar a qualquer momento. Meu inglês precisaria funcionar na velocidade da conversa.</p>
        <p>Como não havia muito para escolher, os mesmos áudios começavam de novo. E de novo. Em algumas viagens, as mesmas falas me acompanhavam por horas.</p>
        <p>Não existia método. Não havia caderno. Eu não sabia que estava treinando alguma coisa. Era simplesmente o material disponível.</p>
        <p>Até que os áudios começaram a ficar mais lentos.</p>
        <p>Não um pouco. Trechos que antes chegavam como uma massa de som começaram a se abrir. Primeiro aparecia uma palavra. Depois uma expressão. Em seguida, eu sabia o que viria antes de a frase terminar.</p>
        <p>Naturalmente, Jordan Belfort não tinha decidido falar mais devagar porque eu estava na estrada. O arquivo era idêntico. A velocidade era idêntica.</p>
        <p>Alguma coisa havia mudado em quem escutava.</p>
        <p>Foi então que tentei levar o mesmo princípio para a fala. Passei a acompanhar discursos curtos em voz alta, repetindo ritmo, pausas, emendas e intenção. Alguns trechos se repetiram tanto que ficaram decorados.</p>
        <p>E aconteceu a parte mais importante: a melhora não ficou presa aos áudios. Palavras e blocos daqueles discursos apareciam em outros lugares. Eu os reconhecia mais rápido. Minha boca os encontrava com menos esforço. O material era pequeno, mas o ganho seguia comigo.</p>
        <Secret number="#01">Eu não melhorei porque encontrei mais conteúdo. Melhorei porque parei de abandonar o mesmo conteúdo antes que ele pudesse mudar a minha percepção.</Secret>
        <p>Na época, eu queria um pendrive maior. Hoje sei que a escassez me protegeu de um erro que a internet transformou em hábito: confundir acesso infinito com progresso.</p>
        <p>Este livro começa com uma pergunta simples. Se o áudio não ficou mais lento, o que exatamente ficou mais rápido dentro de mim?</p>
      </>
    ),
  },
  {
    id: "a-conversa-que-chega-atrasada",
    part: "Parte I — O diagnóstico que muda tudo",
    number: 1,
    title: "A conversa que chega atrasada",
    eyebrow: "O custo invisível de traduzir cada frase",
    readingTime: 5,
    content: (
      <>
        <p className={styles.lead}>Talvez você não tenha uma conversa em inglês. Talvez tenha duas.</p>
        <p>Na primeira, a pessoa fala com você. Na segunda, dentro da sua cabeça, você segura os sons, procura palavras conhecidas e monta a frase em português. Quando finalmente entende, começa o caminho de volta: pensar na resposta, passá-la para o inglês e tentar falar.</p>
        <p>Enquanto isso, a primeira conversa continua.</p>
        <TranslationTax />
        <p>Esse atraso é o <strong>Imposto da Segunda Conversa</strong>. Ele não aparece num exercício escrito, porque o papel espera. Uma pessoa não. Enquanto sua cabeça refaz a frase em português, você perde humor, intenção e reação.</p>
        <p>Traduzir não é errado. Até quem fala muito bem traduz quando precisa. A diferença está em poder escolher. Uma coisa é traduzir porque você quer. Outra é só conseguir entender depois de passar pelo português.</p>
        <p>Pense numa entrevista. A pessoa faz uma pergunta simples, mas inesperada. Você conhece quase todas as palavras. Mesmo assim, precisa segurá-las enquanto monta o português. Quando termina, já deveria estar respondendo. O silêncio que parece “nervosismo” muitas vezes é só uma fila de tarefas dentro da cabeça.</p>
        <p>Isso explica por que a mesma pessoa pode responder bem por mensagem e travar numa chamada. No texto, o Imposto da Segunda Conversa é parcelado: você relê, apaga, consulta e reconstrói. Na fala, ele vence à vista.</p>
        <p>Você já possui caminhos diretos. Provavelmente não traduz <em>thank you</em>, <em>hello</em> ou <em>I love you</em> toda vez. O som já carrega função, contexto e sensação. O ponto decisivo é perceber que isso não é privilégio de três expressões simples. Caminhos diretos podem ser construídos para blocos maiores.</p>
        <Note title="Faça o diagnóstico, não o julgamento"><p>Na próxima frase em inglês, observe o trajeto. O significado apareceu junto do som ou somente depois de uma legenda interna? A resposta revela o caminho atual; não determina o caminho futuro.</p></Note>
        <Secret number="#02">Você não precisa aprender a traduzir na velocidade da conversa. Precisa construir inglês que não dependa da tradução para ser compreendido.</Secret>
        <p>Essa mudança parece ser sobre vocabulário. Não é. Ela começa numa distinção que quase sempre passa despercebida: reconhecer uma resposta não é conseguir executá-la.</p>
      </>
    ),
  },
  {
    id: "entender-nao-e-conseguir",
    part: "Parte I — O diagnóstico que muda tudo",
    number: 2,
    title: "Entender não é conseguir",
    eyebrow: "A diferença entre reconhecer e executar",
    readingTime: 4,
    content: (
      <>
        <p className={styles.lead}>Imagine assistir a um tutorial impecável sobre como pousar um avião.</p>
        <p>O piloto explica instrumentos, aproximação, velocidade e sequência. Você acompanha cada etapa. Talvez consiga até responder uma prova sobre o procedimento.</p>
        <p>Agora as luzes da cabine acendem e alguém diz: “Sua vez”.</p>
        <p>Ninguém confundiria ter entendido o tutorial com ser capaz de pousar o avião. Mas fazemos exatamente essa confusão no inglês o tempo inteiro.</p>
        <p>Uma regra é explicada. A tradução faz sentido. O exercício mantém todas as pistas na tela. Você acerta e recebe a sensação legítima de compreensão. O problema é dar a essa sensação o nome de habilidade.</p>
        <p>A vida real tira essas pistas. O som chega uma vez, com palavras emendadas, sotaque, emoção e barulho. Não existe lista de respostas. É aí que você descobre se apenas conhece aquilo ou se consegue usar.</p>
        <AvailabilityGap />
        <p>Entre “já vi” e “consigo usar na hora” existe o <strong>Inglês que Some na Hora H</strong>. É aquela experiência frustrante: diante da apostila, parece que você sabe. Diante de uma pessoa, parece que tudo sumiu.</p>
        <p>Ele não desapareceu. Está chegando tarde.</p>
        <p>É comum dar outro nome a esse atraso. “Deu branco.” “Fiquei nervoso.” “Na hora eu esqueço tudo.” A ansiedade pode piorar, claro. Mas ela não explica por que a palavra volta segundos depois que a conversa acaba. Muitas vezes, você sabia. Só não conseguiu chegar até ela a tempo.</p>
        <p>Essa interpretação muda a identidade do problema. “Eu sou ruim com idiomas” não oferece ação. “Meu acesso ainda não acompanha a situação” oferece um alvo de treino.</p>
        <p>Pesquisas com pessoas aprendendo outro idioma mostram algo útil: com prática, o reconhecimento pode ficar mais rápido e mais firme. Isso importa porque fluência não é acertar uma vez. É conseguir de novo quando a situação pede.</p>
        <Note title="Sem número mágico"><p>Não há base sólida para dizer que o “subconsciente é 30.000 vezes mais rápido”. O que a pesquisa permite dizer é mais simples: a prática pode fazer uma palavra chegar mais rápido e com mais constância.</p></Note>
        <Secret number="#03">Seu inglês funcional não é tudo que você sabe. É a parte do que você sabe que chega a tempo.</Secret>
        <p>A pergunta, portanto, deixa de ser “quanto inglês ainda falta?” e passa a ser outra: “quanto do inglês que já encontrei recebeu treino suficiente para ficar disponível?”.</p>
      </>
    ),
  },
  {
    id: "aprender-nao-e-treinar",
    part: "Parte I — O diagnóstico que muda tudo",
    number: 3,
    title: "Aprender inglês não é treinar inglês",
    eyebrow: "A pedrada que reorganiza todo o resto",
    readingTime: 5,
    content: (
      <>
        <p className={styles.lead}>Você pode estudar inglês durante anos sem passar tempo suficiente treinando inglês.</p>
        <p>Essa frase parece uma provocação até você separar os verbos.</p>
        <p><strong>Aprender</strong>, no sentido comum de uma aula, é entender algo novo. <strong>Treinar</strong> é tentar usar aquilo sem todas as pistas, em outras vozes, depois de um tempo e na velocidade da vida real.</p>
        <LearnVsTrain />
        <p>Um músico precisa saber qual acorde tocar. Mas saber o acorde não move seus dedos no ritmo. Um motorista precisa conhecer embreagem e marcha. Mas conhecer as peças não impede o carro de morrer no primeiro cruzamento. Informação orienta a prática; não substitui a prática.</p>
        <p>O tênis de mesa torna a diferença ainda mais brutal. Você pode assistir em câmera lenta à posição correta da raquete e explicar o ângulo do golpe. Quando a bola chega, não existe tempo para narrar a instrução. A percepção precisa reconhecer a trajetória e o movimento precisa começar antes de a explicação consciente terminar.</p>
        <p>Uma conversa é mais lenta que uma bolinha profissional. Mesmo assim, exige algo parecido: se o conhecimento só funciona depois de muita análise, ele ainda não está pronto para a hora H.</p>
        <p>No inglês, essa confusão é gostosa. Você vê uma frase, entende a tradução e pensa: “aprendi”. E aprendeu alguma coisa. Só ainda não provou que consegue ouvir aquilo de outra pessoa, lembrar sem consultar ou usar sob pressão.</p>
        <p>Isso não transforma gramática, professor ou teoria em inimigos. Uma boa explicação economiza tentativa e erro. O erro está em medir uma habilidade pela quantidade de explicações percorridas.</p>
        <p>Se o objetivo é uma prova, reconhecimento pode bastar. Se o objetivo é conversar, trabalhar, assistir e pensar em inglês, o critério precisa mudar. Em vez de “qual assunto terminei?”, pergunte “o que ficou mais nítido, rápido e estável?”.</p>
        <Secret number="#04">A aula mostra o movimento. O treino faz o movimento existir quando você precisa dele.</Secret>
        <p>Essa distinção também expõe por que tanta atividade parece produtiva sem alterar a conversa. O mercado não precisa enganar você para isso acontecer. Basta oferecer novidade no lugar exato em que o cérebro precisava de permanência.</p>
      </>
    ),
  },
  {
    id: "a-esteira-da-novidade",
    part: "Parte I — O diagnóstico que muda tudo",
    number: 4,
    title: "O vício de sempre recomeçar",
    eyebrow: "Quando movimento se fantasia de progresso",
    readingTime: 4,
    content: (
      <>
        <p className={styles.lead}>Nunca foi tão fácil ter contato diário com inglês. Nunca foi tão fácil abandonar uma coisa antes que ela se torne sua.</p>
        <p>Você assiste a uma dica, salva uma expressão, começa uma aula, muda de professor, baixa um aplicativo e encontra outra técnica. Cada encontro oferece uma pequena recompensa: por alguns minutos, algo que era desconhecido fica claro.</p>
        <p>Clareza é boa. Mas ela pode esconder uma pergunta incômoda: amanhã, sem a tela e sem o professor, o que ainda estará disponível?</p>
        <NoveltyTreadmill />
        <p>O <strong>Vício de Sempre Recomeçar</strong> não nasce da preguiça. Muitas vezes, nasce de muito esforço espalhado em primeiros contatos. Você se movimenta, se cansa e sente que estudou. Mas vai embora justamente quando começa o treino que faria aquilo ficar.</p>
        <p>Ele também cria uma injustiça. A explicação parece fácil, mas usar continua difícil. Então você culpa sua memória, sua disciplina ou seu talento. Procura um professor “mais didático”, uma técnica “mais simples” ou uma promessa “mais rápida”. A novidade devolve por alguns minutos a sensação de avanço. E o ciclo começa outra vez.</p>
        <p>O mercado não precisa mentir para manter essa esteira. Basta medir entrega em aulas, módulos, palavras e assuntos, enquanto você mede sua frustração em segundos de silêncio.</p>
        <p>Foi o oposto do que aconteceu no meu carro. O pendrive pequeno retirou a saída de emergência. Quando um trecho deixava de ser interessante, eu não tinha um algoritmo oferecendo o próximo. Os mesmos sons permaneceram até revelarem detalhes que uma primeira escuta não tinha condição de mostrar.</p>
        <p>A lição não é ouvir um único arquivo para sempre. É inverter a ordem: profundidade cria capacidade; variedade testa se essa capacidade transfere.</p>
        <p>Um músico não aprende um solo tocando os primeiros cinco segundos de cem músicas. Um atleta não domina um movimento trocando de exercício sempre que fica difícil. O treino costuma ficar sem graça pouco antes de começar a fazer diferença.</p>
        <Secret number="#05">Conteúdo novo aumenta o que passou por você. Treino profundo aumenta o que permanece em você.</Secret>
        <p>Agora podemos voltar ao fenômeno da estrada. Por que o mesmo áudio, na mesma velocidade, começou a soar diferente?</p>
      </>
    ),
  },
  {
    id: "o-audio-nao-ficou-mais-lento",
    part: "Parte II — Como o inglês entra no automático",
    number: 5,
    title: "O áudio não ficou mais lento",
    eyebrow: "Seu ouvido não recebe palavras prontas",
    readingTime: 5,
    content: (
      <>
        <p className={styles.lead}>Quando a fala parece embolada, costumamos culpar a velocidade.</p>
        <p>Mas o ouvido não recebe espaços entre as palavras. Ele recebe um som corrido. Seu cérebro precisa descobrir onde uma parte termina, que sons foram encurtados e qual padrão conhecido está ali.</p>
        <p>Por isso você pode ler uma frase simples e não reconhecê-la quando alguém fala. A versão escrita que você esperava ouvir palavra por palavra nunca existiu daquele jeito na boca do falante.</p>
        <p>Você estudou <em>what do you want to do?</em>, mas encontra algo parecido com <em>whaddaya wanna do?</em>. Se o ouvido espera cinco peças perfeitamente separadas, o bloco real parece conter palavras desconhecidas. Depois que você vê a transcrição e volta ao mesmo áudio, a frase “aparece”. Essa pequena experiência prova que conhecer o vocabulário e perceber o sinal sonoro são problemas diferentes.</p>
        <PerceptionLayers />
        <p>Um músico experiente nota uma desafinação que outras pessoas não ouvem. O som não chega diferente para ele. A diferença é que seu ouvido já comparou aquele som muitas vezes.</p>
        <p>No inglês, acontece algo parecido. Você compara o som que esperava com o som real, confere o texto e volta ao áudio. Aos poucos, começa a prever o que antes parecia barulho.</p>
        <p>Ouvir mais ajuda quando você entende o bastante para comparar. Quando quase tudo parece barulho, somar horas pode apenas somar barulho. Por isso, um trecho curto, o texto correto e uma tarefa para cada escuta podem valer mais que uma tarde inteira de áudio como som de fundo.</p>
        <p>Isso não é argumento contra exposição extensa. É argumento sobre sequência. Primeiro, concentração ensina o que observar. Depois, variedade apresenta novas vozes, velocidades e contextos para que a percepção se torne flexível.</p>
        <Note title="O que a pesquisa mostra"><p>Estudos com estudantes de outro idioma encontraram ganhos quando a escuta teve apoio e uso planejado do texto. A transcrição não precisa virar muleta. Ela funciona como um mapa temporário: mostra ao ouvido o que os olhos já conseguem ver.</p></Note>
        <Secret number="#06">O problema não é apenas o que você não sabe. É o que você sabe por escrito, mas seu ouvido ainda não aprendeu a encontrar.</Secret>
        <p>Quando o ouvido começa a separar o fluxo, surge outra descoberta: as unidades que ele encontra raramente são palavras isoladas.</p>
      </>
    ),
  },
  {
    id: "voce-nao-conversa-com-palavras",
    part: "Parte II — Como o inglês entra no automático",
    number: 6,
    title: "Você não conversa com palavras",
    eyebrow: "A unidade escondida da fluidez",
    readingTime: 4,
    content: (
      <>
        <p className={styles.lead}>Tecnicamente, frases contêm palavras. Mentalmente, uma conversa não pode depender de montar cada uma delas do zero.</p>
        <p>Quando você diz “deixa eu ver”, “eu acho que”, “o problema é que” ou “não sei se faz sentido”, não seleciona cada peça isoladamente. O grupo inteiro já possui ritmo, função e intenção.</p>
        <p>Em inglês acontece o mesmo: <em>I mean</em>, <em>you know</em>, <em>the thing is</em>, <em>I don’t know if</em>, <em>what I’m trying to say is</em>. Esses blocos voltam com pequenas mudanças e poupam várias decisões.</p>
        <div className={styles.blockDemo}>
          <span>PALAVRA POR PALAVRA — 7 DECISÕES</span>
          <p><i>I</i><i>don’t</i><i>know</i><i>if</i><i>that</i><i>makes</i><i>sense</i></p>
          <span>BLOCOS DISPONÍVEIS — 2 UNIDADES</span>
          <p><b>I don’t know if</b><b>that makes sense</b></p>
        </div>
        <p>Isso não é apenas uma comparação bonita. Estudos encontraram algo concreto: grupos de palavras muito usados tendem a ser entendidos mais rápido que grupos menos comuns, inclusive por quem aprendeu inglês depois.</p>
        <p>É fácil sentir isso em português. Você não monta “por + outro + lado” toda vez que quer mostrar um contraste. O bloco já vem pronto; depois você decide o que dizer. Quanto mais blocos assim estão prontos em inglês, mais atenção sobra para a ideia.</p>
        <p>Isso não significa decorar listas de expressões descontextualizadas. Um bloco ganha força quando você o encontra dentro de intenção real, percebe suas variações e precisa recuperá-lo. Fora de contexto, ele corre o risco de virar apenas uma palavra comprida.</p>
        <p>Foi isso que os discursos do pendrive me deram sem que eu soubesse. Eu achava que estava decorando falas específicas. Na prática, estava tornando disponíveis peças que voltavam em outros argumentos, outras entrevistas e outras conversas.</p>
        <p>Decorar um discurso inteiro não transforma ninguém em fluente. Mas dominar blocos recorrentes contidos nele reduz o número de decisões conscientes necessárias para sustentar uma ideia nova.</p>
        <Secret number="#07">Palavras aumentam o que você pode dizer. Blocos aumentam a velocidade com que uma ideia consegue nascer.</Secret>
        <p>Isso nos leva a uma pergunta libertadora e perigosa: se algumas peças voltam muito mais do que outras, por que tentar dar a todas a mesma prioridade?</p>
      </>
    ),
  },
  {
    id: "fluencia-essencial",
    part: "Parte II — Como o inglês entra no automático",
    number: 7,
    title: "Fluência Essencial",
    eyebrow: "Menor que o idioma, muito maior que o básico",
    readingTime: 6,
    content: (
      <>
        <p className={styles.lead}>Fluência não pode ser conhecer todas as palavras. Ninguém conhece.</p>
        <p>Também não pode ser apenas “se virar”. Existe um meio do caminho: dominar a parte mais útil do idioma a ponto de entender, responder e manter conversas reais.</p>
        <p>Esse território é a <strong>Fluência Essencial</strong>.</p>
        <p>Durante muito tempo, eu mesmo repeti uma frase sedutora: “500 palavras cobrem 90% do inglês”. Ela apontava para algo real — algumas palavras aparecem muito mais que outras —, mas simplificava demais.</p>
        <p>O número fazia o idioma parecer pequeno. Só que “palavra” pode ser contada de vários jeitos, e a porcentagem muda conforme o material analisado. Além disso, reconhecer palavras comuns não garante entender uma conversa ou conseguir responder.</p>
        <p>Pesquisas mais cuidadosas falam em <em>famílias de palavras</em>. Em alguns estudos sobre fala do dia a dia, cerca de 2.000 famílias cobrem mais de 95% do que é dito. Em séries de televisão, uma compreensão confortável pode pedir vários milhares. A fonte e os limites desses números estão nas notas finais.</p>
        <EssentialFilter />
        <p>Mas cobertura não é fluência. Conhecer 95% das palavras não garante ouvir sons emendados, entender ironia ou conseguir responder. O número não cria uma lista mágica. Só mostra o tamanho real do terreno.</p>
        <p>A conclusão forte não é “bastam 500 palavras”. É outra: a parte que mais se repete merece muito mais treino, porque continua voltando enquanto os assuntos mudam.</p>
        <p>A Fluência Essencial usa três filtros. <strong>Recorrência:</strong> isso aparece muitas vezes? <strong>Combinação:</strong> ajuda a formar muitos blocos? <strong>Relevância:</strong> aparece na vida que você quer viver?</p>
        <p>Foi por isso que conteúdos de vendas funcionaram para mim. Eles continham inglês comum — contraste, causa, pergunta, dúvida, concordância — dentro de uma situação que eu desejava viver. Eu não estava decorando um dicionário. Estava aprofundando o centro do idioma dentro do meu destino.</p>
        <Note title="Essencial não significa fácil"><p>Uma palavra simples pode ser difícil de perceber em diferentes vozes e combinações. O essencial reduz a largura inicial do território; não elimina a profundidade exigida para dominá-lo.</p></Note>
        <Secret number="#08">Você não precisa começar pelo idioma inteiro. Precisa começar pela parte que continuará reaparecendo enquanto o seu mundo em inglês aumenta.</Secret>
        <p>Escolher melhor o território é metade da mudança. A outra metade é permanecer nele tempo suficiente para produzir domínio.</p>
      </>
    ),
  },
  {
    id: "um-minuto-dominado",
    part: "Parte III — A vantagem sem graça",
    number: 8,
    title: "Um minuto dominado",
    eyebrow: "A diferença entre atravessar e conquistar",
    readingTime: 5,
    content: (
      <>
        <p className={styles.lead}>Assistir vinte minutos é fácil. Treinar um minuto pode ser difícil.</p>
        <p>É justamente por isso que as duas atividades não produzem a mesma coisa.</p>
        <p>Num episódio inteiro, muita coisa passa antes que você descubra onde se perdeu. Um trecho de trinta a sessenta segundos cabe na atenção. Você pode ouvir, conferir o texto, voltar ao ponto exato, tirar o apoio e perceber se algo mudou.</p>
        <MasteryContrast />
        <p>Ver uma temporada oferece história, prazer e contato com o idioma. Tudo isso tem valor. O problema é usar esse tempo como prova de uma habilidade que você ainda não consegue mostrar.</p>
        <p>Imagine dois estudantes. O primeiro assistiu a uma temporada inteira e consegue resumir a história porque leu legendas. O segundo trabalhou uma única cena e consegue ouvi-la sem apoio, explicar onde os sons se conectam e acompanhar partes da fala. Quem “viu mais inglês”? O primeiro. Quem produziu a evidência mais clara de uma nova capacidade? O segundo.</p>
        <p>Isso não faz de um deles o vencedor. Apenas mostra que assistir e treinar servem para coisas diferentes. O erro é esperar que assistir sozinho produza uma mudança que nunca foi treinada.</p>
        <p>O trecho dominado oferece uma prova menor e mais dura. Você sabe quais sons não apareciam. Sabe onde precisava traduzir. Sabe se agora antecipa. Pode voltar à mesma gravação e verificar.</p>
        <p>Ir fundo não é decorar por vaidade. É ficar até o treino sair daquele arquivo: ouvir o mesmo som em outra voz, usar um bloco numa conversa ou acompanhar um ritmo parecido em outro conteúdo.</p>
        <p>Isso também explica por que “enjoei” não é um critério de saída. O cérebro pode ficar entediado muito antes de ficar capaz. Novidade alimenta atenção; domínio exige que a atenção encontre uma tarefa nova dentro do mesmo material.</p>
        <Secret number="#09">Uma temporada pode provar que você passou vinte minutos diante do inglês. Um minuto dominado pode provar que o inglês mudou dentro de você.</Secret>
        <p>Mas simplesmente apertar play muitas vezes ainda não basta. A repetição que cria capacidade tem direção.</p>
      </>
    ),
  },
  {
    id: "as-duas-repeticoes",
    part: "Parte III — A vantagem sem graça",
    number: 9,
    title: "As duas repetições",
    eyebrow: "Nitidez agora, disponibilidade depois",
    readingTime: 5,
    content: (
      <>
        <p className={styles.lead}>Repetição não é ouvir a mesma coisa com a mente no mesmo lugar.</p>
        <p>Se você faz a mesma coisa em todas as voltas, o som pode virar papel de parede. O arquivo continua igual. O que muda é a tarefa.</p>
        <RepetitionDirections />
        <p>Na <strong>repetição continuada</strong>, as voltas acontecem dentro da mesma sessão. Primeiro você mede. Depois usa a transcrição para mapear. Retorna sem texto para separar. Tenta antecipar. Só então acompanha em voz alta.</p>
        <p>As primeiras voltas tiram a dúvida. As seguintes tiram a demora. Entender depois de pausar não é o mesmo que entender com o som correndo. Entender na hora ainda não é prever. E prever naquele áudio ainda não é usar numa conversa diferente.</p>
        <p>Cada escuta responde a uma pergunta diferente. “O que chegou?” vira “onde os sons se uniram?”, que vira “consigo prever?”, que vira “consigo acompanhar sem parar de ouvir?”.</p>
        <p>Na <strong>repetição espaçada</strong>, você deixa passar um tempo. Quando o trecho volta no dia seguinte, descobre o que ficou e o que só parecia fácil porque tinha acabado de olhar.</p>
        <p>É por isso que uma sessão pode terminar com a sensação de “agora ficou fácil” e o dia seguinte parecer uma pequena regressão. Não é fracasso. É a medição ficando mais honesta. O intervalo revela a diferença entre manter algo ativo e conseguir buscá-lo novamente.</p>
        <p>Uma faz você ir fundo. A outra testa se aquilo ficou. Repetir vinte vezes agora pode deixar o áudio familiar sem criar uma lembrança forte. Mas voltar amanhã sem ter treinado hoje pode fazer cada encontro parecer a primeira vez.</p>
        <p>Muitos estudos mostram que separar os encontros no tempo ajuda a lembrar. Não existe um intervalo perfeito para todo mundo. O princípio é simples: voltar depois que parte da facilidade sumiu obriga você a buscar aquilo de novo.</p>
        <Secret number="#10">A repetição continuada faz o padrão aparecer. A repetição espaçada descobre se ele continua aparecendo quando você já não está aquecido.</Secret>
        <p>Então surge a dúvida prática: quando aprofundar deixa de ser treino e vira apenas permanência confortável?</p>
      </>
    ),
  },
  {
    id: "o-ponto-de-dominio",
    part: "Parte III — A vantagem sem graça",
    number: 10,
    title: "A linha do automático",
    eyebrow: "Quando avançar — e por que 2× não é a meta",
    readingTime: 5,
    content: (
      <>
        <p className={styles.lead}>Você não deve avançar porque ficou entediado. Também não deve permanecer até uma perfeição imaginária.</p>
        <p>O critério precisa ser observável.</p>
        <MasteryThreshold />
        <p>Você cruza a <strong>Linha do Automático</strong> quando os blocos principais aparecem sem legenda e o sentido chega sem reconstrução. Parte da sequência fica previsível. Sua boca consegue acompanhar sem deixar de ouvir. E, depois de um intervalo, você ainda reconhece aquilo.</p>
        <p>Nada disso exige pronúncia perfeita ou memória fotográfica. Exige apenas uma diferença clara em relação à primeira escuta.</p>
        <p>Aumentar a velocidade pode servir como desafio extra quando você já entende o material. Um músico também pode ensaiar mais rápido para tocar com folga depois. Mas entender em 2× não define fluência. E acelerar algo que você não entende só deixa o barulho mais rápido.</p>
        <p>É tentador transformar 2× num símbolo universal de domínio. O símbolo é útil; a regra, não. Fala natural já varia muito. Comédia rápida, entrevista técnica e discurso preparado não impõem a mesma carga. O objetivo é criar margem em relação ao material e à situação que importam, não perseguir um número no botão do player.</p>
        <p>A velocidade certa cria um desafio útil: difícil o bastante para mostrar a falha, mas clara o bastante para você saber o que corrigir.</p>
        <p>Depois da Linha do Automático, variedade deixa de ser fuga e vira teste. Uma nova voz mostra se você aprendeu o arquivo ou o padrão. Um novo contexto mostra se o bloco possui flexibilidade. Um novo assunto revela o que a base essencial consegue sustentar.</p>
        <Secret number="#11">Não aumente a dificuldade para provar coragem. Aumente quando a nova dificuldade conseguir revelar a próxima adaptação.</Secret>
        <p>Até aqui falamos de entender e reproduzir trechos. Mas a vida exige duas formas de permanência em inglês: trocar rapidamente e sustentar uma ideia.</p>
      </>
    ),
  },
  {
    id: "conversar-e-sustentar",
    part: "Parte III — A vantagem sem graça",
    number: 11,
    title: "Conversar e sustentar uma ideia",
    eyebrow: "Por que episódios e discursos treinam forças diferentes",
    readingTime: 4,
    content: (
      <>
        <p className={styles.lead}>Responder “yes” rapidamente não é a mesma coisa que explicar por que alguém deveria contratar você.</p>
        <p>Conversas e discursos usam o mesmo idioma, mas exigem forças diferentes.</p>
        <div className={styles.comparison}>
          <div><span>CONVERSAÇÃO</span><strong>Trocar</strong><p>Perguntas, reações, interrupções, humor, reduções e blocos sociais.</p></div>
          <div><span>DISCURSO</span><strong>Sustentar</strong><p>Sequência, argumento, causa, contraste, transições, ênfase e intenção.</p></div>
        </div>
        <p>Episódios conversacionais ensinam o ouvido a lidar com turnos curtos, vozes diferentes e fala cotidiana. Discursos mostram como uma ideia permanece de pé durante minutos.</p>
        <p>Na entrevista que eu imaginava fazer em inglês, as duas forças apareceriam na mesma sala. Eu precisaria entender a pergunta reduzida e espontânea; depois precisaria explicar experiência, criar contraste, contar uma história e defender valor. Treinar apenas respostas curtas me deixaria rápido e raso. Treinar apenas discursos poderia me deixar estruturado e incapaz de reagir.</p>
        <p>Os áudios de vendas importaram para mim porque meu destino exigia as duas capacidades. Eu precisava reagir a objeções sem congelar e, ao mesmo tempo, construir um raciocínio que mantivesse alguém na ligação.</p>
        <p>Por isso, o material “mais divertido” ou “mais fácil” nem sempre é o melhor. O melhor é aquele que treina o tipo de situação que você quer viver.</p>
        <Note title="A pergunta de destino"><p>Se o seu inglês estivesse disponível amanhã, onde ele seria testado primeiro: numa conversa social, numa entrevista, numa reunião, numa viagem, numa apresentação ou numa negociação?</p></Note>
        <Secret number="#12">Fluência não é apenas responder sem pausa. É conseguir permanecer em inglês enquanto uma ideia inteira toma forma.</Secret>
        <p>Chegou o momento de retirar a teoria da zona confortável. Um mecanismo que não pode ser testado é apenas uma história bem contada.</p>
      </>
    ),
  },
  {
    id: "o-experimento-fluency-secrets",
    part: "Parte IV — A prova",
    number: 12,
    title: "O Experimento Fluency Secrets",
    eyebrow: "Sete dias para colocar a tese em risco",
    readingTime: 8,
    content: (
      <>
        <p className={styles.lead}>Não quero que você acredite neste livro.</p>
        <p>Quero que escolha uma gravação e dê ao argumento a chance de falhar diante de você.</p>
        <p>O experimento não promete fluência em sete dias. Ele testa algo menor e mais sério: um trecho que hoje exige esforço, apoio e tradução pode ficar mais claro e direto? Treino concentrado e revisão depois de um intervalo conseguem produzir essa mudança?</p>
        <p>Essa promessa menor vale mais do que “fluência rápida” porque pode ser testada. No final, você terá o mesmo áudio, dois textos e duas gravações da sua voz. Não precisará confiar na lembrança de como se sentia.</p>
        <ExperimentCard />
        <p>Escolha de trinta a sessenta segundos de uma cena, entrevista ou discurso que importe para você. Tenha o áudio, o texto correto e o significado.</p>
        <p>No Dia 1, escute sem apoio e anote só o que percebeu. Não complete no chute. Grave também uma tentativa de repetir. Esse será seu ponto de comparação.</p>
        <p>Depois, use o texto como mapa e tire-o para testar. Trabalhe em frases curtas. Primeiro reconheça; depois acompanhe. Shadowing cedo demais vira corrida, e o ouvido deixa de observar.</p>
        <p>No Dia 7, ouça antes de olhar o texto. Anote o que percebe e grave outra vez. Compare clareza, sentido, antecipação e reprodução.</p>
        <p>Não busque nota máxima. Busque mudança. Pode ser um som que apareceu ou um bloco que chega sem português. Pode ser uma sequência que você prevê ou uma frase que sai com menos esforço. Cada diferença mostra que aquilo pode ser treinado.</p>
        <p>Se a mudança acontecer apenas naquele arquivo, o experimento já provou que você consegue mudar. Agora vem um teste maior: alguma parte desse ganho consegue aparecer em outro áudio?</p>
        <Secret number="#13">Uma crença deixa de ser motivação quando produz uma diferença que você consegue ouvir.</Secret>
        <p>Se nada mudar, não invente desculpas para proteger a ideia. Veja se o trecho era difícil demais, se o sentido estava claro, se cada escuta tinha uma tarefa e se você voltou depois de um intervalo. Uma boa ideia também precisa mostrar onde pode falhar.</p>
      </>
    ),
  },
  {
    id: "o-proximo-nao-comeca-do-zero",
    part: "Parte IV — A prova",
    number: 13,
    title: "O próximo trecho não começa do zero",
    eyebrow: "A diferença entre decorar e transferir",
    readingTime: 5,
    content: (
      <>
        <p className={styles.lead}>Dominar um trecho não prova que você domina todos os outros.</p>
        <p>Prova algo mais importante: seu ouvido e sua fala conseguem mudar com comparação, repetição e tempo para lembrar.</p>
        <p>Ao trocar de material, parte do desafio volta. A voz muda. O assunto muda. Novas reduções aparecem. Mas algumas palavras, blocos, ritmos e funções reaparecem. Além disso, você já sabe como localizar o problema.</p>
        <p>O segundo trecho não precisa parecer fácil. Basta que algumas partes já não sejam totalmente novas. Talvez você reconheça um som mais cedo, use o texto sem se perder ou não se assuste tanto com o barulho inicial. O ganho aparece em pedaços antes de virar a sensação de “agora entendo tudo”.</p>
        <p>O primeiro trecho ensina duas coisas: o inglês que contém e a maneira de transformar ruído em padrão. O segundo encontra um ouvido com pontos de referência e uma pessoa que já não interpreta dificuldade como incapacidade.</p>
        <p>É aqui que separamos <strong>decorar</strong> de <strong>levar o ganho adiante</strong>. Repetir o arquivo antigo mostra que você aprendeu aquele arquivo. Reconhecer o mesmo bloco em outra voz, usar a estrutura numa nova ideia ou ouvir um som parecido em outra cena mostra que a capacidade viajou.</p>
        <TransferLadder />
        <p>É assim que <strong>o Inglês Puxa Mais Inglês</strong>. Você não salta do minuto para a imersão. Aumenta o material sem perder a profundidade. Trechos formam cenas. Cenas constroem um episódio. Discursos treinam falas mais longas. Novos contextos mostram se o ganho consegue viajar.</p>
        <Secret number="#14">Cada trecho dominado entrega duas coisas: o inglês que estava nele e um cérebro um pouco melhor em encontrar inglês no próximo.</Secret>
        <p>Agora podemos corrigir a última promessa sedutora: “basta mergulhar”. Mergulhar ajuda muito — depois que você consegue nadar.</p>
      </>
    ),
  },
  {
    id: "do-primeiro-episodio-a-imersao",
    part: "Parte V — A expansão",
    number: 14,
    title: "Do primeiro episódio à imersão",
    eyebrow: "A recompensa que não funciona como ponto de partida",
    readingTime: 6,
    content: (
      <>
        <p className={styles.lead}>Imersão é vendida como causa da fluência. Muitas vezes ela é também consequência.</p>
        <p>Quando quase tudo parece barulho, passar mais horas ali cansa e ensina pouco. Quando uma base essencial já está pronta, o mesmo conteúdo começa a ajudar você a crescer.</p>
        <p>É como entrar no oceano. Ter água ao redor não ensina alguém que ainda não consegue boiar. Pode apenas causar medo e cansaço. Depois que o corpo aprende o básico, cada nova distância ajuda a nadar melhor.</p>
        <p>Você entende o bastante para continuar. O contexto ajuda com palavras novas. Blocos conhecidos dão pistas sobre os desconhecidos. E a curiosidade passa a carregar uma parte do esforço.</p>
        <p>Esse é o território em que “aprender inglês consumindo o que você gosta” deixa de ser promessa vazia. Não porque o cérebro aprenda dormindo, mas porque trabalho anterior tornou a experiência compreensível.</p>
        <p>O primeiro episódio entendido sem depender constantemente da legenda é uma meta poderosa por isso. Não é certificado de fluência. É uma fronteira: do outro lado, existe um volume crescente de inglês que você consegue usar para aprender mais inglês.</p>
        <p>Essa fronteira também muda a motivação. Antes dela, estudar compete com entretenimento. Depois dela, entretenimento, trabalho e curiosidade podem carregar parte do treino. O idioma deixa de ser sempre o assunto e começa a ser o meio pelo qual você chega ao assunto.</p>
        <p>Depois, a rota se torna pessoal. Quem quer viajar adiciona situações de viagem. Quem quer trabalhar numa multinacional treina reuniões e entrevistas. Quem quer vender em dólar precisa escutar objeções, sustentar argumentos e reagir a pessoas reais.</p>
        <p>A Fluência Essencial é comum na base e individual no destino. Todos se beneficiam de sons mais nítidos, blocos disponíveis e recuperação rápida. A vida de cada pessoa decide quais territórios merecem profundidade em seguida.</p>
        <Note title="O teste de qualquer método"><p>Ele apenas apresenta mais conteúdo ou impede o seu inglês de sumir na hora H? Há profundidade, recuperação, variação e transferência? Você consegue apontar algo que agora percebe ou faz e antes não conseguia?</p></Note>
        <Secret number="#15">Imersão não é ficar cercado de inglês. É chegar ao ponto em que o inglês ao redor consegue continuar ensinando você.</Secret>
        <p>Essa é a verdadeira promessa da expansão: não terminar o idioma, mas construir uma capacidade que deixa de depender de alguém escolher cada próximo passo por você.</p>
      </>
    ),
  },
  {
    id: "o-ingles-que-fica",
    part: "Epílogo",
    title: "O inglês que fica",
    eyebrow: "A estrada continua",
    readingTime: 4,
    content: (
      <>
        <p className={styles.lead}>Naquelas viagens, eu achava que o pendrive quase vazio era um problema.</p>
        <p>Hoje sei que ele retirou de mim a possibilidade de abandonar o treino no momento exato em que a novidade terminava e a adaptação começava.</p>
        <p>Os arquivos não ficaram mais lentos. Meu ouvido aprendeu a separar o som. Os discursos não tinham o idioma inteiro. Tinham sons, palavras e blocos que voltavam em outros lugares. Eu não descobri um talento escondido. Troquei, por acidente, variedade por profundidade.</p>
        <p>Talvez você tenha começado este livro acreditando que ainda faltava muito inglês. A pergunta mais precisa agora é: quanto do inglês que você já encontrou teve oportunidade de ficar disponível?</p>
        <p>Talvez também tenha acreditado que traduzir mentalmente era uma característica pessoal, como se algumas pessoas nascessem com uma cabeça em inglês e outras não. Agora existe outro diagnóstico: caminhos diretos podem começar pequenos, ser observados e ganhar território.</p>
        <p>Essa pergunta muda a forma de escolher uma aula, medir uma semana e interpretar uma trava. Ela impede que quantidade se apresente como transformação. E devolve algo que anos de frustração costumam retirar: um problema treinável.</p>
        <Secret number="#16">Fluência começa quando o inglês deixa de ser apenas algo que você conhece e passa a ser algo que acontece a tempo.</Secret>
        <p>Quando o inglês parecer rápido demais, não conclua imediatamente que falta capacidade. Procure o trecho que ainda chega como massa. Dê significado a ele. Separe. Antecipe. Recupere depois do intervalo. Teste em outro lugar.</p>
        <p>Depois avance — não porque terminou o inglês, mas porque uma parte dele finalmente ficou.</p>
      </>
    ),
  },
  {
    id: "notas-e-fontes",
    part: "Notas",
    title: "Notas e fontes",
    eyebrow: "A evidência por trás dos principais mecanismos",
    readingTime: 3,
    content: (
      <>
        <p className={styles.lead}>Este livro separa experiência pessoal, modelo editorial e evidência científica.</p>
        <p><strong>Automaticidade.</strong> Segalowitz e Segalowitz (1993) analisaram velocidade e estabilidade no reconhecimento de palavras em L2, distinguindo simples aceleração de uma mudança qualitativa em direção à automatização. DOI: 10.1017/S0142716400010845.</p>
        <p><strong>Sequências formulaicas.</strong> Conklin e Schmitt (2008) encontraram processamento mais rápido para sequências formulaicas do que para sequências não formulaicas comparáveis em falantes nativos e não nativos. DOI: 10.1093/applin/amm022.</p>
        <p><strong>Cobertura lexical.</strong> Nation sintetiza pesquisas segundo as quais cerca de 2.000 famílias de palavras podem fornecer mais de 95% de cobertura em fala coloquial. Webb e Rodgers (2009) mostram que programas de televisão exigem milhares de famílias para coberturas altas. Cobertura lexical não equivale a compreensão total nem produção fluente. DOI: 10.1111/j.1467-9922.2009.00509.x.</p>
        <p><strong>Prática distribuída.</strong> Cepeda e colegas (2006) realizaram uma síntese quantitativa ampla do efeito de espaçamento em tarefas de recordação verbal. DOI: 10.1037/0033-2909.132.3.354.</p>
        <p><strong>Escuta apoiada.</strong> Chang, Millett e Renandya (2019) compararam modalidades de prática de escuta ao longo de três períodos de treze semanas. Hartshorn e Stephens (2023) estudaram uso de transcrição em exercícios repetidos de escuta com alunos avançados de ESL. DOI: 10.1177/0033688217751468; 10.58304/ijts.20230404.</p>
        <Note title="Limites importantes"><p>Esses estudos sustentam componentes do modelo; não provam que exista uma única rota universal para toda pessoa, material ou objetivo. O Experimento Fluency Secrets foi desenhado justamente para transformar uma afirmação geral em observação pessoal verificável.</p></Note>
      </>
    ),
  },
];
