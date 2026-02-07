# Architecture cible : solution API REST avec Laravel Sanctum

Cette solution consiste à exposer les fonctionnalités métier (notes, tags, utilisateurs) via une **API REST** authentifiée par **Laravel Sanctum** (tokens), en complément ou en remplacement progressif de l’interface Livewire actuelle.

Référence : schéma `architectureCible/schema-solution1-rest-sanctum.png`.

---

## Avantages de la solution API (Sanctum)

| Avantage | Description |
|----------|-------------|
| **Découplage frontend / backend** | L’API REST peut être consommée par un SPA (Vue, React, etc.), une app mobile, ou un client tiers. Le backend Laravel devient un service réutilisable. |
| **Authentification par token** | Sanctum fournit l’émission et la vérification de tokens (Bearer). Pas de session côté API : idéal pour mobile, SPA sur autre domaine, ou intégrations. |
| **Simplicité d’intégration** | Sanctum est inclus dans l’écosystème Laravel (middleware `auth:sanctum`), sans OAuth2 complexe. Montée en charge rapide pour une première API. |
| **Cohabitation possible** | On peut garder les routes web (Livewire) pour l’UI actuelle et ajouter des routes `api.php` protégées par Sanctum : migration progressive. |
| **Réutilisation de la logique métier** | En extrayant la logique dans des Services/Actions, les contrôleurs API et les composants Livewire appellent la même couche : moins de duplication, règles métier centralisées. |
| **Testabilité** | Les endpoints API se testent facilement (HTTP, tokens). Les tests Feature peuvent valider le comportement métier sans dépendre de Livewire. |
| **Évolutivité** | Plusieurs clients (web, mobile, partenaires) partagent la même API. Facilite un éventuel découpage en modules ou microservices plus tard. |
| **Standard REST** | Ressources (notes, tags) exposées en GET/POST/PUT/DELETE, réponses JSON. Contractuel et prévisible pour les consommateurs. |

---

## Inconvénients de la solution API (Sanctum)

| Inconvénient | Description |
|--------------|-------------|
| **Double interface à maintenir** | Si on conserve Livewire et l’API : deux façons d’accéder aux mêmes données (web + API), avec risque de divergence (validation, autorisation) sans refactor commun. |
| **Gestion des tokens** | Les tokens Sanctum doivent être créés, stockés et renouvelés côté client. Vol ou fuite de token = accès jusqu’à révocation. Nécessite bonnes pratiques (HTTPS, expiration, refresh). |
| **Pas de session navigateur pour l’API** | En mode pure API, plus de cookie de session : chaque requête doit envoyer le token. Le frontend (SPA/mobile) doit gérer le stockage et l’envoi du token. |
| **Refactor nécessaire** | La logique actuelle est dans les composants Livewire. Pour une API propre, il faut extraire Services/Repositories et Policies, puis faire appeler l’API (et éventuellement Livewire) par cette couche. |
| **Documentation et contrat** | L’API doit être documentée (routes, paramètres, réponses, codes d’erreur). Sans doc ou OpenAPI, les consommateurs (frontend, mobile) ont plus de difficultés. |
| **CORS et déploiement** | Si le SPA est sur un autre domaine, il faut configurer CORS. Déploiement et sécurité (origines autorisées) à gérer. |
| **Limites de Sanctum** | Sanctum convient bien à « notre API + notre SPA / nos apps ». Pour une API publique multi-clients (OAuth2, scopes), Passport ou un serveur OAuth dédié sont plus adaptés. |
| **Coût de migration** | Passage d’un monolithe « tout en Livewire » à une architecture API implique temps de conception (ressources, erreurs, versioning) et de tests. |

---

## Synthèse

- **À privilégier** si l’objectif est d’ouvrir l’application à d’autres clients (SPA, mobile, partenaires) tout en restant dans l’écosystème Laravel avec une auth simple.
- **À anticiper** : extraction de la logique métier et des autorisations (Services, Policies), gestion et sécurisation des tokens, documentation de l’API et choix entre coexistence web + API ou bascule complète vers un frontend découplé.
