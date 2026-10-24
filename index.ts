import Lexer from './lexer';

const lexer = new Lexer('update users set age = 18 where username = "kevin";');

while (lexer.cursor < lexer.input!.length) {
    const next = lexer.lexer();

    if (next.kind === 'EOF' || next.kind === 'SEMICOLON') break;

    console.log(next);
}