import { BrowserRouter as Router, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import useInterval from "./hooks/useInterval";

import LinearProgress from '@mui/material/LinearProgress';

import Header from "./view/components/Header";
import Alert from "./view/components/Alert";
import Footer from "./view/components/Footer";

import './static/css/reset.css';
import './static/css/vars.css';
import './static/css/basic.css';
import './static/css/slider.css';
import Approutes from "./routes";

import api from "./static/js/api";

const App = () => {
  const [user, setUser] = useState(null);
  
  const alertRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);
  const userNotificationsRef = useRef(null);

  // preload data
  const [radioInfo, setRadioInfo] = useState({});
  const [newsHighlight, setNewsHighlight] = useState(null);
  const [lastEvent, setLastEvent] = useState(null);
  const [currentAnnouncer, setCurrentAnnouncer] = useState({});
  const [badges, setBadges] = useState([]);
  const [loja, setLoja] = useState([]);
  const [allNews, setAllNews] = useState(null);
  const [allSpotlights, setAllSpotlights] = useState([]);
  const [allTimelines, setAllTimelines] = useState([]);
  const [allArts, setAllArts] = useState([]);
  const [artCategories, setArtCategories] = useState([]);
  const [values, setValues] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [carousel, setCarousel] = useState([]);

  const [currentTheme, setCurrentTheme] = useState({});
  const [radioIsReady, setRadioIsReady] = useState(false);

  const adjustDate = (toAdjust) => {
    let ad = toAdjust;
    let date = new Date(parseInt(ad.data)*1000);
    let day = date.getDate();
    day = day < 10 ? '0'+day : day;
    let month = date.getUTCMonth() + 1;
    month = month < 10 ? '0'+month : month;
    ad.dia = `${day}/${month}`;
  
    let hour = date.getHours();
    hour = hour < 10 ? '0'+hour : hour;
    let minutes = date.getMinutes();
    minutes = minutes < 10 ? '0'+minutes : minutes;
    ad.hora = `${hour}:${minutes}`;
  
    return ad;
  };

  // temas
  const themes = {
    purple: {
      'theme-color': '48, 51, 107',
      'theme-colorLight': '83, 86, 134',
      'theme-colorDark': '19, 13, 63',
      'theme-icon-color': '42, 42, 90',
      'theme-iconHover-color': '55, 55, 114',
      'theme-text-color': '58, 60, 102',
      'theme-text-secondaryColor': '89, 92, 137',
      'color-gray': '200, 200, 215',
      
      'color-gray-hex': "c8c8d7",
      'theme-color-hex': "30336b",
      'theme-colorDark-hex': "130d3f",
      'theme-colorLight-hex': "535686",
      'theme-icon-color-hex': "2a2a5a",
      'theme-iconHover-color-hex': "373772",
      'theme-text-color-hex': "3a3c66",
      'theme-text-secondaryColor-hex': "595c89"
    },
    pink: {
      'theme-color': '190, 46, 221',
      'theme-colorLight': '233, 130, 255',
      'theme-colorDark': '154, 39, 179',
      'theme-icon-color': '185, 46, 215',
      'theme-iconHover-color': '55, 55, 114',
      'theme-text-color': '202, 60, 233',
      'theme-text-secondaryColor': '221, 119, 243',
      'color-gray': '200, 200, 215',

      'theme-colorDark-hex': '9a27b3'
      
    },
    cyan: {
      'theme-color': '34, 166, 179',
      'theme-colorDark': '16, 82, 88',
      'theme-colorLight': '67, 200, 213',
      'theme-icon-color': '30, 121, 131',
      'theme-iconHover-color': '36, 141, 153',
      'theme-text-color': '28, 108, 116',
      'theme-text-secondaryColor': '86, 147, 153',

      'theme-colorDark-hex': '105258'
    }
  };

  /*const themes = {
    purple: {
      'color-gray': "#c8c8d7",
      'theme-color': "#30336b",
      'theme-colorDark': "#130d3f",
      'theme-colorLight': "#535686",
      'theme-icon-color': "#2a2a5a",
      'theme-iconHover-color': "#373772",
      'theme-text-color': "#3a3c66",
      'theme-text-secondaryColor': "#595c89"
    },
    pink: {
      'theme-color': '#be2edd',
      'theme-colorDark': '#9a27b3'
      
    },
    cyan: {
      'theme-color': "#22a6b3",
      'theme-colorDark': "#105258",
      'theme-colorLight': "#43c8d5",
      'theme-icon-color': "#1e7983",
      'theme-iconHover-color': "#248d99",
      'theme-text-color': "#1c6c74",
      'theme-text-secondaryColor': "#569399"
    }
  };*/

  /*const rgbToHex = (rgbString) => {
    let values = rgbString.replaceAll(',', '').split(' ');

    if (values.length !== 3) return;
    
    const componentToHex = (x) => {
      x = parseInt(x);
      var hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };

    return componentToHex(values[0]) + componentToHex(values[1]) + componentToHex(values[2]);
  };*/

  const changeTheme = (theme) => {
    let root = document.querySelector(':root');

    for (let key in themes[theme]){
      root.style.setProperty('--hxd-'+key, themes[theme][key]);
    }
    setCurrentTheme(themes[theme]);
    localStorage.setItem('hxd-colorTheme', theme);
  };

  const getCurrentTheme = key => {
    return currentTheme ? currentTheme[key] : '000';
  };

  const handleProgressShow = () => {
    progressRef.current.classList.remove('invisible');
  };

  const handleProgressHide = () => {
    progressRef.current.classList.add('invisible');
  };
  
  /**
   * @author Milton R. (Geefi)
   * @param {string} type Estilo do alerta. O estilo é definido usando classes do bootstrap, por exemplo: para .alert-success, basta especificar 'success'
   * @param {string} content Conteúdo do alerta
   * 
   * @description Mostra um alerta na tela
   * 
   * Como estamos no react deveriamos usar os states, porém foi visualizado um bug que resetava os inputs dos formulários (como o de autenticação,
   * por exemplo) quando o alerta sumia da tela, isto porque o componente era atualizado completamente. 
   * Para evitar esse inconveniente, foi optado por fazer um algorítimo mais 'vanilla', usando apenas o useRef do React.
   */
  const sendAlert = (type, content, listeners = { onunload: null }) => {
    containerRef.current.classList.remove('d-none');
    alertRef.current.classList.add('alert-'+type);
    alertRef.current.innerText = content;

    setTimeout(() => {
      alertRef.current.classList.add('opacity-0');

      setTimeout(() => {
        containerRef.current.classList.add('d-none');
        alertRef.current.classList.remove('alert-'+type, 'opacity-0');
        alertRef.current.innerText = '';

        listeners.onunload && listeners.onunload();
      }, 1000);

    }, 5000)
  };

  const Progress = ({ refe }) => {
    const location = useLocation();
    
    useEffect(() => {
      handleProgressShow();
    }, [location]);

    return (
      <div ref={refe} className="invisible" style={{
        backgroundColor: 'white',
        position: 'fixed',
        width: '100vw',
        top: 0,
        zIndex: 1061
      }}>
        <LinearProgress />
      </div>
    );
  };

  const checkAuthentication = useCallback(async () => {
    let res = await api.user('authenticate', {}, {credentials: 'include'});

    if (res.authenticated) {
      let avatar = api.getMedia(res.authenticated.avatar);
      res.authenticated.avatar = avatar;
    }
    
    setUser(res.authenticated);
  }, [setUser]);
  
  const pool = async () => {

    fetch('https://api4.truesecurity.com.br/?ip=stream2.svrdedicado.org&port=8180&simples=last&time=)')
        .then(res => res.json())
        .then(json => setRadioInfo(json));

    let lastEvent = await api.event('getlast');
    lastEvent = adjustDate(lastEvent);
    setLastEvent(lastEvent);

    let schedules = await api.radioHorarios('getsome', { limit: 3 });
    setSchedules(schedules);

    let currentAnnouncer = await api.radio('getannouncer', {}, { credentials: 'include' });
    setCurrentAnnouncer(currentAnnouncer);

    let values = await api.values('getall');
    values = values.map(item => {
      if (item.categoria_id !== "3")
        item.imagem = api.getMedia(item.imagem);
      return item;
    });
    setValues(values);

    let carouselImages = await api.indexCarousel('get');
    setCarousel(carouselImages);

    let news = await api.news('getall', {}, { credentials: 'include' });
    news = news.map(el => {
      el.imagem = api.getMedia(el.imagem);
      return el;
    });
    setAllNews(news);

    let spotlights = await api.user('gethighlight');
    setAllSpotlights(spotlights);

    let newsHighlight = await api.news('gethighlight');
    setNewsHighlight(adjustDate(newsHighlight));

    let timelines = await api.timeline('getall');
    setAllTimelines(timelines);

    let trendingTopics = await api.timeline('gettrending');
    setTrendingTopics(trendingTopics);

    let arts = await api.art('getall');
    arts = arts.map(el => {
      el.imagem = api.getMedia(el.imagem)
      return el;
    });
    setAllArts(arts);

    let badges = await api.badges('getall');
    setBadges(badges);

    let buyables = await api.buyable('getall');
    buyables = buyables.map(item => {
      item.imagem = api.getMedia(item.imagem);
      return item;
    });
    setLoja(buyables);

    let artCategories = await api.art('getallcategories');
    let ranking = await api.ranking('get');
    
    setArtCategories(artCategories);
    setRanking(ranking);
    
    setRadioIsReady(true);
    handleProgressHide();
  };

  useInterval(() => {
    (async () => {
      let date = new Date();
      if (date.getMinutes === 0) {
        let announcer = await api.radio('getannouncer');
        setCurrentAnnouncer(announcer);
      }
    })();
  }, 50000);

  useEffect(() => {
    changeTheme(localStorage.getItem('hxd-ColorTheme'));
    handleProgressShow();
    pool();
    checkAuthentication();
  }, []);
  
  return (
    <Router>
      <Progress refe={progressRef} />
      
      <Alert alertRef={alertRef} containerRef={containerRef} />
      
      <Header 
        user={user} setUser={setUser}
        sendAlert={sendAlert} 
        showProgress={handleProgressShow} 
        hideProgress={handleProgressHide} 
        artCategories={artCategories}
        values={values}
        userNotificationsRef={userNotificationsRef}
        schedules={schedules}
        lastEvent={lastEvent}
        currentAnnouncer={currentAnnouncer}
        setCurrentAnnouncer={setCurrentAnnouncer}
        carousel={carousel}
        radioInfo={radioInfo}

        allArts={allArts}
        setAllArts={setAllArts}

        changeTheme={changeTheme}
        getCurrentTheme={getCurrentTheme}
        currentTheme={currentTheme}
        radioIsReady={radioIsReady}
        setRadioIsReady={setRadioIsReady}
        newsHighlight={newsHighlight}
      />
        
      <Approutes 
        user={user} 
        setUser={setUser}
        sendAlert={sendAlert} 
        showProgress={handleProgressShow} 
        hideProgress={handleProgressHide} 
        badges={badges}
        loja={loja}
        
        allNews={allNews}
        allArts={allArts}
        allTimelines={allTimelines}
        allSpotlights={allSpotlights}
        artCategories={artCategories}
        trendingTopics={trendingTopics}
        ranking={ranking}

        setAllTimelines={setAllTimelines}
        setAllNews={setAllNews}

        values={values}
        getCurrentTheme={getCurrentTheme}
      />
      <Footer />
    </Router>
  );
};

export default App;