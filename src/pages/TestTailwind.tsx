import React from 'react';

const TestTailwind: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            ✅ Tailwind CSS Funcionando!
          </h1>
          <p className="text-gray-600 text-lg">
            Se você está vendo cores, sombras e layout bonito, o Tailwind está configurado corretamente.
          </p>
        </div>

        {/* Cards de teste */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-500 text-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-2">🎨</div>
            <h3 className="text-xl font-bold mb-2">Cores</h3>
            <p className="text-blue-100">Cores do Tailwind aplicadas</p>
          </div>

          <div className="bg-green-500 text-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-2">📐</div>
            <h3 className="text-xl font-bold mb-2">Layout</h3>
            <p className="text-green-100">Grid e flexbox funcionando</p>
          </div>

          <div className="bg-purple-500 text-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-2">✨</div>
            <h3 className="text-xl font-bold mb-2">Efeitos</h3>
            <p className="text-purple-100">Sombras e transições ok</p>
          </div>
        </div>

        {/* Botões */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Componentes</h2>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Botão Primary
            </button>
            <button className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">
              Botão Outline
            </button>
            <button className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors">
              Botão Secondary
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Formulário</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome
              </label>
              <input
                type="text"
                placeholder="Digite seu nome"
                className="w-full h-12 px-4 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                className="w-full h-12 px-4 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Badges de Status</h2>
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Sucesso
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Info
            </span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              Aviso
            </span>
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
              Erro
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestTailwind;