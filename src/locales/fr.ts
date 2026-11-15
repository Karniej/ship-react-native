export default {
  // Common
  common: {
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès",
    cancel: "Annuler",
    save: "Enregistrer",
    delete: "Supprimer",
    edit: "Modifier",
    done: "Terminé",
    retry: "Réessayer",
    ok: "OK",
    yes: "Oui",
    no: "Non",
    back: "Retour",
    next: "Suivant",
    skip: "Passer",
    previous: "Précédent",
    close: "Fermer",
    search: "Rechercher",
    settings: "Paramètres",
    profile: "Profil",
    home: "Accueil",
    history: "Historique",
    copy: "Copier",
    share: "Partager",
    clear: "Effacer",
    termsOfService: "Conditions d'Utilisation",
    privacyPolicy: "Politique de Confidentialité",
  },

  // Auth
  auth: {
    signIn: "Se Connecter",
    signUp: "S'inscrire",
    signOut: "Se Déconnecter",
    signOutConfirm: "Êtes-vous sûr de vouloir vous déconnecter ?",
    email: "E-mail",
    password: "Mot de passe",
    name: "Nom",
    forgotPassword: "Mot de passe oublié ?",
    noAccount: "Vous n'avez pas de compte ?",
    hasAccount: "Vous avez déjà un compte ?",
    magicLink: "Se connecter avec un lien magique",
    magicLinkSent: "Vérifiez votre e-mail pour le lien magique",
    // Social Auth
    title: "Bienvenue",
    subtitle: "Connectez-vous pour synchroniser vos données entre appareils",
    continueWithGoogle: "Continuer avec Google",
    continueWithApple: "Continuer avec Apple",
    skipForNow: "Passer pour l'instant",
    termsNotice: "En continuant, vous acceptez nos",
    termsLink: "Conditions d'Utilisation",
    privacyLink: "Politique de Confidentialité",
    and: "et",
    signingIn: "Connexion en cours...",
    error: {
      googleFailed: "Échec de la connexion Google. Veuillez réessayer.",
      appleFailed: "Échec de la connexion Apple. Veuillez réessayer.",
      cancelled: "Connexion annulée.",
      generic: "Quelque chose s'est mal passé. Veuillez réessayer.",
    },
  },

  // Onboarding
  onboarding: {
    welcome: "Bienvenue dans Votre App",
    welcomeSubtitle: "Commencez votre expérience personnalisée",
    whatToCall: "Comment devons-nous vous appeler ?",
    enterName: "Entrez votre nom",
    setPreferences: "Définissez vos préférences",
    darkMode: "Mode Sombre",
    lightMode: "Mode Clair",
    allSet: "Vous êtes prêt !",
    startExploring: "Commencez à explorer votre nouvelle app",
    getStarted: "Commencer",
    next: "Suivant",
    skip: "Passer",
    // Slide content
    slide1: {
      title: "Bienvenue dans AI Studio",
      description:
        "Créez des images, vidéos et audio époustouflants avec la puissance de l'intelligence artificielle.",
    },
    slide2: {
      title: "Générez des Images",
      description:
        "Transformez vos idées en art magnifique avec notre génération d'images IA avancée.",
    },
    slide3: {
      title: "Créez des Vidéos",
      description: "Donnez vie à votre imagination avec la génération vidéo propulsée par l'IA.",
    },
    slide4: {
      title: "Audio et Plus",
      description:
        "Convertissez du texte en parole, transcrivez de l'audio et explorez toutes nos fonctionnalités IA.",
    },
  },

  // Home
  home: {
    greeting: "Bonjour, {{name}} !",
    greetingDefault: "Bonjour !",
    whatToCreate: "Qu'aimeriez-vous créer aujourd'hui ?",
    upgrade: "Améliorer",
    credits: "{{count}} Crédits",
    creditsAvailable: "Disponibles pour la génération",
    getMore: "Obtenir Plus",
    aiFeatures: "Fonctionnalités IA",
    quickActions: "Actions Rapides",
    generateImage: "Générer Image",
    imageGeneration: "Génération d'Images",
    createAiArt: "Créer de l'art IA",
    videoGeneration: "Génération Vidéo",
    createAiVideo: "Créer une vidéo IA",
    audioGeneration: "Génération Audio",
    textToSpeech: "Texte en Parole",
    convertText: "Convertir le texte",
    audioTranscription: "Transcription",
    transcribeAudio: "Transcrire l'audio",
    imageIdentification: "ID d'Image",
    analyzeImages: "Analyser les images",
    chat: "Chat IA",
    chatWithAi: "Discuter avec l'IA",
    preferences: "Préférences",
    recentCreations: "Créations Récentes",
    seeAll: "Voir Tout",
    gettingStarted: "Pour Commencer",
    createFirstGeneration: "Créez Votre Première Génération",
    createFirstGenerationDesc:
      "Utilisez l'IA pour générer des images époustouflantes ou convertir du texte en parole naturelle.",
    startCreating: "Commencer à Créer",
  },

  // Generate
  generate: {
    title: "Générer",
    createImages: "Créez des images avec l'IA",
    creditsRemaining: "{{count}} crédits restants",
    prompt: "Description",
    promptPlaceholder: "Décrivez ce que vous voulez créer...",
    generating: "Génération de votre image...",
    generatingTime: "Cela peut prendre jusqu'à 30 secondes",
    complete: "Génération Terminée !",
    model: "Modèle : {{model}}",
    // Image-to-image
    referenceImage: "Image de Référence",
    referenceImageHint: "Votre image sera transformée selon la description",
    imageToImage: "Image vers Image",
    strength: "Force de Transformation",
    strengthLow: "Subtile",
    strengthHigh: "Forte",
  },

  // Speech
  speech: {
    title: "Texte en Parole",
    subtitle: "Convertissez le texte en parole naturelle",
    text: "Texte",
    textPlaceholder: "Entrez le texte que vous voulez convertir en parole...",
    characters: "{{count}}/5000 caractères",
    voice: "Voix",
    generateSpeech: "Générer la Parole",
    generating: "Génération de la parole...",
    generatingTime: "Cela peut prendre quelques secondes",
    complete: "Génération Terminée !",
    voiceLabel: "Voix : {{voice}}",
    tapToPlay: "Appuyez pour écouter",
    playing: "Lecture en cours...",
  },

  // Premium
  premium: {
    title: "Passer à Premium",
    subtitle: "Débloquez toutes les fonctionnalités et obtenez un accès illimité",
    subscribeNow: "S'abonner Maintenant",
    subscribe: "S'abonner",
    startFreeTrial: "Commencer l'Essai Gratuit",
    restorePurchases: "Restaurer les Achats",
    restore: "Restaurer les Achats",
    restoreNoPurchasesTitle: "Aucun achat trouvé",
    restoreNoPurchasesMessage:
      "Nous n'avons trouvé aucun abonnement précédent pour ce compte. Vérifiez que vous êtes connecté avec le même compte de la boutique que celui utilisé pour l'achat.",
    restoreFailedTitle: "Échec de la restauration",
    restoreFailedMessage:
      "Une erreur s'est produite lors de la restauration de vos achats. Veuillez réessayer.",
    securedByApple: "Sécurisé par Apple. Annulez à tout moment.",
    securedByGoogle: "Sécurisé par Google Play. Annulez à tout moment.",
    guarantee: "Annulez à tout moment. Sans questions.",
    popular: "Plus Populaire",
    bestValue: "Meilleure Offre",
    yearly: "Annuel",
    monthly: "Mensuel",
    perMonth: "mois",
    month: "mois",
    year: "an",
    billedMonthly: "Facturé mensuellement",
    save: "Économisez",
    dayFreeTrial: "Jour d'Essai Gratuit",
    disclaimer:
      "Les abonnements seront automatiquement renouvelés sauf annulation dans les 24 heures précédant la fin de la période en cours. Vous pouvez annuler à tout moment dans les paramètres de votre compte iTunes.",
    features: {
      unlimited: "Générations Illimitées",
      unlimitedDesc: "Créez autant d'images et de fichiers audio que vous voulez",
      priority: "Traitement Prioritaire",
      priorityDesc: "Évitez la file et obtenez des résultats plus rapides",
      exclusive: "Modèles Exclusifs",
      exclusiveDesc: "Accès aux modèles d'IA premium",
      noAds: "Sans Publicités",
      noAdsDesc: "Profitez de l'app sans aucune publicité",
    },
    // Benefit items
    benefit: {
      unlimited: {
        title: "Générations Illimitées",
        description: "Créez autant d'images, vidéos et audio que vous voulez",
      },
      quality: {
        title: "Qualité Premium",
        description: "Accès à des résolutions plus élevées et de meilleurs modèles",
      },
      priority: {
        title: "Traitement Prioritaire",
        description: "Évitez la file et obtenez des résultats plus rapides",
      },
      exclusive: {
        title: "Fonctionnalités Exclusives",
        description: "Accès anticipé aux nouveaux modèles IA et fonctionnalités",
      },
      noAds: {
        title: "Sans Publicités",
        description: "Profitez de l'app sans aucune interruption",
      },
      support: {
        title: "Support Prioritaire",
        description:
          "Obtenez de l'aide quand vous en avez besoin avec des temps de réponse plus rapides",
      },
    },
  },

  // Settings
  settings: {
    title: "Paramètres",
    appearance: "Apparence",
    theme: "Thème",
    light: "Clair",
    dark: "Sombre",
    system: "Système",
    notifications: "Notifications",
    dailyReminders: "Rappels Quotidiens",
    achievementAlerts: "Alertes de Réussite",
    weeklySummary: "Résumé Hebdomadaire",
    preferences: "Préférences",
    language: "Langue",
    useCelsius: "Utiliser Celsius",
    about: "À Propos",
    privacyPolicy: "Politique de Confidentialité",
    termsOfService: "Conditions d'Utilisation",
    version: "Version",
  },

  // Profile
  profile: {
    title: "Profil",
    editProfile: "Modifier le Profil",
    updateInfo: "Mettez à jour vos informations personnelles",
    privacySecurity: "Confidentialité et Sécurité",
    managePrivacy: "Gérez vos paramètres de confidentialité",
    customizeNotifications: "Personnalisez vos notifications",
    helpSupport: "Aide et Support",
    getHelp: "Obtenez de l'aide et contactez le support",
    upgradeToPremium: "Passer à Premium",
    unlockFeatures:
      "Débloquez toutes les fonctionnalités et obtenez un accès illimité au contenu premium.",
    upgradeNow: "Améliorer Maintenant",
    premiumMember: "Membre Premium",
    avatarHint: "Avatar mis à jour selon votre nom",
    emailCannotChange: "L'e-mail ne peut pas être modifié",
    profileUpdated: "Profil mis à jour avec succès",
  },

  // Analytics
  analytics: {
    title: "Analytiques",
    viewStats: "Voir vos statistiques d'utilisation",
    yourStats: "Vos Statistiques",
    totalGenerations: "Générations Totales",
    thisWeek: "Cette Semaine",
    credits: "Crédits",
    remaining: "Restants",
    unlimited: "Illimité",
    growth: "Croissance",
    weekOverWeek: "Semaine après semaine",
    generationBreakdown: "Répartition des Générations",
    imageGenerations: "Générations d'Images",
    speechGenerations: "Générations de Parole",
    creditsRemaining: "Crédits Restants",
    ofTotal: "{{percent}}% du total",
    freeTier: "Niveau gratuit",
    premium: "Premium",
    featureUsage: "Utilisation des Fonctionnalités",
    insights: "Perspectives",
    noGenerationsYet:
      "Vous n'avez pas encore créé de génération. Commencez à créer pour voir vos stats !",
    generationsTotal: "Vous avez créé {{count}} génération(s) au total",
    generationsThisWeek: "{{count}} génération(s) cette semaine - continuez !",
    lowCredits: "Peu de crédits ! Envisagez de passer à Premium pour des générations illimitées.",
  },

  // Errors
  errors: {
    generic: "Quelque chose s'est mal passé. Veuillez réessayer.",
    network: "Erreur réseau. Veuillez vérifier votre connexion.",
    noCredits: "Vous n'avez plus de crédits.",
    noCreditsUpgrade: "Passez à Premium pour des générations illimitées !",
    unauthorized: "Veuillez vous connecter pour continuer.",
    notFound: "La ressource demandée n'a pas été trouvée.",
    serverError: "Erreur serveur. Veuillez réessayer plus tard.",
    rateLimited: "Trop de requêtes. Veuillez patienter un moment.",
    invalidInput: "Entrée invalide. Veuillez vérifier vos données.",
    emptyName: "Le nom ne peut pas être vide",
    textTooLong: "Le texte est trop long. Maximum 5000 caractères autorisés.",
    enterText: "Veuillez entrer du texte à convertir en parole",
    promptTooLong: "La description est trop longue. Maximum 1000 caractères autorisés.",
    // File errors
    fileNotFound: "Le fichier n'existe pas",
    imageNotFound: "Le fichier image n'existe pas",
    fileTooLarge: "Fichier trop volumineux. Taille maximale : {{size}}Mo",
    imageTooLarge: "Image trop volumineuse. Taille maximale : {{size}}Mo",
    unsupportedAudioFormat: "Format non supporté. Supportés : MP3, WAV, M4A, FLAC, OGG, WEBM",
    unsupportedImageFormat: "Format non supporté. Supportés : JPEG, PNG, GIF, WEBP",
    failedToReadFile: "Échec de la lecture du fichier",
    failedToReadImage: "Échec de la lecture du fichier image",
    failedToReadAudio: "Échec de la lecture du fichier audio",
    // API errors
    rateLimit: "Limite de requêtes dépassée. Veuillez réessayer plus tard.",
    insufficientCreditsTranscription: "Crédits insuffisants pour la transcription.",
    insufficientCreditsImage: "Crédits insuffisants pour l'analyse d'image.",
    insufficientCreditsVideo: "Crédits insuffisants pour la génération vidéo.",
    insufficientCreditsChat: "Crédits insuffisants pour le chat.",
    timeoutLarge: "Délai expiré. Les fichiers volumineux peuvent prendre plus de temps.",
    timeoutVideo: "Délai expiré. La génération vidéo prend du temps, veuillez réessayer.",
    timeout: "Délai expiré. Veuillez réessayer.",
    // Validation errors
    messageEmpty: "Le message ne peut pas être vide",
    messageTooLong: "Le message est trop long. Maximum {{count}} caractères autorisés.",
    invalidPrompt: "Description invalide",
    // Generation errors
    failedToGenerateImage: "Échec de la génération d'image",
    failedToGenerateSpeech: "Échec de la génération de parole",
    failedToGenerateVideo: "Échec de la génération vidéo",
    failedToTranscribe: "Échec de la transcription audio",
    failedToAnalyzeImage: "Échec de l'analyse d'image",
    failedToSendMessage: "Échec de l'envoi du message",
  },

  // Offline
  offline: {
    title: "Vous êtes Hors Ligne",
    message: "Veuillez vérifier votre connexion internet et réessayer.",
    cachedData: "Affichage des données en cache",
    pendingSync: "{{count}} élément(s) en attente de synchronisation",
  },

  // States
  states: {
    // Loading states
    loading: "Chargement...",
    pleaseWait: "Veuillez patienter...",
    processing: "Traitement en cours...",
    almostDone: "Presque terminé...",
    // Empty states
    noData: "Pas Encore de Données",
    noDataDesc: "Commencez à créer pour voir votre contenu ici.",
    noResults: "Aucun Résultat",
    noResultsDesc: "Essayez d'ajuster votre recherche ou vos filtres.",
    // Error states
    somethingWrong: "Quelque Chose s'est Mal Passé",
    tryAgain: "Réessayer",
    // Success states
    success: "Succès !",
    completed: "Terminé !",
    saved: "Enregistré !",
  },

  // Generations
  generations: {
    title: "Générations",
    noGenerations: "Pas Encore de Générations",
    noGenerationsDesc: "Commencez à créer pour voir votre historique de générations ici.",
    createFirst: "Créez Votre Première",
  },

  // Video Generation
  videoGeneration: {
    title: "Génération Vidéo",
    subtitle: "Créez des vidéos avec l'IA",
    prompt: "Description",
    promptPlaceholder: "Décrivez la vidéo que vous voulez créer...",
    aspectRatio: "Format d'Image",
    generateVideo: "Générer Vidéo",
    generating: "Génération de votre vidéo...",
    generatingTime: "Cela peut prendre jusqu'à 2 minutes",
    complete: "Génération Terminée !",
    enterPrompt: "Veuillez entrer une description pour générer une vidéo",
    savedToGallery: "Vidéo enregistrée dans la galerie",
    comingSoon: "Bientôt Disponible",
    comingSoonDesc: "La génération vidéo sera bientôt disponible. Restez à l'écoute !",
    // Image inputs
    referenceImages: "Images de Référence",
    startImage: "Image de Début",
    startImageHint: "Première image de la vidéo",
    endImage: "Image de Fin",
    endImageHint: "Dernière image de la vidéo",
    imageToVideo: "Image vers Vidéo",
    imageToVideoHint: "Créez une vidéo à partir de votre image",
  },

  // Transcription
  transcription: {
    title: "Transcription Audio",
    subtitle: "Convertissez l'audio en texte",
    audioFile: "Fichier Audio",
    tapToSelect: "Appuyez pour sélectionner un fichier audio",
    supportedFormats: "MP3, WAV, M4A, FLAC supportés",
    selectFile: "Veuillez d'abord sélectionner un fichier audio",
    clearFile: "Effacer le fichier",
    transcribe: "Transcrire l'Audio",
    transcribing: "Transcription en cours...",
    transcribingTime: "Cela peut prendre quelques minutes",
    complete: "Transcription Terminée !",
    copied: "Transcription copiée dans le presse-papiers",
    // Recording
    recordAudio: "Enregistrer Audio",
    tapToRecord: "Enregistrez votre voix directement",
    startRecording: "Démarrer l'Enregistrement",
    stopRecording: "Arrêter l'Enregistrement",
    recording: "Enregistrement en cours...",
    orSelectFile: "ou sélectionnez un fichier",
    microphonePermission: "L'autorisation du microphone est requise pour enregistrer",
    // Playback
    playAudio: "Lecture",
    stopPlayback: "Arrêter",
  },

  // Image Identification
  imageIdentify: {
    title: "Identification d'Image",
    subtitle: "Analysez et identifiez les images",
    selectImageLabel: "Sélectionner Image",
    fromGallery: "Depuis la Galerie",
    takePhoto: "Prendre une Photo",
    selectImage: "Veuillez d'abord sélectionner une image",
    analyze: "Analyser l'Image",
    analyzing: "Analyse en cours...",
    analyzingTime: "Cela peut prendre quelques secondes",
    complete: "Analyse Terminée !",
    cameraPermission: "L'autorisation de la caméra est requise pour prendre des photos",
    galleryPermission:
      "L'autorisation de la bibliothèque photo est requise pour sélectionner des images",
    copied: "Analyse copiée dans le presse-papiers",
    imageSaved: "Image enregistrée dans la galerie",
  },

  // Chat
  chat: {
    title: "Chat IA",
    placeholder: "Tapez votre message...",
    emptyState: "Démarrez une conversation",
    emptyHint: "Posez-moi n'importe quelle question ! Je suis là pour aider.",
    thinking: "Réflexion en cours...",
    clearChat: "Effacer le Chat",
    clearChatConfirm: "Êtes-vous sûr de vouloir effacer l'historique du chat ?",
  },

  // Image Picker
  imagePicker: {
    selectSource: "Sélectionner la Source d'Image",
    selectImage: "Appuyez pour sélectionner une image",
    fromGallery: "Depuis la Galerie",
    takePhoto: "Prendre une Photo",
    cameraPermission: "L'autorisation de la caméra est requise pour prendre des photos",
    galleryPermission:
      "L'autorisation de la bibliothèque photo est requise pour sélectionner des images",
    optional: "(Optionnel)",
  },

  // Gallery
  gallery: {
    title: "Galerie",
    subtitle: "Vos créations",
    item: "élément",
    items: "éléments",
    noGenerations: "Pas Encore de Créations",
    noGenerationsDesc: "Commencez à créer pour voir votre galerie ici.",
    noItemsInCategory: "Aucun Élément dans Cette Catégorie",
    tryDifferentFilter: "Essayez de sélectionner un filtre différent pour voir plus d'éléments.",
    createFirst: "Créez Votre Première",
    showAll: "Afficher Tout",
    // Detail modal
    prompt: "Description",
    provider: "Fournisseur",
    creditsUsed: "Crédits Utilisés",
    createdAt: "Créé le",
    save: "Enregistrer",
    savedToGallery: "Enregistré dans la galerie",
    saveFailed: "Échec de l'enregistrement du fichier",
    permissionDenied: "Autorisation refusée. Veuillez l'activer dans les paramètres.",
    copiedToClipboard: "Copié dans le presse-papiers",
    deleteConfirm: "Êtes-vous sûr de vouloir supprimer cet élément ?",
    // Content types
    transcription: "Transcription",
    analysis: "Analyse",
    noContent: "Aucun contenu disponible",
    // Audio
    tapToPlay: "Appuyez pour écouter",
    playing: "Lecture en cours...",
    // Filters
    all: "Tout",
    images: "Images",
    videos: "Vidéos",
    audio: "Audio",
    text: "Texte",
  },
};
