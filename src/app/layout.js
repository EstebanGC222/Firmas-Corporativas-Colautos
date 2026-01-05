import './globals.css';

export const metadata = {
  title: 'Generador de Firmas Corporativas - COLAUTOS DEL CAFÉ',
  description: 'Generador de firmas corporativas para empleados de Colautos del Café',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
