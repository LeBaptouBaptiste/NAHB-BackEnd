"use strict";
/**
 * Prompt templates for AI story generation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptTemplates = void 0;
class PromptTemplates {
    /**
     * Generate a complete story from a user prompt
     */
    static generateStoryPrompt(userPrompt, context, language = 'fr') {
        // Use abbreviated context to avoid token limits
        const shortContext = `SYSTÈME:
- 3 classes: Guerrier (+3 combat), Mage (+1 combat, +1 fuite), Assassin (+4 fuite)
- Système de dés d20 pour actions risquées
- Difficulté: Facile=10, Moyen=12, Difficile=15
`;
        return `${shortContext}

TÂCHE: Génère une histoire interactive basée sur la demande de l'utilisateur.

DEMANDE:
${userPrompt}

INSTRUCTIONS:
1. Crée 5-8 pages avec choix multiples
2. Inclus au moins 2 fins (1 victoire, 1 game over)
3. Intègre 1-2 tests de dés (format: "**TEST:** difficulté X")
4. Descriptions courtes mais immersives
5. Référence des assets: *(Asset: nom.png)*

FORMAT:
# [Titre]
## [Description]

## Page 1 : [Titre] *(Asset: nom.png)*
[Contenu court]
### **Choix:**
- **[Texte]** → Page X

LANGUE: ${language === 'fr' ? 'Français' : 'English'}

Commence maintenant la génération de l'histoire:
`;
    }
    /**
     * Generate a single page based on story context
     */
    static generatePagePrompt(storyContext, previousPageContent, knowledgeContext) {
        return `${knowledgeContext}

CONTEXTE DE L'HISTOIRE:
${storyContext}

PAGE PRÉCÉDENTE:
${previousPageContent}

TÂCHE: Génère la page suivante de cette histoire interactive.

INSTRUCTIONS:
1. Continue naturellement depuis la page précédente
2. Maintiens la cohérence avec le contexte établi
3. Offre 2-4 choix intéressants
4. Inclus au moins un choix spécifique à une classe
5. Considère l'ajout d'un test de dés si approprié
6. Référence un asset d'image approprié

FORMAT DE SORTIE: Génère uniquement le contenu de la nouvelle page au format:
## Page X : [Titre] *(Asset: nom_asset.png)*
[Contenu narratif]
### **Choix :**
[Liste des choix]

Génère la page:
`;
    }
    /**
     * Suggest choices for a given page
     */
    static suggestChoicesPrompt(pageContent, storyContext, knowledgeContext, numChoices = 3) {
        return `${knowledgeContext}

CONTEXTE DE L'HISTOIRE:
${storyContext}

CONTENU DE LA PAGE ACTUELLE:
${pageContent}

TÂCHE: Suggère ${numChoices} choix intéressants et cohérents pour cette page.

INSTRUCTIONS:
1. Au moins un choix générique accessible à toutes les classes
2. Au moins un choix spécifique à une classe (Guerrier, Mage, ou Assassin)
3. Varie entre actions sûres et risquées (nécessitant des dés)
4. Assure-toi que les choix mènent à des conséquences logiques
5. Utilise un style cohérent avec le reste de l'histoire

FORMAT DE SORTIE: Liste uniquement les choix au format:
**[Texte du choix]** → [Description de la conséquence ou Page X]

OU pour un test:
**[Texte du choix]** → **TEST : [Type]**
- **Difficulté :** X
- 🎲 **Lance 1d20 + Bonus**
  - **≥X :** [Résultat réussite]
  - **<X :** [Résultat échec]

Génère les choix:
`;
    }
    /**
     * Refine or improve existing story content
     */
    static refineStoryPrompt(originalContent, userFeedback, knowledgeContext) {
        return `${knowledgeContext}

CONTENU ORIGINAL:
${originalContent}

RETOUR DE L'UTILISATEUR:
${userFeedback}

TÂCHE: Améliore le contenu en tenant compte des retours de l'utilisateur.

INSTRUCTIONS:
1. Garde la structure générale mais applique les modifications demandées
2. Maintiens la cohérence avec le reste de l'histoire
3. Améliore le style narratif si nécessaire
4. Vérifie que les mécaniques de jeu sont correctes

FORMAT DE SORTIE: Génère le contenu révisé dans le même format que l'original.

Génère le contenu amélioré:
`;
    }
    /**
     * Extract structured data from generated markdown
     */
    static extractStructurePrompt(markdownContent) {
        return `Extrait les informations structurées de cette histoire au format JSON.

CONTENU MARKDOWN:
${markdownContent}

FORMAT DE SORTIE: JSON avec la structure suivante:
{
  "title": "Titre de l'histoire",
  "description": "Description courte",
  "theme": "Thème principal",
  "tags": ["tag1", "tag2"],
  "pages": [
    {
      "pageNumber": 1,
      "title": "Titre de la page",
      "content": "Contenu narratif complet",
      "image": "nom_asset.png",
      "isEnding": false,
      "endingType": null,
      "choices": [
        {
          "text": "Texte du choix",
          "targetPageNumber": 2,
          "condition": null
        }
      ]
    }
  ]
}

IMPORTANT: 
- Conserve TOUT le contenu narratif dans le champ "content"
- Inclus les tests de dés dans le contenu
- Ne simplifie pas ou ne résume pas le texte
- Extrais les numéros de page cibles des choix

Génère le JSON:
`;
    }
    /**
     * Generate a story title and description from a prompt
     */
    static generateMetadataPrompt(userPrompt, language = 'fr') {
        return `Génère un titre accrocheur et une description courte pour une histoire interactive basée sur cette demande:

DEMANDE: ${userPrompt}

FORMAT DE SORTIE: JSON
{
  "title": "Un titre court et accrocheur (max 60 caractères)",
  "description": "Une description engageante (max 200 caractères)",
  "tags": ["tag1", "tag2", "tag3"],
  "theme": "Thème principal (1-2 mots)"
}

LANGUE: ${language === 'fr' ? 'Français' : 'English'}

Génère le JSON:
`;
    }
    /**
     * Generate the first page of a story (with class selection)
     */
    static generateFirstPagePrompt(storyTitle, storyDescription, theme, language = 'fr') {
        return `Tu es un créateur d'histoires interactives RPG.

HISTOIRE: ${storyTitle}
DESCRIPTION: ${storyDescription}
THÈME: ${theme}

TÂCHE: Crée la PREMIÈRE PAGE de cette histoire.

EXIGENCES:
1. Commence par la sélection de classe (Guerrier, Mage, Assassin)
2. Présente le contexte de départ
3. Crée 3 choix correspondant aux 3 classes
4. Texte court et immersif (150-200 mots max)
5. Format markdown

FORMAT:
## Page 1 : [Titre de la page] *(Asset: intro.png)*

[Contenu narratif - présentation du contexte et choix de classe]

### **Choix:**
- **Guerrier : [Description du choix]** → Page 2
- **Mage : [Description du choix]** → Page 3
- **Assassin : [Description du choix]** → Page 4

LANGUE: ${language === 'fr' ? 'Français' : 'English'}

Génère maintenant la première page:
`;
    }
    /**
     * Generate a continuation page based on a choice
     */
    static generateContinuationPagePrompt(storyContext, language = 'fr') {
        const { title, theme, previousContent, choiceTaken, pageNumber, shouldBeEnding } = storyContext;
        return `Tu es un créateur d'histoires interactives RPG.

HISTOIRE: ${title}
THÈME: ${theme}
PAGE PRÉCÉDENTE:
${previousContent}

CHOIX PRIS: "${choiceTaken}"

TÂCHE: Crée la PAGE ${pageNumber} qui suit ce choix.

EXIGENCES:
1. Continue naturellement depuis le choix pris
2. Texte court et immersif (150-200 mots max)
${shouldBeEnding ?
            '3. Cette page doit être une FIN (victoire OU game over)\n4. Pas de choix - c\'est la conclusion' :
            '3. Crée 2-3 nouveaux choix intéressants\n4. Au moins un choix avec un risque (test de dés d20)\n5. Maintiens la cohérence avec l\'histoire'}
6. Format markdown

FORMAT:
## Page ${pageNumber} : [Titre] *(Asset: ${shouldBeEnding ? 'ending' : 'page'}_${pageNumber}.png)*

[Contenu narratif]

${shouldBeEnding ?
            '**FIN VICTORIEUSE** ✅ OU **GAME OVER** 💀' :
            `### **Choix:**
- **[Texte du choix 1]** → Page ${pageNumber + 1}
- **[Texte du choix 2]** → Page ${pageNumber + 2}
${Math.random() > 0.5 ? `- **[Texte du choix 3]** → Page ${pageNumber + 3}` : ''}`}

LANGUE: ${language === 'fr' ? 'Français' : 'English'}

Génère maintenant la page:
`;
    }
}
exports.PromptTemplates = PromptTemplates;
//# sourceMappingURL=promptTemplates.js.map