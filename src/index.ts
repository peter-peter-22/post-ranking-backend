import cors from 'cors';
import express from 'express';
import "express-async-errors";
import { authMiddleware } from './authentication';
import { errorHandler } from './middlewares/errorHandler';
import routes from "./routes";

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(authMiddleware)
app.use(errorHandler);

// Routes
app.use(routes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
