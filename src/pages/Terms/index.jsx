import { NavLink } from "react-router";
import Nav from "react-bootstrap/Nav";
import "./style.css";
function Terms() {
  return (
    <div className="background">
      <h1>Politique de confidentialité</h1>

      <h2>Qui sommes-nous ?</h2>

      <Nav.Link as={NavLink} to="/about">
        A propos
      </Nav.Link>

      <h2>Commentaires</h2>
      <p>
        Quand vous laissez un commentaire sur notre site, les données inscrites
        dans le formulaire de commentaire, ainsi que votre adresse IP et l’agent
        utilisateur de votre navigateur sont collectés pour nous aider à la
        détection des commentaires indésirables.
      </p>

      <p>
        Une chaîne anonymisée créée à partir de votre adresse e-mail (également
        appelée hash) peut être envoyée au service Gravatar pour vérifier si
        vous utilisez ce dernier. Les clauses de confidentialité du service
        Gravatar sont disponibles ici :
        <a
          href="https://automattic.com/privacy/"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://automattic.com/privacy/
        </a>
        . Après validation de votre commentaire, votre photo de profil sera
        visible publiquement à côté de votre commentaire.
      </p>

      <h2>Médias</h2>
      <p>
        Si vous téléversez des images sur le site, nous vous conseillons
        d’éviter de téléverser des images contenant des données EXIF de
        coordonnées GPS. Les personnes visitant votre site peuvent télécharger
        et extraire des données de localisation depuis ces images.
      </p>

      <h2>Cookies</h2>
      <p>
        Si vous déposez un commentaire sur notre site, il vous sera proposé
        d’enregistrer votre nom, adresse e-mail et site dans des cookies. C’est
        uniquement pour votre confort afin de ne pas avoir à saisir ces
        informations si vous déposez un autre commentaire plus tard. Ces cookies
        expirent au bout d’un an.
      </p>

      <p>
        Si vous vous rendez sur la page de connexion, un cookie temporaire sera
        créé afin de déterminer si votre navigateur accepte les cookies. Il ne
        contient pas de données personnelles et sera supprimé automatiquement à
        la fermeture de votre navigateur.
      </p>

      <p>
        Lorsque vous vous connecterez, nous mettrons en place un certain nombre
        de cookies pour enregistrer vos informations de connexion et vos
        préférences d’écran. La durée de vie d’un cookie de connexion est de
        deux jours, celle d’un cookie d’option d’écran est d’un an. Si vous
        cochez « Se souvenir de moi », votre cookie de connexion sera conservé
        pendant deux semaines. Si vous vous déconnectez de votre compte, le
        cookie de connexion sera effacé.
      </p>

      <p>
        En modifiant ou en publiant une publication, un cookie supplémentaire
        sera enregistré dans votre navigateur. Ce cookie ne comprend aucune
        donnée personnelle. Il indique simplement l’ID de la publication
        modifiée. Il expire au bout d’un jour.
      </p>

      <h2>Contenu embarqué depuis d’autres sites</h2>
      <p>
        Les articles de ce site peuvent inclure des contenus intégrés (par
        exemple des vidéos, images, articles…). Le contenu intégré depuis
        d’autres sites se comporte de la même manière que si le visiteur se
        rendait sur cet autre site.
      </p>

      <p>
        Ces sites web pourraient collecter des données sur vous, utiliser des
        cookies, embarquer des outils de suivis tiers, et suivre vos
        interactions avec ces contenus embarqués si vous disposez d’un compte
        connecté sur leur site web.
      </p>

      <h2>Utilisation et transmission de vos données personnelles</h2>
      <p>
        Si vous demandez une réinitialisation de votre mot de passe, votre
        adresse IP sera incluse dans l’e-mail de réinitialisation.
      </p>

      <h2>Durées de stockage de vos données</h2>
      <p>
        Si vous laissez un commentaire, le commentaire et ses métadonnées sont
        conservés indéfiniment. Cela permet de reconnaître et d’approuver
        automatiquement les commentaires suivants au lieu de les laisser dans la
        file de modération.
      </p>

      <p>
        Pour les comptes qui s’inscrivent sur notre site (le cas échéant), nous
        stockons également les données personnelles indiquées dans leur profil.
        Tous les comptes peuvent voir, modifier ou supprimer leurs informations
        personnelles à tout moment (à l’exception de leur identifiant). Les
        gestionnaires du site peuvent aussi voir et modifier ces informations.
      </p>

      <h2>Les droits que vous avez sur vos données</h2>
      <p>
        Si vous avez un compte ou si vous avez laissé des commentaires sur le
        site, vous pouvez demander à recevoir un fichier contenant toutes les
        données personnelles que nous possédons à votre sujet, incluant celles
        que vous nous avez fournies. Vous pouvez également demander la
        suppression des données personnelles vous concernant. Cela ne prend pas
        en compte les données stockées à des fins administratives, légales ou
        pour des raisons de sécurité.
      </p>

      <h2>Où vos données sont envoyées</h2>
      <p>
        Les commentaires des visiteurs peuvent être vérifiés à l’aide d’un
        service automatisé de détection des commentaires indésirables.
      </p>

      <h1>Politique en matière de remboursements et de retours</h1>

      <h2>Aperçu</h2>
      <p>
        Notre politique de remboursement et de retour est valable pendant 30
        jours. Si 30 jours se sont écoulés depuis votre achat, nous ne pouvons
        malheureusement pas vous offrir un remboursement complet ni un échange.
      </p>

      <p>
        Pour être admissible à un retour, votre article doit être inutilisé et
        dans le même état que vous l’avez reçu. Il doit également être dans son
        emballage d’origine.
      </p>

      <p>
        Plusieurs types de produits ne peuvent pas être retournés. Les produits
        périssables tels que la nourriture, les fleurs, les journaux ou les
        magazines ne peuvent pas être retournés. Nous n’acceptons pas non plus
        les produits intimes ou sanitaires, les matières dangereuses ou les
        liquides ou gaz inflammables.
      </p>

      <div class="refund-box">
        <h3>Articles supplémentaires non retournables :</h3>
        <ul>
          <li>Cartes cadeaux</li>
          <li>Produits logiciels téléchargeables</li>
          <li>Certains articles de santé et de soins personnels</li>
        </ul>
      </div>

      <p>
        Pour compléter votre retour, nous exigeons un reçu ou une preuve
        d’achat.
      </p>

      <p>
        <strong>Veuillez ne pas renvoyer votre achat au fabricant.</strong>
      </p>

      <h3>Remboursements partiels possibles :</h3>
      <ul>
        <li>Livre présentant des signes évidents d’utilisation</li>
        <li>
          CD, DVD, cassette VHS, logiciel, jeu vidéo, cassette audio ou vinyle
          ouvert
        </li>
        <li>Article non dans son état d’origine, endommagé ou incomplet</li>
        <li>Article retourné plus de 30 jours après la livraison</li>
      </ul>

      <h2>Remboursements</h2>
      <p>
        Une fois que votre retour est reçu et inspecté, nous vous enverrons un
        e-mail pour vous informer que nous avons bien reçu votre article
        retourné et pour vous informer de l’approbation ou du refus du
        remboursement.
      </p>

      <p>
        Si vous êtes approuvé, votre remboursement sera traité et un crédit sera
        automatiquement appliqué à votre méthode de paiement d’origine, dans un
        délai donné.
      </p>

      <h2>Remboursements en retard ou manquants</h2>
      <p>Si vous n’avez pas reçu votre remboursement :</p>

      <ul>
        <li>Vérifiez votre compte bancaire.</li>
        <li>Contactez votre compagnie de carte bancaire.</li>
        <li>Contactez ensuite votre banque.</li>
      </ul>

      <p>
        Si vous avez fait tout cela et que vous n’avez toujours pas reçu votre
        remboursement, veuillez nous contacter à <strong></strong>.
      </p>

      <h2>Articles en promotion</h2>
      <p>
        Seuls les articles au prix normal peuvent être remboursés. Les articles
        en promotion ne peuvent pas être remboursés.
      </p>

      <h2>Échanges</h2>
      <p>
        Nous remplaçons uniquement les articles défectueux ou endommagés. Si
        vous souhaitez échanger un produit contre le même article,
        contactez-nous à <strong></strong> et envoyez votre article à :{" "}
        <strong></strong>.
      </p>

      <h2>Cadeaux</h2>
      <p>
        Si l’article a été marqué comme cadeau lors de l’achat et vous a été
        envoyé directement, vous recevrez un crédit-cadeau pour la valeur de
        votre retour.
      </p>

      <p>
        Si l’article n’était pas marqué comme cadeau ou a été envoyé à la
        personne qui vous l’a offert, le remboursement sera adressé au donneur
        du cadeau.
      </p>

      <h2>Retour d’articles</h2>
      <p>
        Pour retourner un produit, envoyez-le à : <strong></strong>.
      </p>

      <p>
        Les frais de retour sont à votre charge et ne sont pas remboursables. Si
        vous recevez un remboursement, les frais de retour seront déduits du
        montant total.
      </p>

      <p>
        Le délai de réception d’un échange peut varier selon votre lieu de
        résidence.
      </p>

      <p>
        Pour des articles de grande valeur, nous recommandons un service
        d’expédition suivi ou assuré. Nous ne garantissons pas la réception de
        l’article retourné.
      </p>

      <h2>Besoin d’aide ?</h2>
      <p>
        Pour toute question concernant les retours et
        remboursements.Contactez-nous via la page:
        <Nav.Link as={NavLink} to="/contact">
          Contact
        </Nav.Link>
      </p>
    </div>
  );
}

export default Terms;
