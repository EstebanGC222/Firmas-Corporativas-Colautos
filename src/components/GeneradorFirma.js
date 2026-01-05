'use client';

import { useState, useRef, useEffect } from 'react';
import { SEDES } from '@/types/firma';
import FirmaCorreo, { obtenerHTMLFirma } from './FirmaCorreo';

export default function GeneradorFirma() {
  const [datosFirma, setDatosFirma] = useState({
    nombre: '',
    apellidos: '',
    cargo: '',
    email: '',
    telefono: '',
    codigoSede: 'pereira_vitrina'
  });
  const [urlLogo, setUrlLogo] = useState('');
  const [copiado, setCopiado] = useState(false);
  const refInputArchivo = useRef(null);

  // Convertir logo por defecto a base64 al cargar
  useEffect(() => {
    const convertirLogoDefecto = async () => {
      try {
        const response = await fetch('/logo-colautos.png');
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setUrlLogo(reader.result);
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error('Error cargando logo por defecto:', err);
        setUrlLogo('/logo-colautos.png');
      }
    };
    
    convertirLogoDefecto();
  }, []);

  const formatearTelefonoInput = (valor) => {
    // Eliminar todo excepto números
    const numeros = valor.replace(/\D/g, '');
    
    // Limitar a 10 dígitos
    const numeroLimitado = numeros.slice(0, 10);
    
    // Formatear según la longitud
    if (numeroLimitado.length <= 3) {
      return numeroLimitado;
    } else if (numeroLimitado.length <= 6) {
      return `${numeroLimitado.slice(0, 3)} ${numeroLimitado.slice(3)}`;
    } else {
      return `${numeroLimitado.slice(0, 3)} ${numeroLimitado.slice(3, 6)} ${numeroLimitado.slice(6)}`;
    }
  };

  const manejarCambioInput = (e) => {
    const { name, value } = e.target;
    
    if (name === 'telefono') {
      const telefonoFormateado = formatearTelefonoInput(value);
      setDatosFirma(prev => ({ ...prev, [name]: telefonoFormateado }));
    } else {
      setDatosFirma(prev => ({ ...prev, [name]: value }));
    }
  };

  const manejarSubidaImagen = (e) => {
    const archivo = e.target.files?.[0];
    if (archivo) {
      const lector = new FileReader();
      lector.onload = (evento) => {
        setUrlLogo(evento.target?.result);
      };
      lector.readAsDataURL(archivo);
    }
  };

  // celular NO es obligatorio
  const esFormularioValido = datosFirma.nombre && datosFirma.apellidos && datosFirma.cargo && datosFirma.email;

  const nombreCompleto = `${datosFirma.nombre} ${datosFirma.apellidos}`.trim();

  const datosParaFirma = esFormularioValido
    ? {
        nombre: nombreCompleto,
        cargo: datosFirma.cargo,
        email: datosFirma.email,
        celular: datosFirma.telefono, // Puede estar vacío
        sede: SEDES[datosFirma.codigoSede],
        urlLogo
      }
    : null;

  const copiarAlPortapapeles = async () => {
    if (!datosParaFirma) return;

    const html = obtenerHTMLFirma(datosParaFirma);

    try {
      const divTemporal = document.createElement('div');
      divTemporal.innerHTML = html;
      divTemporal.style.position = 'absolute';
      divTemporal.style.left = '-9999px';
      document.body.appendChild(divTemporal);

      const rango = document.createRange();
      rango.selectNodeContents(divTemporal);
      const seleccion = window.getSelection();
      seleccion?.removeAllRanges();
      seleccion?.addRange(rango);

      const exitoso = document.execCommand('copy');
      
      document.body.removeChild(divTemporal);

      if (exitoso) {
        setCopiado(true);
        alert('✓ Firma copiada al portapapeles');
        setTimeout(() => setCopiado(false), 2000);
      } else {
        await navigator.clipboard.writeText(html);
        alert('✓ HTML copiado (pegar en modo HTML)');
      }
    } catch (err) {
      console.error('Error al copiar:', err);
      alert('✗ Error al copiar la firma');
    }
  };

  return (
    <div className="space-y-8">
      {/* Formulario */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900">Datos del Empleado</h2>
        </div>

        <div className="space-y-4">
          {/* Nombre y apellidos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium mb-2 text-gray-700">
                Nombre
              </label>
              <input
                id="nombre"
                type="text"
                name="nombre"
                value={datosFirma.nombre}
                onChange={manejarCambioInput}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ana"
              />
            </div>
            <div>
              <label htmlFor="apellidos" className="block text-sm font-medium mb-2 text-gray-700">
                Apellidos
              </label>
              <input
                id="apellidos"
                type="text"
                name="apellidos"
                value={datosFirma.apellidos}
                onChange={manejarCambioInput}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="García"
              />
            </div>
          </div>

          {/* Cargo / Puesto */}
          <div>
            <label htmlFor="cargo" className="block text-sm font-medium mb-2 text-gray-700">
              Cargo / Puesto
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                id="cargo"
                type="text"
                name="cargo"
                value={datosFirma.cargo}
                onChange={manejarCambioInput}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Gerente de Proyectos"
              />
            </div>
          </div>

          {/* Email y Teléfono */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={datosFirma.email}
                onChange={manejarCambioInput}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ana.garcia@colautos.co"
              />
            </div>
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium mb-2 text-gray-700">
                Teléfono <span className="text-gray-400 font-normal">(Opcional)</span>
              </label>
              <input
                id="telefono"
                type="text"
                name="telefono"
                value={datosFirma.telefono}
                onChange={manejarCambioInput}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="310 123 4567"
              />
            </div>
          </div>

          {/* Sede */}
          <div>
            <label htmlFor="codigoSede" className="block text-sm font-medium mb-2 text-gray-700">
              Sede
            </label>
            <select
              id="codigoSede"
              name="codigoSede"
              value={datosFirma.codigoSede}
              onChange={manejarCambioInput}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {Object.values(SEDES).map(sede => (
                <option key={sede.codigo} value={sede.codigo}>
                  {sede.nombre}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              📍 {SEDES[datosFirma.codigoSede].direccion}
            </p>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Logo
            </label>
            <input
              ref={refInputArchivo}
              type="file"
              accept="image/*"
              onChange={manejarSubidaImagen}
              className="hidden"
            />
            <button
              onClick={() => refInputArchivo.current?.click()}
              type="button"
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {urlLogo && !urlLogo.includes('/logo-colautos.png') ? 'Cambiar Logo' : 'Subir Logo'}
            </button>
            {urlLogo && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <img src={urlLogo} alt="Vista previa del logo" className="h-16 object-contain mx-auto" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vista Previa y Copiar */}
      <div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Vista Previa</h2>
            <button
              onClick={copiarAlPortapapeles}
              disabled={!esFormularioValido}
              className={`px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all font-medium ${
                esFormularioValido
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {copiado ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  ¡Copiado!
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copiar Firma
                </>
              )}
            </button>
          </div>

          {esFormularioValido && datosParaFirma ? (
            <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
              <FirmaCorreo datos={datosParaFirma} />
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">Complete los campos obligatorios para ver la vista previa</p>
            </div>
          )}
        </div>

        {esFormularioValido && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Instrucciones:</strong> Haga clic en "Copiar Firma" y luego pegue directamente en su cliente de correo (Outlook, Gmail, etc.) como firma HTML.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
