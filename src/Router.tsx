import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Confgive from "./pages/Confgive";
import "./common/scss/reset.scss";

const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/CONFGIVE" element={<Confgive />} />
            </Routes>
        </Router>
    );
};

export default AppRouter;
