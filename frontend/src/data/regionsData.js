// O'zbekiston hududlari: Toshkent shahri (12 ta tuman) va barcha viloyatlar tuman/shaharlari bilan
export const UZBEKISTAN_REGIONS = [
  {
    id: "tashkent_city",
    name: "Toshkent shahri",
    center: { lat: 41.2995, lng: 69.2401 },
    districts: [
      { id: "yunusobod", name: "Yunusobod tumani", lat: 41.3644, lng: 69.2882 },
      { id: "chilonzor", name: "Chilonzor tumani", lat: 41.2721, lng: 69.2045 },
      { id: "mirzo_ulugbek", name: "Mirzo Ulug'bek tumani", lat: 41.3283, lng: 69.3344 },
      { id: "mirobod", name: "Mirobod tumani", lat: 41.2917, lng: 69.2789 },
      { id: "shayxontohur", name: "Shayxontohur tumani", lat: 41.3195, lng: 69.2412 },
      { id: "yakkasaroy", name: "Yakkasaroy tumani", lat: 41.2825, lng: 69.2536 },
      { id: "olmazor", name: "Olmazor tumani", lat: 41.3536, lng: 69.2215 },
      { id: "uchtepa", name: "Uchtepa tumani", lat: 41.2941, lng: 69.1752 },
      { id: "yashnobod", name: "Yashnobod tumani", lat: 41.2981, lng: 69.3402 },
      { id: "sergeli", name: "Sergeli tumani", lat: 41.2235, lng: 69.2201 },
      { id: "yangihayot", name: "Yangihayot tumani", lat: 41.2008, lng: 69.1985 },
      { id: "bektemir", name: "Bektemir tumani", lat: 41.2334, lng: 69.3361 }
    ]
  },
  {
    id: "tashkent_region",
    name: "Toshkent viloyati",
    center: { lat: 41.3111, lng: 69.2797 },
    districts: [
      { id: "chirchiq", name: "Chirchiq shahri", lat: 41.4689, lng: 69.5822 },
      { id: "olmaliq", name: "Olmaliq shahri", lat: 40.8542, lng: 69.5986 },
      { id: "angren", name: "Angren shahri", lat: 41.0167, lng: 70.1436 },
      { id: "bekobod_shahar", name: "Bekobod shahri", lat: 40.2167, lng: 69.2167 },
      { id: "nurafshon", name: "Nurafshon shahri", lat: 41.0417, lng: 69.3583 },
      { id: "qibray", name: "Qibray tumani", lat: 41.3833, lng: 69.4667 },
      { id: "zangiota", name: "Zangiota tumani", lat: 41.2333, lng: 69.1500 },
      { id: "toshkent_tuman", name: "Toshkent tumani (Keles)", lat: 41.4000, lng: 69.2000 },
      { id: "yangiyol", name: "Yangiyo'l tumani va shahri", lat: 41.1167, lng: 69.0500 },
      { id: "parkent", name: "Parkent tumani", lat: 41.2944, lng: 69.6764 },
      { id: "bostoliq", name: "Bo'stonliq tumani (G'azalkent)", lat: 41.5667, lng: 69.7667 },
      { id: "chinoz", name: "Chinoz tumani", lat: 40.9333, lng: 68.7500 },
      { id: "orta_chirchiq", name: "O'rta Chirchiq tumani", lat: 41.0833, lng: 69.3333 },
      { id: "yuqori_chirchiq", name: "Yuqori Chirchiq tumani", lat: 41.2833, lng: 69.5333 },
      { id: "quyi_chirchiq", name: "Quyi Chirchiq tumani", lat: 40.9500, lng: 68.9667 },
      { id: "ohu", name: "Ohangaron tumani", lat: 40.9067, lng: 69.6383 },
      { id: "piskent", name: "Piskent tumani", lat: 40.8983, lng: 69.3517 },
      { id: "bekobod_tuman", name: "Bekobod tumani", lat: 40.2500, lng: 69.2500 }
    ]
  },
  {
    id: "samarkand",
    name: "Samarqand viloyati",
    center: { lat: 39.6542, lng: 66.9597 },
    districts: [
      { id: "samarkand_city", name: "Samarqand shahri", lat: 39.6542, lng: 66.9597 },
      { id: "urgut", name: "Urgut tumani", lat: 39.4056, lng: 67.2431 },
      { id: "kattaqorgon", name: "Kattaqo'rg'on shahri va tumani", lat: 39.8978, lng: 66.2575 },
      { id: "pastdargom", name: "Pastdarg'om tumani (Juma)", lat: 39.7167, lng: 66.6500 },
      { id: "oqdaryo", name: "Oqdaryo tumani (Loyish)", lat: 39.8333, lng: 66.7833 },
      { id: "samarkand_district", name: "Samarqand tumani", lat: 39.6167, lng: 66.9000 },
      { id: "bulungur", name: "Bulung'ur tumani", lat: 39.7600, lng: 67.2700 },
      { id: "jomvoy", name: "Jomboy tumani", lat: 39.7000, lng: 67.0833 },
      { id: "isfaxon", name: "Ishtixon tumani", lat: 39.9667, lng: 66.4833 },
      { id: "payariq", name: "Payariq tumani", lat: 40.0167, lng: 66.8500 },
      { id: "tayloq", name: "Toyloq tumani", lat: 39.5833, lng: 67.1167 },
      { id: "narpay", name: "Narpay tumani", lat: 40.0500, lng: 65.9833 },
      { id: "paxtachi", name: "Paxtachi tumani", lat: 40.0333, lng: 65.7167 },
      { id: "nurobod", name: "Nurobod tumani", lat: 39.6167, lng: 66.2833 }
    ]
  },
  {
    id: "bukhara",
    name: "Buxoro viloyati",
    center: { lat: 39.7670, lng: 64.4231 },
    districts: [
      { id: "bukhara_city", name: "Buxoro shahri", lat: 39.7670, lng: 64.4231 },
      { id: "gijduvon", name: "G'ijduvon tumani", lat: 40.1000, lng: 64.6833 },
      { id: "kogon", name: "Kogon shahri va tumani", lat: 39.7228, lng: 64.5514 },
      { id: "vobkent", name: "Vobkent tumani", lat: 40.0333, lng: 64.5167 },
      { id: "shofirkon", name: "Shofirkon tumani", lat: 40.1167, lng: 64.5000 },
      { id: "romitan", name: "Romitan tumani", lat: 39.9333, lng: 64.3833 },
      { id: "buxoro_district", name: "Buxoro tumani (Galaosiyo)", lat: 39.8500, lng: 64.4500 },
      { id: "jondor", name: "Jondor tumani", lat: 39.7333, lng: 64.1833 },
      { id: "olot", name: "Olot tumani", lat: 39.4167, lng: 63.8000 },
      { id: "qorakol", name: "Qorako'l tumani", lat: 39.5000, lng: 63.8500 },
      { id: "peshku", name: "Peshku tumani", lat: 40.0500, lng: 64.3333 },
      { id: "qorovulbozor", name: "Qorovulbozor tumani", lat: 39.5000, lng: 64.8000 }
    ]
  },
  {
    id: "andijan",
    name: "Andijon viloyati",
    center: { lat: 40.7821, lng: 72.3442 },
    districts: [
      { id: "andijan_city", name: "Andijon shahri", lat: 40.7821, lng: 72.3442 },
      { id: "asaka", name: "Asaka shahri va tumani", lat: 40.6417, lng: 72.2389 },
      { id: "shahrixon", name: "Shahrixon tumani", lat: 40.7167, lng: 72.0500 },
      { id: "xonobod", name: "Xonobod shahri", lat: 40.8000, lng: 73.0000 },
      { id: "qorgontepa", name: "Qo'rg'ontepa tumani", lat: 40.7333, lng: 72.7667 },
      { id: "andijan_district", name: "Andijon tumani (Kuyganyor)", lat: 40.8500, lng: 72.3333 },
      { id: "oltinkol", name: "Oltinko'l tumani", lat: 40.8000, lng: 72.1667 },
      { id: "baliqchi", name: "Baliqchi tumani", lat: 40.9333, lng: 71.9000 },
      { id: "izboskan", name: "Izboskan tumani (Poytug')", lat: 40.9000, lng: 72.2500 },
      { id: "paxtaobod", name: "Paxtaobod tumani", lat: 40.9333, lng: 72.5000 },
      { id: "marhamat", name: "Marhamat tumani", lat: 40.5000, lng: 72.3333 },
      { id: "buloqboshi", name: "Buloqboshi tumani", lat: 40.6167, lng: 72.5167 },
      { id: "xojabod", name: "Xo'jaobod tumani", lat: 40.6667, lng: 72.5667 },
      { id: "jalaquduq", name: "Jalaquduq tumani", lat: 40.7167, lng: 72.6500 }
    ]
  },
  {
    id: "fergana",
    name: "Farg'ona viloyati",
    center: { lat: 40.3842, lng: 71.7843 },
    districts: [
      { id: "fergana_city", name: "Farg'ona shahri", lat: 40.3842, lng: 71.7843 },
      { id: "qoqon", name: "Qo'qon shahri", lat: 40.5333, lng: 70.9333 },
      { id: "margilon", name: "Marg'ilon shahri", lat: 40.4833, lng: 71.7167 },
      { id: "quvasoy", name: "Quvasoy shahri", lat: 40.3000, lng: 71.9667 },
      { id: "quva", name: "Quva tumani", lat: 40.5222, lng: 72.0667 },
      { id: "oltiariq", name: "Oltiariq tumani", lat: 40.3833, lng: 71.4833 },
      { id: "rishton", name: "Rishton tumani", lat: 40.3583, lng: 71.2861 },
      { id: "uchkoprik", name: "Uchko'prik tumani", lat: 40.5333, lng: 71.0500 },
      { id: "bogdod", name: "Bag'dod tumani", lat: 40.4500, lng: 71.2167 },
      { id: "beshariq", name: "Beshariq tumani", lat: 40.4333, lng: 70.6167 },
      { id: "dangara", name: "Dang'ara tumani", lat: 40.5833, lng: 70.9167 },
      { id: "ozbekiston_tumani", name: "O'zbekiston tumani (Yaypan)", lat: 40.3667, lng: 70.8167 },
      { id: "toshloq", name: "Toshloq tumani", lat: 40.5167, lng: 71.7833 },
      { id: "yazyavon", name: "Yozyovon tumani", lat: 40.6500, lng: 71.7500 },
      { id: "fergana_district", name: "Farg'ona tumani (Vodil)", lat: 40.2333, lng: 71.7333 },
      { id: "sox", name: "So'x tumani", lat: 39.9667, lng: 71.1333 }
    ]
  },
  {
    id: "namangan",
    name: "Namangan viloyati",
    center: { lat: 40.9983, lng: 71.6726 },
    districts: [
      { id: "namangan_city", name: "Namangan shahri", lat: 40.9983, lng: 71.6726 },
      { id: "chust", name: "Chust tumani", lat: 41.0000, lng: 71.2333 },
      { id: "kosonsoy", name: "Kosonsoy tumani", lat: 41.2500, lng: 71.5500 },
      { id: "chortoq", name: "Chortoq tumani", lat: 41.0667, lng: 71.8167 },
      { id: "uchqorgon", name: "Uchqo'rg'on tumani", lat: 41.1167, lng: 72.0833 },
      { id: "pop", name: "Pop tumani", lat: 40.8667, lng: 71.1000 },
      { id: "toraqorgon", name: "To'raqo'rg'on tumani", lat: 41.0000, lng: 71.5167 },
      { id: "uychi", name: "Uychi tumani", lat: 41.0833, lng: 71.9167 },
      { id: "norin", name: "Norin tumani (Haqqulobod)", lat: 40.9000, lng: 72.0667 },
      { id: "mingbuloq", name: "Mingbuloq tumani", lat: 40.8167, lng: 71.4833 },
      { id: "namangan_district", name: "Namangan tumani (Toshbuloq)", lat: 40.9500, lng: 71.6000 },
      { id: "yangiqorgon", name: "Yangiqo'rg'on tumani", lat: 41.2000, lng: 71.7333 }
    ]
  },
  {
    id: "qashqadaryo",
    name: "Qashqadaryo viloyati",
    center: { lat: 38.8606, lng: 65.7891 },
    districts: [
      { id: "qarshi_city", name: "Qarshi shahri", lat: 38.8606, lng: 65.7891 },
      { id: "shahrisabz", name: "Shahrisabz shahri va tumani", lat: 39.0500, lng: 66.8333 },
      { id: "kitob", name: "Kitob tumani", lat: 39.1333, lng: 66.8833 },
      { id: "koson", name: "Koson tumani", lat: 39.0333, lng: 65.5833 },
      { id: "guzor", name: "G'uzor tumani", lat: 38.6167, lng: 66.2500 },
      { id: "qamashi", name: "Qamashi tumani", lat: 38.8167, lng: 66.4667 },
      { id: "nishon", name: "Nishon tumani", lat: 38.6500, lng: 65.6833 },
      { id: "chiroqchi", name: "Chiroqchi tumani", lat: 39.0333, lng: 66.5667 },
      { id: "yakkabog", name: "Yakkabog' tumani", lat: 38.9833, lng: 66.6833 },
      { id: "kasbi", name: "Kasbi tumani (Mug'lon)", lat: 38.8333, lng: 65.4167 },
      { id: "mirishkor", name: "Mirishkor tumani", lat: 38.9167, lng: 65.1000 },
      { id: "muborak", name: "Muborak tumani", lat: 39.2667, lng: 65.1500 },
      { id: "dehqonobod", name: "Dehqonobod tumani", lat: 38.3333, lng: 66.5000 },
      { id: "ko'kdala", name: "Ko'kdala tumani", lat: 39.1167, lng: 66.2500 }
    ]
  },
  {
    id: "surxondaryo",
    name: "Surxondaryo viloyati",
    center: { lat: 37.2286, lng: 67.2753 },
    districts: [
      { id: "termiz_city", name: "Termiz shahri", lat: 37.2286, lng: 67.2753 },
      { id: "denov", name: "Denov tumani", lat: 38.2667, lng: 67.8833 },
      { id: "sherobod", name: "Sherobod tumani", lat: 37.6667, lng: 67.0000 },
      { id: "boysun", name: "Boysun tumani", lat: 38.2000, lng: 67.2000 },
      { id: "jarqorgon", name: "Jarqo'rg'on tumani", lat: 37.5000, lng: 67.4167 },
      { id: "shorchi", name: "Sho'rchi tumani", lat: 38.0000, lng: 67.7833 },
      { id: "qumqorgon", name: "Qumqo'rg'on tumani", lat: 37.8167, lng: 67.5833 },
      { id: "sariosiyo", name: "Sariosiyo tumani", lat: 38.4167, lng: 67.9500 },
      { id: "uzun", name: "Uzun tumani", lat: 38.3500, lng: 68.0667 },
      { id: "oltinsoy", name: "Oltinsoy tumani", lat: 38.1667, lng: 67.8000 },
      { id: "angor", name: "Angor tumani", lat: 37.4500, lng: 67.1500 },
      { id: "muzrabot", name: "Muzrabot tumani", lat: 37.3500, lng: 66.8667 },
      { id: "termiz_district", name: "Termiz tumani", lat: 37.3000, lng: 67.2500 },
      { id: "bandixon", name: "Bandixon tumani", lat: 37.8000, lng: 67.2500 }
    ]
  },
  {
    id: "jizzakh",
    name: "Jizzax viloyati",
    center: { lat: 40.1158, lng: 67.8422 },
    districts: [
      { id: "jizzakh_city", name: "Jizzax shahri", lat: 40.1158, lng: 67.8422 },
      { id: "zomin", name: "Zomin tumani", lat: 39.9667, lng: 68.4000 },
      { id: "zarbdor", name: "Zarbdor tumani", lat: 40.1000, lng: 68.1667 },
      { id: "sharof_rashidov", name: "Sharof Rashidov tumani", lat: 40.0833, lng: 67.8500 },
      { id: "gallaorol", name: "G'allaorol tumani", lat: 40.0333, lng: 67.5833 },
      { id: "paxtakor", name: "Paxtakor tumani", lat: 40.3167, lng: 67.9500 },
      { id: "dustlik", name: "Do'stlik tumani", lat: 40.5333, lng: 68.0333 },
      { id: "mirzacho'l", name: "Mirzacho'l tumani (Gagarin)", lat: 40.6667, lng: 68.1833 },
      { id: "baxmal", name: "Baxmal tumani (O'smat)", lat: 39.8000, lng: 67.8667 },
      { id: "forish", name: "Forish tumani (Yangiqishloq)", lat: 40.5667, lng: 67.1833 },
      { id: "arnasoy", name: "Arnasoy tumani", lat: 40.4833, lng: 67.7500 },
      { id: "yangiobod", name: "Yangiobod tumani", lat: 40.0500, lng: 68.8000 }
    ]
  },
  {
    id: "sirdaryo",
    name: "Sirdaryo viloyati",
    center: { lat: 40.4983, lng: 68.7842 },
    districts: [
      { id: "guliston_city", name: "Guliston shahri", lat: 40.4983, lng: 68.7842 },
      { id: "shirin_city", name: "Shirin shahri", lat: 40.2167, lng: 69.1333 },
      { id: "yangiyer_city", name: "Yangiyer shahri", lat: 40.2667, lng: 68.8167 },
      { id: "sirdaryo_tuman", name: "Sirdaryo tumani", lat: 40.8500, lng: 68.6667 },
      { id: "sayxunobod", name: "Sayxunobod tumani", lat: 40.6667, lng: 68.9167 },
      { id: "boyovut", name: "Boyovut tumani", lat: 40.4167, lng: 69.0500 },
      { id: "mirzaobod", name: "Mirzaobod tumani (Navro'z)", lat: 40.4833, lng: 68.6167 },
      { id: "oqoltin", name: "Oqoltin tumani (Sardoba)", lat: 40.4667, lng: 68.3000 },
      { id: "sardoba", name: "Sardoba tumani (Paxtaobod)", lat: 40.3500, lng: 68.2500 },
      { id: "xovos", name: "Xovos tumani", lat: 40.2000, lng: 68.8667 }
    ]
  },
  {
    id: "khorezm",
    name: "Xorazm viloyati",
    center: { lat: 41.5567, lng: 60.6311 },
    districts: [
      { id: "urganch_city", name: "Urganch shahri", lat: 41.5567, lng: 60.6311 },
      { id: "xiva_city", name: "Xiva shahri va tumani", lat: 41.3783, lng: 60.3639 },
      { id: "xonqa", name: "Xonqa tumani", lat: 41.4833, lng: 60.7833 },
      { id: "shovot", name: "Shovot tumani", lat: 41.6667, lng: 60.3000 },
      { id: "gurlan", name: "Gurlan tumani", lat: 41.8333, lng: 60.4000 },
      { id: "qoshkopir", name: "Qo'shko'pir tumani", lat: 41.5333, lng: 60.3500 },
      { id: "bogot", name: "Bog'ot tumani", lat: 41.3500, lng: 60.8167 },
      { id: "hazorasp", name: "Hazorasp tumani", lat: 41.3167, lng: 61.0833 },
      { id: "yangiariq", name: "Yangiariq tumani", lat: 41.3667, lng: 60.6167 },
      { id: "yangibozor", name: "Yangibozor tumani", lat: 41.7167, lng: 60.5833 },
      { id: "tuproqqala", name: "Tuproqqal'a tumani (Pitnak)", lat: 41.2167, lng: 61.3167 }
    ]
  },
  {
    id: "navoiy",
    name: "Navoiy viloyati",
    center: { lat: 40.0844, lng: 65.3792 },
    districts: [
      { id: "navoiy_city", name: "Navoiy shahri", lat: 40.0844, lng: 65.3792 },
      { id: "zarafshon_city", name: "Zarafshon shahri", lat: 41.5722, lng: 64.2044 },
      { id: "karmana", name: "Karmana tumani", lat: 40.1333, lng: 65.3667 },
      { id: "qiziltepa", name: "Qiziltepa tumani", lat: 40.0333, lng: 64.8167 },
      { id: "xatirchi", name: "Xatirchi tumani (Yangirabod)", lat: 40.0167, lng: 65.9500 },
      { id: "navbahor", name: "Navbahor tumani (Beshrabot)", lat: 40.2333, lng: 65.3167 },
      { id: "nurota", name: "Nurota tumani", lat: 40.5667, lng: 65.6833 },
      { id: "konimex", name: "Konimex tumani", lat: 40.2833, lng: 65.1667 },
      { id: "uchquduq", name: "Uchquduq tumani", lat: 42.1567, lng: 63.5550 },
      { id: "tomdi", name: "Tomdi tumani (Tomdibuloq)", lat: 41.7167, lng: 64.6333 }
    ]
  },
  {
    id: "karakalpakstan",
    name: "Qoraqalpog'iston Respublikasi",
    center: { lat: 42.4602, lng: 59.6166 },
    districts: [
      { id: "nukus_city", name: "Nukus shahri", lat: 42.4602, lng: 59.6166 },
      { id: "beruniy", name: "Beruniy tumani", lat: 41.6833, lng: 60.7500 },
      { id: "tortkol", name: "To'rtko'l tumani", lat: 41.5500, lng: 61.0000 },
      { id: "xojayli", name: "Xo'jayli tumani", lat: 42.4000, lng: 59.4500 },
      { id: "chimboy", name: "Chimboy tumani", lat: 42.9333, lng: 59.7667 },
      { id: "amudaryo", name: "Amudaryo tumani (Mang'it)", lat: 42.1167, lng: 60.0500 },
      { id: "qongirot", name: "Qo'ng'irot tumani", lat: 43.0833, lng: 58.8500 },
      { id: "taxiatosh", name: "Taxiatosh shahri", lat: 42.3333, lng: 59.5500 },
      { id: "qonlikol", name: "Qonliko'l tumani", lat: 42.8000, lng: 59.0000 },
      { id: "shumanay", name: "Shumanay tumani", lat: 42.6000, lng: 59.1333 },
      { id: "kegeyli", name: "Kegeyli tumani", lat: 42.7667, lng: 59.6000 },
      { id: "qoraozak", name: "Qorao'zak tumani", lat: 43.0167, lng: 60.0167 },
      { id: "taxtakopir", name: "Taxtako'pir tumani", lat: 43.0333, lng: 60.2833 },
      { id: "moynoq", name: "Mo'ynoq tumani", lat: 43.7667, lng: 59.0333 },
      { id: "ellikkala", name: "Ellikqal'a tumani (Bo'ston)", lat: 41.8333, lng: 60.9167 },
      { id: "bozatov", name: "Bo'zatov tumani", lat: 43.1500, lng: 59.4000 }
    ]
  }
];
