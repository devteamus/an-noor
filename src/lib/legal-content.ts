/**
 * আইনি পেজের কনটেন্ট (প্রাইভেসি পলিসি, শর্তাবলী, যোগাযোগ)।
 * /privacy, /terms, /contact — এই তিনটি আলাদা পেজে ব্যবহৃত হয়।
 */

export interface LegalSection {
  no: string;
  heading: string;
  text: string;
}

export interface LegalDoc {
  title: string;
  intro: string;
  sections: LegalSection[];
  outro: string;
}

/** "১. শিরোনাম: টেক্সট..." লাইনগুলো থেকে সেকশন বানায় */
export function parseLegalBody(body: string): LegalDoc {
  const lines = body.split("\n").map((l) => l.trim()).filter(Boolean);

  const intro: string[] = [];
  const outro: string[] = [];
  const sections: LegalSection[] = [];

  let current: LegalSection | null = null;
  for (const line of lines) {
    const m = line.match(/^([১-৯][০-৯]*)\.\s+(.*)$/);
    if (m) {
      current = { no: m[1], heading: "", text: "" };
      const rest = m[2];
      const sep = rest.indexOf(":");
      const sepBn = rest.indexOf("：");
      const cut = sepBn >= 0 ? sepBn : sep;
      if (cut > 0 && cut <= 40) {
        current.heading = rest.slice(0, cut).trim();
        current.text = rest.slice(cut + 1).trim();
      } else {
        current.text = rest;
      }
      sections.push(current);
    } else if (current) {
      if (current.text) current.text += " " + line;
      else current.text = line;
    } else {
      intro.push(line);
    }
  }

  // শেষ সেকশনের পরের ফাঁকা লাইনগুলো outro — এখানে body-র শেষ অংশ হিসেবে ধরি
  // (সহজ বাস্তবায়ন: intro-র মতোই, তবে সব সেকশন শেষ হওয়ার পর)
  return {
    title: "",
    intro: intro.join("\n"),
    sections,
    outro: outro.join("\n"),
  };
}

export const PRIVACY_BODY = `আন-নূর অ্যাপ আপনার গোপনীয়তা সুরক্ষায় অঙ্গীকারাবদ্ধ।

১. ডেটা সংগ্রহ: এই অ্যাপ কোনো ব্যক্তিগত তথ্য (নাম, ইমেইল, ফোন নম্বর) সংগ্রহ করে না। ব্যতিক্রম — অ্যাডমিন লগইনের সময় শুধু অ্যাডমিনের ইমেইল ও পাসওয়ার্ড (হ্যাশড) সার্ভারে থাকে।

২. লোকাল স্টোরেজ: আপনার সমস্ত দুআ কাউন্টার, আমলের হিসাব ও লাইভ তসবিহের ডেটা শুধুমাত্র আপনার ব্রাউজারের localStorage-এ সংরক্ষিত থাকে। এই ডেটা কখনো সার্ভারে পাঠানো হয় না।

৩. ব্লগ কনটেন্ট: ব্লগ আর্টিকেল ও তার ভিউ কাউন্ট সার্ভারে সংরক্ষিত থাকে, তবে এতে কোনো ব্যক্তিগত তথ্য থাকে না।

৪. থার্ড-পার্টি: অডিও প্লেব্যাকের জন্য YouTube ব্যবহৃত হয় (youtube-nocookie.com)। অডিও ফাইল (৯৯ নাম) hadithbd.com থেকে লোড হয়। এই সাইটগুলোর নিজস্ব প্রাইভেসি পলিসি প্রযোজ্য।

৫. কুকিজ: অ্যাডমিন সেশন কুকি ছাড়া অন্য ট্র্যাকিং কুকি ব্যবহার করা হয় না।

৬. বিজ্ঞাপন: এই অ্যাপে কোনো বিজ্ঞাপন নেই।

৭. আপনার অধিকার: আপনি যেকোনো সময় ব্রাউজার ডেটা মুছে সমস্ত লোকাল হিসাব মুছে ফেলতে পারেন।

যোগাযোগ: কোনো প্রশ্ন থাকলে যোগাযোগ পেজ দেখুন।`;

export const TERMS_BODY = `আন-নূর অ্যাপ ব্যবহার করে আপনি নিম্নলিখিত শর্তাবলীতে সম্মত হচ্ছেন।

১. উদ্দেশ্য: এই অ্যাপ শিক্ষা ও ব্যক্তিগত ইবাদতে সহায়তার জন্য তৈরি। এটি কোনো ইসলামী ফতোয়া বা চিকিৎসা পরামর্শের বিকল্প নয়।

২. রুকইয়াহ: রুকইয়াহ শুধুমাত্র একটি উপকরণ। সুস্থ করার একমাত্র মালিক মহান আল্লাহ। গুরুতর শারীরিক বা মানসিক সমস্যার জন্য যোগ্য চিকিৎসকের পরামর্শ নিন।

৩. কনটেন্ট: ব্লগ আর্টিকেল ও দুআসমূহ সর্বোচ্চ যত্নসহকারে তৈরি করা হয়েছে। তবুও কোনো ত্রুটি পেলে যোগাযোগ পেজে জানাবেন।

৪. অডিও: YouTube ও hadithbd.com-এর অডিও/ভিডিও তাদের নিজস্ব শর্তাবলীর অধীন।

৫. দায়বদ্ধতা: অ্যাপের ব্যবহারের ফলে কোনো ক্ষতির জন্য নির্মাতা দায়ী নন।

৬. পরিবর্তন: আমরা যেকোনো সময় শর্তাবলী বা অ্যাপের ফিচার পরিবর্তন করতে পারি।

৭. কপিরাইট: © ${new Date().getFullYear()} ফয়সাল হোসেন। সর্বস্বত্ব সংরক্ষিত।`;

export const CONTACT = {
  name: "ফয়সাল হোসেন",
  email: "ifaisal.eth@gmail.com",
  facebook: "https://www.facebook.com/iFaisalusa",
  facebookDisplay: "facebook.com/iFaisalusa",
};
