// আল্লাহর ৯৯ নাম — আরবি, উচ্চারণ, অর্থ ও অডিও
//
// কাঠামো:
//   - supremeName: "আল্লাহ" — সর্বোচ্চ নাম (ইসমে যাত)। কোনো নম্বর নেই, কোনো অডিও নেই।
//   - namesOfAllah: ৯৯টি নাম — আর রাহমান (১, 01.mp3) থেকে আস-সবুর (৯৯, 99.mp3)।
//
// অডিও সোর্স: https://www.hadithbd.com/99namesofallah/audio/01.mp3 ... 99.mp3

export interface NameOfAllah {
  id: number;            // 1..99
  arabic: string;        // الرحمن
  transliteration: string; // আর রাহমান
  meaning: string;       // পরম করুণাময়
  audio: string;         // https://www.hadithbd.com/99namesofallah/audio/01.mp3
}

// সর্বোচ্চ নাম — আল্লাহ (ইসমে যাত)। এর কোনো নম্বর বা অডিও নেই।
export const supremeName = {
  arabic: "اللَّهُ",
  transliteration: "আল্লাহ",
  meaning: "একমাত্র সত্য উপাস্য, সৃষ্টিকর্তা, পালনকর্তা — সকল সুন্দর নামের মূল",
};

const audioBase = "https://www.hadithbd.com/99namesofallah/audio/";
const audioUrl = (n: number) =>
  `${audioBase}${String(n).padStart(2, "0")}.mp3`;

