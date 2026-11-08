import type { Account, ColorId, Kind, L10n, Product, ProductType, Room } from '../types';

export const COLOR_HEX: Record<ColorId, string> = {
  indigo: '#23407A',
  sage: '#8FA48A',
  oat: '#D9CBB2',
  saffron: '#E3A53B',
  charcoal: '#3A3F45',
  white: '#FFFFFF',
};

export const TYPE_ROOM_KIND: Record<ProductType, Kind> = {
  sofas: 'sofa', armchairs: 'sofa', 'coffee-tables': 'table', 'side-tables': 'table', 'dining-tables': 'table',
  rugs: 'rug', lighting: 'lamp', decor: 'vase', shelving: 'shelf',
};

const TYPE_DESC: Record<ProductType, L10n> = {
  sofas: {
    en: 'Deep seat, low arms and a solid beech frame. The linen-blend cover zips off for washing.',
    fa: 'نشیمن عمیق، دسته‌های کوتاه و اسکلت چوب راش. رویه کتان قابل شست‌وشو است.',
  },
  armchairs: {
    en: 'A compact chair with a supportive back, made to sit beside a window or a shelf of books.',
    fa: 'صندلی جمع‌وجور با پشتی محکم، مناسب کنار پنجره یا قفسه‌ی کتاب.',
  },
  'coffee-tables': {
    en: 'A low table in solid ash with a wide top for trays, books and the occasional cup of tea.',
    fa: 'میز کوتاه از چوب زبان‌گنجشک با سطح پهن برای سینی، کتاب و فنجان چای.',
  },
  'side-tables': {
    en: 'A small table that fits beside a sofa or a bed, with room for a lamp and a glass of water.',
    fa: 'میز کوچکی که کنار مبل یا تخت جا می‌شود و برای آباژور و لیوان آب جا دارد.',
  },
  'dining-tables': {
    en: 'A sturdy table with rounded edges that seats six comfortably and wipes clean.',
    fa: 'میز محکم با لبه‌های گرد که شش نفر را راحت جا می‌دهد و تمیز کردنش آسان است.',
  },
  rugs: {
    en: 'Hand-knotted wool with a low pile, a pattern woven in two tones and a non-slip backing.',
    fa: 'پشم گره‌خورده با پرز کوتاه، نقش دورنگ و زیرِ ضدلغزش.',
  },
  lighting: {
    en: 'A warm, soft light with a fabric shade and a switch on the cable. Bulb not included.',
    fa: 'نور گرم و ملایم با آباژور پارچه‌ای و کلید روی سیم. لامپ همراه کالا نیست.',
  },
  decor: {
    en: 'Glazed ceramic made in small batches. Each piece differs slightly in colour and shape.',
    fa: 'سرامیک لعاب‌دار که در تعداد کم ساخته می‌شود. هر قطعه کمی در رنگ و فرم متفاوت است.',
  },
  shelving: {
    en: 'Open shelves in oak veneer with a steel frame. Wall fixings included.',
    fa: 'قفسه‌ی باز با روکش بلوط و اسکلت فلزی. پیچ و رولپلاک دیواری همراه کالاست.',
  },
};

