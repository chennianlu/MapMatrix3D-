import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MapState {
  currentMap: string;
  currentLevel: number;
  selectedRegion: string | null;
  glowEffect: {
    glowColor: string;
    glowWidth: number;
    glowIntensity: number;
    glowFalloff: number;
  };
}

const initialState: MapState = {
  currentMap: 'china',
  currentLevel: 0,
  selectedRegion: null,
  glowEffect: {
    glowColor: '#00ff00',
    glowWidth: 0.5,
    glowIntensity: 1.0,
    glowFalloff: 0.5,
  },
};

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setCurrentMap: (state, action: PayloadAction<string>) => {
      state.currentMap = action.payload;
    },
    setCurrentLevel: (state, action: PayloadAction<number>) => {
      state.currentLevel = action.payload;
    },
    setSelectedRegion: (state, action: PayloadAction<string | null>) => {
      state.selectedRegion = action.payload;
    },
    setGlowEffect: (state, action: PayloadAction<MapState['glowEffect']>) => {
      state.glowEffect = action.payload;
    },
  },
});

export const { setCurrentMap, setCurrentLevel, setSelectedRegion, setGlowEffect } = mapSlice.actions;
export default mapSlice.reducer; 