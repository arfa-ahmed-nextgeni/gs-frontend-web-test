export type ApiActivityJsonTreeValue =
  | {
      [key: string]: ApiActivityJsonValue;
    }
  | ApiActivityJsonValue[];

export type ApiActivityJsonValue =
  | ApiActivityJsonPrimitive
  | ApiActivityJsonTreeValue;

type ApiActivityJsonPrimitive = boolean | null | number | string;
