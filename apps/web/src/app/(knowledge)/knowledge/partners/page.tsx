/**
 * Alifh for Partners - Understanding Your Insights
 * Comprehensive guide explaining all partner dashboard metrics
 * Bilingual: English & Arabic
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  ArrowLeft, 
  TrendingUp, 
  Eye, 
  Calendar,
  Car,
  BarChart3,
  HelpCircle,
  Lightbulb,
  Target
} from 'lucide-react';
import { useLanguage } from '../../_components/language-context';
import { useAside } from '../../_components/aside-context';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// Aside summary content
const asideSummary = {
  en: {
    title: 'In this guide',
    items: [
      { icon: BarChart3, label: 'Inventory stats' },
      { icon: TrendingUp, label: 'Sales metrics' },
      { icon: Eye, label: 'Engagement data' },
      { icon: Calendar, label: 'Booking insights' },
    ],
    footer: 'Updated Jan 2026',
  },
  ar: {
    title: 'في هذا الدليل',
    items: [
      { icon: BarChart3, label: 'إحصائيات المخزون' },
      { icon: TrendingUp, label: 'مقاييس المبيعات' },
      { icon: Eye, label: 'بيانات التفاعل' },
      { icon: Calendar, label: 'رؤى الحجوزات' },
    ],
    footer: 'محدّث يناير ٢٠٢٦',
  },
};

// Content translations
const content = {
  en: {
    section: 'Partners',
    title: 'Understanding Your Insights',
    intro: 'Your dashboard shows numbers that help you sell more cars, faster. This guide explains what each metric means and how to use it.',
    tldr: 'Quick summary: Focus on Active Listings, Views, and Days to Sell. If views are low, improve photos. If days to sell is high, consider repricing.',
    
    sections: {
      inventory: {
        title: 'Inventory Stats',
        description: 'What you currently have for sale',
        icon: Car,
        metrics: [
          {
            name: 'Active Listings',
            simple: 'Cars you have for sale right now',
            detail: 'This is your "showroom floor" — only cars that are approved and visible to buyers. Draft cars and those pending approval are not counted here.',
            tip: 'More active listings = more chances to sell. But quality matters more than quantity.',
          },
          {
            name: 'Reserved',
            simple: 'Cars someone has put a deposit on',
            detail: 'These cars are essentially "on hold" — a buyer has shown serious interest with a deposit. They still appear to others but are marked as reserved.',
            tip: 'High reserved count is great — it means buyers trust you. Follow up quickly to close these deals.',
          },
          {
            name: 'Pending Approval',
            simple: 'New listings waiting to be reviewed',
            detail: 'When you add a new car, our team checks it to make sure photos and details are accurate. This usually takes a few hours.',
            tip: 'If a car is stuck here for more than 24 hours, check if any information is missing.',
          },
          {
            name: 'Expiring Soon',
            simple: 'Listings that will become inactive within 7 days',
            detail: 'Listings have a validity period. If they expire without a sale, you\'ll need to renew them. This is your heads-up to take action.',
            tip: 'Before renewing, consider: Are the photos fresh? Is the price still competitive?',
          },
          {
            name: 'Total Inventory Value',
            simple: 'The combined asking price of all your active cars',
            detail: 'Add up the price of every car you have for sale — that\'s this number. It helps you understand your capital at risk.',
            tip: 'If this number is very high compared to your sales, you might have too much money tied up in stock.',
          },
        ],
      },
      sales: {
        title: 'Sales Performance',
        description: 'How quickly and effectively you\'re selling',
        icon: TrendingUp,
        metrics: [
          {
            name: 'Sold This Month',
            simple: 'Number of cars sold in the current calendar month',
            detail: 'Starts fresh on the 1st of each month. This is your primary measure of "how\'s business going?"',
            tip: 'Compare this to last month. If it\'s lower, ask why — is it seasonality, pricing, or something else?',
          },
          {
            name: 'Avg Days to Sell',
            simple: 'On average, how long from listing to sold',
            detail: 'We calculate from when your car went live to when it was marked as sold. Lower is better — it means your pricing and presentation are right.',
            tip: 'In the UAE market, 30-45 days is typical. Under 20 days is excellent. Over 60 days means something needs to change.',
          },
          {
            name: 'Revenue This Month',
            simple: 'Total value of cars sold this month (in AED)',
            detail: 'The sum of sale prices for all cars sold this month. It\'s not profit — it\'s total sales value.',
            tip: 'Revenue ÷ Sold Count = Average Sale Price. Track this to see if you\'re moving up or down market.',
          },
          {
            name: 'Sell-Through Rate',
            simple: 'What percentage of your inventory sells each month',
            detail: 'If you have 20 cars and sell 4, that\'s a 20% sell-through rate. Higher is better.',
            tip: 'Healthy dealerships aim for 15-25% monthly sell-through. Below 10% means cars are sitting too long.',
          },
          {
            name: 'Fastest Sale',
            simple: 'Your quickest sale — fewest days from listing to sold',
            detail: 'This shows your best case scenario. What made this car sell fast? Learn from it.',
            tip: 'Look at what this car had: Great photos? Competitive price? Popular model? Replicate it.',
          },
        ],
      },
      engagement: {
        title: 'Customer Engagement',
        description: 'How buyers interact with your listings',
        icon: Eye,
        metrics: [
          {
            name: 'Total Views',
            simple: 'How many times buyers looked at your car detail pages',
            detail: 'Every time someone clicks on one of your cars to see the full details, that\'s a view. More views = more potential buyers.',
            tip: 'If views are low, your titles, prices, or main photos might not be compelling enough.',
          },
          {
            name: 'Avg Views per Listing',
            simple: 'Views divided by number of active listings',
            detail: 'If you have 10 cars with 500 total views, that\'s 50 views each on average. Helps you see if attention is spread evenly.',
            tip: 'If one car has 200 views and another has 5, the second car needs help — better photos, different price, or highlight it.',
          },
          {
            name: 'Impressions',
            simple: 'How many times your cars appeared in search results',
            detail: 'When a buyer scrolls through listings and your car shows up, that\'s an impression. It doesn\'t mean they clicked.',
            tip: 'High impressions but low views? Your thumbnail photo or price isn\'t catching attention.',
          },
          {
            name: 'Favorites',
            simple: 'How many buyers saved your cars to their wishlist',
            detail: 'When someone "hearts" your car, they\'re seriously interested. They might come back to buy.',
            tip: 'Favorites are warm leads. If the same car has many favorites but no sale, consider a small price drop to trigger action.',
          },
          {
            name: 'View-to-Favorite Rate',
            simple: 'What percentage of viewers become interested enough to save',
            detail: 'If 100 people view and 10 favorite, that\'s 10%. Higher means your listings are compelling.',
            tip: 'Above 5% is good. Above 10% is excellent. Below 2% means the listing looks better from the outside than the inside.',
          },
        ],
      },
      bookings: {
        title: 'Booking Insights',
        description: 'Test drives and appointments',
        icon: Calendar,
        metrics: [
          {
            name: 'Pending Bookings',
            simple: 'Test drive requests waiting for your confirmation',
            detail: 'Buyers have asked to see a car. You need to accept or decline. Don\'t leave them hanging!',
            tip: 'Respond within 2 hours during business hours. Slow responses lose sales.',
          },
          {
            name: 'Confirmed Bookings',
            simple: 'Scheduled test drives you\'ve agreed to',
            detail: 'Both you and the buyer have committed to a time. These are your hottest leads.',
            tip: 'Send a reminder the day before. Have the car clean and ready.',
          },
          {
            name: 'Completed This Month',
            simple: 'Test drives that actually happened this month',
            detail: 'The buyer showed up, saw the car. Even if they didn\'t buy, it counts.',
            tip: 'Track what percentage of test drives turn into sales. Industry standard is 20-30%.',
          },
          {
            name: 'Cancellation Rate',
            simple: 'What percentage of bookings get cancelled',
            detail: 'If 10 bookings are made and 3 cancel, that\'s 30%. Some cancellation is normal.',
            tip: 'Above 30% is concerning. Ask yourself: Are buyers finding something online they don\'t like before arriving?',
          },
          {
            name: 'No-Show Rate',
            simple: 'Buyers who booked but didn\'t show up',
            detail: 'They said they\'d come but didn\'t. Frustrating but it happens.',
            tip: 'Send appointment reminders. If no-shows are high, consider requiring a small deposit.',
          },
        ],
      },
      trends: {
        title: 'Month-over-Month Trends',
        description: 'How you\'re improving (or not)',
        icon: Target,
        metrics: [
          {
            name: 'Green Up Arrow (↑)',
            simple: 'This number went up compared to last month',
            detail: 'More is usually better — more sales, more views, more listings. Green is good news.',
            tip: 'Don\'t celebrate a single green arrow. Look for consistent improvement over 3+ months.',
          },
          {
            name: 'Red Down Arrow (↓)',
            simple: 'This number dropped compared to last month',
            detail: 'Less than before. Might be a problem, might be seasonal. Investigate before panicking.',
            tip: 'One bad month isn\'t a pattern. But if red arrows appear 2-3 months in a row, take action.',
          },
          {
            name: 'Percentage Change',
            simple: 'How much it went up or down, as a percentage',
            detail: '+25% means a quarter more than last month. -50% means half as much. Bigger numbers = bigger changes.',
            tip: 'Small percentage changes (under 10%) are usually normal variation. Focus on changes over 20%.',
          },
        ],
      },
    },
    
    faqs: {
      title: 'Common Questions',
      items: [
        {
          q: 'Which metric matters most?',
          a: 'For most dealers, it\'s "Avg Days to Sell." It tells you if your pricing and presentation are working. If cars sell fast, you\'re doing something right.',
        },
        {
          q: 'My views are low — what should I do?',
          a: 'First, check your photos. The main photo is crucial. Second, check your pricing — if you\'re overpriced compared to similar cars, buyers scroll past. Third, make sure your titles are clear and complete.',
        },
        {
          q: 'Why do I have lots of favorites but no sales?',
          a: 'This usually means your price is slightly too high. Buyers like the car but think it costs too much. Try a 5-10% price reduction and see if it triggers action.',
        },
        {
          q: 'What\'s a good sell-through rate?',
          a: 'Aim for 15-25% per month. If you have 20 cars, selling 3-5 per month is healthy. Below 10% means your inventory is stale — either wrong cars or wrong prices.',
        },
        {
          q: 'How often do stats update?',
          a: 'Most stats update in real-time or within a few minutes. Month comparisons update at midnight on the 1st of each month.',
        },
      ],
    },
    
    tips: {
      title: 'Quick Tips',
      items: [
        'Check your dashboard weekly, not daily. Daily fluctuations are noise.',
        'Focus on 2-3 metrics that matter for your current goal.',
        'If something looks wrong, take action within 48 hours.',
        'Compare your performance to last month, not to other dealers.',
        'Good photos are the #1 driver of views. Invest in them.',
      ],
    },
  },
  ar: {
    section: 'الشركاء',
    title: 'فهم الإحصائيات',
    intro: 'لوحة التحكم تعرض أرقاماً تساعدك على بيع المزيد من السيارات بشكل أسرع. هذا الدليل يشرح معنى كل مقياس وكيفية استخدامه.',
    tldr: 'ملخص سريع: ركز على السيارات النشطة، المشاهدات، ومتوسط أيام البيع. إذا كانت المشاهدات قليلة، حسّن الصور. إذا كانت أيام البيع طويلة، راجع السعر.',
    
    sections: {
      inventory: {
        title: 'إحصائيات المخزون',
        description: 'ما لديك للبيع حالياً',
        icon: Car,
        metrics: [
          {
            name: 'السيارات النشطة',
            simple: 'السيارات المعروضة للبيع الآن',
            detail: 'هذا هو "صالة العرض" — فقط السيارات الموافق عليها والمرئية للمشترين. المسودات والسيارات قيد المراجعة لا تُحتسب هنا.',
            tip: 'المزيد من السيارات النشطة = المزيد من فرص البيع. لكن الجودة أهم من الكمية.',
          },
          {
            name: 'محجوزة',
            simple: 'سيارات دفع أحدهم عربوناً لها',
            detail: 'هذه السيارات "قيد الانتظار" — مشترٍ أبدى اهتماماً جدياً بعربون. تظهر للآخرين لكن معلّمة كمحجوزة.',
            tip: 'عدد محجوز عالي أمر رائع — يعني أن المشترين يثقون بك. تابع بسرعة لإتمام الصفقات.',
          },
          {
            name: 'قيد الموافقة',
            simple: 'إعلانات جديدة تنتظر المراجعة',
            detail: 'عند إضافة سيارة جديدة، فريقنا يتحقق من دقة الصور والتفاصيل. عادة يستغرق بضع ساعات.',
            tip: 'إذا بقيت السيارة هنا أكثر من 24 ساعة، تحقق من وجود معلومات ناقصة.',
          },
          {
            name: 'تنتهي قريباً',
            simple: 'إعلانات ستصبح غير نشطة خلال 7 أيام',
            detail: 'للإعلانات فترة صلاحية. إذا انتهت بدون بيع، ستحتاج لتجديدها. هذا تنبيه لاتخاذ إجراء.',
            tip: 'قبل التجديد، اسأل: هل الصور حديثة؟ هل السعر لا يزال تنافسياً؟',
          },
          {
            name: 'إجمالي قيمة المخزون',
            simple: 'مجموع أسعار جميع السيارات النشطة',
            detail: 'اجمع سعر كل سيارة معروضة للبيع — هذا هو الرقم. يساعدك على فهم رأس المال المعرض للخطر.',
            tip: 'إذا كان هذا الرقم عالياً جداً مقارنة بالمبيعات، قد يكون لديك أموال كثيرة مقيدة في المخزون.',
          },
        ],
      },
      sales: {
        title: 'أداء المبيعات',
        description: 'مدى سرعة وفعالية بيعك',
        icon: TrendingUp,
        metrics: [
          {
            name: 'المباعة هذا الشهر',
            simple: 'عدد السيارات المباعة في الشهر الحالي',
            detail: 'يبدأ من جديد في الأول من كل شهر. هذا المقياس الأساسي لـ "كيف تسير الأمور؟"',
            tip: 'قارنه بالشهر الماضي. إذا كان أقل، اسأل لماذا — هل الموسم، التسعير، أم شيء آخر؟',
          },
          {
            name: 'متوسط أيام البيع',
            simple: 'في المتوسط، كم من الوقت من العرض إلى البيع',
            detail: 'نحسب من وقت نشر السيارة إلى تعليمها كمباعة. الأقل أفضل — يعني أن التسعير والعرض صحيحان.',
            tip: 'في سوق الإمارات، 30-45 يوماً طبيعي. أقل من 20 يوماً ممتاز. أكثر من 60 يوماً يعني شيء يحتاج تغيير.',
          },
          {
            name: 'الإيرادات هذا الشهر',
            simple: 'إجمالي قيمة السيارات المباعة هذا الشهر (بالدرهم)',
            detail: 'مجموع أسعار البيع لجميع السيارات المباعة هذا الشهر. ليس الربح — إنه إجمالي قيمة المبيعات.',
            tip: 'الإيرادات ÷ عدد المباعة = متوسط سعر البيع. تتبعه لمعرفة اتجاهك في السوق.',
          },
          {
            name: 'معدل البيع',
            simple: 'ما نسبة المخزون التي تُباع شهرياً',
            detail: 'إذا كان لديك 20 سيارة وبعت 4، هذا معدل بيع 20%. الأعلى أفضل.',
            tip: 'الوكالات الصحية تستهدف 15-25% شهرياً. أقل من 10% يعني أن السيارات تجلس طويلاً.',
          },
          {
            name: 'أسرع بيع',
            simple: 'أسرع بيع لك — أقل أيام من العرض إلى البيع',
            detail: 'هذا يُظهر أفضل سيناريو. ما الذي جعل هذه السيارة تُباع بسرعة؟ تعلم منه.',
            tip: 'انظر ما كان لدى هذه السيارة: صور رائعة؟ سعر تنافسي؟ موديل شائع؟ كرره.',
          },
        ],
      },
      engagement: {
        title: 'تفاعل العملاء',
        description: 'كيف يتفاعل المشترون مع إعلاناتك',
        icon: Eye,
        metrics: [
          {
            name: 'إجمالي المشاهدات',
            simple: 'كم مرة شاهد المشترون صفحات سياراتك',
            detail: 'في كل مرة ينقر شخص على إحدى سياراتك لرؤية التفاصيل الكاملة، هذه مشاهدة. المزيد = مشترين محتملين أكثر.',
            tip: 'إذا كانت المشاهدات قليلة، عناوينك أو أسعارك أو صورك الرئيسية قد لا تكون جذابة بما فيه الكفاية.',
          },
          {
            name: 'متوسط المشاهدات لكل إعلان',
            simple: 'المشاهدات مقسومة على عدد الإعلانات النشطة',
            detail: 'إذا كان لديك 10 سيارات بـ 500 مشاهدة إجمالية، هذا 50 مشاهدة لكل واحدة في المتوسط.',
            tip: 'إذا كانت سيارة بـ 200 مشاهدة وأخرى بـ 5، الثانية تحتاج مساعدة — صور أفضل، سعر مختلف.',
          },
          {
            name: 'الانطباعات',
            simple: 'كم مرة ظهرت سياراتك في نتائج البحث',
            detail: 'عندما يتصفح المشتري الإعلانات وتظهر سيارتك، هذا انطباع. لا يعني أنه نقر.',
            tip: 'انطباعات عالية لكن مشاهدات قليلة؟ صورتك المصغرة أو سعرك لا يلفت الانتباه.',
          },
          {
            name: 'المفضلة',
            simple: 'كم مشترٍ حفظ سياراتك في قائمة الرغبات',
            detail: 'عندما يضع شخص "قلب" على سيارتك، هو مهتم جدياً. قد يعود للشراء.',
            tip: 'المفضلة عملاء محتملين. إذا كانت سيارة بمفضلات كثيرة لكن بدون بيع، فكر في خفض بسيط للسعر.',
          },
          {
            name: 'معدل المشاهدة للمفضلة',
            simple: 'ما نسبة المشاهدين المهتمين بالحفظ',
            detail: 'إذا شاهد 100 شخص وفضّل 10، هذا 10%. الأعلى يعني إعلاناتك جذابة.',
            tip: 'فوق 5% جيد. فوق 10% ممتاز. أقل من 2% يعني الإعلان يبدو أفضل من الخارج.',
          },
        ],
      },
      bookings: {
        title: 'رؤى الحجوزات',
        description: 'تجارب القيادة والمواعيد',
        icon: Calendar,
        metrics: [
          {
            name: 'الحجوزات المعلقة',
            simple: 'طلبات تجربة قيادة تنتظر تأكيدك',
            detail: 'المشترون طلبوا رؤية سيارة. تحتاج للقبول أو الرفض. لا تتركهم منتظرين!',
            tip: 'استجب خلال ساعتين في أوقات العمل. الاستجابات البطيئة تفقد المبيعات.',
          },
          {
            name: 'الحجوزات المؤكدة',
            simple: 'تجارب قيادة مجدولة وافقت عليها',
            detail: 'أنت والمشتري التزمتما بموعد. هؤلاء أهم العملاء المحتملين.',
            tip: 'أرسل تذكيراً قبل يوم. جهّز السيارة نظيفة ومرتبة.',
          },
          {
            name: 'المكتملة هذا الشهر',
            simple: 'تجارب قيادة تمت فعلاً هذا الشهر',
            detail: 'المشتري حضر وشاهد السيارة. حتى لو لم يشترِ، تُحتسب.',
            tip: 'تتبع نسبة تحول تجارب القيادة إلى مبيعات. المعيار الصناعي 20-30%.',
          },
          {
            name: 'معدل الإلغاء',
            simple: 'ما نسبة الحجوزات التي تُلغى',
            detail: 'إذا تمت 10 حجوزات وألغيت 3، هذا 30%. بعض الإلغاء طبيعي.',
            tip: 'فوق 30% مقلق. اسأل نفسك: هل يجد المشترون شيئاً على الإنترنت لا يعجبهم قبل الحضور؟',
          },
          {
            name: 'معدل عدم الحضور',
            simple: 'المشترون الذين حجزوا ولم يحضروا',
            detail: 'قالوا سيأتون لكن لم يفعلوا. محبط لكنه يحدث.',
            tip: 'أرسل تذكيرات بالمواعيد. إذا كان عدم الحضور عالياً، فكر في طلب عربون صغير.',
          },
        ],
      },
      trends: {
        title: 'الاتجاهات الشهرية',
        description: 'كيف تتحسن (أو لا)',
        icon: Target,
        metrics: [
          {
            name: 'سهم أخضر لأعلى (↑)',
            simple: 'هذا الرقم ارتفع مقارنة بالشهر الماضي',
            detail: 'الأكثر عادة أفضل — مبيعات أكثر، مشاهدات أكثر، إعلانات أكثر. الأخضر أخبار جيدة.',
            tip: 'لا تحتفل بسهم أخضر واحد. ابحث عن تحسن مستمر على مدى 3+ أشهر.',
          },
          {
            name: 'سهم أحمر لأسفل (↓)',
            simple: 'هذا الرقم انخفض مقارنة بالشهر الماضي',
            detail: 'أقل من قبل. قد يكون مشكلة، قد يكون موسمياً. تحقق قبل القلق.',
            tip: 'شهر سيء واحد ليس نمطاً. لكن إذا ظهرت أسهم حمراء 2-3 أشهر متتالية، اتخذ إجراءً.',
          },
          {
            name: 'نسبة التغيير',
            simple: 'كم ارتفع أو انخفض، كنسبة مئوية',
            detail: '+25% يعني ربع أكثر من الشهر الماضي. -50% يعني النصف. أرقام أكبر = تغييرات أكبر.',
            tip: 'التغييرات الصغيرة (أقل من 10%) عادة تذبذب طبيعي. ركز على التغييرات فوق 20%.',
          },
        ],
      },
    },
    
    faqs: {
      title: 'أسئلة شائعة',
      items: [
        {
          q: 'أي مقياس أهم؟',
          a: 'لمعظم الوكلاء، "متوسط أيام البيع." يخبرك إذا كان التسعير والعرض يعملان. إذا تُباع السيارات بسرعة، أنت تفعل شيئاً صحيحاً.',
        },
        {
          q: 'المشاهدات قليلة — ماذا أفعل؟',
          a: 'أولاً، تحقق من صورك. الصورة الرئيسية حاسمة. ثانياً، تحقق من تسعيرك — إذا كنت مبالغاً مقارنة بسيارات مماثلة، المشترون يتجاوزونك. ثالثاً، تأكد أن عناوينك واضحة وكاملة.',
        },
        {
          q: 'لماذا لدي مفضلات كثيرة بدون مبيعات؟',
          a: 'هذا عادة يعني أن سعرك مرتفع قليلاً. المشترون يحبون السيارة لكن يعتقدون أنها غالية. جرب خفض 5-10% ولاحظ إذا حدث تحرك.',
        },
        {
          q: 'ما معدل البيع الجيد؟',
          a: 'استهدف 15-25% شهرياً. إذا كان لديك 20 سيارة، بيع 3-5 شهرياً صحي. أقل من 10% يعني مخزونك قديم — إما سيارات خاطئة أو أسعار خاطئة.',
        },
        {
          q: 'كم مرة تتحدث الإحصائيات؟',
          a: 'معظم الإحصائيات تتحدث فوراً أو خلال دقائق. مقارنات الشهور تتحدث عند منتصف ليل أول كل شهر.',
        },
      ],
    },
    
    tips: {
      title: 'نصائح سريعة',
      items: [
        'راجع لوحتك أسبوعياً، ليس يومياً. التذبذبات اليومية ضوضاء.',
        'ركز على 2-3 مقاييس تهم هدفك الحالي.',
        'إذا بدا شيء خاطئاً، اتخذ إجراءً خلال 48 ساعة.',
        'قارن أداءك بالشهر الماضي، ليس بوكلاء آخرين.',
        'الصور الجيدة هي المحرك الأول للمشاهدات. استثمر فيها.',
      ],
    },
  },
};

export default function PartnersInsightsPage() {
  const { language, isRTL } = useLanguage();
  const { setContent } = useAside();
  const t = content[language];
  const aside = asideSummary[language];
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  // Set aside content
  useEffect(() => {
    setContent(
      <div className="space-y-4">
        <p className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">
          {aside.title}
        </p>
        <div className="space-y-2">
          {aside.items.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground/70">
                <Icon className="h-3 w-3" />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-muted-foreground/40 pt-2 border-t border-border/20">
          {aside.footer}
        </p>
      </div>
    );
    return () => setContent(null);
  }, [language, setContent, aside]);

  const sections = Object.values(t.sections);

  return (
    <div className="space-y-12">
      {/* Header */}
      <header className="space-y-4">
        <div className="space-y-1">
          <p className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">
            {t.section}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{t.title}</h1>
        </div>
        <p className="text-sm text-muted-foreground/70 leading-relaxed max-w-xl">
          {t.intro}
        </p>
        {/* TL;DR Box */}
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.tldr}
            </p>
          </div>
        </div>
      </header>

      {/* Metric Sections */}
      {sections.map((section, sectionIndex) => {
        const Icon = section.icon;
        return (
          <section key={sectionIndex} className="space-y-4">
            {/* Section Header */}
            <div className="border-b border-border/30 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-lg font-medium tracking-tight">{section.title}</h2>
              </div>
              <p className="text-xs text-muted-foreground/60">{section.description}</p>
            </div>
            
            {/* Metrics Accordion */}
            <Accordion type="multiple" className="space-y-2">
              {section.metrics.map((metric, metricIndex) => (
                <AccordionItem 
                  key={metricIndex} 
                  value={`${sectionIndex}-${metricIndex}`}
                  className="border border-border/30 rounded-lg px-4 data-[state=open]:bg-muted/20"
                >
                  <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                    <div className="flex items-center gap-2 text-left">
                      <span>{metric.name}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 space-y-3">
                    {/* Simple explanation */}
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {metric.simple}
                    </p>
                    
                    {/* Detailed explanation */}
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {metric.detail}
                    </p>
                    
                    {/* Tip */}
                    <div className="flex items-start gap-2 rounded-md bg-blue-500/5 border border-blue-500/10 p-3 mt-2">
                      <Lightbulb className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                        {metric.tip}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        );
      })}

      {/* FAQs */}
      <section className="space-y-4">
        <div className="border-b border-border/30 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-medium tracking-tight">{t.faqs.title}</h2>
          </div>
        </div>
        
        <Accordion type="single" collapsible className="space-y-2">
          {t.faqs.items.map((faq, i) => (
            <AccordionItem 
              key={i} 
              value={`faq-${i}`}
              className="border border-border/30 rounded-lg px-4"
            >
              <AccordionTrigger className="text-sm font-medium hover:no-underline py-3 text-left">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Quick Tips */}
      <section className="space-y-4">
        <div className="border-b border-border/30 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-medium tracking-tight">{t.tips.title}</h2>
          </div>
        </div>
        
        <ul className="space-y-2">
          {t.tips.items.map((tip, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="text-xs text-muted-foreground/50 mt-0.5">{i + 1}.</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Back to Dashboard Link */}
      <div className="pt-4 border-t border-border/30">
        <Link 
          href="/partner-dashboard/insights"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <Arrow className="h-4 w-4" />
          <span>{isRTL ? 'العودة إلى لوحة التحكم' : 'Back to Partner Dashboard'}</span>
        </Link>
      </div>
    </div>
  );
}
