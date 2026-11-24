import { useEffect, useState } from 'react';
import { SaveData, SaveManager } from '../game/SaveManager';

export function useSaveData(): SaveData {
  const [data, setData] = useState<SaveData>(() => ({ ...SaveManager.getData() }));

  useEffect(() => {
    return SaveManager.subscribe(() => {
      setData({ ...SaveManager.getData() });
    });
  }, []);

  return data;
}
