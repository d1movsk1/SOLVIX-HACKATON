export const MOCK_AUCTIONS = [
  {
    id: '1',
    title: 'Бабина шарена торба',
    description: 'Рачно плетена волнена торба, изработена во Галичник околу 1960 година. Единствен примерок со традиционален македонски мотив — пауново перо и гранки. Носена само на свадби во семејството.',
    seller: 'Мартина К.',
    sellerWallet: '7xKp...3mQz',
    image: 'https://picsum.photos/seed/torba/800/600',
    currentBid: 45, startingBid: 20, currency: 'USDC',
    endsAt: Date.now() + 1000 * 60 * 60 * 23,
    bids: 7, categories: ['Текстил'], location: 'Скопје', nftMinted: false,
  },
  {
    id: '2',
    title: 'Стара дедова тутунска кутија',
    description: 'Месингана кутија за тутун со врежан монограм "Г.Б." и датум 1938. Пронајдена на тавански простор во Охрид. Непосредна врска со македонскиот тутунски занает.',
    seller: 'Горан Б.',
    sellerWallet: '9mRt...7pLw',
    image: 'https://picsum.photos/seed/kutija/800/600',
    currentBid: 120, startingBid: 50, currency: 'USDC',
    endsAt: Date.now() + 1000 * 60 * 60 * 47,
    bids: 12, categories: ['Антиквитети'], location: 'Охрид', nftMinted: false,
  },
  {
    id: '3',
    title: 'Рачно везена покривка',
    description: 'Бела памучна покривка со цветни мотиви, рачно везена од мојата баба Стојна во 1972. Никогаш не е ставана во употреба — чувана во сандак со лаванда.',
    seller: 'Елена М.',
    sellerWallet: '3nPw...1kXv',
    image: 'https://picsum.photos/seed/pokrivka/800/600',
    currentBid: 30, startingBid: 15, currency: 'USDC',
    endsAt: Date.now() + 1000 * 60 * 60 * 5,
    bids: 3, categories: ['Текстил', 'Антиквитети'], location: 'Битола', nftMinted: false,
  },
  {
    id: '4',
    title: 'Дрвена резбана лула',
    description: 'Рачно резбана лула од крушово дрво. Занает кој речиси исчезна — еден од последните мајстори во Крушево ја изработил во 1985 година. Потпис на дното.',
    seller: 'Никола Р.',
    sellerWallet: '2qWs...9hJk',
    image: 'https://picsum.photos/seed/lula/800/600',
    currentBid: 85, startingBid: 40, currency: 'USDC',
    endsAt: Date.now() + 1000 * 60 * 60 * 71,
    bids: 9, categories: ['Занаети'], location: 'Крушево', nftMinted: false,
  },
  {
    id: '5',
    title: 'Фотографија — Скопски базар 1955',
    description: 'Оригинална фотографија на Скопскиот базар снимена во 1955. Желатинско-сребрен процес. Видливи се дуќани кои повеќе не постојат. Единствен примерок.',
    seller: 'Сашо Д.',
    sellerWallet: '6tYu...4gBn',
    image: 'https://picsum.photos/seed/bazar/800/600',
    currentBid: 200, startingBid: 100, currency: 'USDC',
    endsAt: Date.now() + 1000 * 60 * 60 * 12,
    bids: 18, categories: ['Фотографија'], location: 'Скопје', nftMinted: false,
  },
  {
    id: '6',
    title: 'Македонска народна носија',
    description: 'Комплетна женска народна носија од Тетовско. Рачно изработена со автентични везови и традиционални украси. Датира од почетокот на 20 век.',
    seller: 'Весна Т.',
    sellerWallet: '8yHj...2mCp',
    image: 'https://picsum.photos/seed/nosija/800/600',
    currentBid: 340, startingBid: 200, currency: 'USDC',
    endsAt: Date.now() + 1000 * 60 * 60 * 36,
    bids: 22, categories: ['Народна носија', 'Текстил'], location: 'Тетово', nftMinted: false,
  },
]

export const ALL_CATEGORIES = ['Монети','Текстил','Дрвени призводи', 'Антиквитети', 'Занаетчиски производи', 'Метални производи', 'Народна носија', 'Друго']

export const SORT_OPTIONS = [
  { value: 'ending',   label: 'Завршуваат наскоро' },
  { value: 'bid_high', label: 'Највисока понуда'    },
  { value: 'bid_low',  label: 'Најниска понуда'     },
  { value: 'bids',     label: 'Најмногу понуди'     },
  { value: 'newest',   label: 'Најнови'             },
]

export const LOCATIONS = ['Скопје','Охрид','Битола','Крушево','Тетово','Прилеп','Струга','Штип','Велес','Куманово','Друго']
export const CATEGORIES = ALL_CATEGORIES
