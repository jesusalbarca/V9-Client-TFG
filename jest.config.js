/**
 * JEST Testing configuration
 */
module.exports = {
    transform: {
        "^.+\\.js$": "babel-jest"
    },
    moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx", "node"],
    testEnvironment: "node",
    setupFilesAfterEnv: ["dotenv/config"] // This makes .env info accessible
    // preset: '@shelf/jest-mongo-db'
};

