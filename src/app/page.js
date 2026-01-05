'use client';

import { useState } from 'react';
import GeneradorFirma from '@/components/GeneradorFirma';
import GeneradorMasivoFirmas from '@/components/GeneradorMasivoFirmas';

export default function PaginaPrincipal() {
  const [pestanaActiva, setPestanaActiva] = useState('individual');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Encabezado */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-black mb-2">
            Generador de Firmas Corporativas
          </h1>
          <p className="text-gray-600">COLAUTOS DEL CAFÉ</p>
        </div>

        {/* Pestañas con iconos */}
        <div className="mb-6">
          <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200 w-fit mx-auto">
            <button
              onClick={() => setPestanaActiva('individual')}
              className={`px-6 py-3 rounded-md flex items-center gap-2 transition-all ${
                pestanaActiva === 'individual'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Individual
            </button>
            <button
              onClick={() => setPestanaActiva('masivo')}
              className={`px-6 py-3 rounded-md flex items-center gap-2 transition-all ${
                pestanaActiva === 'masivo'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Masivo
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div>
          {pestanaActiva === 'individual' ? (
            <GeneradorFirma />
          ) : (
            <GeneradorMasivoFirmas />
          )}
        </div>
      </div>
    </div>
  );
}
