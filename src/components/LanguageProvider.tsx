"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Language =
  | "ru"
  | "en"
  | "de"
  | "fr"
  | "es"
  | "pl";

type TranslationKey =
  | "catalog"
  | "messages"
  | "favorites"
  | "myDeals"
  | "login"
  | "myProfile"
  | "language"
  | "frameAndColor"
  | "logout"
  | "logoutAccount"
  | "selectLanguage"
  | "interfaceLanguage"
  | "avatarSettings"
  | "back"
  | "cancel"
  | "apply"
  | "profile"
  | "accountManagement"
  | "changeAvatar"
  | "uploading"
  | "profileId"
  | "accountInformation"
  | "username"
  | "notSpecified"
  | "email"
  | "registrationDate"
  | "searchPlaceholder";

const translations: Record<Language, Record<TranslationKey, string>> = {
  ru: {
    catalog: "Каталог",
    messages: "Сообщения",
    favorites: "Избранное",
    myDeals: "Мои сделки",
    login: "Войти",
    myProfile: "Мой профиль",
    language: "Язык",
    frameAndColor: "Рамка и цвет",
    logout: "Выйти",
    logoutAccount: "Выйти из аккаунта",
    selectLanguage: "Выбор языка",
    interfaceLanguage: "Язык интерфейса GameTrade",
    avatarSettings: "Настройте вид аватара",
    back: "Назад",
    cancel: "Отмена",
    apply: "Применить",
    profile: "Профиль",
    accountManagement: "Управление аккаунтом GameTrade",
    changeAvatar: "Изменить аватар",
    uploading: "Загрузка...",
    profileId: "ID профиля",
    accountInformation: "Информация аккаунта",
    username: "Имя пользователя",
    notSpecified: "Не указано",
    email: "Email",
    registrationDate: "Дата регистрации",
    searchPlaceholder: "Поиск по играм, категориям, товарам...",
  },

  en: {
    catalog: "Catalog",
    messages: "Messages",
    favorites: "Favorites",
    myDeals: "My deals",
    login: "Sign in",
    myProfile: "My profile",
    language: "Language",
    frameAndColor: "Frame and color",
    logout: "Log out",
    logoutAccount: "Log out of account",
    selectLanguage: "Select language",
    interfaceLanguage: "GameTrade interface language",
    avatarSettings: "Customize your avatar appearance",
    back: "Back",
    cancel: "Cancel",
    apply: "Apply",
    profile: "Profile",
    accountManagement: "Manage your GameTrade account",
    changeAvatar: "Change avatar",
    uploading: "Uploading...",
    profileId: "Profile ID",
    accountInformation: "Account information",
    username: "Username",
    notSpecified: "Not specified",
    email: "Email",
    registrationDate: "Registration date",
    searchPlaceholder: "Search games, categories and listings...",
  },

  de: {
    catalog: "Katalog",
    messages: "Nachrichten",
    favorites: "Favoriten",
    myDeals: "Meine Angebote",
    login: "Anmelden",
    myProfile: "Mein Profil",
    language: "Sprache",
    frameAndColor: "Rahmen und Farbe",
    logout: "Abmelden",
    logoutAccount: "Vom Konto abmelden",
    selectLanguage: "Sprache auswählen",
    interfaceLanguage: "GameTrade-Oberflächensprache",
    avatarSettings: "Passe das Aussehen deines Avatars an",
    back: "Zurück",
    cancel: "Abbrechen",
    apply: "Anwenden",
    profile: "Profil",
    accountManagement: "Verwalte dein GameTrade-Konto",
    changeAvatar: "Avatar ändern",
    uploading: "Wird hochgeladen...",
    profileId: "Profil-ID",
    accountInformation: "Kontoinformationen",
    username: "Benutzername",
    notSpecified: "Nicht angegeben",
    email: "E-Mail",
    registrationDate: "Registrierungsdatum",
    searchPlaceholder: "Spiele, Kategorien und Angebote suchen...",
  },

  fr: {
    catalog: "Catalogue",
    messages: "Messages",
    favorites: "Favoris",
    myDeals: "Mes transactions",
    login: "Se connecter",
    myProfile: "Mon profil",
    language: "Langue",
    frameAndColor: "Cadre et couleur",
    logout: "Se déconnecter",
    logoutAccount: "Se déconnecter du compte",
    selectLanguage: "Choisir la langue",
    interfaceLanguage: "Langue de l'interface GameTrade",
    avatarSettings: "Personnalisez l'apparence de votre avatar",
    back: "Retour",
    cancel: "Annuler",
    apply: "Appliquer",
    profile: "Profil",
    accountManagement: "Gérez votre compte GameTrade",
    changeAvatar: "Changer l'avatar",
    uploading: "Chargement...",
    profileId: "ID du profil",
    accountInformation: "Informations du compte",
    username: "Nom d'utilisateur",
    notSpecified: "Non indiqué",
    email: "E-mail",
    registrationDate: "Date d'inscription",
    searchPlaceholder: "Rechercher des jeux, catégories et annonces...",
  },

  es: {
    catalog: "Catálogo",
    messages: "Mensajes",
    favorites: "Favoritos",
    myDeals: "Mis operaciones",
    login: "Iniciar sesión",
    myProfile: "Mi perfil",
    language: "Idioma",
    frameAndColor: "Marco y color",
    logout: "Cerrar sesión",
    logoutAccount: "Cerrar sesión de la cuenta",
    selectLanguage: "Seleccionar idioma",
    interfaceLanguage: "Idioma de la interfaz de GameTrade",
    avatarSettings: "Personaliza la apariencia de tu avatar",
    back: "Atrás",
    cancel: "Cancelar",
    apply: "Aplicar",
    profile: "Perfil",
    accountManagement: "Gestiona tu cuenta de GameTrade",
    changeAvatar: "Cambiar avatar",
    uploading: "Subiendo...",
    profileId: "ID del perfil",
    accountInformation: "Información de la cuenta",
    username: "Nombre de usuario",
    notSpecified: "No especificado",
    email: "Correo electrónico",
    registrationDate: "Fecha de registro",
    searchPlaceholder: "Buscar juegos, categorías y anuncios...",
  },

  pl: {
    catalog: "Katalog",
    messages: "Wiadomości",
    favorites: "Ulubione",
    myDeals: "Moje transakcje",
    login: "Zaloguj się",
    myProfile: "Mój profil",
    language: "Język",
    frameAndColor: "Ramka i kolor",
    logout: "Wyloguj się",
    logoutAccount: "Wyloguj się z konta",
    selectLanguage: "Wybierz język",
    interfaceLanguage: "Język interfejsu GameTrade",
    avatarSettings: "Dostosuj wygląd swojego awatara",
    back: "Wstecz",
    cancel: "Anuluj",
    apply: "Zastosuj",
    profile: "Profil",
    accountManagement: "Zarządzaj swoim kontem GameTrade",
    changeAvatar: "Zmień awatar",
    uploading: "Przesyłanie...",
    profileId: "ID profilu",
    accountInformation: "Informacje o koncie",
    username: "Nazwa użytkownika",
    notSpecified: "Nie podano",
    email: "E-mail",
    registrationDate: "Data rejestracji",
    searchPlaceholder: "Szukaj gier, kategorii i ofert...",
  },
};

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
};

const defaultLanguageContext: LanguageContextType = {
  language: "ru",

  setLanguage: () => {},

  t: (key) => {
    return translations.ru[key] || key;
  },
};

const LanguageContext = createContext<LanguageContextType>(
  defaultLanguageContext
);

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguageState] = useState<Language>("ru");

  useEffect(() => {
    const savedLanguage = localStorage.getItem(
      "gametrade-language"
    ) as Language | null;

    if (savedLanguage && translations[savedLanguage]) {
      setLanguageState(savedLanguage);
      document.documentElement.lang = savedLanguage;
    }
  }, []);

  function setLanguage(language: Language) {
    localStorage.setItem("gametrade-language", language);

    setLanguageState(language);

    document.documentElement.lang = language;
  }

  function t(key: TranslationKey) {
    return (
      translations[language][key] ||
      translations.ru[key] ||
      key
    );
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}