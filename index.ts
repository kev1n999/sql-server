import Lexer from './lexer';

const lexer = new Lexer('SELECT * FROM DATABASE;');

console.log(lexer.lexer());
console.log(lexer.lexer());
console.log(lexer.lexer());
console.log(lexer.lexer());
console.log(lexer.lexer());