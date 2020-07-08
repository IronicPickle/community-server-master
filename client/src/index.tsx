import React, { Component } from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { Route, BrowserRouter as Router, RouteComponentProps } from "react-router-dom";
import { createMuiTheme, LinearProgress, withStyles, Box, Backdrop } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import { GlobalContext, Containers, Notification } from "./utils/contexts";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";

import Index from "./pages/Index";
import Management from "./pages/Management";
import Layout from "./components/sections/Layout";
import RouteListener from "./components/utils/RouteListener";
import HTTPAuth, { DBMemberDataExtended } from "./http_utils/HTTPAuth";
import NotificationContainer from "./components/sections/containers/Notification";
import CreateMemberContainer from "./components/sections/containers/CreateMember";
import EditMemberContainer from "./components/sections/containers/EditMember";
import RequestMemberContainer from "./components/sections/containers/RequestMember";
import RequestsMemberContainer from "./components/sections/containers/RequestsMember";
import Profile from "./pages/Profile";
//import Stats from "./pages/Stats";
import Bgs from "./pages/Bgs";
import CreateMission from "./components/sections/containers/CreateMission";
import mainTheme from "./themes/main";
import { DBMemberData } from "./http_utils/HTTPMembers";

const theme = createMuiTheme(mainTheme);

const styles = () => ({
  loadingBar: {
    backgroundColor: theme.palette.secondary.main
  }, "@global": {
    "*::-webkit-scrollbar": {
      width: "0.4em",
      height: "0.4em"
    },
    "*::-webkit-scrollbar-track": {
      "-webkit-box-shadow": `inset 0 0 6px ${theme.palette.primary.light}`
    },
    "*::-webkit-scrollbar-thumb": {
      backgroundColor: theme.palette.primary.dark,
      outline: `1px solid ${theme.palette.primary.dark}`
    }
  }
});

interface ContainerStates {
  [key: string]: boolean;
  login: boolean;
  createMember: boolean;
  editMember: boolean;
  requestMember: boolean;
  requestsMember: boolean;
}

interface ContainerData {
  [key: string]: any;
  editMember?: DBMemberData;
  requestMember?: DBMemberData;
  requestsMember?: DBMemberData;
}

type Props = {
  classes: Classes;
} & RouteComponentProps;

interface State {
  loggedIn: boolean;
  memberData?: DBMemberDataExtended;
  csrfToken?: string;
  loading: boolean;
  currentRoute: string;

  clipboardValue: string;

  backdropState: boolean;
  backdropOnClose?: (isCancelled: boolean) => void;
  notificationState: boolean;
  notificationData: Notification;

  containerStates: ContainerStates;
  containerData: ContainerData;
}

