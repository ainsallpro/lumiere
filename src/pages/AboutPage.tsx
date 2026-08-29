import { useState, useEffect, useRef } from 'react'

const milestones = [
  {
    year: '2005',
    title: 'Awal Mula',
    story: 'Pak Hendra Wijaya memulai segalanya dari garasi kecil di Manjahlega. Berbekal satu set alat kayu warisan ayahnya dan tekad yang tak tergoyahkan, ia mulai mengukir mimpi - satu kursi pada satu waktu.',
    img: '/images/team/team-1.jpg',
  },
  {
    year: '2009',
    title: 'Showroom Pertama',
    story: 'Empat tahun penuh kerja keras akhirnya berbuah. Toko pertama Lumière Furniture buka di Grand Lumière Boulevard - ruang pamer yang segera dipenuhi apresiasi para pecinta estetika interior.',
    img: '/images/team/team-2.jpg',
  },
  {
    year: '2014',
    title: 'Tangan Terampil Bertambah',
    story: 'Tim pengrajin berkembang menjadi 12 orang. Kami mulai bermitra dengan pengrajin lokal berbakat, menggabungkan keahlian tradisional dengan sentuhan desain kontemporer yang elegan untuk hunian modern.',
    img: '/images/team/team-3.jpg',
  },
  {
    year: '2019',
    title: 'Ribuan Rumah, Satu Filosofi',
    story: 'Lumière telah mempercantik lebih dari 5.000 hunian di berbagai penjuru. Setiap karya yang kami kirimkan membawa kehangatan dan keanggunan abadi.',
    img: '/images/team/team-4.jpg',
  },
  {
    year: '2026',
    title: 'Hari Ini & Seterusnya',
    story: 'Dua dekade berlalu. Garasi kecil itu kini menjadi showroom yang hangat dan penuh karya. Tapi satu hal tidak berubah: setiap potongan kayu kami perlakukan seperti pertama kali - dengan hormat, ketelitian, dan cinta.',
    img: '/images/team/team-5.jpg',
  },
]

const values = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    title: 'Kayu Pilihan',
    body: 'Hanya kayu jati, mahoni, dan pinus unggulan yang lolos seleksi kami. Setiap bahan baku diperiksa satu per satu - karena kualitas dimulai jauh sebelum proses produksi.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538l1.732-1.732a5.25 5.25 0 001.538-3.712l.003-2.024a.668.668 0 01.198-.471 1.575 1.575 0 10-2.228-2.228 3.818 3.818 0 00-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0116.35 15m.002 0h-.002" />
      </svg>
    ),
    title: 'Dikerjakan dengan Tangan',
    body: 'Di era mesin, kami masih percaya pada tangan manusia. Pengrajin kami menghabiskan rata-rata 40 jam per item - memahat, mengamplas, dan memoles hingga setiap sudut sempurna.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
    title: 'Untuk Rumah Indonesia',
    body: 'Desain kami lahir dari pemahaman mendalam tentang kehidupan keluarga Indonesia - ruang yang fungsional, hangat, dan tahan untuk diwariskan ke generasi berikutnya.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    title: 'Garansi Seumur Hidup',
    body: 'Kami berdiri di balik setiap produk yang kami buat. Bila ada cacat produksi, kami perbaiki - tanpa syarat, tanpa argumen. Karena kepercayaan Anda adalah bisnis kami.',
  },
]

const stats = [
  { value: '21', label: 'Tahun Berdiri', suffix: '+' },
  { value: '8500', label: 'Rumah Diisi', suffix: '+' },
  { value: '35', label: 'Pengrajin Aktif', suffix: '' },
  { value: '98', label: 'Kepuasan Pelanggan', suffix: '%' },
]

const team = [
  { name: 'Hendra Wijaya', role: 'Pendiri & Direktur', img: '/images/team/team-6.jpg' },
  { name: 'Sari Kusuma', role: 'Kepala Desain', img: '/images/team/team-7.jpg' },
  { name: 'Budi Santoso', role: 'Pengrajin Utama', img: '/images/team/team-8.jpg' },
  { name: 'Dewi Rahayu', role: 'Manajer Operasional', img: '/images/team/team-9.jpg' },
]

function CountUp({ target, suffix }: { target: string; suffix: string }) {
  const [display, setDisplay] = useState('0')
  const ref = useRef<HTMLSpanElement>(null)
  const animated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true
          const raw = parseInt(target.replace(/\D/g, ''), 10)
          let start = 0
          const duration = 1800
          const stepMs = 16
          const increment = raw / (duration / stepMs)
          const timer = setInterval(() => {
            start += increment
            if (start >= raw) {
              start = raw
              clearInterval(timer)
            }
            setDisplay(Math.floor(start).toLocaleString('id-ID'))
          }, stepMs)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{display}{suffix}</span>
}

