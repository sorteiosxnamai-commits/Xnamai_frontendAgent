export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  company: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  company?: string;
}

export type ChannelType =
  | 'whatsapp'
  | 'instagram'
  | 'facebook'
  | 'telegram'
  | 'webchat'
  | 'sms'
  | 'email';

export interface Channel {
  id: string;
  type: ChannelType;
  name: string;
  connected: boolean;
  messagesToday: number;
  lastActivity?: string;
  phone?: string;
}

export interface DashboardStats {
  activeConversations: number;
  closedConversations: number;
  waitingQueue: number;
  avgResponseTime: string;
  nps: number;
  csat: number;
  aiOnline: boolean;
  campaignsSent: number;
  botResolved: number;
}

export interface ChartDataPoint {
  name: string;
  conversas: number;
  pedidos: number;
  clientes: number;
}

export interface DashboardData {
  stats: DashboardStats;
  conversationsChart: ChartDataPoint[];
  ordersChart: ChartDataPoint[];
  responseTimeChart: ChartDataPoint[];
}

export type MessageSender = 'customer' | 'agent' | 'ai';
export type MessageStatus = 'sent' | 'delivered' | 'read';
export type ConversationStatus = 'active' | 'waiting' | 'closed';

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  sender: MessageSender;
  timestamp: string;
  status: MessageStatus;
}

export interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  lastMessage: string;
  lastMessageAt: string;
  status: ConversationStatus;
  unreadCount: number;
  channel: ChannelType;
  department?: string;
  protocol?: string;
  assignedTo?: string;
}

export interface FunnelStage {
  id: string;
  name: string;
  deals: FunnelDeal[];
}

export interface FunnelDeal {
  id: string;
  title: string;
  contact: string;
  value: number;
  channel: ChannelType;
  stageId: string;
}

export interface Campaign {
  id: string;
  name: string;
  channel: ChannelType;
  status: 'draft' | 'scheduled' | 'running' | 'completed';
  recipients: number;
  sent: number;
  opened: number;
  scheduledAt?: string;
}

export interface ChatbotFlow {
  id: string;
  name: string;
  active: boolean;
  triggers: number;
  resolved: number;
  channel: ChannelType;
}

export interface Integration {
  id: string;
  name: string;
  category: 'crm' | 'erp' | 'ecommerce' | 'marketing';
  connected: boolean;
  logo?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  city: string;
  avatar?: string;
  ordersCount: number;
  totalSpent: number;
  lastContact: string;
  synced: boolean;
  notes?: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  synced: boolean;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items: number;
}

export interface MercosStatus {
  connected: boolean;
  lastSync: string;
  syncedProducts: number;
  syncedCustomers: number;
  syncedOrders: number;
}

export interface MercosLog {
  id: string;
  type: 'products' | 'customers' | 'orders' | 'all';
  status: 'success' | 'error' | 'running';
  message: string;
  timestamp: string;
}

export interface AgentStatus {
  online: boolean;
  model: string;
  avgResponseTime: string;
  questionsAnswered: number;
  openaiEnabled?: boolean;
}

export interface AgentChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AgentChatRequest {
  message: string;
  conversationId?: string;
  customerId?: string;
  mode?: AgentMode;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

export type AgentMode = 'agent' | 'copilot' | 'suggestion';

export interface AgentContext {
  conversation?: Conversation;
  customer?: Customer;
  customerDetail?: CustomerDetail;
  messages: Message[];
  lastCustomerMessage?: string;
  productsCatalog: string;
}

export interface ConversationSuggestion {
  insight: string;
  suggestion: string;
  priority: 'low' | 'medium' | 'high';
}

export interface AgentChatResponse {
  reply: string;
  conversationId: string;
  source?: 'openai' | 'intelligent';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  category?: string;
}

export interface CustomerDetail extends Customer {
  orders: Order[];
  purchasedProducts: Product[];
  lastService: string;
}
