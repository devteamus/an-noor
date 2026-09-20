// আন-নূর — রুকইয়াহ ও নামাজের নিয়ম ডেটা

export interface RuqyahItem {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  note: string;
  accent: string; // tailwind gradient
}

export interface GosolRule {
  order: number;
  text: string;
}

export interface GosolSection {
  title: string;
  intro: string;
  rules: string[];
  cautions: string[];
}

// রুকইয়াহ সমূহ
export const ruqyahItems: RuqyahItem[] = [
  {
    id: "rizq-barrier-1",
    title: "রিজকের বাধা দূর করার শক্তিশালী রুকইয়াহ",
    description:
      "রোজগারের উপর থাকা সকল বাধা দূর করার জন্য মনযোগ দিয়ে শুনুন।",
    youtubeUrl: "https://pub-e0f4ae7db85a4d0db7d0f6d92401108b.r2.dev/rukaiya1.mp3",
    note:
      "রুকইয়াহ শুধুমাত্র একটা উপকরণ। সুস্থ করার, রিজিকের মালিক সবকিছুর মালিক একমাত্র মহান আল্লাহ। নিয়ত করবেন মহান আল্লাহ যেন আপনার রোজগারের উপরে থাকা সকল ধরনের বাধা দূর করে দেন। তারপর অত্যন্ত মনযোগ দিয়ে রিজিকের রুকইয়াটি শুনবেন। রুকইয়াহ শোনা অবস্থায় কোনো কাজ করা থেকে বিরত থাকবেন।",
    accent: "from-lime-500 to-green-600",
  },
  {
    id: "rizq-barrier-2",
    title: "রিজকের উপরে সমস্ত বাধা কাটানোর রুকইয়াহ",
    description:
      "রিজিকের উপর সকল প্রকার বাধা ও বাধাপ্রাপ্তি দূর করার শক্তিশালী রুকইয়াহ।",
    youtubeUrl: "https://www.youtube.com/watch?v=ttJNg9Spco8",
    note:
      "রুকইয়াহ শুধুমাত্র একটা উপকরণ। সুস্থ করার, রিজিকের মালিক সবকিছুর মালিক একমাত্র মহান আল্লাহ। নিয়ত করবেন মহান আল্লাহ যেন আপনার রোজগারের উপরে থাকা সকল ধরনের বাধা দূর করে দেন। তারপর অত্যন্ত মনযোগ দিয়ে রিজিকের রুকইয়াটি শুনবেন। রুকইয়াহ শোনা অবস্থায় কোনো কাজ করা থেকে বিরত থাকবেন।",
    accent: "from-emerald-500 to-teal-600",
  },
  {
    id: "badnazar-ruqyah",
    title: "বদনজর, হিংসা ও কালো যাদু ধ্বংসের শক্তিশালী রুকইয়াহ",
    description:
      "বদনজর, হিংসা ও কালো যাদু থেকে মুক্তির জন্য শক্তিশালী রুকইয়াহ।",
    youtubeUrl: "https://www.youtube.com/watch?v=vfQcVuIeLTo",
    note:
      "প্রতিদিন রাতে ঘুমানোর সময় শুনবেন। রুকইয়াহ শোনার সময় অন্য কাজ করবেন না। মনযোগ দিয়ে শুনবেন। সুস্থ করার একমাত্র মালিক মহান আল্লাহ। নিয়ত করবেন আল্লাহ যেন আপনাকে দ্রুত সুস্থ করে দেন।",
    accent: "from-rose-500 to-red-600",
  },
];

// বদনজরের (রুকইয়াহর) গোসলের নিয়ম
export const gosolRules: GosolSection = {
  title: "বদনজরের (রুকইয়াহর) গোসলের নিয়ম",
  intro:
    "প্রথমে একটি বালতি বা গামলায় পানি নিবেন। এরপর সেই পানিতে দুইহাত কবজি পর্যন্ত ডুবিয়ে নিম্নে বর্ণিত দরুদ শরিফ ও সুরাগুলো পড়বেন:",
  rules: [
    "১) দরুদ শরিফ (যেকোন দরুদ) ৭ বার",
    "২) সুরা ফাতিহা ৭ বার",
    "৩) আয়াতুল কুরসি ৭ বার",
    "৪) সুরা কাফিরুন ৭ বার",
    "৫) সুরা ইখলাস ৭ বার",
    "৬) সুরা ফালাক ৭ বার",
    "৭) সুরা নাস ৭ বার",
    "৮) শেষে আবার দরুদ শরিফ পড়বেন ৭ বার",
  ],
  cautions: [
    "দরুদ শরিফ ও সুরা পড়ে পানিতে ফুঁ দেওয়ার প্রয়োজন নেই।",
    "এই পানির সাথে অন্য কোনো পানি মিশাবেন না, শুধু এটা দিয়েই গোসল করবেন।",
    "যদি টয়লেট আর গোসলখানা একসাথে হয় তাহলে অবশ্যই বাইরে থেকে পানি পড়ে তারপর ভেতরে নিয়ে গোসল করবেন।",
    "প্রথমে এই পানি দিয়ে গোসল করার পর আপনি চাইলে অন্য পানি দিয়ে আবার গোসল করতে পারবেন।",
  ],
};

