const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");

// Compile the actual TypeScript sources with the project's compiler. No browser,
// third-party test runner, generated artifacts or separate implementation is used.
function sources() {
  const cache = new Map();
  function load(file) {
    if (!path.extname(file)) file = fs.existsSync(file + ".ts") ? file + ".ts" : path.join(file,"index.ts");
    if (file.endsWith(".json")) return JSON.parse(fs.readFileSync(file,"utf8"));
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    const nativeRequire = createRequire(file);
    const requireSource = (name) =>
      name.startsWith("@/")
        ? load(path.join(root, "src", name.slice(2)))
        : name.startsWith(".")
          ? load(path.resolve(path.dirname(file), name))
          : nativeRequire(name);
    const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
        target: ts.ScriptTarget.ES2020,
      },
    }).outputText;
    new Function("exports", "require", "module", code)(
      module.exports,
      requireSource,
      module,
    );
    return module.exports;
  }
  return (file) => load(path.join(root, "src", file));
}
function storage(seed = {}) {
  const data = new Map(Object.entries(seed));
  global.localStorage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  };
  return data;
}

test("a wrong key stays on the expected character and all retries affect accuracy", () => {
  const store = sources()("lib/stores/typingStore").useTypingStore;
  store.getState().setTargetText("fj");
  store.getState().handleKeyPress("j");
  assert.equal(store.getState().currentIndex, 0);
  store.getState().handleKeyPress("f");
  store.getState().handleKeyPress("j");
  assert.equal(store.getState().isComplete, true);
  assert.equal(store.getState().accuracy, (2 / 3) * 100);
  assert.deepEqual(store.getState().keyStats.f, { attempts: 2, errors: 1 });
  assert.equal(store.getState().wpm, null);
});
test("star thresholds use the unrounded ratio", () => {
  const { getStars } = sources()("lib/stores/typingStore");
  assert.equal(getStars(189, 200), 2);
  assert.equal(getStars(190, 200), 3);
  assert.equal(getStars(169, 200), 1);
  assert.equal(getStars(170, 200), 2);
});
test("speed counts correct keys only, needs a sample and excludes explicit pauses and long idle", () => {
  const store = sources()("lib/stores/typingStore").useTypingStore;
  const original = Date.now;
  let now = 0;
  Date.now = () => now;
  try {
    store.getState().setTargetText("f".repeat(60));
    for (let i = 0; i < 21; i++) {
      store.getState().handleKeyPress("f");
      now += 1000;
    }
    assert.equal(store.getState().wpm, 13);
    const before = store.getState().activeMs;
    store.getState().setPaused(true);
    now += 60000;
    store.getState().handleKeyPress("f");
    assert.equal(store.getState().currentIndex, 21);
    store.getState().setPaused(false);
    store.getState().handleKeyPress("f");
    assert.equal(store.getState().activeMs, before);
    now += 30000;
    store.getState().handleKeyPress("j");
    assert.equal(store.getState().activeMs, before);
    assert.equal(store.getState().currentIndex, 22);
  } finally {
    Date.now = original;
  }
});
test("all curriculum and game targets use previously introduced keys", () => {
  const load = sources();
  const { REGIONS } = load("lib/data/regions");
  const { flightTargets } = load("lib/magicFlight");
  const learned = new Set();
  for (const lesson of REGIONS.flatMap((region) => region.lessons)) {
    lesson.newKeys.forEach((key) => learned.add(key));
    for (const text of [...lesson.exercises, ...flightTargets(lesson.id)])
      for (const key of text)
        assert.ok(
          learned.has(key),
          `Lesson ${lesson.id}: unlearned ${key} in ${text}`,
        );
  }
});
test("early game uses f and j as typing targets, wrong keys cannot earn or advance", () => {
  const {
    initialFlight,
    flightTargets,
    typeFlight,
    FLIGHT_GOAL,
    flightReward,
    flightElapsed,
  } = sources()("lib/magicFlight");
  const targets = flightTargets(0);
  assert.deepEqual(new Set(targets), new Set(["f", "j"]));
  let state = typeFlight({ ...initialFlight }, "x", targets);
  assert.equal(state.score, 0);
  assert.equal(state.correct, 0);
  assert.equal(state.tokenIndex, 0);
  for (let i = 0; i < FLIGHT_GOAL; i++)
    state = typeFlight(
      state,
      targets[state.tokenIndex][state.charIndex],
      targets,
    );
  assert.equal(state.correct, FLIGHT_GOAL);
  assert.equal(state.attempts, FLIGHT_GOAL + 1);
  assert.equal(typeFlight(state, "f", targets), state);
  assert.equal(flightReward(0), 0);
  assert.equal(flightReward(4), 0);
  assert.equal(flightReward(40), 10);
  assert.equal(flightElapsed(59000, 1000, 5000), 60000);
  assert.equal(flightElapsed(1000, 5000, 1000), 1000);
});
test("legacy lesson and race saves hydrate without losing progress; decorations spend once", () => {
  const data = storage({
    "typen-met-eric-progress": JSON.stringify({
      state: {
        totalStars: 18,
        lessonStars: { 0: 3 },
        completedLessons: [0],
        currentLesson: 6,
      },
      version: 0,
    }),
    "lettoria-game-store": JSON.stringify({
      state: {
        totalGems: 25,
        highScores: { 0: 12000 },
        gamesPlayed: 5,
        totalScore: 12000,
        unlockedAchievements: ["first_game"],
      },
      version: 0,
    }),
  });
  const load = sources();
  const progress = load("lib/stores/progressStore").useProgressStore;
  assert.equal(progress.getState().totalStars, 18);
  assert.deepEqual(progress.getState().keyStats, {});
  progress.getState().recordPractice({ f: { attempts: 5, errors: 1 } });
  assert.equal(progress.getState().lessonStars[0], 3);
  const game = load("lib/stores/gameStore").useGameStore;
  assert.equal(game.getState().totalGems, 25);
  assert.deepEqual(game.getState().grotDecorations, []);
  game.getState().decorateGrot("plant");
  assert.equal(game.getState().totalGems, 17);
  game.getState().decorateGrot("plant");
  assert.equal(game.getState().totalGems, 17);
  assert.equal(game.getState().activeDecoration, null);
  game.getState().decorateGrot("stars");
  assert.equal(game.getState().totalGems, 17);
  game.getState().finishMagicRun("0", 40, 600);
  assert.equal(game.getState().totalGems, 27);
  assert.equal(game.getState().highScores[0], 12000);
  assert.equal(game.getState().highScores["magic-0"], 600);
  assert.ok(
    JSON.parse(data.get("lettoria-game-store")).state.grotDecorations.includes(
      "plant",
    ),
  );
});

