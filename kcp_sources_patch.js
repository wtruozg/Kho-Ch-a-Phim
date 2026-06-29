/* Kho Chứa Phim - nguồn lấy từ APK, chỉ phần API/ảnh/lịch chiếu an toàn.
   Dán file này trước </body> hoặc import sau code chính. */
(function(){
  const KCP_SOURCES = {
    apiBase: 'https://phimapi.com',
    imgCdn: 'https://phimimg.com',
    fallbackApiBases: ['https://phimapi.com','https://ophim1.com'],
    legacyImgCdn: 'https://img.ophim.live/uploads/movies',
    scheduleApi: 'https://rophimm.net/baseapi/api/v1/showtimes/by-date',
    tmdbApi: 'https://api.themoviedb.org/3',
    tmdbImg: 'https://image.tmdb.org/t/p/w500',
    avatarApi: 'https://api.dicebear.com/7.x'
  };
  window.KCP_SOURCES = Object.freeze(KCP_SOURCES);

  function joinUrl(base, path){
    if(/^https?:\/\//i.test(path)) return path;
    return base.replace(/\/$/,'') + '/' + String(path||'').replace(/^\//,'');
  }

  async function fetchJsonWithFallback(path, options){
    let lastErr;
    for(const base of KCP_SOURCES.fallbackApiBases){
      try{
        const res = await fetch(joinUrl(base, path), options || {});
        if(!res.ok) throw new Error('HTTP ' + res.status + ' ' + res.statusText);
        return await res.json();
      }catch(err){ lastErr = err; }
    }
    throw lastErr || new Error('Không tải được nguồn phim');
  }

  window.kcpApi = fetchJsonWithFallback;

  // Nếu web cũ có hàm api(path) thì bọc lại để tự fallback nguồn.
  if(typeof window.api === 'function' && !window.api.__kcpApkFallback){
    const oldApi = window.api;
    const wrapped = async function(path, options){
      try{ return await oldApi(path, options); }
      catch(e){ return await fetchJsonWithFallback(path, options); }
    };
    wrapped.__kcpApkFallback = true;
    window.api = wrapped;
  }

  window.kcpSourcePaths = {
    home: '/v1/api/home',
    newMovies: page => `/v1/api/danh-sach/phim-moi-cap-nhat?page=${page||1}`,
    hot: page => `/v1/api/danh-sach/phim-hot?page=${page||1}`,
    series: page => `/v1/api/danh-sach/phim-bo?page=${page||1}`,
    single: page => `/v1/api/danh-sach/phim-le?page=${page||1}`,
    animation: page => `/v1/api/danh-sach/hoat-hinh?page=${page||1}`,
    country: (slug,page) => `/v1/api/quoc-gia/${slug}?page=${page||1}`,
    year: (year,page) => `/v1/api/nam-phat-hanh/${year}?page=${page||1}`,
    search: keyword => `/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword||'')}`
  };
})();
