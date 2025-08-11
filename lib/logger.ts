import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

// Check if running in UI mode
const isUIMode = process.argv.includes('--ui') || process.argv.includes('-u');

// Create logs directory structure
const logsDir = path.join(process.cwd(), 'logs');
const errorsDir = path.join(logsDir, 'errors');
const infoDir = path.join(logsDir, 'info');
const debugDir = path.join(logsDir, 'debug');

// Create directories if they don't exist
[logsDir, errorsDir, infoDir, debugDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'warn';
};

// Define format for logs
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
);

// Define transports based on mode
const getTransports = () => {
    if (isUIMode) {
        // For UI mode, only use console transport to reduce logging
        return [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                ),
                level: 'warn' // Only show warnings and errors in UI mode
            })
        ];
    }

    // For normal mode, use all transports
    return [
        // Console transport
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),

        // File transport for all logs (main log)
        new DailyRotateFile({
            filename: path.join(logsDir, 'application-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '4d',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        }),

        // File transport for errors only
        new DailyRotateFile({
            filename: path.join(errorsDir, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '4d',
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        }),

        // File transport for info logs
        new DailyRotateFile({
            filename: path.join(infoDir, 'info-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '4d',
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        }),

        // File transport for debug logs
        new DailyRotateFile({
            filename: path.join(debugDir, 'debug-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '4d',
            level: 'debug',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        }),
    ];
};

// Create the logger
const logger = winston.createLogger({
    level: isUIMode ? 'warn' : level(),
    levels,
    format,
    transports: getTransports(),
    // Add exitOnError to prevent hanging
    exitOnError: false,
});

// Add method to properly close logger
const closeLogger = () => {
    logger.end();
};

// Handle process termination to close logger properly
process.on('SIGINT', () => {
    closeLogger();
    process.exit(0);
});

process.on('SIGTERM', () => {
    closeLogger();
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    closeLogger();
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    closeLogger();
    process.exit(1);
});

// Handle beforeExit for UI mode
process.on('beforeExit', () => {
    closeLogger();
});

// Handle exit for UI mode
process.on('exit', () => {
    closeLogger();
});

export default logger;
