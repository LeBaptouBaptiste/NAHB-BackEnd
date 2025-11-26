
import mongoose from 'mongoose';
import { Story } from '../src/models/mongoose/Story';
import { Page } from '../src/models/mongoose/Page';
import User from '../src/models/sequelize/User';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/nahb';

const ASSET_BASE_URL = 'http://localhost:5000/uploads';

const storyData = {
    title: "L'Éveil dans les Ténèbres",
    description: "Une aventure interactive avec lancés de dés. Tu te réveilles dans une cellule sombre...",
    imageUrl: `${ASSET_BASE_URL}/cellule.png`,
    theme: 'Dark Fantasy',
    tags: ['fantasy', 'dark', 'interactive', 'rpg'],
    status: 'published',
    stats: { views: 0, completions: 0, endings: {} }
};

const pagesData = [
    {
        id: 1,
        content: `Tu te réveilles dans une **cellule** sombre et humide. Tes poignets sont engourdis, ton crâne résonne comme une cloche fêlée. Pas de souvenirs. Pas de réponses. Juste le froid mordant des pierres et une arme qui gît à tes pieds...

**Qui es-tu ?**`,
        image: `${ASSET_BASE_URL}/cellule.png`,
        choices: [
            { text: "🗡️ [GUERRIER] (Épée rouillée, +3 Combat, -2 Fuite)", targetPageId: 2 },
            { text: "🔮 [MAGE] (Bâton, +1 Combat, +1 Fuite)", targetPageId: 2 },
            { text: "🗡️🗡️ [ASSASSIN] (Dagues, +1 Combat, +4 Fuite)", targetPageId: 2 }
        ]
    },
    {
        id: 2,
        content: `La porte de ta cellule est entrouverte. Un **couloir** humide s'étend devant toi, éclairé par une torche vacillante. Des marches descendent dans les ténèbres. L'air sent le moisi et quelque chose de plus... inquiétant.`,
        image: `${ASSET_BASE_URL}/cellule.png`,
        choices: [
            { text: "Descendre les escaliers", targetPageId: 3 },
            { text: "Fouiller la cellule", targetPageId: 4 },
            { text: "Crier pour attirer l'attention", targetPageId: 5 },
            { text: "[ASSASSIN] Chercher un passage secret (1d20 ≥ 12)", targetPageId: 4, diceRoll: { enabled: true, difficulty: 12, type: 'custom', failurePageId: 2 } }, // Special handling needed for failure staying on page 2? Or maybe targetPageId is success, failurePageId is failure. 
            // Wait, failure stays on page 2. So failurePageId should be 2.
            // But wait, the choice text implies the roll.
            { text: "[MAGE] Lancer une boule de feu", targetPageId: 999 }, // Game Over
            { text: "[GUERRIER] Défoncer le mur", targetPageId: 2 } // Flavor text failure
        ],
        hotspots: [
            // Assassin secret passage search as a hotspot on the wall
            {
                x: 80, y: 20, width: 10, height: 20,
                label: "Mur suspect",
                diceRoll: { enabled: true, difficulty: 12, type: 'custom', failurePageId: 2 },
                targetPageId: '4bis' // We need to handle 4bis
            }
        ]
    },
    {
        id: 3,
        content: `Tu descends prudemment. Les marches de pierre grincent sous ton poids. Un grondement sourd résonne depuis les profondeurs. Une chaleur étouffante monte vers toi. Ça sent... le soufre. Et la viande grillée.`,
        image: `${ASSET_BASE_URL}/escalier.png`,
        choices: [
            { text: "Continuer la descente", targetPageId: 6 },
            { text: "Remonter", targetPageId: 2 },
            { text: "Avancer discrètement", targetPageId: 7 },
            { text: "[GUERRIER] Hurler un cri de guerre", targetPageId: 998 }, // Game Over
            { text: "[ASSASSIN] Marcher sur les murs", targetPageId: 999 }, // Game Over
            { text: "[MAGE] Utiliser Lévitation", targetPageId: 7 }
        ]
    },
    {
        id: 4,
        content: `Tu retournes la cellule de fond en comble. Sous la paille pourrie, tu trouves :
- 🧪 **Une potion de vigueur**
- 🧿 **Un médaillon en bronze**
- 🪨 **Un caillou inutile**`,
        image: `${ASSET_BASE_URL}/items.png`,
        choices: [
            { text: "Prendre la potion", targetPageId: 2 },
            { text: "Prendre le médaillon", targetPageId: 2 },
            { text: "Prendre tout", targetPageId: 2 },
            { text: "Boire la potion", targetPageId: 999 },
            { text: "[MAGE] Analyser le médaillon", targetPageId: 8 },
            { text: "[ASSASSIN] Cacher la potion", targetPageId: 2 },
            { text: "[GUERRIER] Casser le médaillon", targetPageId: 999 }
        ]
    },
    {
        id: '4bis', // Passage secret
        content: `Tu trouves une fissure dans le mur qui mène directement à la salle des objets, mais par un accès dérobé qui te permet de voir des choses cachées.`,
        image: `${ASSET_BASE_URL}/items.png`,
        choices: [
            { text: "Prendre tout discrètement", targetPageId: 2 }
        ]
    },
    {
        id: 5,
        content: `Tu hurles. Un rugissement te répond. Une **ombre** massive fonce sur toi.`,
        image: `${ASSET_BASE_URL}/ombre.png`,
        choices: [
            { text: "Courir vers l'escalier", targetPageId: 3 },
            { text: "Rester et combattre [COMBAT] (Diff 15)", targetPageId: 3, diceRoll: { enabled: true, difficulty: 15, type: 'combat', failurePageId: 999 } },
            { text: "Fuir par le couloir [FUITE] (Diff 12)", targetPageId: 2, diceRoll: { enabled: true, difficulty: 12, type: 'flee', failurePageId: 999 } }
        ]
    },
    {
        id: 6,
        content: `Salle du Dragon. Un **dragon rouge colossal** te fixe. "Encore un..."`,
        image: `${ASSET_BASE_URL}/dragon.png`,
        choices: [
            { text: "Attaquer directement", targetPageId: 998 },
            { text: "Parler avec le dragon", targetPageId: 9 },
            { text: "Chercher une issue", targetPageId: 10 },
            { text: "Utiliser le médaillon", targetPageId: 11 },
            { text: "[GUERRIER] Crier pour intimider", targetPageId: 998 },
            { text: "[MAGE] Sort offensif", targetPageId: 12 },
            { text: "[ASSASSIN] Backstab furtif", targetPageId: 998 }
        ]
    },
    {
        id: 7,
        content: `Tu descends discrètement. Le dragon dort à moitié.`,
        image: `${ASSET_BASE_URL}/dragon.png`,
        choices: [
            { text: "Continuer d'observer", targetPageId: 13 },
            { text: "Frapper maintenant", targetPageId: 998 },
            { text: "Chercher un point faible", targetPageId: 14 },
            { text: "[ASSASSIN] Analyser mouvements (1d20+2 ≥ 14)", targetPageId: 14, diceRoll: { enabled: true, difficulty: 14, type: 'custom', failurePageId: 13 } },
            { text: "[MAGE] Vision magique", targetPageId: 15 },
            { text: "[GUERRIER] Retenir souffle", targetPageId: 999 }
        ],
        hotspots: [
            {
                x: 50, y: 50, width: 20, height: 20,
                label: "Dragon endormi",
                targetPageId: 13
            }
        ]
    },
    {
        id: 8,
        content: `Le médaillon pulse. "Utilise-moi contre le feu..."`,
        image: `${ASSET_BASE_URL}/items.png`,
        choices: [
            { text: "Le porter", targetPageId: 2 },
            { text: "Le jeter", targetPageId: 999 }
        ]
    },
    {
        id: 9,
        content: `Dragon: "Pourquoi n'es-tu pas en train de fuir ?"`,
        image: `${ASSET_BASE_URL}/dragon.png`,
        choices: [
            { text: "Je cherche la sortie", targetPageId: 10 },
            { text: "Je veux combattre honorablement", targetPageId: 998 },
            { text: "J'ai des questions", targetPageId: 16 },
            { text: "[MAGE] Négocier un pacte", targetPageId: 17 },
            { text: "[GUERRIER] Bras de fer", targetPageId: 998 },
            { text: "[ASSASSIN] Où est le trésor ?", targetPageId: 18 }
        ]
    },
    {
        id: 10,
        content: `Le dragon t'indique deux portes. Gauche (chaud), Droite (frais).`,
        image: `${ASSET_BASE_URL}/couloir.png`,
        choices: [
            { text: "Prendre à gauche (Chaud)", targetPageId: 19 },
            { text: "Prendre à droite (Frais)", targetPageId: 20 },
            { text: "Retourner négocier", targetPageId: 9 }
        ]
    },
    {
        id: 11,
        content: `Le médaillon aveugle le dragon ! Il te laisse passer.`,
        image: `${ASSET_BASE_URL}/dragon.png`,
        choices: [
            { text: "Passer", targetPageId: 10 }
        ]
    },
    {
        id: 12,
        content: `Duel Magique !`,
        image: `${ASSET_BASE_URL}/dragon.png`,
        choices: [
            { text: "Lancer le sort [COMBAT MAGIQUE] (Diff 18)", targetPageId: 21, diceRoll: { enabled: true, difficulty: 18, type: 'combat', failurePageId: 998 } }
        ]
    },
    {
        id: 13,
        content: `Tu observes le dragon. Trésor derrière lui. Cicatrice sous l'aile.`,
        image: `${ASSET_BASE_URL}/dragon.png`,
        choices: [
            { text: "Voler du trésor [FUITE] (Diff 16)", targetPageId: 21, diceRoll: { enabled: true, difficulty: 16, type: 'flee', failurePageId: 998 } },
            { text: "Frapper la cicatrice", targetPageId: 14 },
            { text: "Se retirer", targetPageId: 3 }
        ],
        hotspots: [
            {
                x: 60, y: 60, width: 10, height: 10,
                label: "Cicatrice",
                targetPageId: 14
            },
            {
                x: 80, y: 80, width: 15, height: 15,
                label: "Trésor",
                diceRoll: { enabled: true, difficulty: 16, type: 'flee', failurePageId: 998 },
                targetPageId: 21
            }
        ]
    },
    {
        id: 14,
        content: `Tu vises la cicatrice sous l'aile gauche !`,
        image: `${ASSET_BASE_URL}/dragon.png`,
        choices: [
            { text: "Attaque Précise [COMBAT] (Diff 16)", targetPageId: 21, diceRoll: { enabled: true, difficulty: 16, type: 'combat', failurePageId: 998 } }
        ]
    },
    {
        id: 15,
        content: `Le dragon est enchaîné par magie !`,
        image: `${ASSET_BASE_URL}/dragon.png`,
        choices: [
            { text: "Briser la chaîne", targetPageId: 21 },
            { text: "Attaquer le dragon affaibli", targetPageId: 14 }
        ]
    },
    {
        id: 16,
        content: `Dragon: "Pose tes questions."`,
        image: `${ASSET_BASE_URL}/dragon.png`,
        choices: [
            { text: "Comment sortir ?", targetPageId: 10 },
            { text: "Pourquoi ce trésor ?", targetPageId: '17bis' },
            { text: "Qui es-tu ?", targetPageId: '17bis' }
        ]
    },
    {
        id: 17,
        content: `Pacte avec le dragon.`,
        image: `${ASSET_BASE_URL}/dragon.png`,
        choices: [
            { text: "Persuader [PERSUASION] (Diff 14)", targetPageId: 22, diceRoll: { enabled: true, difficulty: 14, type: 'persuasion', failurePageId: 9 } }
        ]
    },
    {
        id: '17bis',
        content: `Le dragon raconte son histoire millénaire... C'est fascinant mais long.`,
        image: `${ASSET_BASE_URL}/dragon.png`,
        choices: [
            { text: "Retour aux questions", targetPageId: 16 },
            { text: "Partir", targetPageId: 10 }
        ]
    },
    {
        id: 18,
        content: `Dragon: "Mon trésor ? Derrière moi."`,
        image: `${ASSET_BASE_URL}/dragon.png`,
        choices: [
            { text: "Voler discrètement", targetPageId: 13 },
            { text: "Négocier un partage (1d20 ≥ 15)", targetPageId: 21, diceRoll: { enabled: true, difficulty: 15, type: 'persuasion', failurePageId: 9 } }
        ]
    },
    {
        id: 19,
        content: `Chambre de lave. Il fait trop chaud ici ! Tu dois faire demi-tour.`,
        image: `${ASSET_BASE_URL}/gameoverdragon.png`, // Placeholder
        choices: [
            { text: "Retour", targetPageId: 10 }
        ]
    },
    {
        id: 20,
        content: `Salle du Coffre. Un coffre magnifique trône au centre.`,
        image: `${ASSET_BASE_URL}/coffre.png`,
        choices: [
            { text: "Ouvrir le coffre", targetPageId: '20bis' },
            { text: "[ASSASSIN] Examiner le coffre (1d20 ≥ 13)", targetPageId: '20bis', diceRoll: { enabled: true, difficulty: 13, type: 'custom', failurePageId: 20 } },
            { text: "Frapper le coffre", targetPageId: '20bis' },
            { text: "Ignorer et passer", targetPageId: 10 }
        ],
        hotspots: [
            {
                x: 45, y: 45, width: 10, height: 10,
                label: "Serrure étrange",
                diceRoll: { enabled: true, difficulty: 13, type: 'custom', failurePageId: 20 },
                targetPageId: '20bis'
            }
        ]
    },
    {
        id: '20bis',
        content: `C'est un MIMIC ! Une gueule pleine de crocs !`,
        image: `${ASSET_BASE_URL}/mimic.png`,
        choices: [
            { text: "COMBATTRE [COMBAT] (Diff 14)", targetPageId: 21, diceRoll: { enabled: true, difficulty: 14, type: 'combat', failurePageId: 999 } },
            { text: "FUIR [FUITE] (Diff 10)", targetPageId: 10, diceRoll: { enabled: true, difficulty: 10, type: 'flee', failurePageId: 10 } } // Failure leads to 10 with damage, but for simplicity just 10
        ]
    },
    {
        id: 21,
        content: `🎉 VICTOIRE ! Tu as obtenu le trésor !`,
        image: `${ASSET_BASE_URL}/coffre.png`,
        isEnding: true,
        endingType: 'success',
        choices: []
    },
    {
        id: 22,
        content: `🎉 VICTOIRE ! Alliance avec le Dragon !`,
        image: `${ASSET_BASE_URL}/dragon.png`,
        isEnding: true,
        endingType: 'success',
        choices: []
    },
    {
        id: 998,
        content: `💀 GAME OVER - Tu as été carbonisé ou dévoré par le dragon.`,
        image: `${ASSET_BASE_URL}/gameoverdragon.png`,
        isEnding: true,
        endingType: 'failure',
        choices: []
    },
    {
        id: 999,
        content: `💀 GAME OVER - Tu es mort.`,
        image: `${ASSET_BASE_URL}/gameovergeneriuqe.png`,
        isEnding: true,
        endingType: 'failure',
        choices: []
    }
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Find author (admin)
        // For simplicity, let's create a dummy user or find one
        // Since we are in a script, we might not have Sequelize setup easily if it depends on other things
        // But we imported User from sequelize model. Let's hope it works.
        // Actually, let's just use a fake ID string for authorId since Mongo doesn't enforce relation to SQL
        const authorId = "1"; // Assuming user ID 1 exists or is valid enough

        // Create Story
        const story = await Story.create({
            ...storyData,
            authorId
        });
        console.log('Story created:', story._id);

        // Map internal IDs to Mongo IDs
        const idMap: Record<string | number, string> = {};

        // 1. Create all pages first to get IDs
        for (const p of pagesData) {
            const page = await Page.create({
                storyId: story._id.toString(),
                content: p.content,
                image: p.image,
                isEnding: !!p.isEnding,
                endingType: p.endingType,
                choices: [], // Fill later
                hotspots: [] // Fill later
            });
            idMap[p.id] = page._id.toString();
            console.log(`Created page ${p.id} -> ${page._id}`);
        }

        // 2. Update pages with choices and hotspots linked to real IDs
        for (const p of pagesData) {
            const realId = idMap[p.id];
            const choices = p.choices.map(c => ({
                text: c.text,
                targetPageId: idMap[c.targetPageId],
                diceRoll: c.diceRoll ? {
                    ...c.diceRoll,
                    failurePageId: c.diceRoll.failurePageId ? idMap[c.diceRoll.failurePageId] : undefined
                } : undefined
            }));

            const hotspots = p.hotspots ? p.hotspots.map(h => ({
                ...h,
                targetPageId: idMap[h.targetPageId],
                diceRoll: h.diceRoll ? {
                    ...h.diceRoll,
                    failurePageId: h.diceRoll.failurePageId ? idMap[h.diceRoll.failurePageId] : undefined
                } : undefined
            })) : [];

            await Page.findByIdAndUpdate(realId, { choices, hotspots });
        }

        // Set start page
        story.startPageId = idMap[1];
        await story.save();

        console.log('Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();
