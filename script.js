/* ============================================================
   IMPORTS & CONFIGURATION FIREBASE
   ============================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc,
    query, where, orderBy, onSnapshot, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
    getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
    onAuthStateChanged, signOut, updatePassword,
    EmailAuthProvider, reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDyL6_8NicvBXO2WYyb4K5ksb-Ue1y5VO4",
    authDomain: "teachermeals-6683c.firebaseapp.com",
    projectId: "teachermeals-6683c",
    storageBucket: "teachermeals-6683c.firebasestorage.app",
    messagingSenderId: "479194594406",
    appId: "1:479194594406:web:d56a5afdf3097d8ebb41a7",
    measurementId: "G-KZP2HBPELR"
};

const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

/* ============================================================
   STATE
   ============================================================ */
const state = {
    currentUser: null,  // { uid, email, role, firstName, lastName }
    orders: [],
    menu: [],
    lang: localStorage.getItem('lang') || 'fr'
};

const i18n = {
    fr: {
        welcome: 'Bon retour !', welcomeSub: 'Nous sommes heureux de vous revoir.',
        createAccount: 'Créer un compte', createSub: 'Rejoignez TeacherMeals.',
        signinBtn: 'Se connecter', registerBtn: "S'inscrire",
        newHere: 'Nouveau ici ?', alreadyAccount: 'Déjà un compte ?',
        createLink: 'Créer un compte', signinLink: 'Se connecter', langLabel: 'Langue : FR',
        navHome: 'Accueil', navOrder: 'Commander', navManagement: 'Gestion', navContact: 'Contact', navSignin: 'Connexion', navProfile: 'Profil',
        homeTitle: 'Réservation Repas Professeurs', homeDescription: 'Précommandez vos repas quotidiens du lundi au vendredi. Frais, pratiques et prêts à récupérer.',
        statusClosed: 'Fermé', statusReturnMonday: 'Retour lundi', statusOpen: 'Ouvert', statusOrdersOpen: 'Commandes ouvertes',
        step1Title: 'Se Connecter', step1Desc: 'Connectez-vous avec vos identifiants scolaires.',
        step2Title: 'Commander', step2Desc: 'Sélectionnez entrée, plat et dessert avant minuit.',
        step3Title: 'Récupérer', step3Desc: 'Récupérez votre repas à la cantine le jour suivant.',
        faqTitle: 'Questions Fréquentes', faq1Q: 'Quand les commandes sont-elles remises à zéro ?', faq1A: 'Les commandes sont remises à zéro chaque soir à 00:00 CET.',
        faq2Q: 'Puis-je commander le weekend ?', faq2A: 'Non, le site est fermé samedi et dimanche. Retour lundi.',
        faq3Q: "Jusqu'à quand puis-je modifier ma commande ?", faq3A: "Jusqu'à minuit la veille du jour de retrait.",
        orderTitle: 'Commande du Jour', weekendBanner: 'Site fermé le weekend.', orderYourInfo: 'Vos informations', orderFirstName: 'Prénom *', orderLastName: 'Nom *',
        extrasTitle: 'Extras & Accessoires', extraCutlery: 'Couverts', extraNapkin: 'Serviette', extraSauces: 'Sauces', extraAllergies: 'Allergies',
        orderNotes: 'Notes / Autres', orderNotesPlaceholder: 'Précisez ici vos allergies, préférences de sauces, ou toute autre demande spéciale…',
        cartArticle: 'article', cartArticles: 'articles', validateOrder: 'Valider la Commande →', cancel: 'Annuler',
        modalConfirmTitle: 'Confirmer votre commande', modalConfirmEmailSent: 'Un email de confirmation va être envoyé à :', modalConfirmClickLink: "Cliquez sur le lien dans l'email pour valider définitivement votre commande.",
        modalSendEmail: "Envoyer l'email de confirmation", modalCancel: 'Annuler',
        backToOrder: 'Modifier la commande', paymentTitle: 'Paiement', paymentMethodTitle: 'Moyen de paiement', paymentCard: 'Carte bancaire', paymentCash: 'Espèces', paymentBadge: 'Badge école',
        cardNumber: 'Numéro de carte', cardExpiry: 'Expiration', cardName: 'Nom sur la carte', securePayment: 'Paiement sécurisé — SSL', confirmPaymentBtn: 'Confirmer le paiement',
        recapTitle: 'Récapitulatif', recapSubtotal: 'Sous-total', recapExtras: 'Extras', recapTotal: 'Total', recapPickupDate: 'Retrait le :', recapNone: 'Aucun',
        successTitle: 'Commande confirmée !', successMessage: 'Votre repas sera prêt demain matin. Un email de confirmation a été envoyé.', successRef: 'Réf.', successBackHome: "Retour à l'accueil",
        loading: 'Chargement…', validating: 'Validation…', saving: 'Sauvegarde…', saveChanges: 'Enregistrer les modifications',
        catStarter: 'Entrées', catMain: 'Plats principaux', catDessert: 'Desserts', catMaxPerCategory: 'max', catMaxPerCategorySuffix: 'par catégorie', stockLabel: 'Stock :',
        tagVeg: 'Végé', tagVegan: 'Vegan', tagGlutenfree: 'S.Gluten', tagHalal: 'Halal', tagSpicy: 'Épicé',
        adminTitle: 'Tableau de Bord Admin', adminTabOrders: 'Commandes', adminTabMenu: 'Gérer le menu',
        adminSearchPlaceholder: 'Rechercher un professeur…', allStatuses: 'Tous les statuts', statusConfirmed: 'Confirmée', statusModified: 'Modifiée', statusCancelled: 'Annulée', exportCSV: 'Exporter CSV',
        thTeacher: 'Professeur', thTime: 'Heure', thStarter: 'Entrée', thMain: 'Plat', thDessert: 'Dessert', thExtras: 'Extras', thTotal: 'Total', thStatut: 'Statut', thActions: 'Actions',
        menuFormTitle: 'Ajouter un plat', addDish: 'Ajouter un plat', addTheDish: 'Ajouter le plat', dishName: 'Nom du plat *', dishCategory: 'Catégorie *', chooseCategory: 'Choisir…',
        categoryStarter: 'Entrée', categoryMain: 'Plat principal', categoryDessert: 'Dessert', priceLabel: 'Prix (€) *', limitedStock: 'Stock limité (0 = illimité)', tagsLabel: 'Étiquettes',
        tagVegetarian: 'Végétarien', tagVeganMenu: 'Végétalien', tagGlutenFree: 'Sans Gluten', tagHalalMenu: 'Halal', tagSpicyMenu: 'Épicé', visibleInMenu: 'Visible dans le menu', cancelBtn: 'Annuler', saveBtn: 'Enregistrer',
        currentMenu: 'Menu actuel', noOrders: 'Aucune commande pour le moment.', noOrdersAdmin: 'Aucune commande pour le moment.', confirmBtn: 'Confirmer', deleteBtn: 'Supprimer',
        hideBtn: 'Masquer', showBtn: 'Afficher', editBtn: 'Modifier', deleteDishConfirm: 'Supprimer ce plat ?', editDishTitle: 'Modifier',
        contactTitle: 'Contact Support', problemType: 'Type de problème', selectOption: 'Sélectionner…', typeBilling: 'Facturation', typeOrderProblem: 'Problème de commande', typeMenuProblem: 'Problème de menu', typeAccount: 'Compte', typeOther: 'Autre',
        detailsLabel: 'Détails (20-2000 caractères)', detailsPlaceholder: 'Décrivez votre problème en détail…', submitAnonymously: 'Soumettre anonymement', sendBtn: 'Envoyer',
        contactThanks: 'Merci pour votre retour', contactReply: 'Nous vous répondrons dans les plus brefs délais.',
        backToHome: "Retour à l'accueil", help: 'Aide', helpCenter: "Centre d'aide", quickSettings: 'Paramètres rapides', signIn: 'Connexion', signOut: 'Déconnexion', settingsAria: 'Paramètres',
        profileNavAccount: 'Mon compte', profileNavHistory: 'Historique', profileNavSettings: 'Paramètres', profileNavLogout: 'Se déconnecter',
        myAccount: 'Mon Compte', personalInfo: 'Informations personnelles', firstName: 'Prénom', lastName: 'Nom', emailAddress: 'Adresse e-mail',
        passwordSection: 'Mot de passe', currentPassword: 'Mot de passe actuel', newPassword: 'Nouveau mot de passe', confirmNewPassword: 'Confirmer le nouveau mot de passe', changePassword: 'Changer le mot de passe',
        ordersHistory: 'Historique des commandes', ordersKept10Days: 'Les commandes sont conservées pendant 10 jours.', noRecentOrders: 'Aucune commande récente.',
        settingsDisplay: 'Affichage', darkMode: 'Mode sombre', darkModeDesc: 'Basculer entre le thème clair et sombre', interfaceLanguage: "Langue de l'interface", interfaceLanguageDesc: "Langue d'affichage du site", french: 'Français', english: 'English',
        settingsNotifications: 'Notifications', emailConfirm: 'Confirmation par e-mail', emailConfirmDesc: 'Recevoir un email à chaque commande', dailyReminder: 'Rappel quotidien', dailyReminderDesc: 'Rappel à 10h si aucune commande passée',
        settingsOrders: 'Commandes', autoOrders: 'Commandes automatiques', autoOrdersDesc: 'Reconduire la commande précédente si aucune action', saveExtras: 'Sauvegarde des extras', saveExtrasDesc: 'Mémoriser mes accessoires préférés',
        settingsPrivacy: 'Confidentialité & Sécurité', historyVisibleAdmin: "Historique visible par l'admin", historyVisibleAdminDesc: 'Autoriser les administrateurs à consulter vos commandes', deleteAccount: 'Supprimer mon compte', deleteAccountDesc: "Action irréversible — toutes vos données seront effacées",
        privacy: 'Confidentialité', terms: 'Conditions', privacyTitle: 'Politique de Confidentialité', termsTitle: "Conditions d'Utilisation", backBtn: 'Retour', lastUpdate: 'Dernière mise à jour : février 2026',
        privacy1Title: '1. Données collectées', privacy1Content: 'Nous collectons uniquement les informations nécessaires : nom, prénom, adresse e-mail et préférences de commande. Aucune donnée bancaire n\'est stockée sur nos serveurs.',
        privacy2Title: '2. Utilisation des données', privacy2Content: 'Vos données sont utilisées exclusivement pour gérer vos réservations de repas et améliorer le service. Elles ne sont ni vendues ni partagées avec des tiers à des fins commerciales.',
        privacy3Title: '3. Conservation', privacy3Content: 'Les données de commande sont conservées pendant 12 mois à compter de la dernière activité. Vous pouvez demander la suppression de votre compte à tout moment en contactant le support.',
        privacy4Title: '4. Vos droits', privacy4Content: 'Conformément au RGPD, vous disposez d\'un droit d\'accès, de rectification et de suppression de vos données. Pour exercer ces droits, contactez-nous via la page Contact.',
        privacy5Title: '5. Cookies', privacy5Content: "Nous utilisons uniquement des cookies essentiels au fonctionnement du service (session, préférences d'affichage). Aucun cookie publicitaire ou de traçage n'est utilisé.",
        terms1Title: '1. Accès au service', terms1Content: "Le service TeacherMeals est réservé au personnel enseignant de l'établissement. L'accès est conditionné à la possession d'identifiants scolaires valides.",
        terms2Title: '2. Commandes', terms2Content: "Les commandes doivent être passées avant minuit la veille du jour souhaité. Maximum 3 articles par catégorie. Le service est indisponible les weekends et jours fériés. Toute commande validée engage l'utilisateur.",
        terms3Title: '3. Annulation', terms3Content: "Une commande peut être annulée jusqu'à minuit la veille du repas. Passé ce délai, le repas sera préparé et facturé normalement.",
        terms4Title: '4. Comportement', terms4Content: "Les utilisateurs s'engagent à utiliser le service de bonne foi et à ne pas tenter d'en perturber le fonctionnement. Tout abus pourra entraîner la suspension du compte.",
        terms5Title: '5. Responsabilité', terms5Content: "L'établissement ne saurait être tenu responsable des interruptions de service dues à des raisons techniques ou de force majeure. En cas de problème, contactez le support via la page Contact.",
        toastMenuLoadError: 'Impossible de charger le menu.', toastOrderSendError: "Erreur lors de l'envoi : ", toastOrdersLoadError: 'Erreur chargement commandes – voir la console.',
        toastPasswordsDontMatch: 'Les mots de passe ne correspondent pas !', toastWelcome: 'Compte créé ! Bienvenue ', toastSigninSuccess: 'Connexion réussie.', toastAuthError: "Erreur d'authentification.",
        toastEmailInUse: "Cet email est déjà utilisé.", toastWeakPassword: 'Mot de passe trop faible (6 car. min).', toastInvalidEmail: 'Adresse email invalide.', toastInvalidCredential: 'Email ou mot de passe incorrect.',
        toastLoggedOut: 'Déconnecté.', toastOrderCancelled: 'Commande annulée', toastMessageSent: 'Message envoyé !', toastProfileUpdated: 'Profil mis à jour !', toastError: 'Erreur : ', toastSaveModifications: 'Enregistrer les modifications',
        toastPasswordsDontMatch2: 'Les mots de passe ne correspondent pas.', toastMinChars: '6 caractères minimum.', toastPasswordChanged: 'Mot de passe modifié !', toastPwdError: 'Erreur changement mot de passe.', toastPwdWrong: 'Mot de passe actuel incorrect.',
        toastPleaseSignIn: "Veuillez vous connecter d'abord", toastAdminOnly: 'Accès réservé aux administrateurs', toastEmptyCart: 'Panier vide !', toastConfirmEmailSent: 'Email de confirmation envoyé !',
        toastInvalidCard: 'Numéro de carte invalide', toastInvalidExpiry: "Date d'expiration invalide", toastMaxItems: 'Maximum ', toastMaxItemsSuffix: ' articles', toastMaxPerCategory: 'Maximum ', toastMaxPerCategorySuffix: ' par catégorie',
        toastFillRequired: 'Remplissez tous les champs obligatoires.', toastDishUpdated: ' mis à jour !', toastDishAdded: ' ajouté !', toastDishDeleted: 'Plat supprimé.', toastErrorVisibility: 'Erreur visibilité', toastErrorDelete: 'Erreur suppression',
        toastNoOrdersExport: 'Aucune commande à exporter.', toastExportDownloaded: 'Export CSV téléchargé !', toastStatusUpdated: 'Statut → ', toastErrorStatus: 'Erreur mise à jour statut',
        toastCancelOrderConfirm: 'Annuler la commande ?', extrasLabel: 'Extras : ', confirmedCount: ' confirmée', confirmedCountPlural: ' confirmées', modifiedCount: ' modifiée', modifiedCountPlural: ' modifiées', totalLabel: 'Total : ',
        ordersCount: ' commande', ordersCountPlural: ' commandes', limitedLabel: 'Limité : ', editDishTitlePrefix: 'Modifier "', csvRef: 'Référence', csvTeacher: 'Professeur', csvEmail: 'Email', csvTime: 'Heure', csvStarter: 'Entrée', csvMain: 'Plat', csvDessert: 'Dessert', csvExtras: 'Extras', csvNotes: 'Notes', csvPayment: 'Paiement', csvTotal: 'Total', csvStatus: 'Statut',
        metaDescription: 'Système de précommande de repas pour les professeurs', pageTitle: 'Réservation Repas Professeurs',
        authSubtitle: '', forgotPassword: 'Mot de passe oublié ?', rememberMe: 'Se souvenir de moi', confirmPassword: 'Confirmer le mot de passe'
    },
    en: {
        welcome: 'Welcome back!', welcomeSub: "We're so excited to see you again!",
        createAccount: 'Create an account', createSub: 'Join TeacherMeals today.',
        signinBtn: 'Sign In', registerBtn: 'Register',
        newHere: 'New here?', alreadyAccount: 'Already have an account?',
        createLink: 'Create an account', signinLink: 'Sign In', langLabel: 'Language: EN',
        navHome: 'Home', navOrder: 'Order', navManagement: 'Management', navContact: 'Contact', navSignin: 'Sign In', navProfile: 'Profile',
        homeTitle: 'Teacher Meal Reservation', homeDescription: 'Pre-order your daily meals Monday to Friday. Fresh, convenient and ready to pick up.',
        statusClosed: 'Closed', statusReturnMonday: 'Back Monday', statusOpen: 'Open', statusOrdersOpen: 'Orders open',
        step1Title: 'Sign In', step1Desc: 'Sign in with your school credentials.',
        step2Title: 'Order', step2Desc: 'Select starter, main and dessert before midnight.',
        step3Title: 'Pick Up', step3Desc: 'Pick up your meal at the canteen the next day.',
        faqTitle: 'Frequently Asked Questions', faq1Q: 'When are orders reset?', faq1A: 'Orders are reset every evening at 00:00 CET.',
        faq2Q: 'Can I order on weekends?', faq2A: 'No, the site is closed Saturday and Sunday. Back Monday.',
        faq3Q: 'Until when can I modify my order?', faq3A: 'Until midnight the day before pickup.',
        orderTitle: "Today's Order", weekendBanner: 'Site closed on weekends.', orderYourInfo: 'Your information', orderFirstName: 'First name *', orderLastName: 'Last name *',
        extrasTitle: 'Extras & Accessories', extraCutlery: 'Cutlery', extraNapkin: 'Napkin', extraSauces: 'Sauces', extraAllergies: 'Allergies',
        orderNotes: 'Notes / Other', orderNotesPlaceholder: 'Specify allergies, sauce preferences, or any special request…',
        cartArticle: 'item', cartArticles: 'items', validateOrder: 'Validate Order →', cancel: 'Cancel',
        modalConfirmTitle: 'Confirm your order', modalConfirmEmailSent: 'A confirmation email will be sent to:', modalConfirmClickLink: 'Click the link in the email to finally validate your order.',
        modalSendEmail: 'Send confirmation email', modalCancel: 'Cancel',
        backToOrder: 'Edit order', paymentTitle: 'Payment', paymentMethodTitle: 'Payment method', paymentCard: 'Credit card', paymentCash: 'Cash', paymentBadge: 'School badge',
        cardNumber: 'Card number', cardExpiry: 'Expiry', cardName: 'Name on card', securePayment: 'Secure payment — SSL', confirmPaymentBtn: 'Confirm payment',
        recapTitle: 'Summary', recapSubtotal: 'Subtotal', recapExtras: 'Extras', recapTotal: 'Total', recapPickupDate: 'Pickup:', recapNone: 'None',
        successTitle: 'Order confirmed!', successMessage: 'Your meal will be ready tomorrow morning. A confirmation email has been sent.', successRef: 'Ref.', successBackHome: 'Back to home',
        loading: 'Loading…', validating: 'Validating…', saving: 'Saving…', saveChanges: 'Save changes',
        catStarter: 'Starters', catMain: 'Main courses', catDessert: 'Desserts', catMaxPerCategory: 'max', catMaxPerCategorySuffix: 'per category', stockLabel: 'Stock:',
        tagVeg: 'Veg', tagVegan: 'Vegan', tagGlutenfree: 'GF', tagHalal: 'Halal', tagSpicy: 'Spicy',
        adminTitle: 'Admin Dashboard', adminTabOrders: 'Orders', adminTabMenu: 'Manage menu',
        adminSearchPlaceholder: 'Search for a teacher…', allStatuses: 'All statuses', statusConfirmed: 'Confirmed', statusModified: 'Modified', statusCancelled: 'Cancelled', exportCSV: 'Export CSV',
        thTeacher: 'Teacher', thTime: 'Time', thStarter: 'Starter', thMain: 'Main', thDessert: 'Dessert', thExtras: 'Extras', thTotal: 'Total', thStatut: 'Status', thActions: 'Actions',
        menuFormTitle: 'Add a dish', addDish: 'Add a dish', addTheDish: 'Add dish', dishName: 'Dish name *', dishCategory: 'Category *', chooseCategory: 'Choose…',
        categoryStarter: 'Starter', categoryMain: 'Main course', categoryDessert: 'Dessert', priceLabel: 'Price (€) *', limitedStock: 'Limited stock (0 = unlimited)', tagsLabel: 'Tags',
        tagVegetarian: 'Vegetarian', tagVeganMenu: 'Vegan', tagGlutenFree: 'Gluten free', tagHalalMenu: 'Halal', tagSpicyMenu: 'Spicy', visibleInMenu: 'Visible in menu', cancelBtn: 'Cancel', saveBtn: 'Save',
        currentMenu: 'Current menu', noOrders: 'No orders at the moment.', noOrdersAdmin: 'No orders at the moment.', confirmBtn: 'Confirm', deleteBtn: 'Delete',
        hideBtn: 'Hide', showBtn: 'Show', editBtn: 'Edit', deleteDishConfirm: 'Delete this dish?', editDishTitle: 'Edit',
        contactTitle: 'Contact Support', problemType: 'Problem type', selectOption: 'Select…', typeBilling: 'Billing', typeOrderProblem: 'Order problem', typeMenuProblem: 'Menu problem', typeAccount: 'Account', typeOther: 'Other',
        detailsLabel: 'Details (20-2000 characters)', detailsPlaceholder: 'Describe your problem in detail…', submitAnonymously: 'Submit anonymously', sendBtn: 'Send',
        contactThanks: 'Thank you for your feedback', contactReply: 'We will get back to you as soon as possible.',
        backToHome: 'Back to home', help: 'Help', helpCenter: 'Help center', quickSettings: 'Quick settings', signIn: 'Sign In', signOut: 'Sign Out', settingsAria: 'Settings',
        profileNavAccount: 'My account', profileNavHistory: 'History', profileNavSettings: 'Settings', profileNavLogout: 'Sign out',
        myAccount: 'My Account', personalInfo: 'Personal information', firstName: 'First name', lastName: 'Last name', emailAddress: 'Email address',
        passwordSection: 'Password', currentPassword: 'Current password', newPassword: 'New password', confirmNewPassword: 'Confirm new password', changePassword: 'Change password',
        ordersHistory: 'Order history', ordersKept10Days: 'Orders are kept for 10 days.', noRecentOrders: 'No recent orders.',
        settingsDisplay: 'Display', darkMode: 'Dark mode', darkModeDesc: 'Switch between light and dark theme', interfaceLanguage: 'Interface language', interfaceLanguageDesc: 'Site display language', french: 'Français', english: 'English',
        settingsNotifications: 'Notifications', emailConfirm: 'Email confirmation', emailConfirmDesc: 'Receive an email for each order', dailyReminder: 'Daily reminder', dailyReminderDesc: 'Reminder at 10am if no order placed',
        settingsOrders: 'Orders', autoOrders: 'Auto orders', autoOrdersDesc: 'Repeat previous order if no action', saveExtras: 'Save extras', saveExtrasDesc: 'Remember my favourite accessories',
        settingsPrivacy: 'Privacy & Security', historyVisibleAdmin: 'History visible to admin', historyVisibleAdminDesc: 'Allow administrators to view your orders', deleteAccount: 'Delete my account', deleteAccountDesc: 'Irreversible action — all your data will be deleted',
        privacy: 'Privacy', terms: 'Terms', privacyTitle: 'Privacy Policy', termsTitle: 'Terms of Use', backBtn: 'Back', lastUpdate: 'Last updated: February 2026',
        privacy1Title: '1. Data collected', privacy1Content: 'We only collect the necessary information: name, email address and order preferences. No payment data is stored on our servers.',
        privacy2Title: '2. Use of data', privacy2Content: 'Your data is used exclusively to manage your meal reservations and improve the service. It is not sold or shared with third parties for commercial purposes.',
        privacy3Title: '3. Retention', privacy3Content: 'Order data is retained for 12 months from the last activity. You can request account deletion at any time by contacting support.',
        privacy4Title: '4. Your rights', privacy4Content: 'Under GDPR, you have the right to access, rectify and delete your data. To exercise these rights, contact us via the Contact page.',
        privacy5Title: '5. Cookies', privacy5Content: 'We only use cookies essential for the service (session, display preferences). No advertising or tracking cookies are used.',
        terms1Title: '1. Access to service', terms1Content: 'The TeacherMeals service is reserved for the teaching staff of the institution. Access is conditional on having valid school credentials.',
        terms2Title: '2. Orders', terms2Content: 'Orders must be placed before midnight on the day before the desired date. Maximum 3 items per category. The service is unavailable on weekends and public holidays. Any validated order is binding.',
        terms3Title: '3. Cancellation', terms3Content: 'An order can be cancelled until midnight the day before the meal. After that, the meal will be prepared and charged as usual.',
        terms4Title: '4. Conduct', terms4Content: 'Users agree to use the service in good faith and not to attempt to disrupt its operation. Any abuse may result in account suspension.',
        terms5Title: '5. Liability', terms5Content: 'The institution cannot be held responsible for service interruptions due to technical reasons or force majeure. In case of problems, contact support via the Contact page.',
        toastMenuLoadError: 'Unable to load menu.', toastOrderSendError: 'Error sending order: ', toastOrdersLoadError: 'Error loading orders – see console.',
        toastPasswordsDontMatch: 'Passwords do not match!', toastWelcome: 'Account created! Welcome ', toastSigninSuccess: 'Sign in successful.', toastAuthError: 'Authentication error.',
        toastEmailInUse: 'This email is already in use.', toastWeakPassword: 'Password too weak (6 char. min).', toastInvalidEmail: 'Invalid email address.', toastInvalidCredential: 'Incorrect email or password.',
        toastLoggedOut: 'Signed out.', toastOrderCancelled: 'Order cancelled', toastMessageSent: 'Message sent!', toastProfileUpdated: 'Profile updated!', toastError: 'Error: ', toastSaveModifications: 'Save changes',
        toastPasswordsDontMatch2: 'Passwords do not match.', toastMinChars: 'Minimum 6 characters.', toastPasswordChanged: 'Password changed!', toastPwdError: 'Password change error.', toastPwdWrong: 'Current password incorrect.',
        toastPleaseSignIn: 'Please sign in first', toastAdminOnly: 'Access restricted to administrators', toastEmptyCart: 'Empty cart!', toastConfirmEmailSent: 'Confirmation email sent!',
        toastInvalidCard: 'Invalid card number', toastInvalidExpiry: 'Invalid expiry date', toastMaxItems: 'Maximum ', toastMaxItemsSuffix: ' items', toastMaxPerCategory: 'Maximum ', toastMaxPerCategorySuffix: ' per category',
        toastFillRequired: 'Please fill in all required fields.', toastDishUpdated: ' updated!', toastDishAdded: ' added!', toastDishDeleted: 'Dish deleted.', toastErrorVisibility: 'Visibility error', toastErrorDelete: 'Delete error',
        toastNoOrdersExport: 'No orders to export.', toastExportDownloaded: 'CSV export downloaded!', toastStatusUpdated: 'Status → ', toastErrorStatus: 'Error updating status',
        toastCancelOrderConfirm: 'Cancel order?', extrasLabel: 'Extras: ', confirmedCount: ' confirmed', confirmedCountPlural: ' confirmed', modifiedCount: ' modified', modifiedCountPlural: ' modified', totalLabel: 'Total: ',
        ordersCount: ' order', ordersCountPlural: ' orders', limitedLabel: 'Limited: ', editDishTitlePrefix: 'Edit "', csvRef: 'Reference', csvTeacher: 'Teacher', csvEmail: 'Email', csvTime: 'Time', csvStarter: 'Starter', csvMain: 'Main', csvDessert: 'Dessert', csvExtras: 'Extras', csvNotes: 'Notes', csvPayment: 'Payment', csvTotal: 'Total', csvStatus: 'Status',
        metaDescription: 'Meal pre-order system for teachers', pageTitle: 'Teacher Meal Reservation',
        authSubtitle: '', forgotPassword: 'Forgot password?', rememberMe: 'Remember me', confirmPassword: 'Confirm password'
    }
};

