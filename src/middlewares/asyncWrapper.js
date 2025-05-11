// src/middleware/asyncWrapper.js

const asyncWrapper = (handler) => {
    return (req, res, next) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
};

export default asyncWrapper;