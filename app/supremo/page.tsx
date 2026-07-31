import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import styles from './supremo.module.css'

export const metadata: Metadata = {
  title: 'Rota da Fluência — Inglês que finalmente entra no ouvido',
  description: 'Treine seu ouvido com falas reais, música e repetição inteligente. Conheça por dentro a Rota da Fluência.',
}

const features = [
  { n: '01', title: 'Ouça o inglês real', text: 'Treine com blocos de som, músicas, séries e discursos — do jeito que nativos realmente falam.', tone: 'teal' },
  { n: '02', title: 'Repita sem cansar', text: 'Loops concentrados transformam sons que pareciam embolados em frases que seu ouvido reconhece.', tone: 'violet' },
  { n: '03', title: 'Fale e receba feedback', text: 'Pratique shadowing, grave sua voz e veja onde sua pronúncia já encaixou — palavra por palavra.', tone: 'yellow' },
]

const modules = [
  ['Músicas que ensinam', '134 faixas originais organizadas em uma progressão clara.'],
  ['Séries em blocos', 'Cenas de Friends, HIMYM e Two and a Half Men para treinar ouvido e contexto.'],
  ['Laboratório de fala', 'Pronúncia, listening, conversation e writing com feedback de IA.'],
  ['Dicionário pessoal', 'Salve frases reais e transforme seu próprio repertório em prática.'],
  ['Fluency Station', 'Playlists para academia, rock e pop manterem o inglês no seu dia.'],
  ['Biblioteca guiada', 'Livros com tradução frase a frase, áudio e compreensão.'],
]

const faqs = [
  ['Serve para quem está começando?', 'Sim. A rota regula o treino ao seu nível e começa pela percepção dos sons, sem presumir que você já fala inglês.'],
  ['E para quem já estudou, mas não entende nativos?', 'Esse é o caso central do método. Você deixa de tentar traduzir palavra por palavra e passa a reconhecer blocos de som inteiros.'],
  ['Preciso cantar bem?', 'Não. Música é uma ferramenta de memória e repetição; afinação não é requisito.'],
  ['Consigo usar pelo celular?', 'Sim. A experiência foi desenhada para funcionar no celular e no computador.'],
  ['Quanto tempo preciso por dia?', 'Você pode avançar no seu ritmo. Sessões curtas e frequentes tendem a encaixar melhor na rotina do que longas aulas isoladas.'],
]

