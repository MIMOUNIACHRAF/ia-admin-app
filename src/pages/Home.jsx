import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Dashboard Intuitif",
      description: "Visualisez en un coup d’œil les informations clés.",
      icon: <LayoutDashboard size={48} className="text-blue-600" />,
      to: "/dashboard",
    },
    {
      title: "Gestion des Agents",
      description: "Ajoutez, modifiez et suivez facilement vos agents.",
      icon: <Users size={48} className="text-blue-600" />,
      to: "/agents",
    },
    {
      title: "Paramètres Personnalisés",
      description: "Configurez votre environnement selon vos besoins.",
      icon: <Settings size={48} className="text-blue-600" />,
      to: "/settings",
    },
    {
      title: "Suivi des Logs",
      description: "Analysez l’activité système pour garantir la sécurité.",
      icon: <FileText size={48} className="text-blue-600" />,
      to: "/logs",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-12 py-12">
      {/* Hero Section */}
      <section className="flex flex-col-reverse lg:flex-row items-center gap-12 mb-20 px-4 sm:px-6 md:px-12">
  {/* Texte et bouton */}
  <div className="max-w-xl text-center lg:text-left">
    <h1 className="text-5xl sm:text-6xl font-extrabold text-blue-700 mb-6 leading-tight tracking-tight">
      Bienvenue sur <span className="text-indigo-600">IA Admin</span>
    </h1>
    <p className="text-gray-600 text-lg sm:text-xl mb-8 max-w-md mx-auto lg:mx-0">
      Votre tableau de bord intelligent pour la gestion efficace des agents et des opérations.
    </p>
    <button
      onClick={() => navigate("/dashboard")}
      className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-10 rounded-lg shadow-lg transition transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-indigo-300"
      aria-label="Accéder au Dashboard"
    >
      Accéder au Dashboard
    </button>
  </div>

  {/* Illustration */}
  <div className="w-full max-w-md mx-auto lg:mx-0 animate-fadeInUp">
    <img
      src="/assets/admin-illustration.svg"
      alt="Illustration IA Admin"
      className="w-full h-auto object-contain rounded-lg shadow-xl"
      loading="lazy"
      draggable={false}
    />
  </div>
</section>


      {/* Features Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {features.map(({ title, description, icon, to }) => (
          <FeatureCard
            key={title}
            title={title}
            description={description}
            icon={icon}
            onClick={() => navigate(to)}
          />
        ))}
      </section>

      {/* Why Choose Section */}
      <section className="mt-24 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">
          Pourquoi choisir IA Admin ?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 text-left">
          <BenefitItem icon="🚀" title="Performance Optimale" description="Une interface rapide et fluide qui booste votre productivité." />
          <BenefitItem icon="🔒" title="Sécurité Renforcée" description="Vos données sont protégées grâce à des protocoles modernes." />
          <BenefitItem icon="🤖" title="Technologie IA" description="Bénéficiez d’une assistance intelligente et automatisée." />
          <BenefitItem icon="⚙️" title="Personnalisation" description="Adaptez facilement l’outil à vos besoins spécifiques." />
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-24 text-center text-gray-500 text-sm">
        © 2025 IA Admin. Tous droits réservés.
      </footer>
    </div>
  );
}

function FeatureCard({ title, description, icon, onClick }) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => { if (e.key === "Enter") onClick(); }}
      className="bg-white rounded-lg shadow p-8 flex flex-col items-center text-center hover:shadow-xl transition cursor-pointer select-none"
    >
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-semibold mb-3 text-blue-700">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function BenefitItem({ icon, title, description }) {
  return (
    <div className="flex items-start gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <h4 className="font-semibold text-gray-800 mb-1">{title}</h4>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}