export const TYPE_SPECS: Record<ProductType, { k: L10n; v: L10n }[]> = {
  sofas: [
    { k: { en: 'Frame', fa: 'اسکلت' }, v: { en: 'Solid beech', fa: 'چوب راش' } },
    { k: { en: 'Cover', fa: 'رویه' }, v: { en: 'Linen blend, removable', fa: 'کتان، قابل جدا شدن' } },
    { k: { en: 'Filling', fa: 'پرکن' }, v: { en: 'Foam and feather', fa: 'اسفنج و پَر' } },
  ],
  armchairs: [
    { k: { en: 'Frame', fa: 'اسکلت' }, v: { en: 'Solid beech', fa: 'چوب راش' } },
    { k: { en: 'Cover', fa: 'رویه' }, v: { en: 'Linen blend, removable', fa: 'کتان، قابل جدا شدن' } },
    { k: { en: 'Filling', fa: 'پرکن' }, v: { en: 'Foam', fa: 'اسفنج' } },
  ],
  'coffee-tables': [{ k: { en: 'Top', fa: 'صفحه' }, v: { en: 'Solid ash', fa: 'چوب زبان‌گنجشک' } }, { k: { en: 'Finish', fa: 'پوشش' }, v: { en: 'Matt oil', fa: 'روغن مات' } }],
  'side-tables': [{ k: { en: 'Top', fa: 'صفحه' }, v: { en: 'Solid ash', fa: 'چوب زبان‌گنجشک' } }, { k: { en: 'Finish', fa: 'پوشش' }, v: { en: 'Matt oil', fa: 'روغن مات' } }],
  'dining-tables': [{ k: { en: 'Top', fa: 'صفحه' }, v: { en: 'Solid oak', fa: 'چوب بلوط' } }, { k: { en: 'Seats', fa: 'ظرفیت' }, v: { en: 'Six', fa: 'شش نفر' } }],
  rugs: [{ k: { en: 'Material', fa: 'جنس' }, v: { en: 'Wool, hand knotted', fa: 'پشم، دست‌باف' } }, { k: { en: 'Pile', fa: 'پرز' }, v: { en: 'Low', fa: 'کوتاه' } }],
  lighting: [{ k: { en: 'Shade', fa: 'آباژور' }, v: { en: 'Cotton fabric', fa: 'پارچه نخی' } }, { k: { en: 'Bulb', fa: 'لامپ' }, v: { en: 'E27, not included', fa: 'سرپیچ E27، همراه کالا نیست' } }],
  decor: [{ k: { en: 'Material', fa: 'جنس' }, v: { en: 'Glazed ceramic', fa: 'سرامیک لعاب‌دار' } }, { k: { en: 'Care', fa: 'نگهداری' }, v: { en: 'Wipe with a damp cloth', fa: 'با پارچه‌ی نمناک پاک شود' } }],
  shelving: [{ k: { en: 'Shelves', fa: 'طبقه' }, v: { en: 'Oak veneer', fa: 'روکش بلوط' } }, { k: { en: 'Frame', fa: 'اسکلت' }, v: { en: 'Powder-coated steel', fa: 'فولاد رنگ‌شده' } }],
};

