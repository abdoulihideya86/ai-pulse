import { db } from '@/lib/db'

async function main() {
  console.log('Seeding database...')

  // Clean existing data
  console.log('Cleaning existing data...')
  await db.userBookmark.deleteMany()
  await db.userRead.deleteMany()
  await db.userInterest.deleteMany()
  await db.user.deleteMany()
  await db.article.deleteMany()
  await db.source.deleteMany()
  await db.category.deleteMany()
  await db.tool.deleteMany()
  console.log('Existing data cleaned.')

  // Create sources
  const source1 = await db.source.create({
    data: {
      name: 'AI News Network',
      url: 'https://ai-news.example.com',
      type: 'rss',
      reliabilityScore: 0.92,
      logo: '/logos/ainn.png',
      isActive: true,
    },
  })

  const source2 = await db.source.create({
    data: {
      name: 'TechCrunch AI',
      url: 'https://techcrunch.com/ai',
      type: 'rss',
      reliabilityScore: 0.88,
      logo: '/logos/tc.png',
      isActive: true,
    },
  })

  const source3 = await db.source.create({
    data: {
      name: 'Arabic AI Review',
      url: 'https://ar-ai-review.example.com',
      type: 'api',
      reliabilityScore: 0.85,
      logo: '/logos/aar.png',
      isActive: true,
    },
  })

  const source4 = await db.source.create({
    data: {
      name: 'Deep Learning Weekly',
      url: 'https://dl-weekly.example.com',
      type: 'rss',
      reliabilityScore: 0.90,
      logo: '/logos/dlw.png',
      isActive: true,
    },
  })

  // Create categories
  const categories = await Promise.all([
    db.category.create({
      data: {
        nameAr: 'الذكاء الاصطناعي العام',
        nameEn: 'General AI',
        icon: 'Brain',
        color: '#8B5CF6',
        slug: 'general-ai',
        sortOrder: 0,
      },
    }),
    db.category.create({
      data: {
        nameAr: 'تعلم الآلة',
        nameEn: 'Machine Learning',
        icon: 'Cpu',
        color: '#06B6D4',
        slug: 'machine-learning',
        sortOrder: 1,
      },
    }),
    db.category.create({
      data: {
        nameAr: 'معالجة اللغات الطبيعية',
        nameEn: 'NLP',
        icon: 'MessageSquare',
        color: '#10B981',
        slug: 'nlp',
        sortOrder: 2,
      },
    }),
    db.category.create({
      data: {
        nameAr: 'الرؤية الحاسوبية',
        nameEn: 'Computer Vision',
        icon: 'Eye',
        color: '#F59E0B',
        slug: 'computer-vision',
        sortOrder: 3,
      },
    }),
    db.category.create({
      data: {
        nameAr: 'الروبوتات',
        nameEn: 'Robotics',
        icon: 'Bot',
        color: '#EF4444',
        slug: 'robotics',
        sortOrder: 4,
      },
    }),
    db.category.create({
      data: {
        nameAr: 'أخلاقيات الذكاء الاصطناعي',
        nameEn: 'AI Ethics',
        icon: 'Scale',
        color: '#EC4899',
        slug: 'ai-ethics',
        sortOrder: 5,
      },
    }),
  ])

  // Create articles
  const articlesData = [
    {
      titleAr: 'جوجل تطلق نموذج Gemini 2.0 الجديد بقدرات مذهلة',
      titleEn: 'Google Launches New Gemini 2.0 Model with Amazing Capabilities',
      summaryAr: 'كشفت جوجل عن نموذج Gemini 2.0 الجديد الذي يتفوق على جميع النماذج السابقة في اختبارات الأداء المتعددة.',
      summaryEn: 'Google unveiled the new Gemini 2.0 model that outperforms all previous models on multiple benchmark tests.',
      contentAr: 'أعلنت جوجل اليوم عن إطلاق نموذج Gemini 2.0 الجديد، والذي يمثل قفزة نوعية في عالم الذكاء الاصطناعي. يتميز النموذج الجديد بقدرات محسنة في الاستدلال والفهم متعدد الوسائط، مع تحسينات كبيرة في سرعة الاستجابة وكفاءة الاستهلاك الطاقي. وقد حقق النموذج نتائج استثنائية في معايير التقييم الرئيسية، متفوقاً على المنافسين في اختبارات البرمجة والرياضيات والاستدلال المنطقي.',
      contentEn: 'Google announced today the launch of the new Gemini 2.0 model, which represents a quantum leap in the world of artificial intelligence. The new model features improved reasoning and multimodal understanding capabilities, with significant improvements in response speed and energy efficiency. The model achieved exceptional results on key evaluation benchmarks, outperforming competitors in programming, mathematics, and logical reasoning tests.',
      category: 'general-ai',
      sourceId: source1.id,
      tags: JSON.stringify(['Gemini', 'Google', 'LLM', 'AI Models']),
      views: 15200,
      isTrending: true,
      isBreaking: true,
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      titleAr: 'أوبن إيه آي تعلن عن GPT-5 مع قدرات استدلال متقدمة',
      titleEn: 'OpenAI Announces GPT-5 with Advanced Reasoning Capabilities',
      summaryAr: 'كشفت أوبن إيه آي عن GPT-5 الذي يتمتع بقدرات استدلال متقدمة وأداء محسن في المهام المعقدة.',
      summaryEn: 'OpenAI unveiled GPT-5 featuring advanced reasoning capabilities and improved performance on complex tasks.',
      contentAr: 'في حدث كبير، كشفت أوبن إيه آي عن الإصدار الأحدث من نموذجها GPT-5. يتميز النموذج الجديد بقدرات استدلال متقدمة تسمح له بحل مشكلات معقدة بشكل أفضل بكثير من الإصدارات السابقة. كما تحسن أداء النموذج بشكل ملحوظ في مجالات البرمجة والتحليل الرياضي والكتابة الإبداعية.',
      contentEn: 'In a major event, OpenAI unveiled the latest version of its GPT-5 model. The new model features advanced reasoning capabilities that allow it to solve complex problems much better than previous versions. The model\'s performance has also significantly improved in programming, mathematical analysis, and creative writing.',
      category: 'general-ai',
      sourceId: source2.id,
      tags: JSON.stringify(['GPT-5', 'OpenAI', 'Reasoning', 'AI Models']),
      views: 22100,
      isTrending: true,
      isBreaking: false,
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
    {
      titleAr: 'ثورة في معالجة اللغات الطبيعية: نموذج عربي جديد يحقق أداءً مذهلاً',
      titleEn: 'NLP Revolution: New Arabic Model Achieves Amazing Performance',
      summaryAr: 'طوّر باحثون نموذجاً عربياً جديداً لمعالجة اللغات الطبيعية يتفوق على جميع النماذج الموجودة.',
      summaryEn: 'Researchers developed a new Arabic NLP model that outperforms all existing models.',
      contentAr: 'أعلن فريق من الباحثين عن تطوير نموذج عربي جديد لمعالجة اللغات الطبيعية يحقق أداءً غير مسبوق في فهم وتوليد النصوص العربية. النموذج الجديد، الذي درّب على مجموعة بيانات ضخمة، يتفوق على GPT-4 وGemini في المهام العربية المحددة.',
      contentEn: 'A team of researchers announced the development of a new Arabic NLP model that achieves unprecedented performance in understanding and generating Arabic text. The new model, trained on a massive dataset, outperforms GPT-4 and Gemini on specific Arabic tasks.',
      category: 'nlp',
      sourceId: source3.id,
      tags: JSON.stringify(['Arabic NLP', 'Language Models', 'NLP', 'Arabic AI']),
      views: 8700,
      isTrending: true,
      isBreaking: false,
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    },
    {
      titleAr: 'تقدم جديد في الرؤية الحاسوبية: كشف الأجسام في الوقت الحقيقي',
      titleEn: 'Computer Vision Breakthrough: Real-time Object Detection',
      summaryAr: 'حقق باحثون تقدماً كبيراً في كشف الأجسام في الوقت الحقيقي باستخدام تقنيات تعلم جديدة.',
      summaryEn: 'Researchers achieved a major breakthrough in real-time object detection using new learning techniques.',
      contentAr: 'نشر باحثون من جامعة ستانفورد ورقة بحثية تصف خوارزمية جديدة لكشف الأجسام في الوقت الحقيقي بدقة غير مسبوقة وسرعة فائقة.',
      contentEn: 'Researchers from Stanford University published a paper describing a new algorithm for real-time object detection with unprecedented accuracy and blazing speed.',
      category: 'computer-vision',
      sourceId: source4.id,
      tags: JSON.stringify(['Computer Vision', 'Object Detection', 'Real-time', 'Deep Learning']),
      views: 6300,
      isTrending: true,
      isBreaking: false,
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
    {
      titleAr: 'الروبوتات المتقدمة: جيل جديد من الروبوتات الإنسانية',
      titleEn: 'Advanced Robotics: New Generation of Humanoid Robots',
      summaryAr: 'شركة Figure تطلق روبوتاً إنسانياً جديداً قادراً على أداء مهام معقدة في البيئات الحقيقية.',
      summaryEn: 'Figure company launches a new humanoid robot capable of performing complex tasks in real-world environments.',
      contentAr: 'كشفت شركة Figure عن الجيل الجديد من الروبوتات الإنسانية Figure-02، والذي يتمتع بقدرات حركية متقدمة وذكاء اصطناعي محسن يسمح له بالتفاعل بشكل طبيعي مع البيئة المحيطة.',
      contentEn: 'Figure unveiled the new generation of humanoid robots Figure-02, which features advanced motor capabilities and enhanced AI that allows it to interact naturally with the surrounding environment.',
      category: 'robotics',
      sourceId: source2.id,
      tags: JSON.stringify(['Humanoid Robots', 'Figure', 'Robotics', 'AI Hardware']),
      views: 9800,
      isTrending: true,
      isBreaking: false,
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      titleAr: 'الاتحاد الأوروبي يصدر قانون الذكاء الاصطناعي الجديد',
      titleEn: 'EU Issues New AI Act Regulation',
      summaryAr: 'أصدر الاتحاد الأوروبي قانوناً جديداً لتنظيم الذكاء الاصطناعي يعتبر الأشمل عالمياً.',
      summaryEn: 'The European Union issued a new regulation for AI that is considered the most comprehensive globally.',
      contentAr: 'دخل قانون الذكاء الاصطناعي الأوروبي الجديد حيز التنفيذ، مما يضع إطاراً تنظيمياً شاملاً لتطوير واستخدام أنظمة الذكاء الاصطناعي في الدول الأعضاء.',
      contentEn: 'The new European AI Act entered into force, establishing a comprehensive regulatory framework for the development and use of AI systems in member states.',
      category: 'ai-ethics',
      sourceId: source1.id,
      tags: JSON.stringify(['AI Regulation', 'EU', 'AI Ethics', 'Policy']),
      views: 11500,
      isTrending: true,
      isBreaking: false,
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      titleAr: 'تعلم الآلة الموجه: تقنية جديدة تقلل الحاجة للبيانات',
      titleEn: 'Directed ML: New Technique Reduces Data Requirements',
      summaryAr: 'ابتكر باحثون تقنية تعلم آلة موجهة تقلل من كمية البيانات المطلوبة للتدريب بنسبة 80%.',
      summaryEn: 'Researchers invented a directed ML technique that reduces training data requirements by 80%.',
      contentAr: 'نشر باحثون من معهد ماساتشوستس للتقنية ورقة بحثية تصف تقنية جديدة لتعلم الآلة الموجه التي تقلل بشكل كبير من الحاجة إلى كميات ضخمة من البيانات.',
      contentEn: 'MIT researchers published a paper describing a new directed machine learning technique that significantly reduces the need for massive amounts of training data.',
      category: 'machine-learning',
      sourceId: source4.id,
      tags: JSON.stringify(['Machine Learning', 'Data Efficiency', 'MIT', 'Training']),
      views: 5400,
      isTrending: false,
      isBreaking: false,
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      titleAr: 'نموذج جديد لتوليد الصور يتفوق على Midjourney',
      titleEn: 'New Image Generation Model Outperforms Midjourney',
      summaryAr: 'أطلقت شركة Stability AI نموذجاً جديداً لتوليد الصور يحقق نتائج واقعية مذهلة.',
      summaryEn: 'Stability AI launched a new image generation model achieving stunningly realistic results.',
      contentAr: 'أطلقت شركة Stability AI نموذجها الجديد لتوليد الصور الذي يتفوق على Midjourney وDALL-E في اختبارات الجودة والواقعية.',
      contentEn: 'Stability AI launched its new image generation model that outperforms Midjourney and DALL-E in quality and realism benchmarks.',
      category: 'computer-vision',
      sourceId: source2.id,
      tags: JSON.stringify(['Image Generation', 'Stability AI', 'Generative AI', 'Art']),
      views: 7600,
      isTrending: false,
      isBreaking: false,
      publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      titleAr: 'أخلاقيات الذكاء الاصطناعي: تحديات جديدة في عالم الأتمتة',
      titleEn: 'AI Ethics: New Challenges in the Age of Automation',
      summaryAr: 'خبراء يحذرون من التحديات الأخلاقية الجديدة التي يفرضها انتشار الأتمتة المعتمدة على الذكاء الاصطناعي.',
      summaryEn: 'Experts warn of new ethical challenges posed by the spread of AI-driven automation.',
      contentAr: 'في تقرير جديد، حذر خبراء أخلاقيات الذكاء الاصطناعي من التحديات المتزايدة التي يفرضها الانتشار السريع لأنظمة الأتمتة المعتمدة على الذكاء الاصطناعي في مختلف القطاعات.',
      contentEn: 'In a new report, AI ethics experts warned of the growing challenges posed by the rapid spread of AI-driven automation systems across various sectors.',
      category: 'ai-ethics',
      sourceId: source1.id,
      tags: JSON.stringify(['AI Ethics', 'Automation', 'Bias', 'Fairness']),
      views: 4200,
      isTrending: false,
      isBreaking: false,
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      titleAr: 'ميتا تطور روبوتات محادثة ذكية بلغات متعددة',
      titleEn: 'Meta Develops Intelligent Multilingual Chatbots',
      summaryAr: 'كشفت ميتا عن روبوتات محادثة جديدة تدعم أكثر من 100 لغة بفضل نموذج لغوي موحد.',
      summaryEn: 'Meta unveiled new chatbots supporting over 100 languages thanks to a unified language model.',
      contentAr: 'أعلنت شركة ميتا عن تطوير روبوتات محادثة ذكية جديدة قادرة على التفاعل بأكثر من 100 لغة، بفضل نموذج لغوي موحد جديد.',
      contentEn: 'Meta announced the development of new intelligent chatbots capable of interacting in over 100 languages, thanks to a new unified language model.',
      category: 'nlp',
      sourceId: source2.id,
      tags: JSON.stringify(['Meta', 'Chatbots', 'Multilingual', 'NLP']),
      views: 3800,
      isTrending: false,
      isBreaking: false,
      publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
    {
      titleAr: 'تقنية جديدة لتحسين سرعة تدريب النماذج الكبيرة',
      titleEn: 'New Technique Improves Large Model Training Speed',
      summaryAr: 'ابتكر باحثون طريقة جديدة تسرّع تدريب النماذج اللغوية الكبيرة بنسبة تصل إلى 3 أضعاف.',
      summaryEn: 'Researchers invented a new method that accelerates large language model training by up to 3x.',
      contentAr: 'نشر باحثون من DeepMind ورقة بحثية تصف تقنية جديدة لتسريع تدريب النماذج اللغوية الكبيرة بشكل كبير.',
      contentEn: 'DeepMind researchers published a paper describing a new technique for significantly accelerating the training of large language models.',
      category: 'machine-learning',
      sourceId: source4.id,
      tags: JSON.stringify(['DeepMind', 'Training', 'Efficiency', 'LLM']),
      views: 5100,
      isTrending: false,
      isBreaking: false,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      titleAr: 'روبوتات جراحية مدعومة بالذكاء الاصطناعي تنجح عمليات معقدة',
      titleEn: 'AI-Powered Surgical Robots Succeed in Complex Operations',
      summaryAr: 'نجحت روبوتات جراحية مدعومة بالذكاء الاصطناعي في إجراء عمليات جراحية معقدة بدقة عالية.',
      summaryEn: 'AI-powered surgical robots successfully performed complex surgeries with high precision.',
      contentAr: 'في إنجاز طبي كبير، نجحت روبوتات جراحية مدعومة بالذكاء الاصطناعي في إجراء سلسلة من العمليات الجراحية المعقدة بدقة تفوق الجراحين البشر.',
      contentEn: 'In a major medical achievement, AI-powered surgical robots successfully performed a series of complex surgeries with precision exceeding human surgeons.',
      category: 'robotics',
      sourceId: source1.id,
      tags: JSON.stringify(['Medical AI', 'Surgical Robots', 'Healthcare', 'Robotics']),
      views: 6700,
      isTrending: false,
      isBreaking: false,
      publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
  ]

  for (const data of articlesData) {
    await db.article.create({ data })
  }

  // Create a sample user with interests
  const user = await db.user.create({
    data: {
      email: 'demo@ai-pulse.com',
      name: 'مستخدم تجريبي',
      language: 'ar',
      theme: 'dark',
      tier: 'pro',
    },
  })

  // Create user interests
  await Promise.all([
    db.userInterest.create({
      data: { userId: user.id, category: 'general-ai', weight: 1.0 },
    }),
    db.userInterest.create({
      data: { userId: user.id, category: 'nlp', weight: 0.9 },
    }),
    db.userInterest.create({
      data: { userId: user.id, category: 'machine-learning', weight: 0.8 },
    }),
    db.userInterest.create({
      data: { userId: user.id, category: 'ai-ethics', weight: 0.6 },
    }),
    db.userInterest.create({
      data: { userId: user.id, category: 'robotics', weight: 0.4 },
    }),
  ])

  // Create tools
  const toolsData = [
    {
      name: 'ChatGPT',
      description: 'مساعد ذكي للمحادثة والكتابة والت coding',
      category: 'chatbots',
      rating: 4.8,
      pricing: 'freemium',
      url: 'https://chat.openai.com',
      features: JSON.stringify(['محادثة ذكية', 'كتابة إبداعية', 'برمجة', 'تحليل بيانات']),
    },
    {
      name: 'Midjourney',
      description: 'أداة توليد صور فنية بالذكاء الاصطناعي',
      category: 'image-generation',
      rating: 4.7,
      pricing: 'paid',
      url: 'https://midjourney.com',
      features: JSON.stringify(['توليد صور', 'فن رقمي', 'تصميم', 'إبداع']),
    },
    {
      name: 'GitHub Copilot',
      description: 'مساعد برمجة مدعوم بالذكاء الاصطناعي',
      category: 'coding',
      rating: 4.6,
      pricing: 'paid',
      url: 'https://github.com/features/copilot',
      features: JSON.stringify(['إكمال الكود', 'اقتراحات ذكية', 'إصلاح الأخطاء', 'شرح الكود']),
    },
    {
      name: 'Whisper',
      description: 'نموذج تحويل الكلام إلى نص من OpenAI',
      category: 'speech',
      rating: 4.5,
      pricing: 'free',
      url: 'https://github.com/openai/whisper',
      features: JSON.stringify(['تحويل صوت لنص', 'دعم لغات متعددة', 'ترجمة', 'دقة عالية']),
    },
    {
      name: 'Stable Diffusion',
      description: 'نموذج مفتوح المصدر لتوليد الصور',
      category: 'image-generation',
      rating: 4.4,
      pricing: 'free',
      url: 'https://stability.ai',
      features: JSON.stringify(['مفتوح المصدر', 'توليد صور', 'قابل للتخصيص', 'محلي التشغيل']),
    },
    {
      name: 'LangChain',
      description: 'إطار عمل لتطوير تطبيقات الذكاء الاصطناعي',
      category: 'frameworks',
      rating: 4.3,
      pricing: 'free',
      url: 'https://langchain.com',
      features: JSON.stringify(['سلاسل LLM', 'وكلاء ذكيون', 'تكامل APIs', 'ذاكرة سياقية']),
    },
  ]

  for (const data of toolsData) {
    await db.tool.create({ data })
  }

  console.log('Database seeded successfully!')
  console.log(`- ${articlesData.length} articles created`)
  console.log(`- ${categories.length} categories created`)
  console.log(`- 4 sources created`)
  console.log(`- 1 user with interests created`)
  console.log(`- ${toolsData.length} tools created`)
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
