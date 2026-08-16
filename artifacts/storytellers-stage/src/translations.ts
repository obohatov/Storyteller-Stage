export type Language = 'en' | 'uk' | 'ru' | 'nl';

export const LANGUAGES: { code: Language; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'EN', nativeLabel: 'English' },
  { code: 'uk', label: 'UA', nativeLabel: 'Українська' },
  { code: 'ru', label: 'RU', nativeLabel: 'Русский' },
  { code: 'nl', label: 'NL', nativeLabel: 'Nederlands' },
];

export const DEFAULT_LANGUAGE: Language = 'en';

export interface PlayItem {
  slug: string;
  title: string;
  genre: string;
  summary: string;
  fullDescription?: string;
}

export interface TaleItem {
  slug: string;
  title: string;
  summary: string;
  fullDescription?: string;
}

export interface Translation {
  nav: {
    plays: string;
    fairyTales: string;
    about: string;
    contact: string;
    backToHome: string;
  };
  hero: {
    title: string;
    subtitle: string;
    exploreStage: string;
    enterMagic: string;
  };
  plays: {
    title: string;
    description: string;
    items: PlayItem[];
  };
  fairyTales: {
    title: string;
    description: string;
    items: TaleItem[];
  };
  about: {
    title: string;
    content: string;
  };
  contact: {
    title: string;
    name: string;
    email: string;
    message: string;
    send: string;
    description: string;
    category: string;
    categories: {
      general: string;
      publishing: string;
      translation: string;
      festival: string;
      collaboration: string;
      reader: string;
      other: string;
    };
    success: string;
    error: string;
    sending: string;
    privacyNote: string;
    validation: {
      nameRequired: string;
      emailInvalid: string;
      messageRequired: string;
      messageMin: string;
      categoryRequired: string;
    };
  };
  scriptRequest: {
    ctaLabel: string;
    modalTitle: string;
    requestingPlay: string;
    name: string;
    email: string;
    organization: string;
    organizationPlaceholder: string;
    role: string;
    rolePlaceholder: string;
    city: string;
    cityPlaceholder: string;
    country: string;
    countryPlaceholder: string;
    intendedUse: string;
    intendedUseOptions: {
      reading: string;
      production: string;
      festival: string;
      publishing: string;
      translation: string;
      education: string;
      other: string;
    };
    message: string;
    messagePlaceholder: string;
    send: string;
    sending: string;
    successTitle: string;
    success: string;
    successDetail: string;
    error: string;
    privacyNote: string;
    cancel: string;
    validation: {
      organizationRequired: string;
      countryRequired: string;
      intendedUseRequired: string;
      messageRequired: string;
    };
  };
}

