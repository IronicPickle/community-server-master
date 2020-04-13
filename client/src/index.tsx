import React, { Component } from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { Route, BrowserRouter as Router, RouteComponentProps } from "react-router-dom";
import { createMuiTheme, LinearProgress, withStyles, Box, Backdrop } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import { GlobalContext } from "./utils/contexts";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";

import Index from "./pages/Index";
import Management from "./pages/Management";
import Layout from "./components/sections/Layout";
import RouteListener from "./components/utils/RouteListener";
import { parseCookies, login } from "./utils/auth";
import NotificationContainer from "./components/sections/NotificationContainer";
import LoginContainer from "./components/sections/LoginContainer";
import CreateMemberContainer from "./components/sections/CreateMemberContainer";
import EditMemberContainer from "./components/sections/EditMemberContainer";
import RequestMemberContainer from "./components/sections/RequestMemberContainer";
import RequestsMemberContainer from "./components/sections/RequestsMemberContainer";

const theme = createMuiTheme({
  palette: {
    common: {
      black: "rgba(0, 0, 0, 1)",
      white: "rgba(255, 255, 255, 1)"
    },
    primary: {
      main: "rgba(30, 30,30, 1)"
    },
    secondary: {
      main: "rgba(253, 203, 14, 1)"
    },
    error: {
      main: "rgba(244,67,54, 1)"
    },
    warning: {
      main: "rgba(255,152,0, 1)"
    },
    info: {
      main: "rgba(33, 150, 243, 1)"
    },
    success: {
      main: "rgba(76, 175, 80, 1)"
    },
    contrastThreshold: 3,
    tonalOffset: 0.2,
    text: {
      primary: "rgba(255, 255, 255, 1)",
      secondary: "rgba(255, 255, 255, 0.7)",
      disabled: "rgba(255, 255, 255, 0.5)",
      hint: "rgba(255, 255, 255, 0.5)"
    },
    background: {
      paper: "rgba(33, 33, 33, 1)",
      default: "rgba(80, 80, 80, 0.8)"
    },
    action: {
      active: "rgba(255, 255, 255, 1)",
      hover: "rgba(255, 255, 255, 0.30)",
      hoverOpacity: 0.08,
      selected: "rgba(255, 255, 255, 0.16)",
      disabled: "rgba(255, 255, 255, 0.75)",
      disabledBackground: "rgba(255, 255, 255, 0.12)"
    }
  }
});

const styles = () => ({
  loadingBar: {
    backgroundColor: theme.palette.secondary.main
  }, "@global": {
    "*::-webkit-scrollbar": {
      width: "0.4em"
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

interface PropsI {
  classes: Classes;
}
type Props = PropsI & RouteComponentProps;
interface LayoutStateI {
  loggedIn: boolean;
  loading: boolean;
  currentRoute: string;


  backdropState: boolean,
  backdropOnClose: any;
  notificationState: boolean,
  notificationData: {
    type: "success" | "info" | "warning" | "error" | undefined,
    message: string,
    hideDelay?: number,
  },

  containerStates: any,
  containerData: any
}

class index extends Component<Props, LayoutStateI> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loggedIn: authenticated,
      loading: false,
      currentRoute: window.location.pathname,


      backdropState: false,
      backdropOnClose: () => {},
      notificationState: false,
      notificationData: { type: "success", message: "" },

      containerStates: {
        login: false,
        createMember: false,
        editMember: false,
        requestMember: false,
        requestsMember: false
      },
      containerData: {
        editMember: {},
        requestMember: {},
        requestsMember: {}
      }
    }

    this.handleRouteChange = this.handleRouteChange.bind(this);
    this.toggleLoader = this.toggleLoader.bind(this);
    this.toggleBackdrop = this.toggleBackdrop.bind(this);
    this.toggleNotification = this.toggleNotification.bind(this);
    this.toggleContainer = this.toggleContainer.bind(this);
  }

  handleRouteChange(route: string) {
    this.setState({currentRoute: route});
  }

  toggleLoader(state: boolean) {
    this.setState({loading: state});
  }

  toggleBackdrop(state: boolean, isCancelled: boolean, backdropOnClose?: Function) {
    this.setState({ backdropState: state });
    if(state) {
      this.setState({ backdropOnClose });
    } else {
      this.state.backdropOnClose(isCancelled);
    }
  }

  toggleNotification(state: boolean, data: any) {
    this.setState({ notificationState: state, notificationData: data });
  }

  toggleContainer(container: "login" | "createMember" | "editMember" | "requestMember" | "requestsMember", state: boolean, callback?: Function, data?: any) {
    let containerStates = this.state.containerStates;
    containerStates[container] = state;
    let containerData = this.state.containerData;
    if(data) {
      containerData[container] = data;
    } else {
      data = {};
    }

    this.setState({ containerStates, containerData });
    this.toggleBackdrop(state, !state, (isCancelled: boolean) => {
      containerStates[container] = false;
      this.setState({ containerStates });
      if(callback && !isCancelled) callback();
    });
  }

  render() {
    const { classes } = this.props;
    const {
      backdropState,
      notificationState,
      notificationData,
      containerStates,
      containerData
    } = this.state;

    return (
      <Router>
        <ThemeProvider theme={theme} >
          <GlobalContext.Provider value={{
            loggedIn: this.state.loggedIn,
            toggleLoader: this.toggleLoader,
            toggleBackdrop: this.toggleBackdrop,
            toggleNotification: this.toggleNotification,
            toggleContainer: this.toggleContainer
          }}>
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
                  <Route path="/management" exact component={Management} />
                </RouteListener>
              </Layout>
              <NotificationContainer state={notificationState} data={notificationData} onClose={() => { this.setState({ notificationState: false }); }} />

              <LoginContainer state={containerStates.login} />
              <CreateMemberContainer state={containerStates.createMember} />
              <EditMemberContainer state={containerStates.editMember} data={containerData.editMember} />
              <RequestMemberContainer state={containerStates.requestMember} data={containerData.requestMember} />
              <RequestsMemberContainer state={containerStates.requestsMember} data={containerData.requestsMember}  />
            </Box>
            <Backdrop open={backdropState} onClick={() => { this.toggleBackdrop(false, true); }} style={{zIndex: theme.zIndex.modal}} />
          </GlobalContext.Provider>
        </ThemeProvider>
      </Router>
    )
  }
}

const cookies = parseCookies();
const password = cookies.token;
var authenticated = false;
login({password}, (res: any) => {
  authenticated = res.success;
  ReactDOM.render(
    React.createElement(
      withStyles(styles, { withTheme: true }) (
        index
      )
    ), document.getElementById("root")
  );
});

serviceWorker.unregister();