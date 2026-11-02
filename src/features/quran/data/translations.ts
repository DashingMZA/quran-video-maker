/**
 * Quran.com (api.quran.com/api/v4) verse translations, curated from the
 * live `/resources/translations` list on 2026-11-02.
 *
 * `id` is the `translations=` resource id used by
 * `/verses/by_chapter/{surahId}`; `languageCode` is the matching
 * `language=` ISO code for that translation. Both are sent together —
 * changing only one can return a mismatched or empty translation.
 *
 * NOTE: the old default id 131 no longer appears in the live resources
 * list and returns no verse translations at all (verified 2026-11-02).
 * The app default is now English — Saheeh International (20); Urdu
 * 234 (Fatah Muhammad Jalandhari) remains available in the list.
 */
export interface TranslationOption {
  id: number;
  languageCode: string;
  languageName: string;
  name: string;
  author: string;
}

export const TRANSLATIONS: TranslationOption[] = [
  // Urdu — default language, listed first
  { id: 234, languageCode: "ur", languageName: "Urdu", name: "Fatah Muhammad Jalandhari", author: "Fatah Muhammad Jalandhari" },
  { id: 54, languageCode: "ur", languageName: "Urdu", name: "Maulana Muhammad Junagarhi", author: "Maulana Muhammad Junagarhi" },
  { id: 97, languageCode: "ur", languageName: "Urdu", name: "Tafheem e Qur'an - Syed Abu Ali Maududi", author: "Syed Abu Ali Maududi" },
  { id: 158, languageCode: "ur", languageName: "Urdu", name: "Bayan-ul-Quran", author: "Dr. Israr Ahmad" },
  { id: 151, languageCode: "ur", languageName: "Urdu", name: "Shaykh al-Hind Mahmud al-Hasan (Tafsir E Usmani)", author: "Shaykh al-Hind Mahmud al-Hasan" },
  { id: 156, languageCode: "ur", languageName: "Urdu", name: "Fe Zilal al-Qur'an", author: "Sayyid Ibrahim Qutb" },
  { id: 819, languageCode: "ur", languageName: "Urdu", name: "Maulana Wahiduddin Khan", author: "Maulana Wahiduddin Khan" },
  { id: 831, languageCode: "ur", languageName: "Urdu", name: "Abul Ala Maududi (Roman Urdu)", author: "Abul Ala Maududi" },

  // English
  { id: 20, languageCode: "en", languageName: "English", name: "Saheeh International", author: "Saheeh International" },
  { id: 22, languageCode: "en", languageName: "English", name: "A. Yusuf Ali", author: "Abdullah Yusuf Ali" },
  { id: 19, languageCode: "en", languageName: "English", name: "M. Pickthall", author: "Mohammed Marmaduke William Pickthall" },
  { id: 85, languageCode: "en", languageName: "English", name: "M.A.S. Abdel Haleem", author: "Abdul Haleem" },
  { id: 84, languageCode: "en", languageName: "English", name: "T. Usmani", author: "Mufti Taqi Usmani" },
  { id: 95, languageCode: "en", languageName: "English", name: "A. Maududi (Tafhim commentary)", author: "Sayyid Abul Ala Maududi" },
  { id: 149, languageCode: "en", languageName: "English", name: "Fadel Soliman, Bridges' translation", author: "Fadel Soliman" },
  { id: 203, languageCode: "en", languageName: "English", name: "Al-Hilali & Khan", author: "Muhammad Taqi-ud-Din al-Hilali & Muhammad Muhsin Khan" },

  // Hindi
  { id: 122, languageCode: "hi", languageName: "Hindi", name: "Maulana Azizul Haque al-Umari", author: "Maulana Azizul Haque al-Umari" },

  // Bengali
  { id: 161, languageCode: "bn", languageName: "Bengali", name: "Taisirul Quran", author: "Tawheed Publication" },
  { id: 163, languageCode: "bn", languageName: "Bengali", name: "Sheikh Mujibur Rahman", author: "Darussalaam Publication" },
  { id: 162, languageCode: "bn", languageName: "Bengali", name: "Rawai Al-bayan", author: "Bayaan Foundation" },
  { id: 213, languageCode: "bn", languageName: "Bengali", name: "Dr. Abu Bakr Muhammad Zakaria", author: "Dr. Abu Bakr Muhammad Zakaria" },

  // Turkish
  { id: 77, languageCode: "tr", languageName: "Turkish", name: "Turkish Translation (Diyanet)", author: "Diyanet Isleri" },
  { id: 52, languageCode: "tr", languageName: "Turkish", name: "Elmalili Hamdi Yazir", author: "Elmalili Hamdi Yazir" },
  { id: 124, languageCode: "tr", languageName: "Turkish", name: "Muslim Shahin", author: "Muslim Shahin" },
  { id: 112, languageCode: "tr", languageName: "Turkish", name: "Shaban Britch", author: "Shaban Britch" },

  // Indonesian
  { id: 33, languageCode: "id", languageName: "Indonesian", name: "Indonesian Islamic Affairs Ministry", author: "Indonesian Islamic Affairs Ministry" },
  { id: 134, languageCode: "id", languageName: "Indonesian", name: "King Fahad Quran Complex", author: "King Fahad Quran Complex" },
  { id: 141, languageCode: "id", languageName: "Indonesian", name: "The Sabiq Company", author: "The Sabiq company" },

  // French
  { id: 31, languageCode: "fr", languageName: "French", name: "Muhammad Hamidullah", author: "Muhammad Hamidullah" },
  { id: 779, languageCode: "fr", languageName: "French", name: "Rashid Maash", author: "Rashid Maash" },
  { id: 136, languageCode: "fr", languageName: "French", name: "Montada Islamic Foundation", author: "Montada Islamic Foundation" },

  // Spanish
  { id: 83, languageCode: "es", languageName: "Spanish", name: "Sheikh Isa Garcia", author: "Sheikh Isa Garcia" },
  { id: 140, languageCode: "es", languageName: "Spanish", name: "Montada Islamic Foundation", author: "Montada Islamic Foundation" },
  { id: 199, languageCode: "es", languageName: "Spanish", name: "Noor International Center", author: "Noor International Center" },

  // Russian
  { id: 45, languageCode: "ru", languageName: "Russian", name: "Russian Translation (Elmir Kuliev)", author: "Elmir Kuliev" },
  { id: 79, languageCode: "ru", languageName: "Russian", name: "Abu Adel", author: "Abu Adel" },

  // German
  { id: 27, languageCode: "de", languageName: "German", name: "Frank Bubenheim and Nadeem", author: "Frank Bubenheim and Nadeem" },
  { id: 208, languageCode: "de", languageName: "German", name: "Abu Reda Muhammad ibn Ahmad", author: "Abu Reda Muhammad ibn Ahmad" },

  // Italian
  { id: 153, languageCode: "it", languageName: "Italian", name: "Hamza Roberto Piccardo", author: "Hamza Roberto Piccardo" },
  { id: 209, languageCode: "it", languageName: "Italian", name: "Othman al-Sharif", author: "Othman al-Sharif" },

  // Persian
  { id: 135, languageCode: "fa", languageName: "Persian", name: "IslamHouse.com", author: "IslamHouse.com" },
  { id: 29, languageCode: "fa", languageName: "Persian", name: "Hussein Taji Kal Dari", author: "Hussein Taji Kal Dari" },

  // Portuguese
  { id: 43, languageCode: "pt", languageName: "Portuguese", name: "Portuguese Translation (Samir)", author: "Samir El-Hayek" },
  { id: 103, languageCode: "pt", languageName: "Portuguese", name: "Helmi Nasr", author: "Helmi Nasr" },

  // Malay
  { id: 39, languageCode: "ms", languageName: "Malay", name: "Abdullah Muhammad Basmeih", author: "Abdullah Muhammad Basmeih" },

  // Tamil
  { id: 50, languageCode: "ta", languageName: "Tamil", name: "Jan Trust Foundation", author: "Jan Trust Foundation" },
  { id: 133, languageCode: "ta", languageName: "Tamil", name: "Abdul Hameed Baqavi", author: "Abdul Hameed Baqavi" },
  { id: 229, languageCode: "ta", languageName: "Tamil", name: "Sheikh Omar Sharif bin Abdul Salam", author: "Sheikh Omar Sharif bin Abdul Salam" },

  // Sindhi
  { id: 238, languageCode: "sd", languageName: "Sindhi", name: "Taj Mehmood Amroti", author: "Taj Mehmood Amroti" },

  // Pashto
  { id: 118, languageCode: "ps", languageName: "Pashto", name: "Zakaria Abulsalam", author: "Zakaria Abulsalam" },

  // Uzbek
  { id: 101, languageCode: "uz", languageName: "Uzbek", name: "Alauddin Mansour", author: "Alauddin Mansour" },
  { id: 127, languageCode: "uz", languageName: "Uzbek", name: "Muhammad Sodik Muhammad Yusuf", author: "Muhammad Sodik Muhammad Yusuf" },

  // Chinese
  { id: 56, languageCode: "zh", languageName: "Chinese", name: "Chinese Translation (Simplified) - Ma Jain", author: "Ma Jian" },
  { id: 109, languageCode: "zh", languageName: "Chinese", name: "Muhammad Makin", author: "Muhammad Makin" },

  // Dutch
  { id: 235, languageCode: "nl", languageName: "Dutch", name: "Malak Faris Abdalsalaam", author: "Malak Faris Abdalsalaam" },
  { id: 144, languageCode: "nl", languageName: "Dutch", name: "Sofian S. Siregar", author: "Sofian S. Siregar" },

  // Swahili
  { id: 49, languageCode: "sw", languageName: "Swahili", name: "Ali Muhsin Al-Barwani", author: "Ali Muhsin Al-Barwani" },
  { id: 231, languageCode: "sw", languageName: "Swahili", name: "Dr. Abdullah Muhammad Abu Bakr and Sheikh Nasir Khamis", author: "Dr. Abdullah Muhammad Abu Bakr and Sheikh Nasir Khamis" },
];

/** Languages in the order they first appear in TRANSLATIONS. */
export const TRANSLATION_LANGUAGES: { code: string; name: string }[] =
  TRANSLATIONS.reduce<{ code: string; name: string }[]>((acc, t) => {
    if (!acc.some((l) => l.code === t.languageCode)) {
      acc.push({ code: t.languageCode, name: t.languageName });
    }
    return acc;
  }, []);

export function getTranslationById(id: number): TranslationOption {
  return (
    TRANSLATIONS.find((t) => t.id === id) ?? TRANSLATIONS[0]
  );
}

export function getTranslationsForLanguage(languageCode: string): TranslationOption[] {
  return TRANSLATIONS.filter((t) => t.languageCode === languageCode);
}
