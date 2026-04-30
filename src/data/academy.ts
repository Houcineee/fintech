export type LessonSlide = {
  text: string;
  imagePrompt: string;
  keyConcept?: string;
};

export type Lesson = {
  id: string;
  title: string;
  category: string;
  icon: string;
  xpReward: number;
  slides: LessonSlide[];
};

export const academyLessons: Lesson[] = [
  {
    id: "halal-earning",
    title: "الكسب الطيب",
    category: "الأساسيات",
    icon: "briefcase",
    xpReward: 50,
    slides: [
      {
        text: "العمل في الإسلام هو عبادة جميلة. نحن نسعى لنكسب رزقنا بجد وإخلاص.",
        imagePrompt: "cute dynamic character working happily in a garden, bright colors, islamic style",
        keyConcept: "العمل عبادة"
      },
      {
        text: "القاعدة الأهم هي **الكسب الحلال**. وهو المال الذي يأتي من الصدق وتقديم الفائدة للناس.",
        imagePrompt: "a merchant showing honest fruits to a customer, friendly atmosphere",
        keyConcept: "الرزق الحلال"
      },
      {
        text: "عندما نبتعد عن الغش والخداع، يبارك الله في أموالنا وتنمو حياتنا بالسعادة.",
        imagePrompt: "sparkling gold coins with a green leaf, symbolizing growth and blessing",
        keyConcept: "البركة"
      }
    ]
  },
  {
    id: "zakat-sadaqah",
    title: "حق المال: العطاء",
    category: "العطاء",
    icon: "heart",
    xpReward: 50,
    slides: [
      {
        text: "المال الذي في يدنا هو أمانة. الله يحب أن نتشارك جزءاً منه مع المحتاجين.",
        imagePrompt: "hand giving a glowing coin to another hand, warm lighting",
        keyConcept: "الأمانة"
      },
      {
        text: "**الزكاة** هي حق معلوم للفقراء، وهي تطهر أموالنا وتجعلها مباركة.",
        imagePrompt: "a beautiful fountain of water, symbolizing purification of wealth",
        keyConcept: "تطهير المال"
      },
      {
        text: "أما **الصدقة** فهي حب وعطاء، تجعل المجتمع قوياً ومترابطاً كالبنيان الواحد.",
        imagePrompt: "children sharing toys and food, happy community scene",
        keyConcept: "التكافل الاجتماعي"
      }
    ]
  },
  {
    id: "no-riba",
    title: "مساعدة الآخرين",
    category: "المعاملات",
    icon: "hand-left",
    xpReward: 50,
    slides: [
      {
        text: "في الإسلام، نحن نساعد بعضنا البعض لأننا إخوة، وليس لنستغل حاجة الناس.",
        imagePrompt: "two friends helping each other climb a hill, supportive atmosphere",
        keyConcept: "الأخوة"
      },
      {
        text: "لذلك، حرّم الله **الربا**، وهو طلب مال إضافي مقابل مساعدة شخص محتاج.",
        imagePrompt: "a red circle over an unfair scale, simple visual prohibition",
        keyConcept: "العدل"
      },
      {
        text: "**القرض الحسن** هو أن تقرض أخاك ماله دون زيادة، طلباً للأجر من الله وحده.",
        imagePrompt: "a glowing heart above a purse, representing pure intention",
        keyConcept: "الإحسان"
      }
    ]
  },
  {
    id: "no-gharar",
    title: "الوضوح والصدق",
    category: "المعاملات",
    icon: "document-text",
    xpReward: 50,
    slides: [
      {
        text: "عندما نتفق على بيع أو شراء، يجب أن يكون كل شيء واضحاً كالشمس.",
        imagePrompt: "a bright sun shining over a marketplace, clarity",
        keyConcept: "الوضوح"
      },
      {
        text: "الإسلام ينهى عن **الغرر**، وهو إخفاء العيوب أو جعل المعاملة غير واضحة.",
        imagePrompt: "a magnifying glass showing a clean product, transparency",
        keyConcept: "الصدق"
      },
      {
        text: "**الشفافية** تبني الثقة بين الناس، وتجعل الجميع سعيداً وراضياً بالاتفاق.",
        imagePrompt: "two people shaking hands with smiles, trust and satisfaction",
        keyConcept: "التراضي"
      }
    ]
  },
  {
    id: "spending-balance",
    title: "التوازن في الصرف",
    category: "السلوك",
    icon: "scale",
    xpReward: 50,
    slides: [
      {
        text: "المسلم ذكي في صرف ماله، فهو لا يبذّر ولا يبخل.",
        imagePrompt: "a balanced scale with a coin and a heart, perfect equilibrium",
        keyConcept: "الوسطية"
      },
      {
        text: "نبتعد عن **الإسراف**، وهو ضياع المال في أشياء لا نحتاجها فعلاً.",
        imagePrompt: "too many toys overflowing a box, symbolizing excess",
        keyConcept: "تجنب التبذير"
      },
      {
        text: "نتعلم الفرق بين **الضروريات** التي نحتاجها لنعيش، و**الكماليات** التي نؤجلها.",
        imagePrompt: "a small house and bread on one side, a toy car on the other",
        keyConcept: "حسن التدبير"
      }
    ]
  },
  {
    id: "amanah",
    title: "إتقان العمل",
    category: "الأساسيات",
    icon: "shield-checkmark",
    xpReward: 50,
    slides: [
      {
        text: "الله يحب إذا عملنا عملاً أن نتقنه ونؤديه بأفضل صورة ممكنة.",
        imagePrompt: "a craftsman carefully painting a vase, focus and skill",
        keyConcept: "الإتقان"
      },
      {
        text: "**الأمانة** في العمل تعني الصدق في الوقت والجهد، وعدم الغش أبداً.",
        imagePrompt: "a shield with a checkmark, representing reliability",
        keyConcept: "الأمانة"
      },
      {
        text: "**الجودة** هي ثمرة الإتقان، وهي التي تجعل الناس يحبون عملك ويحترمونه.",
        imagePrompt: "a shining star on a finished product, success",
        keyConcept: "التميز"
      }
    ]
  }
];

