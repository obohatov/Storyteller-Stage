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
      title: "Stories for the Stage and the Soul",
      subtitle: "Original plays for amateur theatre and magical fairy tales for children.",
      exploreStage: "Explore the Stage",
      enterMagic: "Enter the Magic",
    },
    plays: {
      title: "Theatrical Plays",
      description: "Engaging scripts designed for amateur theatre groups, focusing on human connection and community.",
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
      description: "Whimsical stories written for children, full of wonder and gentle wisdom.",
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
      content: "The author is a writer and playwright based in the Netherlands, with roots in Ukraine. She writes for amateur theatre groups and for children, believing that stories are the quietest way to cross any distance between people.",
    },
    contact: {
      title: "Get in Touch",
      description: "Interested in staging one of the plays, or in the fairy tales for your children? Please reach out.",
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
      title: "Історії для сцени та душі",
      subtitle: "Оригінальні п'єси для аматорського театру та чарівні казки для дітей.",
      exploreStage: "На сцену",
      enterMagic: "У казку",
    },
    plays: {
      title: "Театральні п'єси",
      description: "Захоплюючі сценарії для аматорських театральних груп.",
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
      description: "Примхливі казки, повні дива та лагідної мудрості.",
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
      content: "Авторка — письменниця та драматург, яка живе в Нідерландах та має коріння в Україні. Вона пише для аматорських театрів та для дітей.",
    },
    contact: {
      title: "Зв'яжіться зі мною",
      description: "Зацікавлені у постановці однієї з п'єс або казок? Напишіть мені.",
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
      ctaLabel: "Запросити повний сценарій",
      modalTitle: "Запит на повний сценарій",
      requestingPlay: "Запит на сценарій п'єси:",
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
      privacyNote: "Надана вами інформація буде використана виключно для відповіді на ваш запит на сценарій.",
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
      title: "Истории для сцены и души",
      subtitle: "Оригинальные пьесы для любительского театра и волшебные сказки для детей.",
      exploreStage: "На сцену",
      enterMagic: "В сказку",
    },
    plays: {
      title: "Театральные пьесы",
      description: "Захватывающие сценарии для любительских театральных групп.",
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
      description: "Причудливые сказки, полные удивления и мягкой мудрости.",
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
      content: "Автор — писатель и драматург, живущий в Нидерландах с украинскими корнями. Она пишет для любительских театров и для детей.",
    },
    contact: {
      title: "Связаться со мной",
      description: "Интересует постановка одной из пьес или сказок? Напишите мне.",
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
      success: "Спасибо. Ваше сообщение отправлено Софье Богатовой.",
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
      ctaLabel: "Запросить полный сценарий",
      modalTitle: "Запрос полного сценария",
      requestingPlay: "Запрос сценария пьесы:",
      name: "Ваше имя",
      email: "Электронная почта",
      organization: "Организация / Театр",
      organizationPlaceholder: "напр. Городской театр",
      role: "Ваша роль / должность",
      rolePlaceholder: "напр. Художественный руководитель",
      city: "Город",
      cityPlaceholder: "напр. Москва",
      country: "Страна",
      countryPlaceholder: "напр. Россия",
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
      successDetail: "Софья Богатова свяжется с вами в ближайшее время.",
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
      about: "Over mij",
      contact: "Contact",
      backToHome: "Terug",
    },
    hero: {
      title: "Verhalen voor het Toneel en de Ziel",
      subtitle: "Originele toneelstukken voor amateurtoneel en magische sprookjes voor kinderen.",
      exploreStage: "Het toneel op",
      enterMagic: "De magie in",
    },
    plays: {
      title: "Toneelstukken",
      description: "Boeiende scripts voor amateurtoneelgroepen.",
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
      description: "Speelse verhalen vol wonder en zachte wijsheid.",
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
      title: "Over de Auteur",
      content: "De auteur is een schrijfster en toneelschrijfster gevestigd in Nederland met Oekraïense roots. Ze schrijft voor amateurtoneelgroepen en voor kinderen.",
    },
    contact: {
      title: "Neem Contact Op",
      description: "Geïnteresseerd in het opvoeren van een van de stukken, of de sprookjes voor uw kinderen? Neem contact op.",
      name: "Naam",
      email: "E-mail",
      message: "Bericht",
      send: "Verstuur Bericht",
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
      ctaLabel: "Volledig script aanvragen",
      modalTitle: "Volledig script aanvragen",
      requestingPlay: "Script aanvragen voor:",
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
