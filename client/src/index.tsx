import React, { Component } from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { Route, BrowserRouter as Router, RouteComponentProps } from "react-router-dom";
import { createMuiTheme, LinearProgress, withStyles, Box } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import { GlobalContext } from "./utils/contexts";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";

import App from "./pages/Index";
import Login from "./components/sections/Login";
import Layout from "./components/sections/Layout";
import RouteListener from "./components/utils/RouteListener";
import MusicSync from "./pages/MusicSync";
import { parseCookies, login } from "./utils/auth";
import Cover from "./components/sections/Cover";

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
  }, layout: {

  }
});

interface IndexPropsI {
  classes: Classes;
}
type IndexProps = IndexPropsI & RouteComponentProps;
interface LayoutStateI {
  loggedIn: boolean;
  loginContainerActive: boolean;
  loading: boolean;
  currentRoute: string;
}

class Index extends Component<IndexProps, LayoutStateI> {
  constructor(props: IndexProps) {
    super(props);
    this.state = {
      loggedIn: authenticated,
      loginContainerActive: false,
      loading: false,
      currentRoute: window.location.pathname
    }

    this.handleRouteChange = this.handleRouteChange.bind(this);
    this.toggleLoader = this.toggleLoader.bind(this);
    this.toggleLoginContainer = this.toggleLoginContainer.bind(this);
  }

  handleRouteChange(route: string) {
    this.setState({currentRoute: route});
  }

  toggleLoader(state: boolean) {
    this.setState({loading: state});
  }

  toggleLoginContainer(state: boolean) {
    this.setState({loginContainerActive: state});
  }

  render() {
    const { classes } = this.props;

    return (
      <Router>
        <ThemeProvider theme={theme} >
          <GlobalContext.Provider value={{
            toggleLoader: this.toggleLoader,
            loggedIn: this.state.loggedIn,
            toggleLoginContainer: this.toggleLoginContainer,
            loginContainerActive: this.state.loginContainerActive
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
                  <Route path="/" exact component={App} />
                  <Route path="/musicsync" component={MusicSync} />
                </RouteListener>
              </Layout>
              {
                (this.state.loginContainerActive) ?
                  <Cover onClick={() => { this.toggleLoginContainer(false); }} /> : <></>
              }
              <Login />
            </Box>
          </GlobalContext.Provider>
        </ThemeProvider>
      </Router>
    )
  }
}

const cookies = parseCookies();
const password = cookies.token;
var authenticated = false;
login({password}, (res: any, authed: boolean) => {
  authenticated = authed;
  ReactDOM.render(
    React.createElement(
      withStyles(styles, { withTheme: true }) (
        Index
      )
    ), document.getElementById("root")
  );
});

serviceWorker.unregister();