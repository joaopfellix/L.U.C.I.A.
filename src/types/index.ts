export type PageId =
  | 'dashboard'
  | 'assistant'
  | 'tasks'
  | 'memory'
  | 'automations'
  | 'history'
  | 'settings';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  mode?: string;
  rating?: 'positive' | 'negative';
  ratingFeedbackSubmitted?: boolean;
  modelUsed?: string;
}

export interface FeedbackData {
  id?: string;
  messageId: string;
  userMessage: string;
  assistantResponse: string;
  rating: 'positive' | 'negative';
  tags: string[];
  comment: string;
  timestamp: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'needs_auth';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  result?: string;
  authorized: boolean;
  createdAt: string;
  tags?: string[];
}

export type MemoryCategory =
  | 'business'
  | 'rules'
  | 'preferences'
  | 'technical'
  | 'security';

export interface MemoryItem {
  id: string;
  title: string;
  category: MemoryCategory;
  content: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export type AutomationTrigger = 'schedule' | 'task_event' | 'webhook' | 'email_alert';
export type AutomationStatus = 'active' | 'paused' | 'testing';

export interface AutomationItem {
  id: string;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  triggerDetails: string;
  actions: string[];
  status: AutomationStatus;
  runsCount: number;
  lastRun?: string;
  requiresAuthorization: boolean;
}

export interface AuditLogItem {
  id: string;
  type: string;
  summary: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface SystemSettings {
  autoMemoryInjection: boolean;
  assistantMode: 'default' | 'planner' | 'automation' | 'technical';
  requireApprovalForActions: boolean;
  streamingEffect: boolean;
  maxMemoryItems: number;
  userName: string;
  organizationName: string;
}
