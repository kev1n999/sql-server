import { LexerError } from "./errors";

// lexical units
export const TOKEN_KIND = {
    SELECT: "SELECT",
    WHERE: "WHERE",
    FROM: "FROM",
    CREATE: "CREATE",
    SEMICOLON: "SEMICOLON",
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
        return kind === "CREATE"    ||
               kind === "SELECT"    ||
               kind === "FROM"      ||
               kind === "SEMICOLON" ||
               kind === "WHERE"     ||
               kind === "STAR"      ||
               kind === "EOF";
    }
    
    private expectedToken(original: TokenKind, expected: TokenKind): boolean {
        return original === expected;
    }

    private kindTokenizer<T extends TokenKind>(kind: T): Token | void {
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

    public lexer(): Token | void {
        this.ignoreWhitespaces();

        let current = this.getCurrent() as string;

        while (this.cursor < this.inputSize) {
            let token = "" as unknown as Token;

            if (/[A-Z_]/.test(current)) {
                return this.identifierTokenizer();
            }

            switch (current) {
                case 'S':
                    return this.kindTokenizer<'SELECT'>('SELECT');
                case 'F':
                    return this.kindTokenizer<'FROM'>('FROM');
                case 'C':
                    return this.kindTokenizer<'CREATE'>('CREATE');
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
    }
}