let isLoginMode = true;
let unsubscribeOrders = null;

/* ============================================================
   INITIALIZATION
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {

    // 1. Surveiller l'état de connexion
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                state.currentUser = { uid: user.uid, email: user.email, ...userDoc.data() };
            } else {
                state.currentUser = { uid: user.uid, email: user.email, role: 'user', firstName: 'Prof', lastName: '' };
            }
            updateAuthUI();
            prefillNameFields();
            loadUserHistory();
            if (state.currentUser.role === 'admin') subscribeToAllOrders();
        } else {
            state.currentUser = null;
            state.orders = [];
            if (unsubscribeOrders) { unsubscribeOrders(); unsubscribeOrders = null; }
            updateAuthUI();
            const currentPage = document.querySelector('.page.active')?.id;
            if (currentPage && ['order', 'management', 'profile'].includes(currentPage)) {
                navigateTo('signin');
            }
        }
    });

    // 2. Charger le menu
    await fetchMenu();

    // 3. Setup listeners & UI
    setupEventListeners();
    initTime();
    setLanguage(state.lang);
});

/* ============================================================
   FIRESTORE : MENU
   ============================================================ */
async function fetchMenu() {
    try {
        const snapshot = await getDocs(collection(db, "menu"));
        state.menu = [];
        snapshot.forEach(d => state.menu.push({ id: d.id, ...d.data() }));
        renderMenu();
        if (state.currentUser?.role === 'admin') renderAdminMenuList();
    } catch (e) {
        console.error("Erreur chargement menu :", e);
        showToast(t('toastMenuLoadError'));
    }
}

