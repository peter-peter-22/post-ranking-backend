import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import routes from "./routes";
import { authMiddleware } from './authentication';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(authMiddleware)

// Routes
app.use(routes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});