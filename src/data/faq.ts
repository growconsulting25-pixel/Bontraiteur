/**
 * Questions fréquentes. Réponses rédigées à partir des informations connues.
 * Les éléments marqués [À confirmer] doivent être validés par Bon Traiteur.
 */

export interface FaqItem {
  question: string;
  answer: string;
  group: "menu" | "commandes" | "livraison" | "allergies" | "facturation";
}

export const faqGroups: Record<FaqItem["group"], string> = {
  menu: "Le menu",
  commandes: "Commandes et flexibilité",
  livraison: "Livraison",
  allergies: "Allergies et restrictions",
  facturation: "Soumission et facturation",
};

export const faq: FaqItem[] = [
  {
    group: "menu",
    question: "Comment fonctionne le menu mensuel?",
    answer:
      "Chaque mois, nous préparons un menu à partir de notre rotation de plats. Vous pouvez le garder tel quel ou remplacer certains repas par des alternatives de notre menu complet.",
  },
  {
    group: "menu",
    question: "Jusqu'à quand puis-je modifier mon menu?",
    answer:
      "Normalement jusqu'à 2 semaines avant la période concernée. Une modification plus tardive est parfois possible : communiquez avec nous et nous regarderons ce qui peut être fait.",
  },
  {
    group: "menu",
    question: "Qu'est-ce que la rotation ponctuelle?",
    answer:
      "En plus du cycle mensuel, d'autres plats sont disponibles en rotation ponctuelle. Vous pouvez les intégrer à votre menu en nous en informant au moins 2 semaines à l'avance.",
  },
  {
    group: "commandes",
    question: "Dois-je signer un contrat ou un abonnement?",
    answer:
      "Non, ce n'est pas obligatoire. Vous pouvez commander de façon ponctuelle, avoir des livraisons régulières ou convenir d'une entente à plus long terme. On choisit ensemble ce qui convient à votre garderie.",
  },
  {
    group: "commandes",
    question: "Puis-je ajuster les quantités d'une semaine à l'autre?",
    answer:
      "Oui. Un enfant de plus, un groupe absent : dites-le-nous et nous ajustons les portions. [À confirmer : délai minimal de modification des quantités]",
  },
  {
    group: "commandes",
    question: "Que se passe-t-il lors d'une journée pédagogique ou d'une fermeture?",
    answer: "Vous pouvez suspendre la livraison prévue. Avisez-nous à l'avance et nous ajustons votre commande.",
  },
  {
    group: "livraison",
    question: "Offrez-vous des livraisons urgentes?",
    answer:
      "Oui. Une livraison urgente peut être organisée sous 48 h, selon les disponibilités et votre zone de livraison. Appelez-nous pour valider rapidement.",
  },
  {
    group: "livraison",
    question: "Quelles régions desservez-vous?",
    answer: "[À confirmer : zones de livraison exactes] Écrivez-nous avec l'adresse de votre garderie et nous vous confirmerons rapidement.",
  },
  {
    group: "livraison",
    question: "Sous quelle forme les repas sont-ils livrés?",
    answer:
      "Selon vos besoins : repas chauds prêts à servir, repas prêts-à-manger ou repas congelés. Plusieurs garderies combinent les formats.",
  },
  {
    group: "allergies",
    question: "Comment gérez-vous les allergies?",
    answer:
      "Les allergènes connus sont indiqués dans notre menu à titre informatif. Ces informations doivent être confirmées avec notre équipe selon les besoins particuliers de vos enfants. Parlez-nous de vos restrictions dès la soumission.",
  },
  {
    group: "facturation",
    question: "Combien coûtent vos repas?",
    answer:
      "Le prix dépend du nombre d'enfants, de la fréquence de livraison et des formats choisis. Demandez une soumission : nous vous proposons une formule adaptée à votre garderie.",
  },
  {
    group: "facturation",
    question: "Comment se fait la facturation?",
    answer:
      "[À confirmer : fréquence et modes de paiement] Bientôt, vos factures seront aussi accessibles dans votre portail client.",
  },
];