test("new keys, including space, appear as direct typing targets", () => {
  const { flightTargets } = sources()("lib/magicFlight");
  assert.deepEqual(flightTargets(8).slice(0, 2), ["t", "y"]);
  assert.deepEqual(flightTargets(10).slice(0, 2), ["q", "w"]);
  assert.equal(flightTargets(5)[0], " ");
});

test("typing ignores shortcuts, repeats, editable fields and foreign dialogs but permits the game dialog", () => {
  const { isTrainingKey } = sources()("lib/hooks/useKeyboard");
  const original = global.Element;
  class Target {
    constructor(dialog, editable = false) {
      this.dialog = dialog;
      this.editable = editable;
    }
    closest(selector) {
      return selector.includes("role=")
        ? this.dialog
        : this.editable
          ? {}
          : null;
    }
  }
  global.Element = Target;
  try {
    const panel = {};
    const event = { key: "f", target: new Target(panel) };
    assert.equal(isTrainingKey(event), false);
    assert.equal(isTrainingKey(event, panel), true);
    assert.equal(
      isTrainingKey({ ...event, target: new Target({}) }, panel),
      false,
    );
    assert.equal(
      isTrainingKey({ ...event, target: new Target(panel, true) }, panel),
      false,
    );
    for (const guard of [
      "repeat",
      "isComposing",
      "ctrlKey",
      "altKey",
      "metaKey",
      "defaultPrevented",
    ])
      assert.equal(isTrainingKey({ ...event, [guard]: true }, panel), false);
  } finally {
    global.Element = original;
  }
});

test("word targets are Dutch words, not repeated-letter lesson drills", () => {
  const { flightTargets } = sources()("lib/magicFlight");
  const possible = new Set([
    "jas",
    "sla",
    "als",
    "las",
    "laf",
    "sjaal",
    "alfa",
  ]);
  for (let i = 0; i < 20; i++) {
    const words = flightTargets(2).filter((text) => text.length > 1);
    assert.ok(words.length > 0);
    assert.ok(words.every((word) => possible.has(word)));
  }
});

