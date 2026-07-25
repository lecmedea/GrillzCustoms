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
    works: 'Наши работы',
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
    en: { home:'Home', order:'Order', services:'Services', works:'Our work', constructor:'Designer', stars:'Stars', forum:'Forum', entertainment:'Entertainment', contacts:'Contacts', more:'More', about:'About', certificate:'Certificate', process:'Process', trusted:'Trusted by', clinics:'For clinics', jewelry:'For workshops', faq:'F.A.Q.', account:'Account', blog:'Blog', top:'Top', leaveRequest:'Send request', consult:'Book a consultation', viewServices:'View services', orderCertificate:'Order a certificate', discussPartnership:'Discuss partnership', offerPartnership:'Offer partnership', sections:'Sections', newTopic:'New topic', activeTopics:'Active topics', createTopic:'Create topic', latestTopics:'Latest topics', rules:'Rules', accept:'Accept', necessaryCookies:'Necessary only', language:'Site language', chooseLanguage:'Choose site language', custom:'Custom', forYourStyle:'for your style', artOnTeeth:'Art worn on teeth', homeLead:'Grillz Customs creates bespoke dental jewelry: precise anatomical fit, bold aesthetics and a look that cannot be confused with anyone else.', cookieCopy:'This site uses cookies for analytics, saved game settings and interface improvements. You can accept all cookies or keep only the necessary ones.' },
    fr: { home:'Accueil', order:'Commande', services:'Services', works:'Nos réalisations', constructor:'Configurateur', stars:'Stars', forum:'Forum', entertainment:'Divertissement', contacts:'Contacts', more:'Plus', about:'À propos', certificate:'Certificat', process:'Processus', trusted:'Ils nous font confiance', clinics:'Cliniques', jewelry:'Ateliers', faq:'F.A.Q.', account:'Compte', blog:'Blog', top:'Haut', leaveRequest:'Envoyer une demande', consult:'Demander un conseil', viewServices:'Voir les services', orderCertificate:'Commander un certificat', discussPartnership:'Discuter partenariat', offerPartnership:'Proposer un partenariat', sections:'Sections', newTopic:'Nouveau sujet', activeTopics:'Sujets actifs', createTopic:'Créer un sujet', latestTopics:'Derniers sujets', rules:'Règles', accept:'Accepter', necessaryCookies:'Nécessaires seulement', language:'Langue du site', chooseLanguage:'Choisir la langue du site', custom:'Grillz', forYourStyle:'sur mesure pour ton style', artOnTeeth:'Un art que l’on porte sur les dents', homeLead:'Grillz Customs crée des bijoux dentaires sur mesure : ajustement anatomique précis, esthétique affirmée et image impossible à confondre.', cookieCopy:'Ce site utilise des cookies pour l’analytique, la sauvegarde des réglages de jeu et l’amélioration de l’interface. Vous pouvez tout accepter ou garder seulement les cookies nécessaires.' },
    es: { home:'Inicio', order:'Pedido', services:'Servicios', works:'Nuestros trabajos', constructor:'Constructor', stars:'Estrellas', forum:'Foro', entertainment:'Entretenimiento', contacts:'Contactos', more:'Más', about:'Sobre nosotros', certificate:'Certificado', process:'Proceso', trusted:'Confían en nosotros', clinics:'Clínicas', jewelry:'Talleres', faq:'F.A.Q.', account:'Cuenta', blog:'Blog', top:'Arriba', leaveRequest:'Enviar solicitud', consult:'Pedir consulta', viewServices:'Ver servicios', orderCertificate:'Pedir certificado', discussPartnership:'Hablar de colaboración', offerPartnership:'Proponer colaboración', sections:'Secciones', newTopic:'Nuevo tema', activeTopics:'Temas activos', createTopic:'Crear tema', latestTopics:'Últimos temas', rules:'Reglas', accept:'Aceptar', necessaryCookies:'Solo necesarias', language:'Idioma del sitio', chooseLanguage:'Elegir idioma del sitio', custom:'Grillz', forYourStyle:'a medida para tu estilo', artOnTeeth:'Arte que se lleva en los dientes', homeLead:'Grillz Customs crea joyería dental personalizada: ajuste anatómico preciso, estética atrevida y una imagen imposible de confundir.', cookieCopy:'Este sitio usa cookies para analítica, guardar ajustes del juego y mejorar la interfaz. Puedes aceptar todas las cookies o dejar solo las necesarias.' },
    it: { home:'Home', order:'Ordine', services:'Servizi', works:'I nostri lavori', constructor:'Configuratore', stars:'Star', forum:'Forum', entertainment:'Intrattenimento', contacts:'Contatti', more:'Altro', about:'Chi siamo', certificate:'Certificato', process:'Processo', trusted:'Si fidano di noi', clinics:'Cliniche', jewelry:'Laboratori', faq:'F.A.Q.', account:'Account', blog:'Blog', top:'Su', leaveRequest:'Invia richiesta', consult:'Prenota consulenza', viewServices:'Vedi servizi', orderCertificate:'Ordina certificato', discussPartnership:'Parliamo di partnership', offerPartnership:'Proponi partnership', sections:'Sezioni', newTopic:'Nuovo tema', activeTopics:'Temi attivi', createTopic:'Crea tema', latestTopics:'Ultimi temi', rules:'Regole', accept:'Accetta', necessaryCookies:'Solo necessari', language:'Lingua del sito', chooseLanguage:'Scegli la lingua del sito', custom:'Grillz', forYourStyle:'su misura per il tuo stile', artOnTeeth:'Arte da indossare sui denti', homeLead:'Grillz Customs crea gioielli dentali su misura: calzata anatomica precisa, estetica audace e un’immagine impossibile da confondere.', cookieCopy:'Questo sito usa cookie per analisi, salvataggio delle impostazioni di gioco e miglioramento dell’interfaccia. Puoi accettarli tutti o lasciare solo quelli necessari.' },
    ka: { home:'მთავარი', order:'შეკვეთა', services:'სერვისები', works:'ჩვენი ნამუშევრები', constructor:'კონსტრუქტორი', stars:'ვარსკვლავები', forum:'ფორუმი', entertainment:'გართობა', contacts:'კონტაქტები', more:'მეტი', about:'ჩვენ შესახებ', certificate:'სერტიფიკატი', process:'პროცესი', trusted:'გვენდობიან', clinics:'კლინიკებისთვის', jewelry:'სახელოსნოებისთვის', faq:'F.A.Q.', account:'ანგარიში', blog:'ბლოგი', top:'ზემოთ', leaveRequest:'განაცხადის გაგზავნა', consult:'კონსულტაციის შეკვეთა', viewServices:'სერვისების ნახვა', orderCertificate:'სერტიფიკატის შეკვეთა', discussPartnership:'პარტნიორობის განხილვა', offerPartnership:'პარტნიორობის შეთავაზება', sections:'განყოფილებები', newTopic:'ახალი თემა', activeTopics:'აქტიური თემები', createTopic:'თემის შექმნა', latestTopics:'ბოლო თემები', rules:'წესები', accept:'მიღება', necessaryCookies:'მხოლოდ აუცილებელი', language:'საიტის ენა', chooseLanguage:'აირჩიეთ საიტის ენა', custom:'ინდივიდუალური', forYourStyle:'შენი სტილისთვის', artOnTeeth:'ხელოვნება, რომელსაც კბილებზე ატარებენ', homeLead:'Grillz Customs ქმნის ინდივიდუალურ კბილის სამკაულებს: ზუსტი ანატომიური მორგება, გამბედავი ესთეტიკა და სახე, რომელიც სხვაში არ აგერევა.', cookieCopy:'საიტი იყენებს cookies ანალიტიკისთვის, თამაშის პარამეტრების შესანახად და ინტერფეისის გასაუმჯობესებლად. შეგიძლიათ მიიღოთ ყველა ან დატოვოთ მხოლოდ აუცილებელი.' },
    hy: { home:'Գլխավոր', order:'Պատվեր', services:'Ծառայություններ', works:'Մեր աշխատանքները', constructor:'Կոնստրուկտոր', stars:'Աստղեր', forum:'Ֆորում', entertainment:'Ժամանց', contacts:'Կոնտակտներ', more:'Ավելին', about:'Մեր մասին', certificate:'Վկայական', process:'Գործընթաց', trusted:'Մեզ վստահում են', clinics:'Կլինիկաներին', jewelry:'Արհեստանոցներին', faq:'F.A.Q.', account:'Հաշիվ', blog:'Բլոգ', top:'Վերև', leaveRequest:'Ուղարկել հայտ', consult:'Պատվիրել խորհրդատվություն', viewServices:'Տեսնել ծառայությունները', orderCertificate:'Պատվիրել վկայական', discussPartnership:'Քննարկել գործընկերությունը', offerPartnership:'Առաջարկել գործընկերություն', sections:'Բաժիններ', newTopic:'Նոր թեմա', activeTopics:'Ակտիվ թեմաներ', createTopic:'Ստեղծել թեմա', latestTopics:'Վերջին թեմաներ', rules:'Կանոններ', accept:'Ընդունել', necessaryCookies:'Միայն անհրաժեշտը', language:'Կայքի լեզու', chooseLanguage:'Ընտրել կայքի լեզուն', custom:'Անհատական', forYourStyle:'քո ոճի համար', artOnTeeth:'Արվեստ, որը կրում են ատամների վրա', homeLead:'Grillz Customs-ը ստեղծում է անհատական ատամնային զարդեր՝ ճշգրիտ անատոմիական նստվածքով, համարձակ էսթետիկայով և անկրկնելի կերպարով։', cookieCopy:'Կայքն օգտագործում է cookies՝ վերլուծության, խաղային կարգավորումների պահպանման և ինտերֆեյսի բարելավման համար։ Կարող եք ընդունել բոլորը կամ թողնել միայն անհրաժեշտները։' },
    uz: { home:'Bosh sahifa', order:'Buyurtma', services:'Xizmatlar', works:'Bizning ishlar', constructor:'Konstruktor', stars:'Yulduzlar', forum:'Forum', entertainment:'Ko‘ngilochar', contacts:'Kontaktlar', more:'Yana', about:'Biz haqimizda', certificate:'Sertifikat', process:'Jarayon', trusted:'Ishonch', clinics:'Klinikalar uchun', jewelry:'Ustaxonalar uchun', faq:'F.A.Q.', account:'Akkaunt', blog:'Blog', top:'Yuqoriga', leaveRequest:'Ariza yuborish', consult:'Maslahat olish', viewServices:'Xizmatlarni ko‘rish', orderCertificate:'Sertifikat buyurtma qilish', discussPartnership:'Hamkorlikni muhokama qilish', offerPartnership:'Hamkorlik taklif qilish', sections:'Bo‘limlar', newTopic:'Yangi mavzu', activeTopics:'Faol mavzular', createTopic:'Mavzu yaratish', latestTopics:'So‘nggi mavzular', rules:'Qoidalar', accept:'Qabul qilish', necessaryCookies:'Faqat zarurlari', language:'Sayt tili', chooseLanguage:'Sayt tilini tanlang', custom:'Individual', forYourStyle:'sening uslubing uchun', artOnTeeth:'Tishlarda taqiladigan san’at', homeLead:'Grillz Customs individual dental bezaklar yaratadi: anatomik mos tushish, dadil estetika va hech kimniki bilan adashmaydigan obraz.', cookieCopy:'Sayt analitika, o‘yin sozlamalarini saqlash va interfeysni yaxshilash uchun cookies ishlatadi. Hammasini qabul qilishingiz yoki faqat zarurlarini qoldirishingiz mumkin.' },
    kk: { home:'Басты бет', order:'Тапсырыс', services:'Қызметтер', works:'Біздің жұмыстар', constructor:'Конструктор', stars:'Жұлдыздар', forum:'Форум', entertainment:'Ойын-сауық', contacts:'Байланыс', more:'Тағы', about:'Біз туралы', certificate:'Сертификат', process:'Процесс', trusted:'Сенім артқандар', clinics:'Клиникаларға', jewelry:'Шеберханаларға', faq:'F.A.Q.', account:'Аккаунт', blog:'Блог', top:'Жоғары', leaveRequest:'Өтінім жіберу', consult:'Кеңес алу', viewServices:'Қызметтерді көру', orderCertificate:'Сертификатқа тапсырыс', discussPartnership:'Серіктестікті талқылау', offerPartnership:'Серіктестік ұсыну', sections:'Бөлімдер', newTopic:'Жаңа тақырып', activeTopics:'Белсенді тақырыптар', createTopic:'Тақырып құру', latestTopics:'Соңғы тақырыптар', rules:'Ережелер', accept:'Қабылдау', necessaryCookies:'Тек қажеттілері', language:'Сайт тілі', chooseLanguage:'Сайт тілін таңдаңыз', custom:'Жеке', forYourStyle:'сенің стиліңе арналған', artOnTeeth:'Тіске тағылатын өнер', homeLead:'Grillz Customs жеке тіс әшекейлерін жасайды: дәл анатомиялық отыру, батыл эстетика және ешкіммен шатастырмайтын образ.', cookieCopy:'Сайт аналитика, ойын баптауларын сақтау және интерфейсті жақсарту үшін cookies қолданады. Барлығын қабылдауға немесе тек қажеттілерін қалдыруға болады.' },
    'zh-Hant': { home:'首頁', order:'訂單', services:'服務', works:'我們的作品', constructor:'設計器', stars:'明星', forum:'論壇', entertainment:'娛樂', contacts:'聯絡', more:'更多', about:'關於我們', certificate:'禮品卡', process:'流程', trusted:'信任我們', clinics:'診所合作', jewelry:'工坊合作', faq:'F.A.Q.', account:'帳戶', blog:'部落格', top:'返回頂部', leaveRequest:'提交需求', consult:'預約諮詢', viewServices:'查看服務', orderCertificate:'訂購禮品卡', discussPartnership:'洽談合作', offerPartnership:'提出合作', sections:'分區', newTopic:'新主題', activeTopics:'熱門主題', createTopic:'建立主題', latestTopics:'最新主題', rules:'規則', accept:'接受', necessaryCookies:'僅必要', language:'網站語言', chooseLanguage:'選擇網站語言', custom:'客製', forYourStyle:'配合你的風格', artOnTeeth:'戴在牙齒上的藝術', homeLead:'Grillz Customs 製作客製牙飾：精準貼合口腔結構、強烈美學語言，讓你的造型一眼被記住。', cookieCopy:'本網站使用 cookies 進行分析、保存遊戲設定並改善介面。你可以接受全部 cookies，或僅保留必要項目。' },
    ja: { home:'ホーム', order:'注文', services:'サービス', works:'私たちの制作例', constructor:'デザイナー', stars:'セレブ', forum:'フォーラム', entertainment:'エンタメ', contacts:'連絡先', more:'もっと見る', about:'私たちについて', certificate:'ギフト券', process:'制作プロセス', trusted:'信頼', clinics:'クリニック向け', jewelry:'工房向け', faq:'F.A.Q.', account:'アカウント', blog:'ブログ', top:'上へ', leaveRequest:'相談を送る', consult:'相談を予約', viewServices:'サービスを見る', orderCertificate:'ギフト券を注文', discussPartnership:'提携を相談', offerPartnership:'提携を提案', sections:'セクション', newTopic:'新しいトピック', activeTopics:'注目トピック', createTopic:'トピック作成', latestTopics:'最新トピック', rules:'ルール', accept:'同意する', necessaryCookies:'必要なものだけ', language:'サイト言語', chooseLanguage:'サイト言語を選択', custom:'カスタム', forYourStyle:'あなたのスタイルへ', artOnTeeth:'歯にまとうアート', homeLead:'Grillz Customs は、口元に正確にフィットするカスタム歯科ジュエリーを制作します。大胆な美学と、他と混ざらない存在感を形にします。', cookieCopy:'このサイトでは、分析、ゲーム設定の保存、インターフェース改善のために cookies を使用します。すべて許可するか、必要なものだけを残せます。' },
    ko: { home:'홈', order:'주문', services:'서비스', works:'우리 작업 사례', constructor:'디자이너', stars:'스타', forum:'포럼', entertainment:'엔터테인먼트', contacts:'연락처', more:'더보기', about:'소개', certificate:'상품권', process:'제작 과정', trusted:'신뢰', clinics:'클리닉용', jewelry:'공방용', faq:'F.A.Q.', account:'계정', blog:'블로그', top:'맨 위로', leaveRequest:'문의 보내기', consult:'상담 예약', viewServices:'서비스 보기', orderCertificate:'상품권 주문', discussPartnership:'협업 상담', offerPartnership:'협업 제안', sections:'섹션', newTopic:'새 주제', activeTopics:'활성 주제', createTopic:'주제 만들기', latestTopics:'최신 주제', rules:'규칙', accept:'동의', necessaryCookies:'필수만', language:'사이트 언어', chooseLanguage:'사이트 언어 선택', custom:'커스텀', forYourStyle:'당신의 스타일에 맞게', artOnTeeth:'치아 위에 착용하는 예술', homeLead:'Grillz Customs는 정확한 해부학적 핏, 대담한 미학, 누구와도 겹치지 않는 이미지를 위한 맞춤형 치아 주얼리를 만듭니다.', cookieCopy:'이 사이트는 분석, 게임 설정 저장, 인터페이스 개선을 위해 cookies를 사용합니다. 전체를 허용하거나 필수 항목만 남길 수 있습니다.' },
    pt: { home:'Início', order:'Pedido', services:'Serviços', works:'Nossos trabalhos', constructor:'Construtor', stars:'Estrelas', forum:'Fórum', entertainment:'Entretenimento', contacts:'Contatos', more:'Mais', about:'Sobre nós', certificate:'Certificado', process:'Processo', trusted:'Confiam', clinics:'Clínicas', jewelry:'Oficinas', faq:'F.A.Q.', account:'Conta', blog:'Blog', top:'Topo', leaveRequest:'Enviar pedido', consult:'Marcar consulta', viewServices:'Ver serviços', orderCertificate:'Pedir certificado', discussPartnership:'Falar de parceria', offerPartnership:'Propor parceria', sections:'Seções', newTopic:'Novo tópico', activeTopics:'Tópicos ativos', createTopic:'Criar tópico', latestTopics:'Últimos tópicos', rules:'Regras', accept:'Aceitar', necessaryCookies:'Apenas necessários', language:'Idioma do site', chooseLanguage:'Escolher idioma do site', custom:'Grillz', forYourStyle:'sob medida para o teu estilo', artOnTeeth:'Arte para usar nos dentes', homeLead:'A Grillz Customs cria joias dentárias sob medida: encaixe anatômico preciso, estética agressiva e um visual impossível de confundir.', cookieCopy:'Este site usa cookies para análise, guardar definições do jogo e melhorar a interface. Pode aceitar todos os cookies ou manter apenas os necessários.' },
    de: { home:'Start', order:'Bestellung', services:'Services', works:'Unsere Arbeiten', constructor:'Konfigurator', stars:'Stars', forum:'Forum', entertainment:'Unterhaltung', contacts:'Kontakt', more:'Mehr', about:'Über uns', certificate:'Zertifikat', process:'Prozess', trusted:'Vertrauen', clinics:'Für Kliniken', jewelry:'Für Werkstätten', faq:'F.A.Q.', account:'Konto', blog:'Blog', top:'Nach oben', leaveRequest:'Anfrage senden', consult:'Beratung buchen', viewServices:'Services ansehen', orderCertificate:'Zertifikat bestellen', discussPartnership:'Partnerschaft besprechen', offerPartnership:'Partnerschaft anbieten', sections:'Bereiche', newTopic:'Neues Thema', activeTopics:'Aktive Themen', createTopic:'Thema erstellen', latestTopics:'Neueste Themen', rules:'Regeln', accept:'Akzeptieren', necessaryCookies:'Nur notwendige', language:'Sprache der Website', chooseLanguage:'Sprache der Website wählen', custom:'Custom', forYourStyle:'für deinen Stil', artOnTeeth:'Kunst, die man auf den Zähnen trägt', homeLead:'Grillz Customs fertigt individuellen Zahnschmuck: präziser anatomischer Sitz, starke Ästhetik und ein Look, den man nicht verwechselt.', cookieCopy:'Diese Website nutzt Cookies für Analyse, gespeicherte Spieleinstellungen und Verbesserungen der Oberfläche. Sie können alle Cookies akzeptieren oder nur die notwendigen behalten.' },
    hi: { home:'होम', order:'ऑर्डर', services:'सेवाएँ', works:'हमारे काम', constructor:'डिज़ाइनर', stars:'सितारे', forum:'फ़ोरम', entertainment:'मनोरंजन', contacts:'संपर्क', more:'और', about:'हमारे बारे में', certificate:'सर्टिफिकेट', process:'प्रक्रिया', trusted:'भरोसा', clinics:'क्लिनिक के लिए', jewelry:'वर्कशॉप के लिए', faq:'F.A.Q.', account:'खाता', blog:'ब्लॉग', top:'ऊपर जाएँ', leaveRequest:'अनुरोध भेजें', consult:'परामर्श बुक करें', viewServices:'सेवाएँ देखें', orderCertificate:'सर्टिफिकेट ऑर्डर करें', discussPartnership:'साझेदारी पर बात करें', offerPartnership:'साझेदारी प्रस्तावित करें', sections:'सेक्शन', newTopic:'नया विषय', activeTopics:'सक्रिय विषय', createTopic:'विषय बनाएँ', latestTopics:'नए विषय', rules:'नियम', accept:'स्वीकार करें', necessaryCookies:'केवल आवश्यक', language:'साइट भाषा', chooseLanguage:'साइट भाषा चुनें', custom:'कस्टम', forYourStyle:'आपकी शैली के लिए', artOnTeeth:'दाँतों पर पहनी जाने वाली कला', homeLead:'Grillz Customs कस्टम डेंटल ज्वेलरी बनाता है: सटीक एनाटॉमिकल फिट, बोल्ड सौंदर्य और ऐसा लुक जो किसी और से नहीं मिलता।', cookieCopy:'यह साइट analytics, गेम सेटिंग्स सेव करने और इंटरफ़ेस सुधारने के लिए cookies का उपयोग करती है। आप सभी cookies स्वीकार कर सकते हैं या केवल आवश्यक रख सकते हैं।' },
    tr: { home:'Ana sayfa', order:'Sipariş', services:'Hizmetler', works:'Çalışmalarımız', constructor:'Tasarımcı', stars:'Yıldızlar', forum:'Forum', entertainment:'Eğlence', contacts:'İletişim', more:'Daha fazla', about:'Hakkımızda', certificate:'Sertifika', process:'Süreç', trusted:'Güvenenler', clinics:'Klinikler için', jewelry:'Atölyeler için', faq:'F.A.Q.', account:'Hesap', blog:'Blog', top:'Yukarı', leaveRequest:'Talep gönder', consult:'Danışmanlık al', viewServices:'Hizmetleri gör', orderCertificate:'Sertifika sipariş et', discussPartnership:'İş birliğini konuş', offerPartnership:'İş birliği öner', sections:'Bölümler', newTopic:'Yeni konu', activeTopics:'Aktif konular', createTopic:'Konu oluştur', latestTopics:'Son konular', rules:'Kurallar', accept:'Kabul et', necessaryCookies:'Sadece gerekli', language:'Site dili', chooseLanguage:'Site dilini seç', custom:'Özel', forYourStyle:'senin tarzın için', artOnTeeth:'Dişlerde taşınan sanat', homeLead:'Grillz Customs kişiye özel dental takılar üretir: hassas anatomik oturuş, cesur estetik ve kimseyle karışmayacak bir imaj.', cookieCopy:'Bu site analiz, oyun ayarlarını kaydetme ve arayüzü iyileştirme için cookies kullanır. Tümünü kabul edebilir veya yalnızca gerekli olanları bırakabilirsiniz.' },
    el: { home:'Αρχική', order:'Παραγγελία', services:'Υπηρεσίες', works:'Τα έργα μας', constructor:'Σχεδιαστής', stars:'Αστέρες', forum:'Φόρουμ', entertainment:'Ψυχαγωγία', contacts:'Επαφές', more:'Περισσότερα', about:'Σχετικά με εμάς', certificate:'Πιστοποιητικό', process:'Διαδικασία', trusted:'Μας εμπιστεύονται', clinics:'Για κλινικές', jewelry:'Για εργαστήρια', faq:'F.A.Q.', account:'Λογαριασμός', blog:'Blog', top:'Πάνω', leaveRequest:'Στείλε αίτημα', consult:'Κλείσε συμβουλή', viewServices:'Δες υπηρεσίες', orderCertificate:'Παράγγειλε πιστοποιητικό', discussPartnership:'Συζήτηση συνεργασίας', offerPartnership:'Πρότεινε συνεργασία', sections:'Ενότητες', newTopic:'Νέο θέμα', activeTopics:'Ενεργά θέματα', createTopic:'Δημιουργία θέματος', latestTopics:'Τελευταία θέματα', rules:'Κανόνες', accept:'Αποδοχή', necessaryCookies:'Μόνο απαραίτητα', language:'Γλώσσα ιστότοπου', chooseLanguage:'Επιλογή γλώσσας ιστότοπου', custom:'Custom', forYourStyle:'για το δικό σου στυλ', artOnTeeth:'Τέχνη που φοριέται στα δόντια', homeLead:'Η Grillz Customs δημιουργεί εξατομικευμένα dental jewelry: ακριβή ανατομική εφαρμογή, τολμηρή αισθητική και εικόνα που δεν μπερδεύεται με καμία άλλη.', cookieCopy:'Ο ιστότοπος χρησιμοποιεί cookies για analytics, αποθήκευση ρυθμίσεων παιχνιδιού και βελτίωση του interface. Μπορείτε να αποδεχτείτε όλα ή μόνο τα απαραίτητα.' }
  };

  const SEO = {
    ru: {
      title: 'Grillz Customs — искусство, которое носят на зубах',
      brandTitle: 'Grillz Customs — кастомные grillz в Москве',
      description: 'Кастомные гриллзы, tooth gems, подарочные сертификаты, спортивные каппы и индивидуальные украшения на зубы в Москве.',
      introTitle: 'Grillz Customs говорит на твоём языке',
      introBody: 'Выберите язык: навигация, метаданные и SEO-описания переведены локально, а длинный контент страницы догружается в полном переводе в браузере.',
      introNote: 'Трендовые темы: diamond grillz, gold grillz, tooth gems, celebrity grillz, custom dental jewelry.',
      tags: ['грилзы на заказ', 'гриллзы крида', 'custom teeth', 'diamond grillz', 'gold grillz', 'tooth gems', 'где купить грилзы', 'звёзды в гриллзах']
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
  const TRANSLATOR_LANGS = {
    en: 'en',
    fr: 'fr',
    es: 'es',
    it: 'it',
    ka: 'ka',
    hy: 'hy',
    uz: 'uz',
    kk: 'kk',
    'zh-Hant': 'zh-TW',
    ja: 'ja',
    ko: 'ko',
    pt: 'pt',
    de: 'de',
    hi: 'hi',
    tr: 'tr',
    el: 'el'
  };
  const TRANSLATOR_CODES = Object.values(TRANSLATOR_LANGS).join(',');
  const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const label = (lang, key) => {
    const langLabels = LABELS[lang] || {};
    if (hasOwn(langLabels, key)) return langLabels[key];
    if (hasOwn(LABEL_KEYS, key)) return LABEL_KEYS[key];
    return key;
  };
  const PHRASES = Object.fromEntries(Object.entries(LABEL_KEYS).map(([key, value]) => [value, key]));
  PHRASES['Форма'] = 'forum';
  PHRASES['Работы'] = 'works';
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
        display: block;
        width: 145px;
        align-self: flex-start;
        margin-left: clamp(20px, 3vw, 52px);
        padding: 3px;
        border: 1px solid rgba(255, 208, 0, .48);
        border-radius: 999px;
        background:
          radial-gradient(circle at 26% 22%, rgba(255, 245, 174, .3), transparent 28%),
          linear-gradient(145deg, rgba(7, 7, 7, .96), rgba(48, 36, 5, .74));
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, .14),
          inset 0 -10px 16px rgba(0, 0, 0, .44),
          0 0 0 1px rgba(0, 0, 0, .74),
          4px 5px 0 #050505,
          0 18px 42px rgba(0, 0, 0, .36),
          0 0 28px rgba(255, 208, 0, .12);
        transform: rotate(.7deg);
        cursor: pointer;
        transition: border-color .22s ease, box-shadow .22s ease, transform .22s ease, filter .22s ease;
      }

      .gc-language-switcher::before {
        content: "Aa";
        position: absolute;
        left: 4px;
        top: 50%;
        z-index: 3;
        display: grid;
        place-items: center;
        width: 25px;
        height: 25px;
        border-radius: 50%;
        color: #050505;
        background:
          linear-gradient(145deg, #fff3a2, #ffd000 50%, #ad7e00);
        border: 1px solid #050505;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.78), 2px 2px 0 #050505;
        font-size: 9px;
        font-weight: 950;
        letter-spacing: 0;
        line-height: 1;
        transform: translateY(-50%);
        pointer-events: none;
      }

      .gc-language-switcher::after {
        content: "";
        position: absolute;
        right: 11px;
        top: 50%;
        z-index: 3;
        width: 0;
        height: 0;
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 6px solid var(--yellow, #ffd000);
        filter: drop-shadow(1px 1px 0 #050505);
        transform: translateY(-35%);
        pointer-events: none;
      }

      .gc-language-switcher:focus-within,
      .gc-language-switcher:hover {
        border-color: rgba(255, 208, 0, .82);
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, .18),
          inset 0 -10px 16px rgba(0, 0, 0, .44),
          0 0 0 1px rgba(0, 0, 0, .82),
          2px 3px 0 #050505,
          0 18px 42px rgba(0, 0, 0, .4),
          0 0 34px rgba(255, 208, 0, .28);
        transform: rotate(.7deg) translate(1px, 1px);
        filter: saturate(1.08);
      }

      .gc-language-switcher > label {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        margin: -1px !important;
        padding: 0 !important;
        overflow: hidden !important;
        clip-path: inset(50%) !important;
        white-space: nowrap !important;
        border: 0 !important;
      }

      .gc-language-select {
        width: 100%;
        min-height: 32px;
        border: 0;
        border-radius: 999px;
        appearance: none;
        background: transparent;
        color: var(--yellow, #ffd000);
        box-shadow: none;
        cursor: pointer;
        font: 950 11px/1 Arial, Helvetica, sans-serif;
        letter-spacing: .5px;
        text-transform: uppercase;
        padding: 0 25px 0 36px;
      }

      .gc-language-select:focus-visible {
        outline: 0;
      }

      .gc-language-select:focus {
        outline: 0;
        outline-color: transparent;
      }

      #google_translate_element,
      .goog-te-banner-frame,
      iframe.goog-te-banner-frame,
      .goog-te-balloon-frame,
      .goog-tooltip,
      .goog-tooltip:hover {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        opacity: 0 !important;
        overflow: hidden !important;
        pointer-events: none !important;
      }

      .goog-te-gadget {
        font-size: 0 !important;
      }

      body {
        top: 0 !important;
      }

      .topbar .nav {
        align-items: start !important;
        gap: 22px !important;
      }

      .topbar .nav-links {
        display: grid !important;
        grid-template-columns: 1fr !important;
        gap: 9px !important;
        width: min(910px, 100%) !important;
        justify-content: stretch !important;
      }

      .topbar .nav-row {
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 10px !important;
      }

      .topbar .nav-row-top {
        justify-content: flex-end !important;
      }

      .topbar .nav-row-bottom {
        justify-content: flex-start !important;
      }

      .topbar .nav-row > a,
      .topbar .nav-more summary {
        position: relative;
        overflow: hidden;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-height: 34px !important;
        padding: 8px 12px !important;
        color: #050505 !important;
        background:
          linear-gradient(135deg, rgba(255,255,255,.42) 0 8%, transparent 8% 100%),
          linear-gradient(180deg, #ffe767 0%, #ffd000 42%, #d7a300 100%) !important;
        border: 2px solid #050505 !important;
        border-radius: 3px !important;
        box-shadow: 4px 4px 0 #050505, 0 0 0 1px rgba(255,208,0,.38), 0 13px 28px rgba(0,0,0,.34) !important;
        font-size: 12px !important;
        font-weight: 950 !important;
        letter-spacing: .85px !important;
        line-height: 1.05 !important;
        text-shadow: none !important;
        text-transform: uppercase !important;
        transform: skew(-7deg);
        transition: transform .18s ease, box-shadow .18s ease, background .18s ease, filter .18s ease;
      }

      .topbar .nav-row > a:hover,
      .topbar .nav-row > a:focus-visible,
      .topbar .nav-row > a[aria-current="page"],
      .topbar .nav-more summary:hover,
      .topbar .nav-more summary:focus-visible {
        color: #050505 !important;
        background:
          linear-gradient(135deg, rgba(255,255,255,.5) 0 10%, transparent 10% 100%),
          linear-gradient(180deg, #fff08a 0%, #ffd000 48%, #bd8a00 100%) !important;
        border-color: #050505 !important;
        box-shadow: 2px 2px 0 #050505, 0 0 0 2px rgba(255,208,0,.58), 0 10px 24px rgba(0,0,0,.38) !important;
        transform: skew(-7deg) translate(2px, 2px);
        outline: 0;
      }

      .topbar .nav-row > a[href$="account.html"] {
        background:
          linear-gradient(135deg, rgba(255,255,255,.38) 0 9%, transparent 9% 100%),
          linear-gradient(180deg, #ffb23f 0%, #ff7a00 44%, #c74400 100%) !important;
        border-color: #120700 !important;
        box-shadow: 4px 4px 0 #050505, 0 0 0 1px rgba(255,122,0,.5), 0 13px 30px rgba(255,80,0,.18) !important;
      }

      .topbar .nav-row > a[href$="account.html"]:hover,
      .topbar .nav-row > a[href$="account.html"]:focus-visible,
      .topbar .nav-row > a[href$="account.html"][aria-current="page"] {
        background:
          linear-gradient(135deg, rgba(255,255,255,.48) 0 11%, transparent 11% 100%),
          linear-gradient(180deg, #ffc15e 0%, #ff8a00 48%, #b63500 100%) !important;
        box-shadow: 2px 2px 0 #050505, 0 0 0 2px rgba(255,122,0,.58), 0 10px 26px rgba(255,80,0,.24) !important;
      }

      .topbar .nav-more-menu a[href$="account.html"] {
        display: none !important;
      }

      .hero-orbit {
        background:
          radial-gradient(circle at 50% 48%, rgba(255,208,0,.28), transparent 31%),
          radial-gradient(circle at 18% 18%, rgba(255,255,255,.12), transparent 21%),
          radial-gradient(circle at 88% 84%, rgba(255,122,0,.13), transparent 25%),
          url("assets/brand/grillz-customs-emblem.jpg") center / min(82%, 610px) auto no-repeat,
          linear-gradient(145deg, #050505 0%, #131006 56%, #020202 100%) !important;
        filter: saturate(1.08) contrast(1.04);
        animation: gcEmblemAura 8.8s ease-in-out infinite;
      }

      .hero-orbit .orbit-core,
      .hero-orbit .orbit-line,
      .hero-orbit .orbit-chip {
        display: none !important;
      }

      .hero-orbit::before {
        content: "";
        position: absolute;
        inset: -18%;
        background:
          linear-gradient(115deg, transparent 0%, rgba(255,255,255,.04) 38%, rgba(255,238,156,.42) 49%, rgba(255,255,255,.08) 57%, transparent 72%);
        opacity: .72;
        mix-blend-mode: screen;
        transform: translate3d(-78%, 0, 0) rotate(7deg);
        animation: gcEmblemSweep 7.6s cubic-bezier(.16, 1, .3, 1) infinite;
        pointer-events: none;
      }

      .hero-orbit::after {
        content: "";
        position: absolute;
        inset: 16px;
        border-radius: 28px;
        border: 1px solid rgba(255,226,107,.28);
        background:
          radial-gradient(circle at 14% 82%, rgba(255,255,255,.88) 0 1px, rgba(255,208,0,.48) 2px, transparent 8px),
          radial-gradient(circle at 72% 19%, rgba(255,255,255,.68) 0 1px, rgba(255,208,0,.36) 2px, transparent 9px),
          radial-gradient(circle at 55% 86%, rgba(255,255,255,.58) 0 1px, rgba(255,208,0,.3) 2px, transparent 7px);
        box-shadow: inset 0 0 90px rgba(255,208,0,.1), 0 0 48px rgba(255,208,0,.11);
        opacity: .86;
        animation: gcEmblemSparkle 6.4s ease-in-out infinite;
        pointer-events: none;
      }

      .magazine-scroll-indicator {
        position: fixed !important;
        top: 88px !important;
        right: 10px !important;
        bottom: 26px !important;
        width: 42px !important;
        z-index: 120 !important;
        pointer-events: none !important;
        display: flex !important;
        justify-content: center !important;
        align-items: stretch !important;
      }

      .magazine-body {
        position: relative !important;
        width: 30px !important;
        height: 100% !important;
        min-height: 0 !important;
        padding: 0 !important;
        border-radius: 10px 10px 16px 16px !important;
        background:
          linear-gradient(90deg, rgba(255,255,255,.1), transparent 20%, rgba(0,0,0,.35) 78%, rgba(255,255,255,.08)),
          linear-gradient(180deg, rgba(20,20,20,.96), rgba(8,8,8,.96)) !important;
        border: 1px solid rgba(255, 208, 0, .28) !important;
        box-shadow: inset 0 0 18px rgba(0,0,0,.65), 0 0 22px rgba(255,208,0,.1), 0 12px 36px rgba(0,0,0,.42) !important;
        overflow: hidden !important;
      }

      .ammo-track {
        position: absolute !important;
        inset: 10px 5px 12px !important;
        display: grid !important;
        grid-template-rows: repeat(var(--ammo-count, 80), 1fr) !important;
        gap: 2px !important;
        justify-items: stretch !important;
        z-index: 3 !important;
      }

      .ammo-slot {
        position: relative !important;
        width: auto !important;
        min-height: 5px !important;
        height: auto !important;
        border: 0 !important;
        background: transparent !important;
        pointer-events: auto !important;
        cursor: pointer !important;
      }

      .ammo-round {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 18px;
        height: 7px;
        transform: translate(-120px, -50%) scale(.35) rotate(-18deg);
        opacity: 0;
        border-radius: 999px 4px 4px 999px;
        background: linear-gradient(90deg, #f8f8f8 0%, #d8d8d8 22%, #8f8f8f 34%, #fff2a6 34%, #ffd000 58%, #b87900 100%);
        border: 1px solid rgba(255,255,255,.18);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.55), inset 0 -1px 2px rgba(0,0,0,.28), 0 2px 3px rgba(0,0,0,.55), 0 0 10px rgba(255,208,0,.2);
      }

      .ammo-round::before {
        content: "";
        position: absolute;
        right: -3px;
        top: 50%;
        width: 6px;
        height: 6px;
        transform: translateY(-50%) rotate(45deg);
        border-radius: 2px;
        background: linear-gradient(135deg, #fff6c9, #ffd000 55%, #a66800);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.5), 0 2px 3px rgba(0,0,0,.45), 0 0 8px rgba(255,208,0,.22);
      }

      .ammo-slot.loaded .ammo-round {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1) rotate(0deg);
      }

      .ammo-slot.active .ammo-round {
        filter: drop-shadow(0 0 10px rgba(255,208,0,.7));
        animation: gcAmmoActive 1.35s ease-in-out infinite;
      }

      .magazine-percent {
        position: absolute !important;
        right: 36px !important;
        bottom: 4px !important;
        min-width: 44px !important;
        padding: 5px 7px !important;
        border-radius: 999px !important;
        background: rgba(0,0,0,.62) !important;
        border: 1px solid rgba(255,208,0,.22) !important;
        color: var(--yellow, #ffd000) !important;
        font-size: 10px !important;
        font-weight: 950 !important;
        letter-spacing: .6px !important;
        text-align: center !important;
        pointer-events: none !important;
        backdrop-filter: blur(8px) !important;
        z-index: 4 !important;
      }

      @keyframes gcEmblemAura {
        0%, 100% { box-shadow: 0 30px 100px rgba(0,0,0,.55), 0 0 22px rgba(255,208,0,.08); filter: saturate(1.06) contrast(1.04); }
        45% { box-shadow: 0 34px 110px rgba(0,0,0,.6), 0 0 44px rgba(255,208,0,.2); filter: saturate(1.16) contrast(1.07); }
      }

      @keyframes gcEmblemSweep {
        0%, 56% { opacity: 0; transform: translate3d(-78%, 0, 0) rotate(7deg); }
        63% { opacity: .78; }
        82% { opacity: .18; transform: translate3d(78%, 0, 0) rotate(7deg); }
        100% { opacity: 0; transform: translate3d(78%, 0, 0) rotate(7deg); }
      }

      @keyframes gcEmblemSparkle {
        0%, 100% { opacity: .58; filter: blur(0); }
        44% { opacity: .98; filter: drop-shadow(0 0 10px rgba(255,208,0,.45)); }
        68% { opacity: .72; }
      }

      @keyframes gcAmmoActive {
        0%, 100% { transform: translate(-50%, -50%) scale(1); }
        50% { transform: translate(-50%, -50%) scale(1.18); }
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
        .topbar .nav-row > a[href$="works.html"],
        .topbar .nav-row > a[href$="constructor.html"],
        .topbar .nav-row > a[href$="stars.html"],
        .topbar .nav-row > a[href$="forma.html"],
        .topbar .nav-row > a[href$="account.html"],
        .topbar .nav-row > a[href$="entertainment.html"] {
          display: none !important;
        }

        .topbar .nav-row > a,
        .topbar .nav-more summary {
          min-height: 42px !important;
          width: 100% !important;
          transform: none !important;
        }

        .topbar .nav-row > a:hover,
        .topbar .nav-row > a:focus-visible,
        .topbar .nav-row > a[aria-current="page"],
        .topbar .nav-more summary:hover,
        .topbar .nav-more summary:focus-visible {
          transform: translate(1px, 1px) !important;
        }

        .topbar .nav-row > a::after,
        .topbar .nav-more summary::after {
          content: "";
          position: absolute;
          inset: -42% -56%;
          width: 48%;
          background:
            linear-gradient(90deg, transparent 0%, rgba(255,255,255,.28) 42%, rgba(255,238,156,.5) 50%, rgba(255,208,0,.18) 60%, transparent 100%);
          mix-blend-mode: screen;
          pointer-events: none;
          transform: translateX(-285%) rotate(18deg);
          animation: gcMobileNavSweep 16s cubic-bezier(.16, 1, .3, 1) infinite;
          animation-delay: var(--nav-ray-delay, 9s);
        }

        .topbar .nav-row-top > a:nth-child(1) { --nav-ray-delay: 8s; }
        .topbar .nav-row-top > a:nth-child(2) { --nav-ray-delay: 11s; }
        .topbar .nav-row-top > a:nth-child(3) { --nav-ray-delay: 15s; }
        .topbar .nav-row-bottom > a:nth-child(4) { --nav-ray-delay: 13s; }
        .topbar .nav-more summary { --nav-ray-delay: 19s; }

        .hero-orbit {
          background-size: auto, auto, auto, min(92%, 420px) auto, auto !important;
        }

        .gc-language-switcher {
          grid-template-columns: 23px minmax(62px, 88px) 10px;
          width: 132px;
          justify-self: end;
          margin: 8px 0 0 auto;
          padding: 3px;
          transform: none;
        }

        .gc-language-switcher::before {
          width: 23px;
          height: 23px;
          font-size: 8px;
        }

        .gc-language-select {
          min-height: 28px;
          font-size: 10px;
        }

        .localized-seo-panel .localized-seo-card {
          width: min(100%, calc(100vw - 24px));
          margin-bottom: 24px;
          border-radius: 18px;
        }
      }

      @keyframes gcMobileNavSweep {
        0%, 70% { opacity: 0; transform: translateX(-285%) rotate(18deg); }
        76% { opacity: .82; }
        89% { opacity: .2; transform: translateX(285%) rotate(18deg); }
        100% { opacity: 0; transform: translateX(285%) rotate(18deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .hero-orbit,
        .hero-orbit::before,
        .hero-orbit::after,
        .ammo-slot.active .ammo-round,
        .topbar .nav-row > a::after,
        .topbar .nav-more summary::after {
          animation: none !important;
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
    wrap.className = 'gc-language-switcher notranslate';
    wrap.setAttribute('translate', 'no');
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

  function setTranslatorCookie(target) {
    const value = target ? `/ru/${target}` : '';
    const lifetime = target ? 'max-age=31536000' : 'max-age=0';
    const base = `googtrans=${value};path=/;${lifetime};SameSite=Lax`;
    document.cookie = base;
    const host = location.hostname;
    if (host && host.includes('.')) {
      document.cookie = `${base};domain=.${host}`;
      const parts = host.split('.');
      if (parts.length > 2) document.cookie = `${base};domain=.${parts.slice(-2).join('.')}`;
    }
  }

  function ensureAutoTranslator() {
    if (!document.getElementById('google_translate_element')) {
      const container = document.createElement('div');
      container.id = 'google_translate_element';
      container.setAttribute('aria-hidden', 'true');
      document.body.appendChild(container);
    }

    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = function googleTranslateElementInit() {
        if (!window.google?.translate?.TranslateElement) return;
        new window.google.translate.TranslateElement({
          pageLanguage: 'ru',
          includedLanguages: TRANSLATOR_CODES,
          autoDisplay: false,
          multilanguagePage: true
        }, 'google_translate_element');
      };
    }

    if (!document.getElementById('gcGoogleTranslateScript')) {
      const script = document.createElement('script');
      script.id = 'gcGoogleTranslateScript';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.head.appendChild(script);
    }
  }

  function afterPageLoad(callback) {
    if (document.readyState === 'complete') {
      window.setTimeout(callback, 80);
      return;
    }
    window.addEventListener('load', () => window.setTimeout(callback, 80), { once: true });
  }

  function ensureUnifiedScrollIndicator() {
    if (window.matchMedia('(max-width: 720px)').matches) return;
    if (window.__grillzUnifiedScrollAbort) window.__grillzUnifiedScrollAbort.abort();

    const controller = new AbortController();
    window.__grillzUnifiedScrollAbort = controller;

    let indicator = document.querySelector('.magazine-scroll-indicator');
    if (!indicator) {
      indicator = document.createElement('aside');
      indicator.className = 'magazine-scroll-indicator';
      indicator.setAttribute('aria-label', 'Визуальный индикатор прокрутки сайта');
      document.body.prepend(indicator);
    }

    indicator.innerHTML = '<div class="magazine-body"><div class="ammo-track" id="ammoTrack"></div><div class="magazine-percent" id="magazinePercent">0%</div></div>';

    const track = indicator.querySelector('#ammoTrack');
    const percent = indicator.querySelector('#magazinePercent');
    const sections = [...document.querySelectorAll('main > section')];
    const total = Math.max(sections.length * 8, 16);
    if (!track) return;

    track.style.setProperty('--ammo-count', total);
    for (let index = 0; index < total; index += 1) {
      const slot = document.createElement('button');
      const section = sections[Math.min(sections.length - 1, Math.floor((index / total) * sections.length))];
      slot.className = 'ammo-slot';
      slot.type = 'button';
      slot.setAttribute('aria-label', 'Перейти к части страницы');
      slot.innerHTML = '<span class="ammo-round" aria-hidden="true"></span>';
      slot.addEventListener('click', () => section?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      track.appendChild(slot);
    }

    const slots = [...track.querySelectorAll('.ammo-slot')];
    let progressFrame = null;
    const renderProgress = () => {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
      const loaded = Math.round(progress * total);
      slots.forEach((slot, index) => {
        slot.classList.toggle('loaded', index < loaded);
        slot.classList.toggle('active', index === Math.max(0, loaded - 1));
      });
      if (percent) percent.textContent = Math.round(progress * 100) + '%';
      progressFrame = null;
    };
    const requestProgress = () => {
      if (progressFrame === null) progressFrame = requestAnimationFrame(renderProgress);
    };

    renderProgress();
    window.addEventListener('scroll', requestProgress, { passive: true, signal: controller.signal });
    window.addEventListener('resize', requestProgress, { signal: controller.signal });
  }

  function scheduleUnifiedScrollIndicator() {
    afterPageLoad(() => {
      ensureUnifiedScrollIndicator();
      window.setTimeout(ensureUnifiedScrollIndicator, 260);
    });
  }

  function syncAutoTranslator(persist) {
    const target = TRANSLATOR_LANGS[currentLang];
    if (!target) {
      setTranslatorCookie('');
      document.documentElement.classList.remove('gc-auto-translated');
      if (persist && document.querySelector('.goog-te-combo')) {
        window.setTimeout(() => location.reload(), 80);
      }
      return;
    }

    document.documentElement.classList.add('gc-auto-translated');
    setTranslatorCookie(target);
    afterPageLoad(() => {
      ensureAutoTranslator();

      let attempts = 0;
      const applyExternalLanguage = () => {
        const combo = document.querySelector('.goog-te-combo');
        if (combo) {
          combo.value = target;
          combo.dispatchEvent(new Event('change'));
          return;
        }
        attempts += 1;
        if (attempts < 28) window.setTimeout(applyExternalLanguage, 350);
      };
      applyExternalLanguage();
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
    scheduleUnifiedScrollIndicator();
    syncSwitcher();
    syncAutoTranslator(persist);
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
