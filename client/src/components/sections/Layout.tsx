import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { AppBar, Toolbar, Typography, Theme, Tabs, Tab, Grid, IconButton, Tooltip } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import { Link } from "react-router-dom";
import { releaseCookie } from "../../utils/auth"
import { GlobalContext } from "../../utils/contexts";
import MeetingRoomIcon from "@material-ui/icons/MeetingRoom";
import NoMeetingRoomIcon from "@material-ui/icons/NoMeetingRoom";

const styles = (theme: Theme) => ({
  title: {
    textDecoration: "none",
    marginRight: 24,
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2)
  }
});

interface PropsI {
  classes: Classes;
  currentRoute: string;
}  

class Layout extends Component<PropsI> {
  static contextType = GlobalContext;

  constructor(props: PropsI) {
    super(props);

    this.logIn = this.logIn.bind(this);
  }
  
  logOut() {
    releaseCookie();
    window.location.reload();
  }

  logIn() {
    this.context.toggleLoginContainer(true);
  }

  checkRouteExists(route: string): boolean {
    for(var i in tabRoutes) {
      if(tabRoutes[i].path === route) return true
    }
    return false;
  }

  render() {
    const { classes } = this.props;

    return (
      <div>
        <div>
          <AppBar>
            <Toolbar>
              <Link to="/">
                <Typography
                  variant="h5"
                  component="h5"
                  className={classes.title}
                >Lykos</Typography>
              </Link>
              <div>
                <Tabs value={this.checkRouteExists(this.props.currentRoute) ? this.props.currentRoute : false}>
                  {
                    tabRoutes.map(route => {
                      return <Tab component={Link} to={route.path} key={route.path} value={route.path} label={route.name} />
                    })
                  }
                </Tabs>
              </div>
              <Grid
                container
                direction="row"
                justify="flex-end"
              >
                {(this.context.loggedIn) ? 
                  <Grid item>
                    <Tooltip title={"Log Out"} placement="bottom" PopperProps={{ disablePortal: true }}>
                      <IconButton onClick={this.logOut} color="secondary">
                        <NoMeetingRoomIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                :
                  <Grid item>
                    <Tooltip title={"Log In"} placement="bottom" PopperProps={{ disablePortal: true }}>
                      <IconButton onClick={this.logIn} color="secondary">
                        <MeetingRoomIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                }
              </Grid>
            </Toolbar>
          </AppBar>
        </div>

        {this.props.children}
      </div>
    )
  }
}

const tabRoutes = [
  {path: "/", name: "Home"},
  {path: "/musicsync", name: "Music Sync"}
]

export default withStyles(styles, { withTheme: true })(Layout);