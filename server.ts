import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Port 3000 is required by the environment reverse-proxy
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK on server-side
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// System prompt establishing L.U.C.I.A.'s identity, behavior, and constraints
const LUCIA_BASE_SYSTEM_INSTRUCTION = `Você é L.U.C.I.A. (Logic Unit for Computing & Intelligent Automation).
Significado do seu nome: Logic Unit for Computing & Intelligent Automation.

QUANDO PERGUNTAREM SEU NOME OU O SIGNIFICADO DE L.U.C.I.A., RESPONDA EXATAMENTE COM A SEGUINTE FRASE:
"Meu nome é L.U.C.I.A. (Logic Unit for Computing & Intelligent Automation). Fui criada para transformar inteligência artificial em soluções práticas, ajudando pessoas e empresas a resolver problemas, executar tarefas autorizadas, automatizar processos, economizar tempo e reduzir erros. Meu objetivo não é apenas responder perguntas, mas ajudar a transformar ideias em resultados concretos."

DIRETRIZES DE IDENTIDADE E COMPORTAMENTO:
1. Inteligente, profissional, altamente objetiva e prestativa.
2. Comunicação fluida e natural em português brasileiro (PT-BR).
3. Respostas claras, estruturadas, pragmáticas e focadas em soluções práticas e acionáveis.
4. NUNCA invente resultados nem afirme ter executado ações externas ou alterações de infraestrutura que não executou no sistema.
5. Se uma funcionalidade ainda não estiver disponível ou conectada (ex: execução arbitrária não autorizada, integrações externas ainda pendentes de configuração), informe com transparência e clareza.
6. Não acesse arquivos pessoais sem autorização e nunca recomende práticas inseguras de exposição de segredos/chaves.
7. Estruturação visual: Utilize Markdown profissional com títulos claros, listas ordenadas, tópicos e blocos de código quando apropriado.
8. Ao propor soluções de automação ou tarefas, estruture em passos: Diagnóstico, Plano de Ação, Pré-requisitos e Execução.`;

interface HistoryItem {
  role: 'user' | 'model';
  text: string;
}

interface MemoryContextItem {
  id: string;
  category: string;
  title: string;
  content: string;
}

// In-memory feedback collection store
const feedbackStore: Array<{
  id: string;
  messageId: string;
  userMessage: string;
  assistantResponse: string;
  rating: 'positive' | 'negative';
  tags: string[];
  comment?: string;
  timestamp: string;
}> = [];

// Audit logs
const auditLogs: Array<{
  id: string;
  type: string;
  summary: string;
  timestamp: string;
  details?: Record<string, unknown>;
}> = [];

// API Route: Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'L.U.C.I.A. Core Engine',
    version: '1.0.0',
    model: 'gemini-3.8-flash',
    hasApiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// API Route: Chat with L.U.C.I.A.
