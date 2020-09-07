import React from 'react';
import popupStore from './stores/PopupStore';
import userStore from './stores/UserStore';

const storesContext = React.createContext({
  popupStore,
  userStore
})

export const useStores = () => React.useContext(storesContext)
