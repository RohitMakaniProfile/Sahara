import { app } from './app.js';
import { port } from './config.js';
import logger from './core/logger.js';

app.listen(port, () => {
    logger.info(`Server started successfully on port ${port}`);
});
