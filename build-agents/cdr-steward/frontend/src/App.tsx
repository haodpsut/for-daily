import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProgramProvider } from './contexts/ProgramContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import POs from './pages/POs';
import PLOs from './pages/PLOs';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Outputs from './pages/Outputs';
import ImportExcel from './pages/ImportExcel';
import Impact from './pages/Impact';

export default function App() {
  return (
    <ProgramProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="pos" element={<POs />} />
            <Route path="plos" element={<PLOs />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:id" element={<CourseDetail />} />
            <Route path="import" element={<ImportExcel />} />
            <Route path="impact" element={<Impact />} />
            <Route path="outputs" element={<Outputs />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ProgramProvider>
  );
}
