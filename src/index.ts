import { app } from './app.js';
import { port } from './config.js';
import logger from './core/logger.js';

console.log(process.env.database_url);

app.listen(port, () => {
    logger.info(`Server started successfully on port ${port}`);
});
