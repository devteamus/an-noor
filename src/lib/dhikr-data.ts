// গুরুত্বপূর্ণ ছোট জিকির — লাইভ তসবিহের জন্য
// প্রতিটি জিকির: আরবি, বাংলা নাম, ডিফল্ট লক্ষ্য, সংক্ষিপ্ত ফজিলত, অডিও URL
// অডিও সোর্স: myislam.org tasbih counter

export interface DhikrItem {
  id: string;
  name: string;          // বাংলা নাম (জিকির)
  arabic: string;        // আরবি
  transliteration: string; // ল্যাটিন উচ্চারণ
  defaultTarget: number; // দৈনিক ডিফল্ট লক্ষ্য
  virtue: string;        // সংক্ষিপ্ত ফজিলত
  audio: string;         // অডিও URL
}

const audioBase = "https://quranaudio.myislam.org/audio/tasbih%20counter/";

export const dhikrItems: DhikrItem[] = [
  {
    id: "bismillah",
    name: "বিসমিল্লাহ",
    arabic: "بِسْمِ اللَّهِ",
    transliteration: "Bismillah",
    defaultTarget: 100,
    virtue: "বরকতের দুয়া — যেকোনো কাজের শুরুতে",
    audio: audioBase + "1.%20bismillah.mp3",
  },
  {
    id: "subhanallah",
    name: "সুবহানাল্লাহ",
    arabic: "سُبْحَانَ اللَّهِ",
    transliteration: "Subhanallah",
    defaultTarget: 33,
    virtue: "আল্লাহর পবিত্রতা ঘোষণা করা",
    audio: audioBase + "2.%20subhanallah.mp3",
  },
  {
    id: "alhamdulillah",
    name: "আলহামদুলিল্লাহ",
    arabic: "ٱلْحَمْدُ لِلّٰهِ",
    transliteration: "Alhamdulillah",
    defaultTarget: 33,
    virtue: "আল্লাহর প্রশংসা ও কৃতজ্ঞতা",
    audio: audioBase + "3.%20alhamdulilah.mp3",
  },
  {
    id: "allahu-akbar",
    name: "আল্লাহু আকবার",
    arabic: "اللَّهُ أَكْبَرُ",
    transliteration: "Allahu Akbar",
    defaultTarget: 34,
    virtue: "আল্লাহর মহত্ত্ব ঘোষণা",
    audio: audioBase + "4.%20allahu%20akbar.mp3",
  },
  {
    id: "la-ilaha-illallah",
    name: "লা ইলাহা ইল্লাল্লাহ",
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ",
    transliteration: "La ilaha illallah",
    defaultTarget: 100,
    virtue: "তাওহীদের সর্বশ্রেষ্ঠ বাক্য",
    audio: audioBase + "5.%20La%20ilaha%20illallah.mp3",
  },
  {
    id: "subhanallah-wa-bihamdih",
    name: "সুবহানাল্লাহি ওয়া বিহামদিহি",
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    transliteration: "Subhan-Allahi wa bihamdih",
    defaultTarget: 100,
    virtue: "গুনাহ মাফের বড় ফজিলত",
    audio: audioBase + "6.%20Subhan-Allahi%20wa%20bihamdih.mp3",
  },
  {
    id: "astaghfirullah",
    name: "আস্তাগফিরুল্লাহ",
    arabic: "أَسْتَغْفِرُ اللَّهَ",
    transliteration: "Astaghfirullah",
    defaultTarget: 100,
    virtue: "আল্লাহর কাছে ক্ষমা প্রার্থনা",
    audio: audioBase + "7.%20Astaghfirullah.mp3",
  },
  {
    id: "subhanallahil-azim",
    name: "সুবহানাল্লাহিল আজীম",
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
    transliteration: "Subhan-Allahi wa bihamdihi, Subhan-Allahil-Azim",
    defaultTarget: 100,
    virtue: "জিহ্বায় হালকা, আমলের পাল্লায় ভারী",
    audio:
      audioBase +
      "8.%20Subhan-Allahi%20wa%20bihamdihi,%20Subhan-Allahil-Azim.mp3",
  },
  {
    id: "ya-hayyu",
    name: "ইয়া হাইয়্যু ইয়া ক্বাইয়্যূম",
    arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ",
    transliteration: "Ya hayyu ya qayyum bi-rahmatika astagheeth",
    defaultTarget: 100,
    virtue: "কষ্টে পতন ঠেকানোর শক্তিশালী দুয়া",
    audio:
      audioBase +
      "9.%20Ya%20hayyu%20ya%20qayyum%20bi-rahmatika%20astagheeth.mp3",
  },
  {
    id: "subhanallah-combo",
    name: "সুবহানাল্লাহি ওয়ালহামদুলিল্লাহ...",
    arabic:
      "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ",
    transliteration:
      "Subhan-Allah wal-hamdu-lillah wa la ilaha illallah wa Allahu Akbar",
    defaultTarget: 100,
    virtue: "চারটি প্রিয় কালিমার সমাহার",
    audio:
      audioBase +
      "10.%20Subhan-Allah%20wal-hamdu-lillah%20wa%20la%20ilaha%20illallah%20wa%20Allahu%20Akbar.mp3",
  },
  {
    id: "la-hawla",
    name: "লা হাওলা ওয়া লা কুওয়াতা ইল্লা বিল্লাহ",
    arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    transliteration: "La hawla wa la quwwata illa billah",
    defaultTarget: 100,
    virtue: "জান্নাতের ধনভাণ্ডারের বাক্য",
    audio:
      audioBase + "11.%20La%20hawla%20wa%20la%20quwwata%20illa%20billah.mp3",
  },
  {
    id: "astaghfirullah-wa-atubu",
    name: "আস্তাগফিরুল্লাহা ওয়া আতুবু ইলাইহি",
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    transliteration: "Subhan-Allahi wa bihamdihi, Astaghfirullah wa atubu ilaih",
    defaultTarget: 100,
    virtue: "ক্ষমা ও তওবার আমল",
    audio:
      audioBase +
      "12.%20Subhan-Allahi%20wa%20bihamdihi,%20Astaghfirullah%20wa%20atubu%20ilaih.mp3",
  },
  {
    id: "rabbighfir-li",
    name: "রব্বিগফিরলি ওয়াতুব আলাইয়্যা",
    arabic: "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الْغَفُورُ",
    transliteration: "Rabbighfirli watub alayya innaka antat-Tawwabul-Ghafur",
    defaultTarget: 100,
    virtue: "ক্ষমা ও তওবার দুয়া",
    audio:
      audioBase +
      "13.%20Rabbighfirli%20watub%20alayya%20innaka%20antat-Tawwabul-Ghafur.mp3",
  },
  {
    id: "allahummaghfir-li",
    name: "আল্লাহুম্মাগফির লি ওয়ারহামনি",
    arabic:
      "اللَّهُمَّ اغْفِرْ لِي وَارْحَمْنِي وَاجْبُرْنِي وَاهْدِنِي وَارْزُقْنِي",
    transliteration:
      "Allahumm-aghfir li warhamni wajburni wahdini warzuqni",
    defaultTarget: 100,
    virtue: "ক্ষমা, রহমত, হেদায়েত ও রিজিকের দুয়া",
    audio:
      audioBase +
      "14.%20Allahumm-aghfir%20li%20warhamni%20wajburni%20wahdini%20warzuqni.mp3",
  },
  {
    id: "la-ilaha-wahdahu",
    name: "লা ইলাহা ইল্লাল্লাহু ওয়াহদাহু",
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    transliteration: "La ilaha illallah wahdahu la sharika lahu",
    defaultTarget: 100,
    virtue: "একত্ববোধের শক্তিশালী জিকির",
    audio:
      audioBase +
      "15.%20La%20ilaha%20illallah%20wahdahu%20la%20sharika%20lahu.mp3",
  },
  {
    id: "durud-sharif",
    name: "দরুদ শরিফ (আল্লাহুম্মা সাল্লি আলা মুহাম্মাদ)",
    arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ",
    transliteration: "Allahumma Salli ala Muhammadin wa ala aali Muhammadin",
    defaultTarget: 100,
    virtue: "১০ রহমত, ১০ গুনাহ মাফ, ১০ মর্যাদা বৃদ্ধি",
    audio:
      audioBase +
      "16.%20Allahumma%20Salli%20ala%20Muhammadin%20wa%20ala%20aali%20Muhammadin.mp3",
  },
];

export function getDhikrById(id: string): DhikrItem | undefined {
  return dhikrItems.find((d) => d.id === id);
}
