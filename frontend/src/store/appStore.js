import { create } from 'zustand';

const useAppStore = create((set) => ({
  activeDatasetId: null,
  datasets: [],
  setActiveDatasetId: (id) => set({ activeDatasetId: id }),
  setDatasets: (datasets) => set({ datasets }),
  addDataset: (dataset) => set((state) => ({ datasets: [dataset, ...state.datasets] })),
  removeDataset: (id) =>
    set((state) => ({
      datasets: state.datasets.filter((d) => d.id !== id),
      activeDatasetId: state.activeDatasetId === id ? null : state.activeDatasetId,
    })),
}));

export default useAppStore;
