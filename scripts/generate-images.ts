/**
 * Image Generation Script for Typen met Eric
 * Uses Google Gemini/Imagen API to generate consistent watercolor storybook images
 */

const fs = require('fs');
const path = require('path');

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-3-pro-image-preview'; // Imagen 3 via Gemini

interface ImagePrompt {
  filename: string;
  folder: string;
  prompt: string;
}

// Eric character images needed
const ERIC_IMAGES: ImagePrompt[] = [
  {
    filename: 'eric-typing.png',
    folder: 'public/images/eric',
    prompt: 'Watercolor illustration of a small friendly green dragon, Eric, sitting at a magical glowing keyboard, typing with his small claws, looking focused and happy. White background. Storybook style, soft colors.',
  },
  {
    filename: 'eric-baby.png',
    folder: 'public/images/eric',
    prompt: 'Watercolor illustration of a tiny baby green dragon, Eric as a hatchling, with oversized cute eyes and very small wings, looking curious and adorable. White background. Storybook style, soft colors.',
  },
  {
    filename: 'eric-teen.png',
    folder: 'public/images/eric',
    prompt: 'Watercolor illustration of a young teenage green dragon, Eric, with medium-sized growing wings, looking confident and learning to breathe small flames. White background. Storybook style, soft colors.',
  },
];

// Story illustrations for lessons
const STORY_IMAGES: ImagePrompt[] = [
  // Lesson 0 - Eric sad in his cave
  {
    filename: 'lesson_0_eric_cave.png',
    folder: 'public/images/stories',
    prompt: 'Watercolor illustration of a small sad green dragon sitting alone in a dark cave, looking weak and powerless, magical sparkles fading around him. Storybook style, soft colors, melancholic mood.',
  },
  // Lesson 1 - Grey village with baker and nightwatchman
  {
    filename: 'lesson_1_grey_village.png',
    folder: 'public/images/stories',
    prompt: 'Watercolor illustration of a small medieval village that has lost its colors, everything grey and dull, a bakery with a cold oven, a watchman with a dim lantern. Storybook style, muted grey tones.',
  },
  // Lesson 2 - Blacksmith and lantern maker
  {
    filename: 'lesson_2_blacksmith.png',
    folder: 'public/images/stories',
    prompt: 'Watercolor illustration of a medieval blacksmith at his forge with hammers and anvil, and a lantern maker crafting beautiful lanterns, warm orange glow returning. Storybook style, soft colors.',
  },
  // Lesson 3 - Doctor and clockmaker
  {
    filename: 'lesson_3_doctor_clock.png',
    folder: 'public/images/stories',
    prompt: 'Watercolor illustration of a friendly village doctor with his medicine bag and a clockmaker working on a large clock tower, gears and time pieces around. Storybook style, soft colors.',
  },
  // Lesson 4 - Fisherman and jeweler
  {
    filename: 'lesson_4_fisherman.png',
    folder: 'public/images/stories',
    prompt: 'Watercolor illustration of a fisherman casting his net by a river and a jeweler polishing gemstones at his workbench, sparkling gems and silvery fish. Storybook style, soft colors.',
  },
  // Lesson 5 - Marketplace
  {
    filename: 'lesson_5_marketplace.png',
    folder: 'public/images/stories',
    prompt: 'Watercolor illustration of a medieval marketplace coming back to life with colorful stalls, happy villagers trading goods, warm sunlight. Storybook style, soft colors.',
  },
  // Lesson 6 - Farmer and Beekeeper (Velden)
  {
    filename: 'lesson_6_farmer.png',
    folder: 'public/images/stories',
    prompt: 'Watercolor illustration of golden wheat fields with a friendly farmer harvesting and a beekeeper tending to beehives, bees buzzing happily. Storybook style, soft colors.',
  },
  // Lesson 7 - Miller and Owl (Velden)
  {
    filename: 'lesson_7_miller.png',
    folder: 'public/images/stories',
    prompt: 'Watercolor illustration of an old windmill with spinning sails and a wise owl perched nearby, magical wind swirling around. Storybook style, soft colors.',
  },
  // Woud lessons
  {
    filename: 'lesson_woud_intro.png',
    folder: 'public/images/stories',
    prompt: 'Watercolor illustration of a mysterious whispering forest with tall ancient trees, soft magical mist, and glowing fireflies. Storybook style, soft colors.',
  },
  {
    filename: 'lesson_9_witch.png',
    folder: 'public/images/stories',
    prompt: 'Watercolor illustration of a friendly witch brewing potions in a forest cottage and a graceful forest nymph dancing among flowers. Storybook style, soft colors.',
  },
  {
    filename: 'lesson_10_centaur.png',
    folder: 'public/images/stories',
    prompt: 'Watercolor illustration of a noble centaur guardian and a clever red fox in an enchanted forest clearing. Storybook style, soft colors.',
  },
  {
    filename: 'lesson_11_bear.png',
    folder: 'public/images/stories',
    prompt: 'Watercolor illustration of a large friendly brown bear awakening from sleep in a magical forest, stretching and yawning. Storybook style, soft colors.',
  },
  // Toppen lessons
  {
    filename: 'lesson_toppen_intro.png',
    folder: 'public/images/stories',
    prompt: 'Watercolor illustration of majestic snow-capped mountains with a winding path leading to the peaks, magical northern lights in the sky. Storybook style, soft colors.',
  },
  {
    filename: 'lesson_13_crystal.png',
    folder: 'public/images/stories',
    prompt: 'Watercolor illustration of a magical crystal cave inside a mountain, with glowing purple and blue crystals and ancient number symbols. Storybook style, soft colors.',
  },
  {
    filename: 'lesson_14_clouds.png',
    folder: 'public/images/stories',
    prompt: 'Watercolor illustration of a magical path made of clouds high above mountains, with floating numbers and a golden gate. Storybook style, soft colors.',
  },
  {
    filename: 'lesson_15_summit.png',
    folder: 'public/images/stories',
    prompt: 'Watercolor illustration of a triumphant view from a mountain summit, with all numbers 0-9 glowing in the sky like constellations. Storybook style, soft colors.',
  },
  // Zee lessons
  {
    filename: 'lesson_zee_intro.png',
    folder: 'public/images/stories',
    prompt: 'Watercolor illustration of a sparkling magical sea with a small sailing ship, friendly dolphins jumping, and a lighthouse in the distance. Storybook style, soft colors.',
  },
  {
    filename: 'lesson_17_dolphins.png',
    folder: 'public/images/stories',
    prompt: 'Watercolor illustration of playful dolphins racing alongside a sailing ship on a sparkling blue sea. Storybook style, soft colors.',
  },
  {
    filename: 'lesson_18_treasure.png',
    folder: 'public/images/stories',
    prompt: 'Watercolor illustration of an old treasure map with a glowing X mark and a treasure chest full of colorful gems on a beach. Storybook style, soft colors.',
  },
  {
    filename: 'lesson_19_storm.png',
    folder: 'public/images/stories',
    prompt: 'Watercolor illustration of a brave sailing ship navigating through a dramatic storm with lightning, then emerging into calm sunny waters. Storybook style, soft colors.',
  },
  // Kasteel lessons
  {
    filename: 'lesson_kasteel_intro.png',
    folder: 'public/images/stories',
    prompt: 'Watercolor illustration of a grand magical castle with tall spires, colorful banners flying, surrounded by a beautiful garden. Storybook style, soft colors.',
  },
  {
    filename: 'lesson_21_knights.png',
    folder: 'public/images/stories',
    prompt: 'Watercolor illustration of a grand knight hall with suits of armor, flaming torches, and colorful banners with letter symbols. Storybook style, soft colors.',
  },
  {
    filename: 'lesson_22_throne.png',
    folder: 'public/images/stories',
    prompt: 'Watercolor illustration of a majestic throne room with a golden throne, a transformed powerful green dragon breathing magical fire, and celebrating characters. Storybook style, soft colors.',
  },
];