test("arcade routes use learned keys, including f/j; each next course increases pace", () => {
  const { arcadeCourse, newArcade } = sources()("lib/arcadeFlight");
  assert.deepEqual(arcadeCourse(0).keys, ["f", "j"]);
  assert.equal(newArcade(arcadeCourse(0), 1).objects[0].key, "f");
  assert.ok(arcadeCourse(1).travelMs < arcadeCourse(0).travelMs);
  assert.ok(arcadeCourse(1).spawnMs < arcadeCourse(0).spawnMs);
  const learned = new Set();
  const load = sources();
  for (const lesson of load("lib/data/regions").REGIONS.flatMap(
    (region) => region.lessons,
  )) {
    lesson.newKeys.forEach((key) => learned.add(key));
    assert.ok(arcadeCourse(lesson.id).keys.every((key) => learned.has(key)));
  }
});
test("arcade typing clears a matching target, grants no points for errors, and charges turbo", () => {
  const { arcadeCourse, newArcade, typeArcade, arcadeTurbo } =
    sources()("lib/arcadeFlight");
  let state = newArcade(arcadeCourse(0), 1);
  const wrong = typeArcade(state, "x");
  assert.equal(wrong.hits, 0);
  assert.equal(wrong.score, 0);
  assert.equal(wrong.objects.length, 1);
  for (let i = 0; i < 6; i++) {
    state = {
      ...state,
      objects: [{ id: i + 1, lane: 1, kind: "letter", challenge: "gem", depth: 0.7, key: "f" }],
    };
    state = typeArcade(state, "f");
  }
  assert.equal(state.hits, 6);
  assert.equal(state.objects.length, 0);
  assert.equal(state.streak, 6);
  assert.equal(arcadeTurbo(state), true);
  assert.equal(state.turboUntil, 5500);
  const duplicate = typeArcade(state, "f");
  assert.equal(duplicate.hits, 6);
  assert.equal(duplicate.score, state.score);
});
test("arcade targets wait for typing; correct keys steer and resolve each challenge", () => {
  const { arcadeCourse, newArcade, advanceArcade, typeArcade, arcadePlayerLane, ARCADE_TARGET_DEPTH } = sources()("lib/arcadeFlight");
  const course = arcadeCourse(2);
  let state = { ...newArcade(course, 1), nextSpawn: Infinity, objects: [
    { id: 1, lane: 0, kind: 'letter', challenge: 'rock', depth: 0.7, key: 'f' },
    { id: 2, lane: 2, kind: 'letter', challenge: 'gem', depth: 0.7, key: 'j' },
  ] };
  for (let i = 0; i < 200; i++) state = advanceArcade(state, 100, course);
  assert.equal(state.objects.length, 2);
  assert.ok(state.objects.every(object => object.depth === ARCADE_TARGET_DEPTH));
  assert.equal(state.score, 0);
  assert.equal(state.collected, 0);
  assert.equal(state.lane, 1);
  const wrong = typeArcade(state, 'x');
  assert.deepEqual(wrong.objects, state.objects);
  assert.equal(wrong.lane, 1);
  assert.equal(wrong.score, 0);
  assert.equal(wrong.attempts, 1);
  const rock = typeArcade(wrong, 'f');
  assert.equal(rock.lane, 0);
  assert.equal(rock.objects.length, 1);
  assert.equal(rock.collected, 0);
  assert.ok(rock.score > 0);
  assert.equal(arcadePlayerLane(rock), 1, 'flight starts from the current visual position');
  const moving = advanceArcade(rock, 120, course);
  assert.ok(arcadePlayerLane(moving) > 0 && arcadePlayerLane(moving) < 1);
  assert.equal(advanceArcade(moving, 0, course), moving, 'pause freezes automatic travel too');
  const gem = typeArcade(moving, 'j');
  assert.equal(gem.lane, 2);
  assert.equal(gem.collected, 1);
  assert.equal(gem.objects.length, 0);
  assert.equal(typeArcade(gem, 'j').collected, 1, 'a resolved crystal is awarded once');
});
test("arcade round ends, spawned targets stay unique and bounded, state advances only when ticked", () => {
  const { arcadeCourse, newArcade, advanceArcade, ARCADE_DURATION_MS } =
    sources()("lib/arcadeFlight");
  const course = arcadeCourse(2);
  let state = newArcade(course, 4);
  for (let i = 0; i < 750; i++) {
    state = advanceArcade(
      state,
      100,
      course,
    );
    const letters = state.objects.filter((object) => object.kind === "letter");
    assert.ok(letters.length <= 3);
    assert.equal(
      new Set(letters.map((object) => object.key)).size,
      letters.length,
    );
    assert.ok(letters.every((object) => course.keys.includes(object.key)));
  }
  assert.equal(state.elapsedMs, ARCADE_DURATION_MS);
  assert.equal(state.ended, true);
  assert.equal(advanceArcade(state, 100, course), state);
  assert.equal(advanceArcade(newArcade(course, 4), 0, course).elapsedMs, 0);
});
test("arcade rewards and records stay separate from magic and original race scores", () => {
  storage({
    "lettoria-game-store": JSON.stringify({
      state: {
        totalGems: 9,
        highScores: { 0: 12000, "magic-0": 650 },
        totalScore: 12650,
        gamesPlayed: 2,
        unlockedAchievements: [],
      },
      version: 0,
    }),
  });
  const store = sources()("lib/stores/gameStore").useGameStore;
  store.getState().finishArcadeRun("0", 12, 2400, true, 3);
  assert.equal(store.getState().totalGems, 18);
  assert.equal(store.getState().highScores["arcade-0"], 2400);
  assert.equal(store.getState().highScores["magic-0"], 650);
  assert.equal(store.getState().highScores[0], 12000);
  const { arcadeReward } = sources()("lib/arcadeFlight");
  assert.equal(arcadeReward(0, true), 0);
  assert.equal(arcadeReward(0, false, 3), 3);
});

function fakeMusicContext() {
  const context = {
    currentTime: 0,
    destination: {},
    starts: [],
    stops: 0,
    closed: false,
    createBuffer(channels, length, sampleRate) {
      const data = Array.from(
        { length: channels },
        () => new Float32Array(length),
      );
      return {
        length,
        sampleRate,
        numberOfChannels: channels,
        duration: length / sampleRate,
        getChannelData: (channel) => data[channel],
      };
    },
    createGain: () => ({
      connect() {},
      disconnect() {},
      gain: {
        cancelScheduledValues() {},
        setValueAtTime() {},
        linearRampToValueAtTime() {},
      },
    }),
    createBufferSource() {
      return {
        buffer: null,
        loop: false,
        connect() {},
        disconnect() {},
        start(when, offset) {
          context.starts.push({ offset, loop: this.loop, buffer: this.buffer });
        },
        stop() {
          context.stops++;
        },
      };
    },
    async resume() {},
    async close() {
      context.closed = true;
    },
    async decodeAudioData() {
      return context.createBuffer(2, 200, 100);
    },
  };
  return context;
}

