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

export default function Home() {
  return (
    <main className="min-h-screen bg-paper">
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
