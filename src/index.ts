import cors from 'cors';
import express from 'express';
import "express-async-errors";
import { errorHandler } from './middlewares/errorHandler';
import routes from "./routes";

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use(routes);

// Error handler
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
