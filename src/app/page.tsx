import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import MarqueeBanner from '@/components/MarqueeBanner';
import About from '@/components/About';
import Journey from '@/components/Journey';
import FlowField from '@/components/FlowField';
import Projects from '@/components/Projects';
import Playground from '@/components/Playground';
import Skills from '@/components/Skills';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import { structuredData } from '@/lib/seo';

export default function Home() {
  return (
    <main className="min-h-screen bg-paper">
      <script
        type="application/ld+json"
        // Escape "<" so the JSON can never close the script tag early
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()).replace(/</g, '\\u003c') }}
      />
      <Navbar />
      <Hero />
      <MarqueeBanner />
      <About />
      <Journey />
      <FlowField />
      <Projects />
      <Playground />
      <Skills />
      <Contact />
      <Footer />
    </main>
  );
}
