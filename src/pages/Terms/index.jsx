import "./style.css";
function Terms() {
  return (
    <div className="background">
      <h1>Politique de confidentialité</h1>

      <h2>Qui sommes-nous ?</h2>

      <a href={`./About`}>A propos</a>

      <h2>Commentaires</h2>
      <p>
        Quand vous laissez un commentaire sur notre site, les données inscrites
        dans le formulaire de commentaire, ainsi que votre adresse IP et l’agent
        utilisateur de votre navigateur sont collectés pour nous aider à la
        détection des commentaires indésirables.
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

      <h2>Besoin d’aide ?</h2>
      <p>
        Pour toute question concernant les retours et
        remboursements.Contactez-nous via la page:{" "}
        <a href={`./Contact`}>Contact</a>
      </p>

      <div className="cgv-container">
        <h1>Conditions Générales de Vente (CGV)</h1>

        {/* ARTICLE 1 */}
        <section id="scope">
          <h2>Article 1 : Champ d'Application et Modification des CGV</h2>
          <p>
            Les présentes Conditions Générales de Vente (CGV) s'appliquent à
            l'ensemble des ventes conclues via le site internet
            <a href="[VOTRE URL]">[VOTRE URL]</a>, entre la société{" "}
            <strong>Foot Market</strong> (le "Vendeur") et toute personne
            physique non professionnelle (le "Client").
          </p>
          <p>
            Toute validation de commande implique l'adhésion sans réserve du
            Client aux présentes CGV. Le Vendeur se réserve le droit de les
            modifier. Les conditions applicables sont celles en vigueur à la
            date de la commande.
          </p>
        </section>

        {/* ARTICLE 2 */}
        <section id="products">
          <h2>Article 2 : Produits et Disponibilité</h2>
          <ul>
            <li>
              <strong>Caractéristiques :</strong> Les crampons et accessoires
              sont présentés avec leurs caractéristiques essentielles. Les
              informations sont aussi précises que possible, mais ne sont pas
              contractuelles (photos non-contractuelles).
            </li>
            <li>
              <strong>Prix :</strong> Les prix sont indiqués en Euros (€) TTC.
              Les frais de livraison sont en sus et affichés avant la
              validation.
            </li>
            <li>
              <strong>Disponibilité :</strong> En cas d'indisponibilité d'un
              produit après passation de la commande, le Client sera informé
              dans les meilleurs délais et pourra être remboursé.
            </li>
          </ul>
        </section>

        {/* ARTICLE 3 */}
        <section id="order">
          <h2>Article 3 : Commande</h2>
          <ol>
            <li>Le Client sélectionne ses produits (taille, couleur, etc.).</li>
            <li>Le Client vérifie le récapitulatif de son panier.</li>
            <li>Le Client s'identifie ou crée son compte.</li>
            <li>Le Client choisit le mode de livraison.</li>
            <li>Le Client accepte les CGV.</li>
            <li>Le Client valide le paiement ("Payer la commande").</li>
          </ol>
          <p>
            La confirmation de commande par email formalise la conclusion du
            contrat.
          </p>
        </section>

        {/* ARTICLE 4 */}
        <section id="payment">
          <h2>Article 4 : Paiement</h2>
          <p>
            Le paiement est exigible immédiatement à la commande. Les modes de
            paiement acceptés sont :{" "}
            <strong>
              [Liste des méthodes : Carte Bancaire, PayPal, Virement, etc.]
            </strong>
            .
          </p>
          <blockquote className="payment-note">
            Le Vendeur utilise un système de paiement sécurisé pour garantir la
            confidentialité des données bancaires.
          </blockquote>
        </section>

        {/* ARTICLE 5 */}
        <section id="delivery">
          <h2>Article 5 : Livraison</h2>
          <dl>
            <dt>Zone de Livraison</dt>
            <dd>
              Les produits sont livrables en{" "}
              <strong>[France métropolitaine, UE, Monde]</strong>.
            </dd>

            <dt>Délais</dt>
            <dd>
              Le délai moyen de livraison est de <strong>3 jours ouvrés</strong>{" "}
              après expédition. Ce délai est donné à titre indicatif.
            </dd>

            <dt>Réception</dt>
            <dd>
              Le Client doit vérifier l'état du colis à la réception. Toute
              anomalie (produit manquant, colis endommagé) doit être signalée au
              transporteur et au Vendeur dans les meilleurs délais.
            </dd>
          </dl>
        </section>

        {/* ARTICLE 6 */}
        <section id="retraction">
          <h2>Article 6 : Droit de Rétractation et Retours</h2>
          <p>
            Conformément à la loi, le Client dispose d'un délai de{" "}
            <strong>quatorze (14) jours</strong> à compter de la réception pour
            exercer son droit de rétractation.
          </p>
          <p>
            <strong>Conditions de retour :</strong> Les crampons doivent être
            retournés neufs, non portés, non lavés, avec toutes les étiquettes
            et dans leur emballage d'origine. Les frais de retour sont à la
            charge du Client.
          </p>
          <p>
            Le remboursement interviendra dans un délai maximum de quatorze (14)
            jours suivant la réception et la vérification des produits
            retournés.
          </p>
        </section>

        {/* ARTICLE 7 */}
        <section id="guarantees">
          <h2>Article 7 : Garanties Légales</h2>
          <p>
            Tous les produits bénéficient de la garantie légale de conformité
            (articles L. 217-4 et suivants du Code de la consommation) et de la
            garantie des vices cachés (articles 1641 et suivants du Code civil).
          </p>
        </section>
      </div>
    </div>
  );
}

export default Terms;
