'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles } from '@/components/ui/Sparkles';
import { Footer } from '@/components/Footer';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } },
};

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-perkament to-white py-12 md:py-20 px-4 min-h-[90vh] flex items-center justify-center overflow-hidden">

        {/* Sparkles Background */}
        <div className="absolute inset-0 z-0">
          <Sparkles color="#FFD700" count={20} minSize={4} maxSize={10} overflow={true} />
        </div>

        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item} className="inline-block bg-eric-gold/20 text-eric-green font-bold px-6 py-2 rounded-full text-sm md:text-base mb-6 border border-eric-gold/30 backdrop-blur-sm">
            ✨ 100% Gratis - Geen registratie nodig ✨
          </motion.div>

          <motion.h1
            variants={item}
            className="text-5xl md:text-7xl font-extrabold text-eric-green mb-6 drop-shadow-sm tracking-tight"
          >
            Lettoria
          </motion.h1>

          <motion.p variants={item} className="text-xl md:text-3xl text-gray-700 mb-4 font-bold">
            Gratis typecursus voor kinderen
          </motion.p>

          <motion.p variants={item} className="text-base md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Leer je kind blind typen met 10 vingers in de magische wereld van Lettoria.
            Spelenderwijs leren, samen met <span className="text-eric-green font-bold">Eric de draak</span>.
          </motion.p>

          {/* Eric Image */}
          <motion.div
            variants={item}
            className="mb-10 relative"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="absolute inset-0 bg-eric-gold/20 blur-3xl rounded-full transform scale-75"></div>
            <Image
              src="/images/eric/eric-happy.png"
              alt="Eric de draak - je gids in Lettoria"
              width={220}
              height={220}
              className="mx-auto drop-shadow-2xl relative z-10"
              priority
            />
          </motion.div>

          <motion.div variants={item} className="flex flex-col sm:flex-row gap-5 justify-center mb-12">
            <Link
              href="/kaart"
              className="group relative inline-flex items-center justify-center"
            >
              <div className="absolute transition-all duration-200 rounded-full -inset-1 bg-gradient-to-r from-eric-green to-eric-belly opacity-70 blur group-hover:opacity-100 group-hover:blur-md"></div>
              <span className="relative inline-block bg-eric-green hover:bg-eric-green/90 text-white font-bold py-4 px-10 rounded-full text-xl transition-all hover:scale-105 shadow-xl">
                Start gratis met typen 🚀
              </span>
            </Link>
            <Link
              href="/over"
              className="inline-block bg-white hover:bg-gray-50 text-eric-green font-bold py-4 px-10 rounded-full text-xl transition-all hover:scale-105 shadow-md border-2 border-eric-green"
            >
              Info voor ouders
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div variants={item} className="flex flex-wrap justify-center gap-6 text-sm md:text-base text-gray-600 font-medium">
            <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-full border border-gray-100 shadow-sm">
              <span className="text-eric-green text-lg">✓</span> Geen kosten
            </div>
            <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-full border border-gray-100 shadow-sm">
              <span className="text-eric-green text-lg">✓</span> Geen account nodig
            </div>
            <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-full border border-gray-100 shadow-sm">
              <span className="text-eric-green text-lg">✓</span> 100% Privacy
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Why Lettoria Section */}
      <section className="py-16 md:py-24 px-4 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-800 mb-4">
              Waarom <span className="text-eric-green">Lettoria?</span>
            </h2>
            <p className="text-lg text-gray-600">Speciaal gemaakt om typen leuk te maken</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { emoji: "💰", title: "100% Gratis", desc: "Andere typecursussen kosten €150 of meer. Lettoria is en blijft volledig gratis. Geen addertjes onder het gras." },
              { emoji: "🔒", title: "Privacy First", desc: "Geen registratie, geen e-mail, geen tracking. Alle voortgang wordt veilig lokaal op je eigen apparaat opgeslagen." },
              { emoji: "🎮", title: "Gamification", desc: "Een magisch avontuur waar je levels uitspeelt. Verdien badges, ontgrendel nieuwe gebieden en vier je successen." }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="bg-perkament p-8 rounded-3xl border-2 border-transparent hover:border-eric-belly transition-all hover:shadow-xl group"
              >
                <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">{feature.emoji}</div>
                <h3 className="font-bold text-2xl mb-4 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-white to-perkament">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
              Superkrachten voor op school ⚡
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: "⏱️", title: "Meer tijd", desc: "Sneller typen betekent meer tijd om na te denken bij schooltoetsen en werkstukken." },
              { icon: "🎯", title: "Betere focus", desc: "Focus op de inhoud in plaats van zoeken naar letters. Dit leidt tot betere teksten." },
              { icon: "📚", title: "Taalvaardigheid", desc: "Regelmatig typen verbetert spelling en woordenschat op een natuurlijke, ongedwongen manier." },
              { icon: "🚀", title: "Toekomst", desc: "Blind typen is een essentiële skill waar je kind de rest van zijn leven profijt van heeft." }
            ].map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex gap-6 items-start bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="bg-eric-green/10 rounded-2xl p-4 flex-shrink-0">
                  <span className="text-3xl">{benefit.icon}</span>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-800 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">
                    {benefit.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24 px-4 bg-eric-green text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-eric-eyes/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-center mb-16"
          >
            Hoe werkt het avontuur?
          </motion.h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Start Direct", desc: "Geen gedoe met accounts. Klik op start en je avontuur begint meteen." },
              { step: "2", title: "Ontdek de Wereld", desc: "Reis door 7 unieke regio's, van het Diepe Woud tot de Hoge Toppen." },
              { step: "3", title: "Volg het Verhaal", desc: "Elke les begint met een verhaaltje. Help Eric magische problemen op te lossen." },
              { step: "4", title: "Word Meester", desc: "Na 23 lessen typ je blind en ontvang je jouw officiële diploma!" }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="text-center group"
              >
                <div className="bg-white/10 group-hover:bg-white text-white group-hover:text-eric-green w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold transition-all duration-300 shadow-lg border-2 border-white/20">
                  {item.step}
                </div>
                <h3 className="font-bold text-xl mb-3">{item.title}</h3>
                <p className="text-eric-belly/90 text-sm leading-relaxed px-4">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Target audience */}
      <section className="py-20 px-4 bg-white text-center">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Klaar om te beginnen?
            </h2>
            <p className="text-gray-600 mb-10 text-lg">
              De wereld ligt aan je voeten (en vingers). Eric wacht op je!
            </p>

            <Link
              href="/kaart"
              className="group relative inline-flex items-center justify-center"
            >
              <div className="absolute transition-all duration-200 rounded-full -inset-1 bg-eric-green opacity-70 blur group-hover:opacity-100 group-hover:blur-md"></div>
              <span className="relative inline-block bg-eric-green hover:bg-eric-green/90 text-white font-bold py-5 px-12 rounded-full text-xl transition-all hover:scale-105 shadow-xl">
                Speel nu gratis
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