/* ============================================================
   FIRESTORE : COMMANDES
   ============================================================ */
async function submitOrderToFirebase(orderData) {
    try {
        const ref = await addDoc(collection(db, "orders"), orderData);
        return ref.id;
    } catch (e) {
        console.error("Erreur envoi commande :", e);
        showToast(t('toastOrderSendError') + e.message);
        return null;
    }
}

function subscribeToAllOrders() {
    if (unsubscribeOrders) unsubscribeOrders();
    const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));
    unsubscribeOrders = onSnapshot(q, snapshot => {
        state.orders = [];
        snapshot.forEach(d => state.orders.push({ firebaseId: d.id, ...d.data() }));
        renderAdminOrders();
    }, err => {
        // Si l'index n'existe pas, Firebase affiche un lien dans la console pour le créer
        console.error("Erreur onSnapshot (index manquant ?) :", err);
        showToast(t('toastOrdersLoadError'));
    });
}

async function loadUserHistory() {
    if (!state.currentUser) return;
    try {
        const q = query(
            collection(db, "orders"),
            where("userId", "==", state.currentUser.uid),
            orderBy("timestamp", "desc")
        );
        const snapshot = await getDocs(q);
        const myOrders = [];
        snapshot.forEach(d => myOrders.push({ firebaseId: d.id, ...d.data() }));
        renderProfileOrders(myOrders);
    } catch (e) {
        // Firebase donne un lien dans la console pour créer l'index composite nécessaire
        console.error("Erreur historique (index manquant ?):", e);
    }
}

