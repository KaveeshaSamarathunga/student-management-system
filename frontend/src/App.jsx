import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Login from './Login';
import Dashboard from './Dashboard';
import Students from './pages/Students';
import Registration from './pages/Registration';
import Intakes from './pages/Intakes';
import CreateIntake from './pages/CreateIntake';
import Courses from './pages/Courses';
import Logs from './pages/Logs';
import StudentProfile from './pages/StudentProfile';

function App() {
  return (
    <Router>
      <Routes>
        {/* No Sidebar for Login */}
        <Route path="/" element={<Login />} />

        {/* Private Pages with Sidebar */}
        <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
        <Route path="/students" element={<MainLayout><Students /></MainLayout>} />
        <Route path="/register-student" element={<MainLayout><Registration></Registration></MainLayout>} />
        <Route path="/intakes" element={<MainLayout><Intakes /></MainLayout>} />
        <Route path="/create-intake" element={<MainLayout><CreateIntake /></MainLayout>} />
        <Route path="/courses" element={<MainLayout><Courses /></MainLayout>} />
        <Route path="/logs" element={<MainLayout><Logs /></MainLayout>} />
        <Route path="/students/:id" element={<MainLayout><StudentProfile /></MainLayout>} />

      </Routes>
    </Router>
  );
}
export default App;