test("music loop blends stereo boundaries without changing the supplied recording", () => {
  const { crossfadeLoop } = sources()("lib/arcadeMusic");
  const context = fakeMusicContext();
  const input = context.createBuffer(2, 200, 100);
  for (let channel = 0; channel < 2; channel++)
    input
      .getChannelData(channel)
      .set(
        Array.from(
          { length: 200 },
          (_, frame) => (frame * (channel + 1)) / 200,
        ),
      );
  const original = input.getChannelData(0).slice();
  const output = crossfadeLoop(context, input);
  assert.equal(output.length, 185);
  assert.equal(output.numberOfChannels, 2);
  for (let channel = 0; channel < 2; channel++) {
    assert.equal(
      output.getChannelData(channel)[0],
      input.getChannelData(channel)[15],
    );
    assert.equal(
      output.getChannelData(channel)[184],
      input.getChannelData(channel)[14],
    );
  }
  assert.deepEqual(input.getChannelData(0), original);
});

test("music pauses at its current position, resumes, restarts cleanly and releases audio", async () => {
  const { ArcadeMusic } = sources()("lib/arcadeMusic");
  const context = fakeMusicContext();
  let loads = 0;
  const music = new ArcadeMusic(
    () => context,
    async () => {
      loads++;
      return new ArrayBuffer(0);
    },
  );
  await music.play();
  assert.equal(context.starts[0].offset, 0);
  assert.equal(context.starts[0].loop, true);
  context.currentTime = 0.6;
  music.pause();
  assert.equal(context.stops, 1);
  context.currentTime = 30;
  await music.play();
  assert.equal(context.starts[1].offset, 0.6);
  context.currentTime = 31;
  music.restart();
  await music.play();
  assert.equal(context.starts[2].offset, 0);
  assert.equal(loads, 1);
  music.dispose();
  assert.equal(context.closed, true);
  assert.equal(context.stops, 3);
  await music.play();
  assert.equal(context.starts.length, 3);
});

