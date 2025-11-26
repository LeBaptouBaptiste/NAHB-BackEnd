"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const Story_1 = require("../models/mongoose/Story");
const Page_1 = require("../models/mongoose/Page");
const mongo_1 = require("../config/mongo");
dotenv_1.default.config();
const ASSET_BASE = '/RPGAssets/';
async function seedMainStory() {
    try {
        await (0, mongo_1.connectMongo)();
        console.log('🌱 Starting story seed...');
        // Check if story already exists
        const existingStory = await Story_1.Story.findOne({ title: "L'Éveil dans les Ténèbres" });
        if (existingStory) {
            console.log('⚠️  Story already exists. Deleting old version...');
            await Page_1.Page.deleteMany({ storyId: existingStory._id });
            await Story_1.Story.deleteOne({ _id: existingStory._id });
        }
        // Create the main story
        const story = await Story_1.Story.create({
            title: "L'Éveil dans les Ténèbres",
            description: "Une aventure interactive avec système de dés et choix de classe. Incarnez un Guerrier, un Mage ou un Assassin dans un donjon rempli de dangers mortels.",
            tags: ['fantasy', 'rpg', 'interactive', 'dice-based', 'dungeon', 'dragon'],
            status: 'published',
            authorId: 'system',
            theme: 'dark-fantasy-dungeon',
            stats: {
                views: 0,
                completions: 0,
                endings: {}
            }
        });
        console.log('✅ Story created:', story.title);
        // Create all pages
        const pages = [];
        // ==================== PAGE 1: Class Selection ====================
        const page1 = await Page_1.Page.create({
            storyId: story._id,
            content: `Tu te réveilles dans une **cellule** sombre et humide. Tes poignets sont engourdis, ton crâne résonne comme une cloche fêlée. Pas de souvenirs. Pas de réponses. Juste le froid mordant des pierres et une arme qui gît à tes pieds...

**Qui es-tu ?**

🗡️ **GUERRIER** - Épée rouillée | Bonus Combat: +3 | Malus Fuite: -2 | Compétence: *Rage du Guerrier*

🔮 **MAGE** - Bâton brûlé | Bonus Combat: +1 | Bonus Fuite: +1 | Compétence: *Lévitation*

🗡️🗡️ **ASSASSIN** - Deux dagues | Bonus Combat: +1 | Bonus Fuite: +4 | Compétence: *Ombre*`,
            image: `${ASSET_BASE}cellule.png`,
            isEnding: false,
            choices: []
        });
        pages.push(page1);
        // ==================== PAGE 2: The Cell ====================
        const page2 = await Page_1.Page.create({
            storyId: story._id,
            content: `La porte de ta cellule est entrouverte. Un **couloir** humide s'étend devant toi, éclairé par une torche vacillante. Des marches descendent dans les ténèbres. L'air sent le moisi et quelque chose de plus... inquiétant.

**Que fais-tu ?**`,
            image: `${ASSET_BASE}cellule.png`,
            isEnding: false,
            choices: []
        });
        pages.push(page2);
        // ==================== PAGE 3: The Stairs ====================
        const page3 = await Page_1.Page.create({
            storyId: story._id,
            content: `Tu descends prudemment. Les marches de pierre grincent sous ton poids. Un grondement sourd résonne depuis les profondeurs. Une chaleur étouffante monte vers toi. Ça sent... le soufre. Et la viande grillée.`,
            image: `${ASSET_BASE}escalier.png`,
            isEnding: false,
            choices: []
        });
        pages.push(page3);
        // ==================== PAGE 4: Search Cell ====================
        const page4 = await Page_1.Page.create({
            storyId: story._id,
            content: `Tu retournes la cellule de fond en comble. Sous la paille pourrie, tu trouves :

🧪 **Une potion de vigueur** (restaure 20 PV en combat)
🧿 **Un médaillon en bronze** représentant un œil étrange
🪨 **Un caillou complètement inutile** (mais brillant, donc précieux)`,
            image: `${ASSET_BASE}items.png`,
            isEnding: false,
            choices: []
        });
        pages.push(page4);
        // ==================== PAGE 4bis: Secret Passage (Assassin) ====================
        const page4bis = await Page_1.Page.create({
            storyId: story._id,
            content: `🎯 **Succès !** Tes doigts trouvent une fissure dans le mur. Un passage secret s'ouvre !

Tu découvres une cache contenant :
- 💰 50 pièces d'or
- 🗡️ Une dague de qualité supérieure (+2 attaque)
- 🧪 Une potion de furtivité`,
            image: `${ASSET_BASE}cellule.png`,
            isEnding: false,
            choices: []
        });
        pages.push(page4bis);
        // ==================== PAGE 5: The Scream ====================
        const page5 = await Page_1.Page.create({
            storyId: story._id,
            content: `Tu hurles de toutes tes forces. L'écho résonne dans les couloirs...

Puis un rugissement bestial te répond. Une **ombre** massive se déplace vers toi à une vitesse terrifiante.

⚔️ **COMBAT ou FUITE ?**`,
            image: `${ASSET_BASE}ombre.png`,
            isEnding: false,
            choices: []
        });
        pages.push(page5);
        // ==================== PAGE 6: Dragon Room ====================
        const page6 = await Page_1.Page.create({
            storyId: story._id,
            content: `Tu arrives dans une immense salle au plafond voûté. Des monceaux d'or scintillent dans la pénombre.

Un **dragon rouge colossal** ouvre lentement ses yeux reptiliens. Il te fixe. Il cligne des paupières. Il bâille, révélant des crocs plus longs que ton bras.

**"Encore un. J'ai déjà mangé un mage, un guerrier ET un assassin aujourd'hui."**

Sa voix résonne comme le tonnerre.`,
            image: `${ASSET_BASE}dragon.png`,
            isEnding: false,
            choices: []
        });
        pages.push(page6);
        // ==================== PAGE 7: Stealth Approach ====================
        const page7 = await Page_1.Page.create({
            storyId: story._id,
            content: `Tu descends avec une prudence extrême, te cachant dans les ombres. Tu aperçois le **dragon** avant qu'il ne te repère. Il dort à moitié, sa respiration soulevant des nuages de cendres.`,
            image: `${ASSET_BASE}dragon.png`,
            isEnding: false,
            choices: []
        });
        pages.push(page7);
        // ==================== PAGE 8: Medallion Analysis (Mage) ====================
        const page8 = await Page_1.Page.create({
            storyId: story._id,
            content: `🔮 Le médaillon pulse entre tes mains. Des runes scintillent à sa surface. Une voix spectrale murmure :

**"Utilise-moi contre le feu... Je suis bouclier... Je suis salut..."**

Tu comprends maintenant : c'est l'Amulette de Tharion, une relique anti-dragon !`,
            image: `${ASSET_BASE}items.png`,
            isEnding: false,
            choices: []
        });
        pages.push(page8);
        // ==================== PAGE 9: Dragon Negotiation ====================
        const page9 = await Page_1.Page.create({
            storyId: story._id,
            content: `Tu lèves les mains en signe de paix.

**Dragon :** *"Pourquoi n'es-tu pas déjà en train de fuir comme les autres ?"*

**Toi :** *"..."*`,
            image: `${ASSET_BASE}dragon.png`,
            isEnding: false,
            choices: []
        });
        pages.push(page9);
        // ==================== PAGE 10: Exit Search ====================
        const page10 = await Page_1.Page.create({
            storyId: story._id,
            content: `Le dragon ricane mais t'indique du museau deux passages :

🔥 **Porte de gauche** : Une chaleur insoutenable s'en échappe
🌬️ **Porte de droite** : Un courant d'air frais... et des grattements`,
            image: `${ASSET_BASE}couloir.png`,
            isEnding: false,
            choices: []
        });
        pages.push(page10);
        // ==================== PAGE 11: Medallion vs Dragon ====================
        const page11 = await Page_1.Page.create({
            storyId: story._id,
            content: `Tu brandis le médaillon. Il émet une lumière aveuglante !

Le dragon recule, sifflant de douleur.

**Dragon :** *"L'Amulette de Tharion ! Maudit sois-tu !"*

✅ **Le dragon te laisse passer librement !**`,
            image: `${ASSET_BASE}dragon.png`,
            isEnding: false,
            choices: []
        });
        pages.push(page11);
        // ==================== PAGE 12: Magic Duel (Mage) ====================
        const page12 = await Page_1.Page.create({
            storyId: story._id,
            content: `🔮 Tu incantes un sort de glace. Le dragon rugit et crache des flammes !

⚔️ **COMBAT MAGIQUE**
Difficulté: 18
🎲 Lance 1d20 + Bonus Mage (+1)

≥18: Victoire héroïque !
14-17: Match nul
<14: 💀 GAME OVER`,
            image: `${ASSET_BASE}dragon.png`,
            isEnding: false,
            choices: []
        });
        pages.push(page12);
        // ==================== PAGE 13: Prolonged Observation ====================
        const page13 = await Page_1.Page.create({
            storyId: story._id,
            content: `Tu observes le dragon pendant plusieurs minutes. Tu remarques :
- Sa respiration est régulière
- Une cicatrice sous son aile gauche
- Un trésor scintillant derrière lui`,
            image: `${ASSET_BASE}dragon.png`,
            isEnding: false,
            choices: []
        });
        pages.push(page13);
        // ==================== PAGE 14: Weak Point Identified ====================
        const page14 = await Page_1.Page.create({
            storyId: story._id,
            content: `🎯 Tu repères la cicatrice ancienne sous son aile gauche. C'est ton unique chance !

⚔️ **ATTAQUE PRÉCISE**
Difficulté: 16
🎲 Lance 1d20 + Bonus Combat

≥16: Coup critique !
12-15: Combat final
<12: 💀 GAME OVER`,
            image: `${ASSET_BASE}dragon.png`,
            isEnding: false,
            choices: []
        });
        pages.push(page14);
        // ==================== PAGE 15: Magic Vision (Mage) ====================
        const page15 = await Page_1.Page.create({
            storyId: story._id,
            content: `🔮 Ta vision magique révèle un secret : le dragon est lié à cette salle par une chaîne spectrale ancrée au plafond !

Tu peux le libérer ou l'attaquer dans sa faiblesse.`,
            image: `${ASSET_BASE}dragon.png`,
            isEnding: false,
            choices: []
        });
        pages.push(page15);
        // ==================== PAGE 16: Questions to Dragon ====================
        const page16 = await Page_1.Page.create({
            storyId: story._id,
            content: `Le dragon semble amusé par ta curiosité.

**Dragon :** *"Très bien, pose tes questions, mortel. Mais fais vite."*`,
            image: `${ASSET_BASE}dragon.png`,
            isEnding: false,
            choices: []
        });
        pages.push(page16);
        // ==================== PAGE 17: Pact with Dragon (Mage) ====================
        const page17 = await Page_1.Page.create({
            storyId: story._id,
            content: `**Toi :** *"Et si je te proposais un échange ? De la magie contre ma liberté ?"*

Le dragon plisse les yeux, intrigué.

🎲 **TEST DE PERSUASION**
Difficulté: 14
Lance 1d20 + Bonus Mage (+2)`,
            image: `${ASSET_BASE}dragon.png`,
            isEnding: false,
            choices: []
        });
        pages.push(page17);
        // ==================== PAGE 17bis: Dragon Story ====================
        const page17bis = await Page_1.Page.create({
            storyId: story._id,
            content: `Le dragon soupire, une expression étrangement humaine.

**Dragon :** *"Mon trésor ? Je le garde car c'est tout ce qui me reste de mon maître, un roi mort il y a mille ans. Je suis lié à cette salle par une malédiction. Prisonnier. Comme toi."*

Un moment de silence passe entre vous.`,
            image: `${ASSET_BASE}dragon.png`,
            isEnding: false,
            choices: []
        });
        pages.push(page17bis);
        // ==================== PAGE 18: Greed (Assassin) ====================
        const page18 = await Page_1.Page.create({
            storyId: story._id,
            content: `Le dragon ricane.

**Dragon :** *"Mon trésor ? Derrière moi. Mais tu devras me passer sur le corps."*

💰 Tu aperçois des monceaux d'or, des gemmes, des armes légendaires...`,
            image: `${ASSET_BASE}dragon.png`,
            isEnding: false,
            choices: []
        });
        pages.push(page18);
        // ==================== PAGE 19: Lava Chamber ====================
        const page19 = await Page_1.Page.create({
            storyId: story._id,
            content: `🔥 Tu traverses la porte de gauche et arrives dans une chambre de lave.

La chaleur est insupportable. Des ponts de pierre enjambent des rivières de magma.

💀 **FIN D: "Fondu dans la Lave"**
Tu glisses et tombes dans le magma. Mort instantanée.`,
            image: `${ASSET_BASE}gameovergeneriuqe.png`,
            isEnding: true,
            endingType: 'failure',
            choices: []
        });
        pages.push(page19);
        // ==================== PAGE 20: Chest Room ====================
        const page20 = await Page_1.Page.create({
            storyId: story._id,
            content: `Tu arrives dans une petite salle. Au centre trône un **coffre** en bois magnifiquement sculpté. Des gemmes ornent sa serrure.

Trop beau pour être vrai...`,
            image: `${ASSET_BASE}coffre.png`,
            isEnding: false,
            choices: []
        });
        pages.push(page20);
        // ==================== PAGE 20bis: The Mimic ====================
        const page20bis = await Page_1.Page.create({
            storyId: story._id,
            content: `🧟 Le coffre s'ouvre... mais ce n'est pas un coffre. C'est une **GUEULE** pleine de crocs !

Un Mimic ! Il bondit vers toi !

⚔️ **COMBAT : Mimic**
Difficulté: 14
🎲 Lance 1d20 + Bonus Combat

**GUERRIER:** +3
**AUTRES:** +1`,
            image: `${ASSET_BASE}mimic.png`,
            isEnding: false,
            choices: []
        });
        pages.push(page20bis);
        // ==================== PAGE 21: Treasure (Victory) ====================
        const page21 = await Page_1.Page.create({
            storyId: story._id,
            content: `🏆 **VICTOIRE !**

Tu trouves :
- 💰 500 pièces d'or
- 🗡️ Une épée légendaire (+5 attaque permanente)
- 🧪 2 potions de soin complètes

Tu sors du donjon, riche et victorieux !

🎉 **FIN A : "Le Pillard Triomphant"**`,
            image: `${ASSET_BASE}coffre.png`,
            isEnding: true,
            endingType: 'success',
            choices: []
        });
        pages.push(page21);
        // ==================== PAGE 22: Draconic Alliance (Mage Victory) ====================
        const page22 = await Page_1.Page.create({
            storyId: story._id,
            content: `🤝 Le dragon accepte le pacte. Il te donne :

- 🔮 Un fragment de son pouvoir (+Sorts de Feu permanents)
- 💰 Une part de son trésor
- 🚪 La sortie

**Dragon :** *"Va, mage. Et souviens-toi de celui qui t'a fait confiance."*

🎉 **FIN B : "Le Mage Allié des Dragons"**`,
            image: `${ASSET_BASE}dragon.png`,
            isEnding: true,
            endingType: 'success',
            choices: []
        });
        pages.push(page22);
        // ==================== GAME OVER PAGES ====================
        const gameOverDragon = await Page_1.Page.create({
            storyId: story._id,
            content: `💀 **GAME OVER**

Le dragon t'incinère d'un souffle de feu.

Fin instantanée. Tu es réduit en cendres.`,
            image: `${ASSET_BASE}gameoverdragon.png`,
            isEnding: true,
            endingType: 'failure',
            choices: []
        });
        pages.push(gameOverDragon);
        const gameOverGeneric = await Page_1.Page.create({
            storyId: story._id,
            content: `💀 **GAME OVER**

Tu es mort.

Ta aventure se termine ici dans les ténèbres du donjon.`,
            image: `${ASSET_BASE}gameovergeneriuqe.png`,
            isEnding: true,
            endingType: 'failure',
            choices: []
        });
        pages.push(gameOverGeneric);
        const gameOverShadow = await Page_1.Page.create({
            storyId: story._id,
            content: `💀 **GAME OVER**

L'ombre te transperce avec ses griffes spectrales.

Tu t'effondres, la vie quittant ton corps.`,
            image: `${ASSET_BASE}ombre.png`,
            isEnding: true,
            endingType: 'failure',
            choices: []
        });
        pages.push(gameOverShadow);
        const gameOverMimic = await Page_1.Page.create({
            storyId: story._id,
            content: `💀 **GAME OVER**

Le Mimic te dévore vivant.

Tes cris résonnent dans la salle vide.`,
            image: `${ASSET_BASE}mimic.png`,
            isEnding: true,
            endingType: 'failure',
            choices: []
        });
        pages.push(gameOverMimic);
        console.log(`✅ Created ${pages.length} pages`);
        // ==================== ADD CHOICES ====================
        console.log('🔗 Adding choices...');
        // Page 1 → Page 2 (all classes)
        await Page_1.Page.findByIdAndUpdate(page1._id, {
            choices: [
                { text: '🗡️ Choisir GUERRIER', targetPageId: page2._id.toString() },
                { text: '🔮 Choisir MAGE', targetPageId: page2._id.toString() },
                { text: '🗡️🗡️ Choisir ASSASSIN', targetPageId: page2._id.toString() }
            ]
        });
        // Page 2 → Multiple choices
        await Page_1.Page.findByIdAndUpdate(page2._id, {
            choices: [
                { text: 'Descendre les escaliers', targetPageId: page3._id.toString() },
                { text: 'Fouiller la cellule', targetPageId: page4._id.toString() },
                { text: 'Crier pour attirer l\'attention', targetPageId: page5._id.toString() },
                { text: '[ASSASSIN] Chercher un passage secret (1d20 ≥12)', targetPageId: page4bis._id.toString() },
                { text: '[MAGE] Lancer une boule de feu', targetPageId: gameOverGeneric._id.toString() },
                { text: '[GUERRIER] Défoncer le mur', targetPageId: page2._id.toString() }
            ]
        });
        // Page 3 → Dragon or stealth
        await Page_1.Page.findByIdAndUpdate(page3._id, {
            choices: [
                { text: 'Continuer la descente', targetPageId: page6._id.toString() },
                { text: 'Remonter', targetPageId: page2._id.toString() },
                { text: 'Avancer discrètement', targetPageId: page7._id.toString() },
                { text: '[GUERRIER] Hurler un cri de guerre', targetPageId: gameOverDragon._id.toString() },
                { text: '[ASSASSIN] Marcher sur les murs', targetPageId: gameOverGeneric._id.toString() },
                { text: '[MAGE] Utiliser Lévitation', targetPageId: page7._id.toString() }
            ]
        });
        // Page 4 → Back to Page 2 with items
        await Page_1.Page.findByIdAndUpdate(page4._id, {
            choices: [
                { text: 'Prendre la potion', targetPageId: page2._id.toString() },
                { text: 'Prendre le médaillon', targetPageId: page2._id.toString() },
                { text: 'Prendre tout', targetPageId: page2._id.toString() },
                { text: 'Boire la potion', targetPageId: gameOverGeneric._id.toString() },
                { text: '[MAGE] Analyser le médaillon', targetPageId: page8._id.toString() },
                { text: '[GUERRIER] Casser le médaillon', targetPageId: gameOverGeneric._id.toString() }
            ]
        });
        // Page 4bis → Back to Page 2
        await Page_1.Page.findByIdAndUpdate(page4bis._id, {
            choices: [
                { text: 'Retourner dans la cellule', targetPageId: page2._id.toString() }
            ]
        });
        // Page 5 → Combat or flee
        await Page_1.Page.findByIdAndUpdate(page5._id, {
            choices: [
                { text: 'Courir vers l\'escalier', targetPageId: page3._id.toString() },
                { text: '[COMBAT] Affronter l\'ombre (1d20+Combat ≥15)', targetPageId: page3._id.toString() },
                { text: '[<15] Mort par l\'ombre', targetPageId: gameOverShadow._id.toString() },
                { text: '[FUITE] Fuir (1d20+Fuite ≥12)', targetPageId: page2._id.toString() },
                { text: '[<12] Rattrapé', targetPageId: gameOverShadow._id.toString() }
            ]
        });
        // Page 6 → Dragon interactions
        await Page_1.Page.findByIdAndUpdate(page6._id, {
            choices: [
                { text: 'Attaquer directement', targetPageId: gameOverDragon._id.toString() },
                { text: 'Parler avec le dragon', targetPageId: page9._id.toString() },
                { text: 'Chercher une issue', targetPageId: page10._id.toString() },
                { text: 'Utiliser le médaillon (si possédé)', targetPageId: page11._id.toString() },
                { text: '[GUERRIER] Crier un cri de guerre', targetPageId: gameOverDragon._id.toString() },
                { text: '[MAGE] Lancer un sort', targetPageId: page12._id.toString() },
                { text: '[ASSASSIN] Backstab furtif', targetPageId: gameOverDragon._id.toString() }
            ]
        });
        // Page 7 → Stealth observations
        await Page_1.Page.findByIdAndUpdate(page7._id, {
            choices: [
                { text: 'Continuer d\'observer', targetPageId: page13._id.toString() },
                { text: 'Frapper maintenant', targetPageId: gameOverDragon._id.toString() },
                { text: 'Chercher un point faible', targetPageId: page14._id.toString() },
                { text: '[ASSASSIN] Analyser ses mouvements (1d20+2 ≥14)', targetPageId: page14._id.toString() },
                { text: '[MAGE] Vision magique', targetPageId: page15._id.toString() },
                { text: '[GUERRIER] Retenir son souffle', targetPageId: gameOverGeneric._id.toString() }
            ]
        });
        // Page 8 → Back with knowledge
        await Page_1.Page.findByIdAndUpdate(page8._id, {
            choices: [
                { text: 'Porter le médaillon', targetPageId: page2._id.toString() },
                { text: 'Le jeter', targetPageId: gameOverGeneric._id.toString() }
            ]
        });
        // Page 9 → Dialog choices
        await Page_1.Page.findByIdAndUpdate(page9._id, {
            choices: [
                { text: 'Je cherche la sortie', targetPageId: page10._id.toString() },
                { text: 'Je veux te combattre', targetPageId: gameOverDragon._id.toString() },
                { text: 'J\'ai des questions', targetPageId: page16._id.toString() },
                { text: '[MAGE] Je veux négocier un pacte', targetPageId: page17._id.toString() },
                { text: '[GUERRIER] Bras de fer ?', targetPageId: gameOverDragon._id.toString() },
                { text: '[ASSASSIN] Ton trésor est où ?', targetPageId: page18._id.toString() }
            ]
        });
        // Page 10 → Two doors
        await Page_1.Page.findByIdAndUpdate(page10._id, {
            choices: [
                { text: 'Prendre à gauche (lave)', targetPageId: page19._id.toString() },
                { text: 'Prendre à droite (coffre)', targetPageId: page20._id.toString() },
                { text: 'Retourner négocier', targetPageId: page9._id.toString() }
            ]
        });
        // Page 11 → Victory path
        await Page_1.Page.findByIdAndUpdate(page11._id, {
            choices: [
                { text: 'Chercher la sortie', targetPageId: page10._id.toString() }
            ]
        });
        // Page 12 → Magic duel
        await Page_1.Page.findByIdAndUpdate(page12._id, {
            choices: [
                { text: '[COMBAT] Lancer un sort de glace (1d20+Combat ≥18)', targetPageId: page21._id.toString() },
                { text: '[≥18] Victoire héroïque !', targetPageId: page21._id.toString() },
                { text: '[14-17] Match nul', targetPageId: page10._id.toString() },
                { text: '[<14] Carbonisé', targetPageId: gameOverDragon._id.toString() }
            ]
        });
        // Page 13 → Observation choices
        await Page_1.Page.findByIdAndUpdate(page13._id, {
            choices: [
                { text: '[FUITE] Voler du trésor (1d20+Fuite ≥16)', targetPageId: page21._id.toString() },
                { text: '[≥16] Succès !', targetPageId: page21._id.toString() },
                { text: '[<16] Pris en flag', targetPageId: gameOverDragon._id.toString() },
                { text: 'Frapper la cicatrice', targetPageId: page14._id.toString() },
                { text: 'Se retirer', targetPageId: page3._id.toString() }
            ]
        });
        // Page 14 → Precise attack
        await Page_1.Page.findByIdAndUpdate(page14._id, {
            choices: [
                { text: '[COMBAT] Frapper la cicatrice (1d20+Combat ≥16)', targetPageId: page21._id.toString() },
                { text: '[≥16] Coup critique !', targetPageId: page21._id.toString() },
                { text: '[12-15] Combat final', targetPageId: page21._id.toString() },
                { text: '[<12] Échec mortel', targetPageId: gameOverDragon._id.toString() }
            ]
        });
        // Page 15 → Magic vision
        await Page_1.Page.findByIdAndUpdate(page15._id, {
            choices: [
                { text: 'Briser la chaîne spectrale', targetPageId: page22._id.toString() },
                { text: 'Attaquer le dragon affaibli', targetPageId: page14._id.toString() }
            ]
        });
        // Page 16 → Questions
        await Page_1.Page.findByIdAndUpdate(page16._id, {
            choices: [
                { text: 'Comment sortir d\'ici ?', targetPageId: page10._id.toString() },
                { text: 'Pourquoi gardes-tu ce trésor ?', targetPageId: page17bis._id.toString() },
                { text: 'Qui es-tu vraiment ?', targetPageId: page17bis._id.toString() }
            ]
        });
        // Page 17 → Pact negotiation
        await Page_1.Page.findByIdAndUpdate(page17._id, {
            choices: [
                { text: 'Proposer un pacte (1d20+Persuasion ≥14)', targetPageId: page22._id.toString() },
                { text: '[≥14] Le dragon accepte', targetPageId: page22._id.toString() },
                { text: '[<14] Il refuse', targetPageId: page9._id.toString() }
            ]
        });
        // Page 17bis → Story continuation
        await Page_1.Page.findByIdAndUpdate(page17bis._id, {
            choices: [
                { text: 'Continuer la conversation', targetPageId: page9._id.toString() }
            ]
        });
        // Page 18 → Treasure greed
        await Page_1.Page.findByIdAndUpdate(page18._id, {
            choices: [
                { text: 'Tenter de voler', targetPageId: page13._id.toString() },
                { text: 'Négocier un partage (1d20 ≥15)', targetPageId: page21._id.toString() },
                { text: '[≥15] Il accepte', targetPageId: page21._id.toString() },
                { text: '[<15] Il refuse', targetPageId: page9._id.toString() }
            ]
        });
        // Page 20 → Chest choices
        await Page_1.Page.findByIdAndUpdate(page20._id, {
            choices: [
                { text: 'Ouvrir le coffre', targetPageId: page20bis._id.toString() },
                { text: 'Examiner (1d20 ≥13)', targetPageId: page20bis._id.toString() },
                { text: 'Frapper le coffre', targetPageId: page20bis._id.toString() },
                { text: 'Ignorer et passer', targetPageId: page10._id.toString() }
            ]
        });
        // Page 20bis → Mimic combat
        await Page_1.Page.findByIdAndUpdate(page20bis._id, {
            choices: [
                { text: '[COMBAT] Combattre le Mimic (1d20+Combat ≥14)', targetPageId: page21._id.toString() },
                { text: '[≥14] Victoire !', targetPageId: page21._id.toString() },
                { text: '[10-13] Fuite blessée', targetPageId: page10._id.toString() },
                { text: '[<10] Dévoré', targetPageId: gameOverMimic._id.toString() },
                { text: '[FUITE] Fuir le Mimic (1d20+Fuite ≥10)', targetPageId: page10._id.toString() },
                { text: '[≥10] Échapper', targetPageId: page10._id.toString() },
                { text: '[<10] Mordu', targetPageId: page10._id.toString() }
            ]
        });
        console.log('✅ All choices added');
        // Update story startPageId
        await Story_1.Story.findByIdAndUpdate(story._id, {
            startPageId: page1._id.toString()
        });
        console.log('✅ Story startPageId set');
        console.log('\n🎉 Story seeded successfully!');
        console.log(`📖 Story ID: ${story._id}`);
        console.log(`📄 Total Pages: ${pages.length}`);
        console.log(`🏁 Start Page: ${page1._id}`);
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error seeding story:', error);
        process.exit(1);
    }
}
seedMainStory();
//# sourceMappingURL=seedMainStory.js.map