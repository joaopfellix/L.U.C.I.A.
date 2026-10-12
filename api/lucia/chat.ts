const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || '';

const LUCIA_BASE_SYSTEM_INSTRUCTION = `Você é L.U.C.I.A. (Logic Unit for Computing & Intelligent Automation).

Significado do seu nome: Logic Unit for Computing & Intelligent Automation.

QUANDO PERGUNTAREM SEU NOME OU O SIGNIFICADO DE L.U.C.I.A., RESPONDA EXATAMENTE COM A SEGUINTE FRASE:
"Meu nome é L.U.C.I.A. (Logic Unit for Computing & Intelligent Automation). Fui criada para transformar inteligência artificial em soluções práticas, ajudando pessoas e empresas a resolver problemas, executar tarefas autorizadas, automatizar processos, economizar tempo e reduzir erros. Meu objetivo não é apenas responder perguntas, mas ajudar a transformar ideias em resultados concretos."

DIRETRIZES DE IDENTIDADE E COMPORTAMENTO:
1. Inteligente, profissional, altamente objetiva e prestativa.
2. Comunicação fluida e natural em português brasileiro (PT-BR).
3. Respostas claras, estruturadas, pragmáticas e focadas em soluções práticas e acionáveis.
4. NUNCA invente resultados nem afirme ter executado ações externas ou alterações de infraestrutura que não executou no sistema.
5. Se uma funcionalidade ainda não estiver disponível ou conectada, informe com transparência e clareza.
6. Estruturação visual: Utilize Markdown profissional com títulos claros, listas ordenadas, tópicos e blocos de código quando apropriado.
7. Ao propor soluções de automação ou tarefas, estruture em passos: Diagnóstico, Plano de Ação, Pré-requisitos e Execução.`;

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Utilize POST.' });
  }

  try {
    const { message, history = [], memories = [], mode = 'default', isPro = false } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'A mensagem do usuário é obrigatória.' });
    }

    if (!GROQ_API_KEY) {
      return res.status(500).json({
        error: 'Chave de API não configurada na Vercel.',
      });
    }

    // Modelo gratuito ultrarrápido: Llama 3.3 70B Versatile
    const modelToUse = isPro ? 'llama-3.3-70b-versatile' : 'llama-3.1-8b-instant';

    // Memória contextual
    let memoryContextString = '';
    if (Array.isArray(memories) && memories.length > 0) {
      const memoryLines = memories.map(
        (m: any, idx: number) => `[Memória #${idx + 1} | ${m.category || 'Geral'}] ${m.title}: ${m.content}`
      );
      memoryContextString = `\n\nMEMÓRIA PERSISTENTE E DIRETRIZES DA EMPRESA/USUÁRIO DISPONÍVEIS:\n${memoryLines.join('\n')}\n(Utilize estas informações de memória para personalizar e contextualizar suas respostas).`;
    }

    // Instruções de modo ativo
    let modeInstruction = '';
    if (mode === 'planner') {
      modeInstruction = '\n\nMODO ATIVO: Planejamento Estratégico. Dê ênfase a cronogramas, etapas detalhadas e métricas.';
    } else if (mode === 'automation') {
      modeInstruction = '\n\nMODO ATIVO: Automação e Processos. Dê ênfase a gatilhos, APIs e eliminação de trabalho manual.';
    } else if (mode === 'technical') {
      modeInstruction = '\n\nMODO ATIVO: Análise Técnica e Arquitetura. Foque em boas práticas, segurança e estabilidade.';
    }

    const fullInstruction = `${LUCIA_BASE_SYSTEM_INSTRUCTION}${memoryContextString}${modeInstruction}`;

    // Montar mensagens no formato padrão
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: fullInstruction },
    ];

    if (Array.isArray(history)) {
      for (const item of history.slice(-10)) {
        if (item && item.text && item.role) {
          messages.push({
            role: item.role === 'model' || item.role === 'assistant' ? 'assistant' : 'user',
            content: item.text,
          });
        }
      }
    }

    messages.push({
      role: 'user',
      content: message,
    });

    // Chamada direta à API do Groq via fetch (sem precisar instalar nenhum pacote extra)
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: messages,
        temperature: 0.6,
        max_tokens: 2048,
      }),
    });

    if (!groqResponse.ok) {
      const errData = await groqResponse.json().catch(() => ({}));
      throw new Error(JSON.stringify(errData));
    }

    const data = await groqResponse.json();
    const replyText = data.choices?.[0]?.message?.content || '';

    return res.status(200).json({
      text: replyText,
      model: modelToUse,
      mode,
      isPro,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Erro na API da L.U.C.I.A.:', error);
    return res.status(500).json({
      error: 'Falha ao processar solicitação.',
      details: error?.message || String(error),
    });
  }
}