test("pausing or exiting while music loads prevents delayed playback", async () => {
  const { ArcadeMusic } = sources()("lib/arcadeMusic");
  for (const action of ["pause", "dispose"]) {
    const context = fakeMusicContext();
    let resolve;
    const music = new ArcadeMusic(
      () => context,
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const loading = music.play();
    music[action]();
    resolve(new ArrayBuffer(0));
    await loading;
    assert.equal(context.starts.length, 0);
    if (action === "pause") {
      await music.play();
      assert.equal(context.starts.length, 1);
      music.dispose();
    }
  }
});

test("music loading failure can be retried without a stale source", async () => {
  const { ArcadeMusic } = sources()("lib/arcadeMusic");
  const context = fakeMusicContext();
  let loads = 0;
  const music = new ArcadeMusic(
    () => context,
    async () => {
      if (++loads === 1) throw new Error("offline");
      return new ArrayBuffer(0);
    },
  );
  await assert.rejects(music.play(), /offline/);
  assert.equal(context.starts.length, 0);
  await music.play();
  assert.equal(context.starts.length, 1);
  music.dispose();
});

test("Eric grows at earned-star boundaries and keeps a bounded growth indicator", () => {
  const { ericGrowth } = sources()("lib/journey");
  assert.equal(ericGrowth(17).stage, "baby");
  assert.equal(ericGrowth(18).stage, "teen");
  assert.equal(ericGrowth(18).progress, 0);
  assert.equal(ericGrowth(44).remaining, 1);
  assert.equal(ericGrowth(45).stage, "adult");
  assert.equal(ericGrowth(78).progress, 100);
  assert.equal(ericGrowth(-1).progress, 0);
});

test("the journey follows the first unmastered lesson even when saved progress has gaps", () => {
  const load = sources();
  const { nextJourneyLesson, arcadeLandscape } = load("lib/journey");
  const { REGIONS } = load("lib/data/regions");
  assert.equal(nextJourneyLesson({}).lesson.id, 0);
  assert.equal(nextJourneyLesson({ 0: 3, 1: 2, 2: 3 }).lesson.id, 1);
  const complete = Object.fromEntries(
    REGIONS.flatMap((region) => region.lessons.map((lesson) => [lesson.id, 3])),
  );
  assert.equal(nextJourneyLesson(complete), null);
  assert.match(arcadeLandscape("toppen"), /mountains/);
  assert.match(arcadeLandscape("zee"), /coast/);
  assert.match(arcadeLandscape("grot"), /track/);
});

test('all four curricula use only taught, physically mapped keys', () => {
 const load=sources();
 const {DUTCH_REGIONS}=load('lib/data/regions');
 const {createCurriculum}=load('lib/data/courseCurriculum');
 const {keyGuidance}=load('lib/keyboards');
 for(const course of ['nl','be','de','ch']) {
  const learned=new Set();
  const problems=[];
  const regions=createCurriculum(DUTCH_REGIONS,course);
  assert.equal(regions.flatMap(r=>r.lessons).length,26);
  for(const lesson of regions.flatMap(r=>r.lessons)) {
   lesson.newKeys.forEach(k=>learned.add(k));
   assert.ok(lesson.exercises.length>=5,`${course} lesson ${lesson.id}: too few exercises`);
   for(const text of lesson.exercises)for(const char of text){
    if(!learned.has(char))problems.push(`${course} lesson ${lesson.id}: untaught ${char} in ${text}`);
    assert.ok(keyGuidance(char,course),`${course}: unmapped ${char}`);
   }
   if(course==='ch')assert.ok(!JSON.stringify(lesson).includes('ß'));
  }
  assert.deepEqual([...new Set(problems)],[]);
 }
});
test('Belgian AZERTY shift and distinct DE/CH keyboards match physical positions',()=>{
 const {KEYBOARDS,keyGuidance}=sources()('lib/keyboards');
 assert.equal(KEYBOARDS.be.rows[1].map(k=>k.key).join(''),'azertyuiop');
 assert.equal(KEYBOARDS.be.rows[2].map(k=>k.key).join(''),'qsdfghjklmù');
 assert.deepEqual(keyGuidance('.', 'be'),{key:';',finger:5,shift:true,shiftHand:'left'});
 assert.equal(keyGuidance('1','be').shift,true);
 assert.equal(keyGuidance('m','be').finger,7);
 assert.equal(keyGuidance('z','de').finger,4);
 assert.equal(keyGuidance('y','ch').finger,0);
 assert.ok(keyGuidance('ß','de'));
 assert.equal(keyGuidance('ß','ch'),undefined);
});

test('regional courses keep progress separate and their bonus targets use learned keys',()=>{
 const old=process.env.NEXT_PUBLIC_LETTORIA_COURSE;
 try {
  for(const course of ['nl','be','de','ch']){
   process.env.NEXT_PUBLIC_LETTORIA_COURSE=course;
   const load=sources();const {storageKey}=load('lib/course');
   assert.equal(storageKey('typen-met-eric-progress'),course==='nl'?'typen-met-eric-progress':`typen-met-eric-progress-${course}`);
   assert.equal(storageKey('lettoria-game-store'),course==='nl'?'lettoria-game-store':`lettoria-game-store-${course}`);
   const {REGIONS}=load('lib/data/regions');const {flightTargets,MAGIC_WORDS}=load('lib/magicFlight');const {arcadeCourse}=load('lib/arcadeFlight');
   const learned=new Set();for(const lesson of REGIONS.flatMap(r=>r.lessons)){
    lesson.newKeys.forEach(k=>learned.add(k));
    for(const target of flightTargets(lesson.id))for(const char of target)assert.ok(learned.has(char),`${course} magic target: ${target}`);
    assert.ok(arcadeCourse(lesson.id).keys.every(k=>learned.has(k)));
   }
   if(course==='de'||course==='ch'){assert.ok(MAGIC_WORDS.includes('wald'));assert.ok(!MAGIC_WORDS.includes('draak'));}
   const {t}=load('lib/i18n');
   if(course==='ch')assert.equal(t('Sluiten'),'Schliessen');
   if(course==='de')assert.equal(t('Sluiten'),'Schließen');
  }
 }finally{if(old===undefined)delete process.env.NEXT_PUBLIC_LETTORIA_COURSE;else process.env.NEXT_PUBLIC_LETTORIA_COURSE=old;}
});

test('analytics accepts bare regional home paths but never foreign or arbitrary paths',()=>{
 const {analyticsPagePath}=sources()('lib/analyticsPaths');
 for(const base of ['','/be','/de','/ch']){
  for(const suffix of ['/','/kaart','/les/0','/les/25/','/regio/woud'])assert.equal(analyticsPagePath(base+suffix,base),base+suffix);
  if(base)assert.equal(analyticsPagePath(base,base),base);
  for(const suffix of ['/les/26','/les/999','/secret','/kaart?name=Max','/kaart#private'])assert.equal(analyticsPagePath(base+suffix,base),null);
  if(base)assert.equal(analyticsPagePath('/other/kaart',base),null);
 }
});
test('regional page metadata points to corresponding pages, not Dutch or course home',()=>{
 const previous=process.env.NEXT_PUBLIC_LETTORIA_COURSE;
 try {
  for(const course of ['nl','be','de','ch']){
   process.env.NEXT_PUBLIC_LETTORIA_COURSE=course;
   const {coursePageMetadata}=sources()('lib/pageMetadata');
   const meta=coursePageMetadata('/privacy','Privacy & cookies');
   assert.equal(meta.alternates.canonical,`https://lettoria.nl${course==='nl'?'':`/${course}`}/privacy`);
   assert.equal(meta.openGraph.url,meta.alternates.canonical);
   assert.equal(meta.alternates.languages['de-CH'],'https://lettoria.nl/ch/privacy');
  }
 }finally{if(previous===undefined)delete process.env.NEXT_PUBLIC_LETTORIA_COURSE;else process.env.NEXT_PUBLIC_LETTORIA_COURSE=previous;}
});

test('every regional arcade target remains hittable and never needs a separate steering key', () => {
  const previous = process.env.NEXT_PUBLIC_LETTORIA_COURSE;
  try {
    for (const courseId of ['nl', 'be', 'de', 'ch']) {
      process.env.NEXT_PUBLIC_LETTORIA_COURSE = courseId;
      const load = sources();
      const { arcadeCourse, newArcade, advanceArcade, typeArcade, nextArcadeTarget } = load('lib/arcadeFlight');
      const { keyGuidance } = load('lib/keyboards');
      const { REGIONS } = load('lib/data/regions');
      for (const lesson of REGIONS.flatMap(region => region.lessons)) {
        const course = arcadeCourse(lesson.id);
        for (const [index, key] of course.keys.entries()) {
          assert.ok(keyGuidance(key), `${courseId}: ${key} has physical finger guidance`);
          let state = { ...newArcade(course, 1), nextSpawn: Infinity, objects: [
            { id: 1, lane: index % 3, kind: 'letter', challenge: index % 2 ? 'rock' : 'gem', depth: 0.2, key },
          ] };
          for (let i = 0; i < 150; i++) state = advanceArcade(state, 100, course);
          assert.equal(state.objects.length, 1, `${courseId}/${lesson.id}: ${key} must wait`);
          assert.equal(state.hits, 0);
          assert.equal(state.collected, 0);
          assert.equal(nextArcadeTarget(state.objects).key, key);
          const wrong = typeArcade(state, '§');
          assert.deepEqual(wrong.objects, state.objects);
          const hit = typeArcade(wrong, key);
          assert.equal(hit.hits, 1);
          assert.equal(hit.lane, index % 3);
          assert.equal(hit.objects.length, 0);
          assert.equal(hit.collected, index % 2 ? 0 : 1);
        }
      }
      const objects = [{ id: 3, lane: 0, kind: 'letter', challenge: 'gem', depth: 0.7, key: 'f' }, { id: 2, lane: 1, kind: 'letter', challenge: 'rock', depth: 0.1, key: 'j' }];
      assert.equal(nextArcadeTarget(objects).id, 2, 'the cue is stable rather than a reaction deadline');
      assert.deepEqual(objects.map(object => object.id), [3, 2]);
      assert.equal(nextArcadeTarget([]), undefined);
    }
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_LETTORIA_COURSE;
    else process.env.NEXT_PUBLIC_LETTORIA_COURSE = previous;
  }
});

test('bonus journeys preserve mastery and find the first reachable lesson in every course', () => {
  const previous = process.env.NEXT_PUBLIC_LETTORIA_COURSE;
  try {
    for (const course of ['nl', 'be', 'de', 'ch']) {
      process.env.NEXT_PUBLIC_LETTORIA_COURSE = course;
      const load = sources();
      const { REGIONS } = load('lib/data/regions');
      const { bonusJourney } = load('lib/journey');
      const { arcadeCourse, ARCADE_DURATION_MS, arcadeReward } = load('lib/arcadeFlight');
      const { storageKey } = load('lib/course');
      storage();
      const store = load('lib/stores/progressStore').useProgressStore;
      const lessons = REGIONS.flatMap(region => region.lessons);
      const complete = Object.fromEntries(lessons.map(lesson => [lesson.id, 3]));
      for (const lesson of lessons) {
        const journey = bonusJourney(lesson.id, {});
        assert.equal(journey.current.lessonId, lesson.id);
        assert.equal(journey.current.lessonNumber, lesson.id + 1);
        assert.equal(journey.current.title, lesson.title);
        assert.deepEqual(journey.current.focusKeys, lesson.newKeys);
        assert.equal(journey.currentMastered, false);
        assert.equal(arcadeCourse(lesson.id).title, lesson.title);
        assert.equal(bonusJourney(lesson.id, complete).suggested, null);
      }
      assert.equal(bonusJourney(0, {}).suggested.lessonId, 0);
      store.getState().completeLesson(0, 2);
      assert.equal(bonusJourney(0, store.getState().lessonStars).currentMastered, false);
      store.getState().completeLesson(0, 3);
      store.getState().completeLesson(0, 1);
      const retry = bonusJourney(0, store.getState().lessonStars);
      assert.equal(retry.currentMastered, true);
      assert.equal(retry.suggested.lessonId, 1);
      assert.equal(JSON.parse(localStorage.getItem(storageKey('typen-met-eric-progress'))).state.lessonStars[0], 3);
      assert.equal(bonusJourney(0, { 0: 3, 1: 3 }).suggested.lessonId, 2);
      assert.equal(bonusJourney(25, { ...complete, 7: 2 }).suggested.lessonId, 7);
      assert.equal(bonusJourney(25, { ...complete, 25: 2 }).currentMastered, false);
      assert.equal(bonusJourney(25, { ...complete, 25: 2 }).suggested.lessonId, 25);
      assert.deepEqual(bonusJourney(23, complete).current.focusKeys, []);
      assert.equal(bonusJourney(-1, complete), undefined);
      assert.equal(bonusJourney(999, complete), undefined);
      assert.equal(ARCADE_DURATION_MS, 75000);
      assert.equal(arcadeReward(999, true, 999), 26);
      assert.ok(arcadeCourse(5).travelMs < arcadeCourse(0).travelMs);
    }
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_LETTORIA_COURSE;
    else process.env.NEXT_PUBLIC_LETTORIA_COURSE = previous;
  }
});

test('every course teaches and exercises the full lowercase alphabet', () => {
  const previous = process.env.NEXT_PUBLIC_LETTORIA_COURSE;
  try {
    for (const course of ['nl', 'be', 'de', 'ch']) {
      process.env.NEXT_PUBLIC_LETTORIA_COURSE = course;
      const lessons = sources()('lib/data/regions').REGIONS.flatMap(region => region.lessons);
      const taught = new Set(lessons.flatMap(lesson => lesson.newKeys));
      const exercised = new Set(lessons.flatMap(lesson => lesson.exercises).join(''));
      const alphabet = 'abcdefghijklmnopqrstuvwxyz' + (course === 'de' ? 'äöüß' : course === 'ch' ? 'äöü' : '');
      for (const character of alphabet) {
        assert.ok(taught.has(character), `${course}: ${character} must be introduced`);
        assert.ok(exercised.has(character), `${course}: ${character} must be practiced`);
      }
      for (const lesson of lessons) {
        for (const character of lesson.newKeys) {
          assert.ok(lesson.exercises.some(text => text.includes(character)), `${course} lesson ${lesson.id}: new key ${character} needs direct practice`);
        }
      }
    }
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_LETTORIA_COURSE;
    else process.env.NEXT_PUBLIC_LETTORIA_COURSE = previous;
  }
});

test('structured practice preserves lessons and schedules three later retrievals for every introduced key', () => {
  const load = sources();
  const { DUTCH_REGIONS } = load('lib/data/regions');
  const { createCurriculum } = load('lib/data/courseCurriculum');
  const original = JSON.stringify(DUTCH_REGIONS);
  for (const course of ['nl', 'be', 'de', 'ch']) {
    const lessons = createCurriculum(DUTCH_REGIONS, course).flatMap(region => region.lessons);
    assert.deepEqual(lessons.map(lesson => lesson.id), Array.from({length: 26}, (_, id) => id));
    for (const [position, lesson] of lessons.entries()) {
      assert.equal(lesson.practiceSteps.length, lesson.exercises.length);
      if (lesson.newKeys.length) {
        assert.equal(lesson.practiceSteps[0].kind, 'movement');
        assert.equal(lesson.practiceSteps[1].kind, 'mix');
        for (const key of lesson.newKeys) {
          assert.ok(lesson.exercises[0].includes(key));
          assert.ok(lesson.exercises[1].includes(key));
          const later = lessons.slice(position + 1).filter(next => next.practiceSteps.some((step, i) =>
            step.kind === 'review' && step.reviewOf === lesson.id && next.exercises[i].includes(key)));
          assert.equal(later.length, 3, `${course} ${key}: three separate later lessons`);
        }
      }
      for (const [i, step] of lesson.practiceSteps.entries()) {
        if (step.kind === 'review') {
          assert.ok(step.reviewOf < lesson.id);
          assert.ok(lesson.exercises[i].length <= 100, `${course} lesson ${lesson.id}: short retrieval`);
        }
      }
    }
  }
  assert.equal(JSON.stringify(DUTCH_REGIONS), original, 'course construction must not modify base data');
});

test('retrieval uses real regional words and changes combinations without introducing unknown characters', () => {
  const { reviewText } = sources()('lib/data/practiceSequence');
  const de = new Set('abcdefghijklmnopqrstuvwxyzäöüß .,;0123456789');
  assert.equal(reviewText(['ß'], de, 'de'), 'die straße');
  assert.equal(reviewText(['ß'], de, 'de', 1), 'groß');
  assert.equal(reviewText(['q'], de, 'nl'), 'quiz');
  const early = new Set('fjq');
  assert.equal(reviewText(['q'], early, 'be'), 'qfqj');
  assert.equal(reviewText(['q'], early, 'be', 1), 'jqfq');
  assert.equal(reviewText([' '], new Set('fj '), 'nl'), 'f j');
});

test('personal practice uses only reachable taught keys and valid local counters in every course', () => {
  const load = sources();
  const { DUTCH_REGIONS } = load('lib/data/regions');
  const { createCurriculum } = load('lib/data/courseCurriculum');
  const { personalPractice } = load('lib/personalPractice');
  for (const course of ['nl', 'be', 'de', 'ch']) {
    const regions = createCurriculum(DUTCH_REGIONS, course), lessons = regions.flatMap(r => r.lessons);
    const learned = new Set(), stars = {};
    for (const lesson of lessons) {
      lesson.newKeys.forEach(key => learned.add(key));
      const stats = Object.fromEntries([...learned].map(key => [key, { attempts: 10, errors: 2 }]));
      stats['!'] = { attempts: 4, errors: 3 };
      const plan = personalPractice(stats, stars, lesson.id, regions, course);
      assert.ok(plan.keys.length > 0 && plan.keys.length <= 3);
      assert.equal(plan.exercises.length, 3);
      for (const text of plan.exercises) {
        assert.ok(text.length > 0 && text.length <= 100);
        for (const key of text) assert.ok(learned.has(key), `${course}/${lesson.id}: untaught ${key}`);
        for (const key of plan.keys) assert.ok(text.includes(key), `${course}/${lesson.id}: missing focus ${key}`);
      }
      stars[lesson.id] = 3;
    }
    const stats = {f:{attempts:10,errors:1},q:{attempts:100,errors:99},'!':{attempts:1,errors:1}};
    assert.deepEqual(personalPractice(stats, {25:3}, 0, regions, course).keys, ['f'], 'a late saved mastery must not skip a gap');
    assert.deepEqual(personalPractice({}, {}, 0, regions, course).exercises, []);
  }
});

test('personal practice freezes baselines, rejects invalid counters and accumulates attempts without stars', () => {
  storage();
  const load = sources(), { personalPractice, mergePracticeStats } = load('lib/personalPractice');
  const { REGIONS } = load('lib/data/regions');
  const stars = Object.fromEntries(REGIONS.flatMap(r=>r.lessons).map(l=>[l.id,3]));
  const stats = {q:{attempts:10,errors:8},x:{attempts:20,errors:4},y:{attempts:5,errors:0},f:{attempts:0,errors:1},j:{attempts:4,errors:5},a:{attempts:Infinity,errors:1},s:{attempts:2.5,errors:1},k:null};
  const plan = personalPractice(stats, stars);
  assert.deepEqual(plan.keys, ['q','x']);
  stats.q.errors = 9;
  assert.equal(plan.baseline.q.errors, 8);
  const first = {q:{attempts:4,errors:1}}, next = {q:{attempts:2,errors:0},x:{attempts:3,errors:1}};
  assert.deepEqual(mergePracticeStats(first,next), {q:{attempts:6,errors:1},x:{attempts:3,errors:1}});
  assert.deepEqual(first, {q:{attempts:4,errors:1}});
  const store = load('lib/stores/progressStore').useProgressStore;
  store.getState().completeLesson(0,3);
  const before = {...store.getState().lessonStars};
  store.getState().recordPractice(first);
  store.getState().recordPractice(next);
  assert.deepEqual(store.getState().lessonStars,before);
  assert.equal(store.getState().totalStars,3);
  assert.deepEqual(store.getState().keyStats.q,{attempts:6,errors:1});
  const stored = JSON.parse(localStorage.getItem('typen-met-eric-progress')).state;
  assert.deepEqual(stored.keyStats.q,{attempts:6,errors:1});
  assert.equal('typedChars' in stored,false);
  assert.equal('targetText' in stored,false);
});

test('the final lesson ends with a complete Eric story covering every lowercase letter and digit in all courses', () => {
  const load = sources();
  const { DUTCH_REGIONS } = load('lib/data/regions');
  const { createCurriculum } = load('lib/data/courseCurriculum');
  const { finalStory } = load('lib/data/finalStory');
  for (const course of ['nl','be','de','ch']) {
    const lessons = createCurriculum(DUTCH_REGIONS,course).flatMap(r=>r.lessons);
    const last = lessons.at(-1), story = finalStory(course);
    assert.deepEqual(last.exercises.slice(-story.length),story);
    assert.ok(last.practiceSteps.slice(-story.length).every(step=>step.kind==='story'));
    assert.ok(last.practiceSteps.slice(0,-story.length).every(step=>step.kind==='review'));
    const text=story.join(' '), alphabet='abcdefghijklmnopqrstuvwxyz0123456789'+(course==='de'?'äöüß':course==='ch'?'äöü':'');
    for (const key of alphabet) assert.ok(text.toLowerCase().includes(key),`${course}: story missing ${key}`);
    assert.ok(story.every(part=>part.length<=100));
    assert.ok(text.includes('Eric'));
    if (course==='ch') assert.ok(!text.includes('ß'));
  }
});

test('uppercase lessons introduce opposite-hand Shift before names and the final story', () => {
 const load=sources(), {DUTCH_REGIONS}=load('lib/data/regions'),{createCurriculum}=load('lib/data/courseCurriculum'),{keyGuidance}=load('lib/keyboards');
 for (const course of ['nl','be','de','ch']) {
  const lessons=createCurriculum(DUTCH_REGIONS,course).flatMap(r=>r.lessons);
  const caps=lessons.flatMap(l=>l.newKeys).filter(key=>/^[A-ZÄÖÜ]$/.test(key));
  for(const key of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')assert.ok(caps.includes(key),`${course}: missing uppercase ${key}`);
  for(const key of lessons[19].newKeys){const help=keyGuidance(key,course);assert.equal(help.shiftHand,'left');assert.ok(help.finger>=4);}
  for(const key of lessons[20].newKeys){const help=keyGuidance(key,course);assert.equal(help.shiftHand,'right');assert.ok(help.finger<=3);}
  assert.ok(lessons.slice(0,19).every(l=>l.newKeys.every(key=>!/^[A-ZÄÖÜ]$/.test(key))));
  if(course==='de'||course==='ch')assert.deepEqual(lessons[21].newKeys,['Ä','Ö','Ü']);
  for(const key of 'ÄÖÜ') {
   const help=keyGuidance(key,course);
   if(course==='ch'){assert.equal(help.capsLock,true);assert.equal(help.shift,false);assert.equal(help.shiftHand,null);}
   if(course==='de'){assert.equal(help.shift,true);assert.equal(help.shiftHand,'left');}
  }
 }
});
