import { useState, useEffect, useRef } from 'react';
import { Appearance, AsyncStorage } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import theme from './Theme';

const THEME_KEY = '@MyApp:theme';

const useTheme = () => {
    let dispatch = useDispatch()
    let t = useSelector(state=>state.auth)?.theme
  
  const [currentTheme, setCurrentTheme] = useState(theme.light);
  const forceUpdateRef = useRef(false);
  const toggleTheme = async () => {
    const newTheme = currentTheme === theme.light ? theme.dark : theme.light;
   
    setCurrentTheme(newTheme);
    // await AsyncStorage.setItem(THEME_KEY, JSON.stringify(newTheme));
 
   
  };

  useEffect(() => {
    const loadTheme = async () => {
  
      if (t) {
        setCurrentTheme(t);
      } else {
        setCurrentTheme(Appearance.getColorScheme() === 'dark' ? theme.dark : theme.light);
      }
    };

    loadTheme();
  }, [t]);
 
  return [currentTheme, toggleTheme];
};

export default useTheme;