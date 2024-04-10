import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RoomOperation from './pages/RoomOperation';
import TemporaryPage from './pages/TemporaryPage';
import ChatRoom from './pages/ChatRoom';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/' Component={RoomOperation} />
          <Route path='/inRoom' Component={ChatRoom} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
