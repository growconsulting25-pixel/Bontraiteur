/**
 * Contenus éditoriaux réutilisés sur plusieurs pages.
 * Centralisés ici pour faciliter la future traduction anglaise (phase 2).
 */

/** Situations quotidiennes d'une direction de garderie. */
export const situations = [
  {
    question: "Un enfant de plus cette semaine?",
    answer: "Ajustez vos portions. On livre la bonne quantité.",
  },
  {
    question: "Une journée pédagogique?",
    answer: "Avisez-nous et on suspend la livraison du jour.",
  },
  {
    question: "Besoin de modifier un repas?",
    answer: "Choisissez simplement une alternative dans le menu complet.",
  },
  {
    question: "Une livraison supplémentaire?",
    answer: "Ajoutez-la à votre commande. On s'organise.",
  },
  {
    question: "Un changement de dernière minute?",
    answer: "Appelez-nous. Une vraie personne vous répond et trouve une solution.",
  },
] as const;

/** Actions du futur portail client. */
export const portalActions = [
  { id: "confirmer", label: "Confirmez votre menu", detail: "Vous gardez le menu? Un clic suffit." },
  { id: "changer", label: "Changez un repas", detail: "Choisissez une alternative dans le menu complet." },
  { id: "portions", label: "Ajoutez des portions", detail: "Un groupe plus grand vendredi? Ajustez en quelques secondes." },
  { id: "livraisons", label: "Consultez vos livraisons", detail: "Sans chercher dans vos courriels." },
  { id: "suspendre", label: "Suspendez une livraison", detail: "Journée pédagogique, fermeture, congé." },
  { id: "factures", label: "Accédez à vos factures", detail: "Toutes au même endroit, prêtes pour la comptabilité." },
  { id: "contact", label: "Contactez Bon Traiteur", detail: "Une question? On vous répond rapidement." },
] as const;

/** Trois déclinaisons de la même clientèle. */
export const audienceProfiles = [
  {
    id: "cpe",
    title: "CPE",
    summary: "Des menus mensuels stables, faciles à confirmer, et une facturation claire pour votre conseil d'administration.",
  },
  {
    id: "garderies",
    title: "Garderies",
    summary: "Subventionnées ou privées : un service régulier qui s'ajuste à vos groupes, sans engagement compliqué.",
  },
  {
    id: "services-de-garde",
    title: "Services de garde",
    summary: "Des quantités qui suivent vos présences et un dépannage possible quand l'horaire change.",
  },
] as const;

/** Ce sur quoi on s'engage — sans statistiques inventées. */
export const commitments = [
  { title: "Constance", text: "Les mêmes standards d'une livraison à l'autre. Vos équipes savent à quoi s'attendre." },
  { title: "Ponctualité", text: "Des livraisons planifiées selon l'horaire de votre garderie, pas le nôtre." },
  { title: "Flexibilité", text: "Menu, quantités, jours de livraison : tout peut s'ajuster." },
  { title: "Service humain", text: "Une équipe qui connaît votre garderie et qui répond au téléphone." },
  { title: "Qualité", text: "Des repas préparés en cuisine, pensés pour les tout-petits." },
  { title: "Expérience", text: "Plus de 15 ans à nourrir des enfants en milieu de garde." },
] as const;

export const howItWorks = [
  {
    step: "01",
    title: "On apprend à connaître votre garderie",
    text: "Nombre d'enfants, groupes d'âge, jours de service, contraintes alimentaires. Une soumission adaptée suit.",
  },
  {
    step: "02",
    title: "Vous recevez votre menu du mois",
    text: "Chaque mois, Bon Traiteur prépare un menu. Vous le gardez tel quel ou vous remplacez les repas de votre choix.",
  },
  {
    step: "03",
    title: "Vous confirmez",
    text: "Les changements se font normalement jusqu'à 2 semaines avant la période concernée. Après, on regarde ce qui est possible.",
  },
  {
    step: "04",
    title: "On prépare et on livre",
    text: "Repas chauds, prêts-à-manger ou congelés, livrés aux jours convenus. Vous servez, c'est tout.",
  },
] as const;

/**
 * TÉMOIGNAGES — PLACEHOLDERS.
 * Ces textes sont des exemples de structure. Ils doivent être remplacés par
 * de vrais témoignages, avec l'autorisation écrite des clients.
 */
export const testimonials = [
  {
    id: "placeholder-1",
    quote:
      "[Exemple] Avant, je passais du temps chaque semaine à gérer les repas. Maintenant, je confirme le menu et c'est réglé.",
    author: "Nom de la directrice",
    role: "Directrice, CPE (à confirmer)",
    isPlaceholder: true,
  },
  {
    id: "placeholder-2",
    quote:
      "[Exemple] Les enfants mangent bien et quand on a un imprévu, l'équipe trouve toujours une solution.",
    author: "Nom de la responsable",
    role: "Responsable alimentaire, garderie (à confirmer)",
    isPlaceholder: true,
  },
  {
    id: "placeholder-3",
    quote:
      "[Exemple] On peut changer un repas sans échanger dix courriels. C'est exactement ce dont on avait besoin.",
    author: "Nom de l'adjointe",
    role: "Adjointe administrative, service de garde (à confirmer)",
    isPlaceholder: true,
  },
] as const;