// [id, en, fa, type, room, price, colors, stock, isNew, bg, accent]
type Row = [string, string, string, ProductType, Room, number, ColorId[], number, boolean, string, string];
const GLAZE = '#C9D3E8', SAND = '#F1D9A6', MINT = '#DCE8DA', CLAY = '#E4D3C6';
const ROWS: Row[] = [
  ['alma-sofa', 'Alma 3-seat sofa', 'مبل سه‌نفره آلما', 'sofas', 'living', 38_900_000, ['indigo', 'sage', 'oat'], 6, true, GLAZE, '#E3A53B'],
  ['rayan-sofa', 'Rayan 2-seat sofa', 'مبل دونفره رایان', 'sofas', 'living', 27_600_000, ['sage', 'oat'], 0, false, MINT, SAND],
  ['tala-sofa', 'Tala 3-seat sofa', 'مبل سه‌نفره طلا', 'sofas', 'living', 33_200_000, ['charcoal', 'oat'], 4, false, CLAY, '#E3A53B'],
  ['nila-armchair', 'Nila armchair', 'مبل تک‌نفره نیلا', 'armchairs', 'living', 14_500_000, ['indigo', 'saffron', 'oat'], 9, false, SAND, '#EEF1F0'],
  ['sahar-chair', 'Sahar reading chair', 'صندلی مطالعه سحر', 'armchairs', 'living', 11_900_000, ['sage', 'charcoal'], 5, false, MINT, '#E3A53B'],
  ['omid-chair', 'Omid lounge chair', 'مبل راحتی امید', 'armchairs', 'living', 16_800_000, ['indigo', 'oat'], 3, true, GLAZE, SAND],
  ['dena-table', 'Dena coffee table', 'میز جلومبلی دنا', 'coffee-tables', 'living', 9_800_000, ['sage', 'oat'], 7, true, MINT, '#E3A53B'],
  ['pari-table', 'Pari round coffee table', 'میز جلومبلی گرد پری', 'coffee-tables', 'living', 8_200_000, ['charcoal', 'white'], 8, false, CLAY, SAND],
  ['hana-table', 'Hana side table', 'میز عسلی هانا', 'side-tables', 'living', 2_900_000, ['indigo', 'saffron'], 12, false, GLAZE, '#E3A53B'],
  ['kian-table', 'Kian bedside table', 'پاتختی کیان', 'side-tables', 'bedroom', 3_400_000, ['oat', 'charcoal'], 10, false, SAND, '#EEF1F0'],
  ['arman-dining', 'Arman dining table', 'میز ناهارخوری آرمان', 'dining-tables', 'dining', 21_500_000, ['oat', 'charcoal'], 3, false, CLAY, '#E3A53B'],
  ['ziba-dining', 'Ziba extendable dining table', 'میز ناهارخوری بازشو زیبا', 'dining-tables', 'dining', 29_900_000, ['oat', 'sage'], 2, true, MINT, SAND],
  ['bam-rug', 'Bam wool rug', 'فرش پشمی بام', 'rugs', 'living', 12_400_000, ['indigo', 'oat', 'saffron'], 8, false, CLAY, SAND],
  ['roya-rug', 'Roya runner rug', 'کناره‌فرش رویا', 'rugs', 'bedroom', 6_800_000, ['indigo', 'sage'], 11, false, GLAZE, SAND],
  ['sina-rug', 'Sina round rug', 'فرش گرد سینا', 'rugs', 'dining', 9_100_000, ['saffron', 'charcoal'], 6, false, SAND, GLAZE],
  ['tir-lamp', 'Tir floor lamp', 'آباژور ایستاده تیر', 'lighting', 'lighting', 2_350_000, ['indigo', 'charcoal', 'oat'], 14, false, SAND, '#EEF1F0'],
  ['sepid-lamp', 'Sepid table lamp', 'آباژور رومیزی سپید', 'lighting', 'lighting', 1_450_000, ['sage', 'white'], 20, false, MINT, SAND],
  ['mahtab-lamp', 'Mahtab pendant light', 'لوستر آویز مهتاب', 'lighting', 'lighting', 3_100_000, ['saffron', 'charcoal'], 5, true, GLAZE, '#E3A53B'],
  ['shams-lamp', 'Shams bedside lamp', 'آباژور کنار تخت شمس', 'lighting', 'bedroom', 1_100_000, ['oat', 'indigo'], 16, false, CLAY, SAND],
  ['kaveh-vase', 'Kaveh vase', 'گلدان کاوه', 'decor', 'decor', 890_000, ['saffron', 'indigo', 'oat'], 25, false, CLAY, '#E3A53B'],
  ['laleh-vases', 'Laleh vase set', 'ست گلدان لاله', 'decor', 'decor', 1_200_000, ['sage', 'white'], 15, false, MINT, SAND],
  ['neda-bowl', 'Neda ceramic bowl', 'کاسه سرامیکی ندا', 'decor', 'dining', 640_000, ['indigo', 'oat'], 30, false, GLAZE, '#E3A53B'],
  ['parsa-shelf', 'Parsa bookshelf', 'کتابخانه پارسا', 'shelving', 'living', 14_000_000, ['oat', 'charcoal'], 4, false, SAND, GLAZE],
  ['behin-shelf', 'Behin wall shelf', 'طاقچه دیواری بهین', 'shelving', 'bedroom', 2_200_000, ['oat', 'sage'], 18, false, MINT, '#E3A53B'],
];

export const PRODUCTS: Product[] = ROWS.map(([id, en, fa, type, room, price, colors, stock, isNew, bg, accent], i) => ({
  id,
  name: { en, fa },
  room,
  type,
  kind: TYPE_ROOM_KIND[type],
  price,
  colors,
  stock,
  isNew,
  createdAt: ROWS.length - i,
  description: TYPE_DESC[type],
  bg,
  accent,
}));

export const ACCOUNT: Account = { name: 'Sara Karimi', email: 'sara@example.com', phone: '09121234567' };
