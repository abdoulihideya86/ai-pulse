import { createServer } from 'http'
import { Server } from 'socket.io'

const PORT = 3003

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

// Simulated breaking news that gets pushed periodically
const breakingNewsPool = [
  { titleAr: 'جوجل تطلق نموذج Gemini الجديد مع قدرات تفكير متقدمة', titleEn: 'Google Launches New Gemini Model with Advanced Reasoning', category: 'llm' },
  { titleAr: 'أوبن إيه آي تكشف عن تحديث كبير لـ ChatGPT', titleEn: 'OpenAI Reveals Major ChatGPT Update', category: 'llm' },
  { titleAr: 'شركة ناشئة تجمع 200 مليون دولار لتطوير روبوتات AI', titleEn: 'Startup Raises $200M for AI Robot Development', category: 'robotics' },
  { titleAr: 'الاتحاد الأوروبي يفرض غرامات جديدة على شركات AI', titleEn: 'EU Imposes New Fines on AI Companies', category: 'policy' },
  { titleAr: 'اكتشاف طريقة ثورية لتدريب نماذج AI بتكلفة أقل', titleEn: 'Revolutionary Method Found for Cheaper AI Training', category: 'research' },
  { titleAr: 'نظام AI جديد يكتشف الأمراض قبل ظهور الأعراض', titleEn: 'New AI System Detects Diseases Before Symptoms', category: 'computer-vision' },
  { titleAr: 'مايكروسوفت تضيف ميزات AI جديدة لـ Windows', titleEn: 'Microsoft Adds New AI Features to Windows', category: 'business' },
  { titleAr: 'أنثروبيك تطلق Claude مع ذاكرة محسّنة', titleEn: 'Anthropic Launches Claude with Enhanced Memory', category: 'llm' },
]

let newsIndex = 0

io.on('connection', (socket) => {
  console.log(`[AI Pulse Live] Client connected: ${socket.id}`)

  // Send welcome message
  socket.emit('connected', {
    message: 'AI Pulse Live - Connected',
    timestamp: new Date().toISOString(),
  })

  // Handle join news room
  socket.on('join', (data: { categories?: string[] }) => {
    console.log(`[AI Pulse Live] Client ${socket.id} joined with categories:`, data.categories)
    socket.join('news-room')
  })

  // Handle leave
  socket.on('leave', () => {
    socket.leave('news-room')
    console.log(`[AI Pulse Live] Client ${socket.id} left news room`)
  })

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`[AI Pulse Live] Client disconnected: ${socket.id}`)
  })
})

// Push breaking news every 60 seconds
setInterval(() => {
  const news = breakingNewsPool[newsIndex % breakingNewsPool.length]
  newsIndex++

  const payload = {
    id: `live-${Date.now()}`,
    ...news,
    isBreaking: true,
    timestamp: new Date().toISOString(),
  }

  io.to('news-room').emit('breaking-news', payload)
  console.log(`[AI Pulse Live] Pushed breaking news: ${news.titleEn}`)
}, 60000)

// Push stats update every 30 seconds
setInterval(() => {
  io.to('news-room').emit('stats-update', {
    articlesToday: Math.floor(Math.random() * 50) + 100,
    activeSources: Math.floor(Math.random() * 20) + 480,
    trendingTopics: Math.floor(Math.random() * 10) + 15,
    timestamp: new Date().toISOString(),
  })
}, 30000)

httpServer.listen(PORT, () => {
  console.log(`[AI Pulse Live] WebSocket server running on port ${PORT}`)
})
