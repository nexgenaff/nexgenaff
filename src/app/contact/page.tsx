export const metadata = {
  title: "Contact | Afficixo",
  description: "Get in touch with Afficixo for support, partnership inquiries, and affiliate assistance.",
}

export default function ContactPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070b] text-white">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#05070b]/80 via-[#0d1724]/60 to-[#101827]/80" />
        <div className="absolute top-0 left-1/4 w-[820px] h-[820px] bg-gradient-radial from-indigo-900/20 via-transparent to-transparent blur-3xl" />
        <div className="absolute top-1/3 right-0 w-[620px] h-[620px] bg-gradient-radial from-purple-700/15 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-[720px] h-[720px] bg-gradient-radial from-pink-900/10 via-transparent to-transparent blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:60px_60px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 backdrop-blur-xl shadow-[0_40px_120px_-40px_rgba(15,23,42,0.8)]">
          <div className="border-b border-white/10 px-6 py-10 sm:px-10">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Contact</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Contact Afficixo</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
              Reach out to the Afficixo team for questions about onboarding, support, or affiliate programs.
            </p>
          </div>

          <div className="space-y-10 px-6 py-10 sm:px-10">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Support</h2>
              <p className="text-slate-300 leading-7">
                For general support, email us at <a className="text-cyan-300 hover:text-cyan-200" href="mailto:support@weebly.pro">support@weebly.pro</a>.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Partnerships</h2>
              <p className="text-slate-300 leading-7">
                Interested in partnerships or affiliate collaboration? Send us a message and our team will follow up promptly.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Feedback</h2>
              <p className="text-slate-300 leading-7">
                We value your feedback. Let us know what we can improve and how we can help your campaigns succeed.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
