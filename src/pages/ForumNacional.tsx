import { useState } from 'react';
import { Users, Target, Calendar, FileText, CheckCircle } from 'lucide-react';
import Teia2026Modal from '../components/Teia2026Modal';

export default function ForumNacional() {
  const [showTeia2026Modal, setShowTeia2026Modal] = useState(false);

  return (
    <div className="space-y-0 -mx-4 sm:-mx-6 lg:-mx-8">
      <div
        className="relative bg-cover bg-center text-white py-24 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=1920")',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            V Fórum Nacional de Pontos de Cultura
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-4xl">
            O V FNPDC será realizado de 24 a 25 de março de 2026, durante a 6ª TEIA Nacional em Aracruz, Espírito Santo.
            Esta instância colegiada e representativa da rede de Pontos e Pontões de Cultura tem caráter deliberativo e
            visa propor diretrizes para a gestão pública compartilhada da Política Nacional de Cultura Viva.
          </p>
        </div>
      </div>

      <div className="bg-gray-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Pontos de Cultura pela Justiça Climática
              </h2>
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">Tema Central</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                O V FNPDC terá como tema central "Pontos de Cultura pela Justiça Climática", conectando
                cultura e sustentabilidade ambiental para os próximos 10 anos em alinhamento com a
                Estratégia Brasil 2050.
              </p>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1142950/pexels-photo-1142950.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Comunidade reunida"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            Três Eixos Estruturantes
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-100 rounded-xl p-8 hover:shadow-xl transition-shadow">
              <div className="text-4xl font-bold text-gray-400 mb-4">Eixo 1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                <span className="font-bold">Plano Nacional Cultura Viva</span> para os próximos 10 anos
              </h3>
            </div>

            <div className="bg-gray-100 rounded-xl p-8 hover:shadow-xl transition-shadow">
              <div className="text-4xl font-bold text-gray-400 mb-4">Eixo 2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                <span className="font-bold">Governança</span> da Política Nacional de Cultura Viva
              </h3>
            </div>

            <div className="bg-gray-100 rounded-xl p-8 hover:shadow-xl transition-shadow">
              <div className="text-4xl font-bold text-gray-400 mb-4">Eixo 3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                <span className="font-bold">Cultura Viva, Trabalho e Sustentabilidade</span> da Criação Artística
              </h3>
            </div>
          </div>
          <p className="text-center text-gray-600 mt-8 text-lg">
            Os Fóruns Estaduais e Regionais devem organizar debates baseados nestes três eixos, contribuindo com
            propostas que serão sistematizadas para o V FNPDC.
          </p>
        </div>
      </div>

      <div className="bg-gray-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            Objetivos Específicos
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Articulação Nacional</h3>
                  <p className="text-gray-700">
                    Promover articulação e fortalecimento dos Fóruns, Teias e Redes Estaduais de Pontos de Cultura
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Ações Transversais</h3>
                  <p className="text-gray-700">
                    Fortalecer ações em rede entre Pontos de Cultura do país e redes nacionais e internacionais
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Gestão Compartilhada</h3>
                  <p className="text-gray-700">
                    Fomentar debate sobre desafios institucionais da gestão compartilhada entre Estado e Sociedade Civil
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Agenda Política</h3>
                  <p className="text-gray-700">
                    Construir pauta política e agenda de ações do Movimento Nacional com projeção nacional e internacional
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 md:order-1">
              <div className="bg-gradient-to-br from-blue-500 to-green-500 rounded-lg p-8 text-white">
                <h3 className="text-3xl font-bold mb-4">Comissão Nacional de Pontos de Cultura</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Composição 2025</h4>
                    <p className="text-blue-50">
                      A CNPDC é composta por <strong>49 membros</strong>: 27 representantes dos GTs Estaduais e
                      Distrito Federal, e 22 representantes dos GTs Temáticos. É um colegiado autônomo de caráter
                      representativo da Rede dos Pontos e Pontões de Cultura.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Participação Social</h4>
                    <p className="text-blue-50">
                      A CNPDC participa do Conselho de Participação Social da Presidência da República, está no
                      Cadastro de Movimentos Sociais do Mercosul e é membro do CPECAF/CONDRAF.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Representatividade e Participação</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="text-5xl font-bold text-gray-900">866</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Total de Delegados</h4>
                    <p className="text-gray-600">Máximo de participantes com direito a voz e voto</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-5xl font-bold text-gray-900">810</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Eleitos nos Estados</h4>
                    <p className="text-gray-600">Representantes eleitos nos Fóruns Estaduais</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-5xl font-bold text-gray-900">56</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Delegados Natos</h4>
                    <p className="text-gray-600">49 do Pleno da CNPDC + 7 da Executiva</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-5xl font-bold text-gray-900">30</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Por Estado</h4>
                    <p className="text-gray-600">Máximo de representantes por estado e DF</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Organização e Execução
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-800 rounded-xl p-8">
              <div className="text-3xl font-bold text-gray-500 mb-4">01</div>
              <h3 className="text-2xl font-bold text-white mb-3">Promoção</h3>
              <p className="text-gray-300">CNPDC promove e organiza o V FNPDC</p>
            </div>

            <div className="bg-gray-800 rounded-xl p-8">
              <div className="text-3xl font-bold text-gray-500 mb-4">02</div>
              <h3 className="text-2xl font-bold text-white mb-3">Correalização</h3>
              <p className="text-gray-300">
                Ministério da Cultura via Secretaria de Cidadania e Diversidade Cultural
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-8">
              <div className="text-3xl font-bold text-gray-500 mb-4">03</div>
              <h3 className="text-2xl font-bold text-white mb-3">Parceria</h3>
              <p className="text-gray-300">Governo do Espírito Santo e Prefeitura Municipal de Aracruz</p>
            </div>

            <div className="bg-gray-800 rounded-xl p-8">
              <div className="text-3xl font-bold text-gray-500 mb-4">04</div>
              <h3 className="text-2xl font-bold text-white mb-3">Comunicação</h3>
              <p className="text-gray-300">Realização comunicada via culturavivanacional@gmail.com</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-12">
            <button
              onClick={() => setShowTeia2026Modal(true)}
              className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg"
            >
              Inscreva-se
            </button>
            <a
              href="https://drive.google.com/file/d/1WRhWYQUNGTuDF5SFjOu104JZzbpa70ZN/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all"
            >
              Saiba Mais
            </a>
          </div>
        </div>
      </div>

      <Teia2026Modal
        isOpen={showTeia2026Modal}
        onClose={() => setShowTeia2026Modal(false)}
      />
    </div>
  );
}
