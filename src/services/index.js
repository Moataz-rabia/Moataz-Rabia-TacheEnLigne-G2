// Point d'entrée unique des services : les composants importent
// « import apiService from '../services' » et n'ont pas besoin
// de connaître l'emplacement exact du fichier.
// En mode EN LIGNE, on exporte apiService (fetch vers json-server).
export { apiService as default } from './apiService';
