import { startDbuxComponents } from './componentLib/ClientComponentManager';
import _clientRegistry from './pathways/_clientRegistry';

import './pathways/styles.css';

window.startDbuxComponents = startDbuxComponents.bind(null, _clientRegistry);