class index extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loggedIn: false,
      loading: false,
      currentRoute: window.location.pathname,
      clipboardValue: "",


      backdropState: false,
      notificationState: false,
      notificationData: { type: "success", message: "" },

      containerStates: {
        login: false,
        createMember: false,
        editMember: false,
        requestMember: false,
        requestsMember: false
      },
      containerData: {}
    }

    this.handleRouteChange = this.handleRouteChange.bind(this);
    this.toggleLoader = this.toggleLoader.bind(this);
    this.toggleBackdrop = this.toggleBackdrop.bind(this);
    this.toggleNotification = this.toggleNotification.bind(this);
    this.toggleContainer = this.toggleContainer.bind(this);
    this.copyToClipboard = this.copyToClipboard.bind(this);
  }

  handleRouteChange(route: string) {
    this.setState({currentRoute: route});
  }

  toggleLoader(state: boolean) {
    this.setState({loading: state});
  }

  toggleBackdrop(state: boolean, isCancelled: boolean, backdropOnClose?: (isCancelled: boolean) => void) {
    this.setState({ backdropState: state });
    if(state) {
      this.setState({ backdropOnClose });
    } else {
      if(this.state.backdropOnClose) this.state.backdropOnClose(isCancelled);
    }
  }

  toggleNotification(state: boolean, data: Notification) {
    this.setState({ notificationState: state, notificationData: data });
  }

  toggleContainer(container: Containers, state: boolean, callback?: Function, data?: any) {
    const containerAsString = container.toString();
    const containerStates = this.state.containerStates;
    containerStates[containerAsString] = state;
    const containerData = this.state.containerData;
    if(data) {
      containerData[containerAsString] = data;
    } else {
      data = {};
    }

    this.setState({ containerStates, containerData });
    this.toggleBackdrop(state, !state, (isCancelled: boolean) => {
      containerStates[containerAsString] = false;
      this.setState({ containerStates });
      if(callback && !isCancelled) callback();
    });
  }

  copyToClipboard(string: string) {
    const clipboardInput = document.getElementById("clipboardInput") as HTMLInputElement;
    clipboardInput.style.display = "block";
    this.setState({ clipboardValue: string }, () => {
      clipboardInput.focus();
      clipboardInput.select();
      clipboardInput.setSelectionRange(0, 99999);
      document.execCommand("copy");
      clipboardInput.style.display = "none";
    });
  }

  async componentDidMount() {
    const res = await HTTPAuth.check();
    const loggedIn = res.success;
    const memberData = (res.data) ? res.data.member : undefined;
    this.setState({ loggedIn, memberData });
  }

  render() {
    const { classes } = this.props;
    const {
      loggedIn, memberData,
      backdropState, notificationState, notificationData, containerStates,
      containerData, clipboardValue
    } = this.state;

    return (
      <Router>
        <ThemeProvider theme={theme} >
          <GlobalContext.Provider value={{
            loggedIn: loggedIn,
            memberData: memberData,
            toggleLoader: this.toggleLoader,
            toggleBackdrop: this.toggleBackdrop,
            toggleNotification: this.toggleNotification,
            toggleContainer: this.toggleContainer,
            copyToClipboard: this.copyToClipboard
          }}>
            <input id="clipboardInput" type="text" value={clipboardValue} readOnly={true} style={{ display: "none", position: "fixed" }} />
            <Box
              position="absolute"
              width="100%"
            >
              <Box
                position="absolute"
                width="100%"
                zIndex="tooltip"
              >
                {(this.state.loading) ? <LinearProgress variant="query" className={classes.loadingBar} /> : null}
              </Box>
              <Layout currentRoute={this.state.currentRoute}>
                <RouteListener handleRouteChange={this.handleRouteChange}>
                  <Route path="/" exact component={Index} />
                  {
                    (loggedIn && memberData) ?
                      <>
                        { (memberData.webPerms["view-management-page"]) ?  <Route path="/management" exact component={Management} /> : null }
                        { /*(memberData.webPerms["view-stats-page"]) ?  <Route path="/stats" exact component={Stats} /> : */null }
                        { (memberData.webPerms["view-profile-page"]) ? <Route path="/profile" exact component={Profile} /> : null }
                        { (memberData.webPerms["view-bgs-page"]) ? <Route path="/bgs" exact component={Bgs} /> : null }
                      </>
                    : null
                  }
                </RouteListener>
              </Layout>
              <NotificationContainer state={notificationState} data={notificationData} onClose={() => { this.setState({ notificationState: false }); }} />

              <CreateMemberContainer state={containerStates.createMember} />
              <EditMemberContainer state={containerStates.editMember} data={containerData.editMember} />
              <RequestMemberContainer state={containerStates.requestMember} data={containerData.requestMember} />
              <RequestsMemberContainer state={containerStates.requestsMember} data={containerData.requestsMember}  />
              
              <CreateMission state={containerStates.createMission} />
            </Box>
            <Backdrop open={backdropState} onClick={() => { this.toggleBackdrop(false, true); }} style={{zIndex: theme.zIndex.modal}} />
          </GlobalContext.Provider>
        </ThemeProvider>
      </Router>
    )
  }
}

ReactDOM.render(
  React.createElement(
    withStyles(styles, { withTheme: true }) (index)
  ), document.getElementById("root")
);

serviceWorker.unregister();