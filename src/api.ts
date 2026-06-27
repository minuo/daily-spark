import {
  QuoteData,
  PoemData,
  IdiomData,
  BookData,
  fallbackQuotes,
  fallbackPoems,
  fallbackIdioms,
  fallbackBooks,
  getRandomItem
} from './data/fallback';

const fetchWithTimeout = async (url: string, ms = 3000): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  const response = await fetch(url, { signal: controller.signal });
  clearTimeout(id);
  return response;
};

export const fetchQuote = async (): Promise<QuoteData> => {
  try {
    const res = await fetchWithTimeout('https://v1.hitokoto.cn');
    if (!res.ok) throw new Error('API return error');
    const data = await res.json();
    return {
      id: `q_${data.uuid || Date.now()}`,
      content: data.hitokoto,
      source: data.from,
      author: data.from_who || '佚名',
      type: 'quote',
    };
  } catch (err) {
    console.warn('Hitokoto API failed, using fallback.', err);
    return { ...getRandomItem(fallbackQuotes), id: `q_fb_${Date.now()}` };
  }
};

export const fetchPoem = async (): Promise<PoemData> => {
  try {
    const { default: localPoems } = await import('./data/poetry-300.json');
    const randomPoem = getRandomItem(localPoems);
    return {
      id: `p_local_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      title: randomPoem.title,
      author: randomPoem.author,
      dynasty: randomPoem.dynasty,
      content: randomPoem.content,
      type: 'poem'
    };
  } catch (err) {
    console.error('Curated offline poetry failed, using basic fallback.', err);
    return { ...getRandomItem(fallbackPoems), id: `p_fb_${Date.now()}` };
  }
};

export const fetchIdiom = async (): Promise<IdiomData> => {
  try {
    // Dynamically import the local curated idioms database (3000 idioms)
    // This allows lazy loading the ~900KB file without blocking the initial bundle load.
    const { default: idiomsData } = await import('./data/curated-idioms.json');
    const randomIdiom = getRandomItem(idiomsData);
    
    return {
      id: `i_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      word: randomIdiom.word,
      pinyin: randomIdiom.pinyin,
      explanation: randomIdiom.explanation,
      source: randomIdiom.derivation,
      type: 'idiom',
    };
  } catch (err) {
    console.warn('Failed to load curated idioms, using fallback.', err);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...getRandomItem(fallbackIdioms), id: `i_fb_${Date.now()}` });
      }, 300);
    });
  }
};

export const fetchBook = async (): Promise<BookData> => {
  try {
    const { default: doubanBooks } = await import('./data/douban-top250.json');
    const randomBook = getRandomItem(doubanBooks);
    return {
      id: `b_local_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      title: randomBook.title.replace(/《|》/g, ''),
      author: randomBook.author,
      description: (!randomBook.description || randomBook.description.trim() === '') 
        ? `一部关于${randomBook.title.replace(/《|》/g, '')}的精彩好书`.substring(0, 18)
        : randomBook.description,
      rating: randomBook.rating,
      coverEmoji: randomBook.coverEmoji,
      coverUrl: randomBook.coverLocalName ? `/covers/${randomBook.coverLocalName}` : randomBook.coverUrl,
      downloadUrl: '/books/mock-book.txt',
      type: 'book'
    };
  } catch (err) {
    console.error('Failed to load local curated Douban books, using fallback.', err);
    return { ...getRandomItem(fallbackBooks), id: `b_fb_${Date.now()}`, downloadUrl: '/books/mock-book.txt' };
  }
};
