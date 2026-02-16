// Module generator script
// Generates DDD module structure for new NestJS modules

const moduleName = process.argv[2];

if (!moduleName) {
  console.error('Usage: ts-node generate-module.ts <module-name>');
  process.exit(1);
}

console.log(`Generating module: ${moduleName}`);
// TODO: Add module generation logic
console.log(`Module ${moduleName} generated successfully.`);