export default function AboutPage() {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <div className="bg-stone-50 overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col justify-end overflow-hidden bg-stone-900">
        <img
          src="/images/about/about-1.jpg"
          alt="Showroom Lumière Furniture"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/20 via-transparent to-stone-950/90" />

        <div className="absolute top-10 right-10 hidden lg:flex flex-col items-end gap-1 z-10">
          <span className="text-stone-400 text-[10px] tracking-[0.3em] uppercase">Est.</span>
          <span className="text-stone-200 text-4xl font-light" style={{ fontFamily: 'var(--font-display)' }}>2005</span>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-16 pb-20 w-full">
          <p className="text-amber-400 text-xs tracking-[0.35em] uppercase mb-5 font-medium">Tentang Kami</p>
          <h1 className="text-white text-5xl md:text-7xl lg:text-8xl leading-[1.02] mb-8" style={{ fontFamily: 'var(--font-display)' }}>
            Dua dekade<br />
            <em className="not-italic text-stone-300">merawat</em><br />
            rumah Indonesia.
          </h1>
          <div className="w-16 h-px bg-amber-400 mb-6" />
          <p className="text-stone-300 text-base md:text-lg max-w-md leading-relaxed">
            Dari garasi kecil di Manjahlega hingga ribuan rumah yang kami isi dengan kehangatan - ini adalah cerita kami.
          </p>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-stone-400 animate-pulse" />
          <p className="text-stone-500 text-[10px] tracking-[0.25em] uppercase">Gulir ke bawah</p>
        </div>
      </section>

      {/* ── OPENING STORY ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-16 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-16 lg:gap-24 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -top-8 -left-8 w-40 h-40 rounded-full bg-amber-100 opacity-60 blur-3xl pointer-events-none" />
            <img
              src="/images/about/about-2.jpg"
              alt="Pengrajin Lumière Furniture bekerja"
              className="w-full object-cover rounded-sm relative z-10"
              style={{ height: '520px' }}
            />
            <div className="absolute -bottom-5 -right-5 bg-amber-500 text-stone-900 px-6 py-5 rounded-sm z-20 shadow-xl">
              <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>2005</p>
              <p className="text-stone-700 text-xs mt-0.5 font-medium tracking-wide">Tahun Berdiri</p>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-amber-600 text-xs tracking-[0.3em] uppercase mb-4 font-medium">Kisah Kami</p>
            <h2 className="text-stone-900 text-4xl lg:text-5xl mb-8 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Semuanya dimulai<br />dari sepasang<br /><em>tangan terampil.</em>
            </h2>
            <div className="space-y-5 text-stone-600 text-base leading-relaxed">
              <p>
                Tahun 2005. Studio Lumière didirikan berlandaskan dedikasi terhadap keindahan material kayu alami dan kerajinan tangan presisi. Di tangan pengrajin kami, kayu jati tua berubah menjadi mahakarya pertama Lumière Furniture.
              </p>
              <p>
                Tidak ada modal besar. Tidak ada tim desainer. Hanya satu keyakinan sederhana:{' '}
                <strong className="text-stone-800 font-semibold">furnitur yang baik adalah investasi, bukan pengeluaran.</strong>{' '}
                Bahwa sebuah meja makan yang dibuat dengan benar bisa menyaksikan sarapan keluarga selama tiga generasi.
              </p>
              <p>
                Pelanggan pertama datang dari mulut ke mulut. Lalu yang kedua. Lalu yang kesepuluh. Dan kini, dua puluh satu tahun kemudian, kami telah mengisi lebih dari 8.500 rumah di seluruh Jawa Barat - satu demi satu, dengan tangan yang sama teliti.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section className="bg-stone-900 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-stone-700/50">
            {stats.map((s) => (
              <div key={s.label} className="text-center py-12 px-6">
                <p className="text-amber-400 text-4xl lg:text-5xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  <CountUp target={s.value} suffix={s.suffix} />
                </p>
                <p className="text-stone-400 text-sm tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PERJALANAN / TIMELINE ── */}
      <section className="py-24 lg:py-32 bg-stone-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="text-center mb-16">
            <p className="text-amber-600 text-xs tracking-[0.3em] uppercase mb-3 font-medium">Perjalanan Kami</p>
            <h2 className="text-stone-900 text-4xl lg:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
              Dua puluh satu tahun<br /><em>penuh cerita</em>
            </h2>
          </div>

          <div className="flex gap-3 justify-center flex-wrap mb-12">
            {milestones.map((m, i) => (
              <button
                key={m.year}
                onClick={() => setActiveStep(i)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeStep === i
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                }`}
              >
                {m.year}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-sm shadow-xl">
            <div className="relative bg-stone-800 overflow-hidden" style={{ minHeight: '380px' }}>
              {milestones.map((m, i) => (
                <img
                  key={m.year}
                  src={m.img}
                  alt={m.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                    activeStep === i ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-r from-stone-900/60 to-transparent" />
              <div className="absolute bottom-8 left-8">
                <span className="text-amber-400 text-6xl font-bold opacity-80" style={{ fontFamily: 'var(--font-display)' }}>
                  {milestones[activeStep].year}
                </span>
              </div>
            </div>

            <div className="bg-white p-10 lg:p-14 flex flex-col justify-center">
              <div className="w-10 h-px bg-amber-400 mb-6" />
              <h3 className="text-stone-900 text-3xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                {milestones[activeStep].title}
              </h3>
              <p className="text-stone-600 leading-relaxed text-base mb-8">
                {milestones[activeStep].story}
              </p>
              <div className="flex gap-2">
                {milestones.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeStep === i ? 'w-8 bg-amber-500' : 'w-4 bg-stone-200 hover:bg-stone-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FULL-BLEED QUOTE ── */}
      <section className="relative py-32 overflow-hidden bg-stone-800">
        <img
          src="/images/about/about-3.jpg"
          alt="Proses pengerjaan furnitur"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-16 text-center">
          <p className="text-amber-400 text-xs tracking-[0.35em] uppercase mb-6 font-medium">Filosofi Kami</p>
          <blockquote className="text-white text-3xl md:text-4xl lg:text-5xl leading-tight mb-8" style={{ fontFamily: 'var(--font-display)' }}>
            <em>"Furnitur yang baik bukan soal seberapa mewahnya - tapi seberapa lama ia menemani hidupmu."</em>
          </blockquote>
          <p className="text-stone-400 text-sm tracking-widest uppercase"> - Hendra Wijaya, Pendiri</p>
        </div>
      </section>

      {/* ── NILAI-NILAI ── */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-16 items-start">
            <div className="lg:sticky top-24">
              <p className="text-amber-600 text-xs tracking-[0.3em] uppercase mb-4 font-medium">Nilai Kami</p>
              <h2 className="text-stone-900 text-4xl lg:text-5xl leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Yang tidak<br />pernah kami<br /><em>kompromikan.</em>
              </h2>
              <p className="text-stone-500 text-sm mt-6 leading-relaxed max-w-xs">
                Di balik setiap produk Lumière, ada standar yang kami pegang teguh sejak hari pertama.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {values.map((v) => (
                <div
                  key={v.title}
                  className="group border border-stone-100 rounded-sm p-8 hover:border-amber-200 hover:bg-amber-50/30 transition-all duration-300"
                >
                  <div className="text-amber-500 mb-5 group-hover:text-amber-600 transition-colors">{v.icon}</div>
                  <h3 className="text-stone-900 text-xl mb-3" style={{ fontFamily: 'var(--font-display)' }}>{v.title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{v.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TIM ── */}
      <section className="py-24 lg:py-32 bg-stone-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="text-center mb-16">
            <p className="text-amber-600 text-xs tracking-[0.3em] uppercase mb-3 font-medium">Tim Kami</p>
            <h2 className="text-stone-900 text-4xl lg:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
              Wajah di balik<br /><em>setiap karya</em>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((person) => (
              <div key={person.name} className="group text-center">
                <div className="overflow-hidden rounded-sm bg-stone-200 mb-4 aspect-[3/4] relative">
                  <img
                    src={person.img}
                    alt={person.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors duration-300" />
                </div>
                <h3 className="text-stone-900 text-base font-medium" style={{ fontFamily: 'var(--font-display)' }}>{person.name}</h3>
                <p className="text-stone-500 text-xs tracking-wide mt-1">{person.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOKASI & CTA ── */}
      <section className="bg-stone-900 py-24 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-amber-400 text-xs tracking-[0.3em] uppercase mb-5 font-medium">Kunjungi Kami</p>
              <h2 className="text-white text-4xl lg:text-5xl mb-6 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Lihat sendiri.<br />
                <em className="text-stone-400">Rasakan bedanya.</em>
              </h2>
              <p className="text-stone-400 text-base leading-relaxed mb-8">
                Tidak ada foto katalog yang bisa menggantikan pengalaman duduk di kursi aslinya, meraba tekstur kayunya, mencium aroma polisnya. Datang dan rasakan sendiri.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1 text-amber-400 flex-shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Lumière Furniture</p>
                    <p className="text-stone-400 text-sm">Grand Lumière Boulevard, Jakarta Selatan, Indonesia</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="mt-1 text-amber-400 flex-shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Jam Operasional</p>
                    <p className="text-stone-400 text-sm">Senin - Sabtu 09.00-18.00 · Minggu 10.00-16.00</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src="/images/about/about-4.jpg"
                alt="Interior showroom Lumière Furniture"
                className="w-full object-cover rounded-sm"
                style={{ height: '360px' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 to-transparent rounded-sm" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white text-sm font-medium mb-3">Siap berkunjung?</p>
                <div className="flex gap-3">
                  <a
                    href="https://wa.me/6281234567890"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-stone-900 text-sm font-semibold py-3 px-4 rounded-sm text-center transition-colors"
                  >
                    WhatsApp Kami
                  </a>
                  <a
                    href="mailto:nurainsalimah1@gmail.com"
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white text-sm font-medium py-3 px-4 rounded-sm text-center transition-colors border border-white/20"
                  >
                    Kirim Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
