import { GameMechanics } from "./types";

/**
 * Knowledge Base for story generation
 * Contains game mechanics, narrative guidelines, and example stories
 */
export class KnowledgeBase {
	/**
	 * Get game mechanics definitions
	 */
	getGameMechanics(): GameMechanics {
		return {
			classes: [
				{
					name: "Guerrier",
					weapon: "Épée rouillée",
					combatBonus: 3,
					fleeBonus: -2,
					specialAbility: "Rage du Guerrier (réussit automatiquement 1 combat)",
				},
				{
					name: "Mage",
					weapon: "Bâton de bois brûlé",
					combatBonus: 1,
					fleeBonus: 1,
					specialAbility: "Lévitation (évite 1 danger automatiquement)",
				},
				{
					name: "Assassin",
					weapon: "Deux dagues ébréchées",
					combatBonus: 1,
					fleeBonus: 4,
					specialAbility: "Ombre (fuite automatique)",
				},
			],
			diceSystem: {
				type: "d20",
				difficultyLevels: {
					"très facile": 8,
					facile: 10,
					moyen: 12,
					difficile: 15,
					"très difficile": 18,
				},
			},
			combatRules: {
				baseAttackBonus: 0,
				criticalHitThreshold: 20,
			},
		};
	}

	/**
	 * Get narrative style guide
	 */
	getNarrativeStyle(): string {
		return `
STYLE NARRATIF:
- Ton atmosphérique et dramatique
- Descriptions riches et immersives
- Utilise la deuxième personne (tu)
- Crée de la tension et du suspense
- Intègre des émojis pour les actions importantes (⚔️, 🎲, 💀, ✅)
- Équilibre entre humour et sérieux
- Conséquences crédibles pour les choix

STRUCTURE DES PAGES:
- Début accrocheur qui plonge le lecteur dans l'action
- Description de l'environnement et de l'atmosphère
- Présentation claire des choix (2-4 choix par page)
- Choix génériques ET choix spécifiques aux classes
- Références aux assets d'images (*(Asset: nom_fichier.png)*)

MÉCANIQUES DE JEU:
- Intégrer des lancers de dés pour les actions risquées
- Utiliser le système de difficulté : ≥X pour réussir
- Offrir des choix spécifiques à chaque classe
- Inclure des fins multiples (victoires ET game overs)
- Récompenser la créativité et punir l'imprudence
`;
	}

	/**
	 * Get example story page
	 */
	getExamplePage(): string {
		return `
EXEMPLE DE PAGE:

## 🗡️ Page 5 : Le Cri *(Asset: ombre.png)*

Tu hurles de toutes tes forces. L'écho résonne dans les couloirs...

Puis un rugissement bestial te répond. Une **ombre** massive se déplace vers toi à une vitesse terrifiante.

### **Choix :**

**[Courir vers l'escalier]** → Page 3

**[Rester et combattre]** → **COMBAT : L'Ombre**

#### ⚔️ **COMBAT : L'Ombre**
- **Difficulté :** 15
- 🎲 **Lance 1d20 + Bonus de Combat de ta classe**
  - **≥15 :** Victoire ! Tu tues l'ombre → Page 3 (+50 PX)
  - **10-14 :** Fuite réussie mais blessé (-10 PV) → Page 3
  - **<10 :** 💀 **GAME OVER** *(Asset: gameovergeneriuqe.png)* — L'ombre te transperce

**[Fuir par le couloir]** → **TEST DE FUITE**

#### 🏃 **TEST DE FUITE**
- **Difficulté :** 12
- 🎲 **Lance 1d20 + Bonus de Fuite de ta classe**
  - **ASSASSIN :** +4 → Très facile (≥8)
  - **MAGE :** +1 → Possible (≥11)
  - **GUERRIER :** -2 → Très difficile (≥14)
  
  - **Réussite :** → Page 2 (sain et sauf)
  - **Échec :** 💀 **GAME OVER** — Rattrapé et déchiqueté

### **Choix Spécifiques de Classe :**

**MAGE :** *[Utiliser Lévitation pour s'échapper]* (COMPÉTENCE SPÉCIALE)
- ✅ **Succès automatique** — Tu flottes par-dessus l'ombre → Page 3

**ASSASSIN :** *[Se fondre dans l'ombre]* (COMPÉTENCE SPÉCIALE)
- ✅ **Succès automatique** — Tu deviens invisible → Page 2
`;
	}

	/**
	 * Get story structure template
	 */
	getStoryStructureTemplate(): string {
		return `
STRUCTURE D'UNE HISTOIRE INTERACTIVE:

1. PAGE D'INTRODUCTION (Page 1)
   - Choix de classe (Guerrier, Mage, Assassin)
   - Présentation du contexte de base
   - Définition des bonus/malus de chaque classe

2. PAGES D'EXPLORATION (Pages 2-10)
   - Découverte de l'environnement
   - Rencontres avec des dangers
   - Collecte d'objets
   - Choix qui affectent la suite
   - Tests de compétences (dés)

3. PAGES CULMINANTES (Pages 11-15)
   - Confrontation majeure
   - Utilisation des objets/compétences acquis
   - Tests de haut niveau
   - Branches vers différentes fins

4. PAGES DE FIN (Pages finales)
   - Fins victorieuses (3-5 différentes)
   - Fins game over (5-10 différentes)
   - Récompenses et descriptions des accomplissements

RÈGLES IMPORTANTES:
- Chaque page doit avoir 1-4 choix (sauf fins)
- Au moins 30% des choix incluent des lancers de dés
- Chaque classe doit avoir des choix uniques
- Prévoir au moins 3 fins victorieuses différentes
- Inclure des fins game over humoristiques
`;
	}

	/**
	 * Build context for story generation
	 * Simplified to reduce token usage and avoid timeouts
	 */
	getGenerationContext(theme?: string): string {
		const mechanics = this.getGameMechanics();

		// Return minimal context to avoid token overload
		const minimalContext = `MÉCANIQUES:
- Classes: ${mechanics.classes
			.map((c) => `${c.name} (${c.weapon}, +${c.combatBonus} combat)`)
			.join(", ")}
- Dés: d20, difficulté 10-15
${theme ? `\nTHÈME: ${theme}` : ""}`;

		return minimalContext;
	}
}

export const knowledgeBase = new KnowledgeBase();
