export interface QuoteData {
  id: string;
  content: string;
  source: string;
  author?: string;
  type: 'quote';
}

export interface PoemData {
  id: string;
  content: string;
  title: string;
  author: string;
  dynasty?: string;
  type: 'poem';
}

export interface BookData {
  id: string;
  title: string;
  author: string;
  description: string;
  rating?: number;
  coverEmoji: string;
  coverUrl?: string;
  coverLocalName?: string;
  downloadUrl?: string;
  type: 'book';
}

export interface IdiomData {
  id: string;
  word: string;
  pinyin: string;
  explanation: string;
  source?: string;
  type: 'idiom';
}

// Fallback Data
export const fallbackQuotes: QuoteData[] = [
  { id: 'q1', content: '在群星当中，有一颗星是指导着我的生命通过不可知的黑暗的。', source: '飞鸟集', author: '泰戈尔', type: 'quote' },
  { id: 'q2', content: '我们最宽阔的领地，是我们在其中的感受。', source: '悉达多', author: '赫尔曼·黑塞', type: 'quote' },
  { id: 'q3', content: '预测未来的最好方法就是去创造它。', source: '名言', author: '彼得·德鲁克', type: 'quote' },
  { id: 'q4', content: '所谓无底深渊，下去，也是前程万里。', source: '素履之往', author: '木心', type: 'quote' },
  { id: 'q5', content: '你现在的气质里，藏着你走过的路，读过的书和爱过的人。', source: '卡萨布兰卡', type: 'quote' }
];

export const fallbackPoems: PoemData[] = [
  { id: 'p1', content: '众鸟高飞尽，孤云独去闲。\n相看两不厌，只有敬亭山。', title: '独坐敬亭山', author: '李白', dynasty: '唐代', type: 'poem' },
  { id: 'p2', content: '细雨鱼儿出，微风燕子斜。\n城中十万户，此地两三家。', title: '水槛遣心二首', author: '杜甫', dynasty: '唐代', type: 'poem' },
  { id: 'p3', content: '空山不见人，但闻人语响。\n返景入深林，复照青苔上。', title: '鹿柴', author: '王维', dynasty: '唐代', type: 'poem' },
  { id: 'p4', content: '千山鸟飞绝，万径人踪灭。\n孤舟蓑笠翁，独钓寒江雪。', title: '江雪', author: '柳宗元', dynasty: '唐代', type: 'poem' }
];