/* ============================================================
   AUTHENTIFICATION
   ============================================================ */
async function handleAuthSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value.trim();
    const pass  = document.getElementById('auth-password').value;
    const btn   = document.getElementById('auth-submit-btn');
    btn.disabled = true; btn.textContent = t('loading');

    try {
        if (!isLoginMode) {
            const fName = document.getElementById('reg-fname').value.trim();
            const lName = document.getElementById('reg-lname').value.trim();
            const conf  = document.getElementById('auth-confirm-password').value;
            if (pass !== conf) { showToast(t('toastPasswordsDontMatch')); return; }
            const cred = await createUserWithEmailAndPassword(auth, email, pass);
            await setDoc(doc(db, "users", cred.user.uid), {
                firstName: fName, lastName: lName, email,
                role: email.startsWith('admin') ? 'admin' : 'user',
                createdAt: new Date().toISOString()
            });
            showToast(t('toastWelcome') + fName + ' !');
        } else {
            await signInWithEmailAndPassword(auth, email, pass);
            showToast(t('toastSigninSuccess'));
        }
        // Redirection légèrement différée pour laisser onAuthStateChanged mettre à jour state
        setTimeout(() => {
            if (state.currentUser) {
                navigateTo(state.currentUser.role === 'admin' ? 'management' : 'order');
            }
        }, 600);
    } catch (error) {
        let msg = t('toastAuthError');
        if (error.code === 'auth/invalid-credential') msg = t('toastInvalidCredential');
        if (error.code === 'auth/email-already-in-use') msg = t('toastEmailInUse');
        if (error.code === 'auth/weak-password') msg = t('toastWeakPassword');
        if (error.code === 'auth/invalid-email') msg = t('toastInvalidEmail');
        showToast(msg);
    } finally {
        btn.disabled = false; applyAuthMode();
    }
}

function handleLogout() {
    signOut(auth).then(() => showToast(t('toastLoggedOut')));
}

/* ============================================================
   SETUP EVENT LISTENERS
   ============================================================ */
