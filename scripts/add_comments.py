from pathlib import Path
root = Path('.')
files = sorted(root.rglob('*.js')) + sorted(root.rglob('*.jsx'))

for p in files:
    if 'node_modules' in p.parts or '.git' in p.parts or (len(p.parts) > 0 and p.parts[0] == 'scripts'):
        continue

    text = p.read_text(encoding='utf-8', errors='replace').splitlines()
    out = []
    in_jsx = False

    for line in text:
        stripped = line.lstrip()

        if stripped.startswith('//') or stripped.startswith('/*') or stripped.startswith('*') or stripped.startswith('*/') or stripped == '':
            out.append(line)
            continue

        if not in_jsx and stripped.startswith('return ('):
            out.append('// Return JSX layout')
            out.append(line)
            in_jsx = True
            continue

        if in_jsx:
            out.append(line)
            if stripped == ');' or stripped.endswith(');'):
                in_jsx = False
            continue

        comment = None
        if stripped.startswith('import '):
            comment = '// Import project dependencies'
        elif stripped.startswith(('const ', 'let ', 'var ')):
            if '=>' in stripped and stripped.endswith('{'):
                comment = '// Define a function or component using an arrow function'
            else:
                comment = '// Declare a constant or variable'
        elif stripped.startswith('function '):
            comment = '// Define a function'
        elif stripped.startswith('export default'):
            comment = '// Export the default component or module'
        elif stripped.startswith('export const'):
            comment = '// Export a named constant or helper'
        elif stripped.startswith('export {'):
            comment = '// Export module members'
        elif stripped.startswith('return '):
            comment = '// Return a value from the function'
        elif stripped.startswith(('if ', 'else if ', 'else', 'for ', 'while ', 'switch ', 'case ', 'default:', 'try', 'catch', 'finally', 'throw ')):
            comment = '// Control flow statement'
        elif stripped.startswith('await '):
            comment = '// Wait for an asynchronous operation'
        elif stripped.endswith('StyleSheet.create({'):
            comment = '// Create a React Native stylesheet'

        if comment:
            out.append(comment)

        out.append(line)

    p.write_text('\n'.join(out) + '\n', encoding='utf-8')

print('Added comments to app source files')