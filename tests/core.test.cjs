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
    if (!path.extname(file)) file += ".ts";
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
      objects: [{ id: i + 1, lane: 1, kind: "letter", depth: 0.7, key: "f" }],
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
test("arcade collisions respect lane, invulnerability, turbo and single crossing", () => {
  const { arcadeCourse, newArcade, advanceArcade } =
    sources()("lib/arcadeFlight");
  const course = arcadeCourse(0);
  let state = {
    ...newArcade(course, 1),
    nextSpawn: 99999,
    objects: [
      { id: 1, lane: 1, kind: "rock", depth: 0.85 },
      { id: 2, lane: 0, kind: "rock", depth: 0.85 },
      { id: 3, lane: 1, kind: "gem", depth: 0.85 },
    ],
  };
  const crossed = advanceArcade(state, 100, course);
  assert.equal(crossed.hearts, 2);
  assert.equal(crossed.collected, 1);
  assert.equal(crossed.score, 25);
  assert.equal(advanceArcade(crossed, 100, course).hearts, 2);
  assert.equal(
    advanceArcade({ ...state, turboUntil: 5000 }, 100, course).hearts,
    3,
  );
  assert.equal(
    advanceArcade({ ...state, invulnerableUntil: 5000 }, 100, course).hearts,
    3,
  );
});
test("arcade round ends, spawned targets stay unique and bounded, state advances only when ticked", () => {
  const { arcadeCourse, newArcade, advanceArcade, ARCADE_DURATION_MS } =
    sources()("lib/arcadeFlight");
  const course = arcadeCourse(2);
  let state = newArcade(course, 4);
  for (let i = 0; i < 750; i++) {
    // Preserve lives to verify the full clock and all waves independently of survival.
    state = advanceArcade(
      { ...state, hearts: 3, invulnerableUntil: 999999 },
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
