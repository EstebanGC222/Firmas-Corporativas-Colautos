'use client';

import { useState, useRef, useEffect } from 'react';
import { SEDES } from '@/types/firma';
import FirmaCorreo, { obtenerHTMLFirma } from './FirmaCorreo';

export default function GeneradorMasivoFirmas() {
  const [firmas, setFirmas] = useState([]);
  const [urlLogo, setUrlLogo] = useState('');
  const [error, setError] = useState('');
  const [arrastrando, setArrastrando] = useState(false);
  const [textoCSV, setTextoCSV] = useState('');
  const refInputLogo = useRef(null);

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

  const manejarSubidaCSV = (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = (evento) => {
      try {
        const texto = evento.target?.result;
        parsearCSV(texto);
      } catch (err) {
        setError('Error al leer el archivo CSV');
        alert('Error al procesar el archivo CSV');
      }
    };
    lector.readAsText(archivo);
  };

  const manejarArrastrar = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const manejarArrastrarEntrar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setArrastrando(true);
  };

  const manejarArrastrarSalir = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setArrastrando(false);
  };

  const manejarSoltar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setArrastrando(false);

    const archivo = e.dataTransfer.files?.[0];
    if (archivo && archivo.name.endsWith('.csv')) {
      const lector = new FileReader();
      lector.onload = (evento) => {
        try {
          const texto = evento.target?.result;
          parsearCSV(texto);
        } catch (err) {
          setError('Error al leer el archivo CSV');
          alert('Error al procesar el archivo CSV');
        }
      };
      lector.readAsText(archivo);
    } else {
      alert('Por favor, suba un archivo CSV válido');
    }
  };

