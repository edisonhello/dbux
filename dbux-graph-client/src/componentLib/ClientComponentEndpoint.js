import isFunction from 'lodash/isFunction';
import ComponentEndpoint from 'dbux-graph-common/src/componentLib/ComponentEndpoint';
import { newLogger } from 'dbux-common/src/log/logger';
import { collectElementsByDataAttr } from '@/util/domUtil';

const { log, debug, warn, error: logError } = newLogger('ClientComponentEndpoint');

/**
 * The Client endpoint is controlled by the Host endpoint.
 */
class ClientComponentEndpoint extends ComponentEndpoint {
  /**
   * The DOM element visually representing this component instance.
   */
  el;
  els;
  mountPointsByComponentName;

  /**
   * Use this to create the HTML node to represent this component.
   * 
   * @virtual
   */
  createEl() {
    warn(this.componentName, 'ClientComponentEndpoint did not implement `createEl`');
  }

  /**
   * Use this to process your HTML node, at the end of the initialization phase.
   * 
   * @virtual
   */
  setupEl() {
  }

  init() {
    this.el = this.createEl();

    if (!this.el) {
      return;
    }

    this._processEl();
    this.setupEl();
  }

  _processEl() {
    this.els = collectElementsByDataAttr('el');
    this.mountPointsByComponentName = collectElementsByDataAttr('mount');

    // hook up event listeners
    if (this.on) {
      for (const elName in this.on) {
        const compConfig = this.on[elName];
        const el = this.els[elName];
        if (!el) {
          logError(this.debugTag, `Invalid event handler (on) - el name does not exist: "${elName}". Are you missing a "data-el" attribute?`);
          continue;
        }
        for (const eventName in compConfig) {
          const cb = compConfig[eventName];
          if (!isFunction(cb)) {
            logError(this.debugTag, `Invalid event handler (on) - is not a function: "${elName}.${eventName}"`);
            continue;
          }
          el.addEventListener(eventName, cb.bind(this));
        }
      }
    }

    if (this.parent) {
      // append element to DOM
      this.parent.appendChild(this);
    }
  }

  appendChild(child) {
    const mountName = child.componentName;
    const mountPointEl = this.mountPointsByComponentName[mountName];
    if (!mountPointEl) {
      logError('Could not add child to parent. Parent did not have a mount type for', mountName);
      return;
    }

    mountPointEl.appendChild(child.el);
  }

  /**
   * Functions that are called by Host internally.
   */
  _publicInternal = {
    async updateClient(state) {
      this.state = state;
      await this.update();
    },

    dispose() {
      if (this.el?.parentNode) {
        // remove element from DOM
        this.el.parentNode.removeChild(this.el);
        this.el = null;
      }
    }
  };
}

export default ClientComponentEndpoint;