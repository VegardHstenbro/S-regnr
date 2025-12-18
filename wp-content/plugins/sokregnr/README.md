# Søk Regnr v1.6.0 - Enterprise Edition

## Beskrivelse
Profesjonell WordPress-plugin for oppslag av kjøretøyinformasjon fra Statens vegvesen, integrert med WooCommerce Subscriptions og Maskinporten.

## Installasjon
1. Last opp mappen `sokregnr` til `/wp-content/plugins/`
2. Aktiver pluginen i WordPress-admin.
3. Gå til **Søk Regnr -> Innstillinger** for å legge inn API-nøkler.

## Funksjoner
- Teknisk data via SVV Enkeltoppslag.
- Eierdata via Maskinporten (krever 'sokregnr_premium' kapabilitet).
- WooCommerce-integrasjon for automatisk aktivering ved kjøp.
- WP-CLI kommandoer for kvotehåndtering.
- Innebygd rate limiting og trial-modus.

## WP-CLI
```bash
wp sokregnr:quota status
wp sokregnr:quota reset
```