function setupEventListeners() {

    // Auth
    document.getElementById('auth-form')?.addEventListener('submit', handleAuthSubmit);
    document.getElementById('switch-auth-mode')?.addEventListener('click', e => {
        e.preventDefault(); isLoginMode = !isLoginMode; applyAuthMode();
    });
    document.getElementById('togglePassword')?.addEventListener('click', () => {
        const inp = document.getElementById('auth-password');
        const ico = document.getElementById('eye-icon');
        const isPass = inp.type === 'password';
        inp.type = isPass ? 'text' : 'password';
        ico.style.stroke = isPass ? 'var(--danger-color)' : 'currentColor';
    });

    // Déconnexion
    document.getElementById('nav-logout')?.addEventListener('click', handleLogout);
    document.getElementById('settings-logout')?.addEventListener('click', handleLogout);
    document.getElementById('profile-logout-btn')?.addEventListener('click', handleLogout);

    // Navigation générale
    document.querySelectorAll('.nav-btn, .setting-btn, .btn-back, .page-link').forEach(btn => {
        btn.addEventListener('click', e => {
            if (btn.classList.contains('page-link') || btn.tagName === 'A') e.preventDefault();
            const target  = btn.dataset.target;
            const section = btn.dataset.section;
            if (target) {
                navigateTo(target);
                if (section) openProfileSection(section);
            }
        });
    });

    // Boutons sidebar profil (Mon compte / Historique / Paramètres)
    document.querySelectorAll('.profile-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.id === 'profile-logout-btn') return; // Géré séparément
            const section = btn.dataset.section;
            if (section) openProfileSection(section);
        });
    });

    // Settings FAB
    const fab     = document.getElementById('settings-fab');
    const popover = document.getElementById('settings-popover');
    fab?.addEventListener('click', e => { e.stopPropagation(); popover.classList.toggle('show'); });
    document.addEventListener('click', e => {
        if (popover && !popover.contains(e.target) && e.target !== fab) popover.classList.remove('show');
    });

    // Dark mode
    const darkToggle         = document.getElementById('dark-mode-toggle');
    const settingsDarkToggle = document.getElementById('settings-dark-toggle');
    const syncDark = checked => {
        document.body.classList.toggle('dark-mode', checked);
        localStorage.setItem('theme', checked ? 'dark' : 'light');
        if (darkToggle)         darkToggle.checked         = checked;
        if (settingsDarkToggle) settingsDarkToggle.checked = checked;
    };
    if (localStorage.getItem('theme') === 'dark') syncDark(true);
    darkToggle?.addEventListener('change',         () => syncDark(darkToggle.checked));
    settingsDarkToggle?.addEventListener('change', () => syncDark(settingsDarkToggle.checked));

    // Langue (FAB + select dans Paramètres)
    document.querySelectorAll('.lang-option').forEach(opt => {
        opt.addEventListener('click', e => {
            e.stopPropagation();
            setLanguage(opt.dataset.lang);
            document.querySelectorAll('.lang-option').forEach(o => o.classList.remove('active-lang'));
            opt.classList.add('active-lang');
            const sel = document.getElementById('settings-lang-select');
            if (sel) sel.value = opt.dataset.lang;
        });
    });
    document.getElementById('settings-lang-select')?.addEventListener('change', e => {
        setLanguage(e.target.value);
        document.querySelectorAll('.lang-option').forEach(o => {
            o.classList.toggle('active-lang', o.dataset.lang === e.target.value);
        });
    });

    // Commande
    document.getElementById('order-form')?.addEventListener('submit', showEmailConfirmModal);
    document.getElementById('cancel-order-btn')?.addEventListener('click', () => {
        if (confirm(t('toastCancelOrderConfirm'))) {
            document.getElementById('order-form').reset();
            renderMenu();
            showToast(t('toastOrderCancelled'));
        }
    });

    // Modal confirmation email
    document.getElementById('modal-send-btn')?.addEventListener('click', proceedToPayment);
    document.getElementById('modal-cancel-btn')?.addEventListener('click', () => {
        document.getElementById('email-confirm-modal').classList.add('hidden');
    });

    // Paiement
    document.getElementById('back-to-order')?.addEventListener('click', () => {
        document.getElementById('payment-view').classList.add('hidden');
        document.getElementById('order-form-container').classList.remove('hidden');
    });
    document.querySelectorAll('.payment-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            const cf = document.getElementById('card-fields');
            if (cf) cf.style.display = opt.dataset.method === 'card' ? 'block' : 'none';
        });
    });
    document.getElementById('confirm-payment-btn')?.addEventListener('click', confirmPayment);

    // Formatage carte bancaire
    document.getElementById('card-number')?.addEventListener('input', e => {
        let v = e.target.value.replace(/\D/g, '').substring(0, 16);
        e.target.value = v.replace(/(.{4})/g, '$1 ').trim();
    });
    document.getElementById('card-expiry')?.addEventListener('input', e => {
        let v = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (v.length >= 3) v = v.substring(0, 2) + '/' + v.substring(2);
        e.target.value = v;
    });

    // Succès paiement → retour accueil
    document.getElementById('success-home-btn')?.addEventListener('click', () => {
        document.getElementById('payment-success-view').classList.add('hidden');
        document.getElementById('order-form-container').classList.remove('hidden');
        document.getElementById('order-form').reset();
        renderMenu();
        navigateTo('home');
    });

    // Contact
    document.getElementById('contact-form')?.addEventListener('submit', e => {
        e.preventDefault();
        document.getElementById('contact-form-view').classList.add('hidden');
        document.getElementById('contact-success-view').classList.remove('hidden');
        showToast(t('toastMessageSent'));
    });
    document.getElementById('contact-return-home')?.addEventListener('click', () => {
        document.getElementById('contact-form').reset();
        document.getElementById('contact-form-view').classList.remove('hidden');
        document.getElementById('contact-success-view').classList.add('hidden');
        navigateTo('home');
    });

    // Profil – modifier infos
    document.getElementById('profile-info-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        if (!state.currentUser) return;
        const firstName = document.getElementById('profile-fname').value.trim();
        const lastName  = document.getElementById('profile-lname').value.trim();
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true; btn.textContent = t('saving');
        try {
            await updateDoc(doc(db, "users", state.currentUser.uid), { firstName, lastName });
            state.currentUser.firstName = firstName;
            state.currentUser.lastName  = lastName;
            updateAuthUI(); refreshProfileUI(); prefillNameFields();
            showToast(t('toastProfileUpdated'));
        } catch (err) { showToast(t('toastError') + err.message); }
        finally { btn.disabled = false; btn.textContent = t('saveChanges'); }
    });

    // Profil – changer mot de passe
    document.getElementById('profile-pwd-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        const current = document.getElementById('profile-current-pwd').value;
        const newPwd  = document.getElementById('profile-new-pwd').value;
        const confirm = document.getElementById('profile-confirm-pwd').value;
        if (newPwd !== confirm) { showToast(t('toastPasswordsDontMatch2')); return; }
        if (newPwd.length < 6)  { showToast(t('toastMinChars')); return; }
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true; btn.textContent = t('loading');
        try {
            const credential = EmailAuthProvider.credential(state.currentUser.email, current);
            await reauthenticateWithCredential(auth.currentUser, credential);
            await updatePassword(auth.currentUser, newPwd);
            document.getElementById('profile-pwd-form').reset();
            showToast(t('toastPasswordChanged'));
        } catch (err) {
            let msg = t('toastPwdError');
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') msg = t('toastPwdWrong');
            showToast(msg);
        } finally { btn.disabled = false; btn.textContent = t('changePassword'); }
    });

    // Admin – formulaire menu
    document.getElementById('menu-admin-form')?.addEventListener('submit', handleMenuFormSubmit);
    document.getElementById('menu-cancel-edit-btn')?.addEventListener('click', resetMenuForm);

    // Admin – onglets
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab)?.classList.add('active');
            if (tab.dataset.tab === 'menu-tab') renderAdminMenuList();
        });
    });

    // Admin – recherche & filtre
    document.getElementById('admin-search')?.addEventListener('input', renderAdminOrders);
    document.getElementById('admin-status-filter')?.addEventListener('change', renderAdminOrders);

    // Admin – export CSV
    document.getElementById('export-csv-btn')?.addEventListener('click', exportCSV);

    // Auto-resize textareas
    document.querySelectorAll('textarea.auto-resize').forEach(ta => {
        ta.addEventListener('input', () => {
            ta.style.height = 'auto';
            ta.style.height = ta.scrollHeight + 'px';
        });
    });
}

/* ============================================================
   NAVIGATION & UI
   ============================================================ */
