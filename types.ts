interface Circular {
  radius: number;
}

export type Game = {
  players: Player[];
  trees: Tree[];
};

interface Healthy {
  health: number;
}

interface Illuminated {
  illuminated: boolean;
}

export type Player = Circular &
  Healthy &
  Illuminated &
  Positioned &
  Provisioned;

export type PointerDownMessage = Timestamped & Topical & Positioned;

export type PointerUpMessage = Timestamped & Topical & Positioned;

interface Positioned {
  position: { x: number; y: number };
}

interface Provisioned {
  flares: number;
}

export type StateChangeMessage = Timestamped & Topical & { game: Game };

interface Timestamped {
  timestamp: number;
}

export enum Topic {
  PointerDown,
  PointerUp,
  StateChange,
}

interface Topical {
  topic: Topic;
}

export type Tree = Circular & Positioned;

export type WebSocketClient = {
  publish: (message: PointerDownMessage | PointerUpMessage) => void;
};

export type WebSocketMessage =
  | PointerDownMessage
  | PointerUpMessage
  | StateChangeMessage;
