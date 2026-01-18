import Navbar from "./Navbar";
import AgentBackground from "./AgentBackground";
import ParallaxSection from "./ParallaxSection";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-linear-to-br from-indigo-50 via-white to-purple-50">
      
      {/* 3D Background ONLY FOR HOME */}
      <AgentBackground />

      <Navbar />

      {/* HERO */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-3xl">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Build with Intelligent <span className="text-indigo-600">AI Agents</span>
          </h2>
          <p className="text-gray-600 text-lg mb-10">
            A modern platform powered by AI, 3D experiences, and smooth parallax UI.
          </p>

          <Link
            to="/jd-builder"
            className="px-10 py-4 bg-indigo-600 text-white rounded-xl shadow-lg hover:scale-105 transition"
          >
            Build My Job Description 🚀
          </Link>
        </div>
      </section>

      {/* PARALLAX CONTENT */}
      <ParallaxSection>
        <section className="max-w-7xl mx-auto px-6 py-32 grid md:grid-cols-3 gap-10">
          {["AI Powered", "Fast", "Accurate"].map((item) => (
            <div
              key={item}
              className="bg-white rounded-2xl shadow-xl p-8 text-center"
            >
              <h3 className="text-xl font-semibold mb-3">{item}</h3>
              <p className="text-gray-600">
                Designed to scale with modern engineering practices.
              </p>
            </div>
          ))}
        </section>
      </ParallaxSection>

    </div>
  );
};

export default Home;
