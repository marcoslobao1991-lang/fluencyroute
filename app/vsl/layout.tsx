import Script from 'next/script'

export default function VSLLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Vturb speed optimization — preload player assets */}
      <link rel="preload" href="https://scripts.converteai.net/a2b1bd19-973f-4fda-ada9-47d42bffa2ad/players/69d11e69d48f2697296489fb/v4/embed.html" as="document" />
      <link rel="preload" href="https://scripts.converteai.net/a2b1bd19-973f-4fda-ada9-47d42bffa2ad/players/69d11e69d48f2697296489fb/v4/player.js" as="script" />
      <link rel="preload" href="https://scripts.converteai.net/lib/js/smartplayer-wc/v4/smartplayer.js" as="script" />
      <link rel="preload" href="https://cdn.converteai.net/a2b1bd19-973f-4fda-ada9-47d42bffa2ad/69d11dd2d48f26972964888b/main.m3u8" as="fetch" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://cdn.converteai.net" />
      <link rel="dns-prefetch" href="https://scripts.converteai.net" />
      <link rel="dns-prefetch" href="https://images.converteai.net" />
      <link rel="dns-prefetch" href="https://api.vturb.com.br" />
      <Script id="vturb-plt" strategy="beforeInteractive">{`
        !function(i,n){i._plt=i._plt||(n&&n.timeOrigin?n.timeOrigin+n.now():Date.now())}(window,performance);
      `}</Script>
      {children}
    </>
  )
}
