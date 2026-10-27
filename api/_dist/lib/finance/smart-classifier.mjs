                                      
               
               
                                                             
               
                
                       
                     
                          
 

export const INITIAL_CATEGORIES                        = [
  {
    name: 'Moradia',
    slug: 'moradia',
    type: 'EXPENSE',
    icon: 'home',
    color: '#0F766E',
    isFixedCost: true,
    keywords: ['aluguel', 'condominio', 'condomínio', 'energia', 'luz', 'enel', 'cpfl', 'agua', 'água', 'sabesp', 'gas', 'gás', 'internet', 'fibra', 'vivo', 'claro', 'iptu'],
    subcategories: ['Aluguel e Condomínio', 'Energia e Água', 'Internet e TV', 'Manutenção Doméstica'],
  },
  {
    name: 'Alimentação',
    slug: 'alimentacao',
    type: 'EXPENSE',
    icon: 'utensils',
    color: '#EA580C',
    isFixedCost: false,
    keywords: ['supermercado', 'mercado', 'atacadao', 'assai', 'carrefour', 'pao de acucar', 'padaria', 'restaurante', 'ifood', 'rappi', 'lanche', 'cafe', 'café', 'hortifruti', 'açougue'],
    subcategories: ['Supermercado', 'Restaurantes e Delivery', 'Padaria e Café', 'Feira e Hortifruti'],
  },
  {
    name: 'Transporte',
    slug: 'transporte',
    type: 'EXPENSE',
    icon: 'car',
    color: '#2563EB',
    isFixedCost: false,
    keywords: ['uber', '99app', '99pop', 'taxi', 'táxi', 'combustivel', 'combustível', 'gasolina', 'etanol', 'posto', 'ipiranga', 'shell', 'metro', 'metrô', 'onibus', 'ônibus', 'bilhete unico', 'pedagio', 'pedágio', 'estacionamento', 'sem parar'],
    subcategories: ['Combustível', 'Apps de Mobilidade', 'Transporte Público', 'Manutenção e Estacionamento'],
  },
  {
    name: 'Saúde',
    slug: 'saude',
    type: 'EXPENSE',
    icon: 'heart-pulse',
    color: '#DC2626',
    isFixedCost: true,
    keywords: ['farmacia', 'farmácia', 'drogaria', 'drogasil', 'raia', 'pacheco', 'plano de saude', 'unimed', 'amil', 'bradesco saude', 'consulta', 'medico', 'médico', 'dentista', 'exame', 'terapia', 'psicologo', 'academia'],
    subcategories: ['Plano de Saúde', 'Farmácia e Medicamentos', 'Consultas e Exames', 'Terapia e Bem-estar'],
  },
  {
    name: 'Educação',
    slug: 'educacao',
    type: 'EXPENSE',
    icon: 'graduation-cap',
    color: '#7C3AED',
    isFixedCost: true,
    keywords: ['faculdade', 'escola', 'colegio', 'colégio', 'curso', 'alura', 'udemy', 'livro', 'livraria', 'material escolar', 'idiomas', 'ingles', 'inglês', 'pos-graduacao'],
    subcategories: ['Mensalidade Escolar/Faculdade', 'Cursos e Certificações', 'Livros e Materiais', 'Idiomas'],
  },
  {
    name: 'Lazer',
    slug: 'lazer',
    type: 'EXPENSE',
    icon: 'palmtree',
    color: '#D97706',
    isFixedCost: false,
    keywords: ['cinema', 'ingresso', 'show', 'teatro', 'viagem', 'hotel', 'airbnb', 'passagem', 'bar', 'passeio', 'parque', 'jogos', 'steam', 'playstation'],
    subcategories: ['Viagens e Hospedagem', 'Cinema e Shows', 'Bares e Passeios', 'Hobbies e Jogos'],
  },
  {
    name: 'Assinaturas',
    slug: 'assinaturas',
    type: 'EXPENSE',
    icon: 'repeat',
    color: '#9333EA',
    isFixedCost: true,
    keywords: ['netflix', 'spotify', 'amazon prime', 'disney', 'hbo', 'max', 'globoplay', 'youtube premium', 'icloud', 'google one', 'chatgpt', 'clube', 'mensalidade app'],
    subcategories: ['Streaming de Vídeo/Música', 'Nuvem e Software', 'Clubes de Assinatura'],
  },
  {
    name: 'Compras',
    slug: 'compras',
    type: 'EXPENSE',
    icon: 'shopping-bag',
    color: '#DB2777',
    isFixedCost: false,
    keywords: ['mercado livre', 'shopee', 'amazon', 'magalu', 'magazine luiza', 'roupa', 'renner', 'riachuelo', 'cea', 'calçado', 'tenis', 'eletronico', 'presente', 'perfume'],
    subcategories: ['Vestuário e Calçados', 'Eletrônicos', 'Casa e Decoração', 'Presentes'],
  },
  {
    name: 'Família',
    slug: 'familia',
    type: 'EXPENSE',
    icon: 'users',
    color: '#0891B2',
    isFixedCost: false,
    keywords: ['creche', 'baba', 'babá', 'mesada', 'fralda', 'brinquedo', 'ajuda familiar', 'cuidadores'],
    subcategories: ['Filhos e Cuidados', 'Apoio Familiar', 'Mesada'],
  },
  {
    name: 'Pets',
    slug: 'pets',
    type: 'EXPENSE',
    icon: 'paw-print',
    color: '#CA8A04',
    isFixedCost: false,
    keywords: ['petshop', 'petz', 'cobasi', 'racao', 'ração', 'veterinario', 'veterinário', 'banho e tosa', 'vacina pet'],
    subcategories: ['Ração e Petiscos', 'Veterinário e Vacinas', 'Banho e Tosa'],
  },
  {
    name: 'Impostos',
    slug: 'impostos',
    type: 'EXPENSE',
    icon: 'landmark',
    color: '#475569',
    isFixedCost: true,
    keywords: ['imposto', 'irpf', 'darf', 'das', 'mei', 'simples nacional', 'ipva', 'licenciamento', 'taxa prefeitura', 'iof'],
    subcategories: ['IPVA e Licenciamento', 'DAS MEI / Autônomo', 'IRPF e Taxas Públicas'],
  },
  {
    name: 'Dívidas',
    slug: 'dividas',
    type: 'DEBT_PAYMENT',
    icon: 'credit-card',
    color: '#B91C1C',
    isFixedCost: true,
    keywords: ['parcela emprestimo', 'empréstimo', 'financiamento', 'acordo', 'renegociacao', 'renegociação', 'quitacao', 'quitação', 'juros', 'consorcio'],
    subcategories: ['Empréstimos Pessoais', 'Financiamento Imobiliário/Veículo', 'Acordos e Renegociações'],
  },
  {
    name: 'Investimentos',
    slug: 'investimentos',
    type: 'INVESTMENT',
    icon: 'trending-up',
    color: '#059669',
    isFixedCost: false,
    keywords: ['tesouro direto', 'cdb', 'lci', 'lca', 'fundo imobiliario', 'fii', 'acoes', 'ações', 'reserva de emergencia', 'caixinha', 'previdencia', 'aporte'],
    subcategories: ['Reserva de Emergência', 'Renda Fixa (Tesouro/CDB)', 'Renda Variável e FIIs', 'Previdência'],
  },
  {
    name: 'Salário',
    slug: 'salario',
    type: 'INCOME',
    icon: 'briefcase',
    color: '#16A34A',
    isFixedCost: true,
    keywords: ['salario', 'salário', 'pagamento empresa', 'holerite', 'adiantamento salarial', 'decimo terceiro', '13o', 'ferias', 'férias', 'plr', 'bonus', 'bônus', 'pro-labore'],
    subcategories: ['Salário Líquido', '13º Salário e Férias', 'PLR e Bônus'],
  },
  {
    name: 'Freelance',
    slug: 'freelance',
    type: 'INCOME',
    icon: 'laptop',
    color: '#0D9488',
    isFixedCost: false,
    keywords: ['freelance', 'freela', 'projeto', 'consultoria', 'nota fiscal servico', 'nfse', 'cliente', 'honorarios', 'honorários', 'comissao', 'comissão'],
    subcategories: ['Projetos e Consultoria', 'Comissões', 'Serviços Autônomos'],
  },
  {
    name: 'Outros',
    slug: 'outros',
    type: 'EXPENSE',
    icon: 'more-horizontal',
    color: '#64748B',
    isFixedCost: false,
    keywords: ['diversos', 'outros', 'ajuste', 'tarifa bancaria'],
    subcategories: ['Despesas Gerais', 'Tarifas Bancárias'],
  },
];

