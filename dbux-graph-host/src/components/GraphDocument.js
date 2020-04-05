import allApplications from 'dbux-data/src/applications/allApplications';
import HostComponentEndpoint from '../componentLib/HostComponentEndpoint';
import GraphRoot from './GraphRoot';
import Toolbar from './Toolbar';

class GraphDocument extends HostComponentEndpoint {
  toolbar;
  /**
   * @type {GraphRoot}
   */
  root;

  // ###########################################################################
  // init
  // ###########################################################################

  init() {
    this.initChildren();

    // ########################################
    // register event listeners
    // ########################################

    allApplications.selection.onApplicationsChanged((selectedApps) => {
      this.resetGraph();

      for (const app of selectedApps) {
        const { applicationId } = app;
        allApplications.selection.subscribe(
          app.dataProvider.onData('executionContexts', 
            contexts => this.addContexts(applicationId, contexts)
          )
        );
      }
    });
  }

  initChildren() {
    this.toolbar = this.children.createComponent(Toolbar);

    // start rendering empty graph
    this.resetGraph();
  }


  // ###########################################################################
  // reset
  // ###########################################################################

  resetGraph = () => {
    // dispose previous root (if there was any)
    this.root?.dispose();
    this.root = null;

    // initialize new root
    const state = {
      applications: allApplications.selection.getAll().map(app => ({
        applicationId: app.applicationId,
        entryPointPath: app.entryPointPath,
        name: app.getFileName()
      }))
    };
    this.root = this.children.createComponent(GraphRoot, state);
  }


  // ###########################################################################
  // manage children
  // ###########################################################################

  addContexts = (applicationId, contexts) => {
    this.root.addContexts(applicationId, contexts);
  }
}

export default GraphDocument;