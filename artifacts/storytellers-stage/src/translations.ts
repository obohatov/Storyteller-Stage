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
      description: "Engaging scripts designed for amateur theatre groups, focusing on human connection and community. Placeholder content — final titles and descriptions will be added later.",
      items: [
        {
          slug: 'the-echo-of-silence',
          title: "The Echo of Silence",
          genre: "Drama",
          summary: "A story about a small village rediscovering its lost history.",
          fullDescription: "Full description placeholder. This play explores themes of memory, identity, and community as residents of a quiet village uncover a forgotten chapter of their shared past.",
        },
        {
          slug: 'midsummer-mischief',
          title: "Midsummer Mischief",
          genre: "Comedy",
          summary: "A lighthearted romp through a chaotic wedding preparation.",
          fullDescription: "Full description placeholder. A comedy of errors unfolds as well-meaning relatives, lost invitations, and unexpected guests conspire to make one wedding unforgettable.",
        },
      ],
    },
    fairyTales: {
      title: "Fairy Tales",
      description: "Whimsical stories written for children, full of wonder and gentle wisdom. Placeholder content — final titles and descriptions will be added later.",
      items: [
        {
          slug: 'the-star-that-fell-in-the-well',
          title: "The Star that Fell in the Well",
          summary: "A tiny star gets lost and finds friendship in the deep blue water.",
          fullDescription: "Full description placeholder. Deep in a meadow stands an old stone well. One autumn night, a small star tumbles from the sky and discovers that the truest friendships are found in the most unexpected places.",
        },
        {
          slug: 'the-dragon-who-loved-tea',
          title: "The Dragon Who Loved Tea",
          summary: "A gentle dragon prefers Earl Grey over breathing fire.",
          fullDescription: "Full description placeholder. Unlike his fearsome cousins, this small green dragon has never breathed a single flame — he'd much rather curl up with a warm pot of Earl Grey and a good biscuit.",
        },
      ],
    },
    about: {
      title: "About the Author",
      content: "Placeholder biography. The author is a writer and playwright based in the Netherlands, with roots in Ukraine. She writes for amateur theatre groups and for children, believing that stories are the quietest way to cross any distance between people.",
    },
    contact: {
      title: "Get in Touch",
      description: "Interested in staging one of the plays, or in the fairy tales for your children? Please reach out.",
      name: "Name",
      email: "Email",
      message: "Message",
      send: "Send Message",
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
      description: "Захоплюючі сценарії для аматорських театральних груп. Тимчасовий зміст — остаточні назви та описи буде додано пізніше.",
      items: [
        {
          slug: 'the-echo-of-silence',
          title: "Відлуння тиші",
          genre: "Драма",
          summary: "Історія про маленьке село, що заново відкриває свою втрачену історію.",
          fullDescription: "Повний опис — тимчасовий текст. П'єса досліджує теми пам'яті, ідентичності та спільноти.",
        },
        {
          slug: 'midsummer-mischief',
          title: "Бешкет у літню ніч",
          genre: "Комедія",
          summary: "Весела пригода під час хаотичної підготовки до весілля.",
          fullDescription: "Повний опис — тимчасовий текст. Комедія помилок розгортається, поки добронаміреня родичі та несподівані гості роблять одне весілля незабутнім.",
        },
      ],
    },
    fairyTales: {
      title: "Казки",
      description: "Примхливі казки, повні дива та лагідної мудрості. Тимчасовий зміст — остаточні назви та описи буде додано пізніше.",
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
      content: "Тимчасова біографія. Авторка — письменниця та драматург, яка живе в Нідерландах та має коріння в Україні. Вона пише для аматорських театрів та для дітей.",
    },
    contact: {
      title: "Зв'яжіться зі мною",
      description: "Зацікавлені у постановці однієї з п'єс або казок? Напишіть мені.",
      name: "Ім'я",
      email: "Електронна пошта",
      message: "Повідомлення",
      send: "Надіслати",
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
      description: "Захватывающие сценарии для любительских театральных групп. Временный контент — финальные названия и описания будут добавлены позже.",
      items: [
        {
          slug: 'the-echo-of-silence',
          title: "Эхо тишины",
          genre: "Драма",
          summary: "История о маленькой деревне, заново открывающей свою забытую историю.",
          fullDescription: "Полное описание — временный текст. Пьеса исследует темы памяти, идентичности и сообщества.",
        },
        {
          slug: 'midsummer-mischief',
          title: "Проказы в летнюю ночь",
          genre: "Комедия",
          summary: "Лёгкая комедия о хаотичной подготовке к свадьбе.",
          fullDescription: "Полное описание — временный текст. Комедия ошибок разворачивается, пока благонамеренные родственники и неожиданные гости делают одну свадьбу незабываемой.",
        },
      ],
    },
    fairyTales: {
      title: "Сказки",
      description: "Причудливые сказки, полные удивления и мягрой мудрости. Временный контент — финальные названия и описания будут добавлены позже.",
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
      content: "Временная биография. Автор — писатель и драматург, живущий в Нидерландах с украинскими корнями. Она пишет для любительских театров и для детей.",
    },
    contact: {
      title: "Связаться со мной",
      description: "Интересует постановка одной из пьес или сказок? Напишите мне.",
      name: "Имя",
      email: "Электронная почта",
      message: "Сообщение",
      send: "Отправить",
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
      description: "Boeiende scripts voor amateurtoneelgroepen. Tijdelijke inhoud — definitieve titels en beschrijvingen worden later toegevoegd.",
      items: [
        {
          slug: 'the-echo-of-silence',
          title: "De Echo van Stilte",
          genre: "Drama",
          summary: "Een verhaal over een klein dorp dat zijn verloren geschiedenis herontdekt.",
          fullDescription: "Volledige beschrijving — tijdelijke tekst. Dit stuk verkent thema's van geheugen, identiteit en gemeenschap.",
        },
        {
          slug: 'midsummer-mischief',
          title: "Midzomermishief",
          genre: "Komedie",
          summary: "Een vrolijke tocht door een chaotische huwelijksvoorbereiding.",
          fullDescription: "Volledige beschrijving — tijdelijke tekst. Een komedie der vergissingen ontvouwt zich terwijl welmenende familieleden en onverwachte gasten één bruiloft onvergetelijk maken.",
        },
      ],
    },
    fairyTales: {
      title: "Sprookjes",
      description: "Speelse verhalen vol wonder en zachte wijsheid. Tijdelijke inhoud — definitieve titels en beschrijvingen worden later toegevoegd.",
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
      content: "Tijdelijke biografie. De auteur is een schrijfster en toneelschrijfster gevestigd in Nederland met Oekraïense roots. Ze schrijft voor amateurtoneelgroepen en voor kinderen.",
    },
    contact: {
      title: "Neem Contact Op",
      description: "Geïnteresseerd in het opvoeren van een van de stukken, of de sprookjes voor uw kinderen? Neem contact op.",
      name: "Naam",
      email: "E-mail",
      message: "Bericht",
      send: "Verstuur Bericht",
    },
  },
};