/**
 * Normaliza texto removendo acentos e pontuação para comparação semântica local.
 */
export function normalizeForClassification(text        )         {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Classifica uma transação de forma inteligente com base em:
 * 1) Regras aprendidas localmente das correções manuais do próprio usuário (prioridade máxima).
 * 2) Dicionário de palavras-chave das categorias do usuário.
 *
 * IMPORTANTE (LGPD): O aprendizado ocorre exclusivamente no perfil isolado do próprio usuário
 * (`learnedCategoryRulesJson`), sem compartilhar ou treinar modelos externos sem consentimento explícito.
 */
export function classifyTransactionDescription(params   
                      
                                                                            
                                                                                  
 )   
                       
                                        
                                                                           
  {
  const normalizedDesc = normalizeForClassification(params.description);
  if (!normalizedDesc) {
    return {
      categorySlug: 'outros',
      confidence: 'LOW',
      reason: 'DEFAULT_FALLBACK',
    };
  }

  // 1. Verifica preferência aprendida diretamente de correções anteriores do usuário
  if (params.learnedRules[normalizedDesc]) {
    return {
      categorySlug: params.learnedRules[normalizedDesc],
      confidence: 'HIGH',
      reason: 'USER_LEARNED_PREFERENCE',
    };
  }

  const tokens = normalizedDesc.split(' ').filter((t) => t.length >= 3);
  for (const token of tokens) {
    if (params.learnedRules[token]) {
      return {
        categorySlug: params.learnedRules[token],
        confidence: 'HIGH',
        reason: 'USER_LEARNED_PREFERENCE',
      };
    }
  }

  // 2. Verifica palavras-chave das categorias
  const categories = params.availableCategories || INITIAL_CATEGORIES;
  for (const cat of categories) {
    for (const kw of cat.keywords) {
      const normKw = normalizeForClassification(kw);
      if (normKw && normalizedDesc.includes(normKw)) {
        return {
          categorySlug: cat.slug,
          confidence: 'MEDIUM',
          reason: 'KEYWORD_MATCH',
        };
      }
    }
  }

  return {
    categorySlug: 'outros',
    confidence: 'LOW',
    reason: 'DEFAULT_FALLBACK',
  };
}

/**
 * Registra localmente o aprendizado quando o usuário corrige manualmente a categoria de uma transação.
 */
export function learnCategoryCorrection(
  currentLearnedRules                        ,
  description        ,
  correctedCategorySlug        
)                         {
  const updated = { ...currentLearnedRules };
  const normalizedDesc = normalizeForClassification(description);
  if (!normalizedDesc) return updated;

  updated[normalizedDesc] = correctedCategorySlug;

  // Extrai o termo principal (ex: nome do estabelecimento) para transações semelhantes
  const stopWords = new Set(['pagamento', 'compra', 'pix', 'debito', 'credito', 'no', 'na', 'de', 'do', 'da', 'para', 'em', 'parcela']);
  const meaningfulTokens = normalizedDesc
    .split(' ')
    .filter((t) => t.length >= 4 && !stopWords.has(t) && !/^\d+$/.test(t));

  if (meaningfulTokens.length > 0) {
    updated[meaningfulTokens[0]] = correctedCategorySlug;
  }

  return updated;
}