export default function SupremoPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/supremo" className={styles.logo} aria-label="Fluency Route">
          <span className={styles.logoMark}>FR</span>
          <span>FLUENCY <b>ROUTE</b></span>
        </Link>
        <nav className={styles.nav} aria-label="Navegação principal">
          <a href="#metodo">O método</a><a href="#app">Por dentro</a><a href="#faq">Dúvidas</a>
        </nav>
        <Link className={styles.headerCta} href="/lead">Fazer treino grátis <span>↗</span></Link>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span /> Para quem entende no papel, mas trava no ouvido</p>
          <h1>Você não precisa estudar mais inglês.<br/><em>Precisa treinar o ouvido.</em></h1>
          <p className={styles.heroText}>Transforme falas rápidas em blocos que seu cérebro reconhece — com música, cenas reais e um loop de repetição feito para você não desistir.</p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryCta} href="/lead">Quero fazer o treino grátis <span>→</span></Link>
            <a className={styles.textLink} href="#app"><i className={styles.play}>▶</i> Ver o app por dentro</a>
          </div>
          <p className={styles.micro}>Sem cartão • Comece pelo diagnóstico gratuito</p>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.orbit}><span>LISTENING</span><span>PRONÚNCIA</span></div>
          <div className={styles.phone}>
            <div className={styles.phoneTop}><span /><i /></div>
            <Image src="/supremo/m-dashboard.png" alt="Dashboard da Rota da Fluência no celular" width={430} height={900} priority />
          </div>
          <div className={`${styles.floatCard} ${styles.floatOne}`}><b>7 dias</b><span>sequência atual</span><div>● ● ● ● ● ● ●</div></div>
          <div className={`${styles.floatCard} ${styles.floatTwo}`}><span>OUVIDO TREINADO</span><b>+34%</b><small>este mês ↗</small></div>
        </div>
      </section>

      <section className={styles.proofBar}>
        <p>UM ECOSSISTEMA COMPLETO DE AQUISIÇÃO</p>
        <div><span>134<small>músicas originais</small></span><i/><span>500+<small>blocos essenciais</small></span><i/><span>4<small>habilidades no Lab</small></span><i/><span>1<small>rota clara</small></span></div>
      </section>

      <section className={styles.problem} id="metodo">
        <div className={styles.sectionLabel}>01 — O PROBLEMA NÃO É VOCÊ</div>
        <div className={styles.problemGrid}>
          <h2>Seu inglês não está ruim.<br/><em>Seu ouvido nunca foi ligado.</em></h2>
          <div><p>Você aprendeu a <b>ler, traduzir e preencher exercícios.</b> Mas quando alguém fala de verdade, as palavras se juntam e tudo parece rápido demais.</p><p>Idioma é habilidade. E habilidade não se estuda como matéria — <strong>se treina.</strong></p></div>
        </div>
        <div className={styles.soundDemo}>
          <div className={styles.soundOld}><small>O QUE VOCÊ TENTA OUVIR</small><p>WHAT &nbsp; DO &nbsp; YOU &nbsp; WANT &nbsp; TO &nbsp; DO?</p><div className={styles.waveMuted}>▂▅▃▆▂▇▃▅▂▆▃▂</div></div>
          <div className={styles.arrowCircle}>→</div>
          <div className={styles.soundNew}><small>O QUE O NATIVO FALA</small><p>WHADDAYA <b>WANNA</b> DO?</p><div className={styles.wave}>▂▅▃▆▂▇▃▅▂▆▃▂</div></div>
        </div>
      </section>

      <section className={styles.method}>
        <div className={styles.sectionLabel}>02 — O LOOP DE REPETIÇÃO</div>
        <div className={styles.sectionHeading}><h2>O mesmo trecho.<br/>Até o som <em>colar.</em></h2><p>Você não coleciona aulas. Você transforma cada trecho em uma habilidade automática.</p></div>
        <div className={styles.featureGrid}>{features.map((f) => <article key={f.n} className={`${styles.feature} ${styles[f.tone]}`}><span>{f.n}</span><div className={styles.featureIcon}>{f.n === '01' ? '◖))' : f.n === '02' ? '↻' : '⌁'}</div><h3>{f.title}</h3><p>{f.text}</p></article>)}</div>
      </section>

      <section className={styles.product} id="app">
        <div className={styles.productIntro}><div className={styles.sectionLabel}>03 — TUDO NO MESMO LUGAR</div><h2>Um app que transforma<br/><em>conteúdo em treino.</em></h2><p>Você sempre sabe o que fazer agora, o que revisar e qual habilidade está evoluindo.</p></div>
        <div className={styles.desktopFrame}>
          <div className={styles.browserBar}><i/><i/><i/><span>app.fluencyroute.com.br</span></div>
          <Image src="/supremo/desktop-dashboard.png" alt="Plataforma Fluency Route exibida em desktop" width={1440} height={900} />
        </div>
        <div className={styles.moduleGrid}>{modules.map(([title,text],i) => <article key={title}><span>{String(i+1).padStart(2,'0')}</span><h3>{title}</h3><p>{text}</p><b>↗</b></article>)}</div>
      </section>

      <section className={styles.transformation}>
        <div className={styles.sectionLabel}>04 — A SUA NOVA RELAÇÃO COM O INGLÊS</div>
        <h2>De “fala mais devagar” para<br/><em>“eu entendi sem legenda”.</em></h2>
        <div className={styles.beforeAfter}>
          <div className={styles.before}><small>ANTES</small><p>Traduz cada palavra</p><p>Trava quando o nativo acelera</p><p>Começa e abandona cursos</p><p>Tem vergonha de falar</p></div>
          <div className={styles.routeLine}><span>FR</span><i/><b>→</b></div>
          <div className={styles.after}><small>DEPOIS</small><p>Reconhece blocos de som</p><p>Acompanha conversas reais</p><p>Treina um pouco todos os dias</p><p>Fala com ouvido e confiança</p></div>
        </div>
      </section>

      <section className={styles.finalCta}>
        <span className={styles.finalOrb}>↻</span>
        <div><p className={styles.eyebrow}><span /> SEU PRIMEIRO LOOP ESTÁ PRONTO</p><h2>Descubra o que muda<br/>quando você <em>treina</em> inglês.</h2><p>Faça uma experiência guiada, meça seu ouvido antes e depois e receba seu diagnóstico.</p><Link className={styles.primaryCta} href="/lead">Começar meu treino grátis <span>→</span></Link><small>Leva poucos minutos • Sem cartão</small></div>
      </section>

      <section className={styles.faq} id="faq"><div><div className={styles.sectionLabel}>05 — DÚVIDAS REAIS</div><h2>Antes de começar.</h2></div><div className={styles.faqList}>{faqs.map(([q,a],i) => <details key={q}><summary><span>{String(i+1).padStart(2,'0')}</span>{q}<b>+</b></summary><p>{a}</p></details>)}</div></section>

      <footer className={styles.footer}><div className={styles.logo}><span className={styles.logoMark}>FR</span><span>FLUENCY <b>ROUTE</b></span></div><p>Inglês é habilidade. Habilidade se treina.</p><div><Link href="/lead">Treino grátis</Link><a href="#metodo">Método</a><a href="#app">Plataforma</a></div><small>© 2026 Fluency Route. Página conceito para revisão.</small></footer>
    </main>
  )
}
