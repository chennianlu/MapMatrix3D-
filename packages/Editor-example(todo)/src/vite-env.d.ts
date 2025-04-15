/// <reference types="vite/client" />
/**
 * @format
 */
import { SystemAPP } from './App';

export declare global {
  interface Window {
    // req: any;//全局变量名
    app: SystemAPP;
  }
}
