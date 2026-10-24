import { LexerError } from "./errors";

// lexical units
export const TOKEN_KIND = {
    SELECT: "SELECT",
    WHERE: "WHERE",
    FROM: "FROM",
    CREATE: "CREATE",
    INSERT: "INSERT",
    INTO: "INTO",
    EQUALS: "EQUALS",
    SEMICOLON: "SEMICOLON",
    INT: 'INT',
    STAR: "STAR",
    IDENTIFIER: "IDENTIFIER",
    EOF: "EOF",
} as const;

export type TokenKind = typeof TOKEN_KIND[keyof typeof TOKEN_KIND];

// basic token structure
type Token = {
    kind: TokenKind;
    lexeme: string;
}

interface ILexer {
    input: string | undefined;
    cursor: number;
}

export default class Lexer implements ILexer {
    public input: string | undefined;
    public cursor: number = 0;
    private readonly inputSize: number = 0;

    constructor(private readonly source: string) {
        this.input = this.source;
        this.inputSize = this.source.length; 
    }

    private advanceCursor(): void {
        this.cursor+=1;
    }

    private getCurrent(): string | undefined {
         return this.input?.[this.cursor]?.toUpperCase();
    }

    private ignoreWhitespaces(): void {
        while (this.cursor < this.inputSize && /\s/.test(this.getCurrent() ?? '')) {
            this.advanceCursor();
        }
    }

    private isKeyword(kind: TokenKind): boolean {
        return kind === "CREATE"     ||
               kind === "SELECT"     ||
               kind === "FROM"       ||
               kind === "SEMICOLON"  ||
               kind === "WHERE"      ||
               kind === "STAR"       ||
               kind === "INSERT"     ||
               kind === "IDENTIFIER" ||
               kind === "INTO"       ||
               kind === "EQUALS"     ||
               kind === 'INT'        ||
               kind === "EOF";
    }
    
    private expectedToken(original: TokenKind, expected: TokenKind): boolean {
        return original === expected;
    }

    private kindTokenizer<T extends TokenKind>(kind: T): Token {
        let current = this.getCurrent();

        let lexeme = "" as unknown as TokenKind;
        let index = 0;

        while (this.cursor < this.inputSize && current === kind[index]) {
            lexeme += current;
            this.advanceCursor();
            current = this.getCurrent();
            index++;
        }

        if (!this.isKeyword(lexeme)) {
            throw new LexerError({ kind: 'INVALID_KEYWORD', description: `${lexeme} isn't a valid keyword!` });
        }

        if (lexeme.trim() != kind) this.advanceCursor();

        return { kind, lexeme, };
    }

    private identifierTokenizer(): Token {
        let current = this.getCurrent();
        let lexeme = "" as unknown as TokenKind;

        while (current !== undefined && /[A-Z0-9_]/.test(current)) {
            if (current === ';') {
                break;
            }

            lexeme += current;
            this.advanceCursor();
            current = this.getCurrent();
        }

        const kind = this.isKeyword(lexeme) ? lexeme as TokenKind : 'IDENTIFIER';

        return { kind, lexeme, };
    }

    private intTokenizer(): Token {
        let value = "";
        let current = this.getCurrent();

        while (this.cursor < this.inputSize) {
            if (current === '.' && value.charAt(value.length-1).trim() === '.') {
                this.advanceCursor();
            } else {
                value += current;
                this.advanceCursor();
            }

            current = this.getCurrent();

            while (!isNaN(Number(current))) {
                value += current;
                this.advanceCursor();
                current = this.getCurrent();
            }
        }

        return { kind: 'INT', lexeme: value, };
    }

    public lexer(): Token {
        this.ignoreWhitespaces();

        let current = this.getCurrent() as string;

        while (this.cursor < this.inputSize) {
            let token = "" as unknown as Token;

            if (/[A-Z_]/.test(current)) {
                return this.identifierTokenizer();
            }

            if (/^[0-9]+$/.test(current)) {
                return this.intTokenizer();
            }

            switch (current) {
                case 'S':
                    return this.kindTokenizer<'SELECT'>('SELECT');
                case 'F':
                    return this.kindTokenizer<'FROM'>('FROM');
                case 'C':
                    return this.kindTokenizer<'CREATE'>('CREATE');
                case 'I':
                    return this.kindTokenizer<'INTO' | 'INSERT'>('INTO');
                case '=':
                    token = { kind: 'EQUALS', lexeme : '=', };
                    this.advanceCursor();
                    return token;
                case '*':
                    token = { kind: 'STAR', lexeme: '*', };
                    this.advanceCursor();
                    return token;
                case ';':
                    token = { kind: 'SEMICOLON', lexeme: ';', };
                    this.advanceCursor();
                    return token;
                default:
                    return { kind: 'EOF', lexeme: '', };
            }
        }

        return { kind: 'EOF', lexeme: '', };
    }
}