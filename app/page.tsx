'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MapPin, Zap, Shield, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function HomePage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Check if user is already authenticated
    const isAuthenticated = localStorage.getItem('authenticated');
    if (isAuthenticated) {
      router.push('/discover');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 via-white to-purple-100/40" />
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center p-6 z-10">
        <div className={`max-w-md w-full text-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          {/* Logo */}
          <div className="group mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300 shadow-2xl shadow-blue-500/25">
              <Heart className="w-10 h-10 text-white fill-current animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-6xl font-black mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            HotSpot
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 font-light tracking-wide">
            Pronađi stvarne veze na stvarnim mestima
          </p>

          {/* CTA Buttons */}
          <div className="space-y-4">
            <Button
              onClick={() => router.push('/login')}
              className="w-full text-lg py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-xl shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:shadow-blue-500/40"
            >
              Počni odmah
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button
              onClick={() => router.push('/register')}
              variant="ghost"
              className="w-full text-lg py-4 text-gray-700 border-2 border-gray-300 hover:bg-gray-50 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:border-gray-400"
            >
              Napravi nalog
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-12 flex items-center justify-center space-x-8 text-gray-500 text-sm">
            <div className="flex items-center group">
              <Sparkles className="w-4 h-4 mr-2 group-hover:text-blue-500 transition-colors" />
              <span>10k+ korisnika</span>
            </div>
            <div className="flex items-center group">
              <Heart className="w-4 h-4 mr-2 group-hover:text-blue-500 transition-colors" />
              <span>1M+ poklapanja</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-6 z-10 bg-white/70 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">
              Zašto HotSpot?
            </h2>
            <p className="text-xl text-gray-600 font-light">
              Upoznavanje postaje stvarno
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg text-center p-8 hover:shadow-xl hover:border-blue-300 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Uživo lokacije</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Vidi samo ljude koji su trenutno na istom mestu kao ti. Bez lažnih profila.
              </p>
            </Card>

            <Card className="group bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg text-center p-8 hover:shadow-xl hover:border-blue-300 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Brza poklapanja</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Swipe, poklapaj se i upoznaj odmah. Bez nedeljnih četova.
              </p>
            </Card>

            <Card className="group bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg text-center p-8 hover:shadow-xl hover:border-blue-300 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">100% bezbedno</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Verifikovani profili i privatnost su nam prioritet.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="relative py-20 px-6 z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">
              Kako funkcioniše
            </h2>
            <p className="text-xl text-gray-600 font-light">
              Tri jednostavna koraka
            </p>
          </div>

          <div className="space-y-8">
            {[
              { number: "01", title: "Prijaviš se", desc: "Skeniraj QR kod ili se automatski prijaviš na mestu" },
              { number: "02", title: "Swipe-uješ", desc: "Otkrij druge goste i swipe-uj desno ako te neko interesuje" },
              { number: "03", title: "Upoznaš se", desc: "Kada se poklapite, upoznajte se odmah!" }
            ].map((step, i) => (
              <div key={i} className="group flex items-center space-x-6 p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-xl hover:border-blue-300 transition-all duration-300">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{step.title}</h3>
                  <p className="text-gray-600 font-light">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6 z-10 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Spreman za prava upoznavanja?
          </h2>
          <p className="text-xl text-blue-100 mb-10 font-light">
            Pridruži se HotSpot zajednici danas
          </p>

          <Button
              onClick={() => router.push('/login')}
              className="text-blue-600 hover:bg-blue-50 font-semibold text-lg py-4 px-10 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105"
          >
            Započni avanturu
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200 bg-white/90 backdrop-blur-sm py-8 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-6 h-6 text-blue-500 fill-current mr-2" />
            <span className="font-bold text-xl text-gray-800">HotSpot</span>
          </div>
          
          <p className="text-gray-600 mb-6 font-light">
            Aplikacija za upoznavanje na pravim mestima
          </p>
          
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-700 transition-colors">Privatnost</a>
            <a href="#" className="hover:text-gray-700 transition-colors">Uslovi</a>
            <a href="#" className="hover:text-gray-700 transition-colors">Kontakt</a>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-400">
            © 2024 HotSpot. Sva prava zadržana.
          </div>
        </div>
      </footer>
    </div>
  );
}