async function generateImageWithGemini(prompt: string): Promise<Buffer | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': API_KEY!,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error);
      return null;
    }

    const data = await response.json();

    // Find image part in response
    if (data.candidates && data.candidates[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData?.mimeType?.startsWith('image/')) {
          return Buffer.from(part.inlineData.data, 'base64');
        }
      }
    }

    console.error('No image in response:', JSON.stringify(data, null, 2));
    return null;
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
}

async function generateAllImages() {
  const allPrompts = [...ERIC_IMAGES, ...STORY_IMAGES];

  console.log(`\n🎨 Generating ${allPrompts.length} images...\n`);

  for (const item of allPrompts) {
    const outputPath = path.join(process.cwd(), item.folder, item.filename);

    // Skip if file already exists
    if (fs.existsSync(outputPath)) {
      console.log(`⏭️  Skipping ${item.filename} (already exists)`);
      continue;
    }

    console.log(`🖼️  Generating: ${item.filename}`);
    console.log(`   Prompt: ${item.prompt.substring(0, 60)}...`);

    const imageBuffer = await generateImageWithGemini(item.prompt);

    if (imageBuffer) {
      // Ensure directory exists
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, imageBuffer);
      console.log(`   ✅ Saved to ${outputPath}\n`);
    } else {
      console.log(`   ❌ Failed to generate\n`);
    }

    // Rate limiting - wait between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n✨ Done!\n');
}

// List prompts without generating
function listPrompts() {
  console.log('\n📋 Image prompts to generate:\n');
  console.log('=== ERIC IMAGES ===');
  ERIC_IMAGES.forEach(img => {
    console.log(`\n${img.filename}:`);
    console.log(`  ${img.prompt}`);
  });
  console.log('\n=== STORY IMAGES ===');
  STORY_IMAGES.forEach(img => {
    console.log(`\n${img.filename}:`);
    console.log(`  ${img.prompt}`);
  });
}

// Main
const args = process.argv.slice(2);
if (args.includes('--list')) {
  listPrompts();
} else if (args.includes('--generate')) {
  if (!API_KEY) {
    console.error('❌ GEMINI_API_KEY not set. Run with: GEMINI_API_KEY=xxx npx ts-node scripts/generate-images.ts --generate');
    process.exit(1);
  }
  generateAllImages();
} else {
  console.log('Usage:');
  console.log('  npx ts-node scripts/generate-images.ts --list      # List all prompts');
  console.log('  npx ts-node scripts/generate-images.ts --generate  # Generate images');
}
