import { useState, useEffect, RefObject, useCallback, useMemo } from "react";
import { useMediaQuery } from "react-responsive";

import Game from "@/chess/game";
import type { Settings } from "@/lib/types/settings";

// page is used as a key of Settings to decide which type to return
export default function useSettings<Page extends keyof Settings>(page: Page, gameRef?: RefObject<Game>): [Settings[Page], (newSettings: Settings[Page]) => void] {
  const isSmallScreen = useMediaQuery({ maxWidth: 1023 }); // below large breakpoint (1024)

  const defaultSettings: Settings = useMemo(() => { return {
    "play_online": {
      white: "White",
      black: "Black",
    },

    "play_with_bot": {
      white: "White",
      black: "Black",
    },

    "pass_and_play": {
      white: "White",
      black: "Black",

      boardRotates: isSmallScreen,
      boardFlips:   !isSmallScreen,
      allowUndo:    true,
    }
  }}, [isSmallScreen]);

  const [settings, setSettings] = useState<Settings[Page]>(defaultSettings[page]);

  const updateSettings = useCallback((newSettings: Settings[Page]) => {
    setSettings(newSettings);
    console.log(newSettings);
    
    try {
      localStorage.setItem(`${page}.settings`, JSON.stringify(newSettings));
    }
    catch (e) {
      console.error(e, "\nFailed to save following settings to Local Storage\n", newSettings);
    }

    if (gameRef) {
      gameRef.current.whitePlayer = newSettings.white;
      gameRef.current.blackPlayer = newSettings.black;
    }
  }, [page, gameRef]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`${page}.settings`);
      const storedSettings = raw ? JSON.parse(raw) : {};

      // add defaultSettings to merged first then override with storedSettings
      const merged = {...defaultSettings[page], ...storedSettings};
      updateSettings(merged);
    }
    catch (e) {
      console.error(e);
      updateSettings(defaultSettings[page]);
    }
  }, [page, defaultSettings, updateSettings]);

  return [settings, updateSettings];
}
