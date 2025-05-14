type PlayOnlineSettings = {
  white: string,
  black: string,
};

type PlayWithBotSettings = {
  white: string,
  black: string,
};

type PassAndPlaySettings = {
  white: string,
  black: string,

  boardRotates: boolean,
  boardFlips: boolean,
  allowUndo: boolean,
};

// union of types
type Settings = {
  play_online:   PlayOnlineSettings;
  play_with_bot: PlayWithBotSettings;
  pass_and_play: PassAndPlaySettings;
};


export type {
  Settings,
  PlayOnlineSettings,
  PlayWithBotSettings,
  PassAndPlaySettings,
};