export const translations: Record<Language, Translation> = {
  en: {
    nav: {
      plays: 'Plays',
      fairyTales: 'Fairy Tales',
      about: 'About',
      contact: 'Contact',
      backToHome: 'Back',
    },
    hero: {
      title: "Playwright and prose writer",
      subtitle: "Sofia Bohatova writes plays and fairy tales about people searching for themselves, trying to understand one another, and making sense of the world around them.\n\nThere is very little magic here — yet animals and objects speak, and the characters sometimes find themselves in situations where ordinary life becomes a little more unusual, a little funnier, and more important than it first seemed.",
      exploreStage: "Stories that come alive on stage.",
      enterMagic: "Almost no magic. Simply their fairy-tale life.",
    },
    plays: {
      title: "Plays",
      description: "From the darkness of the auditorium, we watch the characters on a lit stage trying to find themselves.\n\nSometimes they do it through songs and dancing; sometimes through conflict, fear, or pain. At times, meeting who they are today means letting go of who they were yesterday.\n\nFor Sofia Bohatova, theatre is a distinctive form of literature. On stage, there is no room for accidental words or gestures: everything has to mean something. At the same time, theatre allows an author to witness something that ordinary reading cannot reveal — one story resonating with many people at once.\n\nThe site presents plays for professional, amateur, youth, school, and children's theatres.",
      items: [
        {
          slug: 'the-echo-of-silence',
          title: "The Echo of Silence",
          genre: "Drama",
          summary: "A story about a small village rediscovering its lost history.",
          fullDescription: "This play explores themes of memory, identity, and community as residents of a quiet village uncover a forgotten chapter of their shared past.",
        },
        {
          slug: 'midsummer-mischief',
          title: "Midsummer Mischief",
          genre: "Comedy",
          summary: "A lighthearted romp through a chaotic wedding preparation.",
          fullDescription: "A comedy of errors unfolds as well-meaning relatives, lost invitations, and unexpected guests conspire to make one wedding unforgettable.",
        },
      ],
    },
    fairyTales: {
      title: "Fairy Tales",
      description: "Here, animals and objects speak to people. But is that really magic?\n\nPerhaps it is simply their fairy-tale life.\n\nSofia Bohatova's fairy tales grew out of the bedtime stories she began telling her own children many years ago.\n\nThey are stories for children and adults about friendship and loneliness, good and evil, attachment, misconceptions, and small discoveries that can sometimes change the way we see familiar things.",
      items: [
        {
          slug: 'the-star-that-fell-in-the-well',
          title: "The Star that Fell in the Well",
          summary: "A tiny star gets lost and finds friendship in the deep blue water.",
          fullDescription: "Deep in a meadow stands an old stone well. One autumn night, a small star tumbles from the sky and discovers that the truest friendships are found in the most unexpected places.",
        },
        {
          slug: 'the-dragon-who-loved-tea',
          title: "The Dragon Who Loved Tea",
          summary: "A gentle dragon prefers Earl Grey over breathing fire.",
          fullDescription: "Unlike his fearsome cousins, this small green dragon has never breathed a single flame — he'd much rather curl up with a warm pot of Earl Grey and a good biscuit.",
        },
      ],
    },
    about: {
      title: "About the Author",
      content: "A Ukrainian playwright and prose writer living in Belgium.\n\nBefore literature became one of the central parts of her life, Sofia worked in art exhibition organisation and film production.\n\nShe began writing around twenty years ago. Her first texts were fairy tales that grew out of bedtime stories she told her children.\n\nOver time, Sofia was drawn to playwriting — a form she values for its precision. On stage, an unnecessary word or gesture immediately becomes visible, while a literary text becomes a living action experienced simultaneously by actors and audiences.\n\nFor Sofia, ideas matter most when they are shared through a story that first of all engages the reader or viewer. She is interested in questions that remain relevant at any age: where the boundary lies between good and evil, how we distinguish truth from misconception, why we fear loneliness, and why we need other people.\n\nHer plays have already been staged in Belgium and have received warm responses from audiences.",
    },
    contact: {
      title: "Contact Sofia Bohatova",
      description: "For enquiries about productions, full scripts, publishing, translations, festivals, collaboration — or simply to share your thoughts about something you have read — use the contact form on this website.\n\nEmail: contact@bohatova.art",
      name: "Name",
      email: "Email",
      message: "Message",
      send: "Send Message",
      category: "Enquiry Type",
      categories: {
        general: "General",
        publishing: "Publishing",
        translation: "Translation",
        festival: "Festival",
        collaboration: "Collaboration",
        reader: "Reader Message",
        other: "Other",
      },
      success: "Thank you. Your message has been sent to Sofia Bohatova.",
      error: "Something went wrong. Please try again.",
      sending: "Sending…",
      privacyNote: "The information you provide will be used solely to respond to your enquiry.",
      validation: {
        nameRequired: "Please enter your name.",
        emailInvalid: "Please enter a valid email address.",
        messageRequired: "Please enter a message.",
        messageMin: "Message must be at least 10 characters.",
        categoryRequired: "Please select an enquiry type.",
      },
    },
    scriptRequest: {
      ctaLabel: "Request Full Script",
      modalTitle: "Request the Full Script",
      requestingPlay: "Requesting the script for:",
      name: "Your Name",
      email: "Email Address",
      organization: "Organisation / Theatre",
      organizationPlaceholder: "e.g. City Theatre Company",
      role: "Your Role / Position",
      rolePlaceholder: "e.g. Artistic Director",
      city: "City",
      cityPlaceholder: "e.g. Amsterdam",
      country: "Country",
      countryPlaceholder: "e.g. Netherlands",
      intendedUse: "Intended Use",
      intendedUseOptions: {
        reading: "Reading / Evaluation",
        production: "Production",
        festival: "Festival",
        publishing: "Publishing",
        translation: "Translation",
        education: "Education",
        other: "Other",
      },
      message: "Additional Notes",
      messagePlaceholder: "Tell us more about your project, timeline, or any specific requirements…",
      send: "Send Request",
      sending: "Sending…",
      successTitle: "Request Received",
      success: "Thank you. Your request has been received.",
      successDetail: "Sofia Bohatova will be in touch with you shortly.",
      error: "Something went wrong. Please try again.",
      privacyNote: "The information you provide will be used solely to respond to your script request.",
      cancel: "Cancel",
      validation: {
        organizationRequired: "Please enter your organisation name.",
        countryRequired: "Please enter your country.",
        intendedUseRequired: "Please select an intended use.",
        messageRequired: "Please add a brief note.",
      },
    },
  },

  uk: {
    nav: {
      plays: "П'єси",
      fairyTales: "Казки",
      about: "Про авторку",
      contact: "Контакти",
      backToHome: "Назад",
    },
    hero: {
      title: "Драматургиня і прозаїкиня",
      subtitle: "Софія Богатова пише п'єси та казки про те, як людина шукає себе, намагається зрозуміти інших і розібратися у світі навколо.\n\nТут майже немає чарів — але звірі й предмети розмовляють, а герої іноді опиняються в ситуаціях, де звичайне життя стає трохи незвичнішим, смішнішим і важливішим, ніж здавалося спочатку.",
      exploreStage: "Історії, що оживають на сцені.",
      enterMagic: "Майже без чарів. Просто їхнє казкове життя.",
    },
    plays: {
      title: "П'єси",
      description: "З темряви глядацької зали ми спостерігаємо, як на освітленій сцені герої намагаються знайти себе.\n\nІноді вони роблять це з піснями й танцями, іноді — через конфлікт, страх або біль. Часом, щоб зустрітися із собою сьогоднішнім, їм доводиться відмовитися від себе вчорашнього.\n\nДля Софії Богатової театр — особлива форма літератури. На сцені немає місця випадковим словам і жестам: усе повинно мати сенс. Водночас саме театр дозволяє побачити те, чого не видно під час звичайного читання тексту, — як одна історія одночасно відгукується в багатьох глядачах.\n\nНа сайті представлені п'єси для професійних, аматорських, молодіжних, шкільних і дитячих театрів.",
      items: [
        {
          slug: 'the-echo-of-silence',
          title: "Відлуння тиші",
          genre: "Драма",
          summary: "Історія про маленьке село, що заново відкриває свою втрачену історію.",
          fullDescription: "П'єса досліджує теми пам'яті, ідентичності та спільноти.",
        },
        {
          slug: 'midsummer-mischief',
          title: "Бешкет у літню ніч",
          genre: "Комедія",
          summary: "Весела пригода під час хаотичної підготовки до весілля.",
          fullDescription: "Комедія помилок розгортається, поки добронаміреня родичі та несподівані гості роблять одне весілля незабутнім.",
        },
      ],
    },
    fairyTales: {
      title: "Казки",
      description: "Тут звірі й предмети розмовляють із людьми. Але хіба це чари?\n\nМожливо, це просто їхнє казкове життя.\n\nКазки Софії Богатової виросли з історій, які багато років тому вона почала розповідати перед сном власним дітям.\n\nЦе казки для дітей і дорослих про дружбу й самотність, добро і зло, прив'язаність, омани та маленькі відкриття, які іноді змінюють наш погляд на звичні речі.",
      items: [
        {
          slug: 'the-star-that-fell-in-the-well',
          title: "Зірка, що впала в колодязь",
          summary: "Крихітна зірка губиться і знаходить дружбу в глибокій синій воді.",
          fullDescription: "Повний опис — тимчасовий текст.",
        },
        {
          slug: 'the-dragon-who-loved-tea',
          title: "Дракон, який любив чай",
          summary: "Лагідний дракон віддає перевагу чаю замість того, щоб дихати вогнем.",
          fullDescription: "Повний опис — тимчасовий текст.",
        },
      ],
    },
    about: {
      title: "Про авторку",
      content: "Драматургиня і прозаїкиня з України, яка живе в Бельгії.\n\nДо того як література стала однією з головних частин її життя, Софія займалася організацією художніх виставок і працювала у кіновиробництві.\n\nПисати вона почала близько двадцяти років тому. Першими текстами стали казки, що виросли з історій, які вона розповідала своїм дітям перед сном.\n\nЗгодом Софія прийшла до драматургії — форми, яку цінує за її точність. На сцені зайве слово або жест відразу стає помітним, а літературний текст перетворюється на живу дію, яку водночас переживають актори й глядачі.\n\nДля Софії важливо говорити про ідеї у формі історії, яка передусім захоплює. Її цікавлять питання, що супроводжують людину незалежно від віку: де проходить межа між добром і злом, як відрізнити істину від омани, чому ми боїмося самотності й чому потребуємо інших людей.\n\nЇї п'єси вже ставлять у Бельгії, і вони отримують теплі відгуки глядачів.",
    },
    contact: {
      title: "Зв'язатися із Софією Богатовою",
      description: "Щодо постановок, повних текстів п'єс, публікацій, перекладів, фестивалів, співпраці або просто щоб поділитися враженням від прочитаного — напишіть через форму на сайті.\n\nEmail: contact@bohatova.art",
      name: "Ім'я",
      email: "Електронна пошта",
      message: "Повідомлення",
      send: "Надіслати",
      category: "Тема запиту",
      categories: {
        general: "Загальний",
        publishing: "Видавництво",
        translation: "Переклад",
        festival: "Фестиваль",
        collaboration: "Співпраця",
        reader: "Повідомлення читача",
        other: "Інше",
      },
      success: "Дякуємо. Ваше повідомлення надіслано Софії Богатовій.",
      error: "Щось пішло не так. Будь ласка, спробуйте знову.",
      sending: "Надсилання…",
      privacyNote: "Надана вами інформація буде використана виключно для відповіді на ваш запит.",
      validation: {
        nameRequired: "Будь ласка, вкажіть своє ім'я.",
        emailInvalid: "Будь ласка, введіть дійсну адресу електронної пошти.",
        messageRequired: "Будь ласка, введіть повідомлення.",
        messageMin: "Повідомлення має містити не менше 10 символів.",
        categoryRequired: "Будь ласка, оберіть тему запиту.",
      },
    },
    scriptRequest: {
      ctaLabel: "Запросити повний текст",
      modalTitle: "Запит на повний текст",
      requestingPlay: "Запит на текст п'єси:",
      name: "Ваше ім'я",
      email: "Електронна пошта",
      organization: "Організація / Театр",
      organizationPlaceholder: "напр. Міський театр",
      role: "Ваша роль / посада",
      rolePlaceholder: "напр. Художній керівник",
      city: "Місто",
      cityPlaceholder: "напр. Київ",
      country: "Країна",
      countryPlaceholder: "напр. Україна",
      intendedUse: "Мета використання",
      intendedUseOptions: {
        reading: "Читання / Оцінка",
        production: "Постановка",
        festival: "Фестиваль",
        publishing: "Видавництво",
        translation: "Переклад",
        education: "Освіта",
        other: "Інше",
      },
      message: "Додаткові примітки",
      messagePlaceholder: "Розкажіть більше про ваш проект, терміни або особливі побажання…",
      send: "Надіслати запит",
      sending: "Надсилання…",
      successTitle: "Запит отримано",
      success: "Дякуємо. Ваш запит отримано.",
      successDetail: "Софія Богатова зв'яжеться з вами найближчим часом.",
      error: "Щось пішло не так. Спробуйте ще раз.",
      privacyNote: "Надана вами інформація буде використана виключно для відповіді на ваш запит на текст.",
      cancel: "Скасувати",
      validation: {
        organizationRequired: "Будь ласка, вкажіть назву організації.",
        countryRequired: "Будь ласка, вкажіть країну.",
        intendedUseRequired: "Будь ласка, оберіть мету використання.",
        messageRequired: "Будь ласка, додайте коротку примітку.",
      },
    },
  },

  ru: {
    nav: {
      plays: "Пьесы",
      fairyTales: "Сказки",
      about: "Об авторе",
      contact: "Контакты",
      backToHome: "Назад",
    },
    hero: {
      title: "Драматург и прозаик",
      subtitle: "София Богатова пишет пьесы и сказки о том, как человек ищет себя, пытается понять других и разобраться в мире вокруг.\n\nЗдесь почти нет волшебства — но звери и предметы разговаривают, а герои иногда оказываются в ситуациях, где обычная жизнь становится немного необычнее, смешнее и важнее, чем казалась сначала.",
      exploreStage: "Истории, которые оживают на сцене.",
      enterMagic: "Почти без волшебства. Просто их сказочная жизнь.",
    },
    plays: {
      title: "Пьесы",
      description: "Из темноты зрительного зала мы наблюдаем за тем, как на освещённой сцене герои пытаются найти себя.\n\nИногда они делают это с песнями и танцами, иногда — через конфликт, страх или боль. Порой для встречи с собой сегодняшним им приходится отказаться от себя вчерашнего.\n\nДля Софии Богатовой театр — особая форма литературы. На сцене нет места случайным словам и жестам: всё должно иметь смысл. Но именно театр позволяет увидеть то, чего невозможно увидеть, когда человек просто читает текст, — как одна история одновременно отзывается во множестве зрителей.\n\nНа сайте представлены пьесы для профессиональных, любительских, молодёжных, школьных и детских театров.",
      items: [
        {
          slug: 'the-echo-of-silence',
          title: "Эхо тишины",
          genre: "Драма",
          summary: "История о маленькой деревне, заново открывающей свою забытую историю.",
          fullDescription: "Пьеса исследует темы памяти, идентичности и сообщества.",
        },
        {
          slug: 'midsummer-mischief',
          title: "Проказы в летнюю ночь",
          genre: "Комедия",
          summary: "Лёгкая комедия о хаотичной подготовке к свадьбе.",
          fullDescription: "Комедия ошибок разворачивается, пока благонамеренные родственники и неожиданные гости делают одну свадьбу незабываемой.",
        },
      ],
    },
    fairyTales: {
      title: "Сказки",
      description: "Здесь звери и предметы разговаривают с людьми. Но разве это волшебство?\n\nВозможно, это просто их сказочная жизнь.\n\nСказки Софии Богатовой выросли из историй, которые она много лет назад начала рассказывать перед сном собственным детям.\n\nЭто сказки для детей и взрослых о дружбе и одиночестве, добре и зле, привязанности, заблуждениях и маленьких открытиях, которые иногда меняют то, как мы смотрим на привычные вещи.",
      items: [
        {
          slug: 'the-star-that-fell-in-the-well',
          title: "Звезда, упавшая в колодец",
          summary: "Маленькая звезда заблудилась и нашла дружбу в глубокой синей воде.",
          fullDescription: "Полное описание — временный текст.",
        },
        {
          slug: 'the-dragon-who-loved-tea',
          title: "Дракон, который любил чай",
          summary: "Добрый дракон предпочитает чай с бергамотом вместо огнедыхания.",
          fullDescription: "Полное описание — временный текст.",
        },
      ],
    },
    about: {
      title: "Об авторе",
      content: "Драматург и прозаик из Украины, живущая в Бельгии.\n\nДо того как литература стала одной из главных частей её жизни, София занималась организацией художественных выставок и работала в кинопроизводстве.\n\nПисать она начала около двадцати лет назад. Первыми текстами стали сказки, выросшие из историй, которые она рассказывала своим детям перед сном.\n\nПостепенно София пришла к драматургии — форме, которую она ценит за её точность. На сцене лишнее слово или жест сразу становится заметным, а литературный текст превращается в живое действие, которое одновременно переживают актёры и зрители.\n\nДля Софии важно говорить об идеях в форме истории, которая прежде всего увлекает. Её интересуют вопросы, которые сопровождают человека независимо от возраста: где проходит граница между добром и злом, как отличить истину от заблуждения, почему мы боимся одиночества и почему нуждаемся в других людях.\n\nЕё пьесы уже ставятся в Бельгии и получают тёплый отклик зрителей.",
    },
    contact: {
      title: "Связаться с Софией Богатовой",
      description: "По вопросам постановок, полного текста пьес, публикаций, переводов, фестивалей, сотрудничества или просто чтобы поделиться впечатлением от прочитанного — напишите через форму на сайте.\n\nE-mail: contact@bohatova.art",
      name: "Имя",
      email: "Электронная почта",
      message: "Сообщение",
      send: "Отправить",
      category: "Тема обращения",
      categories: {
        general: "Общее",
        publishing: "Издательство",
        translation: "Перевод",
        festival: "Фестиваль",
        collaboration: "Сотрудничество",
        reader: "Сообщение читателя",
        other: "Другое",
      },
      success: "Спасибо. Ваше сообщение отправлено Софии Богатовой.",
      error: "Что-то пошло не так. Пожалуйста, попробуйте снова.",
      sending: "Отправка…",
      privacyNote: "Предоставленная вами информация будет использована исключительно для ответа на ваш запрос.",
      validation: {
        nameRequired: "Пожалуйста, введите своё имя.",
        emailInvalid: "Пожалуйста, введите действительный адрес электронной почты.",
        messageRequired: "Пожалуйста, введите сообщение.",
        messageMin: "Сообщение должно содержать не менее 10 символов.",
        categoryRequired: "Пожалуйста, выберите тему обращения.",
      },
    },
    scriptRequest: {
      ctaLabel: "Запросить полный текст",
      modalTitle: "Запрос полного текста",
      requestingPlay: "Запрос текста пьесы:",
      name: "Ваше имя",
      email: "Электронная почта",
      organization: "Организация / Театр",
      organizationPlaceholder: "напр. Городской театр",
      role: "Ваша роль / должность",
      rolePlaceholder: "напр. Художественный руководитель",
      city: "Город",
      cityPlaceholder: "напр. Брюссель",
      country: "Страна",
      countryPlaceholder: "напр. Бельгия",
      intendedUse: "Цель использования",
      intendedUseOptions: {
        reading: "Чтение / Оценка",
        production: "Постановка",
        festival: "Фестиваль",
        publishing: "Издательство",
        translation: "Перевод",
        education: "Образование",
        other: "Другое",
      },
      message: "Дополнительные заметки",
      messagePlaceholder: "Расскажите подробнее о вашем проекте, сроках или особых требованиях…",
      send: "Отправить запрос",
      sending: "Отправка…",
      successTitle: "Запрос получен",
      success: "Спасибо. Ваш запрос получен.",
      successDetail: "София Богатова свяжется с вами в ближайшее время.",
      error: "Что-то пошло не так. Попробуйте снова.",
      privacyNote: "Предоставленная вами информация будет использована исключительно для ответа на ваш запрос.",
      cancel: "Отмена",
      validation: {
        organizationRequired: "Пожалуйста, укажите название организации.",
        countryRequired: "Пожалуйста, укажите страну.",
        intendedUseRequired: "Пожалуйста, выберите цель использования.",
        messageRequired: "Пожалуйста, добавьте краткое примечание.",
      },
    },
  },

  nl: {
    nav: {
      plays: "Toneelstukken",
      fairyTales: "Sprookjes",
      about: "Over de auteur",
      contact: "Contact",
      backToHome: "Terug",
    },
    hero: {
      title: "Toneelschrijver en proza-auteur",
      subtitle: "Sofia Bohatova schrijft toneelstukken en sprookjes over mensen die zichzelf proberen te vinden, anderen willen begrijpen en hun weg zoeken in de wereld om hen heen.\n\nEr is hier nauwelijks magie — en toch praten dieren en voorwerpen, en komen de personages soms terecht in situaties waarin het gewone leven net iets ongebruikelijker, grappiger en belangrijker wordt dan het aanvankelijk leek.",
      exploreStage: "Verhalen die op het toneel tot leven komen.",
      enterMagic: "Bijna geen magie. Gewoon hun sprookjesleven.",
    },
    plays: {
      title: "Toneelstukken",
      description: "Vanuit de duisternis van de zaal kijken we hoe de personages op het verlichte toneel zichzelf proberen te vinden.\n\nSoms doen ze dat met zang en dans, soms via conflict, angst of pijn. Soms moeten ze afscheid nemen van wie ze gisteren waren om te kunnen ontdekken wie ze vandaag zijn.\n\nVoor Sofia Bohatova is theater een bijzondere vorm van literatuur. Op het toneel is geen plaats voor toevallige woorden of gebaren: alles moet betekenis hebben. Tegelijk maakt theater iets zichtbaar wat bij gewoon lezen verborgen blijft — hoe één verhaal tegelijk bij veel verschillende mensen weerklank vindt.\n\nOp deze website staan toneelstukken voor professionele, amateur-, jeugd-, school- en kindertheaters.",
      items: [
        {
          slug: 'the-echo-of-silence',
          title: "De Echo van Stilte",
          genre: "Drama",
          summary: "Een verhaal over een klein dorp dat zijn verloren geschiedenis herontdekt.",
          fullDescription: "Dit stuk verkent thema's van geheugen, identiteit en gemeenschap.",
        },
        {
          slug: 'midsummer-mischief',
          title: "Midzomermishief",
          genre: "Komedie",
          summary: "Een vrolijke tocht door een chaotische huwelijksvoorbereiding.",
          fullDescription: "Een komedie der vergissingen ontvouwt zich terwijl welmenende familieleden en onverwachte gasten één bruiloft onvergetelijk maken.",
        },
      ],
    },
    fairyTales: {
      title: "Sprookjes",
      description: "Hier praten dieren en voorwerpen met mensen. Maar is dat eigenlijk wel magie?\n\nMisschien is het gewoon hun sprookjesleven.\n\nDe sprookjes van Sofia Bohatova ontstonden uit de verhaaltjes die zij vele jaren geleden voor het slapengaan aan haar eigen kinderen begon te vertellen.\n\nHet zijn verhalen voor kinderen en volwassenen over vriendschap en eenzaamheid, goed en kwaad, verbondenheid, misvattingen en kleine ontdekkingen die soms veranderen hoe we naar vertrouwde dingen kijken.",
      items: [
        {
          slug: 'the-star-that-fell-in-the-well',
          title: "De Ster die in de Put Viel",
          summary: "Een klein sterretje verdwaalt en vindt vriendschap in het diepblauwe water.",
          fullDescription: "Volledige beschrijving — tijdelijke tekst.",
        },
        {
          slug: 'the-dragon-who-loved-tea',
          title: "De Draak die van Thee Hield",
          summary: "Een vriendelijke draak verkiest Earl Grey boven vuurspuwen.",
          fullDescription: "Volledige beschrijving — tijdelijke tekst.",
        },
      ],
    },
    about: {
      title: "Over de auteur",
      content: "Een Oekraïense toneelschrijver en proza-auteur die in België woont.\n\nVoordat literatuur een van de centrale onderdelen van haar leven werd, hield Sofia zich bezig met de organisatie van kunsttentoonstellingen en werkte ze in de filmproductie.\n\nZe begon ongeveer twintig jaar geleden te schrijven. Haar eerste teksten waren sprookjes die voortkwamen uit de verhalen die ze haar kinderen voor het slapengaan vertelde.\n\nGeleidelijk vond Sofia haar weg naar het toneelschrijven — een vorm die ze waardeert om haar precisie. Op het toneel wordt een overbodig woord of gebaar meteen zichtbaar, terwijl een literaire tekst verandert in een levende handeling die acteurs en publiek samen beleven.\n\nVoor Sofia is het belangrijk om ideeën te delen via verhalen die de lezer of toeschouwer in de eerste plaats weten te boeien. Ze is geïnteresseerd in vragen die mensen van elke leeftijd bezighouden: waar de grens ligt tussen goed en kwaad, hoe we waarheid van misvatting onderscheiden, waarom we bang zijn voor eenzaamheid en waarom we andere mensen nodig hebben.\n\nHaar toneelstukken zijn al in België opgevoerd en kregen warme reacties van het publiek.",
    },
    contact: {
      title: "Neem contact op met Sofia Bohatova",
      description: "Voor vragen over opvoeringen, volledige toneelteksten, publicaties, vertalingen, festivals, samenwerking — of gewoon om uw indruk van een gelezen tekst te delen — kunt u het contactformulier op deze website gebruiken.\n\nE-mail: contact@bohatova.art",
      name: "Naam",
      email: "E-mail",
      message: "Bericht",
      send: "Stuur een bericht",
      category: "Type aanvraag",
      categories: {
        general: "Algemeen",
        publishing: "Uitgeverij",
        translation: "Vertaling",
        festival: "Festival",
        collaboration: "Samenwerking",
        reader: "Lezerbericht",
        other: "Overig",
      },
      success: "Dank u. Uw bericht is verzonden naar Sofia Bohatova.",
      error: "Er is iets misgegaan. Probeer het opnieuw.",
      sending: "Verzenden…",
      privacyNote: "De door u verstrekte informatie wordt uitsluitend gebruikt om op uw aanvraag te reageren.",
      validation: {
        nameRequired: "Vul uw naam in.",
        emailInvalid: "Vul een geldig e-mailadres in.",
        messageRequired: "Vul een bericht in.",
        messageMin: "Het bericht moet minimaal 10 tekens bevatten.",
        categoryRequired: "Selecteer een type aanvraag.",
      },
    },
    scriptRequest: {
      ctaLabel: "Vraag de volledige tekst aan",
      modalTitle: "Volledige tekst aanvragen",
      requestingPlay: "Tekst aanvragen voor:",
      name: "Uw naam",
      email: "E-mailadres",
      organization: "Organisatie / Theater",
      organizationPlaceholder: "bijv. Stadstheater",
      role: "Uw rol / functie",
      rolePlaceholder: "bijv. Artistiek directeur",
      city: "Stad",
      cityPlaceholder: "bijv. Amsterdam",
      country: "Land",
      countryPlaceholder: "bijv. Nederland",
      intendedUse: "Beoogd gebruik",
      intendedUseOptions: {
        reading: "Lezen / Beoordeling",
        production: "Productie",
        festival: "Festival",
        publishing: "Uitgeverij",
        translation: "Vertaling",
        education: "Onderwijs",
        other: "Overig",
      },
      message: "Aanvullende opmerkingen",
      messagePlaceholder: "Vertel ons meer over uw project, tijdlijn of specifieke wensen…",
      send: "Aanvraag verzenden",
      sending: "Verzenden…",
      successTitle: "Aanvraag ontvangen",
      success: "Dank u. Uw aanvraag is ontvangen.",
      successDetail: "Sofia Bohatova neemt binnenkort contact met u op.",
      error: "Er is iets misgegaan. Probeer het opnieuw.",
      privacyNote: "De door u verstrekte informatie wordt uitsluitend gebruikt om op uw scriptaanvraag te reageren.",
      cancel: "Annuleren",
      validation: {
        organizationRequired: "Vul de naam van uw organisatie in.",
        countryRequired: "Vul uw land in.",
        intendedUseRequired: "Selecteer een beoogd gebruik.",
        messageRequired: "Voeg een korte opmerking toe.",
      },
    },
  },
};