// পাঁচ ওয়াক্ত নামাজের নিয়ম
export interface NamazItem {
  id: string;
  name: string;
  rakat: string;
  time: string;
  description: string;
  youtubeUrl: string;
  accent: string;
  icon: string; // lucide icon name for the time of day
}

export const namazItems: NamazItem[] = [
  {
    id: "fajr",
    name: "ফজর নামাজ",
    rakat: "২ সুন্নাহ + ২ ফরজ",
    time: "ভোর (সুবহে সাদিক থেকে সূর্যোদয়ের আগ পর্যন্ত)",
    description:
      "দিনের প্রথম নামাজ। ফজরের নামাজের ফজিলত অপরিসীম — যে ফজরের নামাজ আদায় করে সে আল্লাহর হিফাজতে থাকে।",
    youtubeUrl: "https://www.youtube.com/watch?v=KmSX_LOa_W0",
    accent: "from-amber-400 to-orange-500",
    icon: "Sunrise",
  },
  {
    id: "dhuhr",
    name: "যোহর নামাজ",
    rakat: "৪ সুন্নাহ + ৪ ফরজ + ২ সুন্নাহ",
    time: "দুপুর (সূর্য ঢলে পড়ার পর থেকে আসরের আগ পর্যন্ত)",
    description:
      "দুপুরের নামাজ। যোহরের আগের ও পরের সুন্নাহ আদায় করা অত্যন্ত ফজিলতপূর্ণ।",
    youtubeUrl: "https://www.youtube.com/watch?v=FrtBwo0YtjI",
    accent: "from-yellow-400 to-amber-500",
    icon: "Sun",
  },
  {
    id: "asr",
    name: "আসর নামাজ",
    rakat: "৪ ফরজ",
    time: "বিকেল (ছায়া বস্তুর দ্বিগুণ হওয়ার পর থেকে সূর্যাস্তের আগ পর্যন্ত)",
    description:
      "বিকেলের নামাজ। আসরের নামাজ ছাড়ার ভয়াবহ পরিণতি সম্পর্কে হাদিসে সতর্ক করা হয়েছে।",
    youtubeUrl: "https://www.youtube.com/watch?v=iTz25vO64eA",
    accent: "from-orange-400 to-rose-500",
    icon: "Sunset",
  },
  {
    id: "maghrib",
    name: "মাগরিবের নামাজ",
    rakat: "৩ ফরজ + ২ সুন্নাহ",
    time: "সন্ধ্যা (সূর্যাস্তের পর থেকে শফাক বা গোধূলি শেষ হওয়া পর্যন্ত)",
    description:
      "সূর্যাস্তের পরপরই মাগরিবের নামাজ আদায় করা মুস্তাহাব। দেরি করা মাকরুহ।",
    youtubeUrl: "https://www.youtube.com/watch?v=gNDAroo4vRk",
    accent: "from-rose-400 to-purple-500",
    icon: "Moon",
  },
  {
    id: "isha",
    name: "এশার নামাজ",
    rakat: "৪ সুন্নাহ + ৪ ফরজ + ২ সুন্নাহ + ৩ বিতর",
    time: "রাত (শফাক শেষ হওয়ার পর থেকে সুবহে সাদিকের আগ পর্যন্ত)",
    description:
      "রাতের নামাজ। এশার নামাজ জামাতে আদায় করা অত্যন্ত ফজিলতপূর্ণ। বিতর নামাজ ওয়াজিব।",
    youtubeUrl: "https://www.youtube.com/watch?v=aGXGbLuggRo",
    accent: "from-indigo-500 to-blue-700",
    icon: "Star",
  },
];
