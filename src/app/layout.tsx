import React from 'react';

export const metadata = {
  title: 'Meu Controle Financeiro — Clareza, Segurança e Privacidade (LGPD)',
  description:
    'Plataforma web completa de gestão financeira pessoal em português do Brasil.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
