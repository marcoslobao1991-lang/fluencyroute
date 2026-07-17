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

function TranslationLoop() {
  return (
    <figure className={styles.diagram} aria-labelledby="translation-loop-title">
      <figcaption>
        <span>DIAGRAMA 01</span>
        <strong id="translation-loop-title">A conversa que acontece duas vezes</strong>
      </figcaption>
      <div className={styles.loopGrid}>
        <div className={styles.loopNode}><small>01</small>Você escuta em inglês</div>
        <span className={styles.arrow}>→</span>
        <div className={styles.loopNode}><small>02</small>Traduz para português</div>
        <span className={styles.arrow}>→</span>
        <div className={styles.loopNode}><small>03</small>Procura uma resposta</div>
        <span className={styles.arrow}>→</span>
        <div className={styles.loopNode}><small>04</small>Traduz de volta</div>
        <span className={styles.arrow}>→</span>
        <div className={`${styles.loopNode} ${styles.loopNodeAccent}`}><small>05</small>Tenta falar</div>
      </div>
      <p className={styles.diagramCaption}>A conversa real continua avançando enquanto a tradução ainda está processando a frase anterior.</p>
    </figure>
  );
}

function TwoPaths() {
  return (
    <figure className={styles.diagram} aria-labelledby="two-paths-title">
      <figcaption>
        <span>DIAGRAMA 02</span>
        <strong id="two-paths-title">Dois caminhos para o significado</strong>
      </figcaption>
      <div className={styles.paths}>
        <div className={styles.pathRow}>
          <span className={styles.pathLabel}>Dependência da tradução</span>
          <div>Som</div><i>→</i><div>Português</div><i>→</i><div>Significado</div>
        </div>
        <div className={`${styles.pathRow} ${styles.pathRowDirect}`}>
          <span className={styles.pathLabel}>Processamento direto</span>
          <div>Som</div><i>→</i><div>Significado</div>
        </div>
      </div>
      <p className={styles.diagramCaption}>O objetivo não é banir o português. É deixar de precisar dele como ponte para compreender cada frase.</p>
    </figure>
  );
}

function ContentTreadmill() {
  return (
    <figure className={styles.diagram} aria-labelledby="treadmill-title">
      <figcaption>
        <span>DIAGRAMA 03</span>
        <strong id="treadmill-title">A esteira do conteúdo</strong>
      </figcaption>
      <div className={styles.treadmill}>
        <div><b>1</b>Conteúdo novo</div>
        <span>→</span>
        <div><b>2</b>Entendimento superficial</div>
        <span>→</span>
        <div><b>3</b>Sensação de progresso</div>
        <span>→</span>
        <div><b>4</b>Pouca automatização</div>
        <span>↺</span>
      </div>
      <p className={styles.diagramCaption}>Movimento não é necessariamente deslocamento. Você pode consumir inglês todos os dias e continuar no mesmo lugar.</p>
    </figure>
  );
}

function SkillConversion() {
  return (
    <figure className={styles.diagram} aria-labelledby="skill-conversion-title">
      <figcaption><span>DIAGRAMA 04</span><strong id="skill-conversion-title">Como conhecimento vira habilidade</strong></figcaption>
      <div className={styles.skillFlow}>
        <div><small>EXPOSIÇÃO</small><b>Eu encontro</b><p>O som e o significado aparecem juntos.</p></div>
        <span>→</span>
        <div><small>REPETIÇÃO</small><b>Eu reconheço</b><p>O padrão deixa de parecer completamente novo.</p></div>
        <span>→</span>
        <div><small>RECUPERAÇÃO</small><b>Eu antecipo</b><p>O cérebro prevê o bloco antes de analisar cada palavra.</p></div>
        <span>→</span>
        <div className={styles.skillFinish}><small>AUTOMATIZAÇÃO</small><b>Eu uso</b><p>O significado e a resposta ficam disponíveis.</p></div>
      </div>
    </figure>
  );
}

function PerceptionLayers() {
  return (
    <figure className={styles.diagram} aria-labelledby="perception-title">
      <figcaption><span>DIAGRAMA 05</span><strong id="perception-title">O som não muda. Sua percepção muda.</strong></figcaption>
      <div className={styles.perception}>
        <div><span>1ª ESCUTA</span><p className={styles.soundMess}>whaddayawannado</p><small>Uma massa de som</small></div>
        <div><span>APÓS CONTEXTO</span><p>what do you want to do?</p><small>Palavras separadas</small></div>
        <div><span>APÓS TREINO</span><p><b>what do you wanna do?</b></p><small>Um bloco reconhecível</small></div>
      </div>
    </figure>
  );
}

function EssentialPyramid() {
  return (
    <figure className={styles.diagram} aria-labelledby="essential-title">
      <figcaption><span>DIAGRAMA 06</span><strong id="essential-title">A pirâmide da Fluência Essencial</strong></figcaption>
      <div className={styles.pyramid}>
        <div><b>EXPANSÃO</b><small>Temas, sotaques e contextos específicos</small></div>
        <div><b>DISCURSOS E CONVERSAS</b><small>Ideias completas em velocidade real</small></div>
        <div><b>BLOCOS RECORRENTES</b><small>Combinações que voltam o tempo inteiro</small></div>
        <div><b>PALAVRAS E SONS ESSENCIAIS</b><small>A base de alta frequência profundamente disponível</small></div>
      </div>
    </figure>
  );
}

function RepetitionSystem() {
  return (
    <figure className={styles.diagram} aria-labelledby="repetition-title">
      <figcaption><span>DIAGRAMA 07</span><strong id="repetition-title">As duas direções da repetição</strong></figcaption>
      <div className={styles.repeatGrid}>
        <div>
          <span className={styles.repeatIcon}>↻</span>
          <small>REPETIÇÃO CONTINUADA</small>
          <b>Profundidade agora</b>
          <p>O mesmo trecho retorna várias vezes na sessão até sons e blocos ganharem nitidez.</p>
        </div>
        <div>
          <span className={styles.repeatIcon}>◷</span>
          <small>REPETIÇÃO ESPAÇADA</small>
          <b>Disponibilidade depois</b>
          <p>O trecho retorna em dias diferentes para que o reconhecimento sobreviva ao tempo.</p>
        </div>
      </div>
    </figure>
  );
}

function ConcentratedVsRandom() {
  return (
    <figure className={styles.diagram} aria-labelledby="concentrated-title">
      <figcaption><span>DIAGRAMA 08</span><strong id="concentrated-title">Amplitude ou profundidade?</strong></figcaption>
      <div className={styles.depthCompare}>
        <div>
          <small>CONSUMO ALEATÓRIO</small>
          <span className={styles.shallow}>━━━━━━━━━━━━━━━━━━━━</span>
          <b>20 minutos diferentes</b>
          <p>Muito território visitado. Pouco material dominado.</p>
        </div>
        <div>
          <small>TREINO CONCENTRADO</small>
          <span className={styles.deep}>┃<br/>┃<br/>┃<br/>┃</span>
          <b>1 minuto aprofundado</b>
          <p>Pouco território. Percepção, antecipação e reprodução.</p>
        </div>
      </div>
    </figure>
  );
}

