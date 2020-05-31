import allApplications from 'dbux-data/src/applications/allApplications';
import HighlightManager from './controllers/HighlightManager';
import HostComponentEndpoint from '../componentLib/HostComponentEndpoint';
import GraphRoot from './GraphRoot';
import Toolbar from './Toolbar';

class GraphDocument extends HostComponentEndpoint {
  toolbar;
  // minimap;

  // ###########################################################################
  // init
  // ###########################################################################

  init() {
    this.createOwnComponents();

    // register event listeners
    allApplications.selection.onApplicationsChanged(this.handleApplicationsChanged);
  }

  createOwnComponents() {
    this.controllers.createComponent(HighlightManager);
    this.graphRoot = this.children.createComponent(GraphRoot);
    this.toolbar = this.children.createComponent(Toolbar);
    // this.minimap = this.children.createComponent(MiniMap);
  }

  // ###########################################################################
  // HandleApplicationsChanged
  // ###########################################################################

  handleApplicationsChanged = (selectedApps) => {
    this.graphRoot.setState({
      applications: selectedApps.map(app => ({
        applicationId: app.applicationId,
        entryPointPath: app.entryPointPath,
        name: app.getFileName()
      }))
    });
  }
  
  // ###########################################################################
  // shared
  // ###########################################################################

  shared() {
    return {
      context: {
        graphDocument: this
      }
    };
  }
}

export default GraphDocument;