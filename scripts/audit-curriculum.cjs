// Read the actual curriculum with the locked TypeScript compiler; no output files.
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020},
}).outputText, filename);
const { DUTCH_REGIONS } = require('../src/lib/data/regions.ts');
const { createCurriculum } = require('../src/lib/data/courseCurriculum.ts');
for (const course of ['nl', 'be', 'de', 'ch']) {
  const lessons = createCurriculum(DUTCH_REGIONS, course).flatMap(region => region.lessons);
  const learned = new Set();
  const coverage = {};
  for (const lesson of lessons) {
    lesson.newKeys.forEach(key => {learned.add(key); coverage[key] = {introduced: lesson.id, reviewLessons: [], opportunities: 0};});
    lesson.exercises.forEach((text, i) => {
      for (const key of text) {
        if (!learned.has(key)) throw new Error(`${course}/${lesson.id}: untaught ${key}`);
        coverage[key].opportunities++;
      }
      if (lesson.practiceSteps[i].kind === 'review') {
        for (const key of new Set(text)) {
          if (coverage[key].introduced === lesson.practiceSteps[i].reviewOf && !coverage[key].reviewLessons.includes(lesson.id)) coverage[key].reviewLessons.push(lesson.id);
        }
      }
    });
  }
  console.log(JSON.stringify({course, lessons: lessons.length,
    exerciseCharacters: lessons.reduce((n, lesson) => n + lesson.exercises.join('').length, 0), coverage}));
}
