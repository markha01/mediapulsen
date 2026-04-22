import { useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { Outlet } from 'react-router-dom';
import client from '../../api/client';
import useAppStore from '../../store/appStore';

export default function AppShell() {
  const { setDatasets, setActiveDatasetId, activeDatasetId } = useAppStore();

  useEffect(() => {
    client.get('/api/datasets').then((res) => {
      setDatasets(res.data);
      if (!activeDatasetId && res.data.length > 0) {
        setActiveDatasetId(res.data[0].id);
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
