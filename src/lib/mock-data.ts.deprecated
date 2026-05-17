// Mock data for AI Pulse news articles

export interface ArticleSource {
  id?: string
  name: string
  reliabilityScore: number
  logo: string
  url?: string
  type?: string
  isActive?: boolean
}

export interface Article {
  id: string
  titleAr: string
  titleEn: string
  summaryAr: string
  summaryEn: string
  contentAr: string
  contentEn: string
  category: string
  tags: string[]
  views: number
  isBreaking: boolean
  isTrending: boolean
  publishedAt: string
  source: ArticleSource
  imageUrl?: string
}

export interface MockTool {
  id: string
  name: string
  description: string
  category: string
  rating: number
  pricing: string
  url: string
  imageUrl: string
  features: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export const categoryLabels: Record<string, { ar: string; en: string }> = {
  llm: { ar: 'نماذج اللغة', en: 'LLMs' },
  computer_vision: { ar: 'الرؤية الحاسوبية', en: 'Computer Vision' },
  robotics: { ar: 'الروبوتات', en: 'Robotics' },
  healthcare: { ar: 'الصحة', en: 'Healthcare' },
  investment: { ar: 'الاستثمار', en: 'Investment' },
  research: { ar: 'الأبحاث', en: 'Research' },
  tools: { ar: 'الأدوات', en: 'Tools' },
  ethics: { ar: 'الأخلاقيات', en: 'Ethics' },
  autonomous: { ar: 'القيادة الذاتية', en: 'Autonomous' },
  generative: { ar: 'توليد المحتوى', en: 'Generative AI' },
  writing: { ar: 'الكتابة', en: 'Writing' },
  coding: { ar: 'البرمجة', en: 'Coding' },
  design: { ar: 'التصميم', en: 'Design' },
  productivity: { ar: 'الإنتاجية', en: 'Productivity' },
}

export const mockArticles: Article[] = [
  {
    id: 'art1',
    titleAr: 'إطلاق Gemini 2.5: ثورة جديدة في نماذج اللغة الكبيرة من جوجل',
    titleEn: 'Gemini 2.5 Launch: A New Revolution in Large Language Models from Google',
    summaryAr: '• كشفت جوجل عن Gemini 2.5 بأداء يتفوق على GPT-5 في معايير تقييم متعددة\n• النموذج الجديد يدعم سياق يصل إلى 2 مليون رمز مع إمكانيات تفكير متقدمة\n• التكامل مع منصات جوجل المختلفة يعزز من قابلية الاستخدام في بيئات العمل',
    summaryEn: '• Google unveiled Gemini 2.5 outperforming GPT-5 across multiple benchmarks\n• The new model supports up to 2M token context with advanced reasoning capabilities\n• Integration across Google platforms enhances enterprise usability',
    contentAr: `في خطوة تاريخية، كشفت شركة جوجل عن نموذجها الجديد Gemini 2.5 الذي يمثل قفزة نوعية في عالم نماذج اللغة الكبيرة. يأتي هذا الإطلاق بعد شهور من التطوير المكثف والاختبارات الدقيقة.

## أداء مذهل في المعايير الدولية

أظهر النموذج الجديد أداءً استثنائياً في مجموعة واسعة من المعايير الدولية، حيث تفوق على أقوى المنافسين في اختبارات الاستدلال الرياضي والبرمجة والفهم اللغوي. وقد وصلت دقة النموذج إلى 94.7% في اختبار MMLU مقارنة بـ 91.2% للمنافس الأقرب.

## سياق أطول وقدرات تفكير متقدمة

أحد أبرز ميزات Gemini 2.5 هو دعمه لسياق يصل إلى 2 مليون رمز، مما يتيح للمستخدمين تحليل وثائق ضخمة ومجموعات بيانات كبيرة في جلسة واحدة. كما تم تحسين قدرات التفكير المنطقي بشكل كبير.

## التكامل مع بيئات العمل

أعلنت جوجل عن تكامل عميق لـ Gemini 2.5 مع مجموعة أدواتها بما في ذلك Google Workspace وGoogle Cloud Platform، مما يسهل على المؤسسات اعتماد النموذج في عملياتها اليومية.

## التسعير والتوفر

يتوفر النموذج بعدة فئات تسعير تبدأ من المجاني للاستخدام الأساسي وصولاً إلى خطط مؤسسية متقدمة. ويتميز Gemini 2.5 Flash بسرعة استجابة تصل إلى 3 أضعاف النسخة السابقة مع تكلفة أقل بنسبة 60%.`,
    contentEn: `In a historic move, Google unveiled its new Gemini 2.5 model, representing a quantum leap in the world of large language models. This launch comes after months of intensive development and rigorous testing.

## Stunning Benchmark Performance

The new model demonstrated exceptional performance across a wide range of international benchmarks, outperforming the strongest competitors in mathematical reasoning, coding, and language understanding tests. The model achieved 94.7% accuracy on the MMLU benchmark compared to 91.2% for the nearest competitor.

## Longer Context and Advanced Reasoning

One of the most notable features of Gemini 2.5 is its support for up to 2 million tokens of context, allowing users to analyze massive documents and large datasets in a single session. Logical reasoning capabilities have also been significantly enhanced.

## Enterprise Integration

Google announced deep integration of Gemini 2.5 with its suite of tools including Google Workspace and Google Cloud Platform, making it easier for organizations to adopt the model in their daily operations.

## Pricing and Availability

The model is available in several pricing tiers starting from free for basic usage up to advanced enterprise plans. The Gemini 2.5 Flash variant delivers response speeds up to 3x faster than the previous version at 60% lower cost.`,
    category: 'llm',
    tags: ['Google', 'Gemini', 'LLM'],
    views: 15420,
    isBreaking: true,
    isTrending: true,
    publishedAt: '2026-05-17T08:30:00Z',
    source: { id: 'src1', name: 'TechCrunch AI', reliabilityScore: 0.92, logo: '🔬', url: 'https://techcrunch.com/ai', type: 'rss', isActive: true },
  },
  {
    id: 'art2',
    titleAr: 'أبل تستثمر 500 مليار دولار في البنية التحتية للذكاء الاصطناعي',
    titleEn: 'Apple Invests $500 Billion in AI Infrastructure',
    summaryAr: '• أعلنت أبل عن خطة استثمارية ضخمة بقيمة 500 مليار دولار لبناء مراكز بيانات متخصصة في الذكاء الاصطناعي\n• المشروع يشمل إنشاء 5 مراكز بيانات جديدة في الولايات المتحدة وأوروبا وآسيا\n• من المتوقع أن يخلق المشروع أكثر من 50,000 فرصة عمل مباشرة',
    summaryEn: '• Apple announced a massive $500B investment plan to build AI-specialized data centers\n• The project includes 5 new data centers across the US, Europe, and Asia\n• Expected to create over 50,000 direct jobs',
    contentAr: `أعلنت شركة أبل عن أكبر استثمار في تاريخها، حيث ستخصص 500 مليار دولار لبناء بنية تحتية متخصصة في الذكاء الاصطناعي على مدى السنوات الخمس القادمة.

## رؤية استراتيجية طويلة المدى

تأتي هذه الخطوة ضمن رؤية استراتيجية لتعزيز مكانة أبل في سباق الذكاء الاصطناعي العالمي. وسيتم إنشاء 5 مراكز بيانات جديدة مزودة بأحدث شرائح الذكاء الاصطناعي.

## تأثير على سوق العمل

من المتوقع أن يخلق هذا المشروع أكثر من 50,000 فرصة عمل مباشرة وآلاف الفرص غير المباشرة في قطاعات البناء والتشغيل والصيانة.`,
    contentEn: `Apple announced the largest investment in its history, allocating $500 billion to build AI-specialized infrastructure over the next five years.

## Long-term Strategic Vision

This move is part of a strategic vision to strengthen Apple's position in the global AI race. Five new data centers equipped with the latest AI chips will be built.

## Employment Impact

The project is expected to create over 50,000 direct jobs and thousands of indirect opportunities in construction, operations, and maintenance sectors.`,
    category: 'investment',
    tags: ['Apple', 'Investment', 'Infrastructure'],
    views: 23100,
    isBreaking: true,
    isTrending: true,
    publishedAt: '2026-05-17T06:00:00Z',
    source: { id: 'src2', name: 'Reuters Tech', reliabilityScore: 0.95, logo: '📰', url: 'https://reuters.com/technology', type: 'rss', isActive: true },
  },
  {
    id: 'art3',
    titleAr: 'الذكاء الاصطناعي في الطب: تقدم مذهل في تشخيص الأمراض النادرة',
    titleEn: 'AI in Medicine: Amazing Progress in Diagnosing Rare Diseases',
    summaryAr: '• نظام AI جديد يحقق دقة 97% في تشخيص الأمراض النادرة من تحليل الصور الطبية\n• النظام تم تدريبه على أكثر من 10 ملايين صورة طبية من 200 مستشفى حول العالم\n• منظمة الصحة العالمية تعتمد النظام كأداة مساعدة في التشخيص',
    summaryEn: '• New AI system achieves 97% accuracy in diagnosing rare diseases from medical imaging\n• Trained on over 10M medical images from 200 hospitals worldwide\n• WHO endorses the system as a diagnostic aid tool',
    contentAr: `كشف فريق من الباحثين عن نظام ذكاء اصطناعي جديد قادر على تشخيص الأمراض النادرة بدقة تصل إلى 97% من خلال تحليل الصور الطبية.

## تقنيات متقدمة

يعتمد النظام على تقنيات التعلم العميق والرؤية الحاسوبية المتقدمة، مع قدرة فريدة على التعرف على أنماط دقيقة يصعب اكتشافها بالعين البشرية.

## اعتماد رسمي

أعلنت منظمة الصحة العالمية عن اعتماد النظام كأداة مساعدة في التشخيص، مما يمثل سابقة في تاريخ الطب.`,
    contentEn: `A team of researchers revealed a new AI system capable of diagnosing rare diseases with up to 97% accuracy through medical imaging analysis.

## Advanced Technologies

The system relies on deep learning and advanced computer vision techniques, with a unique ability to recognize subtle patterns difficult to detect by the human eye.

## Official Endorsement

The World Health Organization announced the endorsement of the system as a diagnostic aid tool, marking a precedent in medical history.`,
    category: 'healthcare',
    tags: ['AI', 'Healthcare', 'Diagnosis'],
    views: 8930,
    isBreaking: false,
    isTrending: false,
    publishedAt: '2026-05-16T14:00:00Z',
    source: { id: 'src3', name: 'Nature Medicine', reliabilityScore: 0.98, logo: '🏥', url: 'https://nature.com/medicine', type: 'rss', isActive: true },
  },
  {
    id: 'art4',
    titleAr: 'نموذج DALL-E 4 يحدث ثورة في تصميم المنتجات',
    titleEn: 'DALL-E 4 Revolutionizes Product Design',
    summaryAr: '• OpenAI تطلق DALL-E 4 مع قدرات تصميم منتجات ثلاثية الأبعاد\n• النموذج يمكنه إنشاء تصاميم قابلة للطباعة ثلاثية الأبعاد مباشرة\n• أكثر من 100,000 مصمم يستخدمونه بالفعل في الشهر الأول',
    summaryEn: '• OpenAI launches DALL-E 4 with 3D product design capabilities\n• Model can generate 3D-printable designs directly\n• Over 100,000 designers using it in the first month',
    contentAr: `أطلقت OpenAI النسخة الرابعة من نموذجها المولد للصور DALL-E مع قدرات جديدة تماماً في تصميم المنتجات ثلاثية الأبعاد.

## قدرات ثورية

يمكن للنموذج الجديد إنشاء تصاميم منتجات ثلاثية الأبعاد قابلة للطباعة مباشرة، مع دعم كامل لمواصفات التصنيع. هذه الميزة تختصر أشهراً من العمل في دقائق معدودة.

## تبني واسع

فاق عدد المستخدمين 100,000 مصمم خلال الشهر الأول فقط، مع تقييمات إيجابية من 94% من المستخدمين.`,
    contentEn: `OpenAI launched the fourth version of its image generation model DALL-E with entirely new capabilities in 3D product design.

## Revolutionary Capabilities

The new model can generate 3D-printable product designs directly, with full support for manufacturing specifications. This feature reduces months of work to mere minutes.

## Wide Adoption

Users exceeded 100,000 designers in just the first month, with positive ratings from 94% of users.`,
    category: 'generative',
    tags: ['OpenAI', 'DALL-E', 'Design'],
    views: 12560,
    isBreaking: false,
    isTrending: true,
    publishedAt: '2026-05-16T10:30:00Z',
    source: { id: 'src4', name: 'The Verge AI', reliabilityScore: 0.88, logo: '🎨', url: 'https://theverge.com/ai', type: 'rss', isActive: true },
  },
  {
    id: 'art5',
    titleAr: 'القيادة الذاتية المستوى الخامس: اختراق تكنولوجي من Waymo',
    titleEn: 'Level 5 Autonomous Driving: Waymo Technological Breakthrough',
    summaryAr: '• Waymo تحقق مستوى القيادة الذاتية الكامل المستوى الخامس في ظروف حضرية معقدة\n• النظام الجديد يعالج القرارات في أقل من 50 مللي ثانية\n• تجارب على الطريق العام في 12 مدينة أمريكية',
    summaryEn: '• Waymo achieves full Level 5 autonomous driving in complex urban conditions\n• New system processes decisions in under 50 milliseconds\n• Public road trials in 12 US cities',
    contentAr: `حققت شركة Waymo إنجازاً تاريخياً بالوصول إلى مستوى القيادة الذاتية الكامل (المستوى الخامس) في ظروف حضرية معقدة.

## تقنية متقدمة

يعتمد النظام على مزيج من أجهزة الاستشعار المتقدمة والذكاء الاصطناعي المعزز، مع قدرة على معالجة القرارات في أقل من 50 مللي ثانية.

## تجارب واسعة النطاق

تجري الشركة تجارب على الطريق العام في 12 مدينة أمريكية، مع أكثر من مليون ميل قطعتها السيارات ذاتية القيادة بدون حوادث.`,
    contentEn: `Waymo achieved a historic milestone by reaching full Level 5 autonomous driving in complex urban conditions.

## Advanced Technology

The system relies on a combination of advanced sensors and augmented AI, with the ability to process decisions in under 50 milliseconds.

## Large-scale Trials

The company is conducting public road trials in 12 US cities, with over one million miles driven by autonomous vehicles without accidents.`,
    category: 'autonomous',
    tags: ['Waymo', 'Autonomous', 'Self-driving'],
    views: 9870,
    isBreaking: false,
    isTrending: true,
    publishedAt: '2026-05-15T16:00:00Z',
    source: { id: 'src5', name: 'Wired Auto', reliabilityScore: 0.90, logo: '🚗', url: 'https://wired.com/transportation', type: 'rss', isActive: true },
  },
  {
    id: 'art6',
    titleAr: 'نموذج لغة مفتوح المصدر جديد يتفوق على GPT-4',
    titleEn: 'New Open-Source Language Model Outperforms GPT-4',
    summaryAr: '• مجتمع Hugging Face يطلق نموذج مفتوح المصدر يتفوق على GPT-4 في 15 معيار تقييم\n• النموذج يعمل على أجهزة المستهلك العادية مع 24GB ذاكرة\n• أكثر من مليون تحميل في الأسبوع الأول',
    summaryEn: '• Hugging Face community launches open-source model outperforming GPT-4 on 15 benchmarks\n• Model runs on consumer hardware with 24GB memory\n• Over 1 million downloads in the first week',
    contentAr: `أطلق مجتمع Hugging Face نموذج لغة مفتوح المصدر جديد يتفوق على GPT-4 في 15 معيار تقييم مختلف.

## إنجاز للمصادر المفتوحة

يمثل هذا الإطلاق إنجازاً كبيراً لحركة المصادر المفتوحة في الذكاء الاصطناعي، حيث يتوفر النموذج مجاناً للمطورين والباحثين.

## أداء على أجهزة عادية

من أبرز ميزات النموذج قدرته على العمل على أجهزة المستهلك العادية مع 24GB ذاكرة فقط، مما يجعله متاحاً لشريحة واسعة من المستخدمين.`,
    contentEn: `The Hugging Face community launched a new open-source language model that outperforms GPT-4 on 15 different benchmarks.

## Open Source Achievement

This launch represents a major milestone for the open-source AI movement, with the model available for free to developers and researchers.

## Consumer Hardware Performance

One of the model's standout features is its ability to run on consumer hardware with just 24GB of memory, making it accessible to a wide range of users.`,
    category: 'llm',
    tags: ['Hugging Face', 'Open Source', 'LLM'],
    views: 31200,
    isBreaking: true,
    isTrending: true,
    publishedAt: '2026-05-15T12:00:00Z',
    source: { id: 'src6', name: 'ArXiv Daily', reliabilityScore: 0.93, logo: '📚', url: 'https://arxiv.org', type: 'rss', isActive: true },
  },
  {
    id: 'art7',
    titleAr: 'روبوتات إنسانية جديدة قادرة على التعلم بالملاحظة',
    titleEn: 'New Humanoid Robots Can Learn by Observation',
    summaryAr: '• شركة Figure تكشف عن روبوت إنساني يتعلم المهام بمجرد مراقبة البشر\n• الروبوت يتقن 50 مهارة مختلفة بعد مشاهدة واحدة\n• التطبيقات تمتد من التصنيع إلى الرعاية المنزلية',
    summaryEn: '• Figure reveals humanoid robot that learns tasks by observing humans\n• Robot masters 50 different skills after a single observation\n• Applications range from manufacturing to home care',
    contentAr: `كشفت شركة Figure عن روبوت إنساني جديد يتمتع بقدرة فريدة على تعلم المهام بمجرد مراقبة البشر يؤدونها.

## تعلم بالملاحظة

يعتمد الروبوت على تقنيات التعلم بالملاحظة المتقدمة، حيث يمكنه تقليد حركات الإنسان وتكرارها بدقة عالية بعد مشاهدة واحدة فقط.

## تطبيقات متنوعة

تمتد تطبيقات الروبوت من خطوط التصنيع في المصانع إلى مهام الرعاية المنزلية، مع قدرة على التكيف مع بيئات مختلفة.`,
    contentEn: `Figure unveiled a new humanoid robot with a unique ability to learn tasks simply by observing humans perform them.

## Learning by Observation

The robot relies on advanced observational learning techniques, capable of imitating human movements and repeating them with high accuracy after just a single observation.

## Diverse Applications

The robot's applications range from factory production lines to home care tasks, with the ability to adapt to different environments.`,
    category: 'robotics',
    tags: ['Figure', 'Robotics', 'Humanoid'],
    views: 7650,
    isBreaking: false,
    isTrending: false,
    publishedAt: '2026-05-14T09:00:00Z',
    source: { id: 'src7', name: 'IEEE Spectrum', reliabilityScore: 0.94, logo: '🤖', url: 'https://spectrum.ieee.org', type: 'rss', isActive: true },
  },
  {
    id: 'art8',
    titleAr: 'لائحة جديدة من الاتحاد الأوروبي تنظم استخدام الذكاء الاصطناعي في التوظيف',
    titleEn: 'New EU Regulation Governs AI Use in Hiring',
    summaryAr: '• الاتحاد الأوروبي يصدر لائحة جديدة تحظر استخدام AI في قرارات التوظيف دون رقابة بشرية\n• اللائحة تطلب شفافية كاملة في خوارزميات فرز السير الذاتية\n• غرامات تصل إلى 6% من الإيرادات السنوية للمخالفين',
    summaryEn: '• EU issues new regulation banning AI in hiring decisions without human oversight\n• Regulation requires full transparency in resume screening algorithms\n• Fines up to 6% of annual revenue for violators',
    contentAr: `أصدر الاتحاد الأوروبي لائحة جديدة تنظم استخدام الذكاء الاصطناعي في عمليات التوظيف، في خطوة تعزز حماية حقوق العمال.

## قيود صارمة

تحظر اللائحة استخدام أنظمة الذكاء الاصطناعي في اتخاذ قرارات التوظيف النهائية دون رقابة بشرية كافية، مع اشتراط شفافية كاملة في خوارزميات فرز السير الذاتية.

## عقوبات رادعة

تتضمن اللائحة غرامات تصل إلى 6% من الإيرادات السنوية للمؤسسات المخالفة، مما يجعلها من أشد اللوائح في العالم.`,
    contentEn: `The European Union issued a new regulation governing the use of artificial intelligence in hiring processes, strengthening worker rights protection.

## Strict Restrictions

The regulation bans the use of AI systems in making final hiring decisions without adequate human oversight, requiring full transparency in resume screening algorithms.

## Deterrent Penalties

The regulation includes fines of up to 6% of annual revenue for violating organizations, making it one of the strictest regulations globally.`,
    category: 'ethics',
    tags: ['EU', 'Regulation', 'AI Ethics'],
    views: 5430,
    isBreaking: false,
    isTrending: false,
    publishedAt: '2026-05-14T11:00:00Z',
    source: { id: 'src8', name: 'EU Commission', reliabilityScore: 0.97, logo: '⚖️', url: 'https://ec.europa.eu', type: 'rss', isActive: true },
  },
  {
    id: 'art9',
    titleAr: 'نظام رؤية حاسوبية جديد يكشف التزييف العميق بنسبة دقة 99.8%',
    titleEn: 'New Computer Vision System Detects Deepfakes with 99.8% Accuracy',
    summaryAr: '• باحثون من MIT يطورون نظاماً يكشف التزييف العميق بدقة 99.8%\n• النظام يعمل في الوقت الفعلي على مقاطع الفيديو المتدفقة\n• متاح مفتوح المصدر للباحثين والمؤسسات الإعلامية',
    summaryEn: '• MIT researchers develop system detecting deepfakes with 99.8% accuracy\n• System works in real-time on streaming video\n• Available open-source for researchers and media organizations',
    contentAr: `طور باحثون من معهد ماساتشوستس للتكنولوجيا نظام رؤية حاسوبية جديد يكشف التزييف العميق بدقة قياسية تصل إلى 99.8%.

## تقنية متقدمة

يعتمد النظام على تحليل التزامن بين حركات الشفاه والتعبيرات الوجهية، مع كشف التشوهات الدقيقة غير المرئية للعين البشرية.

## متاح للجميع

تم إتاحة النظام مفتوح المصدر ليستفيد منه الباحثون والمؤسسات الإعلامية في مكافحة المعلومات المضللة.`,
    contentEn: `MIT researchers developed a new computer vision system that detects deepfakes with a record accuracy of 99.8%.

## Advanced Technology

The system analyzes synchronization between lip movements and facial expressions, detecting subtle distortions invisible to the human eye.

## Available to All

The system has been made open-source for researchers and media organizations to combat misinformation.`,
    category: 'computer_vision',
    tags: ['MIT', 'Deepfake', 'Computer Vision'],
    views: 11200,
    isBreaking: false,
    isTrending: true,
    publishedAt: '2026-05-13T15:00:00Z',
    source: { id: 'src9', name: 'MIT News', reliabilityScore: 0.96, logo: '👁️', url: 'https://news.mit.edu', type: 'rss', isActive: true },
  },
  {
    id: 'art10',
    titleAr: 'أدوات ذكاء اصطناعي جديدة لتطوير البرمجيات تتحدى المبرمجين',
    titleEn: 'New AI Development Tools Challenge Programmers',
    summaryAr: '• إطلاق أدوات برمجية مدعومة بالذكاء الاصطناعي تكتب 80% من الكود البرمجي\n• الأدوات تدعم أكثر من 50 لغة برمجة مع تصحيح تلقائي للأخطاء\n• تفاعل إيجابي من المطورين مع زيادة إنتاجية بنسبة 300%',
    summaryEn: '• AI-powered development tools that write 80% of code launched\n• Tools support 50+ programming languages with automatic error correction\n• Positive developer response with 300% productivity increase',
    contentAr: `تم إطلاق مجموعة جديدة من أدوات تطوير البرمجيات المدعومة بالذكاء الاصطناعي التي تعيد تعريف مفهوم البرمجة.

## كتابة كود ذكية

الأدوات الجديدة قادرة على كتابة ما يصل إلى 80% من الكود البرمجي المطلوب، مع دعم لأكثر من 50 لغة برمجة مختلفة. كما تتضمن قدرات تصحيح تلقائي للأخطاء وتحسين الأداء.

## زيادة الإنتاجية

أفاد المطورون الذين استخدموا هذه الأدوات بزيادة في الإنتاجية تصل إلى 300%، مع تحسن كبير في جودة الكود المكتوب.`,
    contentEn: `A new set of AI-powered software development tools has been launched that redefines the concept of programming.

## Smart Code Writing

The new tools can write up to 80% of the required code, supporting more than 50 different programming languages. They also include automatic error correction and performance optimization capabilities.

## Productivity Boost

Developers using these tools reported productivity increases of up to 300%, with significant improvements in code quality.`,
    category: 'tools',
    tags: ['AI Tools', 'Coding', 'Development'],
    views: 18200,
    isBreaking: false,
    isTrending: true,
    publishedAt: '2026-05-13T10:00:00Z',
    source: { id: 'src10', name: 'DevOps Weekly', reliabilityScore: 0.89, logo: '💻', url: 'https://devops.com', type: 'rss', isActive: true },
  },
  {
    id: 'art11',
    titleAr: 'بحث جديد يكشف عن قدرات تفكير متقدمة في نماذج الذكاء الاصطناعي',
    titleEn: 'New Research Reveals Advanced Reasoning in AI Models',
    summaryAr: '• دراسة من ستانفورد تكشف عن قدرات تفكير سببية في أحدث نماذج الذكاء الاصطناعي\n• النماذج يمكنها الآن حل مشكلات تتطلب تفكيراً سببياً معقداً\n• النتائج تفتح آفاقاً جديدة في التشخيص الطبي والتحليل القانوني',
    summaryEn: '• Stanford study reveals causal reasoning capabilities in latest AI models\n• Models can now solve problems requiring complex causal reasoning\n• Results open new horizons in medical diagnosis and legal analysis',
    contentAr: `كشفت دراسة جديدة من جامعة ستانفورد عن قدرات تفكير سببية متقدمة في أحدث نماذج الذكاء الاصطناعي.

## تفكير سببي

أظهرت النماذج قدرة على حل مشكلات تتطلب تفكيراً سببياً معقداً، مما يتجاوز مجرد ربط الأنماط الإحصائية إلى فهم العلاقات السببية الفعلية.

## تطبيقات واعدة

تفتح هذه النتائج آفاقاً جديدة في مجالات التشخيص الطبي والتحليل القانوني والتخطيط الاستراتيجي.`,
    contentEn: `A new study from Stanford University reveals advanced causal reasoning capabilities in the latest AI models.

## Causal Reasoning

The models demonstrated the ability to solve problems requiring complex causal reasoning, moving beyond mere statistical pattern matching to understanding actual causal relationships.

## Promising Applications

These results open new horizons in medical diagnosis, legal analysis, and strategic planning.`,
    category: 'research',
    tags: ['Stanford', 'Research', 'Reasoning'],
    views: 6780,
    isBreaking: false,
    isTrending: false,
    publishedAt: '2026-05-12T08:00:00Z',
    source: { id: 'src11', name: 'Stanford AI Lab', reliabilityScore: 0.97, logo: '🎓', url: 'https://ai.stanford.edu', type: 'rss', isActive: true },
  },
  {
    id: 'art12',
    titleAr: 'شركة ناشئة تطور روبوت جراحي يتفوق على الجراحين البشر',
    titleEn: 'Startup Develops Surgical Robot Outperforming Human Surgeons',
    summaryAr: '• شركة ناشئة تطور روبوت جراحي بدقة تفوق الجراحين البشر بنسبة 40%\n• الروبوت أجرى أكثر من 500 عملية ناجحة في التجارب السريرية\n• موافقة إدارة الغذاء والدواء الأمريكية متوقعة خلال أشهر',
    summaryEn: '• Startup develops surgical robot 40% more precise than human surgeons\n• Robot completed over 500 successful surgeries in clinical trials\n• FDA approval expected within months',
    contentAr: `طورت شركة ناشئة روبوت جراحي يتفوق على الجراحين البشر في الدقة بنسبة 40%.

## دقة استثنائية

الروبوت الجديد قادر على إجراء عمليات جراحية دقيقة للغاية بدقة تفوق أفضل الجراحين البشر، مع تقليل معدل المضاعفات بنسبة 60%.

## تجارب سريرية ناجحة

أجرى الروبوت أكثر من 500 عملية ناجحة في التجارب السريرية، وتتوقع الشركة الحصول على موافقة إدارة الغذاء والدواء الأمريكية خلال الأشهر القادمة.`,
    contentEn: `A startup has developed a surgical robot that outperforms human surgeons in precision by 40%.

## Exceptional Precision

The new robot can perform extremely delicate surgeries with accuracy surpassing the best human surgeons, reducing complication rates by 60%.

## Successful Clinical Trials

The robot has completed over 500 successful surgeries in clinical trials, and the company expects FDA approval within the coming months.`,
    category: 'healthcare',
    tags: ['Surgery', 'Robotics', 'Healthcare'],
    views: 14500,
    isBreaking: true,
    isTrending: true,
    publishedAt: '2026-05-12T14:00:00Z',
    source: { id: 'src12', name: 'MedTech News', reliabilityScore: 0.91, logo: '⚕️', url: 'https://medtech.com', type: 'rss', isActive: true },
  },
]

export const mockTools: MockTool[] = [
  {
    id: 'tool1',
    name: 'ChatGPT Pro',
    description: 'نموذج لغة متقدم للمحادثة وكتابة المحتوى',
    category: 'llm',
    rating: 4.8,
    pricing: 'freemium',
    url: 'https://chat.openai.com',
    imageUrl: '',
    features: ['محادثة ذكية', 'كتابة محتوى', 'تحليل بيانات', 'برمجة'],
    isActive: true,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-05-17T00:00:00Z',
  },
  {
    id: 'tool2',
    name: 'Midjourney V7',
    description: 'أداة توليد صور فنية بالذكاء الاصطناعي',
    category: 'generative',
    rating: 4.7,
    pricing: 'paid',
    url: 'https://midjourney.com',
    imageUrl: '',
    features: ['توليد صور', 'أنماط فنية', 'دقة عالية', 'تحرير متقدم'],
    isActive: true,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-05-16T00:00:00Z',
  },
  {
    id: 'tool3',
    name: 'GitHub Copilot X',
    description: 'مساعد برمجي ذكي يكمل الكود تلقائياً',
    category: 'coding',
    rating: 4.6,
    pricing: 'paid',
    url: 'https://github.com/features/copilot',
    imageUrl: '',
    features: ['إكمال كود', 'تصحيح أخطاء', 'شرح كود', 'اختبارات تلقائية'],
    isActive: true,
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-05-15T00:00:00Z',
  },
  {
    id: 'tool4',
    name: 'Jasper AI',
    description: 'أداة كتابة محتوى تسويقي بالذكاء الاصطناعي',
    category: 'writing',
    rating: 4.3,
    pricing: 'paid',
    url: 'https://jasper.ai',
    imageUrl: '',
    features: ['كتابة تسويقية', 'تحسين SEO', 'قوالب جاهزة', 'ترجمة'],
    isActive: true,
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-05-14T00:00:00Z',
  },
  {
    id: 'tool5',
    name: 'Runway ML',
    description: 'منصة إبداعية لتوليد وتحرير الفيديو بالذكاء الاصطناعي',
    category: 'generative',
    rating: 4.5,
    pricing: 'freemium',
    url: 'https://runwayml.com',
    imageUrl: '',
    features: ['توليد فيديو', 'تحرير ذكي', 'إزالة خلفية', 'تأثيرات بصرية'],
    isActive: true,
    createdAt: '2026-02-15T00:00:00Z',
    updatedAt: '2026-05-13T00:00:00Z',
  },
  {
    id: 'tool6',
    name: 'Notion AI',
    description: 'مساعد ذكي لإدارة المهام والملاحظات',
    category: 'productivity',
    rating: 4.4,
    pricing: 'freemium',
    url: 'https://notion.so',
    imageUrl: '',
    features: ['تلخيص ملاحظات', 'كتابة محتوى', 'تنظيم مهام', 'قواعد بيانات'],
    isActive: true,
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-05-12T00:00:00Z',
  },
  {
    id: 'tool7',
    name: 'Figma AI',
    description: 'أداة تصميم واجهات مستخدم مدعومة بالذكاء الاصطناعي',
    category: 'design',
    rating: 4.6,
    pricing: 'freemium',
    url: 'https://figma.com',
    imageUrl: '',
    features: ['تصميم واجهات', 'توليد تخطيطات', 'اقتراح ألوان', 'تحويل لتخطيط'],
    isActive: true,
    createdAt: '2026-03-15T00:00:00Z',
    updatedAt: '2026-05-11T00:00:00Z',
  },
  {
    id: 'tool8',
    name: 'Cursor AI',
    description: 'محرر أكواد ذكي مدعوم بالذكاء الاصطناعي',
    category: 'coding',
    rating: 4.7,
    pricing: 'freemium',
    url: 'https://cursor.sh',
    imageUrl: '',
    features: ['تحرير ذكي', 'إكمال كود', 'إعادة هيكلة', 'شرح كود'],
    isActive: true,
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-05-10T00:00:00Z',
  },
]

export function getArticleById(id: string): Article | undefined {
  return mockArticles.find((a) => a.id === id)
}

export function getArticlesByCategory(category: string, excludeId?: string): Article[] {
  return mockArticles.filter((a) => a.category === category && a.id !== excludeId)
}