function RouteMap() {
  return (
    <figure className={styles.diagram} aria-labelledby="route-title">
      <figcaption><span>DIAGRAMA 09</span><strong id="route-title">A rota de expansão</strong></figcaption>
      <div className={styles.routeMap}>
        <div><span>01</span><b>Trecho</b><small>30–60 segundos</small></div><i>→</i>
        <div><span>02</span><b>Episódio</b><small>conversa completa</small></div><i>→</i>
        <div><span>03</span><b>Discurso</b><small>ideias sustentadas</small></div><i>→</i>
        <div><span>04</span><b>Imersão</b><small>novos contextos</small></div>
      </div>
    </figure>
  );
}

function ExperimentCard() {
  const days = [
    ["DIA 1", "Medir", "Escute sem texto e anote o que realmente percebe."],
    ["DIA 2", "Mapear", "Compare áudio, transcrição e significado."],
    ["DIA 3", "Separar", "Marque blocos e emendas de som."],
    ["DIA 4", "Concentrar", "Repita em ciclos curtos, sem avançar."],
    ["DIA 5", "Reproduzir", "Faça shadowing em velocidade confortável."],
    ["DIA 6", "Retirar apoios", "Volte ao áudio sem texto ou tradução."],
    ["DIA 7", "Provar", "Faça o teste final e compare com o Dia 1."],
  ];
  return (
    <figure className={`${styles.diagram} ${styles.experiment}`} aria-labelledby="experiment-title">
      <figcaption><span>PROTOCOLO PRÁTICO</span><strong id="experiment-title">O Experimento Fluency Secrets</strong></figcaption>
      <div className={styles.experimentDays}>
        {days.map(([day, verb, description]) => (
          <div key={day}><span>{day}</span><b>{verb}</b><p>{description}</p></div>
        ))}
      </div>
    </figure>
  );
}