function navigateTo(pageId) {
    if (['order', 'profile'].includes(pageId) && !state.currentUser) {
        showToast(t('toastPleaseSignIn')); pageId = 'signin';
    }
    if (pageId === 'management' && state.currentUser?.role !== 'admin') {
        showToast(t('toastAdminOnly')); return;
    }
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId)?.classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.nav-btn[data-target="${pageId}"]`)?.classList.add('active');
    document.getElementById('settings-popover')?.classList.remove('show');

    if (pageId === 'management') { renderAdminOrders(); renderAdminMenuList(); }
    if (pageId === 'profile')    { refreshProfileUI(); loadUserHistory(); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateAuthUI() {
    const show = id => document.getElementById(id)?.classList.remove('hidden');
    const hide = id => document.getElementById(id)?.classList.add('hidden');
    if (state.currentUser) {
        hide('nav-signin');  show('nav-profile');
        show('settings-logout'); hide('settings-signin');
        if (state.currentUser.role === 'admin') show('nav-admin');
        const av = document.getElementById('header-avatar');
        const nm = document.getElementById('header-username');
        if (av) av.textContent = (state.currentUser.firstName || 'U').charAt(0).toUpperCase();
        if (nm) nm.textContent = state.currentUser.firstName || state.currentUser.firstName;
    } else {
        show('nav-signin'); hide('nav-profile');
        hide('settings-logout'); show('settings-signin');
        hide('nav-admin');
    }
}

function prefillNameFields() {
    if (!state.currentUser) return;
    const f = document.getElementById('order-fname');
    const l = document.getElementById('order-lname');
    if (f) f.value = state.currentUser.firstName || '';
    if (l) l.value = state.currentUser.lastName  || '';
}

function openProfileSection(sectionId) {
    document.querySelectorAll('.profile-section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId)?.classList.add('active');
    document.querySelectorAll('.profile-nav-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.section === sectionId);
    });
    if (sectionId === 'section-account')  refreshProfileUI();
    if (sectionId === 'section-orders')   loadUserHistory();
    if (sectionId === 'section-settings') {
        const st = document.getElementById('settings-dark-toggle');
        if (st) st.checked = document.body.classList.contains('dark-mode');
        const sl = document.getElementById('settings-lang-select');
        if (sl) sl.value = state.lang;
    }
}

function refreshProfileUI() {
    if (!state.currentUser) return;
    const u = state.currentUser;
    const initials = ((u.firstName || '').charAt(0) + (u.lastName || '').charAt(0)).toUpperCase() || '?';
    const avLg = document.getElementById('profile-avatar-large');
    const nm   = document.getElementById('profile-name-display');
    const em   = document.getElementById('profile-email-display');
    if (avLg) avLg.textContent = initials;
    if (nm)   nm.textContent   = `${u.firstName || ''} ${u.lastName || ''}`.trim() || '—';
    if (em)   em.textContent   = u.email || '—';
    const pf = document.getElementById('profile-fname');
    const pl = document.getElementById('profile-lname');
    const pe = document.getElementById('profile-email');
    if (pf) pf.value = u.firstName || '';
    if (pl) pl.value = u.lastName  || '';
    if (pe) pe.value = u.email     || '';
    const st = document.getElementById('settings-dark-toggle');
    if (st) st.checked = document.body.classList.contains('dark-mode');
}

/* ============================================================
   LANGUE
   ============================================================ */
function t(key) {
    const L = i18n[state.lang] || i18n.fr;
    return L[key] !== undefined ? L[key] : (i18n.fr[key] || key);
}

function applyTranslations() {
    const L = i18n[state.lang] || i18n.fr;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (L[key] !== undefined) el.textContent = L[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (L[key] !== undefined) el.placeholder = L[key];
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
        const key = el.getAttribute('data-i18n-aria');
        if (L[key] !== undefined) el.setAttribute('aria-label', L[key]);
    });
    const titleEl = document.querySelector('title');
    if (titleEl && L.pageTitle) titleEl.textContent = L.pageTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && L.metaDescription) metaDesc.setAttribute('content', L.metaDescription);
    document.documentElement.lang = state.lang === 'en' ? 'en' : 'fr';
}

function setLanguage(lang) {
    if (!i18n[lang]) return;
    state.lang = lang;
    localStorage.setItem('lang', lang);
    const labelEl = document.getElementById('lang-label');
    if (labelEl) labelEl.textContent = i18n[lang].langLabel;
    applyTranslations();
    applyAuthMode();
    const activePage = document.querySelector('.page.active')?.id;
    if (activePage === 'order') renderMenu();
    if (activePage === 'management') { renderAdminOrders(); renderAdminMenuList(); }
    calculateTotal();
}

function applyAuthMode() {
    const L = i18n[state.lang] || i18n.fr;
    const $ = id => document.getElementById(id);
    if ($('auth-title'))       $('auth-title').textContent       = isLoginMode ? L.welcome : L.createAccount;
    const sub = $('auth-subtitle'); if (sub) sub.textContent = isLoginMode ? L.welcomeSub : L.createSub;
    if ($('auth-submit-btn'))  $('auth-submit-btn').textContent  = isLoginMode ? L.signinBtn : L.registerBtn;
    if ($('auth-switch-text')) $('auth-switch-text').textContent = isLoginMode ? L.newHere : L.alreadyAccount;
    if ($('switch-auth-mode')) $('switch-auth-mode').textContent = isLoginMode ? L.createLink : L.signinLink;
    $('register-fields')?.classList.toggle('hidden', isLoginMode);
    $('confirm-password-group')?.classList.toggle('hidden', isLoginMode);
    $('remember-me-group')?.classList.toggle('hidden', !isLoginMode);
}

/* ============================================================
   TEMPS & STATUS
   ============================================================ */
function initTime() {
    const day = new Date().getDay();
    const isWeekend = day === 0 || day === 6;
    const strip = document.getElementById('status-strip');
    if (strip) strip.innerHTML = isWeekend
        ? `<span style="color:var(--danger-color)">&#9679; ${t('statusClosed')}</span> &nbsp;|&nbsp; ${t('statusReturnMonday')}`
        : `<span style="color:#34c759">&#9679; ${t('statusOpen')}</span> &nbsp;|&nbsp; ${t('statusOrdersOpen')}`;
    if (isWeekend) document.getElementById('weekend-banner')?.classList.remove('hidden');
}

/* ============================================================
   MENU (page Commander)
   ============================================================ */
function renderMenu() {
    const container = document.getElementById('menu-container');
    if (!container) return;
    container.innerHTML = '';
    const MAX = 3;
    const catLabels = { starter: t('catStarter'), main: t('catMain'), dessert: t('catDessert') };

    ['starter','main','dessert'].forEach(cat => {
        const items = state.menu.filter(i => i.category === cat && i.visible);
        if (!items.length) return;
        const section = document.createElement('div');
        section.className = 'card menu-section';
        section.innerHTML = `<div class="menu-section-header"><h3>${catLabels[cat]}</h3><span class="cat-limit-note">${t('catMaxPerCategory')} ${MAX} ${t('catMaxPerCategorySuffix')}</span></div>`;

        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'menu-item-row';
            const tags = (item.tags || []).map(t => `<span class="menu-tag menu-tag-${t}">${tagLabel(t)}</span>`).join('');
            const limitHTML = item.limit > 0 ? `<span class="menu-limit">${t('stockLabel')} ${item.limit}</span>` : '';
            div.innerHTML = `
                <div class="menu-item-info">
                    <div class="menu-item-name">${item.name}</div>
                    <div class="menu-item-tags">${tags}${limitHTML}</div>
                </div>
                <div class="menu-item-right">
                    <span class="menu-item-price">€${Number(item.price).toFixed(2)}</span>
                    <div class="qty-stepper" data-id="${item.id}" data-cat="${cat}">
                        <button type="button" class="qty-btn qty-minus">−</button>
                        <span class="qty-display">0</span>
                        <button type="button" class="qty-btn qty-plus">+</button>
                    </div>
                </div>
            `;
            section.appendChild(div);
            const stepper = div.querySelector('.qty-stepper');
            const display = stepper.querySelector('.qty-display');
            div.querySelector('.qty-plus').addEventListener('click', () => {
                const cur = parseInt(display.textContent);
                const maxItem = item.limit > 0 ? Math.min(item.limit, MAX) : MAX;
                if (cur >= maxItem) { showToast(t('toastMaxItems') + maxItem + t('toastMaxItemsSuffix')); return; }
                if (getCatTotal(cat) >= MAX) { showToast(t('toastMaxPerCategory') + MAX + t('toastMaxPerCategorySuffix')); return; }
                display.textContent = cur + 1;
                stepper.classList.add('has-qty');
                calculateTotal();
            });
            div.querySelector('.qty-minus').addEventListener('click', () => {
                const cur = parseInt(display.textContent);
                if (cur > 0) {
                    display.textContent = cur - 1;
                    stepper.classList.toggle('has-qty', cur - 1 > 0);
                    calculateTotal();
                }
            });
        });
        container.appendChild(section);
    });
    calculateTotal();
}

function getCatTotal(cat) {
    let sum = 0;
    document.querySelectorAll(`.qty-stepper[data-cat="${cat}"]`).forEach(s => {
        sum += parseInt(s.querySelector('.qty-display').textContent) || 0;
    });
    return sum;
}

function tagLabel(tag) {
    const map = { veg: t('tagVeg'), vegan: t('tagVegan'), glutenfree: t('tagGlutenfree'), halal: t('tagHalal'), spicy: t('tagSpicy') };
    return map[tag] || tag;
}

function calculateTotal() {
    let count = 0, price = 0;
    document.querySelectorAll('.qty-stepper').forEach(s => {
        const qty  = parseInt(s.querySelector('.qty-display').textContent) || 0;
        const item = state.menu.find(i => i.id === s.dataset.id);
        if (item && qty > 0) { count += qty; price += qty * Number(item.price); }
    });
    const tce = document.getElementById('total-count');
    const tpe = document.getElementById('total-price');
    const be  = document.getElementById('cart-count-badge');
    const cb  = document.getElementById('cart-bar');
    if (tce) tce.textContent = count;
    if (tpe) tpe.textContent = price.toFixed(2);
    if (be)  be.textContent  = `${count} ${count > 1 ? t('cartArticles') : t('cartArticle')}`;
    if (cb)  cb.classList.toggle('active', count > 0);
}