const parsearCSV = (texto) => {
  const lineas = texto.trim().split('\n').filter(linea => linea.trim().length > 0);
  if (lineas.length === 0) {
    setError('El archivo CSV está vacío');
    return;
  }

  const firmasProcesadas = [];
  
  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i].trim();
    if (!linea) continue;
    
    const valores = [];
    let valorActual = '';
    let dentroComillas = false;
    
    for (let j = 0; j < linea.length; j++) {
      const caracter = linea[j];
      if (caracter === '"') {
        dentroComillas = !dentroComillas;
      } else if (caracter === ',' && !dentroComillas) {
        valores.push(valorActual.trim());
        valorActual = '';
      } else {
        valorActual += caracter;
      }
    }
    valores.push(valorActual.trim());
    
    // Solo requiere 4 campos mínimos (celular opcional)
    if (valores.length < 4) {
      console.warn(`Línea ${i + 1} no tiene suficientes campos, se omite`);
      continue;
    }
    
    const nombre = valores[0];
    const cargo = valores[1];
    const email = valores[2];
    const celular = valores[3] || ''; // Puede estar vacío
    const codigoSede = valores[4] || valores[3]; // Si no hay celular, la sede está en posición 3

    // Si el valor parece ser una sede en vez de un número
    const esCodigoSede = (valor) => {
      return valor && (
        valor.toLowerCase().includes('pereira') || 
        valor.toLowerCase().includes('manizales') || 
        valor.toLowerCase().includes('armenia')
      );
    };

    let celularFinal = celular;
    let codigoSedeFinal = codigoSede;

    // Si celular parece ser código de sede, reorganizar
    if (esCodigoSede(celular)) {
      codigoSedeFinal = celular;
      celularFinal = '';
    }

    const codigoSedeNormalizado = codigoSedeFinal.toLowerCase().trim().replace(/\s+/g, '_');
    const sede = SEDES[codigoSedeNormalizado];

    if (!sede) {
      setError(`Sede no encontrada en línea ${i + 1}: "${codigoSedeFinal}". Códigos válidos: pereira_vitrina, pereira_taller, manizales, armenia`);
      alert(`Sede "${codigoSedeFinal}" no es válida`);
      continue;
    }

    firmasProcesadas.push({
      nombre,
      cargo,
      email,
      celular: celularFinal,
      sede,
      urlLogo
    });
  }

  if (firmasProcesadas.length === 0) {
    setError('No se pudieron procesar firmas válidas del CSV');
    alert('No se encontraron datos válidos');
    return;
  }

  setFirmas(firmasProcesadas);
  setError('');
  setTextoCSV('');
  alert(`✓ ${firmasProcesadas.length} firmas generadas correctamente`);
};


  const manejarCambioTexto = (e) => {
    setTextoCSV(e.target.value);
    setError('');
  };

  const procesarTextoCSV = () => {
    const texto = textoCSV.trim();
    if (!texto) {
      setError('Por favor ingrese datos CSV');
      return;
    }
    parsearCSV(texto);
  };

  const manejarSubidaLogo = (e) => {
    const archivo = e.target.files?.[0];
    if (archivo) {
      const lector = new FileReader();
      lector.onload = (evento) => {
        const url = evento.target?.result;
        setUrlLogo(url);
        setFirmas(prev =>
          prev.map(firma => ({ ...firma, urlLogo: url }))
        );
      };
      lector.readAsDataURL(archivo);
    }
  };

  const copiarFirma = async (datos, indice) => {
    const html = obtenerHTMLFirma(datos);

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
        alert(`✓ Firma de ${datos.nombre} copiada`);
      } else {
        await navigator.clipboard.writeText(html);
        alert(`✓ HTML de ${datos.nombre} copiado`);
      }
    } catch (err) {
      console.error('Error al copiar:', err);
      alert('✗ Error al copiar la firma');
    }
  };

  const descargarTodasHTML = () => {
    try {
      const todoHTML = firmas.map((firma, indice) => {
        return `<!-- Firma ${indice + 1}: ${firma.nombre} -->
${obtenerHTMLFirma(firma)}

`;
      }).join('\n\n');

      const htmlCompleto = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Firmas COLAUTOS</title>
</head>
<body style="margin: 20px; font-family: Arial, sans-serif;">
  <h1 style="color: #333;">Firmas Generadas - COLAUTOS</h1>
  <p style="color: #666; margin-bottom: 30px;">Total de firmas: ${firmas.length}</p>
  <hr style="border: 1px solid #ccc; margin-bottom: 30px;">
  
${todoHTML}

</body>
</html>`;

      const blob = new Blob([htmlCompleto], { type: 'text/html; charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `firmas_colautos_${new Date().getTime()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('✓ Archivo HTML descargado con imágenes embebidas');
    } catch (err) {
      console.error('Error al descargar:', err);
      alert('✗ Error al descargar el archivo HTML');
    }
  };

  return (
    <div className="space-y-6">
      {/* Carga de CSV */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900">Carga de Datos (CSV)</h2>
        </div>

        {/* Logo Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Logo (Se aplicará a todas las firmas)
          </label>
          <input
            ref={refInputLogo}
            type="file"
            accept="image/*"
            onChange={manejarSubidaLogo}
            className="hidden"
          />
          <button
            onClick={() => refInputLogo.current?.click()}
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

        {/* Zona de Drag & Drop */}
        <div
          onDragEnter={manejarArrastrarEntrar}
          onDragLeave={manejarArrastrarSalir}
          onDragOver={manejarArrastrar}
          onDrop={manejarSoltar}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors mb-6 ${
            arrastrando
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-blue-400'
          }`}
        >
          <div className="flex flex-col items-center">
            <svg className="w-16 h-16 text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-lg font-medium text-gray-900 mb-2">
              Click para subir CSV
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Formato: Nombre, Cargo, Email, Celular, codigo_sede
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={manejarSubidaCSV}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors font-medium"
            >
              Seleccionar archivo
            </label>
          </div>
        </div>

        {/* Formato esperado */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Formato esperado (ejemplo):</p>
          <div className="bg-white rounded-lg border border-gray-300 p-4 mb-4">
            <code className="text-sm text-gray-800 font-mono block leading-relaxed">
              Nombre, Cargo, Email, Celular, codigo_sede<br />
              Juan Pérez, Gerente de Ventas, juan.perez@colautos.co, 310 123 4567, pereira_vitrina
            </code>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">Códigos de sede válidos:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></span>
                <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">pereira_vitrina</code>
                <span className="text-xs">- Pereira Vitrina</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></span>
                <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">pereira_taller</code>
                <span className="text-xs">- Pereira Taller</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></span>
                <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">manizales</code>
                <span className="text-xs">- Manizales</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></span>
                <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">armenia</code>
                <span className="text-xs">- Armenia</span>
              </div>
            </div>
          </div>
        </div>

        {/* O pegar datos */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            O pega tus datos CSV aquí:
          </label>
          <textarea
            value={textoCSV}
            onChange={manejarCambioTexto}
            placeholder="Juan Pérez, Gerente de Ventas, juan.perez@colautos.co, 310 123 4567, pereira_vitrina"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
            rows={5}
          />
          <button
            type="button"
            onClick={procesarTextoCSV}
            disabled={!textoCSV.trim()}
            className={`mt-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              textoCSV.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Generar Firmas desde Texto
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Instrucciones de uso */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-2">Cómo usar tu firma:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-800">
              <li>Haz clic en "Copiar Firma" (se copiará el formato y las imágenes)</li>
              <li>Ve a la configuración de firmas de tu correo (Gmail, Outlook)</li>
              <li>Pega (Ctrl+V o Cmd+V) directamente en el cuadro de edición</li>
              <li>¡Guarda los cambios y listo!</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Lista de Firmas Generadas */}
      {firmas.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Firmas Generadas ({firmas.length})
            </h2>
            <button
              onClick={descargarTodasHTML}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descargar Todo (HTML)
            </button>
          </div>

          <div className="space-y-4">
            {firmas.map((firma, indice) => (
              <div key={indice} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-gray-900">{firma.nombre}</h3>
                    <p className="text-sm text-gray-600">{firma.cargo} - {firma.sede.nombre}</p>
                  </div>
                  <button
                    onClick={() => copiarFirma(firma, indice)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copiar
                  </button>
                </div>
                <div className="border-2 border-gray-200 rounded-lg p-3 bg-gray-50">
                  <FirmaCorreo datos={firma} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