export const chapters: Chapter[] = [
  {
    id: "o-pendrive",
    part: "Prólogo",
    title: "O pendrive",
    eyebrow: "Onde tudo começou",
    readingTime: 8,
    content: (
      <>
        <p className={styles.lead}>Durante um período da minha vida, meu escritório tinha quatro rodas.</p>

        <p>Eu trabalhava como vendedor e passava boa parte dos meus dias dirigindo de uma cidade para outra. Eram horas de estrada, visitas, metas e a sensação constante de que eu precisava chegar a algum lugar — mesmo quando ainda não sabia exatamente qual seria o caminho.</p>

        <p>Naquela época, o som do carro não tinha uma biblioteca infinita à disposição. Nada de abrir um aplicativo e escolher entre milhões de episódios, músicas ou aulas. O que eu tinha era um pendrive.</p>

        <p>E aquele pendrive não tinha muita coisa.</p>

        <p>Entre os poucos arquivos, havia conteúdos de vendas em inglês. Alguns eram de Jordan Belfort. Outros, de Grant Cardone. Eu tinha colocado aqueles áudios ali porque carregava uma vontade que ainda parecia maior do que a minha realidade: um dia, eu queria trabalhar vendendo em dólar.</p>

        <p>Eu sabia que, para isso, não bastaria pedir um café ou perguntar onde ficava o aeroporto. Eu precisaria sustentar uma ideia, contornar objeções, perceber mudanças de tom e convencer alguém que não tinha obrigação nenhuma de continuar na ligação.</p>

        <p>O inglês precisaria funcionar na mesma velocidade da conversa.</p>

        <p>Como havia pouca coisa no pendrive, eu escutava os mesmos áudios. Quando um terminava, começava de novo. Depois mais uma vez. Em alguns dias, os mesmos discursos me acompanhavam durante horas de estrada.</p>

        <p>Não existia plano. Eu não havia montado um método e nem sabia que estava treinando alguma coisa. Era apenas o conteúdo que eu tinha disponível.</p>

        <p>Até que comecei a perceber algo estranho.</p>

        <p>Os áudios não pareciam mais tão rápidos.</p>

        <p>Trechos que antes soavam como uma massa de sons começaram a se separar. Primeiro aparecia uma palavra. Depois uma expressão inteira. Em seguida, eu já sabia o que viria antes de a pessoa terminar de falar.</p>

        <p>O arquivo continuava exatamente igual. A velocidade não havia mudado. Jordan Belfort não tinha decidido falar mais devagar só porque eu estava dirigindo.</p>

        <p>Alguma coisa havia mudado em mim.</p>

        <p>Foi quando me ocorreu uma pergunta: se repetir aqueles áudios estava mudando a forma como eu escutava, o que aconteceria se eu usasse a mesma repetição para mudar a forma como eu falava?</p>

        <p>Comecei a acompanhar os discursos em voz alta. Ouvia uma frase e tentava reproduzir não apenas as palavras, mas o ritmo, as pausas, as emendas e a intenção. Depois repetia junto com a pessoa. De novo. E de novo.</p>

        <p>Sem saber, eu estava fazendo o que hoje muita gente chama de <em>shadowing</em>. Só que, para mim, não era o nome de uma técnica. Era a tentativa prática de fazer minha boca acompanhar algo que meu ouvido começava a reconhecer.</p>

        <p>Alguns trechos se repetiram tantas vezes que eu os decorei por completo. E então aconteceu o que eu não esperava: minha melhora não ficou presa àqueles discursos.</p>

        <p>As palavras, os sons e os blocos que apareciam ali também estavam em outras conversas. Quanto mais automáticos eles se tornavam, mais eu os reconhecia fora dos áudios do pendrive. Minha pronúncia começou a mudar. Minha percepção começou a mudar. O inglês, aos poucos, deixou de ser uma sequência que eu precisava desmontar para se tornar algo que eu conseguia acompanhar.</p>

        <Secret number="#01">Eu não melhorei porque estava aprendendo coisas novas. Melhorei porque parei de abandonar as mesmas coisas antes que elas se tornassem automáticas.</Secret>

        <p>Na época, eu queria ter mais arquivos naquele pendrive. Não sabia que ter poucos seria justamente o que me ensinaria uma das coisas mais importantes sobre fluência.</p>

        <p>A internet nos dá acesso a uma quantidade de conteúdo que eu não conseguiria imaginar naquelas estradas. Mas acesso não é domínio. Variedade não é automatização. E reconhecer uma explicação não significa conseguir usar uma habilidade.</p>

        <p>O que aconteceu dentro daquele carro foi um acidente. O restante deste livro é a tentativa de mostrar por que aquele acidente funcionou — e o que ele revela sobre a razão pela qual tantas pessoas estudam inglês durante anos, mas ainda precisam pensar duas vezes antes de responder.</p>

        <p>Literalmente duas vezes.</p>
      </>
    ),
  },
  {
    id: "a-conversa-que-acontece-duas-vezes",
    part: "Parte I — A trava invisível",
    number: 1,
    eyebrow: "O atraso que ninguém vê",
    title: "A conversa que acontece duas vezes",
    readingTime: 10,
    content: (
      <>
        <p className={styles.lead}>Quando alguém fala com você em inglês, talvez uma segunda conversa comece dentro da sua cabeça.</p>

        <p>A pessoa diz alguma coisa. Você segura os sons por alguns instantes, procura palavras conhecidas e tenta montar uma versão em português. Quando finalmente entende, pensa no que gostaria de responder. Só então começa o caminho de volta: procura palavras em inglês, reorganiza a frase e tenta pronunciá-la.</p>

        <p>Enquanto tudo isso acontece, a conversa real continua.</p>

        <TranslationLoop />

        <p>É por isso que você pode conhecer todas as palavras de uma frase e, ainda assim, não conseguir acompanhá-la no momento em que ela é dita. O problema não está necessariamente no vocabulário. Está no caminho que a informação precisa percorrer.</p>

        <p>Imagine um intérprete trabalhando entre duas pessoas. Antes de uma resposta chegar ao outro lado, a mensagem precisa passar por uma ponte. Quando essa ponte é necessária para cada frase, existe um atraso inevitável.</p>

        <p>A tradução mental funciona de forma parecida. Ela pode ser útil durante o aprendizado. O problema começa quando continua sendo a única ponte disponível.</p>

        <TwoPaths />

        <p>Fluentes também traduzem. Um tradutor profissional pode fazer isso com uma precisão que a maioria das pessoas nunca alcançará. A diferença é que ele não precisa traduzir cada frase para compreender o idioma. A tradução é uma escolha consciente, não uma condição para o significado aparecer.</p>

        <p>Por isso, o objetivo deste livro não é convencer você a expulsar o português da cabeça. Além de impossível, isso seria desnecessário. O objetivo é mostrar como o inglês pode deixar de depender do português para funcionar.</p>

        <Secret number="#02">Você não precisa traduzir mais rápido. Precisa treinar o inglês até não depender da tradução.</Secret>

        <Note title="Observe hoje">
          <p>Na próxima vez que escutar uma frase em inglês, não avalie apenas se entendeu. Observe o caminho: o significado apareceu diretamente ou você precisou produzir uma legenda interna em português?</p>
        </Note>

        <p>Essa diferença parece pequena, mas separa dois tipos de conhecimento. Um deles permite acertar uma questão. O outro permite participar de uma conversa.</p>
      </>
    ),
  },
  {
    id: "por-que-voce-entende-depois",
    part: "Parte I — A trava invisível",
    number: 2,
    eyebrow: "Reconhecer não é acompanhar",
    title: "Por que você entende depois, mas não durante",
    readingTime: 9,
    content: (
      <>
        <p className={styles.lead}>Existe uma experiência frustrante que quase todo estudante de inglês conhece: a frase termina, alguém explica o que foi dito e você pensa “mas eu sabia todas essas palavras”.</p>

        <p>Você sabia. O problema é que saber uma coisa e conseguir acessá-la em tempo real são habilidades diferentes.</p>

        <p>Se eu entregar a você um manual detalhado sobre como pousar um avião, talvez seja possível compreender cada etapa. Você pode memorizar a ordem dos procedimentos e responder corretamente a uma prova. Mas ninguém confundiria esse conhecimento com a capacidade de pousar um avião em uma tempestade.</p>

        <p>A diferença não é falta de inteligência. É falta de automatização sob as condições reais em que a habilidade precisa ser usada.</p>

        <p>O mesmo acontece ao dirigir. No início, cada ação ocupa espaço mental: embreagem, marcha, espelho, seta, distância. Depois de prática suficiente, várias dessas decisões deixam de exigir uma narração interna. Você não repete para si mesmo cada instrução antes de executá-la.</p>

        <p>No inglês, muita gente permanece no equivalente linguístico das primeiras aulas de direção. Conhece as instruções, mas ainda precisa conduzir cada palavra conscientemente.</p>

        <div className={styles.comparison}>
          <div>
            <span>CONHECIMENTO DECLARADO</span>
            <strong>“Eu sei explicar”</strong>
            <p>Reconhecer regras, lembrar traduções, responder exercícios e compreender depois de analisar.</p>
          </div>
          <div>
            <span>HABILIDADE DISPONÍVEL</span>
            <strong>“Eu consigo fazer”</strong>
            <p>Perceber sons, recuperar blocos e responder dentro da velocidade natural da situação.</p>
          </div>
        </div>

        <p>Isso explica por que estudar mais uma regra nem sempre melhora uma conversa. A nova informação pode aumentar o que você consegue explicar sem aumentar aquilo que consegue executar.</p>

        <p>Também explica por que algumas pessoas conseguem preencher exercícios avançados, mas travam diante de uma pergunta simples. No papel, há tempo para analisar. Na conversa, o relógio começa a correr no primeiro som.</p>

        <Secret number="#03">A fluência não é medida apenas pelo que você sabe. Ela aparece naquilo que consegue acessar antes que o momento passe.</Secret>

        <p>Quando você entende isso, a pergunta muda. Em vez de “que conteúdo ainda está faltando?”, começamos a perguntar: “o que eu já conheço, mas ainda não treinei até ficar disponível?”</p>
      </>
    ),
  },
  {
    id: "o-ingles-que-voce-sabe",
    part: "Parte I — A trava invisível",
    number: 3,
    eyebrow: "A distância entre conhecer e usar",
    title: "O inglês que você sabe e o inglês que consegue usar",
    readingTime: 8,
    content: (
      <>
        <p className={styles.lead}>Dentro de você, podem existir dois vocabulários muito diferentes.</p>

        <p>O primeiro é formado pelas palavras que você reconhece quando encontra tempo para olhar, reler ou pensar. O segundo contém aquilo que seu cérebro consegue recuperar rápido o suficiente para compreender e responder.</p>

        <p>O primeiro costuma ser maior. O segundo é o que determina sua experiência real com o idioma.</p>

        <p>É possível conhecer uma palavra por anos e ainda precisar traduzi-la sempre que ela aparece. Também é possível dominar profundamente uma palavra simples a ponto de reconhecer suas variações, reduções, emendas e usos sem qualquer esforço perceptível.</p>

        <p>Esses dois conhecimentos ocupam lugares diferentes na prática. Uma palavra que você “já viu” não é necessariamente uma palavra disponível.</p>

        <div className={styles.availabilityMeter} aria-label="Escala de disponibilidade de uma palavra">
          <div><span>1</span><p><b>Já vi</b> Parece familiar.</p></div>
          <div><span>2</span><p><b>Reconheço</b> Entendo com contexto.</p></div>
          <div><span>3</span><p><b>Recupero</b> Lembro sem consultar.</p></div>
          <div><span>4</span><p><b>Percebo</b> Reconheço na fala real.</p></div>
          <div><span>5</span><p><b>Uso</b> Surge no momento certo.</p></div>
        </div>

        <p>O ensino tradicional frequentemente comemora a passagem do primeiro para o segundo estágio. Uma lista foi apresentada, uma tradução foi compreendida e o conteúdo da semana foi “dado”. Mas a conversa exige os estágios quatro e cinco.</p>

        <p>É aqui que nasce uma conclusão desconfortável: talvez você não precise aumentar imediatamente o número de palavras que conhece. Talvez precise diminuir a distância entre as palavras que reconhece e as palavras que consegue usar.</p>

        <Secret number="#04">Seu inglês funcional não é o tamanho do seu vocabulário reconhecido. É a parte dele que permanece disponível em velocidade real.</Secret>

        <Note title="Uma pergunta melhor">
          <p>Em vez de perguntar “quantas palavras eu conheço?”, pergunte: “quantas delas eu reconheceria na boca de um americano e conseguiria usar sem montar a frase em português?”</p>
        </Note>

        <p>Essa mudança parece reduzir o seu inglês. Na prática, ela finalmente revela onde o progresso precisa acontecer.</p>
      </>
    ),
  },
  {
    id: "a-esteira-do-conteudo",
    part: "Parte I — A trava invisível",
    number: 4,
    eyebrow: "Quando variedade parece evolução",
    title: "A esteira infinita do conteúdo",
    readingTime: 9,
    content: (
      <>
        <p className={styles.lead}>Nunca tivemos acesso a tanto inglês. E nunca foi tão fácil abandonar uma coisa antes de dominá-la.</p>

        <p>Você começa um vídeo, entende a explicação e sente que aprendeu. No dia seguinte, encontra outra expressão, outra aula, outro professor e outra técnica. Cada contato produz uma pequena sensação de avanço.</p>

        <p>Mas existe uma diferença entre avançar e apenas mudar de assunto.</p>

        <ContentTreadmill />

        <p>Foi exatamente o contrário que aconteceu no meu carro. Eu não tinha um algoritmo oferecendo o próximo conteúdo. Não havia variedade suficiente para escapar da repetição. Por isso, os mesmos sons permaneceram tempo bastante para mudar a minha percepção.</p>

        <p>Na época, enxerguei o pendrive pequeno como uma limitação. Hoje, percebo que ele criou uma condição rara: profundidade involuntária.</p>

        <p>Isso não significa que você deva escutar um único áudio pelo resto da vida. Significa que a variedade precisa chegar depois de algum domínio, não no lugar dele.</p>

        <p>Um músico não melhora um solo tocando os primeiros segundos de cem músicas diferentes. Um atleta não automatiza um movimento trocando de exercício toda vez que começa a sentir dificuldade. Habilidades exigem permanência.</p>

        <Secret number="#05">Conteúdo novo produz novidade. Repetição bem dirigida produz disponibilidade.</Secret>

        <p>A pergunta decisiva não é quanto inglês passou pelos seus olhos e ouvidos. É quanto desse inglês permaneceu tempo suficiente para mudar aquilo que você consegue perceber e fazer.</p>

        <p>Nos próximos capítulos, vamos abandonar a lógica da matéria acumulada e observar o inglês pelo que ele realmente precisa se tornar: uma habilidade.</p>
      </>
    ),
  },
  {
    id: "ingles-nao-e-materia",
    part: "Parte II — O segredo da fluência automática",
    number: 5,
    eyebrow: "O diagnóstico estava errado",
    title: "Inglês não é matéria",
    readingTime: 9,
    content: (
      <>
        <p className={styles.lead}>Durante anos, ensinaram inglês no mesmo formato usado para ensinar história, geografia ou uma fórmula de matemática.</p>
        <p>Um assunto é apresentado. O aluno entende a explicação. Depois faz exercícios para provar que se lembra dela. Na semana seguinte, a turma avança para outro assunto.</p>
        <p>Esse modelo funciona quando o objetivo principal é declarar conhecimento. Mas uma conversa não pede que você explique a regra. Ela exige que você perceba e aja enquanto o tempo continua correndo.</p>
        <p>É por isso que inglês se parece menos com uma matéria e mais com dirigir, tocar um instrumento ou jogar um esporte. Existe conhecimento envolvido, mas a execução depende de padrões que foram praticados até ficarem disponíveis sob pressão.</p>
        <p>Você pode ler dez livros sobre equilíbrio e ainda cair na primeira tentativa de andar de bicicleta. Depois de aprender, porém, não precisa recitar as leis da física antes de cada curva. O corpo executa aquilo que a prática organizou.</p>
        <SkillConversion />
        <p>Quando tratamos inglês apenas como matéria, o sucesso passa a ser medido pelo conteúdo percorrido. Quando tratamos como habilidade, o critério muda: o que ficou mais rápido, mais nítido e mais disponível?</p>
        <Secret number="#06">Conteúdo pode ser explicado em uma aula. Habilidade precisa ser construída em uma sequência de experiências.</Secret>
        <Note title="Troque a unidade de progresso"><p>Não meça sua evolução apenas por aulas assistidas ou capítulos concluídos. Meça o que hoje você entende e reproduz sem precisar desmontar.</p></Note>
        <p>Essa troca de categoria é o começo da rota. A partir dela, repetição deixa de parecer atraso e passa a ser parte do trabalho.</p>
      </>
    ),
  },
  {
    id: "conhecimento-nao-e-habilidade",
    part: "Parte II — O segredo da fluência automática",
    number: 6,
    eyebrow: "Entender a explicação não basta",
    title: "Conhecimento não é habilidade",
    readingTime: 8,
    content: (
      <>
        <p className={styles.lead}>A sensação de entender uma aula é sedutora porque se parece muito com a sensação de aprender.</p>
        <p>Você ouve uma explicação, reconhece a lógica e pensa: “agora eu sei”. Naquele momento, provavelmente sabe mesmo. Mas o cérebro ainda não demonstrou que consegue recuperar aquilo em outra voz, em outra velocidade e no meio de uma conversa.</p>
        <p>É como observar alguém tocar um acorde. Quando a posição dos dedos é mostrada, tudo parece óbvio. Só ao pegar o instrumento você descobre a distância entre compreender o movimento e conseguir executá-lo.</p>
        <p>No idioma, essa distância fica escondida porque o exercício costuma manter todas as pistas à vista. A lista de palavras está na mesma página. A regra acabou de ser apresentada. O contexto foi preparado para a resposta.</p>
        <p>A vida real remove essas pistas. O som chega uma vez, misturado a sotaque, redução, intenção e ruído. A resposta precisa nascer sem uma lista de opções.</p>
        <Secret number="#07">A prova de uma habilidade não é reconhecer a resposta quando ela aparece. É conseguir produzi-la quando as pistas desaparecem.</Secret>
        <p>Isso não torna teoria inútil. Uma boa explicação economiza tentativa e erro. Mas ela é mapa, não viagem. O erro começa quando colecionamos mapas e chamamos isso de movimento.</p>
        <p>O próximo passo é observar onde a habilidade começa: não na boca, mas na forma como o ouvido organiza o que recebe.</p>
      </>
    ),
  },
  {
    id: "o-ouvido-destreinado",
    part: "Parte II — O segredo da fluência automática",
    number: 7,
    eyebrow: "O inglês não está rápido demais",
    title: "Seu ouvido não está ruim",
    readingTime: 10,
    content: (
      <>
        <p className={styles.lead}>Quando o inglês parece embolado, é natural concluir que o falante está pronunciando mal ou rápido demais.</p>
        <p>Mas pessoas fluentes escutam a mesma gravação e percebem palavras, intenções e até pequenas mudanças de humor. O som que chegou aos ouvidos foi idêntico. A diferença estava no repertório de padrões usado para interpretá-lo.</p>
        <p>Um músico experiente percebe quando uma nota está ligeiramente fora do lugar. Para alguém sem treino, a mesma diferença pode ser invisível. Não porque um ouvido nasceu superior, mas porque aprendeu o que observar.</p>
        <p>No inglês falado, palavras se conectam, sons desaparecem e formas inteiras são reduzidas. Você talvez tenha estudado <em>what do you want to do?</em>, mas encontre algo parecido com <em>whaddaya wanna do?</em>. Se o ouvido espera a versão escrita pronunciada palavra por palavra, o bloco real parece outro idioma.</p>
        <PerceptionLayers />
        <p>Treinar o ouvido não significa apenas aumentar o volume de exposição. Significa dar ao cérebro oportunidades repetidas de comparar o que imaginava ouvir com o que realmente foi dito.</p>
        <Secret number="#08">O falante não precisa ficar mais lento. Seu ouvido precisa ficar mais preciso.</Secret>
        <Note title="Teste de realidade"><p>Escolha uma frase que parece rápida, leia a transcrição e escute novamente. Quando ela “aparecer”, lembre-se: o áudio não mudou entre uma tentativa e outra.</p></Note>
        <p>A percepção abre a porta. Mas, para conversar, precisamos entender também a unidade real em que o idioma costuma viajar.</p>
      </>
    ),
  },
  {
    id: "voce-nao-fala-usando-palavras",
    part: "Parte II — O segredo da fluência automática",
    number: 8,
    eyebrow: "A unidade escondida da conversa",
    title: "Você não fala usando palavras",
    readingTime: 9,
    content: (
      <>
        <p className={styles.lead}>Tecnicamente, uma frase contém palavras. Mentalmente, uma conversa raramente é construída uma palavra por vez.</p>
        <p>Quando você diz “deixa eu ver”, “eu acho que” ou “o problema é que”, não procura cada elemento isolado. Esses grupos já estão disponíveis como unidades. Eles carregam ritmo, intenção e uma função inteira.</p>
        <p>Em inglês acontece o mesmo: <em>I mean</em>, <em>you know</em>, <em>the thing is</em>, <em>what I’m trying to say is</em>. São blocos que voltam em situações diferentes e economizam processamento.</p>
        <p>Quem tenta conversar escolhendo palavra por palavra precisa tomar dezenas de microdecisões. Quem reconhece e recupera blocos começa a pensar em ideias maiores.</p>
        <div className={styles.blockDemo}>
          <span>PALAVRA POR PALAVRA</span>
          <p><i>I</i><i>don’t</i><i>know</i><i>if</i><i>that</i><i>makes</i><i>sense</i></p>
          <span>BLOCOS DISPONÍVEIS</span>
          <p><b>I don’t know if</b><b>that makes sense</b></p>
        </div>
        <p>Foi isso que aconteceu com os discursos do pendrive. Eu achava que estava decorando falas específicas. Ao repeti-las, estava tornando disponíveis combinações que depois reapareciam em outros lugares.</p>
        <Secret number="#09">Palavras dão precisão ao vocabulário. Blocos dão velocidade à conversa.</Secret>
        <p>Essa é uma das razões pelas quais dominar profundamente material pequeno pode se transferir para situações maiores: o idioma reutiliza suas peças mais importantes.</p>
      </>
    ),
  },
  {
    id: "quando-o-portugues-sai-do-caminho",
    part: "Parte II — O segredo da fluência automática",
    number: 9,
    eyebrow: "O que realmente significa pensar em inglês",
    title: "Quando o português sai do caminho",
    readingTime: 8,
    content: (
      <>
        <p className={styles.lead}>Pensar em inglês não significa acordar um dia com outra voz narrando sua vida.</p>
        <p>Significa que certos sons e blocos passam a ativar significado sem exigir uma versão intermediária em português. Você não traduz <em>thank you</em> cada vez que escuta. O bloco já chega com função, emoção e contexto.</p>
        <p>O mesmo pode acontecer com estruturas maiores. Depois de exposição útil e recuperação suficiente, elas deixam de ser códigos que precisam ser decifrados.</p>
        <p>O português não desaparece. Ele simplesmente deixa de trabalhar como funcionário obrigatório em toda interação. Você continua capaz de comparar, explicar e traduzir quando quiser — mas já não precisa fazer isso para acompanhar.</p>
        <p>Essa mudança não acontece de uma vez no idioma inteiro. Ela se expande por ilhas. Primeiro uma expressão. Depois um trecho. Em seguida, uma conversa familiar. A fluência cresce quando essas ilhas começam a se conectar.</p>
        <Secret number="#10">Pensar em inglês não é impedir pensamentos em português. É construir caminhos em que o significado não precisa passar por ele.</Secret>
        <p>Agora surge uma pergunta prática: se não podemos automatizar o idioma inteiro de uma vez, onde concentrar energia primeiro?</p>
      </>
    ),
  },
  {
    id: "a-fluencia-essencial",
    part: "Parte III — A mudança de rota",
    number: 10,
    eyebrow: "Dominar o que mais retorna",
    title: "A Fluência Essencial",
    readingTime: 10,
    content: (
      <>
        <p className={styles.lead}>O inglês é grande demais para ser dominado como uma lista. Felizmente, ele não é usado de maneira uniforme.</p>
        <p>Algumas palavras, estruturas e blocos aparecem repetidamente em conversas, entrevistas, séries e discursos. Outros pertencem a situações raras ou áreas específicas. Tratar todos como igualmente urgentes é desperdiçar energia.</p>
        <p>A Fluência Essencial começa pelo centro de gravidade do idioma: aquilo que volta tanto que melhorar sua percepção e disponibilidade produz efeito em muitos contextos ao mesmo tempo.</p>
        <EssentialPyramid />
        <p>Isso não significa limitar seu inglês para sempre. Significa construir uma base capaz de sustentar expansão. Um vocabulário enorme e pouco disponível pode impressionar em uma lista; um repertório essencial profundamente automatizado sustenta conversas reais.</p>
        <p>Nos discursos de vendas, eu encontrava palavras comuns ligadas a blocos de argumentação: apresentar uma ideia, criar contraste, responder objeções, pedir atenção. Ao dominá-las ali, comecei a encontrá-las em todo lugar.</p>
        <Secret number="#11">Você não precisa começar pelo idioma inteiro. Precisa começar pela parte que continuará aparecendo enquanto você expande.</Secret>
        <Note title="Essencial não significa básico"><p>Uma palavra pode ser simples e ainda exigir treino profundo para ser percebida em diferentes vozes, conectada a outros sons e recuperada no momento certo.</p></Note>
      </>
    ),
  },
  {
    id: "profundidade-antes-de-variedade",
    part: "Parte III — A mudança de rota",
    number: 11,
    eyebrow: "A lição escondida no pendrive",
    title: "Profundidade antes de variedade",
    readingTime: 8,
    content: (
      <>
        <p className={styles.lead}>Variedade é importante para a fluência. A ordem em que ela chega é que muda tudo.</p>
        <p>Se você encontra cem variações antes de reconhecer o padrão central, cada uma parece um problema novo. Quando domina o padrão, as variações passam a ser comparações.</p>
        <p>É como conhecer uma cidade. Percorrer superficialmente cem ruas não produz a mesma orientação que dominar primeiro um bairro e usá-lo como referência. Profundidade cria pontos de apoio.</p>
        <p>O pequeno repertório do pendrive me obrigou a permanecer. A repetição revelou detalhes que a primeira escuta não tinha condições de mostrar: reduções, ritmos, antecipações e blocos inteiros.</p>
        <p>Depois, quando encontrei novas vozes, não comecei do zero. Eu já carregava peças estáveis para comparar.</p>
        <Secret number="#12">Variedade expande uma habilidade. Profundidade é o que permite que essa habilidade exista.</Secret>
        <p>A rota, portanto, não é escolher entre repetir ou explorar. É repetir até criar disponibilidade e então explorar para tornar essa disponibilidade flexível.</p>
      </>
    ),
  },
  {
    id: "duas-repeticoes",
    part: "Parte III — A mudança de rota",
    number: 12,
    eyebrow: "Repetir não é apertar play sem pensar",
    title: "As duas repetições",
    readingTime: 9,
    content: (
      <>
        <p className={styles.lead}>A palavra repetição pode sugerir monotonia. Em uma habilidade, ela descreve duas operações diferentes.</p>
        <RepetitionSystem />
        <p>Na repetição continuada, você permanece com o trecho durante a sessão. Cada volta tem uma função: primeiro perceber, depois conferir, separar blocos, antecipar e reproduzir.</p>
        <p>Na repetição espaçada, você permite que o tempo teste o que permaneceu. Voltar depois de um intervalo obriga o cérebro a recuperar, em vez de apenas manter a informação aquecida.</p>
        <p>Uma sem a outra deixa uma lacuna. Repetir apenas na mesma hora pode produzir familiaridade temporária. Revisitar sem aprofundar pode transformar cada retorno em uma nova primeira escuta.</p>
        <Secret number="#13">A repetição continuada cria nitidez. A repetição espaçada transforma essa nitidez em disponibilidade.</Secret>
        <p>O pendrive produziu as duas por acidente: os discursos se repetiam durante a viagem e voltavam nos dias seguintes. Um método consciente transforma esse acidente em desenho.</p>
      </>
    ),
  },
  {
    id: "treinos-concentrados",
    part: "Parte III — A mudança de rota",
    number: 13,
    eyebrow: "Menos material, mais transformação",
    title: "Treinos concentrados",
    readingTime: 10,
    content: (
      <>
        <p className={styles.lead}>Um episódio inteiro pode ser pequeno para o entretenimento e grande demais para um primeiro treino.</p>
        <p>Em vinte minutos, centenas de decisões sonoras passam diante do ouvido. Se você entende pouco, termina sem saber exatamente o que mudou. Por isso, a unidade inicial precisa caber na atenção.</p>
        <ConcentratedVsRandom />
        <p>Um trecho de trinta a sessenta segundos é grande o suficiente para conter fala real e pequeno o suficiente para ser revisitado com intenção. Você consegue medir o que percebe, conferir a transcrição, localizar emendas, testar novamente e reproduzir.</p>
        <p>Concentrar não significa tornar o inglês artificial. O material continua real. O que muda é a quantidade sobre a qual você exige domínio naquele momento.</p>
        <p>Depois que o trecho fica disponível, você avança. Vários minutos começam a formar uma cena; várias cenas formam um episódio. A expansão acontece sobre território conquistado, não sobre uma pilha de primeiras tentativas.</p>
        <Secret number="#14">Treino concentrado é reduzir o campo até que a mudança deixe de ser invisível.</Secret>
        <Note title="A unidade mínima útil"><p>Escolha um trecho que contenha uma ideia completa, fala nítida e vocabulário majoritariamente acessível. Difícil o bastante para revelar algo; curto o bastante para repetir.</p></Note>
      </>
    ),
  },
  {
    id: "conversas-e-discursos",
    part: "Parte III — A mudança de rota",
    number: 14,
    eyebrow: "Duas forças do inglês real",
    title: "Conversas e discursos",
    readingTime: 9,
    content: (
      <>
        <p className={styles.lead}>Conversar e sustentar uma ideia usam o mesmo idioma, mas exigem ritmos diferentes.</p>
        <p>Conversas treinam troca rápida: perguntas, reações, interrupções, humor, reduções e blocos curtos. Discursos treinam continuidade: conectar argumentos, explicar uma causa, defender uma posição e conduzir alguém de um ponto a outro.</p>
        <p>Foi por isso que os áudios de vendas tiveram tanto impacto no meu objetivo. Eu não queria apenas sobreviver a interações previsíveis. Precisava ouvir objeções e responder com clareza; precisava sustentar raciocínio sob pressão.</p>
        <div className={styles.comparison}>
          <div><span>CONVERSA</span><strong>Trocar</strong><p>Velocidade, reação, redução, perguntas e blocos sociais.</p></div>
          <div><span>DISCURSO</span><strong>Sustentar</strong><p>Sequência, argumento, transições, ênfase e intenção.</p></div>
        </div>
        <p>Uma rota completa treina os dois. Episódios conversacionais aproximam o ouvido do ritmo cotidiano. Discursos dão à fala estrutura para ir além de respostas curtas.</p>
        <Secret number="#15">A fluência não é apenas responder rápido. É conseguir permanecer em inglês enquanto uma ideia inteira toma forma.</Secret>
        <RouteMap />
      </>
    ),
  },
  {
    id: "o-experimento",
    part: "Parte IV — A prova",
    number: 15,
    eyebrow: "Sete dias para testar a tese",
    title: "O Experimento Fluency Secrets",
    readingTime: 12,
    content: (
      <>
        <p className={styles.lead}>Até aqui, você recebeu uma explicação. Agora ela precisa correr o risco de ser testada.</p>
        <p>O experimento não promete fluência em sete dias. Ele procura algo mais específico e honesto: verificar se um trecho que hoje exige tradução pode se tornar mais nítido, previsível e direto depois de treino concentrado.</p>
        <ExperimentCard />
        <p>Escolha um trecho de trinta a sessenta segundos. Pode ser parte de uma entrevista, discurso, podcast ou cena conversacional. Dê preferência a um material relevante para o inglês que você deseja viver.</p>
        <p>Você precisará do áudio, da transcrição correta e de uma explicação do significado. Durante sete dias, não troque de trecho. A permanência faz parte do teste.</p>
        <Note title="Antes de começar"><p>Registre honestamente quantas palavras ou blocos você percebe sem apoio. Não estime o quanto “acha que entendeu”. Escreva o que de fato chegou ao ouvido.</p></Note>
        <Secret number="#16">Uma ideia se torna sua quando produz uma diferença que você consegue observar.</Secret>
        <p>Nos próximos capítulos, cada etapa do experimento será detalhada. Seu trabalho não é acreditar em mim. É comparar a sua primeira escuta com a última.</p>
      </>
    ),
  },
  {
    id: "primeiro-trecho-sem-traducao",
    part: "Parte IV — A prova",
    number: 16,
    eyebrow: "Da legenda interna ao significado",
    title: "Seu primeiro trecho sem tradução",
    readingTime: 10,
    content: (
      <>
        <p className={styles.lead}>No primeiro dia, escute o trecho sem texto e sem legenda. Essa gravação é a sua linha de base.</p>
        <p>Anote palavras percebidas, pontos embolados e o significado que conseguiu construir. Depois, abra a transcrição. Compare cada bloco com o som e marque onde a versão falada se afasta da pronúncia que você imaginava.</p>
        <p>Nos dias seguintes, trabalhe em ciclos. Escute uma frase curta. Confira. Escute novamente olhando o texto. Retire o texto. Quando o som estiver claro, acompanhe em voz baixa. Só depois tente reproduzir junto.</p>
        <p>Não transforme shadowing em corrida. Se sua atenção está totalmente ocupada tentando mover a boca, o ouvido deixa de observar. Primeiro reconheça. Depois acompanhe.</p>
        <p>Em algum momento, o trecho pode começar a chegar como uma ideia conhecida. Você deixa de montar uma legenda interna e passa a antecipar o bloco. Esse é o primeiro trecho sem dependência da tradução.</p>
        <Secret number="#17">A automatização não começa no idioma inteiro. Começa quando um pequeno pedaço deixa de precisar ser reconstruído.</Secret>
        <p>Não despreze essa escala. O primeiro minuto é uma prova de mecanismo. Ele mostra que aquilo que parecia uma característica fixa do seu inglês pode ser modificado.</p>
      </>
    ),
  },
  {
    id: "medir-a-mudanca",
    part: "Parte IV — A prova",
    number: 17,
    eyebrow: "Progresso que deixa rastros",
    title: "Como medir a mudança no ouvido",
    readingTime: 8,
    content: (
      <>
        <p className={styles.lead}>“Acho que estou melhorando” é uma sensação útil, mas frágil. O experimento precisa de marcas mais concretas.</p>
        <p>No sétimo dia, escute o trecho antes de olhar qualquer apoio. Compare com o registro inicial em cinco dimensões.</p>
        <div className={styles.scorecard}>
          <div><span>01</span><b>Nitidez</b><p>Quantos sons antes unidos agora se separam?</p></div>
          <div><span>02</span><b>Cobertura</b><p>Quanto do trecho você realmente reconhece?</p></div>
          <div><span>03</span><b>Direção</b><p>O significado chega direto ou via português?</p></div>
          <div><span>04</span><b>Antecipação</b><p>Você prevê blocos antes de terminarem?</p></div>
          <div><span>05</span><b>Reprodução</b><p>Consegue acompanhar ritmo e emendas?</p></div>
        </div>
        <p>Você não precisa obter nota máxima. O resultado decisivo é perceber deslocamento em relação ao Dia 1. Um som que apareceu, um bloco reconhecido diretamente ou uma frase acompanhada já revela adaptação.</p>
        <Secret number="#18">A evolução fica motivadora quando deixa de ser uma esperança distante e passa a produzir evidências pequenas e repetíveis.</Secret>
      </>
    ),
  },
  {
    id: "o-proximo-fica-mais-facil",
    part: "Parte IV — A prova",
    number: 18,
    eyebrow: "Por que você não recomeça do zero",
    title: "O próximo trecho fica mais fácil",
    readingTime: 8,
    content: (
      <>
        <p className={styles.lead}>Ao trocar de trecho, você encontra sons novos. Mas não volta ao mesmo ponto de partida.</p>
        <p>Parte das palavras, reduções e blocos reaparece. O ouvido já aprendeu que a fala real não respeita os espaços perfeitos da escrita. A própria forma de treinar deixou de ser desconhecida.</p>
        <p>Isso cria um efeito composto. O primeiro trecho ensina conteúdo e também ensina seu cérebro a aprender aquele tipo de conteúdo. O seguinte encontra uma estrutura um pouco mais preparada.</p>
        <p>Nem todo material será mais fácil que o anterior. Sotaques, velocidade e tema mudam a dificuldade. Mas o repertório automatizado não desaparece; ele viaja com você.</p>
        <Secret number="#19">Cada trecho dominado entrega duas coisas: o inglês que continha e uma percepção melhor para encontrar inglês no próximo.</Secret>
        <p>É assim que o experimento deixa de ser um truque isolado e se transforma em rota. A pergunta agora é como aumentar a escala sem perder a profundidade.</p>
      </>
    ),
  },
  {
    id: "do-trecho-ao-episodio",
    part: "Parte V — Depois da epifania",
    number: 19,
    eyebrow: "Expandir sem voltar ao consumo aleatório",
    title: "Do primeiro trecho ao primeiro episódio",
    readingTime: 9,
    content: (
      <>
        <p className={styles.lead}>Um episódio entendido não é conquistado em uma única batalha de vinte minutos.</p>
        <p>Ele pode ser dividido em cenas; cenas, em minutos; minutos, em blocos treináveis. O objetivo não é memorizar cada fala para sempre, mas usar concentração suficiente para que os padrões recorrentes comecem a permanecer.</p>
        <p>Quando um bloco já dominado aparece em outra cena, não exige o mesmo esforço. Aos poucos, a proporção de material completamente novo diminui. O episódio deixa de parecer uma parede e passa a ser uma sequência de territórios reconhecíveis.</p>
        <RouteMap />
        <p>Entender o primeiro episódio inteiro é uma meta poderosa porque combina transformação e prova. Você não precisa acreditar que “está quase fluente”. Consegue voltar ao material e observar o que antes não percebia.</p>
        <Secret number="#20">Uma grande meta se torna treinável quando é dividida sem perder a conexão com o mundo real.</Secret>
      </>
    ),
  },
  {
    id: "do-episodio-a-fluencia",
    part: "Parte V — Depois da epifania",
    number: 20,
    eyebrow: "A expansão que não para no entretenimento",
    title: "Do episódio à Fluência Essencial",
    readingTime: 9,
    content: (
      <>
        <p className={styles.lead}>Séries são úteis porque comprimem conversas, relações e emoções em material que pode ser revisitado. Mas fluência não termina na tela.</p>
        <p>Depois de construir percepção em conversas, você amplia para entrevistas, reuniões, apresentações e discursos relacionados à vida que deseja viver. O essencial se repete; o vocabulário específico cresce ao redor dele.</p>
        <p>Quem quer viajar adiciona situações de viagem. Quem quer trabalhar em uma multinacional treina reuniões, entrevistas e explicações profissionais. Quem quer vender em dólar precisa ouvir objeções, sustentar argumentos e reagir a pessoas reais.</p>
        <p>A rota se torna pessoal na expansão, não no princípio. Todos precisam de percepção, blocos e disponibilidade. O destino define quais contextos receberão prioridade.</p>
        <Secret number="#21">Fluência funcional é o encontro entre uma base essencial automática e os contextos que importam para a sua vida.</Secret>
        <Note title="A pergunta de destino"><p>Se seu inglês funcionasse na velocidade que você precisa, em qual situação ele mudaria sua vida primeiro?</p></Note>
      </>
    ),
  },
  {
    id: "conhecer-o-caminho",
    part: "Parte V — Depois da epifania",
    number: 21,
    eyebrow: "O que este livro pode e não pode fazer",
    title: "Conhecer o caminho e ter a rota",
    readingTime: 9,
    content: (
      <>
        <p className={styles.lead}>Agora você conhece o princípio: automatizar o essencial por meio de treino concentrado, repetição e expansão progressiva.</p>
        <p>Conhecer o caminho evita anos andando na direção errada. Mas conhecimento, como vimos desde o início, não executa uma habilidade sozinho.</p>
        <p>Para transformar o princípio em rotina, alguém precisa escolher materiais, graduar dificuldade, preparar transcrições, organizar revisões, equilibrar ouvido e fala e decidir quando avançar. É possível montar tudo sozinho. Também é possível seguir uma rota preparada.</p>
        <p>Essa diferença não diminui o que você aprendeu. Pelo contrário: agora você consegue avaliar qualquer método com perguntas melhores.</p>
        <div className={styles.routeQuestions}>
          <p>Este material treina ou apenas explica?</p>
          <p>Ele aprofunda o essencial ou acumula assuntos?</p>
          <p>Existe repetição continuada e espaçada?</p>
          <p>Eu consigo medir mudança no ouvido e na fala?</p>
          <p>A progressão me leva aos contextos que desejo viver?</p>
        </div>
        <Secret number="#22">Um bom sistema não substitui seu treino. Ele remove o trabalho de inventar o treino enquanto você tenta evoluir.</Secret>
        <p>O livro não termina apresentando módulos, bônus ou uma oferta escondida. Ele termina devolvendo a decisão a você — agora com um diagnóstico diferente e uma experiência que pode ser repetida.</p>
      </>
    ),
  },
  {
    id: "a-estrada-continua",
    part: "Epílogo",
    eyebrow: "Quando o português deixa de ser a ponte",
    title: "A estrada continua",
    readingTime: 6,
    content: (
      <>
        <p className={styles.lead}>Naquelas viagens, eu achava que estava apenas usando o tempo no carro para me aproximar do sonho de vender em dólar.</p>
        <p>Eu não sabia que o pendrive quase vazio estava criando uma experiência que mudaria a forma como eu enxergava o inglês.</p>
        <p>Os mesmos áudios, repetidos por falta de opção, mostraram que o inglês podia ficar mais lento sem que a gravação diminuísse a velocidade. Depois, os discursos repetidos junto com aquelas vozes mostraram que a boca também podia aprender ritmo, emenda e antecipação.</p>
        <p>O que parecia uma limitação revelou um princípio: antes de correr atrás de mais conteúdo, permaneça tempo suficiente para que alguma coisa se torne sua.</p>
        <p>Talvez você tenha chegado a este livro acreditando que ainda faltava inglês. Espero que saia com uma pergunta mais precisa: quanto do inglês que já encontrou teve oportunidade de entrar no automático?</p>
        <p>Se você realizou o experimento, já não precisa tratar essa pergunta apenas como teoria. Existe um trecho que hoje chega de maneira diferente. Ele é pequeno, mas aponta para uma possibilidade grande.</p>
        <Secret number="#23">A fluência começa quando o inglês deixa de ser algo que você conhece e passa a ser algo que acontece em você.</Secret>
        <p>A estrada entre um trecho e a fluência é maior do que sete dias. Mas agora você sabe em qual direção ela segue.</p>
        <section className={styles.finalInvitation}>
          <span>APRESENTAÇÃO COMPLEMENTAR</span>
          <h2>Veja como transformar um trecho em uma rota completa.</h2>
          <p>Preparei uma aula visual para conectar os princípios deste livro a uma progressão prática de ouvido, fala, episódios e discursos.</p>
          <button type="button" disabled>Disponível em breve</button>
        </section>
      </>
    ),
  },
];