export const fallbackBooks: BookData[] = [
  { id: 'b1', title: '《红楼梦》', author: '曹雪芹', description: '中国古典小说的巅峰之作，大厦倾覆前的一部绝美哀歌，关于青春、家族与人生的哲思。', coverEmoji: '🌸', coverUrl: '/covers/s1070959.jpg', type: 'book' },
  { id: 'b2', title: '《活着》', author: '余华', description: '讲述地主的儿子福贵在极端苦难的命运中，如何凭借生命最原始的本能坚韧而平静地生存的故事。', coverEmoji: '🌾', coverUrl: '/covers/s29869926.jpg', type: 'book' },
  { id: 'b3', title: '《三体》', author: '刘慈欣', description: '中国科幻的史诗级丰碑，将人类对真理的求索、人性的幽暗与文明的浩瀚推向了宇宙尺度的宏大叙事。', coverEmoji: '🌌', coverUrl: '/covers/s28357056.jpg', type: 'book' },
  { id: 'b4', title: '《百年孤独》', author: '加西亚·马尔克斯', description: '魔幻现实主义的巅峰神作，描绘布恩迪亚家族七代人的离奇命运，谱写一曲永恒而深邃的人类孤独史诗。', coverEmoji: '🦋', coverUrl: '/covers/s27237850.jpg', type: 'book' },
  { id: 'b5', title: '《小王子》', author: '安托万·德·圣-埃克苏佩里', description: '写给每一个曾经是孩子的大人的温情童话，跟随金发小男孩，探寻生命中关于爱、责任与陪伴的真谛。', coverEmoji: '🌹', coverUrl: '/covers/s1106951.jpg', type: 'book' },
  { id: 'b6', title: '《月亮与六便士》', author: '毛姆', description: '关于灵魂的自我确证与狂热追求的终极抉择：满地都是庸俗的六便士，而他却一意孤行，抬头看见了月亮。', coverEmoji: '🌙', coverUrl: '/covers/s1237549.jpg', type: 'book' },
  { id: 'b7', title: '《卡拉马佐夫兄弟》', author: '费奥多尔·陀思妥耶夫斯基', description: '人类心灵纵深探索的不朽神作，交织着关于上帝、自由意志、罪孽与无条件之爱的终极精神审判。', coverEmoji: '⚖️', coverUrl: '/covers/s29032782.jpg', type: 'book' },
  { id: 'b8', title: '《平凡的世界》', author: '路遥', description: '一幅波澜壮阔的西北城乡生活画卷，讲述平凡人在时代的惊涛骇浪中，如何自强不息求索创业与奋进。', coverEmoji: '⛰️', coverUrl: '/covers/s33774031.jpg', type: 'book' },
  { id: 'b9', title: '《局外人》', author: '阿尔贝·加缪', description: '存在主义文学力作。用最冷静克制的白描，戳破文明审判的社会荒诞规则，呈现对生命真实性的绝对捍卫。', coverEmoji: '🏜️', coverUrl: '/covers/s34151389.jpg', type: 'book' },
  { id: 'b10', title: '《追风筝的人》', author: '卡勒德·胡赛尼', description: '一段关于背叛与漫漫自我救赎的友情往事，在风筝飞舞的喀布尔天空下，“为你，千千万万遍”。', coverEmoji: '🪁', coverUrl: '/covers/s2177629.jpg', type: 'book' },
  { id: 'b11', title: '《面纱》', author: '毛姆', description: '在背叛与惩罚的前行中，一个曾经放浪虚荣的灵魂，深入瘟疫之乡霍乱地带，在爱与怜悯中寻得灵魂的和解。', coverEmoji: '🎭', coverUrl: '/covers/s28688273.jpg', type: 'book' },
  { id: 'b12', title: '《围城》', author: '钱锺书', description: '“城外的人想冲进去，城里的人想逃出来。”用充满睿智与精妙讽喻的哲理性笔调，描绘一幅婚姻与人生的百态图。', coverEmoji: '🏰', coverUrl: '/covers/s1146040.jpg', type: 'book' },
  { id: 'b13', title: '《解忧杂货店》', author: '东野圭吾', description: '温暖至极的奇迹之作。一家连通时空的杂货店，倾听世间凡人的挣扎与抉择，用善意编织最精巧感人的生命连接。', coverEmoji: '✉️', coverUrl: '/covers/s29109031.jpg', type: 'book' },
  { id: 'b14', title: '《白夜行》', author: '东野圭吾', description: '暗夜中残缺灵魂的畸形守护。只希望能手牵手在阳光下散步，在无边无际的长夜中，彼此是唯一的炽烈光芒。', coverEmoji: '🌕', coverUrl: '/covers/s30025945.jpg', type: 'book' },
  { id: 'b15', title: '《悉达多》', author: '赫尔曼·黑塞', description: '探寻自我与宇宙无上真理心灵漂流史。走出经书的藩篱，在尘世河流的沉浮轰鸣声中，收获个体的全然觉醒。', coverEmoji: '🧘', coverUrl: '/covers/s2170315.jpg', type: 'book' }
];

export const fallbackIdioms: IdiomData[] = [
  { id: 'i1', word: '大智若愚', pinyin: 'dà zhì ruò yú', explanation: '某些才智出众的人不露锋芒，看来好像愚笨。', source: '《老子》', type: 'idiom' },
  { id: 'i2', word: '海纳百川', pinyin: 'hǎi nà bǎi chuān', explanation: '大海纵容无数条河流。比喻包容的东西广泛，数量广大。', source: '《管子·形势解》', type: 'idiom' },
  { id: 'i3', word: '厚德载物', pinyin: 'hòu dé zài wù', explanation: '指重视品德像大地一样能容养万物。', source: '《易·坤》', type: 'idiom' },
  { id: 'i4', word: '宁静致远', pinyin: 'níng jìng zhì yuǎn', explanation: '平稳静谧心态，不为杂念所左右，静思反省，才能树立远大的目标。', source: '《淮南子·主术训》', type: 'idiom' }
];

export const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};