/* ============================================================
   FLOW COMMANDE : Modal → Paiement → Succès
   ============================================================ */
function showEmailConfirmModal(e) {
    e.preventDefault();
    const total = parseInt(document.getElementById('total-count').textContent);
    if (total === 0) { showToast(t('toastEmptyCart')); return; }
    const emailEl = document.getElementById('confirm-email-addr');
    if (emailEl) emailEl.textContent = state.currentUser?.email || '—';
    document.getElementById('email-confirm-modal').classList.remove('hidden');
}

function proceedToPayment() {
    document.getElementById('email-confirm-modal').classList.add('hidden');
    showToast(t('toastConfirmEmailSent'));
    buildPaymentRecap();
    document.getElementById('order-form-container').classList.add('hidden');
    document.getElementById('payment-view').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function buildPaymentRecap() {
    const container = document.getElementById('payment-recap-items');
    container.innerHTML = '';
    let total = 0;
    document.querySelectorAll('.qty-stepper').forEach(s => {
        const qty  = parseInt(s.querySelector('.qty-display').textContent);
        const item = state.menu.find(i => i.id === s.dataset.id);
        if (qty > 0 && item) {
            total += qty * Number(item.price);
            container.innerHTML += `<div class="recap-item-row"><span>${qty}× ${item.name}</span><span>€${(qty * Number(item.price)).toFixed(2)}</span></div>`;
        }
    });
    const extras = Array.from(document.querySelectorAll('input[name="extra"]:checked')).map(c => c.value).join(', ');
    const sub = document.getElementById('recap-subtotal');
    const ext = document.getElementById('recap-extras-label');
    const tot = document.getElementById('recap-total');
    const dat = document.getElementById('recap-date');
    if (sub) sub.textContent = `€${total.toFixed(2)}`;
    if (ext) ext.textContent = extras || t('recapNone');
    if (tot) tot.textContent = `€${total.toFixed(2)}`;
    if (dat) {
        const d = new Date();
        do { d.setDate(d.getDate() + 1); } while (d.getDay() === 0 || d.getDay() === 6);
        dat.textContent = d.toLocaleDateString(state.lang === 'en' ? 'en-GB' : 'fr-FR', { weekday:'long', day:'numeric', month:'long' });
    }
}

async function confirmPayment() {
    const btn = document.getElementById('confirm-payment-btn');
    btn.disabled = true; btn.textContent = t('validating');
    const method = document.querySelector('input[name="payment"]:checked')?.value || 'card';
    if (method === 'card') {
        const num = (document.getElementById('card-number')?.value || '').replace(/\s/g, '');
        const exp = document.getElementById('card-expiry')?.value || '';
        if (num.length < 16) { showToast(t('toastInvalidCard')); btn.disabled = false; btn.textContent = t('confirmPaymentBtn'); return; }
        if (!/^\d{2}\/\d{2}$/.test(exp)) { showToast(t('toastInvalidExpiry')); btn.disabled = false; btn.textContent = t('confirmPaymentBtn'); return; }
    }
    const ref   = 'TM-' + Date.now().toString(36).toUpperCase().slice(-6);
    const items = [];
    document.querySelectorAll('.qty-stepper').forEach(s => {
        const qty  = parseInt(s.querySelector('.qty-display').textContent);
        const item = state.menu.find(i => i.id === s.dataset.id);
        if (qty > 0 && item) items.push({ id: item.id, name: item.name, price: item.price, qty, category: item.category });
    });
    const orderData = {
        ref, userId: state.currentUser.uid, userEmail: state.currentUser.email,
        user: `${document.getElementById('order-fname').value} ${document.getElementById('order-lname').value}`.trim(),
        timestamp: new Date().toISOString(),
        time: new Date().toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' }),
        items, payment: method,
        extras: Array.from(document.querySelectorAll('input[name="extra"]:checked')).map(c => c.value).join(', '),
        notes: document.getElementById('order-notes')?.value || '',
        total: document.getElementById('recap-total').textContent,
        status: 'Confirmée'
    };
    const newId = await submitOrderToFirebase(orderData);
    if (newId) {
        document.getElementById('order-ref').textContent = ref;
        document.getElementById('payment-view').classList.add('hidden');
        document.getElementById('payment-success-view').classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    btn.disabled = false; btn.textContent = t('confirmPaymentBtn');
}

/* ============================================================
   ADMIN : COMMANDES
   ============================================================ */
function renderAdminOrders() {
    const tbody    = document.getElementById('orders-table-body');
    const tfoot    = document.getElementById('orders-table-foot');
    const emptyMsg = document.getElementById('table-empty');
    if (!tbody) return;
    const searchVal    = (document.getElementById('admin-search')?.value || '').toLowerCase();
    const statusFilter = document.getElementById('admin-status-filter')?.value || '';
    const filtered = state.orders.filter(o =>
        (!searchVal    || (o.user || '').toLowerCase().includes(searchVal)) &&
        (!statusFilter || o.status === statusFilter)
    );
    tbody.innerHTML = '';
    const tw = document.querySelector('.table-wrapper');
    if (filtered.length === 0) {
        emptyMsg?.classList.remove('hidden');
        if (tw) tw.style.display = 'none';
        if (tfoot) tfoot.innerHTML = '';
        renderAdminStats([], 0);
        return;
    }
    emptyMsg?.classList.add('hidden');
    if (tw) tw.style.display = '';
    let grandTotal = 0;
    filtered.forEach(o => {
        const starter = (o.items||[]).filter(i=>i.category==='starter').map(i=>`${i.qty}× ${i.name}`).join(', ') || '—';
        const main    = (o.items||[]).filter(i=>i.category==='main').map(i    =>`${i.qty}× ${i.name}`).join(', ') || '—';
        const dessert = (o.items||[]).filter(i=>i.category==='dessert').map(i =>`${i.qty}× ${i.name}`).join(', ') || '—';
        const statusLabel = o.status==='Confirmée' ? t('statusConfirmed') : (o.status==='Annulée' ? t('statusCancelled') : t('statusModified'));
        const sc = o.status==='Confirmée'?'status-ok':(o.status==='Annulée'?'status-cancelled':'status-modified');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><div class="cell-user"><strong>${o.user||'—'}</strong><small class="ref-label">${o.ref||''}</small></div></td>
            <td>${o.time||'—'}</td>
            <td class="cell-dish">${starter}</td>
            <td class="cell-dish">${main}</td>
            <td class="cell-dish">${dessert}</td>
            <td>${o.extras||'—'}</td>
            <td><strong>${o.total||'—'}</strong></td>
            <td><span class="status-badge ${sc}">${statusLabel}</span></td>
            <td class="cell-actions">
                <button class="btn-icon" title="${t('confirmBtn')}" onclick="window.updateOrderStatus('${o.firebaseId}','Confirmée')">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </button>
                <button class="btn-icon btn-icon-danger" title="${t('cancelBtn')}" onclick="window.updateOrderStatus('${o.firebaseId}','Annulée')">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </td>`;
        tbody.appendChild(tr);
        const val = parseFloat((o.total||'0').replace('€',''));
        if (!isNaN(val)) grandTotal += val;
    });
    if (tfoot) tfoot.innerHTML = `<tr class="table-footer-row">
        <td colspan="6"><strong>${filtered.length} ${filtered.length>1 ? t('ordersCountPlural') : t('ordersCount')}</strong></td>
        <td><strong>€${grandTotal.toFixed(2)}</strong></td><td colspan="2"></td>
    </tr>`;
    renderAdminStats(filtered, grandTotal);
}

function renderAdminStats(orders, total = 0) {
    const statsEl = document.getElementById('admin-stats');
    if (!statsEl) return;
    const confirmed = orders.filter(o => o.status === 'Confirmée').length;
    const modified  = orders.filter(o => o.status === 'Modifiée').length;
    statsEl.innerHTML = `
        <div class="stat-pill stat-green">${confirmed} ${confirmed>1 ? t('confirmedCountPlural') : t('confirmedCount')}</div>
        <div class="stat-pill stat-orange">${modified} ${modified>1 ? t('modifiedCountPlural') : t('modifiedCount')}</div>
        <div class="stat-pill">${t('totalLabel')}€${total.toFixed(2)}</div>
    `;
}

window.updateOrderStatus = async (docId, status) => {
    if (!docId) return;
    try {
        await updateDoc(doc(db, "orders", docId), { status });
        showToast(t('toastStatusUpdated') + status);
    } catch (e) { showToast(t('toastErrorStatus')); }
};

/* ============================================================
   ADMIN : MENU
   ============================================================ */
function renderAdminMenuList() {
    const container = document.getElementById('admin-menu-list');
    if (!container) return;
    container.innerHTML = '';
    const catLabels = { starter: t('catStarter'), main: t('catMain'), dessert: t('catDessert') };
    ['starter','main','dessert'].forEach(cat => {
        const items = state.menu.filter(i => i.category === cat);
        if (!items.length) return;
        const group = document.createElement('div');
        group.className = 'admin-menu-group';
        group.innerHTML = `<div class="admin-menu-group-title">${catLabels[cat]}</div>`;
        items.forEach(item => {
            const row = document.createElement('div');
            row.className = 'admin-menu-row' + (item.visible ? '' : ' menu-hidden-row');
            const tags = (item.tags||[]).map(tag => `<span class="mini-tag">${tagLabel(tag)}</span>`).join('');
            const limitText = item.limit > 0 ? `<span class="mini-tag mini-tag-limit">${t('limitedLabel')}${item.limit}</span>` : '';
            row.innerHTML = `
                <div class="admin-menu-info">
                    <span class="admin-menu-name">${item.name}</span>
                    <span class="admin-menu-meta">${tags}${limitText}</span>
                </div>
                <span class="admin-menu-price">€${Number(item.price).toFixed(2)}</span>
                <div class="admin-menu-actions">
                    <button class="btn-icon" title="${item.visible ? t('hideBtn') : t('showBtn')}" onclick="window.toggleMenuVisFirebase('${item.id}',${!item.visible})">
                        ${item.visible
                            ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
                            : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.1 9.1 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
                        }
                    </button>
                    <button class="btn-icon" title="${t('editBtn')}" onclick="window.editMenuItemFirebase('${item.id}')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="btn-icon btn-icon-danger" title="${t('deleteBtn')}" onclick="window.deleteMenuFirebase('${item.id}')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                    </button>
                </div>`;
            group.appendChild(row);
        });
        container.appendChild(group);
    });
}

async function handleMenuFormSubmit(e) {
    e.preventDefault();
    const editId   = document.getElementById('edit-item-id')?.value || '';
    const name     = document.getElementById('item-name').value.trim();
    const category = document.getElementById('item-category').value;
    const price    = parseFloat(document.getElementById('item-price').value);
    const limit    = parseInt(document.getElementById('item-limit').value) || 0;
    const visible  = document.getElementById('item-visible').checked;
    const tags     = Array.from(document.querySelectorAll('#menu-admin-form input[name="tag"]:checked')).map(c => c.value);
    if (!name || !category || isNaN(price)) { showToast(t('toastFillRequired')); return; }
    try {
        if (editId) {
            await updateDoc(doc(db, "menu", editId), { name, category, price, limit, visible, tags });
            showToast('"' + name + '"' + t('toastDishUpdated'));
        } else {
            await addDoc(collection(db, "menu"), { name, category, price, limit, visible, tags });
            showToast('"' + name + '"' + t('toastDishAdded'));
        }
        resetMenuForm(); await fetchMenu();
    } catch (err) { showToast(t('toastError') + err.message); }
}

function resetMenuForm() {
    const editIdEl = document.getElementById('edit-item-id');
    if (editIdEl) editIdEl.value = '';
    document.getElementById('menu-admin-form')?.reset();
    const visEl = document.getElementById('item-visible');
    if (visEl) visEl.checked = true;
    const titleEl  = document.getElementById('menu-form-title');
    const submitEl = document.getElementById('menu-submit-btn');
    const cancelEl = document.getElementById('menu-cancel-edit-btn');
    if (titleEl)  titleEl.textContent  = t('addDish');
    if (submitEl) submitEl.textContent = t('addTheDish');
    cancelEl?.classList.add('hidden');
}

window.deleteMenuFirebase = async id => {
    if (!confirm(t('deleteDishConfirm'))) return;
    try { await deleteDoc(doc(db, "menu", id)); await fetchMenu(); showToast(t('toastDishDeleted')); }
    catch (e) { showToast(t('toastErrorDelete')); }
};

window.toggleMenuVisFirebase = async (id, newVal) => {
    try { await updateDoc(doc(db, "menu", id), { visible: newVal }); await fetchMenu(); }
    catch (e) { showToast(t('toastErrorVisibility')); }
};

window.editMenuItemFirebase = id => {
    const item = state.menu.find(i => i.id === id);
    if (!item) return;
    const editIdEl = document.getElementById('edit-item-id');
    if (editIdEl) editIdEl.value = id;
    document.getElementById('item-name').value      = item.name;
    document.getElementById('item-category').value  = item.category;
    document.getElementById('item-price').value     = item.price;
    document.getElementById('item-limit').value     = item.limit || 0;
    document.getElementById('item-visible').checked = item.visible;
    document.querySelectorAll('#menu-admin-form input[name="tag"]').forEach(cb => {
        cb.checked = (item.tags || []).includes(cb.value);
    });
    const titleEl  = document.getElementById('menu-form-title');
    const submitEl = document.getElementById('menu-submit-btn');
    const cancelEl = document.getElementById('menu-cancel-edit-btn');
    if (titleEl)  titleEl.textContent  = t('editDishTitlePrefix') + item.name + '"';
    if (submitEl) submitEl.textContent = t('saveBtn');
    cancelEl?.classList.remove('hidden');
    document.getElementById('menu-admin-form')?.scrollIntoView({ behavior:'smooth', block:'start' });
};

/* ============================================================
   EXPORT CSV
   ============================================================ */
function exportCSV() {
    if (!state.orders.length) { showToast(t('toastNoOrdersExport')); return; }
    const headers = [t('csvRef'),t('csvTeacher'),t('csvEmail'),t('csvTime'),t('csvStarter'),t('csvMain'),t('csvDessert'),t('csvExtras'),t('csvNotes'),t('csvPayment'),t('csvTotal'),t('csvStatus')];
    const rows = state.orders.map(o => {
        const starter = (o.items||[]).filter(i=>i.category==='starter').map(i=>`${i.qty}x${i.name}`).join(' / ') || '—';
        const main    = (o.items||[]).filter(i=>i.category==='main').map(i    =>`${i.qty}x${i.name}`).join(' / ') || '—';
        const dessert = (o.items||[]).filter(i=>i.category==='dessert').map(i =>`${i.qty}x${i.name}`).join(' / ') || '—';
        return [o.ref||'',o.user||'',o.userEmail||'',o.time||'',starter,main,dessert,
                o.extras||'',o.notes||'',o.payment||'',o.total||'',o.status||'']
            .map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',');
    });
    const csv  = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const a    = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(blob),
        download: `commandes_${new Date().toISOString().slice(0,10)}.csv`
    });
    a.click(); URL.revokeObjectURL(a.href);
    showToast(t('toastExportDownloaded'));
}

/* ============================================================
   HISTORIQUE PROFIL
   ============================================================ */
function renderProfileOrders(orders) {
    const list = document.getElementById('profile-orders-list');
    if (!list) return;
    if (!orders || orders.length === 0) {
        list.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:32px 0">${t('noRecentOrders')}</p>`;
        return;
    }
    list.innerHTML = '';
    orders.forEach(o => {
        const sc    = o.status==='Confirmée'?'status-ok':(o.status==='Annulée'?'status-cancelled':'status-modified');
        const items = (o.items||[]).map(i=>`${i.qty}× ${i.name}`).join(', ');
        const card  = document.createElement('div');
        card.className = 'card order-history-card';
        card.innerHTML = `
            <div class="order-history-header">
                <div>
                    <strong class="order-history-ref">${o.ref||'—'}</strong>
                    <span class="order-history-date">${o.time||''}</span>
                </div>
                <div style="display:flex;align-items:center;gap:8px">
                    <span class="order-history-total">${o.total||'—'}</span>
                    <span class="status-badge ${sc}">${o.status}</span>
                </div>
            </div>
            <div class="order-history-items">${items||'—'}</div>
            ${o.extras?`<div class="order-history-extras">${t('extrasLabel')}${o.extras}</div>`:''}
        `;
        list.appendChild(card);
    });
}

/* ============================================================
   TOASTS
   ============================================================ */
function showToast(msg) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    toast.setAttribute('role', 'alert');
    container.appendChild(toast);
    requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('toast-visible')));
    const timer = setTimeout(() => dismissToast(toast), 3500);
    toast.addEventListener('click', () => { clearTimeout(timer); dismissToast(toast); });
}
function dismissToast(toast) {
    toast.classList.remove('toast-visible');
    toast.classList.add('toast-exit');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
}
