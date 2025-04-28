export type BaseInitOptions = {
  pickedEnable?: boolean;
  bloom?: boolean;
  name?: string;
  url?: string;
  path?: string;
  position?: number[];
  scale?: number[];
  angle?: number[];
  parent?: any;
  layout?: {
    rule?: number[];
    offset?: number[];
  };
  onProgress?: (progress: number) => void;
  data?: any;
  ratio?: number;
}; 