export const namesOfAllah: NameOfAllah[] = [
  { id: 1, arabic: "الرَّحْمَنُ", transliteration: "আর রাহমান", meaning: "পরম করুণাময়", audio: audioUrl(1) },
  { id: 2, arabic: "الرَّحِيمُ", transliteration: "আর রাহীম", meaning: "অতি দয়ালু", audio: audioUrl(2) },
  { id: 3, arabic: "الْمَلِكُ", transliteration: "আল মালিক", meaning: "অধিপতি", audio: audioUrl(3) },
  { id: 4, arabic: "الْقُدُّوسُ", transliteration: "আল কুদ্দূস", meaning: "নিষ্কলুষ পবিত্র", audio: audioUrl(4) },
  { id: 5, arabic: "السَّلَامُ", transliteration: "আস সালাম", meaning: "শান্তি ও নিরাপত্তাদাতা", audio: audioUrl(5) },
  { id: 6, arabic: "الْمُؤْمِنُ", transliteration: "আল মু’মিন", meaning: "নিরাপত্তা দানকারী", audio: audioUrl(6) },
  { id: 7, arabic: "الْمُهَيْمِنُ", transliteration: "আল মুহাইমিন", meaning: "সর্ববিষয়ে রক্ষক", audio: audioUrl(7) },
  { id: 8, arabic: "الْعَزِيزُ", transliteration: "আল আযীয", meaning: "পরাক্রমশালী", audio: audioUrl(8) },
  { id: 9, arabic: "الْجَبَّارُ", transliteration: "আল জাব্বার", meaning: "প্রবল পরাক্রমী", audio: audioUrl(9) },
  { id: 10, arabic: "الْمُتَكَبِّرُ", transliteration: "আল মুতাকাব্বির", meaning: "মহান ও গর্বিত", audio: audioUrl(10) },
  { id: 11, arabic: "الْخَالِقُ", transliteration: "আল খালিক", meaning: "স্রষ্টা", audio: audioUrl(11) },
  { id: 12, arabic: "الْبَارِئُ", transliteration: "আল বারি", meaning: "সৃষ্টিকর্তা (নিখুঁত)", audio: audioUrl(12) },
  { id: 13, arabic: "الْمُصَوِّرُ", transliteration: "আল মুসাওয়ির", meaning: "রূপদাতা", audio: audioUrl(13) },
  { id: 14, arabic: "الْغَفَّارُ", transliteration: "আল গাফফার", meaning: "অধিক ক্ষমাশীল", audio: audioUrl(14) },
  { id: 15, arabic: "الْقَهَّارُ", transliteration: "আল কাহহার", meaning: "পরাক্রমী বিজয়ী", audio: audioUrl(15) },
  { id: 16, arabic: "الْوَهَّابُ", transliteration: "আল ওয়াহহাব", meaning: "অকাতরে দানকারী", audio: audioUrl(16) },
  { id: 17, arabic: "الرَّزَّاقُ", transliteration: "আর রাযযাক", meaning: "রিযিকদাতা", audio: audioUrl(17) },
  { id: 18, arabic: "الْفَتَّاحُ", transliteration: "আল ফাত্তাহ", meaning: "বিজয়ী ও উন্মোচক", audio: audioUrl(18) },
  { id: 19, arabic: "الْعَلِيمُ", transliteration: "আল আলীম", meaning: "সর্বজ্ঞ", audio: audioUrl(19) },
  { id: 20, arabic: "الْقَابِضُ", transliteration: "আল কাবিয", meaning: "রিযিক সংকুচিতকারী", audio: audioUrl(20) },
  { id: 21, arabic: "الْبَاسِطُ", transliteration: "আল বাসিত", meaning: "রিযিক প্রশস্তকারী", audio: audioUrl(21) },
  { id: 22, arabic: "الْخَافِضُ", transliteration: "আল খাফিয", meaning: "অবনমিতকারী", audio: audioUrl(22) },
  { id: 23, arabic: "الرَّافِعُ", transliteration: "আর রাফি‘", meaning: "উন্নীতকারী", audio: audioUrl(23) },
  { id: 24, arabic: "الْمُعِزُّ", transliteration: "আল মু‘য়িয", meaning: "সম্মান দানকারী", audio: audioUrl(24) },
  { id: 25, arabic: "الْمُذِلُّ", transliteration: "আল মুযিল্ল", meaning: "অপমানিতকারী", audio: audioUrl(25) },
  { id: 26, arabic: "السَّمِيعُ", transliteration: "আস সামী‘", meaning: "সর্বশ্রোতা", audio: audioUrl(26) },
  { id: 27, arabic: "الْبَصِيرُ", transliteration: "আল বাসীর", meaning: "সর্বদ্রষ্টা", audio: audioUrl(27) },
  { id: 28, arabic: "الْحَكَمُ", transliteration: "আল হাকাম", meaning: "চূড়ান্ত বিচারক", audio: audioUrl(28) },
  { id: 29, arabic: "الْعَدْلُ", transliteration: "আল আদল", meaning: "নিষ্পক্ষ ন্যায়বান", audio: audioUrl(29) },
  { id: 30, arabic: "اللَّطِيفُ", transliteration: "আল লাতীফ", meaning: "সূক্ষ্মজ্ঞানী ও কোমল", audio: audioUrl(30) },
  { id: 31, arabic: "الْخَبِيرُ", transliteration: "আল খাবীর", meaning: "সবিশেষ অবগত", audio: audioUrl(31) },
  { id: 32, arabic: "الْحَلِيمُ", transliteration: "আল হালীম", meaning: "সহনশীল", audio: audioUrl(32) },
  { id: 33, arabic: "الْعَظِيمُ", transliteration: "আল আযীম", meaning: "মহান", audio: audioUrl(33) },
  { id: 34, arabic: "الْغَفُورُ", transliteration: "আল গাফূর", meaning: "ক্ষমাশীল", audio: audioUrl(34) },
  { id: 35, arabic: "الشَّكُورُ", transliteration: "আশ শাকূর", meaning: "কৃতজ্ঞতা স্বীকারকারী", audio: audioUrl(35) },
  { id: 36, arabic: "الْعَلِيُّ", transliteration: "আল আলী", meaning: "সর্বোচ্চ", audio: audioUrl(36) },
  { id: 37, arabic: "الْكَبِيرُ", transliteration: "আল কাবীর", meaning: "সর্বাপেক্ষা বড়", audio: audioUrl(37) },
  { id: 38, arabic: "الْحَفِيظُ", transliteration: "আল হাফীয", meaning: "সংরক্ষক", audio: audioUrl(38) },
  { id: 39, arabic: "الْمُقِيتُ", transliteration: "আল মুকীত", meaning: "রিযিকের মাপ নির্ধারক", audio: audioUrl(39) },
  { id: 40, arabic: "الْحَسِيبُ", transliteration: "আল হাসীব", meaning: "হিসাব গ্রহণকারী", audio: audioUrl(40) },
  { id: 41, arabic: "الْجَلِيلُ", transliteration: "আল জালীল", meaning: "মহিমান্বিত", audio: audioUrl(41) },
  { id: 42, arabic: "الْكَرِيمُ", transliteration: "আল কারীম", meaning: "দানশীল", audio: audioUrl(42) },
  { id: 43, arabic: "الرَّقِيبُ", transliteration: "আর রাকীব", meaning: "পর্যবেক্ষক", audio: audioUrl(43) },
  { id: 44, arabic: "الْمُجِيبُ", transliteration: "আল মুজীب", meaning: "দু‘আ কবুলকারী", audio: audioUrl(44) },
  { id: 45, arabic: "الْوَاسِعُ", transliteration: "আল ওয়াসি‘", meaning: "প্রশস্ত", audio: audioUrl(45) },
  { id: 46, arabic: "الْحَكِيمُ", transliteration: "আল হাকীম", meaning: "প্রজ্ঞাবান", audio: audioUrl(46) },
  { id: 47, arabic: "الْوَدُودُ", transliteration: "আল ওয়াদূد", meaning: "প্রেমময়", audio: audioUrl(47) },
  { id: 48, arabic: "الْمَجِيدُ", transliteration: "আল মাজীদ", meaning: "মহিমান্বিত", audio: audioUrl(48) },
  { id: 49, arabic: "الْبَاعِثُ", transliteration: "আল বা‘স", meaning: "পুনরুত্থিতকারী", audio: audioUrl(49) },
  { id: 50, arabic: "الشَّهِيدُ", transliteration: "আশ শাহীد", meaning: "সর্বজ্ঞ সাক্ষী", audio: audioUrl(50) },
  { id: 51, arabic: "الْحَقُّ", transliteration: "আল হাক্ক", meaning: "সত্য", audio: audioUrl(51) },
  { id: 52, arabic: "الْوَكِيلُ", transliteration: "আল ওয়াকীল", meaning: "কর্মবিধায়ক ও কর্মবিশ্বস্ত", audio: audioUrl(52) },
  { id: 53, arabic: "الْقَوِيُّ", transliteration: "আল কাউইয়", meaning: "শক্তিমান", audio: audioUrl(53) },
  { id: 54, arabic: "الْمَتِينُ", transliteration: "আল মাতীন", meaning: "অটল ও দৃঢ়", audio: audioUrl(54) },
  { id: 55, arabic: "الْوَلِيُّ", transliteration: "আল ওয়ালী", meaning: "অভিভাবক ও সহায়", audio: audioUrl(55) },
  { id: 56, arabic: "الْحَمِيدُ", transliteration: "আল হামীদ", meaning: "সর্বপ্রশংসিত", audio: audioUrl(56) },
  { id: 57, arabic: "الْمُحْصِي", transliteration: "আল মুহসী", meaning: "গণনাকারী", audio: audioUrl(57) },
  { id: 58, arabic: "الْمُبْدِئُ", transliteration: "আল মুবদি", meaning: "সৃষ্টির আদিকর্তা", audio: audioUrl(58) },
  { id: 59, arabic: "الْمُعِيدُ", transliteration: "আল মু‘য়িদ", meaning: "পুনরায় সৃষ্টিকারী", audio: audioUrl(59) },
  { id: 60, arabic: "الْمُحْيِي", transliteration: "আল মুহয়ী", meaning: "জীবনদাতা", audio: audioUrl(60) },
  { id: 61, arabic: "الْمُمِيتُ", transliteration: "আল মুমীত", meaning: "মৃত্যুদাতা", audio: audioUrl(61) },
  { id: 62, arabic: "الْحَيُّ", transliteration: "আল হাইয়", meaning: "চিরঞ্জীব", audio: audioUrl(62) },
  { id: 63, arabic: "الْقَيُّومُ", transliteration: "আল কাইয়ূম", meaning: "স্বস্থিত স্থিতিশীল", audio: audioUrl(63) },
  { id: 64, arabic: "الْوَاجِدُ", transliteration: "আল ওয়াজিদ", meaning: "সর্বসম্পদী ও চিহ্নিতকারী", audio: audioUrl(64) },
  { id: 65, arabic: "الْمَاجِدُ", transliteration: "আল মাজিদ", meaning: "মহান ও দানশীল", audio: audioUrl(65) },
  { id: 66, arabic: "الْوَاحِدُ", transliteration: "আল ওয়াহিদ", meaning: "এক", audio: audioUrl(66) },
  { id: 67, arabic: "الْأَحَدُ", transliteration: "আল আহাদ", meaning: "একক ও অদ্বিতীয়", audio: audioUrl(67) },
  { id: 68, arabic: "الصَّمَدُ", transliteration: "আস সামাদ", meaning: "সর্বশ্রেষ্ঠ নির্ভরস্থল", audio: audioUrl(68) },
  { id: 69, arabic: "الْقَادِرُ", transliteration: "আল কাদির", meaning: "সর্বশক্তিমান", audio: audioUrl(69) },
  { id: 70, arabic: "الْمُقْتَدِرُ", transliteration: "আল মুকতাদির", meaning: "পূর্ণ ক্ষমতাশালী", audio: audioUrl(70) },
  { id: 71, arabic: "الْمُقَدِّمُ", transliteration: "আল মুকাদ্দিম", meaning: "অগ্রগামী ও অগ্রস্থাপক", audio: audioUrl(71) },
  { id: 72, arabic: "الْمُؤَخِّرُ", transliteration: "আল মুআখখির", meaning: "পিছিয়ে দেওয়ার কর্তা", audio: audioUrl(72) },
  { id: 73, arabic: "الْأَوَّلُ", transliteration: "আল আউয়াল", meaning: "আদি (যার আগে কিছু নেই)", audio: audioUrl(73) },
  { id: 74, arabic: "الْآخِرُ", transliteration: "আল আখির", meaning: "অন্ত (যার পরে কিছু নেই)", audio: audioUrl(74) },
  { id: 75, arabic: "الظَّاهِرُ", transliteration: "আয যাহির", meaning: "প্রকাশ ও ঊর্ধ্বে", audio: audioUrl(75) },
  { id: 76, arabic: "الْبَاطِنُ", transliteration: "আল বাতিন", meaning: "গোপন ও অন্তর্নিহিত", audio: audioUrl(76) },
  { id: 77, arabic: "الْوَالِي", transliteration: "আল ওয়ালী", meaning: "শাসনকর্তা ও দায়িত্বশীল", audio: audioUrl(77) },
  { id: 78, arabic: "الْمُتَعَالِي", transliteration: "আল মুতা‘আলী", meaning: "সর্বোচ্চ ও উর্ধ্ব", audio: audioUrl(78) },
  { id: 79, arabic: "الْبَرُّ", transliteration: "আল বার", meaning: "পুণ্যবান ও দয়ালু", audio: audioUrl(79) },
  { id: 80, arabic: "التَّوَّابُ", transliteration: "আত তাওয়াব", meaning: "তওবা কবুলকারী", audio: audioUrl(80) },
  { id: 81, arabic: "الْمُنْتَقِمُ", transliteration: "আল মুনতাকিম", meaning: "প্রতিশোধকারী", audio: audioUrl(81) },
  { id: 82, arabic: "الْعَفُوُّ", transliteration: "আল আফুউ", meaning: "ক্ষমাশীল", audio: audioUrl(82) },
  { id: 83, arabic: "الرَّؤُوفُ", transliteration: "আর রাউফ", meaning: "স্নেহশীল ও করুণাময়", audio: audioUrl(83) },
  { id: 84, arabic: "مَالِكُ الْمُلْكِ", transliteration: "মালিকুল মুলক", meaning: "রাজত্বের মালিক", audio: audioUrl(84) },
  { id: 85, arabic: "ذُو الْجَلَالِ وَالْإِكْرَامِ", transliteration: "যুল জালালি ওয়াল ইকরাম", meaning: "মহিমা ও সম্মানের অধিকারী", audio: audioUrl(85) },
  { id: 86, arabic: "الْمُقْسِطُ", transliteration: "আল মুকসিত", meaning: "ন্যায়বিচারক", audio: audioUrl(86) },
  { id: 87, arabic: "الْجَامِعُ", transliteration: "আল জামি‘", meaning: "সমবেতকারী", audio: audioUrl(87) },
  { id: 88, arabic: "الْغَنِيُّ", transliteration: "আল গানী", meaning: "অভাবমুক্ত ও ধনী", audio: audioUrl(88) },
  { id: 89, arabic: "الْمُغْنِي", transliteration: "আল মুগনী", meaning: "অভাবমুক্তকারী", audio: audioUrl(89) },
  { id: 90, arabic: "الْمَانِعُ", transliteration: "আল মানি‘", meaning: "বাধাদানকারী", audio: audioUrl(90) },
  { id: 91, arabic: "الضَّارُّ", transliteration: "আয যার", meaning: "ক্ষতিকারক", audio: audioUrl(91) },
  { id: 92, arabic: "النَّافِعُ", transliteration: "আন নাফি‘", meaning: "উপকারী", audio: audioUrl(92) },
  { id: 93, arabic: "النُّورُ", transliteration: "আন নূর", meaning: "আলো", audio: audioUrl(93) },
  { id: 94, arabic: "الْهَادِي", transliteration: "আল হাদী", meaning: "পথপ্রদর্শক", audio: audioUrl(94) },
  { id: 95, arabic: "الْبَدِيعُ", transliteration: "আল বাদী‘", meaning: "অভিনব স্রষ্টা", audio: audioUrl(95) },
  { id: 96, arabic: "الْبَاقِي", transliteration: "আল বাকী", meaning: "অবিনশ্বর চিরস্থায়ী", audio: audioUrl(96) },
  { id: 97, arabic: "الْوَارِثُ", transliteration: "আল ওয়ারিস", meaning: "উত্তরাধিকারী", audio: audioUrl(97) },
  { id: 98, arabic: "الرَّشِيدُ", transliteration: "আর রাশীদ", meaning: "পরামর্শদাতা ও সঠিক পথপ্রদর্শক", audio: audioUrl(98) },
  { id: 99, arabic: "الصَّبُورُ", transliteration: "আস-সবুর", meaning: "অতি সহনশীল ও ধৈর্যশীল", audio: audioUrl(99) },
];

export function getNameById(id: number): NameOfAllah | undefined {
  return namesOfAllah.find((n) => n.id === id);
}
