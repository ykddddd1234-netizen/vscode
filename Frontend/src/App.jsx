import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CalendarPage from './pages/CalendarPage';
import CalendarPage2 from './pages/CalendarPage2';
import SignupPage from './pages/SignupPage';
import CompanyManagePage from './pages/CompanyManagePage';
import CompanyRosterPage from './pages/CompanyRosterPage';
import OutingRosterPage from './pages/OutingRosterPage';
import GuardroomPage from './pages/GuardroomPage';
import OutingManagePage from './pages/OutingManagePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
				<Route path="/signup" element={<SignupPage />} />
				<Route path="/calendar2" element={<CalendarPage2 />}/>
				<Route path="/CompanyManagePage" element={<CompanyManagePage />}/>
				<Route path="/company-roster" element={<CompanyRosterPage />}/>
				<Route path="/outing-roster" element={<OutingRosterPage />}/>
				<Route path="/guardroom" element={<GuardroomPage />}/>
				<Route path="/outing-manage" element={<OutingManagePage />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
