const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const jsx = require('acorn-jsx');
const walk = require('acorn-walk');

const pagesDir = path.join(__dirname, 'pages');

const isReactComponentExported = (fileContent) => {
  try {
    const ast = acorn.Parser.extend(jsx()).parse(fileContent, { sourceType: 'module', ecmaVersion: 'latest' });

    let defaultExportFound = false;

    walk.simple(ast, {
      ExportDefaultDeclaration(node) {
        if (node.declaration.type === 'FunctionDeclaration' || node.declaration.type === 'ArrowFunctionExpression' || node.declaration.type === 'ClassDeclaration') {
          defaultExportFound = true;
        }
      }
    });

    return defaultExportFound;
  } catch (error) {
    console.error('Error parsing file:', error);
    return false;
  }
};

const checkPagesDirectory = (dir) => {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(dir, file);

      fs.stat(filePath, (err, stat) => {
        if (err) {
          console.error('Error stating file:', err);
          return;
        }

        if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx'))) {
          fs.readFile(filePath, 'utf8', (err, content) => {
            if (err) {
              console.error('Error reading file:', err);
              return;
            }

            const result = isReactComponentExported(content);
            console.log(`${file}: ${result ? 'Valid' : 'Invalid'}`);
          });
        }
      });
    });
  });
};

checkPagesDirectory(pagesDir);
