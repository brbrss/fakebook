
class DbConnectionError extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = 'Connection Error';
        this.status = 503;
    }
}

class InvalidIdError extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = 'Invalid ID Error';
        this.status = 400;
    }
}

class OperationError extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = 'Invalid Operation Error';
        this.status = 422;
    }
}

class AuthenticationError extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = 'Authentication Error';
    }
}

class InputError extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = 'Input Error';
        this.error = 400;
    }
}

module.exports = {
    DbConnectionError, InvalidIdError,
    OperationError, AuthenticationError, InputError
};
