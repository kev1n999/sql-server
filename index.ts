import Lexer from './lexer';

const lexer = new Lexer('select * from users where username = cookie;');

while (lexer.cursor < lexer.input!.length) {
    const next = lexer.lexer();

    if (next.kind === 'EOF' || next.kind === 'SEMICOLON') break;

    console.log(next);
}