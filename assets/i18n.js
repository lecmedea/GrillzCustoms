(() => {
  if (window.__grillzI18nReady) return;
  window.__grillzI18nReady = true;

  const LANGS = [
    ['ru', 'Русский', 'RU', 'ru_RU'],
    ['en', 'English', 'EN', 'en_US'],
    ['fr', 'Français', 'FR', 'fr_FR'],
    ['es', 'Español', 'ES', 'es_ES'],
    ['it', 'Italiano', 'IT', 'it_IT'],
    ['ka', 'ქართული', 'KA', 'ka_GE'],
    ['hy', 'Հայերեն', 'HY', 'hy_AM'],
    ['uz', 'O‘zbekcha', 'UZ', 'uz_UZ'],
    ['kk', 'Қазақша', 'KK', 'kk_KZ'],
    ['zh-Hant', '繁體中文', '繁', 'zh_TW'],
    ['ja', '日本語', 'JP', 'ja_JP'],
    ['ko', '한국어', 'KR', 'ko_KR'],
    ['pt', 'Português', 'PT', 'pt_PT'],
    ['de', 'Deutsch', 'DE', 'de_DE'],
    ['hi', 'हिन्दी', 'HI', 'hi_IN'],
    ['tr', 'Türkçe', 'TR', 'tr_TR'],
    ['el', 'Ελληνικά', 'EL', 'el_GR']
  ];

  const LABEL_KEYS = {
    home: 'Главная',
    order: 'Заказ',
    services: 'Услуги',
    works: 'Работы',
    constructor: 'Конструктор',
    stars: 'Звёзды',
    forum: 'Форум',
    entertainment: 'Развлечения',
    contacts: 'Контакты',
    more: 'Ещё',
    about: 'О нас',
    certificate: 'Сертификат',
    process: 'Процесс',
    trusted: 'Доверяют',
    clinics: 'Клиникам',
    jewelry: 'Мастерским',
    faq: 'F.A.Q.',
    account: 'Аккаунт',
    blog: 'Блог',
    top: 'Наверх',
    leaveRequest: 'Оставить заявку',
    consult: 'Заказать консультацию',
    viewServices: 'Смотреть услуги',
    orderCertificate: 'Заказать сертификат',
    discussPartnership: 'Обсудить сотрудничество',
    offerPartnership: 'Предложить партнёрство',
    sections: 'К разделам',
    newTopic: 'Новая тема',
    activeTopics: 'Активные темы',
    createTopic: 'Создать тему',
    latestTopics: 'Последние темы',
    rules: 'Правила',
    accept: 'Принять',
    necessaryCookies: 'Только необходимые',
    language: 'Язык сайта',
    chooseLanguage: 'Выбрать язык сайта',
    custom: 'Кастомные',
    forYourStyle: 'под твой стиль',
    artOnTeeth: 'Искусство, которое носят на зубах',
    homeLead: 'Grillz Customs создаёт индивидуальные украшения на зубы: точная посадка, дерзкая эстетика и образ, который невозможно перепутать с чужим.',
    cookieCopy: 'Сайт использует cookies для аналитики, сохранения игровых настроек и улучшения работы интерфейса. Вы можете принять все cookies или оставить только необходимые.'
  };

  const LABELS = {
    ru: {},
    en: { home:'Home', order:'Order', services:'Services', works:'Work', constructor:'Designer', stars:'Stars', forum:'Forum', entertainment:'Entertainment', contacts:'Contacts', more:'More', about:'About', certificate:'Certificate', process:'Process', trusted:'Trusted by', clinics:'For clinics', jewelry:'For workshops', faq:'F.A.Q.', account:'Account', blog:'Blog', top:'Top', leaveRequest:'Send request', consult:'Book a consultation', viewServices:'View services', orderCertificate:'Order a certificate', discussPartnership:'Discuss partnership', offerPartnership:'Offer partnership', sections:'Sections', newTopic:'New topic', activeTopics:'Active topics', createTopic:'Create topic', latestTopics:'Latest topics', rules:'Rules', accept:'Accept', necessaryCookies:'Necessary only', language:'Site language', chooseLanguage:'Choose site language', custom:'Custom', forYourStyle:'for your style', artOnTeeth:'Art worn on teeth', homeLead:'Grillz Customs creates bespoke dental jewelry: precise anatomical fit, bold aesthetics and a look that cannot be confused with anyone else.', cookieCopy:'This site uses cookies for analytics, saved game settings and interface improvements. You can accept all cookies or keep only the necessary ones.' },
    fr: { home:'Accueil', order:'Commande', services:'Services', works:'Réalisations', constructor:'Configurateur', stars:'Stars', forum:'Forum', entertainment:'Divertissement', contacts:'Contacts', more:'Plus', about:'À propos', certificate:'Certificat', process:'Processus', trusted:'Ils nous font confiance', clinics:'Cliniques', jewelry:'Ateliers', faq:'F.A.Q.', account:'Compte', blog:'Blog', top:'Haut', leaveRequest:'Envoyer une demande', consult:'Demander un conseil', viewServices:'Voir les services', orderCertificate:'Commander un certificat', discussPartnership:'Discuter partenariat', offerPartnership:'Proposer un partenariat', sections:'Sections', newTopic:'Nouveau sujet', activeTopics:'Sujets actifs', createTopic:'Créer un sujet', latestTopics:'Derniers sujets', rules:'Règles', accept:'Accepter', necessaryCookies:'Nécessaires seulement', language:'Langue du site', chooseLanguage:'Choisir la langue du site', custom:'Grillz', forYourStyle:'sur mesure pour ton style', artOnTeeth:'Un art que l’on porte sur les dents', homeLead:'Grillz Customs crée des bijoux dentaires sur mesure : ajustement anatomique précis, esthétique affirmée et image impossible à confondre.', cookieCopy:'Ce site utilise des cookies pour l’analytique, la sauvegarde des réglages de jeu et l’amélioration de l’interface. Vous pouvez tout accepter ou garder seulement les cookies nécessaires.' },
    es: { home:'Inicio', order:'Pedido', services:'Servicios', works:'Trabajos', constructor:'Constructor', stars:'Estrellas', forum:'Foro', entertainment:'Entretenimiento', contacts:'Contactos', more:'Más', about:'Sobre nosotros', certificate:'Certificado', process:'Proceso', trusted:'Confían en nosotros', clinics:'Clínicas', jewelry:'Talleres', faq:'F.A.Q.', account:'Cuenta', blog:'Blog', top:'Arriba', leaveRequest:'Enviar solicitud', consult:'Pedir consulta', viewServices:'Ver servicios', orderCertificate:'Pedir certificado', discussPartnership:'Hablar de colaboración', offerPartnership:'Proponer colaboración', sections:'Secciones', newTopic:'Nuevo tema', activeTopics:'Temas activos', createTopic:'Crear tema', latestTopics:'Últimos temas', rules:'Reglas', accept:'Aceptar', necessaryCookies:'Solo necesarias', language:'Idioma del sitio', chooseLanguage:'Elegir idioma del sitio', custom:'Grillz', forYourStyle:'a medida para tu estilo', artOnTeeth:'Arte que se lleva en los dientes', homeLead:'Grillz Customs crea joyería dental personalizada: ajuste anatómico preciso, estética atrevida y una imagen imposible de confundir.', cookieCopy:'Este sitio usa cookies para analítica, guardar ajustes del juego y mejorar la interfaz. Puedes aceptar todas las cookies o dejar solo las necesarias.' },
    it: { home:'Home', order:'Ordine', services:'Servizi', works:'Lavori', constructor:'Configuratore', stars:'Star', forum:'Forum', entertainment:'Intrattenimento', contacts:'Contatti', more:'Altro', about:'Chi siamo', certificate:'Certificato', process:'Processo', trusted:'Si fidano di noi', clinics:'Cliniche', jewelry:'Laboratori', faq:'F.A.Q.', account:'Account', blog:'Blog', top:'Su', leaveRequest:'Invia richiesta', consult:'Prenota consulenza', viewServices:'Vedi servizi', orderCertificate:'Ordina certificato', discussPartnership:'Parliamo di partnership', offerPartnership:'Proponi partnership', sections:'Sezioni', newTopic:'Nuovo tema', activeTopics:'Temi attivi', createTopic:'Crea tema', latestTopics:'Ultimi temi', rules:'Regole', accept:'Accetta', necessaryCookies:'Solo necessari', language:'Lingua del sito', chooseLanguage:'Scegli la lingua del sito', custom:'Grillz', forYourStyle:'su misura per il tuo stile', artOnTeeth:'Arte da indossare sui denti', homeLead:'Grillz Customs crea gioielli dentali su misura: calzata anatomica precisa, estetica audace e un’immagine impossibile da confondere.', cookieCopy:'Questo sito usa cookie per analisi, salvataggio delle impostazioni di gioco e miglioramento dell’interfaccia. Puoi accettarli tutti o lasciare solo quelli necessari.' },
    ka: { home:'მთავარი', order:'შეკვეთა', services:'სერვისები', works:'ნამუშევრები', constructor:'კონსტრუქტორი', stars:'ვარსკვლავები', forum:'ფორუმი', entertainment:'გართობა', contacts:'კონტაქტები', more:'მეტი', about:'ჩვენ შესახებ', certificate:'სერტიფიკატი', process:'პროცესი', trusted:'გვენდობიან', clinics:'კლინიკებისთვის', jewelry:'სახელოსნოებისთვის', faq:'F.A.Q.', account:'ანგარიში', blog:'ბლოგი', top:'ზემოთ', leaveRequest:'განაცხადის გაგზავნა', consult:'კონსულტაციის შეკვეთა', viewServices:'სერვისების ნახვა', orderCertificate:'სერტიფიკატის შეკვეთა', discussPartnership:'პარტნიორობის განხილვა', offerPartnership:'პარტნიორობის შეთავაზება', sections:'განყოფილებები', newTopic:'ახალი თემა', activeTopics:'აქტიური თემები', createTopic:'თემის შექმნა', latestTopics:'ბოლო თემები', rules:'წესები', accept:'მიღება', necessaryCookies:'მხოლოდ აუცილებელი', language:'საიტის ენა', chooseLanguage:'აირჩიეთ საიტის ენა', custom:'ინდივიდუალური', forYourStyle:'შენი სტილისთვის', artOnTeeth:'ხელოვნება, რომელსაც კბილებზე ატარებენ', homeLead:'Grillz Customs ქმნის ინდივიდუალურ კბილის სამკაულებს: ზუსტი ანატომიური მორგება, გამბედავი ესთეტიკა და სახე, რომელიც სხვაში არ აგერევა.', cookieCopy:'საიტი იყენებს cookies ანალიტიკისთვის, თამაშის პარამეტრების შესანახად და ინტერფეისის გასაუმჯობესებლად. შეგიძლიათ მიიღოთ ყველა ან დატოვოთ მხოლოდ აუცილებელი.' },
    hy: { home:'Գլխավոր', order:'Պատվեր', services:'Ծառայություններ', works:'Աշխատանքներ', constructor:'Կոնստրուկտոր', stars:'Աստղեր', forum:'Ֆորում', entertainment:'Ժամանց', contacts:'Կոնտակտներ', more:'Ավելին', about:'Մեր մասին', certificate:'Վկայական', process:'Գործընթաց', trusted:'Մեզ վստահում են', clinics:'Կլինիկաներին', jewelry:'Արհեստանոցներին', faq:'F.A.Q.', account:'Հաշիվ', blog:'Բլոգ', top:'Վերև', leaveRequest:'Ուղարկել հայտ', consult:'Պատվիրել խորհրդատվություն', viewServices:'Տեսնել ծառայությունները', orderCertificate:'Պատվիրել վկայական', discussPartnership:'Քննարկել գործընկերությունը', offerPartnership:'Առաջարկել գործընկերություն', sections:'Բաժիններ', newTopic:'Նոր թեմա', activeTopics:'Ակտիվ թեմաներ', createTopic:'Ստեղծել թեմա', latestTopics:'Վերջին թեմաներ', rules:'Կանոններ', accept:'Ընդունել', necessaryCookies:'Միայն անհրաժեշտը', language:'Կայքի լեզու', chooseLanguage:'Ընտրել կայքի լեզուն', custom:'Անհատական', forYourStyle:'քո ոճի համար', artOnTeeth:'Արվեստ, որը կրում են ատամների վրա', homeLead:'Grillz Customs-ը ստեղծում է անհատական ատամնային զարդեր՝ ճշգրիտ անատոմիական նստվածքով, համարձակ էսթետիկայով և անկրկնելի կերպարով։', cookieCopy:'Կայքն օգտագործում է cookies՝ վերլուծության, խաղային կարգավորումների պահպանման և ինտերֆեյսի բարելավման համար։ Կարող եք ընդունել բոլորը կամ թողնել միայն անհրաժեշտները։' },
    uz: { home:'Bosh sahifa', order:'Buyurtma', services:'Xizmatlar', works:'Ishlar', constructor:'Konstruktor', stars:'Yulduzlar', forum:'Forum', entertainment:'Ko‘ngilochar', contacts:'Kontaktlar', more:'Yana', about:'Biz haqimizda', certificate:'Sertifikat', process:'Jarayon', trusted:'Ishonch', clinics:'Klinikalar uchun', jewelry:'Ustaxonalar uchun', faq:'F.A.Q.', account:'Akkaunt', blog:'Blog', top:'Yuqoriga', leaveRequest:'Ariza yuborish', consult:'Maslahat olish', viewServices:'Xizmatlarni ko‘rish', orderCertificate:'Sertifikat buyurtma qilish', discussPartnership:'Hamkorlikni muhokama qilish', offerPartnership:'Hamkorlik taklif qilish', sections:'Bo‘limlar', newTopic:'Yangi mavzu', activeTopics:'Faol mavzular', createTopic:'Mavzu yaratish', latestTopics:'So‘nggi mavzular', rules:'Qoidalar', accept:'Qabul qilish', necessaryCookies:'Faqat zarurlari', language:'Sayt tili', chooseLanguage:'Sayt tilini tanlang', custom:'Individual', forYourStyle:'sening uslubing uchun', artOnTeeth:'Tishlarda taqiladigan san’at', homeLead:'Grillz Customs individual dental bezaklar yaratadi: anatomik mos tushish, dadil estetika va hech kimniki bilan adashmaydigan obraz.', cookieCopy:'Sayt analitika, o‘yin sozlamalarini saqlash va interfeysni yaxshilash uchun cookies ishlatadi. Hammasini qabul qilishingiz yoki faqat zarurlarini qoldirishingiz mumkin.' },
    kk: { home:'Басты бет', order:'Тапсырыс', services:'Қызметтер', works:'Жұмыстар', constructor:'Конструктор', stars:'Жұлдыздар', forum:'Форум', entertainment:'Ойын-сауық', contacts:'Байланыс', more:'Тағы', about:'Біз туралы', certificate:'Сертификат', process:'Процесс', trusted:'Сенім артқандар', clinics:'Клиникаларға', jewelry:'Шеберханаларға', faq:'F.A.Q.', account:'Аккаунт', blog:'Блог', top:'Жоғары', leaveRequest:'Өтінім жіберу', consult:'Кеңес алу', viewServices:'Қызметтерді көру', orderCertificate:'Сертификатқа тапсырыс', discussPartnership:'Серіктестікті талқылау', offerPartnership:'Серіктестік ұсыну', sections:'Бөлімдер', newTopic:'Жаңа тақырып', activeTopics:'Белсенді тақырыптар', createTopic:'Тақырып құру', latestTopics:'Соңғы тақырыптар', rules:'Ережелер', accept:'Қабылдау', necessaryCookies:'Тек қажеттілері', language:'Сайт тілі', chooseLanguage:'Сайт тілін таңдаңыз', custom:'Жеке', forYourStyle:'сенің стиліңе арналған', artOnTeeth:'Тіске тағылатын өнер', homeLead:'Grillz Customs жеке тіс әшекейлерін жасайды: дәл анатомиялық отыру, батыл эстетика және ешкіммен шатастырмайтын образ.', cookieCopy:'Сайт аналитика, ойын баптауларын сақтау және интерфейсті жақсарту үшін cookies қолданады. Барлығын қабылдауға немесе тек қажеттілерін қалдыруға болады.' },
    'zh-Hant': { home:'首頁', order:'訂單', services:'服務', works:'作品', constructor:'設計器', stars:'明星', forum:'論壇', entertainment:'娛樂', contacts:'聯絡', more:'更多', about:'關於我們', certificate:'禮品卡', process:'流程', trusted:'信任我們', clinics:'診所合作', jewelry:'工坊合作', faq:'F.A.Q.', account:'帳戶', blog:'部落格', top:'返回頂部', leaveRequest:'提交需求', consult:'預約諮詢', viewServices:'查看服務', orderCertificate:'訂購禮品卡', discussPartnership:'洽談合作', offerPartnership:'提出合作', sections:'分區', newTopic:'新主題', activeTopics:'熱門主題', createTopic:'建立主題', latestTopics:'最新主題', rules:'規則', accept:'接受', necessaryCookies:'僅必要', language:'網站語言', chooseLanguage:'選擇網站語言', custom:'客製', forYourStyle:'配合你的風格', artOnTeeth:'戴在牙齒上的藝術', homeLead:'Grillz Customs 製作客製牙飾：精準貼合口腔結構、強烈美學語言，讓你的造型一眼被記住。', cookieCopy:'本網站使用 cookies 進行分析、保存遊戲設定並改善介面。你可以接受全部 cookies，或僅保留必要項目。' },
    ja: { home:'ホーム', order:'注文', services:'サービス', works:'制作例', constructor:'デザイナー', stars:'セレブ', forum:'フォーラム', entertainment:'エンタメ', contacts:'連絡先', more:'もっと見る', about:'私たちについて', certificate:'ギフト券', process:'制作プロセス', trusted:'信頼', clinics:'クリニック向け', jewelry:'工房向け', faq:'F.A.Q.', account:'アカウント', blog:'ブログ', top:'上へ', leaveRequest:'相談を送る', consult:'相談を予約', viewServices:'サービスを見る', orderCertificate:'ギフト券を注文', discussPartnership:'提携を相談', offerPartnership:'提携を提案', sections:'セクション', newTopic:'新しいトピック', activeTopics:'注目トピック', createTopic:'トピック作成', latestTopics:'最新トピック', rules:'ルール', accept:'同意する', necessaryCookies:'必要なものだけ', language:'サイト言語', chooseLanguage:'サイト言語を選択', custom:'カスタム', forYourStyle:'あなたのスタイルへ', artOnTeeth:'歯にまとうアート', homeLead:'Grillz Customs は、口元に正確にフィットするカスタム歯科ジュエリーを制作します。大胆な美学と、他と混ざらない存在感を形にします。', cookieCopy:'このサイトでは、分析、ゲーム設定の保存、インターフェース改善のために cookies を使用します。すべて許可するか、必要なものだけを残せます。' },
    ko: { home:'홈', order:'주문', services:'서비스', works:'작업 사례', constructor:'디자이너', stars:'스타', forum:'포럼', entertainment:'엔터테인먼트', contacts:'연락처', more:'더보기', about:'소개', certificate:'상품권', process:'제작 과정', trusted:'신뢰', clinics:'클리닉용', jewelry:'공방용', faq:'F.A.Q.', account:'계정', blog:'블로그', top:'맨 위로', leaveRequest:'문의 보내기', consult:'상담 예약', viewServices:'서비스 보기', orderCertificate:'상품권 주문', discussPartnership:'협업 상담', offerPartnership:'협업 제안', sections:'섹션', newTopic:'새 주제', activeTopics:'활성 주제', createTopic:'주제 만들기', latestTopics:'최신 주제', rules:'규칙', accept:'동의', necessaryCookies:'필수만', language:'사이트 언어', chooseLanguage:'사이트 언어 선택', custom:'커스텀', forYourStyle:'당신의 스타일에 맞게', artOnTeeth:'치아 위에 착용하는 예술', homeLead:'Grillz Customs는 정확한 해부학적 핏, 대담한 미학, 누구와도 겹치지 않는 이미지를 위한 맞춤형 치아 주얼리를 만듭니다.', cookieCopy:'이 사이트는 분석, 게임 설정 저장, 인터페이스 개선을 위해 cookies를 사용합니다. 전체를 허용하거나 필수 항목만 남길 수 있습니다.' },
    pt: { home:'Início', order:'Pedido', services:'Serviços', works:'Trabalhos', constructor:'Construtor', stars:'Estrelas', forum:'Fórum', entertainment:'Entretenimento', contacts:'Contatos', more:'Mais', about:'Sobre nós', certificate:'Certificado', process:'Processo', trusted:'Confiam', clinics:'Clínicas', jewelry:'Oficinas', faq:'F.A.Q.', account:'Conta', blog:'Blog', top:'Topo', leaveRequest:'Enviar pedido', consult:'Marcar consulta', viewServices:'Ver serviços', orderCertificate:'Pedir certificado', discussPartnership:'Falar de parceria', offerPartnership:'Propor parceria', sections:'Seções', newTopic:'Novo tópico', activeTopics:'Tópicos ativos', createTopic:'Criar tópico', latestTopics:'Últimos tópicos', rules:'Regras', accept:'Aceitar', necessaryCookies:'Apenas necessários', language:'Idioma do site', chooseLanguage:'Escolher idioma do site', custom:'Grillz', forYourStyle:'sob medida para o teu estilo', artOnTeeth:'Arte para usar nos dentes', homeLead:'A Grillz Customs cria joias dentárias sob medida: encaixe anatômico preciso, estética agressiva e um visual impossível de confundir.', cookieCopy:'Este site usa cookies para análise, guardar definições do jogo e melhorar a interface. Pode aceitar todos os cookies ou manter apenas os necessários.' },
    de: { home:'Start', order:'Bestellung', services:'Services', works:'Arbeiten', constructor:'Konfigurator', stars:'Stars', forum:'Forum', entertainment:'Unterhaltung', contacts:'Kontakt', more:'Mehr', about:'Über uns', certificate:'Zertifikat', process:'Prozess', trusted:'Vertrauen', clinics:'Für Kliniken', jewelry:'Für Werkstätten', faq:'F.A.Q.', account:'Konto', blog:'Blog', top:'Nach oben', leaveRequest:'Anfrage senden', consult:'Beratung buchen', viewServices:'Services ansehen', orderCertificate:'Zertifikat bestellen', discussPartnership:'Partnerschaft besprechen', offerPartnership:'Partnerschaft anbieten', sections:'Bereiche', newTopic:'Neues Thema', activeTopics:'Aktive Themen', createTopic:'Thema erstellen', latestTopics:'Neueste Themen', rules:'Regeln', accept:'Akzeptieren', necessaryCookies:'Nur notwendige', language:'Sprache der Website', chooseLanguage:'Sprache der Website wählen', custom:'Custom', forYourStyle:'für deinen Stil', artOnTeeth:'Kunst, die man auf den Zähnen trägt', homeLead:'Grillz Customs fertigt individuellen Zahnschmuck: präziser anatomischer Sitz, starke Ästhetik und ein Look, den man nicht verwechselt.', cookieCopy:'Diese Website nutzt Cookies für Analyse, gespeicherte Spieleinstellungen und Verbesserungen der Oberfläche. Sie können alle Cookies akzeptieren oder nur die notwendigen behalten.' },
    hi: { home:'होम', order:'ऑर्डर', services:'सेवाएँ', works:'काम', constructor:'डिज़ाइनर', stars:'सितारे', forum:'फ़ोरम', entertainment:'मनोरंजन', contacts:'संपर्क', more:'और', about:'हमारे बारे में', certificate:'सर्टिफिकेट', process:'प्रक्रिया', trusted:'भरोसा', clinics:'क्लिनिक के लिए', jewelry:'वर्कशॉप के लिए', faq:'F.A.Q.', account:'खाता', blog:'ब्लॉग', top:'ऊपर जाएँ', leaveRequest:'अनुरोध भेजें', consult:'परामर्श बुक करें', viewServices:'सेवाएँ देखें', orderCertificate:'सर्टिफिकेट ऑर्डर करें', discussPartnership:'साझेदारी पर बात करें', offerPartnership:'साझेदारी प्रस्तावित करें', sections:'सेक्शन', newTopic:'नया विषय', activeTopics:'सक्रिय विषय', createTopic:'विषय बनाएँ', latestTopics:'नए विषय', rules:'नियम', accept:'स्वीकार करें', necessaryCookies:'केवल आवश्यक', language:'साइट भाषा', chooseLanguage:'साइट भाषा चुनें', custom:'कस्टम', forYourStyle:'आपकी शैली के लिए', artOnTeeth:'दाँतों पर पहनी जाने वाली कला', homeLead:'Grillz Customs कस्टम डेंटल ज्वेलरी बनाता है: सटीक एनाटॉमिकल फिट, बोल्ड सौंदर्य और ऐसा लुक जो किसी और से नहीं मिलता।', cookieCopy:'यह साइट analytics, गेम सेटिंग्स सेव करने और इंटरफ़ेस सुधारने के लिए cookies का उपयोग करती है। आप सभी cookies स्वीकार कर सकते हैं या केवल आवश्यक रख सकते हैं।' },
    tr: { home:'Ana sayfa', order:'Sipariş', services:'Hizmetler', works:'İşler', constructor:'Tasarımcı', stars:'Yıldızlar', forum:'Forum', entertainment:'Eğlence', contacts:'İletişim', more:'Daha fazla', about:'Hakkımızda', certificate:'Sertifika', process:'Süreç', trusted:'Güvenenler', clinics:'Klinikler için', jewelry:'Atölyeler için', faq:'F.A.Q.', account:'Hesap', blog:'Blog', top:'Yukarı', leaveRequest:'Talep gönder', consult:'Danışmanlık al', viewServices:'Hizmetleri gör', orderCertificate:'Sertifika sipariş et', discussPartnership:'İş birliğini konuş', offerPartnership:'İş birliği öner', sections:'Bölümler', newTopic:'Yeni konu', activeTopics:'Aktif konular', createTopic:'Konu oluştur', latestTopics:'Son konular', rules:'Kurallar', accept:'Kabul et', necessaryCookies:'Sadece gerekli', language:'Site dili', chooseLanguage:'Site dilini seç', custom:'Özel', forYourStyle:'senin tarzın için', artOnTeeth:'Dişlerde taşınan sanat', homeLead:'Grillz Customs kişiye özel dental takılar üretir: hassas anatomik oturuş, cesur estetik ve kimseyle karışmayacak bir imaj.', cookieCopy:'Bu site analiz, oyun ayarlarını kaydetme ve arayüzü iyileştirme için cookies kullanır. Tümünü kabul edebilir veya yalnızca gerekli olanları bırakabilirsiniz.' },
    el: { home:'Αρχική', order:'Παραγγελία', services:'Υπηρεσίες', works:'Έργα', constructor:'Σχεδιαστής', stars:'Αστέρες', forum:'Φόρουμ', entertainment:'Ψυχαγωγία', contacts:'Επαφές', more:'Περισσότερα', about:'Σχετικά με εμάς', certificate:'Πιστοποιητικό', process:'Διαδικασία', trusted:'Μας εμπιστεύονται', clinics:'Για κλινικές', jewelry:'Για εργαστήρια', faq:'F.A.Q.', account:'Λογαριασμός', blog:'Blog', top:'Πάνω', leaveRequest:'Στείλε αίτημα', consult:'Κλείσε συμβουλή', viewServices:'Δες υπηρεσίες', orderCertificate:'Παράγγειλε πιστοποιητικό', discussPartnership:'Συζήτηση συνεργασίας', offerPartnership:'Πρότεινε συνεργασία', sections:'Ενότητες', newTopic:'Νέο θέμα', activeTopics:'Ενεργά θέματα', createTopic:'Δημιουργία θέματος', latestTopics:'Τελευταία θέματα', rules:'Κανόνες', accept:'Αποδοχή', necessaryCookies:'Μόνο απαραίτητα', language:'Γλώσσα ιστότοπου', chooseLanguage:'Επιλογή γλώσσας ιστότοπου', custom:'Custom', forYourStyle:'για το δικό σου στυλ', artOnTeeth:'Τέχνη που φοριέται στα δόντια', homeLead:'Η Grillz Customs δημιουργεί εξατομικευμένα dental jewelry: ακριβή ανατομική εφαρμογή, τολμηρή αισθητική και εικόνα που δεν μπερδεύεται με καμία άλλη.', cookieCopy:'Ο ιστότοπος χρησιμοποιεί cookies για analytics, αποθήκευση ρυθμίσεων παιχνιδιού και βελτίωση του interface. Μπορείτε να αποδεχτείτε όλα ή μόνο τα απαραίτητα.' }
  };

  const SEO = {
    ru: {
      title: 'Grillz Customs — искусство, которое носят на зубах',
      brandTitle: 'Grillz Customs — кастомные grillz в Москве',
      description: 'Кастомные гриллзы, tooth gems, подарочные сертификаты, спортивные каппы и индивидуальные украшения на зубы в Москве.',
      introTitle: 'Grillz Customs говорит на твоём языке',
      introBody: 'Выберите язык, чтобы читать ключевые разделы сайта, навигацию и SEO-описания в локальной подаче. Основной контент постепенно расширяется отдельными языковыми версиями.',
      introNote: 'Трендовые темы: diamond grillz, gold grillz, tooth gems, celebrity grillz, custom dental jewelry.',
      tags: ['кастомные гриллзы', 'diamond grillz', 'gold grillz', 'tooth gems', 'гриллзы Москва', 'звёзды в гриллзах']
    }
  };

  const introByLang = {
    en: ['Custom grillz in Moscow', 'Bespoke gold, silver and diamond grillz made for a precise fit, stage presence and everyday confidence.', 'Search focus: custom grillz, diamond grillz, gold grillz, tooth gems, hip-hop jewelry, celebrity grillz.', ['custom grillz', 'diamond grillz', 'gold grillz', 'tooth gems', 'hip-hop jewelry', 'celebrity grillz']],
    fr: ['Grillz sur mesure à Moscou', 'Des grillz en or, argent et diamants, conçus pour une tenue précise et une présence visuelle premium.', 'Axes SEO : grillz sur mesure, grillz diamant, grillz or, bijoux dentaires, tooth gems.', ['grillz sur mesure', 'grillz diamant', 'grillz or', 'bijoux dentaires', 'tooth gems']],
    es: ['Grillz personalizados en Moscú', 'Grillz de oro, plata y diamantes con ajuste anatómico, estética fuerte y acabado de joyería.', 'Enfoque SEO: grillz personalizados, grillz de diamantes, grillz de oro, joyería dental, tooth gems.', ['grillz personalizados', 'grillz diamantes', 'grillz oro', 'joyería dental', 'tooth gems']],
    it: ['Grillz su misura a Mosca', 'Grillz in oro, argento e diamanti con calzata precisa, carattere scenico e finitura da gioielleria.', 'Focus SEO: grillz su misura, grillz diamanti, grillz oro, gioielli dentali, tooth gems.', ['grillz su misura', 'grillz diamanti', 'grillz oro', 'gioielli dentali', 'tooth gems']],
    ka: ['ინდივიდუალური grillz მოსკოვში', 'ოქროს, ვერცხლისა და ბრილიანტის grillz ზუსტი მორგებით, სცენური ხასიათით და პრემიუმ დამუშავებით.', 'SEO თემები: custom grillz, diamond grillz, gold grillz, tooth gems, hip-hop jewelry.', ['custom grillz', 'diamond grillz', 'gold grillz', 'tooth gems', 'ჰიპ-ჰოპ სამკაული']],
    hy: ['Անհատական grillz Մոսկվայում', 'Ոսկյա, արծաթյա և ադամանդապատ grillz՝ ճշգրիտ նստվածքով, բեմական ուժով և պրեմիում հղկմամբ։', 'SEO թեմաներ՝ custom grillz, diamond grillz, gold grillz, tooth gems, hip-hop jewelry։', ['custom grillz', 'diamond grillz', 'gold grillz', 'tooth gems', 'հիփ-հոփ զարդեր']],
    uz: ['Moskvada individual grillz', 'Oltin, kumush va brilliantli grillz: aniq moslash, kuchli sahna obrazi va premium ishlov.', 'SEO yo‘nalishlari: custom grillz, diamond grillz, gold grillz, tooth gems, hip-hop jewelry.', ['custom grillz', 'diamond grillz', 'gold grillz', 'tooth gems', 'hip-hop jewelry']],
    kk: ['Мәскеудегі жеке grillz', 'Алтын, күміс және бриллиантты grillz: дәл отыру, сахналық әсер және премиум өңдеу.', 'SEO бағыттары: custom grillz, diamond grillz, gold grillz, tooth gems, hip-hop jewelry.', ['custom grillz', 'diamond grillz', 'gold grillz', 'tooth gems', 'hip-hop jewelry']],
    'zh-Hant': ['莫斯科客製 Grillz', '金、銀與鑽石 grillz，講究精準貼合、舞台存在感與高級珠寶質感。', 'SEO 主題：custom grillz、diamond grillz、gold grillz、tooth gems、hip-hop jewelry。', ['custom grillz', 'diamond grillz', 'gold grillz', 'tooth gems', 'hip-hop jewelry']],
    ja: ['モスクワのカスタム Grillz', 'ゴールド、シルバー、ダイヤモンドの grillz を、正確なフィットとジュエリー品質で制作します。', 'SEOテーマ：custom grillz、diamond grillz、gold grillz、tooth gems、hip-hop jewelry。', ['custom grillz', 'diamond grillz', 'gold grillz', 'tooth gems', 'hip-hop jewelry']],
    ko: ['모스크바 커스텀 Grillz', '골드, 실버, 다이아몬드 grillz를 정밀한 핏과 주얼리급 마감으로 제작합니다.', 'SEO 포커스: custom grillz, diamond grillz, gold grillz, tooth gems, hip-hop jewelry.', ['custom grillz', 'diamond grillz', 'gold grillz', 'tooth gems', 'hip-hop jewelry']],
    pt: ['Grillz sob medida em Moscou', 'Grillz de ouro, prata e diamantes com encaixe preciso, presença visual e acabamento de joalharia.', 'Foco SEO: grillz sob medida, grillz diamante, grillz ouro, joias dentárias, tooth gems.', ['grillz sob medida', 'grillz diamante', 'grillz ouro', 'joias dentárias', 'tooth gems']],
    de: ['Custom Grillz in Moskau', 'Gold-, Silber- und Diamond-Grillz mit präzisem Sitz, starker Wirkung und hochwertigem Schmuck-Finish.', 'SEO-Fokus: Custom Grillz, Diamond Grillz, Gold Grillz, Zahnschmuck, Tooth Gems.', ['custom grillz', 'diamond grillz', 'gold grillz', 'zahnschmuck', 'tooth gems']],
    hi: ['मॉस्को में कस्टम Grillz', 'गोल्ड, सिल्वर और डायमंड grillz: सटीक फिट, स्टेज प्रेज़ेंस और प्रीमियम ज्वेलरी फिनिश।', 'SEO फोकस: custom grillz, diamond grillz, gold grillz, tooth gems, hip-hop jewelry.', ['custom grillz', 'diamond grillz', 'gold grillz', 'tooth gems', 'hip-hop jewelry']],
    tr: ['Moskova’da özel Grillz', 'Altın, gümüş ve pırlantalı grillz: net oturuş, güçlü sahne etkisi ve premium mücevher işçiliği.', 'SEO odağı: custom grillz, diamond grillz, gold grillz, tooth gems, hip-hop jewelry.', ['custom grillz', 'diamond grillz', 'gold grillz', 'tooth gems', 'hip-hop jewelry']],
    el: ['Custom Grillz στη Μόσχα', 'Χρυσά, ασημένια και diamond grillz με ακριβή εφαρμογή, σκηνική παρουσία και premium φινίρισμα.', 'SEO focus: custom grillz, diamond grillz, gold grillz, tooth gems, hip-hop jewelry.', ['custom grillz', 'diamond grillz', 'gold grillz', 'tooth gems', 'hip-hop jewelry']]
  };

  Object.entries(introByLang).forEach(([lang, data]) => {
    SEO[lang] = {
      title: 'Grillz Customs — ' + data[0],
      brandTitle: 'Grillz Customs',
      description: data[1],
      introTitle: data[0],
      introBody: data[1],
      introNote: data[2],
      tags: data[3]
    };
  });

  const PAGE_KEYS = {
    '/': 'home',
    '/index.html': 'home',
    '/order.html': 'order',
    '/services.html': 'services',
    '/works.html': 'works',
    '/constructor.html': 'constructor',
    '/stars.html': 'stars',
    '/forma.html': 'forum',
    '/entertainment.html': 'entertainment',
    '/contacts.html': 'contacts',
    '/about.html': 'about',
    '/gift.html': 'certificate',
    '/process.html': 'process',
    '/trusted.html': 'trusted',
    '/clinics.html': 'clinics',
    '/jewelry.html': 'jewelry',
    '/faq.html': 'faq',
    '/account.html': 'account',
    '/forum.html': 'blog'
  };

  const OG_LOCALES = Object.fromEntries(LANGS.map(([code, , , locale]) => [code, locale]));
  const LANG_SET = new Set(LANGS.map(([code]) => code));
  const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const label = (lang, key) => {
    const langLabels = LABELS[lang] || {};
    if (hasOwn(langLabels, key)) return langLabels[key];
    if (hasOwn(LABEL_KEYS, key)) return LABEL_KEYS[key];
    return key;
  };
  const PHRASES = Object.fromEntries(Object.entries(LABEL_KEYS).map(([key, value]) => [value, key]));
  PHRASES['Форма'] = 'forum';
  PHRASES['Блог'] = 'blog';

  function normalize(text) {
    return String(text || '').replace(/\s+/g, ' ').trim();
  }

  function getCanonicalPath() {
    let path = location.pathname || '/';
    if (path.endsWith('/')) path += 'index.html';
    return path;
  }

  function getCanonicalUrl(path = getCanonicalPath()) {
    if (path === '/index.html') return 'https://grillzcustoms.ru/';
    return 'https://grillzcustoms.ru' + path;
  }

  function getInitialLang() {
    const params = new URLSearchParams(location.search);
    const fromUrl = params.get('lang');
    if (LANG_SET.has(fromUrl)) return fromUrl;
    try {
      const stored = localStorage.getItem('grillz_language');
      if (LANG_SET.has(stored)) return stored;
    } catch (_) { /* ignore storage */ }
    return 'ru';
  }

  let currentLang = getInitialLang();
  const originalTextNodes = [];
  const originalAttrs = [];

  function shouldSkipNode(node) {
    const parent = node.parentElement;
    if (!parent) return true;
    return Boolean(parent.closest('script, style, noscript, code, pre, textarea, select, option, .gc-language-switcher, .localized-seo-panel'));
  }

  function collectOriginals() {
    originalTextNodes.length = 0;
    originalAttrs.length = 0;
    collectFrom(document.body);
  }

  function collectFrom(rootNode) {
    if (!rootNode) return;
    if (rootNode.nodeType === Node.TEXT_NODE) {
      const source = normalize(rootNode.nodeValue);
      if (!shouldSkipNode(rootNode) && PHRASES[source] && !rootNode.__grillzI18nSource) {
        rootNode.__grillzI18nSource = source;
        originalTextNodes.push([rootNode, source, rootNode.nodeValue]);
      }
      return;
    }
    if (rootNode.nodeType !== Node.ELEMENT_NODE && rootNode.nodeType !== Node.DOCUMENT_NODE) return;

    const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      if (!shouldSkipNode(node)) {
        const source = normalize(node.nodeValue);
        if (PHRASES[source] && !node.__grillzI18nSource) {
          node.__grillzI18nSource = source;
          originalTextNodes.push([node, source, node.nodeValue]);
        }
      }
      node = walker.nextNode();
    }

    const attrNodes = rootNode.matches?.('[aria-label], [placeholder], [title]')
      ? [rootNode, ...rootNode.querySelectorAll?.('[aria-label], [placeholder], [title]')]
      : [...rootNode.querySelectorAll?.('[aria-label], [placeholder], [title]') || []];

    attrNodes.forEach((element) => {
      ['aria-label', 'placeholder', 'title'].forEach((attr) => {
        const source = normalize(element.getAttribute(attr));
        element.__grillzI18nAttrs = element.__grillzI18nAttrs || {};
        if (PHRASES[source] && !element.__grillzI18nAttrs[attr]) {
          element.__grillzI18nAttrs[attr] = source;
          originalAttrs.push([element, attr, source]);
        }
      });
    });
  }

  function ensureStyles() {
    if (document.getElementById('gcI18nStyles')) return;
    const style = document.createElement('style');
    style.id = 'gcI18nStyles';
    style.textContent = `
      .gc-language-switcher {
        position: relative;
        z-index: 7;
        align-self: flex-start;
        margin-left: clamp(14px, 2vw, 34px);
        padding: 6px;
        border: 1px solid rgba(255, 208, 0, .34);
        border-radius: 10px;
        background: linear-gradient(145deg, rgba(0, 0, 0, .92), rgba(41, 31, 4, .72));
        box-shadow: 6px 6px 0 #050505, 0 0 0 1px rgba(255, 208, 0, .18), 0 16px 36px rgba(0, 0, 0, .38);
        transform: rotate(1.4deg);
      }

      .gc-language-switcher::before {
        content: "LANG";
        display: block;
        margin: 0 0 4px;
        color: var(--yellow, #ffd000);
        font-size: 9px;
        font-weight: 950;
        letter-spacing: 1.3px;
        line-height: 1;
      }

      .gc-language-select {
        width: 148px;
        min-height: 42px;
        border: 2px solid var(--yellow, #ffd000);
        border-radius: 6px;
        background: linear-gradient(180deg, #ffd000 0%, #fff08a 42%, #bd8a00 100%);
        color: #050505;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, .7), 3px 3px 0 #050505;
        cursor: pointer;
        font: 950 12px/1 Arial, Helvetica, sans-serif;
        letter-spacing: .3px;
        text-transform: uppercase;
        padding: 0 10px;
      }

      .gc-language-select:focus-visible {
        outline: 3px solid rgba(255, 255, 255, .82);
        outline-offset: 3px;
      }

      .localized-seo-panel {
        display: none;
        position: relative;
        z-index: 2;
      }

      .localized-seo-panel.is-visible {
        display: block;
      }

      .localized-seo-panel .localized-seo-card {
        width: min(1120px, calc(100vw - 32px));
        margin: 0 auto 34px;
        padding: clamp(20px, 4vw, 34px);
        border: 1px solid rgba(255, 208, 0, .26);
        border-radius: 28px;
        background: linear-gradient(135deg, rgba(0, 0, 0, .82), rgba(30, 22, 3, .62));
        box-shadow: 0 18px 60px rgba(0, 0, 0, .34), inset 0 1px 0 rgba(255, 255, 255, .08);
      }

      .localized-seo-panel h2 {
        margin: 0 0 10px;
        color: var(--white, #f5f5f5);
        font-size: clamp(26px, 4vw, 44px);
        line-height: .98;
        text-transform: uppercase;
      }

      .localized-seo-panel p {
        max-width: 780px;
        margin: 0;
        color: var(--muted, #b7b7b7);
      }

      .localized-seo-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 18px;
      }

      .localized-seo-tags span {
        display: inline-flex;
        align-items: center;
        min-height: 30px;
        padding: 7px 11px;
        border: 1px solid rgba(255, 208, 0, .32);
        border-radius: 999px;
        color: #050505;
        background: var(--yellow, #ffd000);
        font-size: 12px;
        font-weight: 950;
      }

      @media (max-width: 920px) {
        .gc-language-switcher {
          width: 100%;
          margin: 12px 0 0;
          transform: none;
        }

        .gc-language-select {
          width: 100%;
        }

        .localized-seo-panel .localized-seo-card {
          width: min(100%, calc(100vw - 24px));
          margin-bottom: 24px;
          border-radius: 18px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureSwitcher() {
    if (document.querySelector('.gc-language-switcher')) return;
    const nav = document.querySelector('.topbar .nav');
    if (!nav) return;
    const wrap = document.createElement('div');
    wrap.className = 'gc-language-switcher';
    wrap.innerHTML = `
      <label class="visually-hidden" for="gcLanguageSelect">${label(currentLang, 'chooseLanguage')}</label>
      <select class="gc-language-select" id="gcLanguageSelect" aria-label="${label(currentLang, 'chooseLanguage')}">
        ${LANGS.map(([code, name, short]) => `<option value="${code}">${short} · ${name}</option>`).join('')}
      </select>
    `;
    nav.appendChild(wrap);
    const select = wrap.querySelector('select');
    select.value = currentLang;
    select.addEventListener('change', () => {
      setLanguage(select.value, true);
    });
  }

  function ensureAlternates() {
    document.querySelectorAll('link[data-i18n-alternate]').forEach((node) => node.remove());
    const canonical = getCanonicalUrl();
    const canonicalNode = document.querySelector('link[rel="canonical"]') || document.head.appendChild(document.createElement('link'));
    canonicalNode.setAttribute('rel', 'canonical');
    canonicalNode.setAttribute('href', canonical);

    if (document.querySelector('link[rel="alternate"][hreflang]:not([data-i18n-alternate])')) return;

    const fragment = document.createDocumentFragment();
    LANGS.forEach(([code]) => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = code;
      link.href = code === 'ru' ? canonical : canonical + '?lang=' + encodeURIComponent(code);
      link.dataset.i18nAlternate = 'true';
      fragment.appendChild(link);
    });
    const fallback = document.createElement('link');
    fallback.rel = 'alternate';
    fallback.hreflang = 'x-default';
    fallback.href = canonical;
    fallback.dataset.i18nAlternate = 'true';
    fragment.appendChild(fallback);
    document.head.appendChild(fragment);
  }

  function ensureLocalizedPanel() {
    let panel = document.querySelector('.localized-seo-panel');
    if (!panel) {
      panel = document.createElement('section');
      panel.className = 'localized-seo-panel';
      panel.setAttribute('aria-live', 'polite');
      const firstSection = document.querySelector('main > section');
      if (firstSection && firstSection.parentNode) {
        firstSection.parentNode.insertBefore(panel, firstSection.nextSibling);
      }
    }
    const seo = SEO[currentLang] || SEO.ru;
    panel.classList.toggle('is-visible', currentLang !== 'ru');
    panel.innerHTML = `
      <div class="localized-seo-card">
        <h2>${seo.introTitle}</h2>
        <p>${seo.introBody}</p>
        <p>${seo.introNote}</p>
        <div class="localized-seo-tags" aria-label="Localized search themes">
          ${seo.tags.map((tag) => `<span>${tag}</span>`).join('')}
        </div>
      </div>
    `;
  }

  function applyTextTranslations() {
    originalTextNodes.forEach(([node, source, raw]) => {
      const key = PHRASES[source];
      const leading = String(raw || '').match(/^\s*/)?.[0] || '';
      const trailing = String(raw || '').match(/\s*$/)?.[0] || '';
      node.nodeValue = leading + label(currentLang, key) + trailing;
    });
    originalAttrs.forEach(([element, attr, source]) => {
      const key = PHRASES[source];
      element.setAttribute(attr, label(currentLang, key));
    });
  }

  function applyMetadata() {
    const seo = SEO[currentLang] || SEO.ru;
    const pageKey = PAGE_KEYS[getCanonicalPath()] || 'home';
    const pageName = label(currentLang, pageKey);
    document.documentElement.lang = currentLang;
    document.title = pageKey === 'home' ? seo.title : `${pageName} — ${seo.brandTitle}`;

    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', seo.description);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', document.title);
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', seo.description);
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', document.title);
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) twitterDescription.setAttribute('content', seo.description);
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute('content', OG_LOCALES[currentLang] || 'ru_RU');
  }

  function syncSwitcher() {
    const select = document.getElementById('gcLanguageSelect');
    const labelNode = document.querySelector('.gc-language-switcher label');
    if (select) {
      select.value = currentLang;
      select.setAttribute('aria-label', label(currentLang, 'chooseLanguage'));
    }
    if (labelNode) labelNode.textContent = label(currentLang, 'chooseLanguage');
  }

  function setLanguage(lang, persist) {
    currentLang = LANG_SET.has(lang) ? lang : 'ru';
    if (persist) {
      try { localStorage.setItem('grillz_language', currentLang); } catch (_) { /* ignore storage */ }
      const url = new URL(location.href);
      if (currentLang === 'ru') url.searchParams.delete('lang');
      else url.searchParams.set('lang', currentLang);
      history.replaceState(null, '', url);
      window.GrillzAnalytics?.track('language_change', { language: currentLang });
    }
    applyTextTranslations();
    applyMetadata();
    ensureAlternates();
    ensureLocalizedPanel();
    syncSwitcher();
  }

  function init() {
    ensureStyles();
    ensureSwitcher();
    collectOriginals();
    setLanguage(currentLang, false);
    const observer = new MutationObserver((mutations) => {
      let hasNewSource = false;
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          const beforeText = originalTextNodes.length;
          const beforeAttrs = originalAttrs.length;
          collectFrom(node);
          if (originalTextNodes.length !== beforeText || originalAttrs.length !== beforeAttrs) hasNewSource = true;
        });
      });
      if (hasNewSource) applyTextTranslations();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
