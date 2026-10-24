type ErrorKind = "INVALID_KEYWORD" | "SYNTAX_ERROR";

export type ErrorDetails = {
    kind: ErrorKind;
    line?: number;
    column?: number;
    description?: string;
};

export class LexerError extends Error {
    constructor(public details?: ErrorDetails) {
        super(`> Error: ${details?.kind}\n${details?.description}\nline '${details?.line}' - column: '${details?.column}'`);
    }
}