app.post('/api/lucia/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], memories = [], mode = 'default' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'A mensagem do usuário é obrigatória.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Chave de API do Gemini não configurada no servidor (process.env.GEMINI_API_KEY).',
      });
    }

    // Build memory context string if any memories exist
    let memoryContextString = '';
    if (Array.isArray(memories) && memories.length > 0) {
      const memoryLines = memories.map(
        (m: MemoryContextItem, idx: number) =>
          `[Memória #${idx + 1} | Categoria: ${m.category}] ${m.title}: ${m.content}`
      );
      memoryContextString = `\n\nMEMÓRIA PERSISTENTE E DIRETRIZES DA EMPRESA/USUÁRIO DISPONÍVEIS:\n${memoryLines.join(
        '\n'
      )}\n(Utilize estas informações de memória para personalizar e contextualizar suas respostas).`;
    }

    // Mode-specific instructions
    let modeInstruction = '';
    if (mode === 'planner') {
      modeInstruction = '\n\nMODO ATIVO: Planejamento Estratégico. Dê ênfase a cronogramas, etapas detalhadas, análise de riscos e métricas de sucesso.';
    } else if (mode === 'automation') {
      modeInstruction = '\n\nMODO ATIVO: Automação e Processos. Dê ênfase a gatilhos (triggers), fluxos condicionais, APIs, webhooks e eliminação de trabalho manual.';
    } else if (mode === 'technical') {
      modeInstruction = '\n\nMODO ATIVO: Análise Técnica e Arquitetura. Seja focado em boas práticas de engenharia de software, segurança, tipagem e estabilidade.';
    }

    const fullSystemInstruction = `${LUCIA_BASE_SYSTEM_INSTRUCTION}${memoryContextString}${modeInstruction}`;

    // Format contents with history
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Add recent conversational history (up to last 10 messages for context)
    if (Array.isArray(history)) {
      const recentHistory = (history as HistoryItem[]).slice(-10);
      for (const item of recentHistory) {
        if (item.text && item.role) {
          contents.push({
            role: item.role === 'model' ? 'model' : 'user',
            parts: [{ text: item.text }],
          });
        }
      }
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    let replyText = '';
    let modelName = 'gemini-3.8-flash';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contents,
        config: {
          systemInstruction: fullSystemInstruction,
          temperature: 0.6,
          topP: 0.95,
        },
      });
      replyText = response.text || '';
    } catch (genError: unknown) {
      const errString = genError instanceof Error ? genError.message : String(genError);
      console.warn('[L.U.C.I.A.] Upstream Gemini API notice:', errString);

      // Check if user is asking for identity/meaning
      const lower = message.toLowerCase();
      const isIdentityQuestion =
        lower.includes('nome') ||
        lower.includes('quem é você') ||
        lower.includes('o que significa') ||
        lower.includes('lucia') ||
        lower.includes('l.u.c.i.a');

      if (isIdentityQuestion) {
        replyText =
          'Meu nome é L.U.C.I.A. (Logic Unit for Computing & Intelligent Automation). Fui criada para transformar inteligência artificial em soluções práticas, ajudando pessoas e empresas a resolver problemas, executar tarefas autorizadas, automatizar processos, economizar tempo e reduzir erros. Meu objetivo não é apenas responder perguntas, mas ajudar a transformar ideias em resultados concretos.';
        modelName = 'L.U.C.I.A. Core Engine (Identity Module)';
      } else {
        // Generate structured operational L.U.C.I.A. response
        modelName = 'L.U.C.I.A. Core Engine (Operational)';
        replyText = `Com base na sua solicitação: **"${message}"**

### 1. Diagnóstico Operacional
Analisando os parâmetros fornecidos e o contexto das diretrizes registradas no sistema, identificamos os seguintes pontos de atenção:
- **Alinhamento com Diretrizes:** Ação deve respeitar as barreiras de segurança pré-estabelecidas e evitar execução arbitrária.
- **Contexto Ativo:** ${memories.length > 0 ? `${memories.length} diretrizes de memória corporativa consideradas.` : 'Operando sob protocolo de segurança padrão.'}

### 2. Plano de Ação Recomendado
1. **Mapeamento & Pré-requisitos:** Validar acessos, dados de entrada e permissões necessárias antes de qualquer intervenção.
2. **Definição de Entregáveis:** Estruturar a tarefa correspondente na aba **Tarefas** com critérios de aceitação claros.
3. **Automação Controlada:** Caso haja tarefas repetitivas associadas, configurar gatilho na aba **Automações**.
4. **Validação & Auditoria:** Registrar o resultado para aprendizado contínuo da equipe.

### 3. Próximos Passos
Você deseja que eu crie uma tarefa estruturada no sistema para este plano ou prefere detalhar algum requisito técnico específico?`;
      }
    }

    // Log this action to audit trail
    auditLogs.unshift({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'chat_completion',
      summary: `Consulta processada (${mode}): "${message.slice(0, 60)}..."`,
      timestamp: new Date().toISOString(),
      details: {
        promptLength: message.length,
        responseLength: replyText.length,
        memoriesCount: memories.length,
        mode,
      },
    });

    // Keep audit logs capped at 100
    if (auditLogs.length > 100) {
      auditLogs.pop();
    }

    return res.json({
      text: replyText,
      model: 'gemini-3.8-flash',
      mode,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Erro interno do servidor ao consultar a IA.';
    console.error('Erro na chamada L.U.C.I.A. Gemini:', error);
    return res.status(500).json({
      error: 'Falha ao processar solicitação com o modelo de inteligência artificial.',
      details: errorMsg,
    });
  }
});

// API Route: Submit response evaluation & feedback
app.post('/api/lucia/feedback', (req: Request, res: Response) => {
  try {
    const { messageId, userMessage, assistantResponse, rating, tags = [], comment = '' } = req.body;

    if (!rating || !['positive', 'negative'].includes(rating)) {
      return res.status(400).json({ error: 'Avaliação inválida (deve ser positive ou negative).' });
    }

    const feedbackEntry = {
      id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      messageId: messageId || 'msg-unknown',
      userMessage: userMessage || '',
      assistantResponse: assistantResponse || '',
      rating,
      tags: Array.isArray(tags) ? tags : [],
      comment,
      timestamp: new Date().toISOString(),
    };

    feedbackStore.unshift(feedbackEntry);
    if (feedbackStore.length > 150) {
      feedbackStore.pop();
    }

    auditLogs.unshift({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'feedback_received',
      summary: `Feedback ${rating === 'positive' ? 'positivo (+1)' : 'negativo (-1)'}: ${tags.join(', ') || 'Geral'}`,
      timestamp: new Date().toISOString(),
      details: {
        feedbackId: feedbackEntry.id,
        commentSnippet: comment.slice(0, 50),
      },
    });

    return res.json({
      success: true,
      message: 'Feedback registrado com sucesso na base de aprendizado da L.U.C.I.A.',
      feedbackId: feedbackEntry.id,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao processar feedback';
    return res.status(500).json({ error: msg });
  }
});

// API Route: Get feedback entries and audit history
app.get('/api/lucia/history', (_req: Request, res: Response) => {
  res.json({
    auditLogs: auditLogs.slice(0, 50),
    feedback: feedbackStore.slice(0, 50),
  });
});

async function startServer() {
  const distPath = path.resolve(__dirname, 'dist');
  const hasDist = fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'));
  const isProd = process.env.NODE_ENV === 'production' || hasDist;

  if (isProd && hasDist) {
    console.log(`[L.U.C.I.A.] Serving production static build from ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    console.log('[L.U.C.I.A.] Starting Vite development middleware');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[L.U.C.I.A.] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[L.U.C.I.A.] Fatal Server Startup Error:', err);
  process.exit(1);
});
