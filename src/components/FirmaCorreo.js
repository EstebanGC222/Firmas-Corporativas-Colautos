import { TEXTO_LEGAL } from '@/types/firma';

export default function FirmaCorreo({ datos }) {
  const { nombre, cargo, email, celular, sede, urlLogo } = datos;

  const htmlFirma = obtenerHTMLFirma(datos);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div dangerouslySetInnerHTML={{ __html: htmlFirma }} />
    </div>
  );
}

// Función para formatear número de teléfono a formato XXX XXX XXXX
function formatearTelefono(telefono) {
  if (!telefono) return '';
  
  // Eliminar todo excepto números
  const numeros = telefono.replace(/\D/g, '');
  
  // Formatear a XXX XXX XXXX
  if (numeros.length === 10) {
    return `${numeros.slice(0, 3)} ${numeros.slice(3, 6)} ${numeros.slice(6, 10)}`;
  }
  
  return telefono;
}

// Función para convertir emails, URLs y teléfonos en links clickeables
function hacerTextoClickeable(texto) {
  // Convertir URLs en links (PRIMERO, antes de emails para evitar conflictos)
  texto = texto.replace(/(https?:\/\/[^\s\)]+)/gi, '<a href="$1" style="color: #0066cc; text-decoration: none;" target="_blank">$1</a>');
  
  // Convertir emails en links
  texto = texto.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi, '<a href="mailto:$1" style="color: #0066cc; text-decoration: none;">$1</a>');
  
  // Convertir números de celular (10 digitos)
  texto = texto.replace(/\b(\d{10})\b/g, '<a href="tel:+57$1" style="color: #0066cc; text-decoration: none;">$1</a>');
  
  return texto;
}

export function obtenerHTMLFirma(datos) {
  const { nombre, cargo, email, celular, sede, urlLogo } = datos;
  
  const textoLegalClickeable = hacerTextoClickeable(TEXTO_LEGAL);
  const telefonoFormateado = formatearTelefono(celular);

  return `
<div style="width: 100%; text-align: center;">
  <table cellpadding="0" cellspacing="0" border="0" style="font-family: Calibri, Arial, sans-serif; color: #000000; font-size: 14px; line-height: 1.2; width: 800px; margin: 0 auto; display: inline-block; text-align: left;">
    <tr>
      <td valign="middle" style="padding-right: 15px; width: 200px; text-align: center;">
        <img src="${urlLogo || 'https://via.placeholder.com/200x100/000000/FFFFFF?text=LOGO'}" alt="Logo" style="display: inline-block; max-width: 180px; max-height: 90px; width: auto; height: auto; border: 0;" />
      </td>
      <td valign="top" style="padding-left: 0px; width: 585px;">
        <table cellpadding="0" cellspacing="0" border="0" style="font-family: Calibri, Arial, sans-serif; color: #000000; width: 100%;">
          <tr>
            <td style="padding-bottom: 0px; line-height: 1.1;">
              <span style="font-size: 25px; color: #000000; font-family: Calibri, Arial, sans-serif; line-height: 1.1;">${nombre}</span>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 6px; padding-top: 2px; line-height: 1.1;">
              <span style="font-size: 18px; color: #000000; font-family: Calibri, Arial, sans-serif; line-height: 1.1;">${cargo}</span>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 6px;">
              <div style="border-bottom: 1px solid #000000; width: 100%;"></div>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 1px; line-height: 1.1;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="font-family: Calibri, Arial, sans-serif;">
                <tr>
                  <td align="left" style="font-weight: bold; font-size: 13px; color: #000000; font-family: Calibri, Arial, sans-serif; padding-right: 15px; white-space: nowrap; line-height: 1.1;">COLAUTOS DEL CAFÉ</td>
                  <td align="right" style="font-size: 13px; color: #000000; font-family: Calibri, Arial, sans-serif; white-space: nowrap; line-height: 1.1;">Colautosdelcafe.com</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 1px; line-height: 1.1;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="font-family: Calibri, Arial, sans-serif;">
                <tr>
                  <td align="left" style="font-size: 13px; color: #000000; font-family: Calibri, Arial, sans-serif; padding-right: 15px; line-height: 1.1; white-space: nowrap;">${sede.direccion}</td>
                  <td align="right" style="font-size: 13px; color: #000000; font-family: Calibri, Arial, sans-serif; white-space: nowrap; line-height: 1.1;">${email}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 1px; line-height: 1.1;">
              <span style="font-size: 13px; color: #000000; font-family: Calibri, Arial, sans-serif; line-height: 1.1;">PBX: ${sede.pbx}</span>
            </td>
          </tr>
          ${telefonoFormateado ? `<tr>
            <td style="line-height: 1.1;">
              <span style="font-size: 13px; color: #000000; font-family: Calibri, Arial, sans-serif; line-height: 1.1;">Celular: +57 ${telefonoFormateado}</span>
            </td>
          </tr>` : ''}
        </table>
      </td>
    </tr>
    <tr>
      <td colspan="2" style="padding-top: 15px; padding-bottom: 10px;">
        <div style="border-bottom: 1px solid #000000; width: 100%;"></div>
      </td>
    </tr>
    <tr>
      <td colspan="2" style="padding-top: 10px;">
        <p style="font-size: 8px; color: #000000; text-align: justify; line-height: 1.3; margin: 0; font-family: Cambria, Georgia, serif;">
          ${textoLegalClickeable}
        </p>
      </td>
    </tr>
  </table>
</div>
  `.trim();
}
